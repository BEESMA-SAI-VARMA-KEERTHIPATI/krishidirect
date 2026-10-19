import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../services/i18n';
import {
  Shield,
  Users,
  Package,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  RotateCcw,
  Sprout,
  ShoppingBag,
  Truck,
  Building2,
  FileCheck2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [activeAdminTab, setActiveAdminTab] = useState<'metrics' | 'users' | 'listings' | 'orders' | 'logs'>('metrics');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, uList, logs, listingsData, ordersData] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllUsers(),
        api.getAuditLogs(),
        api.getListings(),
        api.getOrders(),
      ]);
      setMetrics(m);
      setUsers(uList);
      setAuditLogs(logs);
      setAllListings(listingsData);
      setAllOrders(ordersData);
    } catch (err) {
      console.error('Failed to load admin operations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = async (userId: number, currentActive: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentActive);
      loadAdminData();
    } catch (err: any) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  const handleToggleListing = async (listingId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.updateListing(listingId, { status: nextStatus });
      loadAdminData();
    } catch (err: any) {
      alert(`Could not update listing: ${err.message}`);
    }
  };

  const filteredUsers = selectedRoleFilter === 'all'
    ? users
    : users.filter((u) => u.role === selectedRoleFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Admin Header */}
      <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-bold uppercase tracking-wider">
              Platform Governance
            </span>
            <span className="text-white/60 text-xs">Security Clearance Level 1 • Full Governance</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F5EC] mt-1">
            System Administration & Platform Audit
          </h1>
          <p className="text-xs text-white/80 max-w-xl font-light mt-1">
            Real-time platform telemetry computed directly from SQLite database rows, user access controls,
            produce listing moderation, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 bg-[#286443] hover:bg-[#205136] text-[#C7F36B] rounded-xl text-xs font-bold border border-[#C7F36B]/30 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#C7F36B]" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Navigation Subtabs for Admin */}
      <div className="flex items-center bg-white border border-[#DCE8D7] rounded-2xl p-1.5 shadow-sm text-xs font-bold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveAdminTab('metrics')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'metrics' ? 'bg-[#153D2B] text-[#C7F36B]' : 'text-stone-600 hover:text-[#153D2B]'
          }`}
        >
          Marketplace Telemetry
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'users' ? 'bg-[#153D2B] text-[#C7F36B]' : 'text-stone-600 hover:text-[#153D2B]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Governance ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('listings')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'listings' ? 'bg-[#153D2B] text-[#C7F36B]' : 'text-stone-600 hover:text-[#153D2B]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Listing Moderation ({allListings.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'orders' ? 'bg-[#153D2B] text-[#C7F36B]' : 'text-stone-600 hover:text-[#153D2B]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Orders & Escrow ({allOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'logs' ? 'bg-[#153D2B] text-[#C7F36B]' : 'text-stone-600 hover:text-[#153D2B]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Platform GMV (Stored)</span>
            <div className="font-editorial text-2xl font-black text-[#286443] mt-1">
              {formatCurrency(metrics.total_gmv_inr)}
            </div>
            <span className="text-[10px] text-stone-400">Total transacted volume</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Intermediary Margin Saved</span>
            <div className="font-editorial text-2xl font-black text-[#E7B85C] mt-1">
              {formatCurrency(metrics.intermediary_margin_saved_inr)}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">28% direct premium</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Total Registered Users</span>
            <div className="font-editorial text-2xl font-black text-[#153D2B] mt-1">
              {metrics.total_users} Users
            </div>
            <span className="text-[10px] text-stone-500">
              {metrics.farmers_count} Farmers • {metrics.buyers_count} Buyers
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
            <span className="text-xs text-stone-500 font-medium">Pooled Freight Volume</span>
            <div className="font-editorial text-2xl font-black text-[#153D2B] mt-1">
              {metrics.total_pooled_produce_kg.toLocaleString()} kg
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {metrics.total_co2_avoided_kg} kg CO2 avoided
            </span>
          </div>
        </div>
      )}

      {/* Tab: Users Governance */}
      {(activeAdminTab === 'users' || activeAdminTab === 'metrics') && (
        <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE8D7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                User Governance & Access Permissions
              </h3>
              <p className="text-xs text-stone-500">Farmers, Buyers, Village Agents, Transporters, and Administrators</p>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {['all', 'farmer', 'buyer', 'agent', 'transporter', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-colors ${
                    selectedRoleFilter === r
                      ? 'bg-[#153D2B] text-[#C7F36B] font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE8D7] text-stone-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Village / Cluster</th>
                  <th className="py-2.5">Preferred Language</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F5EC]/40">
                    <td className="py-3">
                      <div className="font-bold text-[#153D2B]">{u.full_name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="capitalize font-bold px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-stone-600">{u.village || 'Central'}</td>
                    <td className="py-3 uppercase font-mono">{u.preferred_lang || 'en'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            u.is_active
                              ? 'bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Listing Moderation */}
      {(activeAdminTab === 'listings' || activeAdminTab === 'metrics') && (
        <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Produce Listing Moderation
              </h3>
              <p className="text-xs text-stone-500">Supervise farmer listings, stock accuracy, and fair-trade standards</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE8D7] text-stone-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Produce</th>
                  <th className="py-2.5">Grade</th>
                  <th className="py-2.5">Price</th>
                  <th className="py-2.5">Stock</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allListings.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F7F5EC]/40">
                    <td className="py-3 font-bold text-[#153D2B]">{l.produce_name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C7F36B]/40 text-[#153D2B]">
                        {l.quality_grade}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#286443]">{formatCurrency(l.asking_price)}/{l.unit}</td>
                    <td className="py-3">{l.available_quantity} {l.unit}</td>
                    <td className="py-3 text-stone-600">{l.farm_location}</td>
                    <td className="py-3 capitalize font-bold text-xs">{l.status}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleListing(l.id, l.status)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-[#153D2B] cursor-pointer"
                      >
                        {l.status === 'active' ? 'Pause Listing' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Platform Orders */}
      {(activeAdminTab === 'orders' || activeAdminTab === 'metrics') && (
        <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Platform Orders & Escrow Escrow Audits
              </h3>
              <p className="text-xs text-stone-500">Supervise order fulfillments, OTP verifications, and escrow settlements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE8D7] text-stone-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Order #</th>
                  <th className="py-2.5">Buyer</th>
                  <th className="py-2.5">Seller</th>
                  <th className="py-2.5">Produce</th>
                  <th className="py-2.5">Total Amount</th>
                  <th className="py-2.5">Payment</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F7F5EC]/40">
                    <td className="py-3 font-mono font-bold text-[#153D2B]">{o.order_number}</td>
                    <td className="py-3 text-stone-700">{o.buyer?.full_name || 'Buyer'}</td>
                    <td className="py-3 text-stone-700">{o.seller?.full_name || 'Farmer'}</td>
                    <td className="py-3 font-semibold">{o.quantity} {o.unit} {o.produce_name}</td>
                    <td className="py-3 font-bold text-[#286443]">{formatCurrency(o.total_amount)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3 capitalize font-bold text-xs">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Log History */}
      {(activeAdminTab === 'logs' || activeAdminTab === 'metrics') && (
        <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
          <h3 className="font-editorial text-lg font-bold text-[#153D2B] pb-3 border-b border-[#DCE8D7]">
            Immutable Security & Platform Audit Log
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl flex items-center justify-between gap-3 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#153D2B]">[{log.action}]</span>
                  <span className="text-stone-700">{log.details}</span>
                </div>
                <span className="text-stone-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
