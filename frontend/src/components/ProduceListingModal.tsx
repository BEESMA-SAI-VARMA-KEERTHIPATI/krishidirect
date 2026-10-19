import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../services/i18n';

interface ProduceListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: () => void;
  onOpenFairPriceAdvisor?: (name: string, price: number, grade: string) => void;
}

export const ProduceListingModal: React.FC<ProduceListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
  onOpenFairPriceAdvisor,
}) => {
  const { user } = useAuth();

  const [produceName, setProduceName] = useState<string>('');
  const [category, setCategory] = useState<string>('vegetables');
  const [variety, setVariety] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [availableQuantity, setAvailableQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<string>('kg');
  const [askingPrice, setAskingPrice] = useState<number>(30.0);
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A');
  const [farmLocation, setFarmLocation] = useState<string>(
    user?.village ? `${user.village}, ${user.district || 'Warangal'}` : 'Patel Organic Farms, Warangal'
  );
  const [pickupMethod, setPickupMethod] = useState<string>('collection_point');
  const [harvestDate, setHarvestDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produceName.trim()) {
      setErrorMsg('Please specify the produce name.');
      return;
    }
    if (availableQuantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (askingPrice <= 0) {
      setErrorMsg('Price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createListing({
        produce_name: produceName,
        category,
        variety: variety || undefined,
        description: description || undefined,
        image_url:
          imageUrl ||
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        available_quantity: availableQuantity,
        unit,
        asking_price: askingPrice,
        quality_grade: qualityGrade,
        harvest_date: harvestDate,
        farm_location: farmLocation,
        pickup_method: pickupMethod,
      });

      if (onListingCreated) onListingCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish harvest listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] border-2 border-[#153D2B] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold">List Your Harvest</h3>
            <p className="text-xs text-[#C7F36B]">Direct Farmer Listing • Zero Intermediary Cut</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Produce Name *
              </label>
              <input
                type="text"
                required
                value={produceName}
                onChange={(e) => setProduceName(e.target.value)}
                placeholder="e.g. Fresh Red Tomatoes"
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl focus:ring-1 focus:ring-[#286443]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Produce Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl focus:ring-1 focus:ring-[#286443]"
              >
                <option value="vegetables">Vegetables</option>
                <option value="grains">Grains & Cereals</option>
                <option value="fruits">Fruits</option>
                <option value="spices">Spices</option>
                <option value="pulses">Pulses</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="quintal">Quintal (100 kg)</option>
                <option value="crate">Crates (25 kg each)</option>
                <option value="ton">Tons</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#153D2B]">Asking Price *</label>
                {onOpenFairPriceAdvisor && (
                  <button
                    type="button"
                    onClick={() => onOpenFairPriceAdvisor(produceName, askingPrice, qualityGrade)}
                    className="text-[10px] text-[#286443] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3 text-[#E7B85C]" />
                    <span>AI Fair Price</span>
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.5"
                required
                min="1"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl font-bold text-[#153D2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
              >
                <option value="Grade A">Grade A (Export / Prime Uniform)</option>
                <option value="Grade B">Grade B (Standard Wholesale)</option>
                <option value="Grade C">Grade C (Processing / Rapid Clear)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Farm / Collection Location *
              </label>
              <input
                type="text"
                required
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153D2B] mb-1">
                Preferred Pickup / Delivery Method
              </label>
              <select
                value={pickupMethod}
                onChange={(e) => setPickupMethod(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
              >
                <option value="collection_point">Village FPO Collection Point</option>
                <option value="farm_pickup">Direct Farm Pickup</option>
                <option value="direct_delivery">Delivered to Buyer Mandi/Hub</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#153D2B] mb-1">
              Description & Quality Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Drip irrigated, pest-free, harvested early morning for crispness..."
              className="w-full text-xs p-2.5 bg-[#F7F5EC] border border-[#DCE8D7] rounded-xl"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Harvest Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
