import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.order import Order, DeliveryOTP, DeliveryEvent
from app.models.listing import ProduceListing
from app.models.user import User
from app.models.notification import Notification
from app.schemas.order import OrderCreate, OrderResponse, OTPVerifyRequest, OrderStatusUpdate
from app.services.auth import get_current_user, require_role
from app.services.otp_service import OTPService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/orders", tags=["Orders & Trust Passport"])

def build_order_response(order: Order, db: Session, current_user: User) -> OrderResponse:
    # Only buyer (who receives the OTP) and admin can inspect demo OTP
    otp_record = db.query(DeliveryOTP).filter(DeliveryOTP.order_id == order.id).first()
    demo_otp = None
    if otp_record and (current_user.id == order.buyer_id or current_user.role == "admin"):
        demo_otp = otp_record.raw_otp_preview

    resp = OrderResponse(
        id=order.id,
        order_number=order.order_number,
        buyer_id=order.buyer_id,
        seller_id=order.seller_id,
        listing_id=order.listing_id,
        produce_name=order.produce_name,
        variety=order.variety,
        quantity=order.quantity,
        unit=order.unit,
        unit_price=order.unit_price,
        produce_total=order.produce_total,
        delivery_fee=order.delivery_fee,
        service_fee=order.service_fee,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        delivery_method=order.delivery_method,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        payment_transaction_id=order.payment_transaction_id,
        transporter_id=order.transporter_id,
        created_at=order.created_at,
        updated_at=order.updated_at,
        buyer=order.buyer,
        seller=order.seller,
        transporter=order.transporter,
        timeline_events=order.timeline_events,
        demo_otp_preview=demo_otp
    )
    return resp

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    current_user: User = Depends(require_role(["buyer", "admin"])),
    db: Session = Depends(get_db)
):
    listing = db.query(ProduceListing).filter(ProduceListing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produce listing not found")
    
    if listing.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Produce is currently {listing.status}")

    # Validate stock availability to prevent overselling
    if payload.quantity > listing.available_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({payload.quantity} {listing.unit}) exceeds available stock ({listing.available_quantity} {listing.unit})"
        )

    # Safe atomic stock decrement
    listing.available_quantity -= payload.quantity
    if listing.available_quantity <= 0:
        listing.available_quantity = 0
        listing.status = "sold_out"

    produce_total = round(payload.quantity * listing.asking_price, 2)
    delivery_fee = 180.0  # Transparent standard freight fee
    service_fee = round(produce_total * 0.02, 2)  # 2% platform fee
    total_amount = round(produce_total + delivery_fee + service_fee, 2)

    # Process simulated demo payment
    payment_info = PaymentService.process_demo_payment(total_amount, payload.payment_method, current_user.full_name)

    order_num = f"KD-{datetime.utcnow().strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    order = Order(
        order_number=order_num,
        buyer_id=current_user.id,
        seller_id=listing.farmer_id,
        listing_id=listing.id,
        produce_name=listing.produce_name,
        variety=listing.variety,
        quantity=payload.quantity,
        unit=listing.unit,
        unit_price=listing.asking_price,
        produce_total=produce_total,
        delivery_fee=delivery_fee,
        service_fee=service_fee,
        total_amount=total_amount,
        delivery_address=payload.delivery_address,
        delivery_method=payload.delivery_method,
        status="pending",
        payment_status="held_in_escrow",
        payment_method=payload.payment_method,
        payment_transaction_id=payment_info["transaction_id"]
    )
    db.add(order)
    db.flush()

    # Generate Delivery OTP
    otp_code = OTPService.generate_delivery_otp(order.id, db)

    # Append Trust & Delivery Passport Event #1
    event = DeliveryEvent(
        order_id=order.id,
        event_type="ORDER_CREATED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role="Buyer",
        title="Order Placed & Escrow Secured",
        description=f"Buyer placed order for {payload.quantity} {listing.unit} of {listing.produce_name}. ₹{total_amount:,.2f} secured in demo escrow.",
        location=payload.delivery_address,
        badge_color="blue"
    )
    db.add(event)

    # Send Notification to Farmer
    seller_notif = Notification(
        user_id=listing.farmer_id,
        title="🌾 New Harvest Order Received!",
        message=f"{current_user.full_name} ordered {payload.quantity} {listing.unit} of your {listing.produce_name} for ₹{produce_total:,.2f}.",
        notification_type="order",
        action_link=f"/orders/{order.id}"
    )
    db.add(seller_notif)

    db.commit()
    db.refresh(order)
    return build_order_response(order, db, current_user)

