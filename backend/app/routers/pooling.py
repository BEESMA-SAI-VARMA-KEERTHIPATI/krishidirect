import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.pool import HarvestPool, PoolParticipant
from app.models.user import User
from app.schemas.pool import PoolCreate, PoolJoinRequest, PoolResponse, PoolParticipantResponse
from app.services.auth import get_current_user, require_role
from app.services.pooling_service import PoolingService

router = APIRouter(prefix="/api/pooling", tags=["Smart Village Harvest Pooling"])

@router.get("", response_model=List[PoolResponse])
def get_pools(
    village: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HarvestPool)
    if village:
        query = query.filter(HarvestPool.village_cluster.ilike(f"%{village}%"))
    if status_filter:
        query = query.filter(HarvestPool.status == status_filter)
    
    return query.order_by(HarvestPool.created_at.desc()).all()

@router.get("/{pool_id}", response_model=PoolResponse)
def get_pool_details(pool_id: int, db: Session = Depends(get_db)):
    pool = db.query(HarvestPool).filter(HarvestPool.id == pool_id).first()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Harvest pool not found")
    return pool

@router.post("/create", response_model=PoolResponse, status_code=status.HTTP_201_CREATED)
def create_pool(
    payload: PoolCreate,
    current_user: User = Depends(require_role(["farmer", "agent", "admin"])),
    db: Session = Depends(get_db)
):
    code = f"POOL-{payload.village_cluster[:3].upper()}-{uuid.uuid4().hex[:4].upper()}"
    pool = HarvestPool(
        pool_code=code,
        title=payload.title,
        produce_type=payload.produce_type,
        village_cluster=payload.village_cluster,
        destination_market=payload.destination_market,
        collection_point=payload.collection_point,
        target_capacity_kg=payload.target_capacity_kg,
        current_pooled_kg=0.0,
        pickup_date=payload.pickup_date,
        time_window=payload.time_window,
        vehicle_type=payload.vehicle_type,
        individual_freight_est=4.5,
        pooled_freight_est=1.8,
        savings_percentage=60.0,
        carbon_reduction_kg=0.0,
        status="forming",
        village_agent_id=current_user.id if current_user.role == "agent" else None,
        notes=payload.notes
    )
    db.add(pool)
    db.commit()
    db.refresh(pool)
    return pool

@router.post("/join", response_model=PoolResponse)
def join_pool(
    payload: PoolJoinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pool = db.query(HarvestPool).filter(HarvestPool.id == payload.pool_id).first()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Harvest pool not found")

    if pool.status in ["in_transit", "completed", "cancelled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot join pool in status: {pool.status}")

    # Check capacity limit
    if (pool.current_pooled_kg + payload.quantity_kg) > (pool.target_capacity_kg * 1.10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pool is near full capacity ({pool.current_pooled_kg}/{pool.target_capacity_kg} kg). Only {max(0, pool.target_capacity_kg - pool.current_pooled_kg)} kg remaining."
        )

    estimated_savings = round(payload.quantity_kg * (pool.individual_freight_est - pool.pooled_freight_est), 2)
    participant = PoolParticipant(
        pool_id=pool.id,
        farmer_id=current_user.id,
        farmer_name=current_user.full_name,
        farmer_phone=current_user.phone or "Not provided",
        village=current_user.village or pool.village_cluster,
        produce_name=payload.produce_name,
        quantity_kg=payload.quantity_kg,
        crate_count=payload.crate_count,
        pickup_address=payload.pickup_address or current_user.village,
        status="confirmed",
        estimated_savings_inr=estimated_savings
    )
    db.add(participant)
    
    pool.current_pooled_kg += payload.quantity_kg
    pool.carbon_reduction_kg = round(pool.current_pooled_kg * 0.08, 1)

    if pool.current_pooled_kg >= (pool.target_capacity_kg * 0.85):
        pool.status = "matched"

    db.commit()
    db.refresh(pool)
    return pool

@router.post("/smart-match", response_model=PoolResponse)
def smart_match_pool(
    produce_type: str,
    quantity_kg: float,
    village: str,
    destination_market: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Automatic matching algorithm that finds or creates a harvest pool for the farmer.
    """
    return PoolingService.match_or_create_pool(
        farmer=current_user,
        produce_type=produce_type,
        quantity_kg=quantity_kg,
        village=village,
        destination_market=destination_market,
        db=db
    )
