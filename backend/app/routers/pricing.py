from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.pricing import (
    PriceEstimateRequest,
    PriceEstimateResponse,
    PriceTrendResponse,
    ProfitCalcRequest,
    ProfitCalcResponse
)
from app.services.pricing_engine import PricingEngine
from app.services.profit_calculator import ProfitCalculatorService

router = APIRouter(prefix="/api/pricing", tags=["AI Pricing & Financial Advisory"])

@router.post("/estimate", response_model=PriceEstimateResponse)
def get_price_estimate(payload: PriceEstimateRequest, db: Session = Depends(get_db)):
    """
    Returns AI Fair-Price analysis based on quality grade, mandi baseline observations,
    and regional transportation parameters.
    """
    return PricingEngine.calculate_fair_price(payload, db)

@router.get("/trends", response_model=PriceTrendResponse)
def get_price_trends(
    produce: str = Query("Tomato", description="Crop produce name"),
    region: Optional[str] = Query(None, description="Regional market or cluster"),
    db: Session = Depends(get_db)
):
    """
    Returns historical price movements and a forward-looking sell-time advisory.
    """
    return PricingEngine.get_price_trends(produce, region, db)

@router.post("/calculator", response_model=ProfitCalcResponse)
def calculate_farmer_profit(payload: ProfitCalcRequest):
    """
    Calculates detailed farmer profit, unit margins, break-even price,
    and side-by-side comparison against middleman commissions.
    """
    return ProfitCalculatorService.calculate(payload)
