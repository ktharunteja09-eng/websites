import { CartItem, StoreOffer } from '../types';

export interface CartTotals {
  subtotal: number;
  discount_amount: number;
  free_item_name: string | null;
  has_discount: boolean;
  has_free_item: boolean;
  amount_for_discount: number;
  final_total: number;
}

export const RESTAURANT_OPEN_HOUR = 11.5; // 11:30 AM
export const RESTAURANT_CLOSE_HOUR = 22.5; // 10:30 PM

/**
 * Operating Hours check for Direct Ordering: 11:30 AM to 10:30 PM IST.
 * Evaluates strictly against Indian Standard Time (Asia/Kolkata / UTC+5:30)
 * regardless of client device timezone or system clock offsets.
 */
export function isRestaurantOpen(): boolean {
  const openTime = 11.5; // 11:30 AM
  const closeTime = 22.5; // 10:30 PM

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === 'hour') {
        const val = parseInt(part.value, 10);
        hour = val === 24 ? 0 : val;
      }
      if (part.type === 'minute') {
        minute = parseInt(part.value, 10) || 0;
      }
    }
    const currentHours = hour + minute / 60;
    return currentHours >= openTime && currentHours < closeTime;
  } catch {
    // Robust mathematical fallback: UTC + 5h 30m
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const istHours = (utcHours + 5.5) % 24;
    return istHours >= openTime && istHours < closeTime;
  }
}

/**
 * Bulletproof Cart Math Engine: Runs on every cart mutation.
 * - Sums subtotal = price * quantity with strict positive integer quantity clamping
 * - Checks store_offers:
 *   - If subtotal >= min_order_amount, applies discount_percent.
 *   - If subtotal < min_order_amount, dynamically STRIPS the discount.
 * - Checks free_item_name:
 *   - If subtotal >= free_item_min_amount, adds free_item_name.
 *   - If subtotal < free_item_min_amount, dynamically STRIPS free_item_name.
 * - Calculates final_total = Math.max(0, subtotal - discount_amount).
 */
export function calculateTotals(items: CartItem[], offer: StoreOffer | null): CartTotals {
  const subtotal = items.reduce((acc, curr) => {
    const price = Math.max(0, Number(curr.price) || 0);
    const quantity = Math.max(1, Math.floor(Number(curr.quantity) || 1));
    return acc + price * quantity;
  }, 0);

  let discount_amount = 0;
  let free_item_name: string | null = null;
  let has_discount = false;
  let has_free_item = false;
  let min_order_amount = 0;

  if (offer && offer.is_active) {
    min_order_amount = Math.max(0, Number(offer.min_order_amount) || 0);
    const discount_percent = Math.max(0, Math.min(100, Number(offer.discount_percent) || 0));
    const free_item_min_amount = Math.max(0, Number(offer.free_item_min_amount) || 0);

    // Apply or dynamically strip discount
    if (min_order_amount > 0 && subtotal >= min_order_amount && discount_percent > 0) {
      discount_amount = Math.min(subtotal, Math.max(0, Math.round((subtotal * discount_percent) / 100)));
      has_discount = true;
    } else {
      discount_amount = 0;
      has_discount = false;
    }

    // Apply or dynamically strip free item
    const freeThreshold = free_item_min_amount > 0 ? free_item_min_amount : min_order_amount;
    if (
      offer.free_item_name &&
      offer.free_item_name.trim() !== '' &&
      freeThreshold > 0 &&
      subtotal >= freeThreshold
    ) {
      free_item_name = offer.free_item_name.trim();
      has_free_item = true;
    } else {
      free_item_name = null;
      has_free_item = false;
    }
  }

  const final_total = Math.max(0, subtotal - discount_amount);
  const amount_for_discount = Math.max(0, min_order_amount - subtotal);

  return {
    subtotal,
    discount_amount,
    free_item_name,
    has_discount,
    has_free_item,
    amount_for_discount,
    final_total,
  };
}
