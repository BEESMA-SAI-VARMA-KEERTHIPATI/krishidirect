import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProduceListing, Order } from '../types';
import { formatCurrency } from '../services/i18n';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Heart,
  Zap,
  Package,
  ShieldCheck,
  Truck,
  ArrowRight,
  FileCheck2,
  X,
} from 'lucide-react';
import { TrustPassportModal } from '../components/TrustPassportModal';

export const BuyerMarketplace: React.FC<{ isDashboardView?: boolean }> = ({ isDashboardView = false }) => {
  const { user, addToCart, setIsCartOpen, navigate } = useAuth();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<ProduceListing | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'marketplace' | 'orders'>('marketplace');
  const [selectedPassportOrder, setSelectedPassportOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchListings();
    if (user?.role === 'buyer') {
      fetchBuyerOrders();
    }
  }, [selectedCategory, gradeFilter, sortBy, user]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getListings({
        q: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        quality_grade: gradeFilter !== 'all' ? gradeFilter : undefined,
        sort_by: sortBy,
      });
      setListings(data);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuyerOrders = async () => {
    try {
      const orders = await api.getOrders();
      setBuyerOrders(orders);
    } catch (err) {
      console.error('Error loading buyer orders:', err);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleBuyNow = (listing: ProduceListing, qty: number = 50) => {
    addToCart(listing, qty);
    setIsCartOpen(true);
    setSelectedDetail(null);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? Funds held in escrow will be refunded.')) return;
    try {
      await api.cancelOrder(orderId);
      fetchBuyerOrders();
    } catch (err: any) {
      alert(`Could not cancel order: ${err.message}`);
    }
  };

  const categories = [
    { id: 'all', label: 'All Crops' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'grains', label: 'Grains & Cereals' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'spices', label: 'Spices' },
    { id: 'pulses', label: 'Pulses' },
  ];

  const displayedListings = showFavoritesOnly
    ? listings.filter((l) => favorites.includes(l.id))
    : listings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title & Sourcing Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
              Buyer Sourcing Terminal
            </span>
            {user?.role === 'buyer' && (
              <span className="text-xs text-stone-500 font-medium">
                Welcome, {user.full_name}
              </span>
            )}
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#153D2B] mt-1">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-xs text-stone-600 max-w-2xl mt-1">
            Source graded harvests directly from verified smallholder farmers across Telangana.
            All transactions backed by cryptographic delivery OTP escrow protection.
          </p>
        </div>

        {/* Buyer View Navigation Tabs */}
        {user?.role === 'buyer' && (
          <div className="flex items-center bg-white border border-[#DCE8D7] rounded-xl p-1 shadow-sm text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('marketplace')}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'marketplace'
                  ? 'bg-[#153D2B] text-[#C7F36B]'
                  : 'text-stone-600 hover:text-[#153D2B]'
              }`}
            >
              Browse Catalogue
            </button>
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'orders'
                  ? 'bg-[#153D2B] text-[#C7F36B]'
                  : 'text-stone-600 hover:text-[#153D2B]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>My Orders ({buyerOrders.length})</span>
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'marketplace' ? (
        <>
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCE8D7] shadow-sm space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tomatoes, Sona Masoori rice, red onions, Guntur chillies..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#286443]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="text-xs py-2.5 px-3 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl text-[#153D2B] font-semibold focus:outline-none"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Organic Certified">Organic Certified</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs py-2.5 px-3 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl text-[#153D2B] font-semibold focus:outline-none"
                >
                  <option value="newest">Recently Harvested</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="quantity_desc">Available Quantity</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    showFavoritesOnly
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-[#F7F5EC] text-stone-600 border-[#DCE8D7] hover:bg-stone-100'
                  }`}
                  title="Filter Favorites"
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span className="hidden sm:inline">Favorites</span>
                </button>
              </div>
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#153D2B] text-[#C7F36B] font-bold shadow-sm'
                      : 'bg-[#F7F5EC] text-[#202820]/70 hover:bg-[#DCE8D7]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transparent Escrow Guarantee Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0" />
              <div>
                <strong>Cryptographic Buyer Escrow Protection:</strong> Funds are safely held in demo escrow until you inspect the cargo and provide the 4-digit Delivery OTP to the transporter.
              </div>
            </div>
            <div className="text-[11px] text-emerald-800 font-mono whitespace-nowrap">
              Fixed Freight: ₹180.00 • Escrow Fee: 2%
            </div>
          </div>

          {/* Produce Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-stone-500 space-y-2">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#286443] border-t-transparent"></div>
              <p className="text-xs">Loading harvest lots from certified farmers...</p>
            </div>
          ) : displayedListings.length === 0 ? (
            <div className="py-20 text-center text-stone-400 space-y-3 bg-white rounded-3xl border border-[#DCE8D7]">
              <Package className="w-12 h-12 mx-auto text-stone-300" />
              <p className="text-sm font-semibold text-stone-600">No produce listings found matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setGradeFilter('all');
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                }}
                className="px-4 py-2 bg-[#153D2B] text-[#C7F36B] rounded-xl text-xs font-bold hover:bg-[#286443] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedListings.map((item) => {
                const isFav = favorites.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl border border-[#DCE8D7] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-stone-100 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.produce_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="absolute top-2.5 left-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-stone-600 shadow-sm transition-colors cursor-pointer"
                          title="Save to favorites"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#153D2B]/85 text-[#C7F36B] text-[10px] font-bold backdrop-blur-sm">
                          {item.quality_grade}
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/65 text-white text-[10px] backdrop-blur-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C7F36B]" />
                          <span>{item.district || item.farm_location}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#286443] bg-[#C7F36B]/20 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Harvested {item.harvest_date ? new Date(item.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedDetail(item)}
                          className="font-bold text-sm text-[#153D2B] hover:text-[#286443] cursor-pointer line-clamp-1"
                        >
                          {item.produce_name}
                        </h3>

                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {item.description || 'Direct farm harvested, graded for uniform size and freshness.'}
                        </p>

                        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 block">Direct Price</span>
                            <span className="font-editorial text-lg font-bold text-[#286443]">
                              {formatCurrency(item.asking_price)}
                            </span>
                            <span className="text-xs text-stone-500">/{item.unit}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block">Available</span>
                            <span className="text-xs font-bold text-[#153D2B]">
                              {item.available_quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addToCart(item, 50)}
                        className="py-2.5 border border-[#DCE8D7] hover:bg-[#F7F5EC] text-[#153D2B] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => handleBuyNow(item, 50)}
                        className="py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Buyer Orders & Delivery Tracking Tab */
        <div className="bg-white p-6 rounded-3xl border border-[#DCE8D7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE8D7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#153D2B]">
                Your Sourcing Orders & Escrow Tracking
              </h3>
              <p className="text-xs text-stone-500">
                Track produce shipments, inspect Trust Passports, and verify delivery with your OTP code.
              </p>
            </div>
            <button
              onClick={fetchBuyerOrders}
              className="px-3.5 py-1.5 bg-[#F7F5EC] hover:bg-[#DCE8D7] text-[#153D2B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {buyerOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">You have no active or historical orders yet.</p>
              <button
                onClick={() => setActiveSubTab('marketplace')}
                className="px-4 py-2 bg-[#153D2B] text-[#C7F36B] rounded-xl text-xs font-bold hover:bg-[#286443] transition-colors"
              >
                Browse Produce Catalogue
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F5EC] text-stone-600 font-bold border-b border-[#DCE8D7]">
                    <th className="p-3 rounded-l-xl">Order #</th>
                    <th className="p-3">Farmer & Location</th>
                    <th className="p-3">Produce & Qty</th>
                    <th className="p-3">Total Cost</th>
                    <th className="p-3">Escrow Status</th>
                    <th className="p-3">Delivery Status</th>
                    <th className="p-3">Delivery OTP</th>
                    <th className="p-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE8D7]/60">
                  {buyerOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-black/[0.01] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#153D2B]">
                        {order.order_number}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-stone-800">
                          {order.seller?.full_name || 'Ramesh Patel (Farmer)'}
                        </span>
                        <div className="text-[10px] text-stone-500">
                          {order.delivery_address}
                        </div>
                      </td>
                      <td className="p-3">
                        <strong className="text-[#153D2B]">{order.produce_name}</strong>
                        <div className="text-[11px] text-stone-500">
                          {order.quantity} {order.unit}
                        </div>
                      </td>
                      <td className="p-3 font-editorial text-sm font-bold text-[#286443]">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {order.payment_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            order.status === 'delivered'
                              ? 'bg-[#C7F36B]/50 text-[#153D2B]'
                              : order.status === 'in_transit'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {order.demo_otp_preview ? (
                          <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#153D2B] bg-[#C7F36B]/40 px-2 py-0.5 rounded border border-[#286443]/30 w-fit">
                            <span>🔑</span>
                            <span>{order.demo_otp_preview}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400">Verified</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPassportOrder(order)}
                            className="px-2.5 py-1.5 bg-[#F7F5EC] hover:bg-[#DCE8D7] text-[#153D2B] rounded-lg text-xs font-semibold border border-[#DCE8D7] transition-colors cursor-pointer"
                          >
                            Trust Passport
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Produce Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-56 bg-stone-100 flex-shrink-0">
              <img
                src={selectedDetail.image_url}
                alt={selectedDetail.produce_name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-[#153D2B]/90 text-[#C7F36B] text-xs font-bold">
                {selectedDetail.quality_grade}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white text-left">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#153D2B]">
                    {selectedDetail.produce_name}
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#286443]" />
                    <span>{selectedDetail.farm_location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-editorial text-2xl font-bold text-[#286443]">
                    {formatCurrency(selectedDetail.asking_price)}
                    <span className="text-xs text-stone-500 font-sans">/{selectedDetail.unit}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Zero Middleman Surcharge</span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F5EC] rounded-2xl border border-[#DCE8D7] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">Available Quantity</span>
                  <strong className="text-[#153D2B]">
                    {selectedDetail.available_quantity} {selectedDetail.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Harvest Date</span>
                  <strong className="text-[#153D2B]">{selectedDetail.harvest_date || 'Today'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Dispatch Method</span>
                  <strong className="capitalize text-[#153D2B]">
                    {selectedDetail.pickup_method.replace(/_/g, ' ')}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Farmer / FPO</span>
                  <strong className="text-[#286443]">
                    {selectedDetail.farmer?.full_name || 'Verified Farmer'}
                  </strong>
                </div>
              </div>

              {/* Price & Delivery Cost Breakdown */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 font-mono">
                <span className="font-bold text-[#153D2B] block font-sans">Transparent Delivery Breakdown (Estimate)</span>
                <div className="flex justify-between text-stone-600">
                  <span>Produce (50 {selectedDetail.unit}):</span>
                  <span>{formatCurrency(selectedDetail.asking_price * 50)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Fixed Rural Freight:</span>
                  <span>₹180.00</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Platform Escrow Fee (2%):</span>
                  <span>{formatCurrency(selectedDetail.asking_price * 50 * 0.02)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#153D2B] pt-1 border-t border-stone-200 font-sans">
                  <span>Total Escrow Amount:</span>
                  <span>{formatCurrency(selectedDetail.asking_price * 50 + 180 + selectedDetail.asking_price * 50 * 0.02)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#153D2B] mb-1">Quality & Harvest Details</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedDetail.description || 'Grown with sustainable irrigation. Inspected for uniform size, firmness, and natural color.'}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedDetail, 50);
                    setSelectedDetail(null);
                  }}
                  className="flex-1 py-3 border border-[#DCE8D7] hover:bg-[#F7F5EC] text-[#153D2B] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add 50 {selectedDetail.unit} to Cart</span>
                </button>

                <button
                  onClick={() => handleBuyNow(selectedDetail, 50)}
                  className="flex-1 py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now (50 {selectedDetail.unit})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Passport Modal */}
      <TrustPassportModal
        isOpen={!!selectedPassportOrder}
        order={selectedPassportOrder}
        onClose={() => setSelectedPassportOrder(null)}
      />
    </div>
  );
};
