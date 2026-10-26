import React from 'react';
import { GroupedMobileDish } from '../../utils/menuVariants';
import { CartItem } from '../../types';
import { OptimizedImage } from '../OptimizedImage';

interface MenuMobileItemCardProps {
  dish: GroupedMobileDish;
  imageIndex: number;
  cartItems: CartItem[];
  isUnlocked?: boolean;
  onAddToCart: (dish: GroupedMobileDish) => void;
  onUpdateCartQuantity: (id: number | string, delta: number) => void;
  onOpenSizePicker: (dish: GroupedMobileDish) => void;
}

export const MenuMobileItemCard: React.FC<MenuMobileItemCardProps> = ({
  dish,
  imageIndex,
  cartItems,
  isUnlocked = false,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenSizePicker,
}) => {
  const hasVariants = dish.variants.length > 0;
  const isCompleted = dish.primaryDish.is_completed;
  const isEligible = Boolean(dish.primaryDish.direct_order_eligible);
  const hasImage = Boolean(dish.image);

  // Single cart item check for dishes without variants
  const singleCartItem = !hasVariants
    ? cartItems.find((c) => String(c.id) === String(dish.primaryDish.id))
    : null;

  // Total quantity added for dishes with variants
  const variantCartCount = hasVariants
    ? cartItems.reduce((sum, c) => {
        const matches = dish.variants.some(
          (v) => String(c.id) === `${v.dishId}:${v.size.toLowerCase()}` || String(c.id) === String(v.dishId)
        );
        return matches ? sum + c.quantity : sum;
      }, 0)
    : 0;

  // Dual price contrast vs aggregators (if available)
  const aggPrice = dish.primaryDish.aggregator_price || Math.round((dish.primaryDish.price * 1.25) / 10) * 10;
  const showDual = dish.primaryDish.direct_order_eligible && aggPrice > dish.primaryDish.price;
  const itemSavings = Math.max(0, aggPrice - dish.primaryDish.price);

  // Render ADD button / quantity stepper
  const renderActionControl = () => {
    if (isCompleted) {
      return (
        <button
          type="button"
          disabled
          className="btn-sm rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed whitespace-nowrap"
        >
          Sold out
        </button>
      );
    }

    if (hasVariants) {
      return (
        <button
          type="button"
          onClick={() => onOpenSizePicker(dish)}
          className="relative btn-sm rounded-lg bg-white hover:bg-red-50/50 text-[#D3452B] border border-[#D3452B] shadow-2xs font-bold flex items-center justify-center active:scale-95 transition-all before:absolute before:-inset-2 before:content-['']"
          aria-label={`Select size for ${dish.name}`}
        >
          <span>{variantCartCount > 0 ? `${variantCartCount} Added` : 'Add'}</span>
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      );
    }

    if (singleCartItem) {
      return (
        <div className="min-h-[36px] flex items-center bg-[#2E4823] text-white rounded-lg shadow-2xs px-0.5">
          <button
            type="button"
            onClick={() => onUpdateCartQuantity(singleCartItem.id, -1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded active:scale-90 transition-all"
            aria-label="Decrease quantity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-7 text-center text-xs font-mono font-bold">
            {singleCartItem.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateCartQuantity(singleCartItem.id, 1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded active:scale-90 transition-all"
            aria-label="Increase quantity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onAddToCart(dish)}
        className="relative btn-sm rounded-lg bg-white hover:bg-red-50/50 text-[#D3452B] border border-[#D3452B] shadow-2xs font-bold flex items-center justify-center active:scale-95 transition-all before:absolute before:-inset-2 before:content-['']"
        aria-label={`Add ${dish.name} to cart`}
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add</span>
      </button>
    );
  };

  return (
    <article
      className={`py-3.5 border-b border-[#2E4823]/10 transition-colors last:border-b-0 ${
        isCompleted ? 'opacity-65 bg-red-50/15' : ''
      }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '110px' }}
    >
      {hasImage ? (
        /* ======================================================== */
        /* VARIANT A: DISH WITH PHOTO (70% left / 30% right)        */
        /* ======================================================== */
        <div className="flex items-start gap-3">
          {/* Left Column (about 70%) */}
          <div className="flex-1 min-w-0">
            {/* Veg/Non-veg indicator + Badges */}
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

              {dish.isChefSpecial && (
                <span className="text-[9px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-1.5 py-0.5 rounded shrink-0">
                  Special
                </span>
              )}

              {isCompleted && (
                <span className="text-[9px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                  Sold out
                </span>
              )}

              {isUnlocked && !isEligible && (
                <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-200/80 px-1.5 py-0.5 rounded shrink-0">
                  Dine-in only
                </span>
              )}
            </div>

            {/* Dish Name */}
            <h3 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#1C1C1C] leading-snug line-clamp-2">
              {dish.name}
            </h3>

            {/* Price Row */}
            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#2E4823]">
                ₹{dish.minPrice}
              </span>
              {showDual && !hasVariants && (
                <span className="text-[10px] text-gray-400 line-through">
                  ₹{aggPrice}
                </span>
              )}
              {showDual && itemSavings > 0 && !hasVariants && (
                <span className="text-[9px] font-extrabold bg-[#2E4823] text-white px-1.5 py-0.2 rounded-full">
                  Save ₹{itemSavings}!
                </span>
              )}
            </div>

            {/* Size Variants Chips under name (e.g. "Half 550 Full 1000") */}
            {hasVariants && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {dish.variants.map((v) => (
                  <span
                    key={v.size}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2E4823]/8 text-[#2E4823] border border-[#2E4823]/15 whitespace-nowrap"
                  >
                    {v.size} ₹{v.price}
                  </span>
                ))}
              </div>
            )}

            {/* Muted Description */}
            {dish.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {dish.description}
              </p>
            )}
          </div>

          {/* Right Column (about 30%) with 100x100px image & overlapping ADD button */}
          <div className={`relative shrink-0 w-[100px] ${isUnlocked && isEligible ? 'mb-3.5' : ''}`}>
            <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-xs bg-[#F7F3EB]">
              <OptimizedImage
                src={dish.image!}
                alt={dish.name}
                width={100}
                height={100}
                loading={imageIndex < 6 ? 'eager' : 'lazy'}
                priority={imageIndex < 6}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Centered Overlapping ADD Button (Only shown when ordering is unlocked & dish is eligible) */}
            {isUnlocked && isEligible && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
                {renderActionControl()}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VARIANT B: NO-IMAGE DISH (Full width text, centered ADD) */
        /* ======================================================== */
        <div className="flex items-center justify-between gap-3">
          {/* Full-width Text Column */}
          <div className="flex-1 min-w-0 pr-2">
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

              {dish.isChefSpecial && (
                <span className="text-[9px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-1.5 py-0.5 rounded shrink-0">
                  Special
                </span>
              )}

              {isCompleted && (
                <span className="text-[9px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded shrink-0">
                  Sold out
                </span>
              )}

              {isUnlocked && !isEligible && (
                <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-200/80 px-1.5 py-0.5 rounded shrink-0">
                  Dine-in only
                </span>
              )}
            </div>

            <h3 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#1C1C1C] leading-snug line-clamp-2">
              {dish.name}
            </h3>

            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#2E4823]">
                ₹{dish.minPrice}
              </span>
              {showDual && !hasVariants && (
                <span className="text-[10px] text-gray-400 line-through">
                  ₹{aggPrice}
                </span>
              )}
              {showDual && itemSavings > 0 && !hasVariants && (
                <span className="text-[9px] font-extrabold bg-[#2E4823] text-white px-1.5 py-0.2 rounded-full">
                  Save ₹{itemSavings}!
                </span>
              )}
            </div>

            {hasVariants && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {dish.variants.map((v) => (
                  <span
                    key={v.size}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2E4823]/8 text-[#2E4823] border border-[#2E4823]/15 whitespace-nowrap"
                  >
                    {v.size} ₹{v.price}
                  </span>
                ))}
              </div>
            )}

            {dish.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {dish.description}
              </p>
            )}
          </div>

          {/* Right Column: Centered Action CTA (Only shown when ordering is unlocked & dish is eligible) */}
          {isUnlocked && isEligible && (
            <div className="shrink-0 flex items-center justify-end">
              {renderActionControl()}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
