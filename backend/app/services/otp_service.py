import random
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config import settings
from app.models.order import DeliveryOTP, Order, DeliveryEvent

class OTPService:
    @staticmethod
    def generate_delivery_otp(order_id: int, db: Session) -> str:
        # Generate random 4-digit code (e.g. 4821)
        raw_code = f"{random.randint(1000, 9999)}"
        salt = "krishi_otp_salt"
        hashed = hashlib.sha256(f"{salt}_{raw_code}".encode("utf-8")).hexdigest()
        
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
        
        existing = db.query(DeliveryOTP).filter(DeliveryOTP.order_id == order_id).first()
        if existing:
            existing.hashed_otp = hashed
            existing.raw_otp_preview = raw_code  # Stored for prototype demo convenience
            existing.expires_at = expires_at
            existing.attempts = 0
            existing.is_verified = False
            existing.verified_at = None
        else:
            otp_record = DeliveryOTP(
                order_id=order_id,
                hashed_otp=hashed,
                raw_otp_preview=raw_code,
                expires_at=expires_at,
                attempts=0,
                max_attempts=settings.OTP_MAX_ATTEMPTS,
                is_verified=False
            )
            db.add(otp_record)
        
        db.commit()
        return raw_code

    @staticmethod
    def verify_delivery_otp(order_id: int, entered_code: str, verified_by_id: int, verified_by_name: str, db: Session) -> bool:
        record = db.query(DeliveryOTP).filter(DeliveryOTP.order_id == order_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No delivery verification OTP found for this order."
            )
        
        if record.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This order OTP has already been verified."
            )
        
        if datetime.utcnow() > record.expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery OTP has expired. Please request the buyer or farmer to re-generate OTP."
            )
        
        if record.attempts >= record.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum verification attempts exceeded (3/3). For security, OTP is locked."
            )
        
        salt = "krishi_otp_salt"
        entered_hash = hashlib.sha256(f"{salt}_{entered_code.strip()}".encode("utf-8")).hexdigest()
        
        if entered_hash != record.hashed_otp:
            record.attempts += 1
            db.commit()
            remaining = record.max_attempts - record.attempts
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid OTP code. {remaining} attempt(s) remaining."
            )
        
        # Success!
        record.is_verified = True
        record.verified_at = datetime.utcnow()
        record.verified_by_id = verified_by_id
        
        # Update Order Status
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = "delivered"
            order.payment_status = "released_to_farmer"
            
            # Append Trust & Delivery Passport Event
            event = DeliveryEvent(
                order_id=order.id,
                event_type="OTP_VERIFIED",
                actor_id=verified_by_id,
                actor_name=verified_by_name,
                actor_role="Transporter / Delivery Partner",
                title="Delivery Confirmed & Handed Over",
                description=f"Buyer verified cryptographic delivery OTP. Escrow payout of ₹{order.produce_total:,.2f} released to farmer account.",
                location=order.delivery_address,
                badge_color="emerald"
            )
            db.add(event)
        
        db.commit()
        return True
