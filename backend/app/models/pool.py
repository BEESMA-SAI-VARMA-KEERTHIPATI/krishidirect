from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class HarvestPool(Base):
    """
    Smart Village Harvest Pooling: Nearby farmers aggregate produce to reduce freight costs & post-harvest losses.
    """
    __tablename__ = "harvest_pools"

    id = Column(Integer, primary_key=True, index=True)
    pool_code = Column(String(50), unique=True, index=True, nullable=False)
    
    title = Column(String(150), nullable=False)
    produce_type = Column(String(100), nullable=False, index=True)
    village_cluster = Column(String(100), nullable=False)
    destination_market = Column(String(150), nullable=False)
    collection_point = Column(String(200), nullable=False)
    
    target_capacity_kg = Column(Float, nullable=False, default=2000.0)
    current_pooled_kg = Column(Float, nullable=False, default=0.0)
    
    pickup_date = Column(String(30), nullable=False)
    time_window = Column(String(50), nullable=False, default="07:00 AM - 11:00 AM")
    
    # Financial benefits of pooling
    individual_freight_est = Column(Float, nullable=False, default=4.5)  # ₹/kg if shipped individually
    pooled_freight_est = Column(Float, nullable=False, default=1.8)      # ₹/kg with 5-ton shared EV/Tempo
    savings_percentage = Column(Float, nullable=False, default=60.0)      # % saved
    carbon_reduction_kg = Column(Float, nullable=False, default=145.0)    # Estimated kg CO2 avoided
    
    # Status: forming, matched, scheduled, in_transit, completed, cancelled
    status = Column(String(30), default="forming", index=True)
    
    village_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    vehicle_type = Column(String(50), default="Electric 3-Ton Cargo")
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    village_agent = relationship("User", foreign_keys=[village_agent_id])
    transporter = relationship("User", foreign_keys=[transporter_id])
    participants = relationship("PoolParticipant", back_populates="pool", cascade="all, delete-orphan")

class PoolParticipant(Base):
    __tablename__ = "pool_participants"

    id = Column(Integer, primary_key=True, index=True)
    pool_id = Column(Integer, ForeignKey("harvest_pools.id"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=True)
    village = Column(String(100), nullable=False)
    produce_name = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    crate_count = Column(Integer, default=10)
    
    pickup_address = Column(String(200), nullable=True)
    status = Column(String(30), default="confirmed")  # confirmed, picked_up, weighed, cancelled
    estimated_savings_inr = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    pool = relationship("HarvestPool", back_populates="participants")
    farmer = relationship("User", foreign_keys=[farmer_id])
