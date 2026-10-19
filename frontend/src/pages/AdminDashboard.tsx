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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, uList, logs] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllUsers(),
        api.getAuditLogs(),
      ]);
      setMetrics(m);
      setUsers(uList);
      setAuditLogs(logs);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Admin Header */}
      <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-bold uppercase tracking-wider">
              Platform Governance
            </span>
            <span className="text-white/60 text-xs">Security Clearance Level 1</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F5EC] mt-1">
            System Administration & Audit
          </h1>
          <p className="text-xs text-white/80 max-w-xl font-light mt-1">
            Platform telemetry calculated from persistent database rows, user role management,
            and immutable security audit logging.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 bg-[#286443] hover:bg-[#205136] text-[#C7F36B] rounded-xl text-xs font-bold border border-[#C7F36B]/30 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-[#C7F36B]" />
          <span>Refresh Telemetry</span>
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

      {/* User Management Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
        <h3 className="font-editorial text-lg font-bold text-[#153D2B] pb-3 border-b border-[#DCE8D7]">
          User Access & Account Controls
        </h3>

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
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F5EC]/40">
                  <td className="py-3">
                    <div className="font-bold text-[#153D2B]">{u.full_name}</div>
                    <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 capitalize font-semibold text-[#286443]">{u.role}</td>
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
                    <button
                      onClick={() => handleToggleUser(u.id, u.is_active)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        u.is_active
                          ? 'bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log History */}
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
    </div>
  );
};
