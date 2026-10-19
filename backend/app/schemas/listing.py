from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ListingBase(BaseModel):
    produce_name: str
    category: str
    variety: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    available_quantity: float = Field(..., gt=0)
    unit: str = "kg"
    asking_price: float = Field(..., gt=0)
    quality_grade: str = "Grade A"
    harvest_date: Optional[str] = None
    farm_location: str
    district: Optional[str] = None
    state: Optional[str] = None
    pickup_method: str = "collection_point"

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    produce_name: Optional[str] = None
    category: Optional[str] = None
    variety: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    available_quantity: Optional[float] = None
    unit: Optional[str] = None
    asking_price: Optional[float] = None
    quality_grade: Optional[str] = None
    harvest_date: Optional[str] = None
    farm_location: Optional[str] = None
    pickup_method: Optional[str] = None
    status: Optional[str] = None

class FarmerBasic(BaseModel):
    id: int
    full_name: str
    village: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class ListingResponse(ListingBase):
    id: int
    farmer_id: int
    initial_quantity: float
    status: str
    created_at: datetime
    updated_at: datetime
    farmer: Optional[FarmerBasic] = None

    class Config:
        from_attributes = True

class MarketPriceResponse(BaseModel):
    id: int
    produce_name: str
    variety: Optional[str] = None
    market_region: str
    quality_grade: str
    min_price: float
    modal_price: float
    max_price: float
    unit: str
    recorded_date: str
    source_name: str
    is_seeded: bool

    class Config:
        from_attributes = True
