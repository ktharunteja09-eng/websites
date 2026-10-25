import React from 'react';
import { GroupedMobileDish } from '../../utils/menuVariants';
import { OptimizedImage } from '../OptimizedImage';
import { CartItem } from '../../types';

interface MenuBestsellersCarouselProps {
  bestsellers: GroupedMobileDish[];
  cartItems: CartItem[];
  onAddToCart: (dish: GroupedMobileDish, size?: string) => void;
  onUpdateCartQuantity: (id: number | string, delta: number) => void;
  onOpenSizePicker: (dish: GroupedMobileDish) => void;
}

export const MenuBestsellersCarousel: React.FC<MenuBestsellersCarouselProps> = ({
  bestsellers,
  cartItems,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenSizePicker,
}) => {
  if (bestsellers.length === 0) return null;

  return (
    <section
      aria-label="Popular Bestsellers"
      className="md:hidden mb-6 -mx-4 px-4 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D3452B]" />
          <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823]">
            Bestsellers
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          Swipe to explore
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-pl-4 pb-2 pt-0.5">
        {bestsellers.map((dish, idx) => {
          const hasVariants = dish.variants.length > 0;
          const isCompleted = dish.primaryDish.is_completed;

          // Check if dish is in cart (either base ID or any variant ID)
          const singleCartItem = !hasVariants
            ? cartItems.find((c) => String(c.id) === String(dish.primaryDish.id))
            : null;

          // Count total quantity for dishes with variants
          const variantCartCount = hasVariants
            ? cartItems.reduce((sum, c) => {
                const matches = dish.variants.some(
                  (v) => String(c.id) === `${v.dishId}:${v.size.toLowerCase()}` || String(c.id) === String(v.dishId)
                );
                return matches ? sum + c.quantity : sum;
              }, 0)
            : 0;

          return (
            <article
              key={dish.baseId}
              className={`w-[62vw] max-w-[220px] shrink-0 snap-start bg-white rounded-2xl p-2.5 border border-[#2E4823]/10 shadow-xs flex flex-col justify-between transition-colors ${
                isCompleted ? 'opacity-60 bg-red-50/20' : ''
              }`}
            >
              <div>
                {/* Image on top (aspect-square) */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-[#F7F3EB]">
                  {dish.image && (
                    <OptimizedImage
                      src={dish.image}
                      alt={dish.name}
                      width={220}
                      height={220}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      priority={idx < 4}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {dish.isChefSpecial && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase font-bold text-white bg-[#D3452B] px-1.5 py-0.5 rounded shadow-xs">
                      Special
                    </span>
                  )}
                </div>

                {/* Veg/Non-veg indicator + Name */}
                <div className="flex items-start gap-1.5 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 mt-0.5 ${
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
                  <h3 className="text-xs sm:text-sm font-bold text-[#1C1C1C] leading-snug line-clamp-2">
                    {dish.name}
                  </h3>
                </div>

                {/* Price / Size Variants chips */}
                <div className="mt-1.5 min-h-[22px]">
                  {hasVariants ? (
                    <div className="flex flex-wrap gap-1">
                      {dish.variants.map((v) => (
                        <span
                          key={v.size}
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#2E4823]/8 text-[#2E4823] border border-[#2E4823]/15 whitespace-nowrap"
                        >
                          {v.size} ₹{v.price}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-bold text-xs sm:text-sm text-[#2E4823]">
                      ₹{dish.primaryDish.price}
                    </span>
                  )}
                </div>
              </div>

              {/* ADD Button / Stepper */}
              <div className="mt-2.5 pt-2 border-t border-[#2E4823]/10 flex items-center justify-between">
                {isCompleted ? (
                  <button
                    type="button"
                    disabled
                    className="w-full min-h-[36px] py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  >
                    Sold out
                  </button>
                ) : hasVariants ? (
                  <button
                    type="button"
                    onClick={() => onOpenSizePicker(dish)}
                    className="w-full min-h-[36px] py-1 px-3 text-xs font-bold rounded-lg bg-white hover:bg-red-50/50 text-[#D3452B] border border-[#D3452B] shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <span>{variantCartCount > 0 ? `${variantCartCount} Added` : 'Add'}</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : singleCartItem ? (
                  <div className="w-full min-h-[36px] flex items-center justify-between bg-[#2E4823] text-white rounded-lg shadow-2xs px-1">
                    <button
                      type="button"
                      onClick={() => onUpdateCartQuantity(singleCartItem.id, -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded active:scale-90 transition-all"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-xs font-bold font-mono px-2">
                      {singleCartItem.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateCartQuantity(singleCartItem.id, 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded active:scale-90 transition-all"
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
                    onClick={() => onAddToCart(dish)}
                    className="w-full min-h-[36px] py-1 px-3 text-xs font-bold rounded-lg bg-white hover:bg-red-50/50 text-[#D3452B] border border-[#D3452B] shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
