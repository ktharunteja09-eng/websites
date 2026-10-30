import { CartItem, StoreOffer } from '../types';
import { getOrderAvailability } from './supabaseClient';

export interface CartTotals {
  subtotal: number;
  discount_amount: number;
  packing_fee: number;
  free_item_name: string | null;
  has_discount: boolean;
  has_free_item: boolean;
  amount_for_discount: number;
  amount_for_free_item: number;
  final_total: number;
}

/**
 * Operating Hours check for Direct Ordering: 10:30 AM to 10:30 PM IST (last order).
 * Reads the authoritative server answer from getOrderAvailability(), falling back to
 * Indian Standard Time (Asia/Kolkata / UTC+5:30) 10:30 AM to 10:30 PM if the request fails.
 */
export async function isRestaurantOpen(): Promise<boolean> {
  try {
    const avail = await getOrderAvailability();
    if (avail.success && avail.data) {
      return Boolean(avail.data.open ?? (avail.data as any).available ?? (avail.data.status === 'open'));
    }
  } catch {
    // Fall back to local calculation if server request fails
  }
  return isRestaurantOpenFallback();
}

/**
 * Fallback operating hours calculation (10:30 AM to 10:30 PM IST) if server query fails.
 */
export function isRestaurantOpenFallback(): boolean {
  const openTime = 10.5; // 10:30 AM
  const closeTime = 22.5; // 10:30 PM (last orders buffer before 11:00 PM close)

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
 * Checks whether an offer is active and has not yet expired.
 */
export function isOfferActive(offer: StoreOffer | null | undefined): boolean {
  if (!offer || !offer.is_active) return false;
  if (offer.expires_at) {
    const expTime = new Date(offer.expires_at).getTime();
    if (!isNaN(expTime) && expTime <= Date.now()) {
      return false;
    }
  }
  return true;
}

/**
 * Normalizes any cart item id/sku to canonical database SKU format ('dish-X' or 'dish-X:variant')
 */
export function getCanonicalSku(item: { id: number | string; sku?: string; size?: string }): string {
  if (item.sku && item.sku.startsWith('dish-')) return item.sku;
  const idStr = String(item.id || '').trim();
  if (idStr.startsWith('dish-')) return idStr;
  if (idStr.includes(':')) {
    const [base, variant] = idStr.split(':');
    const cleanBase = base.startsWith('dish-') ? base : `dish-${base}`;
    return `${cleanBase}:${variant.toLowerCase()}`;
  }
  if (/^\d+$/.test(idStr)) {
    const sizeSuffix = item.size ? `:${item.size.toLowerCase()}` : '';
    return `dish-${idStr}${sizeSuffix}`;
  }
  return idStr;
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
  let amount_for_free_item = 0;

  const activeOffer = isOfferActive(offer) ? offer : null;
  const packing_fee = Math.max(0, Number(activeOffer?.packing_fee) || 0);

  if (activeOffer) {
    min_order_amount = Math.max(0, Number(activeOffer.min_order_amount) || 0);
    const discount_percent = Math.max(0, Math.min(100, Number(activeOffer.discount_percent) || 0));
    const free_item_min_amount = Math.max(0, Number(activeOffer.free_item_min_amount) || 0);

    // Apply or dynamically strip discount
    if (min_order_amount > 0 && subtotal >= min_order_amount && discount_percent > 0) {
      discount_amount = Math.min(subtotal, Math.max(0, Math.round((subtotal * discount_percent) / 100)));
      has_discount = true;
    } else {
      discount_amount = 0;
      has_discount = false;
    }

    // Apply or dynamically strip free item strictly based on settings (free_item_min_amount > 0 and non-empty name)
    const subtotalAfterDiscount = Math.max(0, subtotal - discount_amount);
    const hasFreeItemSetting = Boolean(
      activeOffer.free_item_name &&
      activeOffer.free_item_name.trim() !== '' &&
      free_item_min_amount > 0
    );

    if (hasFreeItemSetting && subtotalAfterDiscount >= free_item_min_amount) {
      free_item_name = activeOffer.free_item_name.trim();
      has_free_item = true;
      amount_for_free_item = 0;
    } else {
      free_item_name = null;
      has_free_item = false;
      amount_for_free_item = hasFreeItemSetting ? Math.max(0, free_item_min_amount - subtotalAfterDiscount) : 0;
    }
  }

  const final_total = Math.max(0, subtotal - discount_amount) + packing_fee;
  const amount_for_discount = Math.max(0, min_order_amount - subtotal);

  return {
    subtotal,
    discount_amount,
    packing_fee,
    free_item_name,
    has_discount,
    has_free_item,
    amount_for_discount,
    amount_for_free_item,
    final_total,
  };
}
