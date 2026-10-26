import React from 'react';
import { CartItem, StoreOffer } from '../types';
import { calculateTotals } from '../utils/cartMath';
import { ShoppingBag, ArrowRight, Sparkles, Gift } from 'lucide-react';

interface FloatingCartBarProps {
  items: CartItem[];
  offer: StoreOffer | null;
  onOpenCheckout: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  items,
  offer,
  onOpenCheckout,
}) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) return null;

  const totals = calculateTotals(items, offer);
  const estSavings = Math.round(totals.subtotal * 0.25) + 35 + 12;

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none animate-slide-up"
      aria-live="polite"
    >
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-[#2E4823] text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_12px_32px_rgba(46,72,35,0.4)] border border-white/15 flex items-center justify-between gap-3">
          {/* Cart stats */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D3452B] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalQuantity}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-['Playfair_Display'] text-base sm:text-lg font-bold">
                  ₹{totals.final_total}
                </span>
                {totals.discount_amount > 0 && (
                  <span className="text-xs text-emerald-300 font-bold">
                    (-₹{totals.discount_amount} OFF)
                  </span>
                )}
                <span className="text-xs text-white/70">
                  ({totalQuantity} {totalQuantity === 1 ? 'dish' : 'dishes'})
                </span>
                <span className="text-[10px] font-extrabold bg-amber-400 text-[#2E4823] px-2 py-0.5 rounded-full shadow-2xs">
                  Save ~₹{estSavings} vs Apps
                </span>
              </div>

              {/* Offer incentive text */}
              <div className="flex items-center gap-1.5 text-[11px] text-amber-200 mt-0.5">
                {totals.free_item_name ? (
                  <>
                    <Gift className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>Free {totals.free_item_name} Included!</span>
                  </>
                ) : totals.has_discount ? (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>{offer?.discount_percent}% Direct Discount Qualified!</span>
                  </>
                ) : offer && Number(offer.min_order_amount) > 0 ? (
                  <span>Add ₹{totals.amount_for_discount} more for {offer.discount_percent}% OFF</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={onOpenCheckout}
            className="btn-md rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold flex items-center shadow-md transition-all transform active:scale-95 shrink-0"
          >
            <span>Checkout</span>
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
