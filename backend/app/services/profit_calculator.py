from app.schemas.pricing import ProfitCalcRequest, ProfitCalcResponse, AlternativeComparison

class ProfitCalculatorService:
    @staticmethod
    def calculate(req: ProfitCalcRequest) -> ProfitCalcResponse:
        qty = req.quantity_harvested
        price = req.expected_selling_price
        
        gross_revenue = round(qty * price, 2)
        
        expenses = {
            "Production Cost (Seeds, Fertilizer, Water)": round(req.production_cost, 2),
            "Harvesting & Packaging (Labor, Crates)": round(req.harvest_packaging_cost, 2),
            "Direct Transport & Handling": round(req.transport_cost, 2),
            "KrishiDirect Transparent Platform Fee": round(req.agent_or_platform_fee, 2),
            "Other Selling Expenses": round(req.other_expenses, 2),
        }
        
        total_expenses = round(sum(expenses.values()), 2)
        net_profit = round(gross_revenue - total_expenses, 2)
        profit_per_unit = round(net_profit / qty, 2) if qty > 0 else 0.0
        profit_margin = round((net_profit / gross_revenue) * 100, 1) if gross_revenue > 0 else 0.0
        break_even_price = round(total_expenses / qty, 2) if qty > 0 else 0.0
        
        # Comparison with Traditional Intermediary / Mandi Channel
        inter_price = req.alternative_intermediary_price or round(price * 0.70, 2) # Mandi middlemen typically offer ~30% discount
        inter_gross = round(qty * inter_price, 2)
        # Middlemen traditionally cut 8.5% commission + 4% weighing/market deductions
        inter_commissions_loss = round(inter_gross * 0.125, 2)
        # Without pooling, farmer bears un-subsidized individual transport (approx 1.5x)
        inter_transport = round(req.transport_cost * 1.5, 2)
        inter_total_expenses = round(req.production_cost + req.harvest_packaging_cost + inter_transport + inter_commissions_loss + req.other_expenses, 2)
        inter_net = round(inter_gross - inter_total_expenses, 2)
        
        extra_profit = round(net_profit - inter_net, 2)
        extra_profit_pct = round((extra_profit / abs(inter_net)) * 100, 1) if inter_net != 0 else 100.0
        
        alt_comp = AlternativeComparison(
            scenario_name="Traditional Mandi / Middleman Channel",
            intermediary_selling_price=inter_price,
            intermediary_revenue=inter_gross,
            intermediary_commissions_loss=inter_commissions_loss,
            intermediary_net_profit=inter_net,
            extra_profit_with_krishidirect=extra_profit,
            extra_profit_percentage=extra_profit_pct
        )
        
        notes = (
            f"Selling directly via KrishiDirect eliminates intermediaries, earning you ₹{extra_profit:,.2f} "
            f"(+{extra_profit_pct}%) more compared to conventional mandi commissions and un-pooled freight."
        )
        
        return ProfitCalcResponse(
            quantity=qty,
            unit_selling_price=price,
            gross_revenue=gross_revenue,
            total_expenses=total_expenses,
            net_profit=net_profit,
            profit_per_unit=profit_per_unit,
            profit_margin_pct=profit_margin,
            break_even_price_per_unit=break_even_price,
            expense_breakdown=expenses,
            alternative_comparison=alt_comp,
            notes=notes
        )
