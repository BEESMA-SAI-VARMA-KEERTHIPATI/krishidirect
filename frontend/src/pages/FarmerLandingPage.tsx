import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ProduceListing, Order, HarvestPool } from '../types';
import {
  Sprout, Plus, Sparkles, TrendingUp, Calculator, Layers, Package,
  Clock, CheckCircle2, AlertCircle, Truck, ArrowRight, PauseCircle,
  PlayCircle, MapPin, ShieldCheck, RefreshCw, Leaf, BarChart3,
  IndianRupee, Users, Star, Zap
} from 'lucide-react';

interface FarmerLandingPageProps {
  onOpenListingModal: () => void;
  onOpenProfitModal: () => void;
  onOpenFairPriceModal: () => void;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start = 0; const step = target / (duration / 16);
    const t = setInterval(() => { start = Math.min(start + step, target); setVal(Math.floor(start)); if (start >= target) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [target, active, duration]);
  return val;
}

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#DCE8D7] via-[#F7F5EC] to-[#DCE8D7] bg-[length:200%_100%] rounded-xl ${className}`}
    style={{ animation: 'shimmer 1.6s ease-in-out infinite', backgroundSize: '200% 100%' }} />
);

const statusColor: Record<string, string> = {
  active: 'bg-[#C7F36B] text-[#153D2B]',
  paused: 'bg-[#E7B85C] text-[#202820]',
  sold_out: 'bg-[#DCE8D7] text-[#286443]',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-[#E7B85C]/30 text-[#202820]',
  confirmed: 'bg-[#C7F36B]/40 text-[#153D2B]',
  ready_for_pickup: 'bg-[#286443]/20 text-[#286443]',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-[#DCE8D7] text-[#153D2B]',
  completed: 'bg-[#153D2B] text-[#C7F36B]',
};

export const FarmerLandingPage: React.FC<FarmerLandingPageProps> = ({
  onOpenListingModal, onOpenProfitModal, onOpenFairPriceModal,
}) => {
  const { user, navigate, setIsVoiceOpen } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pools, setPools] = useState<HarvestPool[]>([]);
  const [fairPrice, setFairPrice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  const listingsSection = useScrollReveal();
  const priceSection = useScrollReveal();
  const ordersSection = useScrollReveal();
  const poolSection = useScrollReveal();

  const totalKg = listings.reduce((s, l) => s + l.available_quantity, 0);
  const avgPrice = listings.length ? listings.reduce((s, l) => s + l.asking_price, 0) / listings.length : 0;

  const kgCount = useCountUp(totalKg, !loading);
  const listingCount = useCountUp(listings.length, !loading);
  const priceCount = useCountUp(Math.floor(avgPrice), !loading);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [l, o, p, fp] = await Promise.allSettled([
          api.getMyListings(), api.getOrders(), api.getPools(),
          api.getPriceEstimate({ produce_name: 'Fresh Hybrid Red Tomatoes', quality_grade: 'Grade A', asking_price: 32, quantity: 500 }),
        ]);
        if (l.status === 'fulfilled') setListings(l.value);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (p.status === 'fulfilled') setPools(p.value);
        if (fp.status === 'fulfilled') setFairPrice(fp.value);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleOrderAction = async (orderId: number, status: string) => {
    setUpdatingOrder(orderId);
    try { await api.updateOrderStatus(orderId, status); const o = await api.getOrders(); setOrders(o); } catch { }
    setUpdatingOrder(null);
  };

  const toggleListing = async (l: ProduceListing) => {
    const next = l.status === 'active' ? 'paused' : 'active';
    try { await api.updateListing(l.id, { status: next }); const ls = await api.getMyListings(); setListings(ls); } catch { }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EC] overflow-x-hidden">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes growUp { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
        @keyframes drawLine { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
        @keyframes floatLeaf { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-12px) rotate(5deg)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(199,243,107,0.4)} 50%{box-shadow:0 0 0 16px rgba(199,243,107,0)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes revealWord { from{opacity:0;transform:translateY(20px) skewX(-4deg)} to{opacity:1;transform:translateY(0) skewX(0)} }
        .reveal-word { display:inline-block; animation: revealWord 0.6s ease forwards; opacity:0; }
        .section-reveal { opacity:0; transform:translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .section-reveal.visible { opacity:1; transform:translateY(0); }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(21,61,43,0.12); }
        @media (prefers-reduced-motion: reduce) { .reveal-word, .section-reveal, .card-hover { animation:none!important; transition:none!important; transform:none!important; opacity:1!important; } }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.35}px)` }}>
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Indian farmer in green field"
            className="w-full h-full object-cover"
            style={{ minHeight: '110vh' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(21,61,43,0.82) 0%, rgba(21,61,43,0.55) 60%, rgba(21,61,43,0.88) 100%)' }} />
        </div>

        {/* Animated field-furrow SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[0.15, 0.3, 0.5, 0.7, 0.85].map((y, i) => (
            <path key={i} d={`M -100 ${y * 900} Q 360 ${y * 900 - 30} 720 ${y * 900 + 20} Q 1080 ${y * 900 - 10} 1540 ${y * 900}`}
              stroke="rgba(199,243,107,0.12)" strokeWidth="1.5" fill="none"
              strokeDasharray="600" strokeDashoffset="600"
              style={{ animation: `drawLine 3s ease ${i * 0.4}s forwards` }} />
          ))}
        </svg>

        {/* Animated wheat stalks */}
        <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1440 160" preserveAspectRatio="none">
          {[60, 140, 220, 310, 400, 520, 640, 760, 880, 1000, 1120, 1240, 1360].map((x, i) => (
            <g key={i} style={{ animation: `floatLeaf ${2.5 + (i % 3) * 0.4}s ease-in-out ${i * 0.15}s infinite` }}>
              <line x1={x} y1="160" x2={x} y2={60 + (i % 4) * 15} stroke="rgba(199,243,107,0.25)" strokeWidth="1.5" />
              <ellipse cx={x - 8} cy={90 + (i % 3) * 12} rx="10" ry="5" fill="rgba(199,243,107,0.18)" transform={`rotate(-30,${x},${90 + (i % 3) * 12})`} />
              <ellipse cx={x + 8} cy={80 + (i % 4) * 10} rx="10" ry="5" fill="rgba(199,243,107,0.18)" transform={`rotate(30,${x},${80 + (i % 4) * 10})`} />
            </g>
          ))}
        </svg>

        {/* Hero content */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-20 pb-48 pt-32 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C7F36B]/15 border border-[#C7F36B]/30 rounded-full text-[#C7F36B] text-xs font-bold uppercase tracking-widest mb-8"
            style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
            <Leaf className="w-3 h-3" />
            KrishiDirect — Farmer Workspace
          </div>
          <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6">
            {['Your', 'Harvest.', 'Your', 'Price.', 'Your', 'Future.'].map((w, i) => (
              <span key={i} className="reveal-word mr-[0.25em]" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>{w}</span>
            ))}
          </h1>
          <p className="text-[#DCE8D7] text-lg sm:text-xl max-w-xl leading-relaxed mb-10 font-light"
            style={{ animation: 'fadeInUp 0.6s ease 1.0s forwards', opacity: 0 }}>
            Sell directly, discover fair prices, and connect your harvest with the right buyers across India.
          </p>
          <div className="flex flex-wrap gap-4" style={{ animation: 'fadeInUp 0.6s ease 1.2s forwards', opacity: 0 }}>
            <button onClick={onOpenListingModal}
              className="group flex items-center gap-2.5 px-8 py-4 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-bold text-sm rounded-2xl transition-all duration-300"
              style={{ animation: 'pulseGlow 2.5s ease 2s infinite' }}>
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              List Your Harvest
            </button>
            <button onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-8 py-4 border-2 border-white/40 hover:border-white text-white font-semibold text-sm rounded-2xl transition-all duration-300 backdrop-blur-sm">
              Explore My Harvest <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar at hero bottom */}
        <div className="relative z-10 w-full bg-[#C7F36B]/10 backdrop-blur-md border-t border-[#C7F36B]/20"
          style={{ animation: 'fadeInUp 0.6s ease 1.4s forwards', opacity: 0 }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-white/15">
            {[
              { label: 'Active Listings', value: loading ? '—' : listingCount, icon: Package },
              { label: 'Total Stock (kg)', value: loading ? '—' : `${kgCount.toLocaleString('en-IN')} kg`, icon: Layers },
              { label: 'Avg Price / kg', value: loading ? '—' : `₹${priceCount}`, icon: IndianRupee },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-6">
                <Icon className="w-5 h-5 text-[#C7F36B] flex-shrink-0" />
                <div>
                  <div className="text-white font-bold text-xl">{value}</div>
                  <div className="text-white/60 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE LISTINGS ── */}
      <section id="listings-section" ref={listingsSection.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${listingsSection.visible ? 'visible' : ''}`}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Your Produce</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1">Active Listings</h2>
          </div>
          <button onClick={onOpenListingModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#153D2B] text-[#C7F36B] rounded-xl font-bold text-sm hover:bg-[#286443] transition-colors">
            <Plus className="w-4 h-4" /> New Listing
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
            <Sprout className="w-12 h-12 text-[#DCE8D7] mx-auto mb-4" />
            <p className="text-[#286443] font-semibold mb-2">No listings yet</p>
            <p className="text-stone-500 text-sm mb-6">Start by listing your first harvest to reach buyers directly.</p>
            <button onClick={onOpenListingModal}
              className="px-6 py-3 bg-[#153D2B] text-[#C7F36B] rounded-xl font-bold text-sm hover:bg-[#286443] transition-colors">
              + List Your First Harvest
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l, i) => (
              <div key={l.id} className="card-hover bg-white border border-[#DCE8D7] rounded-3xl overflow-hidden"
                style={{ animation: `slideInLeft 0.5s ease ${i * 0.08}s both` }}>
                <div className="relative h-44 overflow-hidden">
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.produce_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, #153D2B 0%, #286443 100%)` }}>
                      <Sprout className="w-12 h-12 text-[#C7F36B] opacity-60" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor[l.status] || 'bg-gray-100 text-gray-600'}`}>
                    {l.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-[#153D2B] text-base leading-tight">{l.produce_name}</h3>
                      {l.variety && <p className="text-xs text-stone-500">{l.variety}</p>}
                    </div>
                    <span className="text-xs bg-[#DCE8D7] text-[#286443] px-2 py-0.5 rounded-full font-medium flex-shrink-0">{l.quality_grade}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="font-black text-[#153D2B] text-lg">₹{l.asking_price}<span className="text-xs font-normal text-stone-400">/{l.unit}</span></span>
                    <span className="text-stone-500 text-xs">{l.available_quantity.toLocaleString('en-IN')} {l.unit} left</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                    <MapPin className="w-3 h-3" />{l.farm_location}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={onOpenFairPriceModal}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#F7F5EC] hover:bg-[#DCE8D7] text-[#286443] rounded-xl text-xs font-bold transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> AI Price
                    </button>
                    <button onClick={() => toggleListing(l)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#153D2B]/8 hover:bg-[#153D2B]/15 text-[#153D2B] rounded-xl text-xs font-bold transition-colors">
                      {l.status === 'active' ? <><PauseCircle className="w-3.5 h-3.5" /> Pause</> : <><PlayCircle className="w-3.5 h-3.5" /> Resume</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── AI FAIR PRICE ── */}
      <section ref={priceSection.ref}
        className={`py-20 bg-[#153D2B] section-reveal ${priceSection.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">AI-Powered</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-black text-white mt-2 mb-6">Fair Price Insights</h2>
              <p className="text-[#DCE8D7] leading-relaxed mb-8 font-light">
                Our AI analyses real-time mandi data, seasonal trends, and quality grades to suggest the ideal asking price — so you never undersell your harvest.
              </p>
              {fairPrice && (
                <div className="space-y-4">
                  {[
                    { label: 'Min Market Price', val: fairPrice.estimated_min_price, width: 45 },
                    { label: 'Modal Price', val: fairPrice.estimated_modal_price, width: 72 },
                    { label: 'Max Price', val: fairPrice.estimated_max_price, width: 100 },
                    { label: 'AI Suggested Price', val: fairPrice.suggested_asking_price, width: 85, highlight: true },
                  ].map(({ label, val, width, highlight }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className={highlight ? 'text-[#C7F36B] font-bold' : 'text-white/70'}>{label}</span>
                        <span className={highlight ? 'text-[#C7F36B] font-black' : 'text-white font-medium'}>₹{val}/{fairPrice.unit}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${highlight ? 'bg-[#C7F36B]' : 'bg-white/30'}`}
                          style={{ width: priceSection.visible ? `${width}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!fairPrice && !loading && (
                <div className="p-6 border border-white/15 rounded-2xl text-white/50 text-sm text-center">
                  Price data unavailable. Check your connection.
                </div>
              )}
              <button onClick={onOpenFairPriceModal}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#C7F36B] text-[#153D2B] font-bold rounded-xl hover:bg-[#d4f77c] transition-colors text-sm">
                <Sparkles className="w-4 h-4" /> Open AI Price Advisor
              </button>
            </div>
            <div className="flex justify-center">
              <div className="relative w-72 h-72">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(199,243,107,0.1)" strokeWidth="20" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#C7F36B" strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 80 * (fairPrice?.confidence_score || 0.75)} ${2 * Math.PI * 80}`}
                    strokeLinecap="round" transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dasharray 1.5s ease' }} />
                  <text x="100" y="90" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Fraunces, serif">
                    {Math.round((fairPrice?.confidence_score || 0.75) * 100)}%
                  </text>
                  <text x="100" y="115" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">Confidence</text>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="mt-16 text-xs text-[#C7F36B]/60 font-mono uppercase tracking-wider">AI Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INCOMING ORDERS ── */}
      <section ref={ordersSection.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${ordersSection.visible ? 'visible' : ''}`}>
        <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">From Buyers</span>
        <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1 mb-10">Incoming Orders</h2>
        {loading ? (
          <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-28" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
            <Package className="w-10 h-10 text-[#DCE8D7] mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No orders yet — your listings are live for buyers to discover.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((o, i) => (
              <div key={o.id} className="card-hover bg-white border border-[#DCE8D7] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ animation: `slideInRight 0.5s ease ${i * 0.07}s both` }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-[#153D2B] text-sm">{o.order_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#202820]">{o.produce_name} — {o.quantity} {o.unit}</p>
                  <p className="text-xs text-stone-500 mt-0.5">Buyer: {o.buyer?.full_name || 'Buyer'} · ₹{o.total_amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {o.status === 'pending' && (
                    <button onClick={() => handleOrderAction(o.id, 'confirmed')} disabled={updatingOrder === o.id}
                      className="px-4 py-2 bg-[#C7F36B] text-[#153D2B] font-bold text-xs rounded-xl hover:bg-[#d4f77c] transition-colors disabled:opacity-50">
                      {updatingOrder === o.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                    </button>
                  )}
                  {o.status === 'confirmed' && (
                    <button onClick={() => handleOrderAction(o.id, 'ready_for_pickup')} disabled={updatingOrder === o.id}
                      className="px-4 py-2 bg-[#153D2B] text-[#C7F36B] font-bold text-xs rounded-xl hover:bg-[#286443] transition-colors disabled:opacity-50">
                      Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── HARVEST POOLING ── */}
      <section ref={poolSection.ref}
        className={`py-20 bg-[#F7F5EC] border-t border-[#DCE8D7] section-reveal ${poolSection.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Smart Logistics</span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1 mb-10">Village Harvest Pooling</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{[1, 2].map(i => <Skeleton key={i} className="h-48" />)}</div>
          ) : pools.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
              <Layers className="w-10 h-10 text-[#DCE8D7] mx-auto mb-3" />
              <p className="text-stone-500 text-sm">No active pools. Pool your harvest with neighbors to cut freight costs.</p>
              <button onClick={() => navigate('/pooling')} className="mt-4 px-5 py-2.5 bg-[#153D2B] text-[#C7F36B] rounded-xl font-bold text-sm hover:bg-[#286443] transition-colors">
                Explore Pooling
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pools.slice(0, 4).map((p) => (
                <div key={p.id} className="card-hover bg-white border border-[#DCE8D7] rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-mono text-[#286443] bg-[#DCE8D7] px-2 py-0.5 rounded-full">{p.pool_code}</span>
                      <h3 className="font-bold text-[#153D2B] mt-2">{p.title}</h3>
                      <p className="text-xs text-stone-500">{p.destination_market}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.status === 'forming' ? 'bg-[#E7B85C]/30 text-[#202820]' : 'bg-[#C7F36B]/40 text-[#153D2B]'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                      <span>{p.current_pooled_kg.toLocaleString('en-IN')} kg pooled</span>
                      <span>{p.target_capacity_kg.toLocaleString('en-IN')} kg target</span>
                    </div>
                    <div className="h-2.5 bg-[#DCE8D7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C7F36B] rounded-full transition-all duration-1000"
                        style={{ width: poolSection.visible ? `${Math.min(100, (p.current_pooled_kg / p.target_capacity_kg) * 100)}%` : '0%' }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.participants.length} farmers</span>
                    <span className="text-[#286443] font-bold">Save {p.savings_percentage}% on freight</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TOOLS GRID ── */}
      <section className="py-20 bg-[#153D2B]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className="font-editorial text-4xl font-black text-white mb-12 text-center">Your Farmer Toolkit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calculator, label: 'Profit Calculator', desc: 'Know your net earnings before selling', action: onOpenProfitModal, color: 'from-[#C7F36B]/15 to-[#C7F36B]/5', iconColor: '#C7F36B' },
              { icon: Sparkles, label: 'AI Fair Price', desc: 'Mandi-backed price recommendations', action: onOpenFairPriceModal, color: 'from-[#E7B85C]/15 to-[#E7B85C]/5', iconColor: '#E7B85C' },
              { icon: Layers, label: 'Harvest Pooling', desc: 'Share logistics, cut freight costs', action: () => navigate('/pooling'), color: 'from-[#DCE8D7]/15 to-[#DCE8D7]/5', iconColor: '#DCE8D7' },
              { icon: Zap, label: 'Krishi Voice', desc: 'Ask in your language', action: () => setIsVoiceOpen(true), color: 'from-white/10 to-white/5', iconColor: 'white' },
            ].map(({ icon: Icon, label, desc, action, color, iconColor }) => (
              <button key={label} onClick={action}
                className={`card-hover text-left p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${color} hover:border-white/20 transition-all duration-300`}>
                <Icon className="w-7 h-7 mb-4" style={{ color: iconColor }} />
                <h3 className="font-bold text-white mb-1.5 text-sm">{label}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
