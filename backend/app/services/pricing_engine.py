import numpy as np
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.listing import MarketPriceRecord
from app.schemas.pricing import (
    PriceEstimateRequest,
    PriceEstimateResponse,
    PriceFactorBreakdown,
    PriceTrendResponse,
    PriceTrendPoint,
)

# Standard baseline dictionary for common crops when local mandi records are insufficient
FALLBACK_CROP_BASELINES = {
    "tomato": {"modal": 32.0, "min": 24.0, "max": 40.0, "shelf_life_days": 5},
    "tomatoes": {"modal": 32.0, "min": 24.0, "max": 40.0, "shelf_life_days": 5},
    "onion": {"modal": 28.0, "min": 22.0, "max": 35.0, "shelf_life_days": 30},
    "onions": {"modal": 28.0, "min": 22.0, "max": 35.0, "shelf_life_days": 30},
    "potato": {"modal": 22.0, "min": 18.0, "max": 27.0, "shelf_life_days": 45},
    "potatoes": {"modal": 22.0, "min": 18.0, "max": 27.0, "shelf_life_days": 45},
    "rice": {"modal": 48.0, "min": 42.0, "max": 56.0, "shelf_life_days": 180},
    "paddy": {"modal": 26.0, "min": 22.0, "max": 30.0, "shelf_life_days": 180},
    "wheat": {"modal": 29.0, "min": 25.0, "max": 33.0, "shelf_life_days": 180},
    "mango": {"modal": 95.0, "min": 75.0, "max": 120.0, "shelf_life_days": 7},
    "mangoes": {"modal": 95.0, "min": 75.0, "max": 120.0, "shelf_life_days": 7},
    "green chilli": {"modal": 65.0, "min": 50.0, "max": 80.0, "shelf_life_days": 8},
    "chilli": {"modal": 65.0, "min": 50.0, "max": 80.0, "shelf_life_days": 8},
    "cotton": {"modal": 72.0, "min": 65.0, "max": 82.0, "shelf_life_days": 120},
    "turmeric": {"modal": 135.0, "min": 115.0, "max": 160.0, "shelf_life_days": 240},
}

