from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PriceFactorBreakdown(BaseModel):
    factor_name: str
    impact: str  # positive, neutral, negative
    description: str
    adjustment_inr: float

class PriceEstimateRequest(BaseModel):
    produce_name: str
    variety: Optional[str] = None
    market_region: Optional[str] = "South Region / Hyderabad Mandi"
    quality_grade: str = "Grade A"  # Grade A, Grade B, Grade C
    quantity: float = 100.0
    unit: str = "kg"
    asking_price: Optional[float] = None
    distance_km: Optional[float] = 25.0

class PriceEstimateResponse(BaseModel):
    produce_name: str
    quality_grade: str
    market_region: str
    estimated_min_price: float
    estimated_modal_price: float
    estimated_max_price: float
    suggested_asking_price: float
    unit: str
    price_difference: Optional[float] = None  # asking_price - suggested
    difference_percentage: Optional[float] = None
    status_assessment: str  # "Competitive", "Below Market (Potential Loss)", "Above Market (Slower Sell)"
    confidence_score: float  # e.g., 0.88 (88%)
    data_freshness: str  # e.g., "Updated today from 4 regional mandis"
    factors: List[PriceFactorBreakdown]
    is_demonstration_data: bool = True
    disclaimer: str

class PriceTrendPoint(BaseModel):
    date: str
    modal_price: float
    min_price: float
    max_price: float
    volume_traded_quintals: Optional[float] = None
    forecast: bool = False

class PriceTrendResponse(BaseModel):
    produce_name: str
    market_region: str
    time_frame: str
    current_modal: float
    seven_day_change_pct: float
    historical_points: List[PriceTrendPoint]
    forecast_points: List[PriceTrendPoint]
    recommendation: str  # "Sell Now", "Wait 3-5 Days", "Hold for Seasonal Peak"
    recommendation_reason: str
    disclaimer: str

# Farmer Profit Calculator schemas
class ProfitCalcRequest(BaseModel):
    quantity_harvested: float = Field(..., gt=0)
    expected_selling_price: float = Field(..., gt=0)
    production_cost: float = 0.0          # Seed, fertilizer, irrigation
    harvest_packaging_cost: float = 0.0   # Labor, crates, bagging
    transport_cost: float = 0.0          # Freight to buyer/hub
    agent_or_platform_fee: float = 0.0   # Minimal platform fee
    other_expenses: float = 0.0          # Storage, loading, etc.
    alternative_intermediary_price: Optional[float] = None  # Mandi middleman price (e.g. 30-40% lower)

class AlternativeComparison(BaseModel):
    scenario_name: str
    intermediary_selling_price: float
    intermediary_revenue: float
    intermediary_commissions_loss: float
    intermediary_net_profit: float
    extra_profit_with_krishidirect: float
    extra_profit_percentage: float

class ProfitCalcResponse(BaseModel):
    quantity: float
    unit_selling_price: float
    gross_revenue: float
    total_expenses: float
    net_profit: float
    profit_per_unit: float
    profit_margin_pct: float
    break_even_price_per_unit: float
    expense_breakdown: Dict[str, float]
    alternative_comparison: Optional[AlternativeComparison] = None
    notes: str
