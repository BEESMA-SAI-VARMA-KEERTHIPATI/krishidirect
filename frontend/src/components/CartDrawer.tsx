import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatCurrency } from '../services/i18n';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    user,
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    setActiveTab,
  } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.village ? `${user.village}, ${user.district || 'Hyderabad'}` : 'Flat 402, Banjara Hills, Hyderabad, Telangana - 500034'
  );
  const [deliveryMethod, setDeliveryMethod] = useState<string>('standard_transport');
  const [paymentMethod, setPaymentMethod] = useState<string>('demo_upi');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  if (!isCartOpen) return null;

  const produceTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.listing.asking_price,
    0
  );
  const directFreight = cart.length > 0 ? 180.0 : 0.0;
  const platformFee = roundTwo(produceTotal * 0.02);
  const totalAmount = produceTotal + directFreight + platformFee;

  function roundTwo(num: number) {
    return Math.round(num * 100) / 100;
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your delivery destination address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Process first cart item (single order creation per listing item in prototype)
      const primaryItem = cart[0];
      const orderPayload = {
        listing_id: primaryItem.listing.id,
        quantity: primaryItem.quantity,
        delivery_address: deliveryAddress,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      setConfirmedOrder(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review stock limits.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F5EC] w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#DCE8D7]">
        {/* Cart Header */}
        <div className="bg-[#153D2B] text-[#F7F5EC] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C7F36B]" />
            <h3 className="font-editorial text-lg font-bold">Your Produce Cart</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#286443] text-[#C7F36B] font-bold">
              {cart.length}
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setConfirmedOrder(null);
            }}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Confirmed Screen */}
        {confirmedOrder ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#C7F36B]/40 text-[#153D2B] flex items-center justify-center border-2 border-[#286443]">
              <CheckCircle2 className="w-8 h-8 text-[#286443]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#286443]">
                Order Confirmed & Escrow Secured
              </span>
              <h4 className="font-editorial text-2xl font-bold text-[#153D2B] mt-1">
                Order #{confirmedOrder.order_number}
              </h4>
              <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto">
                Payment of {formatCurrency(confirmedOrder.total_amount)} held safely in escrow.
                Farmer has received notification to pack your harvest.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-left w-full text-xs">
              <span className="font-bold text-amber-900 block">Your Delivery Verification OTP:</span>
              <div className="text-2xl font-mono font-black text-[#153D2B] tracking-widest my-1">
                {confirmedOrder.demo_otp_preview || '4821'}
              </div>
              <p className="text-[11px] text-amber-800">
                Share this OTP with the transporter partner upon physical delivery inspection.
              </p>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setConfirmedOrder(null);
                setActiveTab('orders');
              }}
              className="w-full py-3 bg-[#153D2B] text-[#C7F36B] rounded-xl font-bold text-sm hover:bg-[#286443] transition-colors flex items-center justify-center gap-2"
            >
              <span>Track in Trust Passport</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-2 text-[#286443]/40" />
                  <p className="text-sm font-medium text-stone-600">Your harvest cart is empty</p>
                  <p className="text-xs text-stone-400 max-w-xs mt-1">
                    Explore fresh produce direct from verified farmers in the marketplace.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.listing.id}
                    className="p-3.5 bg-white rounded-xl border border-[#DCE8D7] shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#153D2B]">
                        {item.listing.produce_name}
                      </h4>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {item.listing.quality_grade} • {item.listing.farm_location}
                      </div>
                      <div className="text-xs font-semibold text-[#286443] mt-1">
                        {formatCurrency(item.listing.asking_price)} / {item.listing.unit}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.listing.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-sm font-bold text-[#153D2B]">
                        {item.quantity} {item.listing.unit} ={' '}
                        {formatCurrency(item.quantity * item.listing.asking_price)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div className="space-y-4 pt-2">
                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-bold text-[#153D2B] mb-1">
                      Delivery Destination Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 bg-white border border-[#DCE8D7] rounded-xl focus:ring-2 focus:ring-[#286443] focus:outline-none"
                      placeholder="Enter buyer warehouse or retail address..."
                    />
                  </div>

                  {/* Demo Payment Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#153D2B] mb-1.5">
                      Simulated Escrow Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('demo_upi')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'demo_upi'
                            ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                            : 'bg-white border-[#DCE8D7] text-[#202820]'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-[11px] font-bold">UPI Auto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('demo_card')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'demo_card'
                            ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                            : 'bg-white border-[#DCE8D7] text-[#202820]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[11px] font-bold">Card Escrow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('demo_netbanking')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'demo_netbanking'
                            ? 'bg-[#153D2B] text-[#C7F36B] border-[#153D2B]'
                            : 'bg-white border-[#DCE8D7] text-[#202820]'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        <span className="text-[11px] font-bold">NetBanking</span>
                      </button>
                    </div>
                  </div>

                  {/* Transparent Cost Breakdown */}
                  <div className="p-3.5 bg-white border border-[#DCE8D7] rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-600">
                      <span>Produce Value:</span>
                      <span className="font-semibold">{formatCurrency(produceTotal)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Direct Farm Freight:</span>
                      <span className="font-semibold">{formatCurrency(directFreight)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>KrishiDirect 2% Escrow & Quality Fee:</span>
                      <span className="font-semibold">{formatCurrency(platformFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-bold text-[#153D2B]">
                      <span>Total Escrow Amount:</span>
                      <span className="text-[#286443] font-editorial text-base">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-[#DCE8D7]">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#286443]" />
                  <span>Farmer is paid upon physical OTP delivery confirmation.</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#153D2B] hover:bg-[#286443] text-[#C7F36B] rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Escrow Transaction...</span>
                  ) : (
                    <>
                      <span>Authorize Payment ({formatCurrency(totalAmount)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
