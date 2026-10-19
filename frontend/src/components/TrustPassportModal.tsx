import React from 'react';
import { Order } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  ShieldCheck,
  X,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  KeyRound,
  FileText,
  BadgeAlert,
  ArrowRight,
} from 'lucide-react';

interface PassportModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusAdvance?: (orderId: number, nextStatus: string) => void;
}

export const TrustPassportModal: React.FC<PassportModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusAdvance,
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
      case 'completed':
        return 'bg-[#C7F36B]/50 text-[#153D2B] border-[#286443]/40';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Passport Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#286443] text-[#C7F36B] rounded-xl shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl font-bold tracking-tight">Trust & Delivery Passport</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C7F36B] text-[#153D2B]">
                  Audited
                </span>
              </div>
              <p className="text-xs text-white/70">
                Order #{order.order_number} • Escrow Secured
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary & OTP Highlights */}
        <div className="p-6 bg-white border-b border-[#DCE8D7] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7]">
            <span className="text-stone-500 font-medium">Produce & Volume</span>
            <div className="font-bold text-sm text-[#153D2B] mt-0.5">
              {order.quantity} {order.unit} {order.produce_name}
            </div>
            <span className="text-[11px] text-stone-600">
              @ {formatCurrency(order.unit_price)}/{order.unit}
            </span>
          </div>

          <div className="p-3 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7]">
            <span className="text-stone-500 font-medium">Escrow Financial Value</span>
            <div className="font-bold text-sm text-[#286443] mt-0.5">
              {formatCurrency(order.total_amount)}
            </div>
            <span className="text-[11px] capitalize text-[#153D2B] font-medium">
              Status: {order.payment_status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Delivery OTP Demonstration Box */}
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span>Handover OTP</span>
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-mono font-extrabold text-[#153D2B] tracking-widest mt-1">
                {order.demo_otp_preview || '4821'}
              </div>
            </div>
            <span className="text-[10px] text-amber-800 leading-tight">
              {order.status === 'delivered' ? '✓ Verified upon delivery' : 'Share with delivery partner upon arrival'}
            </span>
          </div>
        </div>

        {/* Timeline Events Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F7F5EC]">
          <h4 className="text-xs uppercase font-bold tracking-wider text-[#286443] mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Chronological Event Audit Trail</span>
          </h4>

          <div className="relative border-l-2 border-[#286443]/30 ml-4 space-y-6">
            {order.timeline_events && order.timeline_events.length > 0 ? (
              order.timeline_events.map((ev, index) => (
                <div key={ev.id || index} className="relative pl-6 group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#153D2B] border-2 border-[#C7F36B] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>

                  <div className="bg-white border border-[#DCE8D7] rounded-xl p-3.5 shadow-sm hover:border-[#286443] transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#153D2B]">{ev.title}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#DCE8D7] text-[#153D2B]">
                          {ev.event_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {new Date(ev.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-[#202820]/80 mt-1 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#286443]" />
                        <span>
                          {ev.actor_name || 'System Operator'} ({ev.actor_role || 'Agent'})
                        </span>
                      </div>
                      {ev.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pl-6 text-xs text-stone-500">No passport events logged yet.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#DCE8D7] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Current Status:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)} capitalize`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#153D2B] text-[#F7F5EC] hover:bg-[#286443] text-xs font-bold rounded-lg transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
