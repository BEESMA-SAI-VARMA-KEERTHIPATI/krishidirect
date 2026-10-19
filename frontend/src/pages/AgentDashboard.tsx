import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency } from '../services/i18n';
import {
  Building2,
  Users,
  Plus,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Truck,
  FileCheck2,
  Phone,
  Package,
  Sprout,
  X,
} from 'lucide-react';

interface AgentDashboardProps {
  onOpenListingModal?: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onOpenListingModal }) => {
  const { user, navigate } = useAuth();

  const [assistedFarmers, setAssistedFarmers] = useState([
    { id: 1, name: 'Mallesh Goud', village: 'Jangaon North', phone: '+91 98491 22334', crops: 'Saahu Hybrid Tomatoes (450 kg)', status: 'Active' },
    { id: 2, name: 'Anjamma V', village: 'Cherial', phone: '+91 97012 33445', crops: 'Samba Masoori Paddy (1,200 kg)', status: 'Active' },
    { id: 3, name: 'Balaram Reddy', village: 'Bachannapet', phone: '+91 94410 55667', crops: 'Guntur S17 Chillies (300 kg)', status: 'Active' },
  ]);

  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('Jangaon Cluster');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerCrop, setNewFarmerCrop] = useState('');
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [pools, setPools] = useState<any[]>([]);

  useEffect(() => {
    api.getPools().then((data) => setPools(data)).catch(console.error);
  }, []);

  const handleAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName) return;
    setAssistedFarmers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newFarmerName,
        village: newFarmerVillage,
        phone: newFarmerPhone || '+91 99000 88776',
        crops: newFarmerCrop || 'Assisted Harvest Lot',
        status: 'Active',
      },
    ]);
    setNewFarmerName('');
    setNewFarmerCrop('');
    setShowAddFarmer(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E7B85C] text-[#153D2B] text-[10px] font-bold uppercase tracking-wider">
            Village Agent Desk
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F5EC] mt-1">
            Village Coordinator & FPO Management
          </h1>
          <p className="text-xs text-white/80 max-w-xl font-light mt-1">
            Assisting smallholders with digital crop registrations, collection schedules, calibrated
            weighment slips, and consolidated freight dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenListingModal && (
            <button
              onClick={onOpenListingModal}
              className="px-4 py-3 bg-[#286443] hover:bg-[#205136] text-[#C7F36B] rounded-xl text-xs font-bold border border-[#C7F36B]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-[#C7F36B]" />
              <span>Assisted Produce Listing</span>
            </button>
          )}

          <button
            onClick={() => setShowAddFarmer(true)}
            className="px-5 py-3 bg-[#C7F36B] hover:bg-[#d5faa0] text-[#153D2B] rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Local Farmer</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Assisted Farmers Enrolled</span>
          <div className="font-editorial text-3xl font-bold text-[#153D2B] mt-1">
            {assistedFarmers.length} Farmers
          </div>
          <span className="text-[11px] text-[#286443] font-semibold">Jangaon Sub-district Cluster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Active Harvest Pools</span>
          <div className="font-editorial text-3xl font-bold text-[#286443] mt-1">
            {pools.length} Routes
          </div>
          <span className="text-[11px] text-stone-500">Scheduled freight consolidation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE8D7] shadow-sm">
          <span className="text-xs text-stone-500 font-medium">Village FPO Collection Center</span>
          <div className="font-editorial text-xl font-bold text-[#153D2B] mt-1">
            Jangaon Mandi Yard #4
          </div>
          <span className="text-[11px] text-stone-500">Calibrated electronic weighing scale</span>
        </div>
      </div>

      {/* Harvest Pooling & Collection Scheduling */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#286443]" />
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Village Collection & Harvest Pooling Schedules
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Consolidated farmer batches ready for logistics fleet dispatch to Hyderabad terminal.
            </p>
          </div>
          <button
            onClick={() => navigate('/pooling')}
            className="px-3.5 py-1.5 bg-[#153D2B] text-[#C7F36B] rounded-lg text-xs font-bold hover:bg-[#286443] transition-colors cursor-pointer"
          >
            Manage Pools
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pools.map((p) => (
            <div key={p.id} className="p-4 bg-[#F7F5EC] border border-[#DCE8D7] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#286443]">{p.pool_code}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#C7F36B]/50 text-[#153D2B] text-[10px] font-bold capitalize">
                  {p.status}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#153D2B]">{p.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px]">Collection Point</span>
                  <strong>{p.collection_point}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Destination Market</span>
                  <strong>{p.destination_market}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Pooled Weight</span>
                  <strong className="text-[#286443]">{p.current_pooled_kg} / {p.target_capacity_kg} kg</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Scheduled Pickup</span>
                  <strong>{p.pickup_date} ({p.time_window})</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-[#286443] font-bold">Assigned Vehicle: {p.vehicle_type}</span>
                <span className="text-stone-500">{p.participants?.length || 2} Farmers Joined</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assisted Farmers Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
              Registered Cluster Smallholders
            </h3>
            <p className="text-xs text-stone-500">Farmers without smartphones assisted with weighment and digital listing</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE8D7] text-stone-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5">Farmer Name</th>
                <th className="py-2.5">Village / Hamlet</th>
                <th className="py-2.5">Contact Phone</th>
                <th className="py-2.5">Enrolled Harvest Batch</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {assistedFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-[#F7F5EC]/50">
                  <td className="py-3 font-bold text-[#153D2B]">{f.name}</td>
                  <td className="py-3 text-stone-600">{f.village}</td>
                  <td className="py-3 font-mono text-stone-600">{f.phone}</td>
                  <td className="py-3 text-[#286443] font-medium">{f.crops}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate('/pooling')}
                      className="px-3 py-1 bg-[#153D2B] text-[#C7F36B] rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Allocate Pool Slot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Farmer Modal */}
      {showAddFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE8D7]">
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Onboard Smallholder Farmer
              </h3>
              <button
                onClick={() => setShowAddFarmer(false)}
                className="p-1 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFarmer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#153D2B] mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Laxman Naik"
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153D2B] mb-1">Village Name *</label>
                <input
                  type="text"
                  required
                  value={newFarmerVillage}
                  onChange={(e) => setNewFarmerVillage(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153D2B] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newFarmerPhone}
                  onChange={(e) => setNewFarmerPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153D2B] mb-1">Harvest Crop & Quantity</label>
                <input
                  type="text"
                  value={newFarmerCrop}
                  onChange={(e) => setNewFarmerCrop(e.target.value)}
                  placeholder="e.g. Saahu Tomatoes (500 kg)"
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Register Farmer & Create Weighment Slip
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
