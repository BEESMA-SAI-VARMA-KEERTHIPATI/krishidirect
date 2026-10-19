from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PoolCreate(BaseModel):
    title: str
    produce_type: str
    village_cluster: str
    destination_market: str
    collection_point: str
    target_capacity_kg: float = 2000.0
    pickup_date: str
    time_window: str = "07:00 AM - 11:00 AM"
    vehicle_type: str = "Shared 3-Ton Cargo"
    notes: Optional[str] = None

class PoolJoinRequest(BaseModel):
    pool_id: int
    quantity_kg: float = Field(..., gt=0)
    produce_name: str
    crate_count: int = 10
    pickup_address: Optional[str] = None

class PoolParticipantResponse(BaseModel):
    id: int
    pool_id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: Optional[str] = None
    village: str
    produce_name: str
    quantity_kg: float
    crate_count: int
    status: str = "confirmed"
    estimated_savings_inr: float = 0.0
    joined_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PoolResponse(BaseModel):
    id: int
    pool_code: str
    title: str
    produce_type: str
    village_cluster: str
    destination_market: str
    collection_point: str
    target_capacity_kg: float
    current_pooled_kg: float
    pickup_date: str
    time_window: str
    individual_freight_est: float
    pooled_freight_est: float
    savings_percentage: float
    carbon_reduction_kg: float
    status: str
    village_agent_id: Optional[int] = None
    transporter_id: Optional[int] = None
    vehicle_type: str
    notes: Optional[str] = None
    created_at: datetime
    participants: List[PoolParticipantResponse] = []

    class Config:
        from_attributes = True
