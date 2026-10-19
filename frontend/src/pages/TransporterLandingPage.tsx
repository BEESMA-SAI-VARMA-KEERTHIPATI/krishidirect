import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Order } from '../types';
import {
  Truck, MapPin, Package, CheckCircle2, Clock, ArrowRight,
  AlertCircle, RefreshCw, Shield, ChevronRight, Zap, Navigation
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
  <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
);

const STATUS_STEPS = ['pending', 'confirmed', 'ready_for_pickup', 'in_transit', 'delivered', 'completed'];

export const TransporterLandingPage: React.FC = () => {
  const { user, navigate } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [jobs, setJobs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '']);
  const [otpOrderId, setOtpOrderId] = useState<number | null>(null);
  const [otpResult, setOtpResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [verifying, setVerifying] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const deliveriesRef = useScrollReveal();
  const capacityRef = useScrollReveal();
  const historyRef = useScrollReveal();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, j] = await Promise.allSettled([api.getOrders(), api.getTransporterJobs()]);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (j.status === 'fulfilled') setJobs(j.value);
      } finally { setLoading(false); }
    })();
  }, []);

  const activeDeliveries = orders.filter(o => ['confirmed', 'ready_for_pickup', 'in_transit'].includes(o.status));
  const completedDeliveries = orders.filter(o => ['delivered', 'completed'].includes(o.status));
  const inTransit = orders.filter(o => o.status === 'in_transit');

  const handleOtpInput = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpValues]; next[i] = val.slice(-1);
    setOtpValues(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };

  const handleVerifyOtp = async () => {
    if (!otpOrderId || otpValues.some(v => !v)) return;
    setVerifying(true); setOtpResult('idle');
    try {
      await api.verifyOTP(otpOrderId, otpValues.join(''));
      setOtpResult('success');
      const o = await api.getOrders(); setOrders(o);
    } catch { setOtpResult('error'); }
    setVerifying(false);
  };

  const claimDelivery = async (orderId: number) => {
    try { await api.claimOrderDelivery(orderId); const o = await api.getOrders(); setOrders(o); } catch { }
  };

  const stepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  return (
    <div className="min-h-screen bg-[#202820] overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes routeDraw { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
        @keyframes truckMove { 0%{offset-distance:0%} 100%{offset-distance:100%} }
        @keyframes revealWord { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes successPulse { 0%{transform:scale(0.8);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes dotSlide { 0%{left:2%} 100%{left:calc(100% - 28px)} }
        .reveal-word { display:inline-block;animation:revealWord 0.55s ease forwards;opacity:0; }
        .section-reveal { opacity:0;transform:translateY(36px);transition:opacity 0.7s ease,transform 0.7s ease; }
        .section-reveal.visible { opacity:1;transform:translateY(0); }
        .card-hover { transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .card-hover:hover { transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.3); }
        @media(prefers-reduced-motion:reduce){.reveal-word,.section-reveal,.card-hover{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}}
      `}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80"
            alt="Delivery truck on rural road" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(32,40,32,0.88) 0%, rgba(32,40,32,0.6) 50%, rgba(32,40,32,0.92) 100%)' }} />
        </div>

        {/* Animated route line SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Route path */}
          <path d="M 80 700 C 200 680 400 640 600 620 C 800 600 1000 580 1200 560 L 1380 550"
            stroke="rgba(199,243,107,0.3)" strokeWidth="3" fill="none" strokeDasharray="6 6"
            strokeDashoffset="600"
            style={{ animation: 'routeDraw 4s ease 0.5s forwards' }} />
          {/* Pickup marker */}
          <circle cx="80" cy="700" r="10" fill="#C7F36B" style={{ animation: 'fadeInUp 0.5s ease 1s both' }} />
          <text x="80" y="730" textAnchor="middle" fill="#C7F36B" fontSize="11" fontWeight="700"
            style={{ animation: 'fadeInUp 0.5s ease 1.1s both' }}>PICKUP</text>
          {/* Destination marker */}
          <circle cx="1380" cy="550" r="10" fill="#E7B85C" style={{ animation: 'fadeInUp 0.5s ease 4.5s both' }} />
          <text x="1380" y="530" textAnchor="middle" fill="#E7B85C" fontSize="11" fontWeight="700"
            style={{ animation: 'fadeInUp 0.5s ease 4.6s both' }}>DELIVERY</text>
        </svg>

        <div className="relative z-10 px-6 sm:px-12 lg:px-20 pb-32 pt-32 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C7F36B]/10 border border-[#C7F36B]/25 rounded-full text-[#C7F36B] text-xs font-bold uppercase tracking-widest mb-8"
            style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
            <Truck className="w-3 h-3" /> Transporter Workspace
          </div>
          <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
            {['Move', 'Freshness.', 'Deliver', 'Opportunity.'].map((w, i) => (
              <span key={i} className="reveal-word mr-[0.25em]" style={{ animationDelay: `${0.3 + i * 0.12}s` }}>{w}</span>
            ))}
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-10 font-light"
            style={{ animation: 'fadeInUp 0.6s ease 0.9s both' }}>
            Every delivery you complete connects a farmer's harvest to a family's table. Reliable, verified, and fairly compensated.
          </p>
          <div className="flex flex-wrap gap-4" style={{ animation: 'fadeInUp 0.6s ease 1.1s both' }}>
            <button onClick={() => document.getElementById('deliveries-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-8 py-4 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-bold text-sm rounded-2xl transition-all duration-300">
              <Navigation className="w-4 h-4" /> View Deliveries
            </button>
            <button onClick={() => document.getElementById('otp-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-8 py-4 border-2 border-[#C7F36B]/40 hover:border-[#C7F36B] text-[#C7F36B] font-semibold text-sm rounded-2xl transition-all duration-300 backdrop-blur-sm">
              <Shield className="w-4 h-4" /> Verify OTP
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 w-full bg-[#C7F36B]/8 backdrop-blur-md border-t border-[#C7F36B]/15"
          style={{ animation: 'fadeInUp 0.6s ease 1.3s both' }}>
          <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-white/10">
            {[
              { label: 'Active Deliveries', val: loading ? '—' : activeDeliveries.length, icon: Truck },
              { label: 'In Transit Now', val: loading ? '—' : inTransit.length, icon: Navigation },
              { label: 'Completed', val: loading ? '—' : completedDeliveries.length, icon: CheckCircle2 },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 sm:px-6">
                <Icon className="w-5 h-5 text-[#C7F36B] flex-shrink-0" />
                <div>
                  <div className="text-white font-black text-2xl">{val}</div>
                  <div className="text-white/50 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE DELIVERIES ── */}
      <section id="deliveries-section" ref={deliveriesRef.ref}
        className={`py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto section-reveal ${deliveriesRef.visible ? 'visible' : ''}`}>
        <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Logistics</span>
        <h2 className="font-editorial text-4xl sm:text-5xl font-black text-white mt-1 mb-10">Delivery Manifest</h2>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-36" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <Truck className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No delivery assignments yet.</p>
            {jobs?.available_orders?.length > 0 && (
              <p className="text-[#C7F36B] text-xs mt-2">
                {jobs.available_orders.length} jobs available to claim below.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {orders.slice(0, 6).map((o, i) => {
              const sIdx = stepIndex(o.status);
              return (
                <div key={o.id} className="card-hover bg-white/6 border border-white/10 rounded-2xl p-5 hover:bg-white/9"
                  style={{ animation: `fadeInUp 0.5s ease ${i * 0.07}s both` }}>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[#C7F36B] text-xs">{o.order_number}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          o.status === 'in_transit' ? 'bg-blue-400/20 text-blue-300' :
                          o.status === 'delivered' || o.status === 'completed' ? 'bg-[#C7F36B]/20 text-[#C7F36B]' :
                          'bg-[#E7B85C]/20 text-[#E7B85C]'}`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-white font-bold">{o.produce_name} — {o.quantity} {o.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black text-lg">₹{o.delivery_fee.toLocaleString('en-IN')}</p>
                      <p className="text-white/40 text-xs">delivery fee</p>
                    </div>
                  </div>

                  {/* Route: pickup → delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-[#C7F36B]/8 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-[#C7F36B] flex-shrink-0" />
                      <div>
                        <p className="text-[#C7F36B] text-[10px] font-bold uppercase">Pickup</p>
                        <p className="text-white text-xs truncate">{o.seller?.village || 'Farm location'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center text-white/30">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-[#E7B85C]/8 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-[#E7B85C] flex-shrink-0" />
                      <div>
                        <p className="text-[#E7B85C] text-[10px] font-bold uppercase">Delivery</p>
                        <p className="text-white text-xs truncate">{o.delivery_address?.split(',')[0] || 'Buyer address'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress timeline */}
                  <div className="relative">
                    <div className="flex justify-between mb-1.5">
                      {['Pending', 'Confirmed', 'Ready', 'In Transit', 'Delivered'].map((label, idx) => (
                        <div key={label} className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                            idx <= sIdx - 1 ? 'bg-[#C7F36B] border-[#C7F36B]' :
                            idx === sIdx ? 'bg-[#E7B85C] border-[#E7B85C]' :
                            'bg-transparent border-white/20'}`} />
                        </div>
                      ))}
                    </div>
                    <div className="h-0.5 bg-white/10 rounded-full">
                      <div className="h-full bg-[#C7F36B] rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(0, (sIdx / (STATUS_STEPS.length - 1)) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      {['Pending', 'Confirmed', 'Ready', 'Transit', 'Done'].map(l => (
                        <span key={l} className="text-[8px] text-white/30">{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {o.status === 'ready_for_pickup' && (
                    <div className="mt-3 pt-3 border-t border-white/8">
                      <button onClick={() => { setOtpOrderId(o.id); document.getElementById('otp-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="flex items-center gap-2 text-[#C7F36B] text-xs font-bold hover:underline">
                        <Shield className="w-3.5 h-3.5" /> Verify delivery OTP →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Available jobs */}
        {jobs?.available_orders?.length > 0 && (
          <div className="mt-10">
            <h3 className="font-editorial text-2xl font-bold text-white mb-5">Available Jobs to Claim</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs.available_orders.slice(0, 4).map((j: any) => (
                <div key={j.id} className="card-hover bg-white/5 border border-[#C7F36B]/20 rounded-2xl p-5">
                  <p className="text-white font-bold text-sm mb-1">{j.produce_name}</p>
                  <p className="text-white/50 text-xs mb-3">{j.quantity} {j.unit} · ₹{j.delivery_fee} fee</p>
                  <button onClick={() => claimDelivery(j.id)}
                    className="w-full py-2.5 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-bold text-xs rounded-xl transition-colors">
                    Claim This Delivery
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── CAPACITY ── */}
      <section ref={capacityRef.ref}
        className={`py-20 bg-[#153D2B] section-reveal ${capacityRef.visible ? 'visible' : ''}`}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Vehicle</span>
              <h2 className="font-editorial text-4xl font-black text-white mt-1 mb-6">Capacity Overview</h2>
              <p className="text-white/60 leading-relaxed mb-8 font-light">
                Track how much load you're currently carrying versus your vehicle's capacity. Claim new jobs when you have space.
              </p>
              {[
                { label: 'Current Load', val: activeDeliveries.reduce((s, o) => s + o.quantity, 0), max: 2000, color: '#C7F36B' },
                { label: 'Pending Pickups', val: orders.filter(o => o.status === 'ready_for_pickup').length, max: 10, color: '#E7B85C' },
                { label: 'In Transit', val: inTransit.length, max: 10, color: '#DCE8D7' },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="mb-5">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">{label}</span>
                    <span className="text-white font-bold">{val.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1200"
                      style={{ width: capacityRef.visible ? `${Math.min(100, (val / max) * 100)}%` : '0%', background: color }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Circular capacity SVG */}
            <div className="flex justify-center">
              <svg viewBox="0 0 220 220" className="w-64 h-64">
                <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="20" />
                <circle cx="110" cy="110" r="90" fill="none" stroke="#C7F36B" strokeWidth="20"
                  strokeDasharray={`${2 * Math.PI * 90 * Math.min(1, activeDeliveries.length / 10)} ${2 * Math.PI * 90}`}
                  strokeLinecap="round" transform="rotate(-90 110 110)"
                  style={{ transition: 'stroke-dasharray 1.5s ease' }} />
                <text x="110" y="100" textAnchor="middle" fill="white" fontSize="30" fontWeight="900" fontFamily="Fraunces, serif">
                  {activeDeliveries.length}
                </text>
                <text x="110" y="125" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">Active</text>
                <text x="110" y="143" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">Deliveries</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── OTP VERIFICATION ── */}
      <section id="otp-section" className="py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white/6 border border-[#C7F36B]/20 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#C7F36B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#C7F36B]" />
              </div>
              <h2 className="font-editorial text-3xl font-black text-white mb-2">Delivery OTP</h2>
              <p className="text-white/50 text-sm">Enter the 4-digit code from the buyer to confirm delivery</p>
            </div>

            {/* Order selector */}
            {orders.filter(o => o.status === 'ready_for_pickup' || o.status === 'in_transit').length > 0 && (
              <div className="mb-6">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">Select Order</label>
                <select value={otpOrderId || ''} onChange={e => setOtpOrderId(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white text-sm outline-none focus:border-[#C7F36B] transition-colors">
                  <option value="">— Select delivery —</option>
                  {orders.filter(o => ['ready_for_pickup', 'in_transit'].includes(o.status)).map(o => (
                    <option key={o.id} value={o.id}>{o.order_number} — {o.produce_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* OTP input boxes */}
            <div className="flex gap-3 justify-center mb-6">
              {otpValues.map((v, i) => (
                <input key={i} ref={otpRefs[i]} value={v} onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) otpRefs[i - 1].current?.focus(); }}
                  maxLength={1} inputMode="numeric"
                  className="w-14 h-16 text-center text-2xl font-black text-white bg-white/8 border-2 border-white/15 focus:border-[#C7F36B] rounded-2xl outline-none transition-all duration-200"
                />
              ))}
            </div>

            {otpResult === 'success' && (
              <div className="mb-4 p-3 bg-[#C7F36B]/15 border border-[#C7F36B]/30 rounded-xl flex items-center gap-2 text-[#C7F36B] text-sm"
                style={{ animation: 'successPulse 0.5s ease' }}>
                <CheckCircle2 className="w-4 h-4" /> Delivery confirmed! Payment released.
              </div>
            )}
            {otpResult === 'error' && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" /> Invalid OTP. Please try again.
              </div>
            )}

            <button onClick={handleVerifyOtp}
              disabled={verifying || otpValues.some(v => !v) || !otpOrderId}
              className="w-full py-4 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {verifying ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</> : 'Confirm Delivery'}
            </button>

            {orders.some(o => o.demo_otp_preview) && (
              <p className="text-center text-white/25 text-xs mt-4 font-mono">
                Demo OTP: {orders.find(o => o.demo_otp_preview)?.demo_otp_preview}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── COMPLETED HISTORY ── */}
      {completedDeliveries.length > 0 && (
        <section ref={historyRef.ref}
          className={`py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto section-reveal ${historyRef.visible ? 'visible' : ''}`}>
          <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Track Record</span>
          <h2 className="font-editorial text-4xl font-black text-white mt-1 mb-8">Completed Deliveries</h2>
          <div className="space-y-3">
            {completedDeliveries.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/8 rounded-2xl"
                style={{ animation: historyRef.visible ? 'fadeInUp 0.4s ease both' : 'none' }}>
                <div className="w-8 h-8 rounded-full bg-[#C7F36B]/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{o.produce_name}</p>
                  <p className="text-white/40 text-xs">{o.order_number} · {o.quantity} {o.unit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#C7F36B] font-bold text-sm">₹{o.delivery_fee}</p>
                  <p className="text-white/30 text-xs">{new Date(o.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