@router.get("", response_model=List[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "buyer":
        orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "farmer":
        orders = db.query(Order).filter(Order.seller_id == current_user.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "transporter":
        orders = db.query(Order).filter(
            (Order.transporter_id == current_user.id) | (Order.transporter_id == None)
        ).order_by(Order.created_at.desc()).all()
    elif current_user.role == "agent":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:  # Admin
        orders = db.query(Order).order_by(Order.created_at.desc()).all()

    return [build_order_response(o, db, current_user) for o in orders]

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Authorization check
    if current_user.role not in ["admin", "transporter", "agent"] and current_user.id not in [order.buyer_id, order.seller_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this order")

    return build_order_response(order, db, current_user)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    valid_statuses = ["pending", "confirmed", "ready_for_pickup", "in_transit", "delivered", "completed", "cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status: {payload.status}")

    # Role-based authorization on order lifecycle progression
    if current_user.role == "farmer":
        if order.seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage orders for other farmers' produce.",
            )
        if payload.status not in ["confirmed", "ready_for_pickup"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Farmers are only permitted to confirm orders or mark them ready for pickup. Status '{payload.status}' cannot be set by seller.",
            )
    elif current_user.role == "transporter":
        if order.transporter_id and order.transporter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This delivery route is already assigned to another transporter.",
            )
        if payload.status not in ["ready_for_pickup", "in_transit"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Transporters can update orders to 'ready_for_pickup' or 'in_transit'. Final delivery requires OTP verification.",
            )
    elif current_user.role == "agent":
        if payload.status not in ["confirmed", "ready_for_pickup"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Village agents can assist farmers in confirming orders or preparing produce for pickup.",
            )
    elif current_user.role == "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyers cannot change transit status directly. Use OTP verification upon delivery inspection or cancel the order.",
        )
    elif current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role for order status updates.")

    order.status = payload.status
    
    # If transporter is claiming the order
    if payload.status in ["ready_for_pickup", "in_transit"] and current_user.role == "transporter":
        order.transporter_id = current_user.id

    # Append to Trust & Delivery Passport
    title_map = {
        "confirmed": "Order Confirmed by Farmer",
        "ready_for_pickup": "Produce Packed & Ready at Farm Hub",
        "in_transit": "Loaded into Vehicle & In Transit",
        "delivered": "Delivered to Destination",
        "completed": "Transaction Completed",
        "cancelled": "Order Cancelled"
    }
    
    event = DeliveryEvent(
        order_id=order.id,
        event_type=payload.status.upper(),
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role.title(),
        title=title_map.get(payload.status, f"Status updated to {payload.status}"),
        description=payload.note or f"Order status progressed to {payload.status}.",
        location=payload.location or order.delivery_address,
        badge_color="amber" if payload.status != "completed" else "emerald"
    )
    db.add(event)

    # In-app notification to buyer
    notif = Notification(
        user_id=order.buyer_id,
        title=f"Order Update: {title_map.get(payload.status, payload.status)}",
        message=f"Your order #{order.order_number} for {order.produce_name} is now {payload.status}.",
        notification_type="delivery",
        action_link=f"/orders/{order.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(order)
    return build_order_response(order, db, current_user)

@router.post("/{order_id}/verify-otp")
def verify_otp(
    order_id: int,
    payload: OTPVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cryptographic Delivery OTP verification step.
    Upon successful validation, releases payment from escrow to the farmer.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role not in ["transporter", "buyer", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role for delivery verification.")

    if current_user.role == "transporter" and order.transporter_id and order.transporter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not the assigned transporter for this order.")

    if current_user.role == "buyer" and order.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not the buyer for this order.")

    success = OTPService.verify_delivery_otp(
        order_id=order_id,
        entered_code=payload.otp_code,
        verified_by_id=current_user.id,
        verified_by_name=current_user.full_name,
        db=db
    )
    return {
        "success": True,
        "message": f"Delivery OTP verified successfully! Order #{order.order_number} marked delivered. Funds released to farmer.",
        "order_id": order.id,
        "status": "delivered",
        "payment_status": "released_to_farmer"
    }

@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role != "admin" and current_user.id != order.buyer_id and current_user.id != order.seller_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to cancel this order")

    if order.status in ["in_transit", "delivered", "completed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel an order that is already in transit or delivered")

    order.status = "cancelled"
    order.payment_status = "refunded"

    # Restore listing stock safely
    listing = db.query(ProduceListing).filter(ProduceListing.id == order.listing_id).first()
    if listing:
        listing.available_quantity += order.quantity
        if listing.status == "sold_out":
            listing.status = "active"

    # Timeline event
    event = DeliveryEvent(
        order_id=order.id,
        event_type="CANCELLED",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role.title(),
        title="Order Cancelled & Stock Restored",
        description=f"Order was cancelled by {current_user.full_name}. Inventory quantity restored to listing.",
        location="Platform Operations",
        badge_color="red"
    )
    db.add(event)

    db.commit()
    db.refresh(order)
    return build_order_response(order, db, current_user)
