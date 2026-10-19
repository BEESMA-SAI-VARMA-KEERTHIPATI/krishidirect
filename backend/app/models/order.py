from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("produce_listings.id"), nullable=False, index=True)
    
    produce_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    unit_price = Column(Float, nullable=False)
    
    produce_total = Column(Float, nullable=False)
    delivery_fee = Column(Float, nullable=False, default=0.0)
    service_fee = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    delivery_address = Column(String(255), nullable=False)
    delivery_method = Column(String(50), default="standard_transport")
    
    # State transitions: pending -> confirmed -> ready_for_pickup -> in_transit -> delivered -> completed / cancelled
    status = Column(String(30), default="pending", index=True)
    
    # Payment lifecycle
    payment_status = Column(String(30), default="held_in_escrow")  # pending, held_in_escrow, released_to_farmer, refunded
    payment_method = Column(String(50), default="demo_upi")  # demo_upi, demo_card, demo_netbanking
    payment_transaction_id = Column(String(100), nullable=True)
    
    # Assigned Transporter / Village Agent
    transporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    listing = relationship("ProduceListing", foreign_keys=[listing_id])
    transporter = relationship("User", foreign_keys=[transporter_id])
    timeline_events = relationship("DeliveryEvent", back_populates="order", cascade="all, delete-orphan", order_by="DeliveryEvent.created_at")

class DeliveryOTP(Base):
    __tablename__ = "delivery_otps"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    hashed_otp = Column(String(255), nullable=False)
    raw_otp_preview = Column(String(10), nullable=True)  # Clearly exposed ONLY for prototype demo testing convenience
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class DeliveryEvent(Base):
    """
    Trust and Delivery Passport: chronological, tamper-evident audit timeline for order lifecycle.
    """
    __tablename__ = "delivery_events"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # ORDER_CREATED, SELLER_CONFIRMED, HARVEST_PACKED, PICKUP_COMPLETED, IN_TRANSIT, OTP_VERIFIED, COMPLETED, CANCELLED
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(100), nullable=True)
    actor_role = Column(String(50), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(150), nullable=True)
    badge_color = Column(String(20), default="emerald")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="timeline_events")
