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
  const cleanFreeItemName = totals.free_item_name
    ? totals.free_item_name.replace(/^free\s+/i, '')
    : null;

  return (
    <div
      className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none animate-slide-up"
      aria-live="polite"
    >
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div
          onClick={onOpenCheckout}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCheckout();
            }
          }}
          className="bg-[#2E4823] hover:bg-[#283e1f] text-white rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-[0_12px_32px_rgba(46,72,35,0.4)] border border-white/15 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
        >
          {/* Cart stats */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D3452B] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalQuantity}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="font-['Playfair_Display'] text-base sm:text-lg font-bold tracking-tight">
                  ₹{totals.final_total}
                </span>
                {totals.discount_amount > 0 && (
                  <span className="text-[11px] sm:text-xs text-emerald-300 font-bold shrink-0">
                    (-₹{totals.discount_amount})
                  </span>
                )}
                <span className="text-[11px] sm:text-xs text-white/75 shrink-0">
                  • {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold bg-amber-400 text-[#2E4823] px-1.5 py-0.5 rounded-full shadow-2xs shrink-0">
                  Save ~₹{estSavings} vs Apps
                </span>
              </div>

              {/* Offer incentive text */}
              <div className="flex items-center gap-1 text-[11px] text-amber-200 mt-0.5 truncate">
                {cleanFreeItemName ? (
                  <>
                    <Gift className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="truncate font-medium">Free {cleanFreeItemName} Included!</span>
                  </>
                ) : totals.has_discount ? (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="truncate font-medium">{offer?.discount_percent}% Direct Discount Applied!</span>
                  </>
                ) : offer && Number(offer.min_order_amount) > 0 ? (
                  <span className="truncate">Add ₹{totals.amount_for_discount} for {offer.discount_percent}% OFF</span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-300/90">Direct Order · Save vs Swiggy/Zomato</span>
                )}
              </div>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCheckout();
            }}
            className="btn-md rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 shadow-md transition-all transform active:scale-95 shrink-0"
          >
            <span className="text-sm font-bold">Checkout</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
