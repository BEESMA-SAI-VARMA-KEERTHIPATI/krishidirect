from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pool import HarvestPool, PoolParticipant
from app.models.user import User

class PoolingService:
    @staticmethod
    def match_or_create_pool(
        farmer: User,
        produce_type: str,
        quantity_kg: float,
        village: str,
        destination_market: str,
        db: Session
    ) -> HarvestPool:
        """
        Rule-based matching algorithm to find compatible active harvest pools
        in the same village cluster heading to the same destination market.
        """
        compatible_pools = db.query(HarvestPool).filter(
            HarvestPool.status == "forming",
            HarvestPool.village_cluster.ilike(f"%{village}%"),
            HarvestPool.destination_market.ilike(f"%{destination_market}%")
        ).all()

        selected_pool: Optional[HarvestPool] = None
        for pool in compatible_pools:
            # Check produce compatibility & remaining capacity
            if (pool.current_pooled_kg + quantity_kg) <= (pool.target_capacity_kg * 1.05):
                # Check category compatibility
                selected_pool = pool
                break

        if not selected_pool:
            # Create a new pool
            pool_code = f"POOL-{village[:3].upper()}-{destination_market[:3].upper()}-{quantity_kg:.0f}"
            selected_pool = HarvestPool(
                pool_code=pool_code,
                title=f"Shared {produce_type.title()} Dispatch: {village} to {destination_market}",
                produce_type=produce_type,
                village_cluster=village,
                destination_market=destination_market,
                collection_point=f"{village} Central Kisan Seva Kendra",
                target_capacity_kg=2500.0,
                current_pooled_kg=0.0,
                pickup_date="Tomorrow Morning",
                time_window="06:30 AM - 10:00 AM",
                individual_freight_est=4.5,
                pooled_freight_est=1.8,
                savings_percentage=60.0,
                carbon_reduction_kg=round(quantity_kg * 0.08, 1),
                status="forming",
                vehicle_type="Shared 3-Ton Electric Cargo"
            )
            db.add(selected_pool)
            db.flush()

        # Add participant
        estimated_savings = round(quantity_kg * (selected_pool.individual_freight_est - selected_pool.pooled_freight_est), 2)
        participant = PoolParticipant(
            pool_id=selected_pool.id,
            farmer_id=farmer.id,
            farmer_name=farmer.full_name,
            farmer_phone=farmer.phone or "Not provided",
            village=village,
            produce_name=produce_type,
            quantity_kg=quantity_kg,
            crate_count=max(1, int(quantity_kg / 25)),
            pickup_address=farmer.village or village,
            status="confirmed",
            estimated_savings_inr=estimated_savings
        )
        db.add(participant)
        
        # Update current pooled kg and carbon reduction
        selected_pool.current_pooled_kg += quantity_kg
        selected_pool.carbon_reduction_kg = round(selected_pool.current_pooled_kg * 0.08, 1)
        
        # If pool reaches 85% capacity, change status to matched
        if selected_pool.current_pooled_kg >= (selected_pool.target_capacity_kg * 0.85):
            selected_pool.status = "matched"

        db.commit()
        db.refresh(selected_pool)
        return selected_pool
