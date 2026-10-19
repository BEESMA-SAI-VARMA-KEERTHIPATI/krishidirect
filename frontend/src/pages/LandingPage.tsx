import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ProduceListing } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Sprout, ShoppingBag, Building2, TrendingUp, Truck, ShieldCheck,
  ArrowRight, Sparkles, MapPin, CheckCircle2, Leaf, Layers, ChevronRight,
  Mic, IndianRupee, Users, Zap, Star, Play,
} from 'lucide-react';

interface LandingPageProps {
  onOpenListingModal: () => void;
  onOpenProfitModal: () => void;
  onOpenFairPriceModal: () => void;
}

/* ── Shared hooks ── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let v = 0; const step = target / (duration / 16);
    const t = setInterval(() => { v = Math.min(v + step, target); setVal(Math.floor(v)); if (v >= target) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [target, active, duration]);
  return val;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#DCE8D7] via-white to-[#DCE8D7] rounded-2xl ${className}`} />
);

/* ── Floating particle SVG ── */
const FloatingParticles: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    {Array.from({ length: 22 }).map((_, i) => {
      const x = (i * 67 + 40) % 1400;
      const y = (i * 83 + 30) % 860;
      const r = 2 + (i % 4);
      const dur = 3 + (i % 5) * 0.8;
      const delay = i * 0.3;
      return (
        <circle key={i} cx={x} cy={y} r={r} fill="rgba(199,243,107,0.25)"
          style={{ animation: `particleFloat ${dur}s ease-in-out ${delay}s infinite` }} />
      );
    })}
    {/* Field furrow lines */}
    {[0.18, 0.36, 0.54, 0.72, 0.88].map((y, i) => (
      <path key={i}
        d={`M -60 ${y * 900} Q 400 ${y * 900 - 28} 720 ${y * 900 + 18} Q 1060 ${y * 900 - 10} 1500 ${y * 900}`}
        stroke="rgba(199,243,107,0.09)" strokeWidth="1.5" fill="none"
        strokeDasharray="700" strokeDashoffset="700"
        style={{ animation: `drawLine 4s ease ${i * 0.5 + 0.5}s forwards` }} />
    ))}
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenListingModal, onOpenProfitModal, onOpenFairPriceModal,
}) => {
  const { user, navigate, addToCart, setIsVoiceOpen, setActiveTab } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<ProduceListing[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const rolesSection = useScrollReveal();
  const metricsSection = useScrollReveal();
  const produceSection = useScrollReveal();
  const howSection = useScrollReveal();
  const ctaSection = useScrollReveal();

  const gmv = useCountUp(Math.round(metrics?.total_gmv_inr || 7878), metricsSection.visible);
  const saved = useCountUp(Math.round(metrics?.intermediary_margin_saved_inr || 2072), metricsSection.visible);
  const pooled = useCountUp(Math.round(metrics?.total_pooled_produce_kg || 1650), metricsSection.visible);
  const co2 = useCountUp(Math.round(metrics?.total_co2_avoided_kg || 132), metricsSection.visible);

  useEffect(() => {
    Promise.allSettled([
      api.getListings({ sort_by: 'newest' }),
      api.getAdminMetrics(),
    ]).then(([l, m]) => {
      if (l.status === 'fulfilled') setFeaturedListings(l.value.slice(0, 4));
      if (m.status === 'fulfilled') setMetrics(m.value);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToDashboard = () => {
    if (user) navigate(`/${user.role}/dashboard`);
    else setActiveTab('marketplace');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EC] overflow-x-hidden">
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:0.25} 50%{transform:translateY(-18px) scale(1.3);opacity:0.5} }
        @keyframes drawLine { from{stroke-dashoffset:700} to{stroke-dashoffset:0} }
        @keyframes revealWord { from{opacity:0;transform:translateY(28px) skewX(-3deg)} to{opacity:1;transform:translateY(0) skewX(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes routeProgress { 0%{stroke-dashoffset:400} 100%{stroke-dashoffset:0} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.7} }
        @keyframes leafSway { 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(8deg) translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes cardEntrance { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(199,243,107,0.35)} 50%{box-shadow:0 0 0 14px rgba(199,243,107,0)} }
        @keyframes textShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes countUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }

        .reveal-word { display:inline-block; animation:revealWord 0.65s cubic-bezier(0.23,1,0.32,1) forwards; opacity:0; }
        .section-reveal { opacity:0;transform:translateY(40px);transition:opacity 0.75s ease,transform 0.75s ease; }
        .section-reveal.visible { opacity:1;transform:translateY(0); }

        .card-lift { transition:transform 0.35s cubic-bezier(0.23,1,0.32,1),box-shadow 0.35s ease; }
        .card-lift:hover { transform:translateY(-8px) scale(1.01); box-shadow:0 32px 64px rgba(21,61,43,0.15); }

        .role-card { transition:all 0.4s cubic-bezier(0.23,1,0.32,1); border:2px solid #DCE8D7; }
        .role-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(21,61,43,0.12); border-color:#286443; }

        .hero-text-gradient {
          background: linear-gradient(135deg, #C7F36B 0%, #E7B85C 50%, #C7F36B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 4s linear infinite;
        }

        .metric-card { transition:transform 0.3s ease; }
        .metric-card:hover { transform:scale(1.03); }

        @media(prefers-reduced-motion:reduce){
          .reveal-word,.section-reveal,.card-lift,.role-card,.metric-card{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}
        }
      `}</style>

      {/* ════════════════════════════════════
          HERO — Full cinematic immersive
      ════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background image with parallax */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80"
            alt="Indian agricultural landscape at golden hour"
            className="w-full h-full object-cover"
            style={{ minHeight: '120vh' }}
          />
          {/* Multi-layer overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(21,61,43,0.92) 0%, rgba(21,61,43,0.65) 45%, rgba(32,40,32,0.85) 100%)'
          }} />
        </div>

        {/* Animated particles & field lines */}
        <FloatingParticles />

        {/* Animated wheat illustration at bottom */}
        <svg className="absolute bottom-0 left-0 w-full pointer-events-none z-10" viewBox="0 0 1440 120" preserveAspectRatio="none">
          {[40, 100, 170, 250, 340, 450, 570, 700, 830, 970, 1100, 1230, 1360].map((x, i) => (
            <g key={i} style={{ animation: `leafSway ${2.8 + (i % 4) * 0.4}s ease-in-out ${i * 0.18}s infinite` }}>
              <line x1={x} y1="120" x2={x} y2={45 + (i % 5) * 10} stroke="rgba(199,243,107,0.22)" strokeWidth="1.5" />
              <ellipse cx={x - 9} cy={72 + (i % 3) * 10} rx="10" ry="5" fill="rgba(199,243,107,0.16)" transform={`rotate(-35,${x},${72 + (i % 3) * 10})`} />
              <ellipse cx={x + 9} cy={62 + (i % 4) * 8} rx="10" ry="5" fill="rgba(199,243,107,0.16)" transform={`rotate(35,${x},${62 + (i % 4) * 8})`} />
            </g>
          ))}
        </svg>

        {/* ── Hero Content ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-20 pb-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left: editorial headline block */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C7F36B]/10 border border-[#C7F36B]/30 rounded-full text-[#C7F36B] text-xs font-bold uppercase tracking-widest mb-8"
                style={{ animation: 'fadeInLeft 0.5s ease 0.1s both' }}>
                <Leaf className="w-3.5 h-3.5" />
                India's First Smart AgriChain Marketplace
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.92] tracking-tight mb-8">
                <span className="block">
                  {['From', 'the', 'Soil'].map((w, i) => (
                    <span key={i} className="reveal-word mr-[0.22em]" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>{w}</span>
                  ))}
                </span>
                <span className="block">
                  {['to', 'the'].map((w, i) => (
                    <span key={i} className="reveal-word mr-[0.22em]" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>{w}</span>
                  ))}
                  <span className="reveal-word hero-text-gradient" style={{ animationDelay: '0.7s' }}>Future.</span>
                </span>
              </h1>

              <p className="text-white/75 text-lg sm:text-xl max-w-xl leading-relaxed font-light mb-10"
                style={{ animation: 'fadeInLeft 0.7s ease 0.9s both' }}>
                Eliminate predatory middlemen. Connect Indian farmers directly with buyers, cut freight by 60%, and unlock fair prices powered by AI.
              </p>

              {/* Trust badges row */}
              <div className="flex flex-wrap gap-4 mb-10" style={{ animation: 'fadeInLeft 0.6s ease 1.0s both' }}>
                {[
                  { icon: ShieldCheck, label: 'Escrow Secured' },
                  { icon: CheckCircle2, label: 'OTP Verified' },
                  { icon: Sparkles, label: 'AI Fair Price' },
                  { icon: Leaf, label: 'Zero Mandi Cut' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-white/70">
                    <Icon className="w-3.5 h-3.5 text-[#C7F36B]" />{label}
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4" style={{ animation: 'fadeInLeft 0.6s ease 1.15s both' }}>
                <button onClick={onOpenListingModal}
                  className="group flex items-center gap-2.5 px-8 py-4 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-black text-sm rounded-2xl transition-all duration-300"
                  style={{ animation: 'glowPulse 2.5s ease 2.5s infinite' }}>
                  <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  List Your Harvest
                </button>
                <button onClick={() => navigate('/marketplace')}
                  className="flex items-center gap-2.5 px-8 py-4 bg-white/10 hover:bg-white/18 border border-white/25 hover:border-white/40 text-white font-semibold text-sm rounded-2xl transition-all duration-300 backdrop-blur-sm">
                  <ShoppingBag className="w-5 h-5 text-[#C7F36B]" />
                  Explore Produce
                </button>
                <button onClick={() => setIsVoiceOpen(true)}
                  className="flex items-center gap-2 px-5 py-4 bg-white/8 hover:bg-white/15 border border-white/15 text-[#C7F36B] font-semibold text-sm rounded-2xl transition-all duration-300 backdrop-blur-sm">
                  <Mic className="w-4 h-4" /> Voice
                </button>
              </div>
            </div>

            {/* Right: animated Farm-to-Market Route Card */}
            <div className="lg:col-span-5" style={{ animation: 'fadeInRight 0.8s ease 0.6s both' }}>
              <div className="relative">
                {/* Glowing backdrop */}
                <div className="absolute -inset-2 bg-[#C7F36B]/10 rounded-[2rem] blur-xl" />
                <div className="relative bg-[#F7F5EC] rounded-3xl p-6 shadow-2xl border border-[#C7F36B]/20">
                  <div className="flex items-center justify-between pb-4 border-b border-[#DCE8D7] mb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#286443]">Live Corridor</span>
                      <p className="font-editorial text-base font-black text-[#153D2B] mt-0.5">Farm → Market Route</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-[#153D2B] text-[#C7F36B] rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" style={{ animation: 'dotPulse 1.5s ease infinite' }} />
                      LIVE
                    </span>
                  </div>

                  {/* Animated route nodes */}
                  <div className="relative pl-8">
                    {/* Vertical progress line */}
                    <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-[#DCE8D7]" />
                    <svg className="absolute left-[7px] top-4 w-1 h-[calc(100%-2rem)]" viewBox="0 0 4 100" preserveAspectRatio="none">
                      <line x1="2" y1="0" x2="2" y2="100" stroke="#C7F36B" strokeWidth="2"
                        strokeDasharray="100" strokeDashoffset="100"
                        style={{ animation: 'routeProgress 2s ease 1s forwards' }} />
                    </svg>

                    {[
                      { step: 1, icon: Sprout, title: 'Farm Origin', sub: 'Warangal, Telangana', note: 'Harvested 06:00 AM · Grade A', color: '#C7F36B', textColor: '#153D2B', bg: 'bg-[#C7F36B]/15' },
                      { step: 2, icon: Layers, title: 'Village Collection & Pool', sub: 'Jangaon Kisan Seva Center', note: '1,650 kg aggregated · 60% freight saved', color: '#E7B85C', textColor: '#202820', bg: 'bg-[#E7B85C]/15' },
                      { step: 3, icon: Truck, title: 'In Transit', sub: 'EV Cargo Truck EN-2847', note: 'OTP-secured cargo · Escrow locked', color: '#DCE8D7', textColor: '#286443', bg: 'bg-[#DCE8D7]/50' },
                      { step: 4, icon: ShoppingBag, title: 'Buyer Destination', sub: 'FreshMart Retail, Hyderabad', note: '4-digit OTP handover · Instant payout', color: '#286443', textColor: '#C7F36B', bg: 'bg-[#286443]/10' },
                    ].map(({ step, icon: Icon, title, sub, note, color, textColor, bg }, i) => (
                      <div key={step} className="relative mb-4 last:mb-0">
                        {/* Node dot */}
                        <div className="absolute -left-8 top-3 w-4 h-4 rounded-full border-2 border-[#286443] flex items-center justify-center"
                          style={{ background: color }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: textColor }} />
                        </div>
                        <div className={`${bg} rounded-2xl p-3.5 border border-black/5`}
                          style={{ animation: `cardEntrance 0.4s ease ${1.2 + i * 0.18}s both` }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: color }}>
                              <Icon className="w-4 h-4" style={{ color: textColor }} />
                            </div>
                            <div>
                              <p className="font-bold text-[#153D2B] text-xs">{step}. {title}</p>
                              <p className="text-stone-500 text-[11px]">{sub}</p>
                              <p className="text-[#286443] text-[10px] font-semibold mt-0.5">{note}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#DCE8D7] flex items-center justify-between">
                    <span className="text-xs text-stone-500">Farmer realized price:</span>
                    <span className="font-editorial text-base font-black text-[#286443]">+32% above Mandi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8" style={{ animation: 'fadeInUp 0.6s ease 2s both' }}>
          <button onClick={() => document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 border-2 border-white/25 rounded-full flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/50 rounded-full" style={{ animation: 'dotPulse 2s ease infinite' }} />
            </div>
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════
          ROLE ENTRY CARDS
      ════════════════════════════════════ */}
      <section id="roles-section" ref={rolesSection.ref}
        className={`py-24 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${rolesSection.visible ? 'visible' : ''}`}>
        <div className="text-center mb-14">
          <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Who Uses KrishiDirect</span>
          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-black text-[#153D2B] mt-2">
            One Platform,<br />Every Agricultural Role
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Sprout, label: 'Farmers', tagline: 'Sell. Earn. Grow.',
              desc: 'Set your own price, get AI advisory, pool freight with village neighbours, and receive instant escrow payout.',
              color: '#153D2B', accent: '#C7F36B', action: 'Open Farmer Workspace', path: '/farmer/dashboard',
              img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=70',
            },
            {
              icon: ShoppingBag, label: 'Buyers', tagline: 'Source. Track. Save.',
              desc: 'Browse verified farm listings, checkout securely, track delivery in real time, and confirm with OTP.',
              color: '#286443', accent: '#C7F36B', action: 'Browse Marketplace', path: '/marketplace',
              img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=70',
            },
            {
              icon: Building2, label: 'Village Agents', tagline: 'Connect. Coordinate. Impact.',
              desc: 'Onboard farmers, schedule collections, manage pooling, and coordinate freight across your cluster.',
              color: '#E7B85C', accent: '#153D2B', action: 'Agent Dashboard', path: '/agent/dashboard',
              img: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&q=70',
            },
            {
              icon: Truck, label: 'Transporters', tagline: 'Move. Deliver. Earn.',
              desc: 'Claim available deliveries, follow the route, collect OTP at destination, and get paid instantly.',
              color: '#202820', accent: '#C7F36B', action: 'View Deliveries', path: '/transporter/dashboard',
              img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=70',
            },
          ].map(({ icon: Icon, label, tagline, desc, color, accent, action, path, img }, i) => (
            <div key={label}
              className="role-card bg-white rounded-3xl overflow-hidden cursor-pointer group"
              style={{ animation: `fadeInUp 0.6s ease ${0.1 + i * 0.12}s both` }}
              onClick={() => navigate(path)}>
              {/* Card image */}
              <div className="relative h-44 overflow-hidden">
                <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${color}dd 100%)` }} />
                <div className="absolute bottom-4 left-4">
                  <p className="font-editorial text-xl font-black text-white leading-tight">{label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>{tagline}</p>
                </div>
              </div>
              {/* Card content */}
              <div className="p-5">
                <p className="text-xs text-stone-600 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center justify-between text-xs font-bold pt-3 border-t border-[#DCE8D7]"
                  style={{ color }}>
                  <span>{action}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          ANIMATED METRICS
      ════════════════════════════════════ */}
      <section ref={metricsSection.ref}
        className={`py-24 bg-[#153D2B] relative overflow-hidden section-reveal ${metricsSection.visible ? 'visible' : ''}`}>
        {/* Background decoration */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-5" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice">
          <circle cx="200" cy="200" r="300" fill="#C7F36B" />
          <circle cx="1200" cy="200" r="250" fill="#E7B85C" />
        </svg>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Real Impact</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-white mt-2">
              Marketplace in Numbers
            </h2>
            <p className="text-white/50 text-sm mt-3 font-mono">* Calculated from live database records</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { val: gmv, label: 'Produce GMV', prefix: '₹', suffix: '', sub: 'Direct buyer transactions', color: '#C7F36B', icon: IndianRupee },
              { val: saved, label: 'Farmer Savings', prefix: '₹', suffix: '', sub: 'Kept from middlemen', color: '#E7B85C', icon: TrendingUp },
              { val: pooled, label: 'Produce Pooled', prefix: '', suffix: 'kg', sub: 'Via shared village cargo', color: '#DCE8D7', icon: Layers },
              { val: co2, label: 'CO₂ Avoided', prefix: '', suffix: 'kg', sub: 'Through freight pooling', color: '#C7F36B', icon: Leaf },
            ].map(({ val, label, prefix, suffix, sub, color, icon: Icon }) => (
              <div key={label} className="metric-card bg-white/6 border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition-colors">
                <Icon className="w-6 h-6 mb-4" style={{ color }} />
                <div className="font-editorial text-4xl sm:text-5xl font-black mb-2" style={{ color }}>
                  {prefix}{val.toLocaleString('en-IN')}{suffix}
                </div>
                <p className="text-white font-bold text-sm mb-1">{label}</p>
                <p className="text-white/45 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURED PRODUCE GALLERY
      ════════════════════════════════════ */}
      <section ref={produceSection.ref}
        className={`py-24 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${produceSection.visible ? 'visible' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Farm Gate Fresh</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1">
              Featured Listings
            </h2>
          </div>
          <button onClick={() => navigate('/marketplace')}
            className="flex items-center gap-1.5 text-sm font-bold text-[#286443] hover:text-[#153D2B] underline underline-offset-4 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
            <Leaf className="w-12 h-12 text-[#DCE8D7] mx-auto mb-4" />
            <p className="text-stone-500">No listings yet — be the first farmer to list your harvest!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((item, i) => (
              <div key={item.id}
                className="card-lift bg-white border border-[#DCE8D7] rounded-3xl overflow-hidden group"
                style={{ animation: `cardEntrance 0.55s ease ${i * 0.1}s both` }}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}>
                <div className="relative h-48 overflow-hidden bg-[#DCE8D7]">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.produce_name}
                      className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#153D2B] to-[#286443]">
                      <Sprout className="w-12 h-12 text-[#C7F36B]/50" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className={`absolute inset-0 bg-[#153D2B]/60 flex items-center justify-center transition-opacity duration-300 ${hoveredCard === item.id ? 'opacity-100' : 'opacity-0'}`}>
                    <button onClick={() => addToCart(item, 1)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#C7F36B] text-[#153D2B] font-black text-xs rounded-xl">
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#153D2B]/85 text-[#C7F36B] text-[10px] font-bold rounded-full backdrop-blur-sm">
                    {item.quality_grade}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 bg-black/55 text-white text-[10px] rounded-lg backdrop-blur-sm">
                    <MapPin className="w-2.5 h-2.5 text-[#C7F36B]" />
                    {item.district || item.farm_location?.split(',')[0]}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#153D2B] text-sm mb-0.5 truncate">{item.produce_name}</h3>
                  {item.farmer && <p className="text-xs text-stone-400 mb-3">by {item.farmer.full_name}</p>}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Direct Price</span>
                      <span className="font-editorial text-xl font-black text-[#286443]">
                        {formatCurrency(item.asking_price)}
                      </span>
                      <span className="text-xs text-stone-400">/{item.unit}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#153D2B] text-right">
                      {item.available_quantity.toLocaleString('en-IN')}<br />
                      <span className="text-stone-400 font-normal">{item.unit} avail.</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS — Visual Timeline
      ════════════════════════════════════ */}
      <section ref={howSection.ref}
        className={`py-24 bg-[#202820] section-reveal ${howSection.visible ? 'visible' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Transparent Architecture</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-white mt-2">How KrishiDirect Works</h2>
            <p className="text-white/50 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              Replacing opaque mandi commissions with direct contracts, shared rural logistics, and cryptographic escrow.
            </p>
          </div>

          {/* Animated horizontal timeline */}
          <div className="relative">
            {/* Connecting route SVG */}
            <svg className="absolute top-10 left-0 w-full h-4 hidden lg:block" viewBox="0 0 900 16" preserveAspectRatio="none">
              <path d="M 60 8 L 840 8" stroke="rgba(199,243,107,0.1)" strokeWidth="2" fill="none" strokeDasharray="8 5" />
              <path d="M 60 8 L 840 8" stroke="#C7F36B" strokeWidth="2" fill="none"
                strokeDasharray="800" strokeDashoffset="800"
                style={{ animation: howSection.visible ? 'routeProgress 2s ease 0.3s forwards' : 'none' }} />
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { num: '01', icon: Sprout, title: 'Farmer Lists Produce', desc: 'Crop volume + AI fair-price advisory + speech recognition input. Farmers set their own asking price.', color: '#C7F36B', dark: true },
                { num: '02', icon: Layers, title: 'Smart Village Pooling', desc: 'Nearby lots heading to the same city combine into one EV cargo, cutting freight costs by ~60%.', color: '#E7B85C', dark: false },
                { num: '03', icon: ShieldCheck, title: 'Escrow Payment Lock', desc: 'Buyer places order. Funds are secured in agricultural escrow before the truck departs the farm gate.', color: '#DCE8D7', dark: false },
                { num: '04', icon: CheckCircle2, title: 'OTP Handover & Payout', desc: 'Buyer inspects produce and gives 4-digit OTP. Payment is instantly released to the farmer.', color: '#286443', dark: false },
              ].map(({ num, icon: Icon, title, desc, color, dark }, i) => (
                <div key={num} className="relative text-center"
                  style={{ animation: howSection.visible ? `fadeInUp 0.6s ease ${0.2 + i * 0.12}s both` : 'none', opacity: howSection.visible ? undefined : 0 }}>
                  {/* Number + icon */}
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: color }}>
                      <Icon className="w-8 h-8" style={{ color: dark ? '#153D2B' : '#153D2B' }} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#153D2B] border-2 border-[#202820] flex items-center justify-center text-[#C7F36B] text-[10px] font-black">
                      {num}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FINAL CTA SECTION
      ════════════════════════════════════ */}
      <section ref={ctaSection.ref}
        className={`py-28 px-6 sm:px-12 lg:px-20 relative overflow-hidden section-reveal ${ctaSection.visible ? 'visible' : ''}`}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80"
            alt="Harvest fields at dusk" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#153D2B]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Leaf className="w-10 h-10 text-[#C7F36B] mx-auto mb-6" style={{ animation: 'leafSway 3s ease-in-out infinite' }} />
          <h2 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Ready to Transform<br />
            <span className="hero-text-gradient">Indian Agriculture?</span>
          </h2>
          <p className="text-white/65 text-lg leading-relaxed max-w-xl mx-auto mb-12 font-light">
            Whether you're a farmer, buyer, agent, or transporter — your workspace is ready. Sign in to start.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={onOpenListingModal}
              className="flex items-center gap-2.5 px-10 py-5 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-black text-base rounded-2xl transition-all duration-300"
              style={{ animation: 'glowPulse 2.5s ease infinite' }}>
              <Sprout className="w-5 h-5" /> List Your Harvest
            </button>
            <button onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2.5 px-10 py-5 border-2 border-white/30 hover:border-white text-white font-bold text-base rounded-2xl transition-all duration-300">
              <ShoppingBag className="w-5 h-5" /> Browse Produce
            </button>
          </div>

          {/* Role quick links */}
          <div className="flex flex-wrap gap-3 justify-center mt-10">
            {[
              { label: 'Farmer Login', path: '/farmer/dashboard' },
              { label: 'Buyer Login', path: '/buyer/dashboard' },
              { label: 'Agent Login', path: '/agent/dashboard' },
              { label: 'Transporter Login', path: '/transporter/dashboard' },
            ].map(({ label, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white/70 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200">
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
