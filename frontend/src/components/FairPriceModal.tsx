import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PriceEstimate } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Sparkles,
  X,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface FairPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduceName?: string;
  initialAskingPrice?: number;
  initialQualityGrade?: string;
  onApplyPrice?: (suggestedPrice: number) => void;
}

export const FairPriceModal: React.FC<FairPriceModalProps> = ({
  isOpen,
  onClose,
  initialProduceName = 'Fresh Hybrid Red Tomatoes',
  initialAskingPrice = 32.0,
  initialQualityGrade = 'Grade A',
  onApplyPrice,
}) => {
  const [produceName, setProduceName] = useState<string>(initialProduceName);
  const [qualityGrade, setQualityGrade] = useState<string>(initialQualityGrade);
  const [askingPrice, setAskingPrice] = useState<number>(initialAskingPrice);
  const [marketRegion, setMarketRegion] = useState<string>('South Region / Hyderabad Mandi');
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setProduceName(initialProduceName);
      setAskingPrice(initialAskingPrice);
      setQualityGrade(initialQualityGrade);
      fetchEstimate(initialProduceName, initialAskingPrice, initialQualityGrade);
    }
  }, [isOpen, initialProduceName, initialAskingPrice, initialQualityGrade]);

  const fetchEstimate = async (pName: string, pPrice: number, pGrade: string) => {
    setIsLoading(true);
    try {
      const res = await api.getPriceEstimate({
        produce_name: pName,
        quality_grade: pGrade,
        asking_price: pPrice,
        market_region: marketRegion,
        quantity: 100,
        distance_km: 35,
      });
      setEstimate(res);
    } catch (err) {
      console.error('Error fetching price estimate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    fetchEstimate(produceName, askingPrice, qualityGrade);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#286443] text-[#C7F36B] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold">AI Fair-Price Advisory Engine</h3>
              <p className="text-xs text-[#C7F36B]">Mandi Analytics • Quality Index • Direct Route Advantage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Controls */}
        <div className="p-5 bg-white border-b border-[#DCE8D7] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#153D2B] mb-1">Crop Produce</label>
            <input
              type="text"
              value={produceName}
              onChange={(e) => setProduceName(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg focus:ring-1 focus:ring-[#286443] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153D2B] mb-1">Quality Grade</label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg focus:ring-1 focus:ring-[#286443]"
            >
              <option value="Grade A">Grade A (Export / Prime)</option>
              <option value="Grade B">Grade B (Standard Wholesale)</option>
              <option value="Grade C">Grade C (Processing / Quick)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153D2B] mb-1">Your Asking Price (₹/kg)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                value={askingPrice}
                onChange={(e) => setAskingPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-lg font-bold text-[#153D2B]"
              />
              <button
                onClick={handleRecalculate}
                className="px-3 py-2.5 bg-[#286443] text-[#C7F36B] rounded-lg text-xs font-bold hover:bg-[#153D2B]"
              >
                Evaluate
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F7F5EC]">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#286443] animate-pulse">
              Calculating real-time mandi baseline distributions and quality multiplier...
            </div>
          ) : estimate ? (
            <>
              {/* Primary Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-white border border-[#DCE8D7] rounded-xl shadow-sm">
                  <span className="text-xs text-stone-500 font-medium">Estimated Range</span>
                  <div className="font-editorial text-lg font-bold text-[#153D2B] mt-1">
                    {formatCurrency(estimate.estimated_min_price)} – {formatCurrency(estimate.estimated_max_price)}
                  </div>
                  <span className="text-[10px] text-stone-400">Regional APMC Bounds</span>
                </div>

                <div className="p-4 bg-[#153D2B] text-white rounded-xl shadow-md border-2 border-[#C7F36B]">
                  <span className="text-xs text-[#C7F36B] font-bold uppercase tracking-wider">
                    Suggested Asking Price
                  </span>
                  <div className="font-editorial text-2xl font-black text-[#C7F36B] mt-1">
                    {formatCurrency(estimate.suggested_asking_price)} <span className="text-xs text-white">/{estimate.unit}</span>
                  </div>
                  <span className="text-[10px] text-white/70">Fair Farmer Return</span>
                </div>

                <div className="p-4 bg-white border border-[#DCE8D7] rounded-xl shadow-sm">
                  <span className="text-xs text-stone-500 font-medium">Model Assessment</span>
                  <div className="font-bold text-sm text-[#286443] mt-1">
                    {estimate.status_assessment}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Confidence: {(estimate.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Factors Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-[#DCE8D7]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#286443] mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Price Driver Breakdown</span>
                </h4>

                <div className="space-y-2.5">
                  {estimate.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F7F5EC] rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#153D2B]">{factor.factor_name}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5">{factor.description}</div>
                      </div>
                      <div
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          factor.impact === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : factor.impact === 'negative'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone-200 text-stone-800'
                        }`}
                      >
                        {factor.adjustment_inr > 0 ? `+${formatCurrency(factor.adjustment_inr)}` : factor.adjustment_inr < 0 ? `-${formatCurrency(Math.abs(factor.adjustment_inr))}` : 'Baseline'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Freshness & Disclaimer Notice */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info className="w-4 h-4" />
                  <span>Data Source: {estimate.data_freshness}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {estimate.disclaimer}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#DCE8D7] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold"
          >
            Close
          </button>

          {onApplyPrice && estimate && (
            <button
              onClick={() => {
                onApplyPrice(estimate.suggested_asking_price);
                onClose();
              }}
              className="px-4 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Apply Suggested Price ({formatCurrency(estimate.suggested_asking_price)})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
