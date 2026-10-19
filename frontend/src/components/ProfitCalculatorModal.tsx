import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProfitCalcResult } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Calculator,
  X,
  TrendingUp,
  Percent,
  Coins,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';

interface ProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrice?: number;
  defaultQty?: number;
}

export const ProfitCalculatorModal: React.FC<ProfitModalProps> = ({
  isOpen,
  onClose,
  defaultPrice = 32.0,
  defaultQty = 1000.0,
}) => {
  const [quantity, setQuantity] = useState<number>(defaultQty);
  const [sellingPrice, setSellingPrice] = useState<number>(defaultPrice);
  const [productionCost, setProductionCost] = useState<number>(11500.0);
  const [harvestCost, setHarvestCost] = useState<number>(2500.0);
  const [transportCost, setTransportCost] = useState<number>(1800.0);
  const [platformFee, setPlatformFee] = useState<number>(640.0);
  const [otherExpenses, setOtherExpenses] = useState<number>(500.0);
  const [result, setResult] = useState<ProfitCalcResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, quantity, sellingPrice, productionCost, harvestCost, transportCost, platformFee, otherExpenses]);

  const calculate = async () => {
    try {
      const res = await api.calculateProfit({
        quantity_harvested: quantity,
        expected_selling_price: sellingPrice,
        production_cost: productionCost,
        harvest_packaging_cost: harvestCost,
        transport_cost: transportCost,
        agent_or_platform_fee: platformFee,
        other_expenses: otherExpenses,
      });
      setResult(res);
    } catch (err) {
      console.error('Profit calculation failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#286443] text-[#C7F36B] rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold">Farmer Net Profit & Margin Calculator</h3>
              <p className="text-xs text-[#C7F36B]">Direct Sourcing vs Traditional Mandi Intermediary Channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F7F5EC]">
          {/* Left Column: Interactive Inputs */}
          <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#286443]">
              Harvest & Cost Inputs
            </h4>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#153D2B] mb-1">
                <span>Quantity Harvested:</span>
                <span className="font-bold">{quantity} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-[#286443]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#153D2B] mb-1">
                <span>Expected Direct Price:</span>
                <span className="font-bold">{formatCurrency(sellingPrice)}/kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="1"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full accent-[#286443]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Production (Seed/Water)</label>
                <input
                  type="number"
                  value={productionCost}
                  onChange={(e) => setProductionCost(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Harvest & Crates (Labor)</label>
                <input
                  type="number"
                  value={harvestCost}
                  onChange={(e) => setHarvestCost(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Freight (Direct/Pooled)</label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Platform / Escrow Fee (2%)</label>
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Results & Comparative Card */}
          {result && (
            <div className="space-y-4">
              {/* Primary Net Margin Card */}
              <div className="p-5 bg-[#153D2B] text-white rounded-2xl shadow-md border-2 border-[#C7F36B] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#C7F36B] tracking-wider">
                      KrishiDirect Net Profit
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C7F36B] text-[#153D2B]">
                      {result.profit_margin_pct}% Margin
                    </span>
                  </div>
                  <div className="font-editorial text-3xl font-black text-white mt-2">
                    {formatCurrency(result.net_profit)}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    Profit Per Kg: <strong className="text-[#C7F36B]">{formatCurrency(result.profit_per_unit)}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/60 block text-[10px]">Gross Revenue</span>
                    <span className="font-bold">{formatCurrency(result.gross_revenue)}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px]">Break-Even Price</span>
                    <span className="font-bold text-[#E7B85C]">{formatCurrency(result.break_even_price_per_unit)}/kg</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison with Mandi Channel */}
              {result.alternative_comparison && (
                <div className="p-4 bg-white border border-[#DCE8D7] rounded-2xl shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#153D2B]">Conventional Mandi Middleman Profit:</span>
                    <span className="font-semibold text-stone-500">
                      {formatCurrency(result.alternative_comparison.intermediary_net_profit)}
                    </span>
                  </div>

                  <div className="p-3 bg-[#C7F36B]/25 border border-[#286443]/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#153D2B] block">
                        Extra Take-Home With KrishiDirect:
                      </span>
                      <span className="text-[10px] text-stone-600">Zero middleman cut + shared pooling</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-[#286443]">
                        +{formatCurrency(result.alternative_comparison.extra_profit_with_krishidirect)}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800">
                        (+{result.alternative_comparison.extra_profit_percentage}% Boost)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 italic leading-snug">
                    {result.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#DCE8D7] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#153D2B] text-[#F7F5EC] hover:bg-[#286443] rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
