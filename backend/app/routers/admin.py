from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.listing import ProduceListing
from app.models.order import Order
from app.models.pool import HarvestPool
from app.models.notification import AuditLog
from app.schemas.user import UserResponse
from app.services.auth import require_role

router = APIRouter(prefix="/api/admin", tags=["Administrator Governance"])

@router.get("/metrics")
def get_marketplace_metrics(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Honest marketplace statistics calculated directly from stored database transactions.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    farmers_count = db.query(func.count(User.id)).filter(User.role == "farmer").scalar() or 0
    buyers_count = db.query(func.count(User.id)).filter(User.role == "buyer").scalar() or 0
    active_listings = db.query(func.count(ProduceListing.id)).filter(ProduceListing.status == "active").scalar() or 0
    
    # Financial metrics
    total_gmv = db.query(func.sum(Order.total_amount)).filter(Order.status != "cancelled").scalar() or 0.0
    total_produce_value = db.query(func.sum(Order.produce_total)).filter(Order.status != "cancelled").scalar() or 0.0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    completed_orders = db.query(func.count(Order.id)).filter(Order.status.in_(["delivered", "completed"])).scalar() or 0
    
    # Pooling & Eco Metrics
    total_pooled_kg = db.query(func.sum(HarvestPool.current_pooled_kg)).scalar() or 0.0
    total_co2_saved = db.query(func.sum(HarvestPool.carbon_reduction_kg)).scalar() or 0.0
    # Estimated intermediary margin saved for farmers (approx 28% of GMV)
    estimated_intermediary_saved = round(total_produce_value * 0.28, 2)

    return {
        "total_users": total_users,
        "farmers_count": farmers_count,
        "buyers_count": buyers_count,
        "active_listings": active_listings,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "total_gmv_inr": round(total_gmv, 2),
        "total_produce_transacted_inr": round(total_produce_value, 2),
        "intermediary_margin_saved_inr": estimated_intermediary_saved,
        "total_pooled_produce_kg": round(total_pooled_kg, 1),
        "total_co2_avoided_kg": round(total_co2_saved, 1),
        "is_simulated_prototype": True
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.is_active = is_active
    
    # Audit log
    log = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role="Administrator",
        action="TOGGLE_USER_ACTIVE",
        target_type="USER",
        target_id=str(user_id),
        details=f"User {target.email} active status changed to {is_active}"
    )
    db.add(log)
    db.commit()
    return {"message": f"User status updated to {is_active}"}

@router.get("/audit-logs")
def get_audit_logs(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
