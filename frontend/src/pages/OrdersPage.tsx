import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';
import { formatCurrency } from '../services/i18n';
import { TrustPassportModal } from '../components/TrustPassportModal';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  RefreshCw,
  XCircle,
  User,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPassportOrder, setSelectedPassportOrder] = useState<Order | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [otpMessages, setOtpMessages] = useState<Record<number, { success?: boolean; text: string }>>({});
  const [isVerifying, setIsVerifying] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (orderId: number) => {
    const code = otpInputs[orderId];
    if (!code || code.length !== 4) {
      setOtpMessages((prev) => ({
        ...prev,
        [orderId]: { success: false, text: 'Please enter a valid 4-digit numeric OTP code.' },
      }));
      return;
    }

    setIsVerifying((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.verifyOTP(orderId, code);
      setOtpMessages((prev) => ({
        ...prev,
        [orderId]: { success: true, text: res.message || 'OTP Verified! Order completed.' },
      }));
      fetchOrders();
    } catch (err: any) {
      setOtpMessages((prev) => ({
        ...prev,
        [orderId]: { success: false, text: err.message || 'OTP verification failed.' },
      }));
    } finally {
      setIsVerifying((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAdvanceStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      fetchOrders();
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? Produce stock will be restored.')) return;
    try {
      await api.cancelOrder(orderId);
      fetchOrders();
    } catch (err: any) {
      alert(`Cancel failed: ${err.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'in_transit':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'delivered':
      case 'completed':
        return 'bg-[#C7F36B]/60 text-[#153D2B] border-[#286443]/40';
      case 'cancelled':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-stone-100 text-stone-900';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#286443]">
            Escrow Protected Transactions
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#153D2B]">
            Orders & Trust Passports
          </h1>
          <p className="text-xs text-stone-600 max-w-xl mt-1">
            Track real-time order progression, verify 4-digit delivery OTPs, and inspect the
            tamper-evident audit timeline for every agricultural batch.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DCE8D7] rounded-xl text-xs font-semibold text-[#153D2B] hover:bg-[#F7F5EC] shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#286443]" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#286443] font-semibold animate-pulse">
          Loading order history and delivery verification events...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#DCE8D7] text-center space-y-2">
          <FileText className="w-12 h-12 stroke-[1.2] text-[#286443]/40 mx-auto" />
          <p className="text-sm font-bold text-[#153D2B]">No active orders found</p>
          <p className="text-xs text-stone-500">
            Visit the marketplace to place an order or create a new harvest listing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#DCE8D7] p-5 shadow-sm space-y-4 hover:border-[#286443] transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7] text-[#153D2B]">
                    <Truck className="w-5 h-5 text-[#286443]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-editorial text-base font-bold text-[#153D2B]">
                        Order #{order.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                          order.status
                        )} capitalize`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Ordered on{' '}
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Total Escrow</span>
                    <span className="font-editorial text-lg font-bold text-[#286443]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPassportOrder(order)}
                    className="px-3.5 py-2 bg-[#153D2B] text-[#C7F36B] hover:bg-[#286443] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View Passport</span>
                  </button>
                </div>
              </div>

              {/* Order Details Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7]">
                  <span className="text-stone-500 block font-medium">Produce Item</span>
                  <div className="font-bold text-sm text-[#153D2B] mt-0.5">
                    {order.quantity} {order.unit} {order.produce_name}
                  </div>
                  <span className="text-[11px] text-stone-600">
                    @ {formatCurrency(order.unit_price)}/{order.unit}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7]">
                  <span className="text-stone-500 block font-medium">Delivery Destination</span>
                  <div className="font-semibold text-[#153D2B] mt-0.5 line-clamp-2">
                    {order.delivery_address}
                  </div>
                  <span className="text-[11px] text-stone-600 capitalize">
                    Method: {order.delivery_method.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-[#F7F5EC] rounded-xl border border-[#DCE8D7]">
                  <span className="text-stone-500 block font-medium">Payment & Escrow</span>
                  <div className="font-bold text-[#286443] mt-0.5 capitalize">
                    {order.payment_status.replace(/_/g, ' ')}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Ref: {order.payment_transaction_id || 'TXN_UPI_DEMO'}
                  </span>
                </div>
              </div>

              {/* Delivery OTP Demonstration & Verification Area */}
              {order.status !== 'cancelled' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <KeyRound className="w-4 h-4 text-amber-700" />
                      <span>Delivery Verification OTP</span>
                      {order.demo_otp_preview && (
                        <span className="ml-2 font-mono text-sm px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black tracking-widest">
                          [{order.demo_otp_preview}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5 max-w-md">
                      {order.status === 'delivered'
                        ? '✓ Verified! Cryptographic signature registered. Escrow payout completed to farmer.'
                        : 'Share or enter this 4-digit OTP upon physical delivery to complete the order and release escrow.'}
                    </p>
                  </div>

                  {order.status !== 'delivered' && order.status !== 'completed' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInputs[order.id] || ''}
                        onChange={(e) =>
                          setOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        placeholder="Enter 4-digit OTP"
                        className="w-32 text-center font-mono font-bold tracking-widest px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#286443]"
                      />
                      <button
                        onClick={() => handleVerifyOTP(order.id)}
                        disabled={isVerifying[order.id]}
                        className="px-4 py-2 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                      >
                        {isVerifying[order.id] ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {otpMessages[order.id] && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    otpMessages[order.id].success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {otpMessages[order.id].success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{otpMessages[order.id].text}</span>
                </div>
              )}

              {/* State Transitions Quick Controls for Demo Testing */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-stone-500 font-semibold">Advance Status (Demo):</span>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'confirmed')}
                      className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium"
                    >
                      Farmer Confirm
                    </button>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'ready_for_pickup')}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-medium"
                    >
                      Pack & Ready
                    </button>
                  )}

                  {order.status === 'ready_for_pickup' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'in_transit')}
                      className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg hover:bg-purple-100 font-medium"
                    >
                      Dispatch In Transit
                    </button>
                  )}
                </div>

                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-stone-400 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust & Delivery Passport Modal */}
      <TrustPassportModal
        order={selectedPassportOrder}
        isOpen={!!selectedPassportOrder}
        onClose={() => setSelectedPassportOrder(null)}
        onStatusAdvance={handleAdvanceStatus}
      />
    </div>
  );
};
