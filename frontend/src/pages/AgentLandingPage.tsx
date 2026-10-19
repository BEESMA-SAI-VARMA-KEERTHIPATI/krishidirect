import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { HarvestPool } from '../types';
import {
  Users, MapPin, Calendar, ArrowRight, Truck, Package, Plus,
  CheckCircle2, Clock, Layers, Network, ChevronRight, Leaf, Building2
} from 'lucide-react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#DCE8D7] via-white to-[#DCE8D7] rounded-2xl ${className}`} />
);

export const AgentLandingPage: React.FC = () => {
  const { user, navigate } = useAuth();
  const [pools, setPools] = useState<HarvestPool[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const networkRef = useScrollReveal();
  const poolsRef = useScrollReveal();
  const scheduleRef = useScrollReveal();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, l] = await Promise.allSettled([api.getPools(), api.getListings({ status: 'active' })]);
        if (p.status === 'fulfilled') setPools(p.value);
        if (l.status === 'fulfilled') setAllListings(l.value);
      } finally { setLoading(false); }
    })();
  }, []);

  const upcomingPools = pools.filter(p => ['forming', 'matched', 'scheduled'].includes(p.status));
  const uniqueVillages = [...new Set(pools.flatMap(p => p.participants.map(pt => pt.village)))];
  const totalFarmers = new Set(pools.flatMap(p => p.participants.map(pt => pt.farmer_id))).size;

  return (
    <div className="min-h-screen bg-[#F7F5EC] overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInLeft { from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeInRight { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
        @keyframes flowLine { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
        @keyframes nodePulse { 0%,100%{r:6;opacity:0.8} 50%{r:9;opacity:1} }
        @keyframes revealWord { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fillBar { from{width:0%} to{width:var(--fill-width)} }
        .reveal-word { display:inline-block;animation:revealWord 0.55s ease forwards;opacity:0; }
        .section-reveal { opacity:0;transform:translateY(36px);transition:opacity 0.7s ease,transform 0.7s ease; }
        .section-reveal.visible { opacity:1;transform:translateY(0); }
        .card-hover { transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .card-hover:hover { transform:translateY(-4px);box-shadow:0 16px 32px rgba(21,61,43,0.1); }
        @media(prefers-reduced-motion:reduce){.reveal-word,.section-reveal,.card-hover{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}}
      `}</style>

      {/* ── HERO — Split with village photo ── */}
      <section className="relative overflow-hidden">
        {/* Top half: village photograph */}
        <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1920&q=80"
            alt="Village collection center" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(21,61,43,0.4) 0%, rgba(21,61,43,0.75) 100%)' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C7F36B]/15 border border-[#C7F36B]/30 rounded-full text-[#C7F36B] text-xs font-bold uppercase tracking-widest mb-6"
              style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
              <Network className="w-3 h-3" /> Village Agent Workspace
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
              {['Stronger', 'Villages.', 'Smarter', 'Markets.'].map((w, i) => (
                <span key={i} className="reveal-word mr-[0.25em]" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>{w}</span>
              ))}
            </h1>
            <p className="text-white/80 max-w-lg text-base sm:text-lg font-light mb-8"
              style={{ animation: 'fadeInUp 0.6s ease 0.8s both' }}>
              Your coordination connects hundreds of farmers to fair markets. Every collection you manage creates lasting impact.
            </p>
            <div className="flex flex-wrap gap-3 justify-center" style={{ animation: 'fadeInUp 0.6s ease 1.0s both' }}>
              <button onClick={() => document.getElementById('pools-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-7 py-3.5 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-bold text-sm rounded-2xl transition-all">
                <Layers className="w-4 h-4" /> Manage Collections
              </button>
              <button onClick={() => navigate('/pooling')}
                className="flex items-center gap-2 px-7 py-3.5 border-2 border-white/40 hover:border-white text-white font-bold text-sm rounded-2xl transition-all backdrop-blur-sm">
                <Plus className="w-4 h-4" /> Assist a Farmer
              </button>
            </div>
          </div>
        </div>

        {/* Bottom half: forest green with animated network */}
        <div className="bg-[#153D2B] py-12 px-6 sm:px-12 lg:px-20">
          {/* Stats row */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { val: totalFarmers, label: 'Farmers in Network', icon: Users },
              { val: uniqueVillages.length, label: 'Villages Covered', icon: MapPin },
              { val: upcomingPools.length, label: 'Active Pools', icon: Layers },
              { val: pools.reduce((s, p) => s + p.current_pooled_kg, 0), label: 'kg Pooled', icon: Package },
            ].map(({ val, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <Icon className="w-5 h-5 text-[#C7F36B] mb-2" />
                <div className="font-editorial text-3xl font-black text-white">{val.toLocaleString('en-IN')}</div>
                <div className="text-white/50 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANIMATED NETWORK DIAGRAM ── */}
      <section ref={networkRef.ref}
        className={`py-20 bg-[#F7F5EC] section-reveal ${networkRef.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Your Role</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-black text-[#153D2B] mt-1 mb-6">
                The Network You Build
              </h2>
              <p className="text-[#202820]/70 leading-relaxed mb-8 font-light">
                As a Village Agent, you're the vital link between scattered smallholder farmers and organized market access. Every pool you create, every farmer you onboard, multiplies impact.
              </p>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Farmer Onboarding', desc: 'Help farmers register and create their first harvest listing', color: '#C7F36B' },
                  { step: '2', title: 'Pool Formation', desc: 'Group compatible harvests to share logistics costs', color: '#E7B85C' },
                  { step: '3', title: 'Collection Scheduling', desc: 'Coordinate pickup dates, times, and meeting points', color: '#DCE8D7' },
                  { step: '4', title: 'Transporter Matching', desc: 'Connect pools to available vehicles for efficient delivery', color: '#286443' },
                ].map(({ step, title, desc, color }) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                      style={{ background: color, color: color === '#286443' ? '#C7F36B' : '#153D2B' }}>
                      {step}
                    </div>
                    <div>
                      <p className="font-bold text-[#153D2B] text-sm">{title}</p>
                      <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Network Illustration */}
            <div className="flex justify-center">
              <svg viewBox="0 0 400 360" className="w-full max-w-sm">
                {/* Farmer nodes */}
                {[[60,60],[40,160],[60,260],[100,310],[80,110]].map(([x,y],i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="18" fill="#DCE8D7" stroke="#286443" strokeWidth="2" />
                    <text x={x} y={y+4} textAnchor="middle" fontSize="10" fill="#153D2B" fontWeight="700">F{i+1}</text>
                    {/* Flow line to center */}
                    <path d={`M ${x+18} ${y} Q 200 ${y} 200 160`} stroke="#286443" strokeWidth="1.5" fill="none"
                      strokeDasharray="200" strokeDashoffset="200"
                      style={{ animation: networkRef.visible ? `flowLine 1.2s ease ${0.2 + i * 0.15}s forwards` : 'none' }} />
                  </g>
                ))}
                {/* Central collection hexagon */}
                <polygon points="200,130 225,145 225,175 200,190 175,175 175,145"
                  fill="#153D2B" stroke="#C7F36B" strokeWidth="3" />
                <text x="200" y="163" textAnchor="middle" fontSize="9" fill="#C7F36B" fontWeight="700">AGENT</text>
                {/* To market */}
                <path d="M 225 160 Q 300 160 340 160" stroke="#E7B85C" strokeWidth="2.5" fill="none"
                  strokeDasharray="200" strokeDashoffset="200"
                  style={{ animation: networkRef.visible ? 'flowLine 1.2s ease 1.1s forwards' : 'none' }} />
                <rect x="340" y="140" width="48" height="40" rx="8" fill="#E7B85C" />
                <text x="364" y="163" textAnchor="middle" fontSize="9" fill="#153D2B" fontWeight="700">MARKET</text>
                {/* Labels */}
                <text x="60" y="340" textAnchor="middle" fontSize="9" fill="#286443">Farmers</text>
                <text x="200" y="210" textAnchor="middle" fontSize="9" fill="#153D2B">Collection Point</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── HARVEST POOLS ── */}
      <section id="pools-section" ref={poolsRef.ref}
        className={`py-20 bg-[#153D2B] section-reveal ${poolsRef.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Logistics</span>
              <h2 className="font-editorial text-4xl font-black text-white mt-1">Active Harvest Pools</h2>
            </div>
            <button onClick={() => navigate('/pooling')}
              className="flex items-center gap-1.5 text-[#C7F36B] text-sm font-bold hover:underline">
              All Pools <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <Skeleton key={i} className="h-52 bg-white/10" />)}
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
              <Layers className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No active pools yet.</p>
              <button onClick={() => navigate('/pooling')}
                className="mt-4 px-5 py-2.5 bg-[#C7F36B] text-[#153D2B] rounded-xl font-bold text-sm hover:bg-[#d4f77c] transition-colors">
                Create First Pool
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pools.slice(0, 6).map((p, i) => {
                const fillPct = Math.min(100, (p.current_pooled_kg / p.target_capacity_kg) * 100);
                return (
                  <div key={p.id} className="card-hover bg-white/8 border border-white/10 rounded-2xl p-5 hover:bg-white/12"
                    style={{ animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-mono text-[#C7F36B] bg-[#C7F36B]/10 px-2 py-0.5 rounded-full">{p.pool_code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'forming' ? 'bg-[#E7B85C]/30 text-[#E7B85C]' : 'bg-[#C7F36B]/20 text-[#C7F36B]'}`}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{p.produce_type}</h3>
                    <p className="text-white/50 text-xs mb-4 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />{p.village_cluster} → {p.destination_market}
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-white/50 mb-1.5">
                        <span>{p.current_pooled_kg.toLocaleString('en-IN')} kg</span>
                        <span>{p.target_capacity_kg.toLocaleString('en-IN')} kg target</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C7F36B] rounded-full transition-all duration-1000"
                          style={{ width: poolsRef.visible ? `${fillPct}%` : '0%' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-3">
                      <span className="text-white/50 flex items-center gap-1"><Users className="w-3 h-3" />{p.participants.length} farmers</span>
                      <span className="text-[#E7B85C] font-bold">Save {p.savings_percentage}%</span>
                    </div>
                    {p.pickup_date && (
                      <div className="flex items-center gap-1.5 text-xs text-white/40 mt-2">
                        <Calendar className="w-3 h-3" />Pickup: {new Date(p.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLECTION SCHEDULE ── */}
      <section ref={scheduleRef.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto section-reveal ${scheduleRef.visible ? 'visible' : ''}`}>
        <span className="text-[#286443] text-xs font-bold uppercase tracking-widest">Timeline</span>
        <h2 className="font-editorial text-4xl font-black text-[#153D2B] mt-1 mb-10">Upcoming Collections</h2>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : upcomingPools.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#DCE8D7] rounded-3xl">
            <Calendar className="w-10 h-10 text-[#DCE8D7] mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No upcoming collections scheduled.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-0">
            {/* Vertical timeline line */}
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#DCE8D7]" />
            {upcomingPools.map((p, i) => (
              <div key={p.id} className="relative pl-8 pb-8 last:pb-0"
                style={{ animation: scheduleRef.visible ? `fadeInLeft 0.5s ease ${i * 0.1}s both` : 'none', opacity: scheduleRef.visible ? undefined : 0 }}>
                {/* Timeline dot */}
                <div className="absolute left-[-5px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-[#286443] bg-[#C7F36B]" />
                <div className="bg-white border border-[#DCE8D7] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-stone-400 mb-0.5">
                        {p.pickup_date ? new Date(p.pickup_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'} · {p.time_window}
                      </p>
                      <h3 className="font-bold text-[#153D2B] text-sm">{p.title}</h3>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{p.collection_point}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-[#153D2B] text-lg">{p.current_pooled_kg.toLocaleString('en-IN')} kg</div>
                      <div className="text-xs text-stone-400">{p.participants.length} farmers</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
