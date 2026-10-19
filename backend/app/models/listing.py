from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ProduceListing(Base):
    __tablename__ = "produce_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    produce_name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # vegetables, grains, fruits, pulses, spices
    variety = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    
    available_quantity = Column(Float, nullable=False)
    initial_quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")  # kg, quintal, crate, ton
    
    asking_price = Column(Float, nullable=False)  # Price per unit
    quality_grade = Column(String(10), nullable=False, default="Grade A")  # Grade A, Grade B, Grade C
    harvest_date = Column(String(30), nullable=True)
    
    farm_location = Column(String(150), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    pickup_method = Column(String(50), nullable=False, default="collection_point")  # farm_pickup, collection_point, direct_delivery
    status = Column(String(20), default="active", index=True)  # active, paused, sold_out, cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("User", foreign_keys=[farmer_id])

class MarketPriceRecord(Base):
    __tablename__ = "market_price_records"

    id = Column(Integer, primary_key=True, index=True)
    produce_name = Column(String(100), nullable=False, index=True)
    variety = Column(String(100), nullable=True)
    market_region = Column(String(100), nullable=False, index=True)  # Mandi or region
    quality_grade = Column(String(10), nullable=False, default="Grade A")
    min_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)  # Prevailing / fair baseline
    max_price = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")
    recorded_date = Column(String(30), nullable=False, index=True)
    source_name = Column(String(100), default="Agmarknet Mandi Baseline")
    is_seeded = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
