import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ProduceListing, Order } from '../types';
import {
  Search, ShoppingCart, Heart, Star, MapPin, Truck, ArrowRight,
  Package, CheckCircle2, Clock, Leaf, Filter, ChevronRight, Zap, RefreshCw
} from 'lucide-react';

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let v = 0; const step = target / 60;
    const t = setInterval(() => { v = Math.min(v + step, target); setVal(Math.floor(v)); if (v >= target) clearInterval(t); }, 20);
    return () => clearInterval(t);
  }, [target, active]);
  return val;
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
];

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#DCE8D7] via-white to-[#DCE8D7] rounded-2xl ${className}`} />
);

export const BuyerLandingPage: React.FC = () => {
  const { user, navigate, cart, addToCart, setIsCartOpen } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [heroImg, setHeroImg] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);

  const galleryRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const journeyRef = useScrollReveal();
  const ordersRef = useScrollReveal();

  const listingCount = useCountUp(listings.length, statsRef.visible);
  const farmerCount = useCountUp(new Set(listings.map(l => l.farmer_id)).size, statsRef.visible);

  const placeholders = ['Search tomatoes...', 'Search mangoes...', 'Search spinach...', 'Search onions...'];

  useEffect(() => {
    const t = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % placeholders.length), 2500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [l, o] = await Promise.allSettled([api.getListings({ status: 'active' }), api.getOrders()]);
        if (l.status === 'fulfilled') setListings(l.value);
        if (o.status === 'fulfilled') setOrders(o.value);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = listings.filter(l => {
    const matchCat = activeCategory === 'All' || l.category?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = !search || l.produce_name.toLowerCase().includes(search.toLowerCase()) || l.farm_location?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = async (l: ProduceListing) => {
    setAddingId(l.id);
    addToCart(l, 1);
    await new Promise(r => setTimeout(r, 600));
    setAddingId(null);
  };

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F5EC] overflow-x-hidden">
      <style>{`
        @keyframes fadeInRight { from{opacity:0;transform:translateX(48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeInLeft { from{opacity:0;transform:translateX(-48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes imgCrossfade { 0%{opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0} }
        @keyframes drawRoute { from{stroke-dashoffset:500} to{stroke-dashoffset:0} }
        @keyframes dotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
        @keyframes revealWord { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .reveal-word { display:inline-block; animation:revealWord 0.55s ease forwards; opacity:0; }
        .section-reveal { opacity:0;transform:translateY(36px);transition:opacity 0.7s ease,transform 0.7s ease; }
        .section-reveal.visible { opacity:1;transform:translateY(0); }
        .card-lift { transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .card-lift:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(21,61,43,0.13); }
        .pill-btn { transition:all 0.2s ease; }
        .pill-btn.active, .pill-btn:hover { background:#153D2B; color:#C7F36B; }
        @media(prefers-reduced-motion:reduce){.reveal-word,.section-reveal,.card-lift{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}}
      `}</style>

      {/* ── HERO — Asymmetric Split ── */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left: editorial text */}
        <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-24 lg:py-0 bg-[#F7F5EC] order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DCE8D7] rounded-full text-[#286443] text-xs font-bold uppercase tracking-widest mb-8"
            style={{ animation: 'fadeInLeft 0.5s ease 0.1s both' }}>
            <Leaf className="w-3 h-3" /> Farm-Fresh. Zero Middlemen.
          </div>
          <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-black text-[#153D2B] leading-[0.92] tracking-tight mb-6">
            {['Discover', 'Freshness.', 'Buy', 'Direct.'].map((w, i) => (
              <span key={i} className="reveal-word mr-[0.2em] block sm:inline" style={{ animationDelay: `${0.25 + i * 0.13}s` }}>{w}</span>
            ))}
          </h1>
          <p className="text-[#202820]/70 text-lg max-w-md leading-relaxed mb-10 font-light"
            style={{ animation: 'fadeInLeft 0.6s ease 0.8s both' }}>
            Fresh produce straight from Indian farms. Verified quality, fair prices, and delivery to your door.
          </p>
          {/* Animated search bar */}
          <div className="relative mb-8 max-w-md" style={{ animation: 'fadeInLeft 0.6s ease 1.0s both' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#286443]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={placeholders[placeholderIdx]}
              className="w-full pl-11 pr-4 py-4 bg-white border-2 border-[#DCE8D7] focus:border-[#286443] rounded-2xl text-sm text-[#202820] placeholder:text-stone-400 outline-none transition-all duration-300 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3" style={{ animation: 'fadeInLeft 0.6s ease 1.15s both' }}>
            <button onClick={() => document.getElementById('produce-gallery')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] font-bold text-sm rounded-2xl transition-all duration-300">
              <Package className="w-4 h-4" /> Explore Fresh Produce
            </button>
            <button onClick={() => document.getElementById('harvest-rescue')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-[#E7B85C] hover:bg-[#d4a649] text-[#202820] font-bold text-sm rounded-2xl transition-all duration-300">
              <Zap className="w-4 h-4" /> Harvest Rescue Deals
            </button>
            {totalCartItems > 0 && (
              <button onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 border-2 border-[#153D2B] text-[#153D2B] font-bold text-sm rounded-2xl hover:bg-[#153D2B] hover:text-[#C7F36B] transition-all duration-300">
                <ShoppingCart className="w-4 h-4" />
                Cart ({totalCartItems})
              </button>
            )}
          </div>
        </div>

        {/* Right: image collage */}
        <div className="relative order-1 lg:order-2 h-72 sm:h-96 lg:h-full overflow-hidden">
          <div className="absolute inset-0 grid grid-rows-3 gap-1.5 p-2 bg-[#153D2B]">
            {HERO_IMAGES.map((src, i) => (
              <div key={src} className="relative overflow-hidden rounded-2xl">
                <img src={src} alt="Fresh produce" className="w-full h-full object-cover"
                  style={{ animation: `fadeInRight 0.8s ease ${0.3 + i * 0.15}s both`, filter: heroImg === i ? 'brightness(1.05)' : 'brightness(0.85)', transition: 'filter 1s ease' }} />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-4 bg-[#F7F5EC]/90 backdrop-blur-sm px-4 py-2.5 rounded-xl text-xs font-bold text-[#153D2B] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#286443]" /> Quality Verified Produce
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <div ref={statsRef.ref}
        className={`bg-[#153D2B] py-8 section-reveal ${statsRef.visible ? 'visible' : ''}`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: listingCount, label: 'Fresh Listings', suffix: '+' },
            { val: farmerCount, label: 'Verified Farms', suffix: '+' },
            { val: 0, label: 'States Covered', suffix: '', rawVal: '12+' },
            { val: 0, label: 'Avg Savings', suffix: '', rawVal: '18%' },
          ].map(({ val, label, suffix, rawVal }) => (
            <div key={label}>
              <div className="font-editorial text-3xl sm:text-4xl font-black text-[#C7F36B]">{rawVal || `${val}${suffix}`}</div>
              <div className="text-white/60 text-xs mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCE GALLERY ── */}
      <section id="produce-gallery" ref={galleryRef.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${galleryRef.visible ? 'visible' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">From Indian Farms</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1">Fresh Produce</h2>
          </div>
          {totalCartItems > 0 && (
            <button onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#153D2B] text-[#C7F36B] rounded-xl font-bold text-sm hover:bg-[#286443] transition-colors">
              <ShoppingCart className="w-4 h-4" /> View Cart ({totalCartItems})
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`pill-btn px-4 py-2 rounded-full text-xs font-bold border border-[#DCE8D7] bg-white text-[#153D2B] ${activeCategory === cat ? 'active' : ''}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
            <Search className="w-10 h-10 text-[#DCE8D7] mx-auto mb-3" />
            <p className="text-stone-500 text-sm">{search ? `No produce matching "${search}"` : 'No active listings at the moment.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((l, i) => (
              <div key={l.id} className="card-lift bg-white border border-[#DCE8D7] rounded-3xl overflow-hidden group"
                style={{ animation: `fadeInUp 0.5s ease ${(i % 8) * 0.06}s both` }}>
                <div className="relative h-48 overflow-hidden">
                  {l.image_url
                    ? <img src={l.image_url} alt={l.produce_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#153D2B] to-[#286443]">
                        <Leaf className="w-12 h-12 text-[#C7F36B]/50" />
                      </div>}
                  <button onClick={() => setFavorites(f => { const n = new Set(f); n.has(l.id) ? n.delete(l.id) : n.add(l.id); return n; })}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow transition-colors">
                    <Heart className={`w-4 h-4 ${favorites.has(l.id) ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
                  </button>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#C7F36B] text-[#153D2B] text-[10px] font-bold rounded-full">
                    {l.quality_grade}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#153D2B] text-sm mb-0.5 truncate">{l.produce_name}</h3>
                  {l.farmer && <p className="text-xs text-stone-400 mb-2">by {l.farmer.full_name}</p>}
                  <div className="flex items-center gap-1 text-xs text-stone-400 mb-3">
                    <MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{l.farm_location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-[#153D2B] text-xl">₹{l.asking_price}<span className="text-xs font-normal text-stone-400">/{l.unit}</span></span>
                    <span className="text-xs text-stone-400">{l.available_quantity} {l.unit} avail.</span>
                  </div>
                  <button onClick={() => handleAddToCart(l)} disabled={addingId === l.id}
                    className="w-full py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                    {addingId === l.id
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                      : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── HARVEST RESCUE ── */}
      <section id="harvest-rescue" className="py-20 bg-[#202820]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E7B85C]/15 border border-[#E7B85C]/30 rounded-full text-[#E7B85C] text-xs font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> Harvest Rescue
              </div>
              <h2 className="font-editorial text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Great Produce.<br />Exceptional Deals.
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 font-light">
                Farmers with surplus or time-sensitive harvests offer steep discounts. Same quality, lower price — good for you, great for farmers.
              </p>
              {listings.filter(l => l.asking_price < 30).slice(0, 3).map(l => (
                <div key={l.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl mb-3 hover:bg-white/8 transition-colors cursor-pointer"
                  onClick={() => handleAddToCart(l)}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#153D2B]">
                    {l.image_url ? <img src={l.image_url} alt={l.produce_name} className="w-full h-full object-cover" /> : <Leaf className="w-6 h-6 m-3 text-[#C7F36B]/50" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{l.produce_name}</p>
                    <p className="text-white/50 text-xs">{l.available_quantity} {l.unit} available</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#E7B85C] font-black">₹{l.asking_price}/{l.unit}</p>
                    <ShoppingCart className="w-3.5 h-3.5 text-white/40 ml-auto mt-1" />
                  </div>
                </div>
              ))}
              {listings.filter(l => l.asking_price < 30).length === 0 && (
                <div className="p-6 border border-white/10 rounded-2xl text-white/40 text-sm text-center">
                  No rescue listings at the moment — check back soon.
                </div>
              )}
            </div>
            <div className="relative h-80 lg:h-full overflow-hidden rounded-3xl">
              <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80"
                alt="Fresh farm produce" className="w-full h-full object-cover" style={{ minHeight: '360px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#202820]/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-editorial text-2xl font-black">Directly From Farmers</p>
                <p className="text-xs text-white/60 mt-1">No storage losses. No middleman markup.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DELIVERY JOURNEY ── */}
      <section ref={journeyRef.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto section-reveal ${journeyRef.visible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">How It Works</span>
          <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-2">Farm to Your Door</h2>
        </div>
        <div className="relative">
          {/* Animated route line */}
          <svg className="absolute top-8 left-0 w-full h-4 hidden sm:block" viewBox="0 0 800 16" preserveAspectRatio="none">
            <path d="M 40 8 L 760 8" stroke="#DCE8D7" strokeWidth="2" fill="none" strokeDasharray="6 4" />
            <path d="M 40 8 L 760 8" stroke="#286443" strokeWidth="2" fill="none"
              strokeDasharray="500" strokeDashoffset="500"
              style={{ animation: journeyRef.visible ? 'drawRoute 2s ease 0.3s forwards' : 'none' }} />
          </svg>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
            {[
              { icon: Leaf, step: '01', title: 'Farmer Lists', desc: 'Verified produce listed with quality grades', color: '#153D2B' },
              { icon: Package, step: '02', title: 'You Order', desc: 'Browse, choose, checkout securely', color: '#286443' },
              { icon: Truck, step: '03', title: 'Transporter Picks Up', desc: 'OTP-secured fresh produce collection', color: '#E7B85C' },
              { icon: CheckCircle2, step: '04', title: 'Delivered Fresh', desc: 'Inspect before confirming — escrow protection', color: '#C7F36B' },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <div key={step} className="text-center"
                style={{ animation: journeyRef.visible ? `fadeInUp 0.5s ease ${0.2 + i * 0.12}s both` : 'none', opacity: journeyRef.visible ? undefined : 0 }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
                  style={{ background: color }}>
                  <Icon className="w-7 h-7" style={{ color: color === '#E7B85C' || color === '#C7F36B' ? '#153D2B' : '#C7F36B' }} />
                </div>
                <div className="text-xs font-mono text-stone-400 mb-1">{step}</div>
                <h3 className="font-bold text-[#153D2B] text-sm mb-1">{title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MY ORDERS ── */}
      {orders.length > 0 && (
        <section ref={ordersRef.ref}
          className={`py-20 bg-[#153D2B] section-reveal ${ordersRef.visible ? 'visible' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Your Purchases</span>
                <h2 className="font-editorial text-4xl font-black text-white mt-1">Recent Orders</h2>
              </div>
              <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-[#C7F36B] text-sm font-bold hover:underline">
                All Orders <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 4).map(o => (
                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white/8 border border-white/10 rounded-2xl hover:bg-white/12 transition-colors">
                  <div>
                    <p className="text-white font-bold text-sm">{o.produce_name}</p>
                    <p className="text-white/50 text-xs mt-0.5">{o.order_number} · {o.quantity} {o.unit} · ₹{o.total_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    o.status === 'delivered' || o.status === 'completed' ? 'bg-[#C7F36B] text-[#153D2B]' :
                    o.status === 'in_transit' ? 'bg-blue-400/20 text-blue-300' :
                    'bg-[#E7B85C]/30 text-[#E7B85C]'}`}>
                    {o.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
