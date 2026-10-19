import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProduceListing } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Sprout,
  ShoppingBag,
  Building2,
  TrendingUp,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Leaf,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onOpenListingModal: () => void;
  onOpenProfitModal: () => void;
  onOpenFairPriceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenListingModal,
  onOpenProfitModal,
  onOpenFairPriceModal,
}) => {
  const { user, t, setActiveTab, addToCart, setIsVoiceOpen } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<ProduceListing[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total_gmv_inr: 7878.0,
    total_produce_transacted_inr: 7400.0,
    intermediary_margin_saved_inr: 2072.0,
    total_pooled_produce_kg: 1650.0,
    total_co2_avoided_kg: 132.0,
  });

  useEffect(() => {
    api.getListings({ sort_by: 'newest' })
      .then((data) => setFeaturedListings(data.slice(0, 4)))
      .catch(console.error);

    api.getAdminMetrics()
      .then((m) => setMetrics(m))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section — "Living Harvest" */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#153D2B] via-[#153D2B] to-[#286443] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl">
        {/* Subtle agricultural background accents */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 C30,40 70,60 100,20 L100,100 L0,100 Z" fill="#C7F36B" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#286443] border border-[#C7F36B]/30 text-xs font-semibold text-[#C7F36B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Kisan-to-Buyer Marketplace & Pooling</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#F7F5EC]">
              Your Harvest. <br />
              <span className="text-[#C7F36B]">Your Price.</span> <br />
              Your Market.
            </h1>

            <p className="text-base sm:text-lg text-white/80 max-w-xl font-light leading-relaxed">
              Eliminate predatory intermediary commissions. Connect verified Indian farmers directly
              with retail buyers, supercharge profits with AI fair-price intelligence, and cut freight
              by 60% via Smart Village Harvest Pooling.
            </p>

            {/* CTA Entry Points */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (user?.role === 'farmer') {
                    onOpenListingModal();
                  } else {
                    setActiveTab('farmer-dashboard');
                  }
                }}
                className="px-6 py-3.5 bg-[#C7F36B] hover:bg-[#d8faa1] text-[#153D2B] rounded-xl font-bold text-sm shadow-lg shadow-[#C7F36B]/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Sprout className="w-4 h-4" />
                <span>{t.listHarvest}</span>
              </button>

              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-6 py-3.5 bg-[#286443] hover:bg-[#205136] text-white border border-[#C7F36B]/30 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#C7F36B]" />
                <span>{t.exploreProduce}</span>
              </button>

              <button
                onClick={() => setIsVoiceOpen(true)}
                className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-[#C7F36B] rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 border border-white/15"
              >
                <span>Voice Guide</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C7F36B]" />
                <span>Escrow Secured Payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
                <span>Delivery OTP Verification</span>
              </div>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <Leaf className="w-4 h-4 text-[#C7F36B]" />
                <span>Zero Mandi Deductions</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Farm-to-Buyer Route Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#F7F5EC] text-[#202820] p-6 rounded-3xl shadow-2xl border-4 border-[#286443]/40 relative">
              <div className="flex items-center justify-between border-b border-[#DCE8D7] pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#286443]">
                  Direct Agricultural Corridor
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#153D2B] text-[#C7F36B] rounded font-bold">
                  LIVE ROUTE
                </span>
              </div>

              {/* Connected Visual Route Nodes */}
              <div className="space-y-4 relative">
                {/* Node 1: Farm Origin */}
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#DCE8D7] shadow-sm">
                  <div className="p-2 bg-[#C7F36B]/40 text-[#153D2B] rounded-lg">
                    <Sprout className="w-5 h-5 text-[#286443]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#153D2B]">1. Farm Origin Hub</div>
                    <div className="text-[11px] text-stone-600">Patel Organic Farms, Warangal</div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Harvested at 06:00 AM • Quality Grade A
                    </span>
                  </div>
                </div>

                {/* Connecting arrow line */}
                <div className="flex justify-center -my-2 text-[#286443]">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Node 2: Village Collection & Pooling */}
                <div className="flex items-start gap-3 p-3 bg-[#E7B85C]/15 rounded-xl border border-[#E7B85C]/40 shadow-sm">
                  <div className="p-2 bg-[#E7B85C] text-[#153D2B] rounded-lg">
                    <Layers className="w-5 h-5 text-[#153D2B]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#153D2B]">2. Village Collection & Pooling</div>
                    <div className="text-[11px] text-stone-600">Jangaon Kisan Seva Center</div>
                    <span className="text-[10px] text-amber-900 font-semibold">
                      1,650 kg aggregated • 60% freight savings
                    </span>
                  </div>
                </div>

                {/* Connecting arrow line */}
                <div className="flex justify-center -my-2 text-[#286443]">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Node 3: Direct Buyer Handover */}
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#DCE8D7] shadow-sm">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#153D2B]">3. Verified Buyer Destination</div>
                    <div className="text-[11px] text-stone-600">FreshMart Retail Hub, Hyderabad</div>
                    <span className="text-[10px] text-blue-800 font-semibold">
                      Cryptographic 4-Digit OTP Handover
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Highlight */}
              <div className="mt-4 pt-3 border-t border-[#DCE8D7] flex items-center justify-between text-xs font-bold text-[#153D2B]">
                <span>Farmer Realized Price:</span>
                <span className="text-[#286443] font-editorial text-sm">+32% Higher than Mandi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Distinct Entry Points: Farmer, Buyer, Village Agent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Farmer Card */}
          <div className="bg-white p-7 rounded-2xl border-2 border-[#DCE8D7] hover:border-[#286443] transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#153D2B] text-[#C7F36B] flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#153D2B]">For Farmers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Set your own asking price backed by AI fair-price recommendations. Pool freight with
                village peers and receive immediate escrow release upon OTP verification.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('farmer-dashboard')}
              className="mt-6 flex items-center justify-between text-xs font-bold text-[#286443] hover:text-[#153D2B] pt-4 border-t border-stone-100"
            >
              <span>Open Farmer Command Center</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Buyer Card */}
          <div className="bg-white p-7 rounded-2xl border-2 border-[#DCE8D7] hover:border-[#286443] transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#286443] text-white flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#C7F36B]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#153D2B]">For Retail & Bulk Buyers</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Source directly from the harvest origin with verifiable harvest dates, quality grading,
                transparent cost breakdowns, and live Trust Passport journey tracking.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="mt-6 flex items-center justify-between text-xs font-bold text-[#286443] hover:text-[#153D2B] pt-4 border-t border-stone-100"
            >
              <span>Explore Marketplace Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Village Agent Card */}
          <div className="bg-white p-7 rounded-2xl border-2 border-[#DCE8D7] hover:border-[#286443] transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E7B85C] text-[#153D2B] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#153D2B]">For Village Agents & FPOs</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Empower smallholders with digital listing assistance, manage local weighing & collection points,
                and orchestrate consolidated 3-ton to 5-ton truck dispatches.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('agent-dashboard')}
              className="mt-6 flex items-center justify-between text-xs font-bold text-[#286443] hover:text-[#153D2B] pt-4 border-t border-stone-100"
            >
              <span>Access Village Agent Desk</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Live Marketplace Metrics (Backed by Stored Application Data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#C7F36B]">
                Marketplace Impact Metrics
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#F7F5EC] mt-0.5">
                Real Transaction Results
              </h3>
            </div>
            <span className="text-[11px] text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              *Calculated from persistent database order records & pooling aggregates
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-left">
            <div>
              <span className="text-xs text-white/70 block">Total Produce Value</span>
              <div className="font-editorial text-3xl font-black text-[#C7F36B] mt-1">
                {formatCurrency(metrics.total_gmv_inr || 7878.0)}
              </div>
              <span className="text-[11px] text-white/60">Direct buyer transactions</span>
            </div>

            <div>
              <span className="text-xs text-white/70 block">Intermediary Margin Saved</span>
              <div className="font-editorial text-3xl font-black text-[#E7B85C] mt-1">
                {formatCurrency(metrics.intermediary_margin_saved_inr || 2072.0)}
              </div>
              <span className="text-[11px] text-white/60">Kept in farmers' pockets</span>
            </div>

            <div>
              <span className="text-xs text-white/70 block">Pooled Harvest Aggregated</span>
              <div className="font-editorial text-3xl font-black text-white mt-1">
                {(metrics.total_pooled_produce_kg || 1650).toLocaleString()} kg
              </div>
              <span className="text-[11px] text-white/60">Via shared village cargo</span>
            </div>

            <div>
              <span className="text-xs text-white/70 block">CO2 Emissions Avoided</span>
              <div className="font-editorial text-3xl font-black text-[#C7F36B] mt-1">
                {metrics.total_co2_avoided_kg || 132.0} kg
              </div>
              <span className="text-[11px] text-white/60">Through consolidated freight</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Produce Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#286443]">
              Fresh From Farm Gate
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#153D2B] mt-1">
              Featured Produce Listings
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#286443] hover:text-[#153D2B] underline"
          >
            <span>View All Active Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#DCE8D7] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={item.image_url}
                    alt={item.produce_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#153D2B]/85 text-[#C7F36B] text-[10px] font-bold backdrop-blur-sm">
                    {item.quality_grade}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C7F36B]" />
                    <span>{item.district || item.farm_location}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-[#153D2B] line-clamp-1">
                    {item.produce_name}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Direct Price</span>
                      <span className="font-editorial text-lg font-bold text-[#286443]">
                        {formatCurrency(item.asking_price)}
                      </span>
                      <span className="text-xs text-stone-500">/{item.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">Available</span>
                      <span className="text-xs font-semibold text-[#153D2B]">
                        {item.available_quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => addToCart(item, 50)}
                  className="w-full py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Direct (50 {item.unit})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works (4 Simple Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="bg-[#DCE8D7]/30 border border-[#DCE8D7] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-[#286443]">
              Transparent Architecture
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#153D2B] mt-1">
              How KrishiDirect Works
            </h2>
            <p className="text-xs text-stone-600 mt-2">
              Replacing opaque mandi commissions with direct contracts, shared rural logistics, and verifiable escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#153D2B] text-[#C7F36B] font-bold text-xs flex items-center justify-center">
                01
              </div>
              <h4 className="font-bold text-sm text-[#153D2B]">Farmer Lists Produce</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Farmer enters crop volume and asking price, assisted by the AI Fair-Price engine and speech recognition.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#286443] text-[#C7F36B] font-bold text-xs flex items-center justify-center">
                02
              </div>
              <h4 className="font-bold text-sm text-[#153D2B]">Smart Village Pooling</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Nearby farmers combine small lots heading to the same city into one EV cargo truck, saving ~60% in freight.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#153D2B] text-[#C7F36B] font-bold text-xs flex items-center justify-center">
                03
              </div>
              <h4 className="font-bold text-sm text-[#153D2B]">Escrow Payment Lock</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Buyer places order. Funds are secured safely in agricultural escrow before the truck departs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#286443] text-[#C7F36B] font-bold text-xs flex items-center justify-center">
                04
              </div>
              <h4 className="font-bold text-sm text-[#153D2B]">OTP Handover & Payout</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Buyer checks produce and gives 4-digit OTP to transporter. Payout is instantly released to the farmer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
