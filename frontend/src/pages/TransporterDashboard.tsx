import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency } from '../services/i18n';
import {
  Truck,
  MapPin,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';

export const TransporterDashboard: React.FC = () => {
  const { user } = useAuth();

  const [availableJobs, setAvailableJobs] = useState<{
    pending_direct_deliveries: any[];
    village_harvest_pools: any[];
  }>({ pending_direct_deliveries: [], village_harvest_pools: [] });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<number>(1);
  const [otpResult, setOtpResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransporterJobs();
      setAvailableJobs(data);
    } catch (err) {
      console.error('Failed to load transporter jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimJob = async (orderId: number) => {
    try {
      await api.claimOrderDelivery(orderId);
      alert('You have claimed this delivery route. Proceed to the farm hub for pickup.');
      fetchJobs();
    } catch (err: any) {
      alert(`Claim failed: ${err.message}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpCode || activeOtpCode.length !== 4) {
      setOtpResult({ success: false, msg: 'Please provide a 4-digit numeric code.' });
      return;
    }

    try {
      const res = await api.verifyOTP(activeOrderId, activeOtpCode);
      setOtpResult({ success: true, msg: res.message || 'Delivery successfully confirmed! Escrow funds released to farmer.' });
      setActiveOtpCode('');
      fetchJobs();
    } catch (err: any) {
      setOtpResult({ success: false, msg: err.message || 'OTP verification failed.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold uppercase tracking-wider">
            Rural Logistics Fleet
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F5EC] mt-1">
            Transporter & Fleet Command
          </h1>
          <p className="text-xs text-white/80 max-w-xl font-light mt-1">
            Pick up consolidated farmer harvest batches, follow optimized multi-drop routes,
            and complete cryptographic handovers with buyers.
          </p>
        </div>

        <div className="p-4 bg-[#286443]/80 border border-[#C7F36B]/30 rounded-2xl text-xs space-y-1">
          <span className="text-white/70 block text-[10px] uppercase font-bold">Fleet Capacity Active</span>
          <div className="text-sm font-bold text-[#C7F36B]">
            2x 3-Ton Electric Cargo • 1x 5-Ton Diesel
          </div>
          <span className="text-[11px] text-white/80">Base: Warangal-Hyderabad Corridor (NH163)</span>
        </div>
      </div>

      {/* Quick OTP Verification Box for Transporters */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-700" />
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Transporter On-Site Delivery OTP Verification
              </h3>
            </div>
            <p className="text-xs text-amber-900 mt-1 max-w-xl">
              Inspect produce upon arrival at the buyer warehouse. Ask the buyer for their 4-digit
              OTP code and submit here to finalize delivery and trigger instant farmer payout.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="number"
              placeholder="Order ID"
              value={activeOrderId}
              onChange={(e) => setActiveOrderId(Number(e.target.value))}
              className="w-24 text-xs p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-[#153D2B]"
            />
            <input
              type="text"
              maxLength={4}
              placeholder="4-digit OTP"
              value={activeOtpCode}
              onChange={(e) => setActiveOtpCode(e.target.value)}
              className="w-32 text-center font-mono font-bold tracking-widest text-sm p-2.5 bg-white border border-amber-300 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold shadow-md transition-colors whitespace-nowrap"
            >
              Verify Handover
            </button>
          </form>
        </div>

        {otpResult && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              otpResult.success
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-red-100 text-red-900 border border-red-300'
            }`}
          >
            {otpResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{otpResult.msg}</span>
          </div>
        )}
      </div>

      {/* Available Direct Deliveries */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
        <h3 className="font-editorial text-lg font-bold text-[#153D2B] pb-3 border-b border-[#DCE8D7]">
          Available Direct Farmer Pickup Jobs
        </h3>

        {availableJobs.pending_direct_deliveries.length === 0 ? (
          <p className="text-xs text-stone-500 py-4">No unassigned direct pickup jobs pending.</p>
        ) : (
          <div className="space-y-3">
            {availableJobs.pending_direct_deliveries.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-[#F7F5EC] border border-[#DCE8D7] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#153D2B]">
                      Order #{job.order_number}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {job.quantity} {job.unit} {job.produce_name}
                    </span>
                  </div>
                  <div className="text-stone-600 mt-1">
                    From: <strong>{job.pickup_address}</strong> ➔ To: <strong>{job.delivery_address}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Freight Earning</span>
                    <span className="font-editorial font-bold text-base text-[#286443]">
                      {formatCurrency(job.freight_earning_inr)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClaimJob(job.id)}
                    className="px-4 py-2 bg-[#153D2B] text-[#C7F36B] hover:bg-[#286443] rounded-xl font-bold"
                  >
                    Claim Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
