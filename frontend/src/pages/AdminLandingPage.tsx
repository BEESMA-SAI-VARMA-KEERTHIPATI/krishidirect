import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users, Package, ShoppingBag, Truck, TrendingUp, Shield,
  AlertCircle, CheckCircle2, RefreshCw, Activity, BarChart3,
  Eye, EyeOff, Clock, ChevronDown, Leaf, Network, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let v = 0; const step = target / (duration / 16);
    const t = setInterval(() => { v = Math.min(v + step, target); setVal(Math.floor(v)); if (v >= target) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [target, active, duration]);
  return val;
}

const ROLE_COLORS: Record<string, string> = {
  farmer: '#C7F36B', buyer: '#E7B85C', agent: '#DCE8D7', transporter: '#86efac', admin: '#f9a8d4'
};

export const AdminLandingPage: React.FC = () => {
  const { user, navigate } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'orders' | 'logs'>('users');
  const [togglingUser, setTogglingUser] = useState<number | null>(null);

  const statsRef = useScrollReveal();
  const networkRef = useScrollReveal();
  const dataRef = useScrollReveal();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, u, l, o, a] = await Promise.allSettled([
          api.getAdminMetrics(), api.getAllUsers(), api.getListings(),
          api.getOrders(), api.getAuditLogs(),
        ]);
        if (m.status === 'fulfilled') setMetrics(m.value);
        if (u.status === 'fulfilled') setAllUsers(u.value);
        if (l.status === 'fulfilled') setListings(l.value);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (a.status === 'fulfilled') setAuditLogs(a.value);
      } finally { setLoading(false); }
    })();
  }, []);

  const totalUsers = allUsers.length;
  const totalListings = listings.length;
  const totalOrders = orders.length;
  const inTransit = orders.filter(o => o.status === 'in_transit').length;

  const uCount = useCountUp(totalUsers, statsRef.visible);
  const lCount = useCountUp(totalListings, statsRef.visible);
  const oCount = useCountUp(totalOrders, statsRef.visible);

  const roleCounts = allUsers.reduce((acc: Record<string, number>, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1; return acc;
  }, {});

  const roleChartData = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  const orderStatusData = [
    { name: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { name: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { name: 'In Transit', count: orders.filter(o => o.status === 'in_transit').length },
    { name: 'Delivered', count: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length },
  ];

  const filteredUsers = userRoleFilter === 'all' ? allUsers : allUsers.filter((u: any) => u.role === userRoleFilter);

  const toggleUser = async (userId: number, isActive: boolean) => {
    setTogglingUser(userId);
    try { await api.toggleUserStatus(userId, !isActive); const u = await api.getAllUsers(); setAllUsers(u); } catch { }
    setTogglingUser(null);
  };

  return (
    <div className="min-h-screen bg-[#153D2B] overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes networkPulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes lineFlow { 0%{stroke-dashoffset:80} 100%{stroke-dashoffset:0} }
        @keyframes revealWord { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nodeBlink { 0%,100%{fill-opacity:0.6} 50%{fill-opacity:1} }
        .reveal-word { display:inline-block;animation:revealWord 0.55s ease forwards;opacity:0; }
        .section-reveal { opacity:0;transform:translateY(36px);transition:opacity 0.7s ease,transform 0.7s ease; }
        .section-reveal.visible { opacity:1;transform:translateY(0); }
        .card-hover { transition:transform 0.28s ease,background 0.2s ease; }
        .card-hover:hover { transform:translateY(-3px); }
        .tab-btn { transition:all 0.2s ease; border-bottom:2px solid transparent; }
        .tab-btn.active { border-color:#C7F36B; color:#C7F36B; }
        @media(prefers-reduced-motion:reduce){.reveal-word,.section-reveal,.card-hover{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}}
      `}</style>

      {/* ── HERO — Dark Forest with Animated Network ── */}
      <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden">
        {/* Animated constellation network background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          {/* Network nodes */}
          {[
            [120,200,'F'],[280,350,'F'],[150,500,'F'],[400,150,'F'],[90,650,'F'],
            [700,100,'B'],[850,280,'B'],[1050,180,'B'],[950,420,'B'],
            [700,400,'C'],[580,550,'C'],
            [1100,350,'T'],[1250,200,'T'],[1350,450,'T'],
          ].map(([x, y, type], i) => (
            <g key={i}>
              <circle cx={x as number} cy={y as number} r={type === 'C' ? 10 : 6}
                fill={type === 'F' ? '#C7F36B' : type === 'B' ? '#E7B85C' : type === 'T' ? '#86efac' : '#DCE8D7'}
                style={{ animation: `nodeBlink ${2 + (i % 3) * 0.8}s ease-in-out ${i * 0.2}s infinite` }} />
              <text x={x as number} y={(y as number) + 4} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontWeight="700">{type}</text>
            </g>
          ))}
          {/* Connection lines */}
          {[
            [120,200,700,400],[280,350,700,400],[150,500,700,400],[400,150,700,400],[90,650,580,550],
            [700,400,700,100],[700,400,850,280],[700,400,1050,180],[700,400,950,420],
            [700,400,1100,350],[700,400,1250,200],[700,400,1350,450],
            [580,550,700,400],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(199,243,107,0.15)" strokeWidth="1"
              strokeDasharray="80"
              style={{ animation: `lineFlow ${3 + (i % 4) * 0.5}s linear ${i * 0.15}s infinite` }} />
          ))}
        </svg>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C7F36B]/10 border border-[#C7F36B]/25 rounded-full text-[#C7F36B] text-xs font-bold uppercase tracking-widest mb-8"
            style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
            <Network className="w-3 h-3" /> Platform Administration
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-black text-[#F7F5EC] leading-tight mb-6">
            {['One Marketplace.', 'A Smarter', 'Agricultural Network.'].map((w, i) => (
              <span key={i} className="reveal-word block" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>{w}</span>
            ))}
          </h1>
          <p className="text-[#DCE8D7]/70 text-lg max-w-2xl mx-auto font-light mb-10"
            style={{ animation: 'fadeInUp 0.6s ease 0.8s both' }}>
            Real-time oversight of every farmer, listing, order, and delivery. Powered by actual platform data.
          </p>
          <button onClick={() => document.getElementById('admin-data')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#C7F36B] hover:bg-[#d4f77c] text-[#153D2B] font-black text-sm rounded-2xl transition-all duration-300"
            style={{ animation: 'fadeInUp 0.6s ease 1.0s both' }}>
            <BarChart3 className="w-4 h-4" /> Open Control Center
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 flex gap-3 text-[10px]" style={{ animation: 'fadeInUp 0.5s ease 1.5s both' }}>
          {[['#C7F36B','Farmers'],['#E7B85C','Buyers'],['#86efac','Transporters'],['#DCE8D7','Agents']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1 text-white/50">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
            </div>
          ))}
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section ref={statsRef.ref}
        className={`py-16 bg-[#F7F5EC] section-reveal ${statsRef.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Users', val: uCount, icon: Users, color: '#153D2B', textColor: '#C7F36B', raw: totalUsers },
              { label: 'Active Listings', val: lCount, icon: Package, color: '#286443', textColor: '#C7F36B', raw: totalListings },
              { label: 'Total Orders', val: oCount, icon: ShoppingBag, color: '#202820', textColor: '#E7B85C', raw: totalOrders },
              { label: 'In Transit', val: inTransit, icon: Truck, color: '#E7B85C', textColor: '#153D2B', raw: inTransit },
            ].map(({ label, val, icon: Icon, color, textColor }) => (
              <div key={label} className="card-hover rounded-3xl p-6 flex flex-col gap-3"
                style={{ background: color }}>
                <Icon className="w-6 h-6" style={{ color: textColor }} />
                <div>
                  <div className="font-editorial text-4xl sm:text-5xl font-black" style={{ color: textColor }}>
                    {loading ? '—' : val.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs mt-1 font-medium" style={{ color: textColor + '99' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARTS ── */}
      <section ref={networkRef.ref}
        className={`py-20 bg-[#F7F5EC] section-reveal ${networkRef.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role distribution */}
            <div className="bg-white border border-[#DCE8D7] rounded-3xl p-7">
              <h3 className="font-editorial text-2xl font-black text-[#153D2B] mb-6">Users by Role</h3>
              {roleChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={roleChartData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DCE8D7" vertical={false} />
                    <XAxis dataKey="role" tick={{ fill: '#286443', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#286443', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#153D2B', border: 'none', borderRadius: 12, color: '#F7F5EC', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#C7F36B" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-stone-400 text-sm">No user data available</div>
              )}
            </div>

            {/* Order status chart */}
            <div className="bg-white border border-[#DCE8D7] rounded-3xl p-7">
              <h3 className="font-editorial text-2xl font-black text-[#153D2B] mb-6">Order Status</h3>
              {orders.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={orderStatusData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DCE8D7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#286443', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#286443', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#153D2B', border: 'none', borderRadius: 12, color: '#F7F5EC', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#E7B85C" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-stone-400 text-sm">No order data</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA MANAGEMENT ── */}
      <section id="admin-data" ref={dataRef.ref}
        className={`py-20 bg-[#153D2B] section-reveal ${dataRef.visible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <span className="text-[#C7F36B] text-xs font-bold uppercase tracking-widest">Control Center</span>
          <h2 className="font-editorial text-4xl font-black text-white mt-1 mb-8">Platform Management</h2>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 mb-8 overflow-x-auto">
            {(['users', 'listings', 'orders', 'logs'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`tab-btn pb-3 text-sm font-bold whitespace-nowrap capitalize ${activeTab === tab ? 'active text-[#C7F36B]' : 'text-white/50 hover:text-white/80'}`}>
                {tab === 'users' ? `Users (${allUsers.length})` :
                 tab === 'listings' ? `Listings (${listings.length})` :
                 tab === 'orders' ? `Orders (${orders.length})` : 'Audit Logs'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/8 rounded-xl animate-pulse" />)}</div>
          ) : activeTab === 'users' ? (
            <div>
              {/* Role filter */}
              <div className="flex gap-2 flex-wrap mb-5">
                {['all', 'farmer', 'buyer', 'agent', 'transporter'].map(r => (
                  <button key={r} onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${userRoleFilter === r ? 'bg-[#C7F36B] text-[#153D2B]' : 'bg-white/8 text-white/60 hover:bg-white/15'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredUsers.map((u: any, i: number) => (
                  <div key={u.id} className="card-hover flex items-center gap-4 p-4 bg-white/6 border border-white/8 rounded-2xl hover:bg-white/10"
                    style={{ animation: `fadeInUp 0.4s ease ${i * 0.04}s both` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: ROLE_COLORS[u.role] || '#DCE8D7', color: '#153D2B' }}>
                      {u.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{u.full_name}</p>
                      <p className="text-white/40 text-xs truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize flex-shrink-0"
                      style={{ background: (ROLE_COLORS[u.role] || '#DCE8D7') + '20', color: ROLE_COLORS[u.role] || '#DCE8D7' }}>
                      {u.role}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${u.is_active ? 'bg-[#C7F36B]/15 text-[#C7F36B]' : 'bg-red-500/15 text-red-400'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                    <button onClick={() => toggleUser(u.id, u.is_active)} disabled={togglingUser === u.id || u.role === 'admin'}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/15 rounded-lg transition-colors disabled:opacity-30 flex-shrink-0">
                      {togglingUser === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white/60" /> :
                        u.is_active ? <EyeOff className="w-3.5 h-3.5 text-white/60" /> : <Eye className="w-3.5 h-3.5 text-white/60" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'listings' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.slice(0, 9).map((l: any, i: number) => (
                <div key={l.id} className="card-hover bg-white/6 border border-white/8 rounded-2xl p-4 hover:bg-white/10"
                  style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-sm">{l.produce_name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${l.status === 'active' ? 'bg-[#C7F36B]/20 text-[#C7F36B]' : 'bg-[#E7B85C]/20 text-[#E7B85C]'}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">{l.farmer?.full_name || 'Farmer'} · {l.quality_grade}</p>
                  <p className="text-white/50 text-xs">{l.available_quantity} {l.unit} · ₹{l.asking_price}/{l.unit}</p>
                </div>
              ))}
              {listings.length === 0 && <div className="col-span-3 text-center text-white/40 py-12">No listings found.</div>}
            </div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-3">
              {orders.slice(0, 8).map((o: any, i: number) => (
                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/6 border border-white/8 rounded-2xl"
                  style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[#C7F36B] text-xs">{o.order_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${o.status === 'delivered' || o.status === 'completed' ? 'bg-[#C7F36B]/20 text-[#C7F36B]' : 'bg-[#E7B85C]/20 text-[#E7B85C]'}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-white text-sm font-semibold">{o.produce_name} — {o.quantity} {o.unit}</p>
                    <p className="text-white/40 text-xs">{o.buyer?.full_name} → {o.seller?.full_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">₹{o.total_amount?.toLocaleString('en-IN')}</p>
                    <p className="text-white/30 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="text-center text-white/40 py-12">No orders found.</div>}
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.length > 0 ? auditLogs.slice(0, 10).map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/8 rounded-xl text-xs"
                  style={{ animation: `fadeInUp 0.4s ease ${i * 0.04}s both` }}>
                  <Activity className="w-3.5 h-3.5 text-[#C7F36B] flex-shrink-0" />
                  <span className="text-white/60 font-mono flex-shrink-0">
                    {new Date(log.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-white/80">{log.action || log.description || 'System event'}</span>
                  {log.user_email && <span className="text-[#C7F36B]/60 ml-auto flex-shrink-0">{log.user_email}</span>}
                </div>
              )) : (
                <div className="text-center py-12">
                  <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No audit logs available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── SYSTEM HEALTH ── */}
      <section className="py-16 bg-[#202820]">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className="font-editorial text-3xl font-black text-white mb-8">System Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'API Backend', status: true, note: 'FastAPI · SQLite connected' },
              { label: 'Authentication', status: true, note: 'JWT · Role-based access' },
              { label: 'Database', status: true, note: 'Seeded · 5 demo accounts active' },
            ].map(({ label, status, note }) => (
              <div key={label} className="flex items-center gap-4 p-5 bg-white/5 border border-white/8 rounded-2xl">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status ? 'bg-[#C7F36B] shadow-[0_0_8px_rgba(199,243,107,0.5)]' : 'bg-red-400'}`} />
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
