import React, { useEffect, useRef } from 'react';
import { GroupedMobileDish, ItemVariantOption } from '../../utils/menuVariants';
import { CartItem } from '../../types';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

interface MenuSizePickerModalProps {
  isOpen: boolean;
  dish: GroupedMobileDish | null;
  cartItems: CartItem[];
  onClose: () => void;
  onSelectVariant: (dish: GroupedMobileDish, variant: ItemVariantOption) => void;
  onUpdateCartQuantity: (id: number | string, delta: number) => void;
}

export const MenuSizePickerModal: React.FC<MenuSizePickerModalProps> = ({
  isOpen,
  dish,
  cartItems,
  onClose,
  onSelectVariant,
  onUpdateCartQuantity,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dish) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Select size for ${dish.name}`}
        className="relative z-10 w-full bg-[#FDFBF7] rounded-t-3xl max-h-[70vh] flex flex-col shadow-2xl border-t border-[#2E4823]/15 animate-slide-up"
      >
        {/* Drag handle visual */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-[#1C1C1C]/20 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 flex items-start justify-between border-b border-[#2E4823]/10">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                  dish.isVeg ? 'border-green-600' : 'border-[#D3452B]'
                }`}
                role="img"
                aria-label={dish.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dish.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                  }`}
                />
              </span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Select Portion Size
              </span>
            </div>
            <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#1C1C1C] leading-snug">
              {dish.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-700 transition-colors shrink-0"
            aria-label="Close size selector"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Variants List */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {dish.variants.map((v) => {
            const variantCartId = `${v.dishId}:${v.size.toLowerCase()}`;
            const cartItem = cartItems.find(
              (c) => String(c.id) === variantCartId || String(c.id) === String(v.dishId)
            );
            const isSoldOut = v.isCompleted;

            return (
              <div
                key={v.size}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSoldOut
                    ? 'bg-red-50/20 border-red-200/50 opacity-60'
                    : cartItem
                    ? 'bg-[#2E4823]/5 border-[#2E4823]/30 shadow-2xs'
                    : 'bg-white border-[#2E4823]/15 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1C1C]">
                      {v.size} Portion
                    </span>
                    {isSoldOut && (
                      <span className="text-[9px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                        Sold out
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-base text-[#2E4823]">
                      ₹{v.price}
                    </span>
                    {v.aggregatorPrice && v.aggregatorPrice > v.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{v.aggregatorPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div>
                  {isSoldOut ? (
                    <button
                      type="button"
                      disabled
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold border border-gray-200 cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  ) : cartItem ? (
                    <div className="min-h-[36px] flex items-center bg-[#2E4823] text-white rounded-lg shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateCartQuantity(cartItem.id, -1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-l-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCartQuantity(cartItem.id, 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-r-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectVariant(dish, v)}
                      className="min-h-[36px] min-w-[72px] px-4 py-1.5 rounded-lg bg-white hover:bg-red-50/50 text-[#D3452B] border border-[#D3452B] font-bold text-xs shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
