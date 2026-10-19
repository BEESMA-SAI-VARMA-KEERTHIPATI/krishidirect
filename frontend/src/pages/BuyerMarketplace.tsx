import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProduceListing } from '../types';
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
} from 'lucide-react';

export const BuyerMarketplace: React.FC = () => {
  const { addToCart, setIsCartOpen } = useAuth();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDetail, setSelectedDetail] = useState<ProduceListing | null>(null);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, gradeFilter, sortBy]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const categories = [
    { id: 'all', label: 'All Crops' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'grains', label: 'Grains & Cereals' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'spices', label: 'Spices' },
    { id: 'pulses', label: 'Pulses' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title & Search Filter Bar */}
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#286443]">
            Verified Direct Sourcing
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#153D2B]">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-xs text-stone-600 max-w-2xl mt-1">
            Browse harvest lots directly from certified smallholders. All produce is graded,
            weighed, and backed by cryptographic delivery OTP escrow protection.
          </p>
        </div>

        {/* Search & Category Pills */}
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
                className="text-xs py-2.5 px-3 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl text-[#153D2B] font-semibold"
              >
                <option value="all">All Grades</option>
                <option value="Grade A">Grade A (Export / Prime)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Grade C">Grade C (Processing)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-2.5 px-3 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl text-[#153D2B] font-semibold"
              >
                <option value="newest">Sort: Newest Harvest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity_desc">Available Volume</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#153D2B] text-[#C7F36B] rounded-xl text-xs font-bold hover:bg-[#286443] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#286443] text-white shadow-sm'
                    : 'bg-[#F7F5EC] text-stone-600 hover:bg-[#DCE8D7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#286443] font-semibold animate-pulse">
          Loading live farm gate produce catalog...
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#DCE8D7] text-center space-y-2">
          <p className="text-sm font-bold text-[#153D2B]">No produce found matching your search</p>
          <p className="text-xs text-stone-500">Try clearing your filters or search keywords.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setGradeFilter('all');
            }}
            className="mt-3 px-4 py-2 bg-[#153D2B] text-[#C7F36B] text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#DCE8D7] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className="relative h-48 overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => setSelectedDetail(item)}
                >
                  <img
                    src={item.image_url}
                    alt={item.produce_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                    {item.description || 'Direct farm harvested, sorted by size and quality.'}
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
                  onClick={() => setSelectedDetail(item)}
                  className="py-2 border border-[#DCE8D7] hover:bg-[#F7F5EC] text-[#153D2B] text-xs font-bold rounded-xl transition-colors"
                >
                  Inspect
                </button>

                <button
                  onClick={() => addToCart(item, 50)}
                  className="py-2 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Direct</span>
                </button>
              </div>
            </div>
          ))}
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
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-[#153D2B]/90 text-[#C7F36B] text-xs font-bold">
                {selectedDetail.quality_grade}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
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
                    {selectedDetail.farmer?.full_name || 'Ramesh Patel (Verified Farmer)'}
                  </strong>
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
                  className="flex-1 py-3 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add 50 {selectedDetail.unit} to Cart</span>
                </button>

                <button
                  onClick={() => {
                    addToCart(selectedDetail, 100);
                    setSelectedDetail(null);
                  }}
                  className="flex-1 py-3 bg-[#286443] hover:bg-[#153D2B] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <span>Bulk 100 {selectedDetail.unit}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
