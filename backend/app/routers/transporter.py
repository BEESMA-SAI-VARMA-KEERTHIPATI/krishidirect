from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order
from app.models.pool import HarvestPool
from app.models.user import User
from app.schemas.order import OrderResponse
from app.schemas.pool import PoolResponse
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/transporter", tags=["Transporter & Logistics Fleet"])

@router.get("/available-jobs")
def get_available_transport_jobs(
    current_user: User = Depends(require_role(["transporter", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns unassigned pickup orders and pooling collection routes available for transport assignment.
    """
    orders = db.query(Order).filter(
        Order.status.in_(["pending", "confirmed", "ready_for_pickup"]),
        Order.transporter_id == None
    ).order_by(Order.created_at.desc()).all()

    pools = db.query(HarvestPool).filter(
        HarvestPool.status.in_(["forming", "matched"]),
        HarvestPool.transporter_id == None
    ).order_by(HarvestPool.created_at.desc()).all()

    return {
        "pending_direct_deliveries": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "produce_name": o.produce_name,
                "quantity": o.quantity,
                "unit": o.unit,
                "pickup_address": o.listing.farm_location if o.listing else "Farm Hub",
                "delivery_address": o.delivery_address,
                "freight_earning_inr": o.delivery_fee,
                "status": o.status
            }
            for o in orders
        ],
        "village_harvest_pools": [
            {
                "id": p.id,
                "pool_code": p.pool_code,
                "title": p.title,
                "village_cluster": p.village_cluster,
                "destination_market": p.destination_market,
                "collection_point": p.collection_point,
                "pooled_weight_kg": p.current_pooled_kg,
                "vehicle_required": p.vehicle_type,
                "scheduled_date": p.pickup_date,
                "status": p.status
            }
            for p in pools
        ]
    }

@router.post("/claim-order/{order_id}")
def claim_order_delivery(
    order_id: int,
    current_user: User = Depends(require_role(["transporter", "admin"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.transporter_id = current_user.id
    order.status = "ready_for_pickup"
    db.commit()
    return {"message": f"Successfully claimed delivery route for Order #{order.order_number}", "order_id": order.id}

@router.post("/claim-pool/{pool_id}")
def claim_pool_route(
    pool_id: int,
    current_user: User = Depends(require_role(["transporter", "admin"])),
    db: Session = Depends(get_db)
):
    pool = db.query(HarvestPool).filter(HarvestPool.id == pool_id).first()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    pool.transporter_id = current_user.id
    pool.status = "scheduled"
    db.commit()
    return {"message": f"Assigned vehicle to Harvest Pool {pool.pool_code}", "pool_id": pool.id}
