import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HarvestPool } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Layers,
  Truck,
  Leaf,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PoolingPage: React.FC = () => {
  const { user } = useAuth();

  const [pools, setPools] = useState<HarvestPool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPoolToJoin, setSelectedPoolToJoin] = useState<HarvestPool | null>(null);
  const [joinQuantity, setJoinQuantity] = useState<number>(250);
  const [joinProduce, setJoinProduce] = useState<string>('Fresh Tomatoes');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPools();
      setPools(data);
    } catch (err) {
      console.error('Error fetching pools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolToJoin) return;
    setIsJoining(true);
    setJoinSuccess(null);
    setJoinError(null);

    try {
      await api.joinPool({
        pool_id: selectedPoolToJoin.id,
        produce_name: joinProduce,
        quantity_kg: joinQuantity,
        crate_count: Math.max(1, Math.floor(joinQuantity / 25)),
        pickup_address: user?.village || selectedPoolToJoin.village_cluster,
      });

      setJoinSuccess(
        `Successfully joined harvest pool ${selectedPoolToJoin.pool_code} with ${joinQuantity} kg! Estimated savings: ${formatCurrency(
          joinQuantity * (selectedPoolToJoin.individual_freight_est - selectedPoolToJoin.pooled_freight_est)
        )}.`
      );
      fetchPools();
      setTimeout(() => setSelectedPoolToJoin(null), 2500);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join pool.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title & Pooling Concept Explanation */}
      <div className="bg-[#153D2B] text-white p-8 rounded-3xl shadow-lg border border-[#286443] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#286443] text-[#C7F36B] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Smart Village Harvest Pooling System</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#F7F5EC]">
            Consolidated Farm Gate Logistics
          </h1>
          <p className="text-xs text-white/80 max-w-2xl font-light leading-relaxed">
            Smallholders often lose 20-30% of their margin hiring individual diesel tempos for small
            harvest lots. KrishiDirect aggregates nearby farmer deliveries into shared 3-ton to 5-ton
            electric cargo trucks, slashing individual freight costs by up to 60%.
          </p>
        </div>

        {/* Aggregate Savings Pill */}
        <div className="p-4 bg-[#286443]/80 border border-[#C7F36B]/30 rounded-2xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-white/70 block text-[10px] uppercase font-bold">Standard Tempo</span>
            <span className="text-stone-300 font-mono font-bold line-through">₹4.50 / kg</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C7F36B]" />
          <div>
            <span className="text-[#C7F36B] block text-[10px] uppercase font-bold">Pooled Rate</span>
            <span className="text-[#C7F36B] font-mono font-black text-base">₹1.80 / kg</span>
          </div>
        </div>
      </div>

      {/* Active Village Pools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#153D2B]">
              Active Village Harvest Pools
            </h2>
            <p className="text-xs text-stone-500">
              Join open vehicle slots before the scheduled morning dispatch cutoff
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#286443] font-semibold animate-pulse">
            Analyzing village clusters and vehicle capacity allocations...
          </div>
        ) : pools.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#DCE8D7] text-center text-stone-500">
            No active pools found in this cluster.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pools.map((pool) => {
              const capacityPercent = Math.min(
                100,
                Math.round((pool.current_pooled_kg / pool.target_capacity_kg) * 100)
              );

              return (
                <div
                  key={pool.id}
                  className="bg-white rounded-3xl border border-[#DCE8D7] p-6 shadow-sm space-y-5 hover:border-[#286443] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#DCE8D7] text-[#153D2B]">
                          {pool.pool_code}
                        </span>
                        <h3 className="font-editorial text-lg font-bold text-[#153D2B] mt-1">
                          {pool.title}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-amber-100 text-amber-900 border border-amber-300">
                        {pool.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#286443]" />
                        <span>Pickup: {pool.collection_point}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{pool.pickup_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-purple-600" />
                        <span>{pool.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{pool.carbon_reduction_kg} kg CO2 Avoided</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#153D2B]">Capacity Progress:</span>
                        <span className="text-[#286443]">
                          {pool.current_pooled_kg.toLocaleString()} / {pool.target_capacity_kg.toLocaleString()} kg ({capacityPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-[#DCE8D7]">
                        <div
                          className="h-full bg-gradient-to-r from-[#286443] to-[#C7F36B] transition-all duration-500 rounded-full"
                          style={{ width: `${capacityPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Participants Roster */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#153D2B] uppercase tracking-wider block mb-2">
                        Participating Farmers ({pool.participants?.length || 0})
                      </span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {pool.participants && pool.participants.length > 0 ? (
                          pool.participants.map((p) => (
                            <div
                              key={p.id}
                              className="p-2 bg-[#F7F5EC] rounded-lg text-xs flex items-center justify-between"
                            >
                              <div>
                                <strong className="text-[#153D2B]">{p.farmer_name}</strong>
                                <span className="text-stone-500 text-[11px] ml-1">
                                  ({p.village})
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[#286443]">
                                {p.quantity_kg} kg ({p.crate_count} crates)
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-stone-400">No farmers joined yet. Be the first!</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pool Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Est. Farmer Savings</span>
                      <span className="font-editorial text-sm font-bold text-[#286443]">
                        ₹2.70 saved per kg (60% off)
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPoolToJoin(pool)}
                      className="px-4 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join This Pool</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join Pool Modal */}
      {selectedPoolToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                  Join Harvest Pool {selectedPoolToJoin.pool_code}
                </h3>
                <p className="text-xs text-stone-500">{selectedPoolToJoin.village_cluster}</p>
              </div>
              <button
                onClick={() => setSelectedPoolToJoin(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinPool} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#153D2B] mb-1">Crop Produce Name</label>
                <input
                  type="text"
                  required
                  value={joinProduce}
                  onChange={(e) => setJoinProduce(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-[#153D2B] mb-1">
                  Quantity to Pool (kg)
                </label>
                <input
                  type="number"
                  min="25"
                  step="25"
                  required
                  value={joinQuantity}
                  onChange={(e) => setJoinQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#DCE8D7] rounded-xl font-bold text-sm"
                />
              </div>

              {/* Instant Savings Preview */}
              <div className="p-3.5 bg-[#C7F36B]/30 border border-[#286443]/30 rounded-xl space-y-1">
                <span className="font-bold text-[#153D2B] block">Estimated Freight Savings:</span>
                <div className="text-lg font-editorial font-black text-[#286443]">
                  {formatCurrency(joinQuantity * (selectedPoolToJoin.individual_freight_est - selectedPoolToJoin.pooled_freight_est))}
                </div>
                <span className="text-[10px] text-stone-600 block">
                  Solo tempo cost: {formatCurrency(joinQuantity * 4.5)} vs Pooled cost: {formatCurrency(joinQuantity * 1.8)}
                </span>
              </div>

              {joinSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{joinSuccess}</span>
                </div>
              )}

              {joinError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-xs shadow-md transition-colors disabled:opacity-50"
              >
                {isJoining ? 'Reserving Cargo Slot...' : 'Confirm Harvest Pool Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
