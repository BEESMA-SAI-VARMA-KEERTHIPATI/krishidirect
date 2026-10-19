from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="farmer")  # farmer, buyer, agent, transporter, admin
    phone = Column(String(20), nullable=True)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True, default="Telangana")
    avatar_url = Column(String(255), nullable=True)
    
    # Language preferences
    preferred_lang = Column(String(10), default="en")    # en, te, hi
    speech_lang = Column(String(10), default="en-IN")    # en-IN, te-IN, hi-IN
    voice_lang = Column(String(10), default="en-IN")     # en-IN, te-IN, hi-IN
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
