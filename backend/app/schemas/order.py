from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OrderCreate(BaseModel):
    listing_id: int
    quantity: float = Field(..., gt=0)
    delivery_address: str
    delivery_method: str = "standard_transport"
    payment_method: str = "demo_upi"  # demo_upi, demo_card, demo_netbanking

class OTPVerifyRequest(BaseModel):
    order_id: int
    otp_code: str

class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    location: Optional[str] = None

class DeliveryEventResponse(BaseModel):
    id: int
    event_type: str
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    badge_color: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserMinimal(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    village: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    buyer_id: int
    seller_id: int
    listing_id: int
    produce_name: str
    variety: Optional[str] = None
    quantity: float
    unit: str
    unit_price: float
    produce_total: float
    delivery_fee: float
    service_fee: float
    total_amount: float
    delivery_address: str
    delivery_method: str
    status: str
    payment_status: str
    payment_method: str
    payment_transaction_id: Optional[str] = None
    transporter_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    buyer: Optional[UserMinimal] = None
    seller: Optional[UserMinimal] = None
    transporter: Optional[UserMinimal] = None
    timeline_events: List[DeliveryEventResponse] = []
    
    # For prototype demo verification ease
    demo_otp_preview: Optional[str] = None

    class Config:
        from_attributes = True