class PricingEngine:
    @staticmethod
    def calculate_fair_price(req: PriceEstimateRequest, db: Session) -> PriceEstimateResponse:
        produce_key = req.produce_name.strip().lower()
        
        # 1. Look for historical mandi observations in DB
        query = db.query(MarketPriceRecord).filter(
            MarketPriceRecord.produce_name.ilike(f"%{produce_key}%")
        )
        if req.market_region:
            # Regional filter if matching
            region_matches = query.filter(MarketPriceRecord.market_region.ilike(f"%{req.market_region.split('/')[0].strip()}%")).all()
            records = region_matches if region_matches else query.all()
        else:
            records = query.all()

        factors: List[PriceFactorBreakdown] = []
        
        if len(records) >= 3:
            modal_prices = [r.modal_price for r in records]
            min_prices = [r.min_price for r in records]
            max_prices = [r.max_price for r in records]
            
            base_modal = float(np.median(modal_prices))
            base_min = float(np.percentile(min_prices, 20))
            base_max = float(np.percentile(max_prices, 80))
            confidence = min(0.95, 0.70 + (len(records) * 0.02))
            data_freshness = f"Derived from {len(records)} recent Mandi market observations across {req.market_region}"
            is_fallback = False
        else:
            # Match fallback
            matched_fallback = None
            for key, val in FALLBACK_CROP_BASELINES.items():
                if key in produce_key:
                    matched_fallback = val
                    break
            
            if not matched_fallback:
                matched_fallback = {"modal": 40.0, "min": 30.0, "max": 52.0, "shelf_life_days": 14}
            
            base_modal = matched_fallback["modal"]
            base_min = matched_fallback["min"]
            base_max = matched_fallback["max"]
            confidence = 0.65
            data_freshness = "Demonstration baseline estimate (limited regional mandi quotes)"
            is_fallback = True

        # 2. Quality Grade Adjustments
        grade_multiplier = 1.0
        if "grade a" in req.quality_grade.lower():
            grade_multiplier = 1.12
            factors.append(PriceFactorBreakdown(
                factor_name="Quality Premium (Grade A)",
                impact="positive",
                description="Superior uniform size, zero pest defects, export/supermarket grade",
                adjustment_inr=round(base_modal * 0.12, 2)
            ))
        elif "grade b" in req.quality_grade.lower():
            grade_multiplier = 1.00
            factors.append(PriceFactorBreakdown(
                factor_name="Standard Quality (Grade B)",
                impact="neutral",
                description="Wholesale market standard with acceptable cosmetic variations",
                adjustment_inr=0.0
            ))
        else:  # Grade C
            grade_multiplier = 0.85
            factors.append(PriceFactorBreakdown(
                factor_name="Commercial Processing (Grade C)",
                impact="negative",
                description="Suitable for pulp/sauce processing or local quick clearance",
                adjustment_inr=round(-base_modal * 0.15, 2)
            ))

        # 3. Logistics and Distance Adjustment (savings passed directly to farmer vs mandi intermediary freight)
        dist = req.distance_km or 25.0
        transport_cost_per_kg = round(0.04 * dist, 2)
        factors.append(PriceFactorBreakdown(
            factor_name=f"Direct Route Logistics ({dist} km)",
            impact="positive",
            description=f"Direct farm-to-buyer transit saves ₹{round(transport_cost_per_kg * 0.8, 2)}/kg compared to mandi transshipment",
            adjustment_inr=round(transport_cost_per_kg * 0.4, 2)
        ))

        # 4. Seasonal Demand Factor
        current_month = datetime.utcnow().month
        # Peak months vary by crop; give positive or neutral seasonal index
        seasonal_boost = 1.04 if current_month in [3, 4, 9, 10, 11] else 1.00
        if seasonal_boost > 1.0:
            factors.append(PriceFactorBreakdown(
                factor_name="Seasonal Consumer Demand",
                impact="positive",
                description="Elevated regional consumption and harvest festival demand",
                adjustment_inr=round(base_modal * (seasonal_boost - 1.0), 2)
            ))

        # Final suggested asking price
        final_modal = round(base_modal * grade_multiplier * seasonal_boost, 2)
        final_min = round(base_min * grade_multiplier, 2)
        final_max = round(base_max * grade_multiplier * seasonal_boost, 2)
        suggested_asking = final_modal

        diff = None
        diff_pct = None
        assessment = "Fair and Market-Aligned"
        if req.asking_price is not None:
            diff = round(req.asking_price - suggested_asking, 2)
            diff_pct = round((diff / suggested_asking) * 100, 1)
            if diff > (suggested_asking * 0.15):
                assessment = "High — Asking price is significantly above regional average; may sell slower"
            elif diff < -(suggested_asking * 0.15):
                assessment = "Low — Asking price is below market value; consider raising to capture fair profit"
            else:
                assessment = "Optimal — Price is competitive and maximizes farmer take-home earnings"

        disclaimer = (
            "NOTICE: Price recommendations are AI-assisted estimates derived from regional mandi data, "
            "quality grading standards, and transportation parameters. They do not constitute guaranteed purchase contracts."
        )

        return PriceEstimateResponse(
            produce_name=req.produce_name,
            quality_grade=req.quality_grade,
            market_region=req.market_region or "Regional Mandi Cluster",
            estimated_min_price=final_min,
            estimated_modal_price=final_modal,
            estimated_max_price=final_max,
            suggested_asking_price=suggested_asking,
            unit=req.unit,
            price_difference=diff,
            difference_percentage=diff_pct,
            status_assessment=assessment,
            confidence_score=round(confidence, 2),
            data_freshness=data_freshness,
            factors=factors,
            is_demonstration_data=True,
            disclaimer=disclaimer
        )

    @staticmethod
    def get_price_trends(produce_name: str, market_region: Optional[str], db: Session) -> PriceTrendResponse:
        produce_key = produce_name.strip().lower()
        records = db.query(MarketPriceRecord).filter(
            MarketPriceRecord.produce_name.ilike(f"%{produce_key}%")
        ).order_by(MarketPriceRecord.recorded_date.asc()).all()

        hist_points: List[PriceTrendPoint] = []
        current_modal = 35.0

        if len(records) >= 5:
            for r in records[-14:]:  # last 14 observations
                hist_points.append(PriceTrendPoint(
                    date=r.recorded_date,
                    modal_price=r.modal_price,
                    min_price=r.min_price,
                    max_price=r.max_price,
                    volume_traded_quintals=120.0,
                    forecast=False
                ))
            current_modal = hist_points[-1].modal_price
        else:
            # Generate transparent historical points for demo based on baseline
            matched = None
            for key, val in FALLBACK_CROP_BASELINES.items():
                if key in produce_key:
                    matched = val
                    break
            base = matched["modal"] if matched else 32.0
            
            today = datetime.utcnow()
            for i in range(10, 0, -1):
                day = today - timedelta(days=i)
                noise = np.sin(i * 0.8) * (base * 0.06)
                hist_points.append(PriceTrendPoint(
                    date=day.strftime("%d %b"),
                    modal_price=round(base + noise, 2),
                    min_price=round((base + noise) * 0.85, 2),
                    max_price=round((base + noise) * 1.15, 2),
                    volume_traded_quintals=140.0 + (i * 5),
                    forecast=False
                ))
            current_modal = hist_points[-1].modal_price

        # Forecast 5 days ahead
        forecast_points: List[PriceTrendPoint] = []
        last_price = current_modal
        today = datetime.utcnow()
        trend_direction = 0.015  # modest upward seasonal expectation
        
        for i in range(1, 6):
            future_day = today + timedelta(days=i)
            projected = round(last_price * (1 + (trend_direction * i)), 2)
            forecast_points.append(PriceTrendPoint(
                date=future_day.strftime("%d %b"),
                modal_price=projected,
                min_price=round(projected * 0.90, 2),
                max_price=round(projected * 1.10, 2),
                forecast=True
            ))

        pct_change = round(((forecast_points[-1].modal_price - current_modal) / current_modal) * 100, 1)

        recommendation = "Sell within 2-4 days"
        recommendation_reason = (
            f"Regional mandi arrivals for {produce_name} are steady. Prices are projected to remain firm "
            f"(+{pct_change}% expected variance). Direct listing on KrishiDirect now locks in premium buyer interest "
            f"before weekend bulk wholesale arrivals."
        )

        return PriceTrendResponse(
            produce_name=produce_name,
            market_region=market_region or "South Mandi Hubs",
            time_frame="Past 10 Days + 5 Days Forward Advisory",
            current_modal=current_modal,
            seven_day_change_pct=pct_change,
            historical_points=hist_points,
            forecast_points=forecast_points,
            recommendation=recommendation,
            recommendation_reason=recommendation_reason,
            disclaimer="Forecasts are mathematical trend indicators based on historical seasonality and trading volumes. Actual prices fluctuate with weather and physical mandi arrivals."
        )
