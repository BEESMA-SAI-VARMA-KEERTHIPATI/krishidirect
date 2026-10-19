from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "farmer"  # farmer, buyer, agent, transporter, admin
    phone: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "Telangana"
    preferred_lang: Optional[str] = "en"
    speech_lang: Optional[str] = "en-IN"
    voice_lang: Optional[str] = "en-IN"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPreferencesUpdate(BaseModel):
    preferred_lang: Optional[str] = None
    speech_lang: Optional[str] = None
    voice_lang: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
