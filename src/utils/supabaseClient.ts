import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DbMenuItem, StoreOffer, DbOrder, PaymentStatus } from '../types';
import { MENU_ITEMS, RESTAURANT_INFO, DEFAULT_WHATSAPP_NUMBER } from '../data/restaurantData';
import { getDishImage, BESTSELLER_TARGET_NAMES } from '../data/menuImageMap';
import { getCanonicalSku, isOfferActive } from './cartMath';

export type { DbOrder, PaymentStatus };

// Environment variables
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/[\.\/]+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const RESTAURANT_COORDS = {
  lat: Number(import.meta.env.VITE_RESTAURANT_LAT) || 13.6368,
  lng: Number(import.meta.env.VITE_RESTAURANT_LNG) || 79.5039,
};

export const DELIVERY_RADIUS_KM = 3.8; // Straight-line threshold corresponding to 5 km driving radius

export const SWIGGY_URL =
  import.meta.env.VITE_SWIGGY_URL || RESTAURANT_INFO.swiggyUrl;
export const ZOMATO_URL =
  import.meta.env.VITE_ZOMATO_URL || RESTAURANT_INFO.zomatoUrl;
export const WHATSAPP_NUMBER = DEFAULT_WHATSAPP_NUMBER;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-id') &&
      !supabaseAnonKey.includes('your-anon-key')
  );
};

const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node);
export const isBrowser = typeof window !== 'undefined' && !isNode;

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
      },
    })
  : null;

/**
 * Guarded admin PIN reader for SSG / client safety
 */
export function getStoredAdminPin(fallbackPin?: string): string {
  if (fallbackPin) return fallbackPin;
  if (isBrowser && typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem('vaibhav_admin_pin') || '';
    } catch {}
  }
  return '';
}

// Haversine Distance Formula (straight-line distance between 2 GPS coordinates in km)
// Backup straight-line math using exact Radian conversion
export function calculateHaversineDistanceKm(
  userLat: number,
  userLng: number,
  storeLat: number = RESTAURANT_COORDS.lat,
  storeLng: number = RESTAURANT_COORDS.lng
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(userLat - storeLat);
  const dLon = toRad(userLng - storeLng);
  const lat1 = toRad(storeLat);
  const lat2 = toRad(userLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const fallbackDistanceKm = R * c;
  return Number(fallbackDistanceKm.toFixed(2));
}

export interface DeliveryVerificationResult {
  eligible: boolean;
  distanceKm: number | null;
  roadKm: number | null;
  mapsLink: string;
  source: 'ors' | 'osrm' | 'haversine' | 'cache' | 'takeaway';
}

/**
 * PHASE 1: Real 5.0 km Road Distance via OpenRouteService (ORS) + 4-second Promise.race timeout
 * - CRITICAL ORS QUIRK: Coordinates passed as [longitude, latitude]
 * - URL: https://api.openrouteservice.org/v2/directions/driving-car?api_key=${key}&start=${storeLng},${storeLat}&end=${userLng},${userLat}
 * - 4-second timeout via Promise.race
 * - Instant fallback to Haversine straight-line (limit: 3.8 km straight-line = 5.0 km road equivalent)
 * - Caches { eligible, distanceKm, mapsLink } in sessionStorage
 */
export async function verifyDeliveryDistance(
  userLat: number,
  userLng: number
): Promise<DeliveryVerificationResult> {
  const storeLat = RESTAURANT_COORDS.lat;
  const storeLng = RESTAURANT_COORDS.lng;
  const mapsLink = `https://maps.google.com/?q=${userLat},${userLng}`;

  // 1. Check sessionStorage cache first
  const cacheKey = `vaibhav_geo_${userLat.toFixed(4)}_${userLng.toFixed(4)}`;
  if (isBrowser && typeof sessionStorage !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const dist = typeof parsed.distanceKm === 'number' ? parsed.distanceKm : parsed.roadKm;
        if (typeof dist === 'number') {
          const isEligible = Boolean(parsed.eligible) && dist > 0 && dist <= 5.0;
          try {
            sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: dist, eligible: isEligible }));
          } catch {}
          return {
            eligible: isEligible,
            distanceKm: dist,
            roadKm: dist,
            mapsLink: parsed.mapsLink || mapsLink,
            source: 'cache',
          };
        }
      }
    } catch {
      // ignore sessionStorage errors
    }
  }

  // Haversine straight-line fallback helper using exact Radian conversion
  const calculateHaversineFallback = (): DeliveryVerificationResult => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(userLat - storeLat);
    const dLon = toRad(userLng - storeLng);
    const lat1 = toRad(storeLat);
    const lat2 = toRad(userLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const fallbackDistanceKm = Number((R * c).toFixed(2));

    const eligible = fallbackDistanceKm > 0 && fallbackDistanceKm <= 3.8;
    const result: DeliveryVerificationResult = {
      eligible,
      distanceKm: fallbackDistanceKm,
      roadKm: fallbackDistanceKm,
      mapsLink,
      source: 'haversine',
    };
    if (isBrowser && typeof sessionStorage !== 'undefined') {
      try {
        const cacheData = { eligible, distanceKm: fallbackDistanceKm, mapsLink };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        sessionStorage.setItem('vaibhav_delivery_geo', JSON.stringify(cacheData));
        sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: fallbackDistanceKm, eligible }));
      } catch {}
    }
    return result;
  };

  // 2. Route distance verification via server route (/api/route-distance) with AbortController timeout
  if (isBrowser) {
    const controller = new AbortController();
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        controller.abort();
        reject(new Error('Distance check 5-second timeout exceeded'));
      }, 5000);
    });

    try {
      const apiUrl = `/api/route-distance?lat=${encodeURIComponent(userLat)}&lng=${encodeURIComponent(userLng)}`;
      const fetchPromise = fetch(apiUrl, { signal: controller.signal });
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      if (response && response.ok) {
        const data = (await response.json()) as DeliveryVerificationResult;
        if (typeof data.distanceKm === 'number' && typeof data.eligible === 'boolean') {
          const result: DeliveryVerificationResult = {
            eligible: Boolean(data.eligible),
            distanceKm: data.distanceKm,
            roadKm: typeof data.roadKm === 'number' ? data.roadKm : data.distanceKm,
            mapsLink: data.mapsLink || mapsLink,
            source: data.source || 'ors',
          };
          if (typeof sessionStorage !== 'undefined') {
            try {
              const cacheData = { eligible: result.eligible, distanceKm: result.distanceKm, mapsLink: result.mapsLink };
              sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
              sessionStorage.setItem('vaibhav_delivery_geo', JSON.stringify(cacheData));
              sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: result.distanceKm, eligible: result.eligible }));
            } catch {}
          }
          return result;
        }
      }
    } catch (err) {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      console.warn('Server distance check failed or timed out, executing Haversine fallback:', err);
    }
  }

  // 3. Fallback: Instant Haversine straight-line distance calculation (<= 3.8 km threshold)
  return calculateHaversineFallback();
}


// Get today's local date string in YYYY-MM-DD format
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Default Fallback Store Offer
export const DEFAULT_STORE_OFFER: StoreOffer = {
  id: 1,
  is_active: false,
  banner_text: '',
  discount_percent: 0,
  min_order_amount: 0,
  free_item_name: '',
  free_item_min_amount: 0,
  coupon_code: '',
  coupon_flat_discount: 0,
  starts_at: '',
  expires_at: '',
  admin_pin: '',
  packing_fee: 0,
};

// Memory fallback cache in case Supabase is not connected
let localMenuItemsCache: DbMenuItem[] | null = null;
let localStoreOfferCache: StoreOffer = { ...DEFAULT_STORE_OFFER };
let localOrdersCache: DbOrder[] = [];

export function getLocalFallbackMenuItems(): DbMenuItem[] {
  if (localMenuItemsCache) return localMenuItemsCache;
  const today = getTodayDateString();
  const raw: DbMenuItem[] = MENU_ITEMS.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    category: item.category,
    price: item.price,
    aggregator_price: item.aggregator_price ? Number(item.aggregator_price) : null,
    is_veg: item.isVeg,
    direct_order_eligible:
      item.category !== 'indian-breads' &&
      item.category !== 'breads' &&
      !item.name.toLowerCase().includes('boiled egg') &&
      !item.name.toLowerCase().includes('water 1 litre') &&
      !item.name.toLowerCase().includes('plain papad'),
    is_completed: false,
    last_reset_date: today,
    description: item.description,
    isChefSpecial: item.isChefSpecial,
    portionNote: item.portionNote,
  }));
  localMenuItemsCache = enrichMenuItems(raw);
  return localMenuItemsCache;
}

/**
 * 1. SUPABASE SYNC & DAILY AUTO-RESET
 * Fetches menu items from Supabase `menu_items`.
 * Normalizes `is_completed = false` if `last_reset_date` is older than today.
 */
export async function fetchMenuItems(): Promise<DbMenuItem[]> {
  const today = getTodayDateString();

  if (!supabase) {
    console.warn('Supabase not configured, using local fallback menu items.');
    return getLocalFallbackMenuItems();
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Could not fetch from Supabase menu_items, using local data:', error);
      return getLocalFallbackMenuItems();
    }

    // Daily auto-reset for presentation if last_reset_date is older than today
    const normalizedData = data.map((item: DbMenuItem) => {
      if (item.last_reset_date && item.last_reset_date < today) {
        return {
          ...item,
          is_completed: false,
          available: true,
          last_reset_date: today,
        };
      }
      return item;
    });

    return enrichMenuItems(normalizedData);
  } catch (err) {
    console.error('Error in fetchMenuItems:', err);
    return getLocalFallbackMenuItems();
  }
}

// Attach local culinary descriptions, verified images, and bestseller badges from project data
function enrichMenuItems(items: DbMenuItem[]): DbMenuItem[] {
  const localMap = new Map<string, (typeof MENU_ITEMS)[0]>();
  MENU_ITEMS.forEach((m) => localMap.set(m.name.toLowerCase().trim(), m));

  return items.map((item) => {
    const match = localMap.get(item.name.toLowerCase().trim());
    const image = item.image || match?.image || getDishImage(item.name);
    const lowerName = item.name.toLowerCase().trim();
    // Bestseller set ONLY on items that have a verified real photo
    const isBestseller = Boolean(
      image &&
      BESTSELLER_TARGET_NAMES.some((target) => lowerName.includes(target))
    );

    const price = Number(item.price) || match?.price || 0;
    const aggregator_price =
      Number(item.aggregator_price) ||
      match?.aggregator_price ||
      Math.round((price * 1.25) / 10) * 10;

    return {
      ...item,
      price,
      aggregator_price,
      description:
        match?.description ||
        item.description ||
        'Authentic flavor prepared fresh daily with secret house spices.',
      isChefSpecial: match?.isChefSpecial ?? item.isChefSpecial ?? false,
      portionNote: match?.portionNote || item.portionNote,
      image,
      isBestseller,
    };
  });
}

export interface LiveMenuSkuOverride {
  item_id: string;
  sku: string;
  variant: string | null;
  price: number;
  mrp: number | null;
  available: boolean;
}

export interface LiveSaleSettings {
  active: boolean;
  percent: number;
  ends_at: string | null;
  min_order?: number;
  coupon?: string | null;
  flat_discount?: number;
}

export interface LiveMenuOverridesResult {
  loaded: boolean;
  server_time: string;
  sale: LiveSaleSettings;
  overrides: Map<string, LiveMenuSkuOverride>;
}

let inFlightLiveMenuPromise: Promise<LiveMenuOverridesResult | null> | null = null;
let lastLiveMenuResult: LiveMenuOverridesResult | null = null;
let lastLiveMenuFetchTime: number = 0;

/**
 * Client helper in supabaseClient.ts, fetchLiveMenuOverrides(force = false):
 * - Deduplicates concurrent in-flight calls with a shared promise.
 * - Throttles automatic refetches to at most once every 30 seconds unless force is true.
 * - Returns the map plus the sale settings, or the last good result, or null on failure; never throws into the UI; a short timeout (about 6 seconds).
 * - Merge rule: an item with no row keeps its static default price and available = true. Mark the result as "loaded" so the UI can tell "not loaded yet" from "item not in database".
 * - Guarded so it never runs during render or build.
 */
export async function fetchLiveMenuOverrides(
  force: boolean = false
): Promise<LiveMenuOverridesResult | null> {
  // Guarded so it never runs during render, build, or SSR
  if (!isBrowser || !supabase) {
    return lastLiveMenuResult;
  }

  const now = Date.now();
  // Throttles automatic refetches to at most once every 30 seconds unless force is true
  if (!force && lastLiveMenuResult && now - lastLiveMenuFetchTime < 30000) {
    return lastLiveMenuResult;
  }

  // Deduplicates concurrent in-flight calls with a shared promise
  if (inFlightLiveMenuPromise) {
    return inFlightLiveMenuPromise;
  }

  inFlightLiveMenuPromise = (async (): Promise<LiveMenuOverridesResult | null> => {
    try {
      // 6-second timeout via Promise.race
      const fetchWithTimeout = async () => {
        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) => {
          setTimeout(() => reject(new Error('Live menu fetch timed out (6s)')), 6000);
        });

        const rpcPromise = supabase.rpc('get_live_menu');
        const res: any = await Promise.race([rpcPromise, timeoutPromise]);
        return res;
      };

      const { data, error } = await fetchWithTimeout();

      if (error || !data) {
        console.warn('fetchLiveMenuOverrides RPC error or empty, keeping last good state:', error);
        return lastLiveMenuResult;
      }

      const overridesMap = new Map<string, LiveMenuSkuOverride>();
      const rawItems: any[] = Array.isArray(data.items) ? data.items : [];

      for (const item of rawItems) {
        const sku = String(item.sku || item.item_id || '').trim();
        const itemId = String(item.item_id || item.sku || '').trim();
        if (!sku) continue;

        const override: LiveMenuSkuOverride = {
          item_id: itemId,
          sku,
          variant: item.variant !== undefined ? item.variant : null,
          price: Number(item.price) || 0,
          mrp: item.mrp !== null && item.mrp !== undefined ? Number(item.mrp) : null,
          available: item.available !== false,
        };

        overridesMap.set(sku, override);
        if (itemId && !overridesMap.has(itemId)) {
          overridesMap.set(itemId, override);
        }
      }

      const saleData = data.sale || {};
      const result: LiveMenuOverridesResult = {
        loaded: true,
        server_time: data.server_time || new Date().toISOString(),
        sale: {
          active: Boolean(saleData.active),
          percent: typeof saleData.percent === 'number' ? saleData.percent : 10,
          ends_at: saleData.ends_at || null,
          min_order: saleData.min_order,
          coupon: saleData.coupon,
          flat_discount: saleData.flat_discount,
        },
        overrides: overridesMap,
      };

      lastLiveMenuResult = result;
      lastLiveMenuFetchTime = Date.now();
      return result;
    } catch (err) {
      console.warn('Failed to fetch live menu overrides, returning last good result:', err);
      return lastLiveMenuResult;
    }
  })().finally(() => {
    inFlightLiveMenuPromise = null;
  });

  return inFlightLiveMenuPromise;
}


export interface VerifyPinResult {
  success: boolean;
  locked?: boolean;
  locked_until?: string | null;
  failed_attempts?: number;
  error?: string | null;
}

/**
 * 2. ADMIN AUTHENTICATION (RPC)
 * Verifies admin PIN securely on server without exposing credentials to browsers
 */
export async function verifyAdminPin(inputPin: string): Promise<VerifyPinResult> {
  const pin = inputPin.trim();
  if (!pin) {
    return { success: false, error: 'Please enter your Admin PIN.' };
  }

  if (!supabase) {
    return {
      success: false,
      error: 'Backend connection not available. Unable to verify PIN.',
    };
  }

  try {
    const { data, error } = await supabase.rpc('verify_admin_pin', { input_pin: pin });
    if (error) {
      console.warn('verify_admin_pin RPC error:', error);
      return {
        success: false,
        error: error.message || 'Error verifying PIN with server.',
      };
    }

    if (data && typeof data === 'object') {
      const res = data as Record<string, unknown>;
      const isOk = Boolean(res.success || res.ok);
      const msg = ((res.error || res.message) as string | null) || null;
      return {
        success: isOk,
        locked: Boolean(res.locked),
        locked_until: (res.locked_until as string | null) || null,
        failed_attempts: res.failed_attempts as number | undefined,
        error: msg || (isOk ? null : 'Incorrect PIN.'),
      };
    }

    const isMatch = Boolean(data);
    return {
      success: isMatch,
      error: isMatch ? null : 'Incorrect PIN.',
    };
  } catch (err) {
    console.error('Error verifying admin pin:', err);
    return {
      success: false,
      error: 'Error verifying PIN with server. Please try again.',
    };
  }
}

/**
 * Update single menu item (Delivery eligibility, completed status, & live direct/aggregator prices) via secure RPC
 */
export async function updateMenuItem(
  id: number,
  updates: Partial<DbMenuItem>,
  adminPin?: string,
  currentItem?: DbMenuItem
): Promise<boolean> {
  if (localMenuItemsCache) {
    localMenuItemsCache = localMenuItemsCache.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
  }

  if (!supabase) {
    return true;
  }

  const pin = getStoredAdminPin(adminPin);
  const completedVal = updates.is_completed ?? currentItem?.is_completed ?? false;
  const eligibleVal =
    updates.direct_order_eligible ?? currentItem?.direct_order_eligible ?? true;
  const newPrice = updates.price !== undefined ? Number(updates.price) : null;
  const newAggregatorPrice =
    updates.aggregator_price !== undefined ? Number(updates.aggregator_price) : null;

  try {
    const rpcPayload: Record<string, any> = {
      input_pin: pin,
      item_id: Number(id),
      completed_val: completedVal,
      eligible_val: eligibleVal,
    };

    if (newPrice !== null || newAggregatorPrice !== null) {
      rpcPayload.new_price = newPrice;
      rpcPayload.new_aggregator_price = newAggregatorPrice;
    }

    const { data, error } = await supabase.rpc('admin_update_menu_item', rpcPayload);

    if (error) {
      console.warn('admin_update_menu_item RPC error, attempting fallback update:', error);
      // Fallback direct update attempt
      const { error: directErr } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);
      if (directErr) throw directErr;
      return true;
    }

    return Boolean(data);
  } catch (err) {
    console.error('Failed to update menu item:', err);
    return false;
  }
}

/**
 * Morning Reset: Mark all dishes available (is_completed = false) via secure RPC
 */
export async function morningResetAllMenuItems(adminPin?: string): Promise<boolean> {
  const today = getTodayDateString();

  if (localMenuItemsCache) {
    localMenuItemsCache = localMenuItemsCache.map((item) => ({
      ...item,
      is_completed: false,
      available: true,
      last_reset_date: today,
    }));
  }

  if (!supabase) {
    return true;
  }

  const pin = getStoredAdminPin(adminPin);

  try {
    const { error } = await supabase.rpc('admin_reset_all_stock', {
      input_pin: pin,
    });

    if (error) {
      // Fallback direct update attempt
      const { error: directErr } = await supabase
        .from('menu_items')
        .update({ is_completed: false, available: true, last_reset_date: today })
        .neq('id', 0);
      if (directErr) throw directErr;
    }
    return true;
  } catch (err) {
    console.error('Failed to morning reset menu items:', err);
    return false;
  }
}

/**
 * 3. STORE OFFERS
 * Fetch row id = 1 from `store_offers`.
 */
export async function fetchStoreOffer(): Promise<StoreOffer> {
  if (!supabase) {
    return localStoreOfferCache;
  }

  try {
    const { data, error } = await supabase
      .from('store_offers')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      console.warn('Could not fetch store_offers id=1, using fallback:', error);
      return localStoreOfferCache;
    }

    const offerData = data as StoreOffer;
    if (offerData.expires_at) {
      const exp = new Date(offerData.expires_at).getTime();
      if (!isNaN(exp) && exp <= Date.now()) {
        offerData.is_active = false;
      }
    }

    localStoreOfferCache = { ...localStoreOfferCache, ...offerData };
    return localStoreOfferCache;
  } catch (err) {
    console.error('Error fetching store_offers:', err);
    return localStoreOfferCache;
  }
}

/**
 * Update store offers (id = 1) via secure RPC
 */
export async function updateStoreOffer(
  updates: Partial<StoreOffer>,
  adminPin?: string
): Promise<boolean> {
  localStoreOfferCache = { ...localStoreOfferCache, ...updates };

  if (!supabase) {
    return true;
  }

  const pin = getStoredAdminPin(adminPin);
  const merged = localStoreOfferCache;

  try {
    const { error } = await supabase.rpc('admin_update_offers', {
      input_pin: pin,
      active_val: merged.is_active ?? true,
      banner_val: merged.banner_text ?? '',
      disc_val: Number(merged.discount_percent) || 0,
      min_amt: Number(merged.min_order_amount) || 0,
      free_item: merged.free_item_name ?? '',
      free_min: Number(merged.free_item_min_amount) || 0,
      code_val: merged.coupon_code ?? '',
      flat_val: Number(merged.coupon_flat_discount) || 0,
      exp_val: merged.expires_at || new Date().toISOString(),
    });

    if (error) {
      // Fallback direct update attempt
      const { error: directErr } = await supabase
        .from('store_offers')
        .update(updates)
        .eq('id', 1);
      if (directErr) throw directErr;
    }
    return true;
  } catch (err) {
    console.error('Failed to update store offer:', err);
    return false;
  }
}

/**
 * Change Admin PIN securely in admin_secrets table
 */
export async function changeAdminPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  const pinToSet = newPin.trim();
  if (pinToSet.length < 4) {
    return { success: false, error: 'New PIN must be at least 4 digits.' };
  }

  if (!supabase) {
    localStoreOfferCache.admin_pin = pinToSet;
    return { success: true };
  }

  try {
    const { data, error } = await supabase.rpc('admin_change_pin', {
      input_pin: currentPin.trim(),
      new_pin: pinToSet,
    });

    if (error) {
      return { success: false, error: error.message || 'Failed to update PIN in database.' };
    }

    if (data && typeof data === 'object') {
      const res = data as Record<string, unknown>;
      const isOk = Boolean(res.success || res.ok);
      if (!isOk) {
        return {
          success: false,
          error: ((res.error || res.message) as string) || 'Failed to update PIN.',
        };
      }
    }

    localStoreOfferCache.admin_pin = pinToSet;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error communicating with Supabase.';
    return { success: false, error: message };
  }
}

/**
 * 4. ORDERS & PRE-CHECKOUT INVENTORY CHECK
 * Validates live stock status and calculates true server-side totals before order insert.
 */
export interface CreateOrderResult {
  success: boolean;
  data?: DbOrder;
  status?: string;
  error?: string;
  message?: string;
  soldOutItemIds?: (number | string)[];
  unavailableItems?: string[];
  unknownItems?: string[];
  server_total?: number;
  lines?: Array<{ sku: string; unit_price: number }>;
  free_item_name?: string | null;
  isNetworkError?: boolean;
}

export type ConfirmUtrStatus =
  | 'ok'
  | 'invalid_utr'
  | 'duplicate_utr'
  | 'invalid_order'
  | 'already_processed'
  | 'not_applicable'
  | 'network_error'
  | 'unknown_error';

export interface ConfirmUtrResult {
  success: boolean;
  status: ConfirmUtrStatus;
  message: string;
  isNetworkError: boolean;
}

export const UTR_ERROR_MESSAGES: Record<string, string> = {
  duplicate_utr:
    'This UPI reference was already used for another order. Please check it or call the restaurant.',
  invalid_order:
    'We could not find this order. Please call the restaurant.',
  already_processed:
    'This order was already processed.',
  not_applicable:
    'Cash on delivery orders do not require a UPI reference.',
  invalid_utr:
    'Please enter a valid 12-digit UPI reference number (UTR).',
  network_error:
    'Network connection error. Please check your internet connection and try again.',
  unknown_error:
    'Unable to process UPI reference. Please try again or call the restaurant.',
};

/**
 * Distinguish network errors (offline, fetch failed) from server rejections
 */
export function isNetworkError(error: unknown): boolean {
  if (isBrowser && typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (!error) return false;
  const msg = (
    typeof error === 'string'
      ? error
      : (error as { message?: string }).message || ''
  ).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('fetch failed') ||
    msg.includes('load failed') ||
    msg.includes('connection refused') ||
    msg.includes('offline') ||
    msg.includes('abort') ||
    msg.includes('timeout')
  );
}

/**
 * Formats HH:MM or HH:MM:SS string to 12-hour format with AM/PM (e.g. "10:30" -> "10:30 AM", "23:00" -> "11:00 PM")
 */
export function formatTimeForDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Maps server-side order error status codes to friendly user-facing messages.
 */
export function mapOrderErrorToMessage(
  status: string,
  details?: { items?: string[]; opens_at?: string; closes_at?: string },
  cartItems?: { id: number | string; name: string }[]
): string {
  const resolveNames = (rawItems?: string[]) => {
    if (!rawItems || rawItems.length === 0) return 'One or more items';
    return rawItems
      .map((raw) => {
        const rawStr = String(raw).trim();
        const match = cartItems?.find(
          (ci) =>
            String(ci.id) === rawStr ||
            getCanonicalSku(ci) === rawStr ||
            String(ci.name).toLowerCase().trim() === rawStr.toLowerCase()
        );
        if (match?.name) return match.name;

        // Try stripping prefixes/suffixes (e.g. "dish-284:full" -> "284", or "284:full" -> "284")
        const cleanBase = rawStr.replace(/^dish-/, '').split(':')[0];
        const localMatch = MENU_ITEMS.find(
          (m) =>
            String(m.id) === rawStr ||
            String(m.id) === `dish-${cleanBase}` ||
            String(m.id) === cleanBase
        );
        if (localMatch) {
          const variantPart = rawStr.includes(':') ? ` (${rawStr.split(':')[1].toUpperCase()})` : '';
          return `${localMatch.name}${variantPart}`;
        }

        return rawStr.replace(/^dish-/, '').replace(/:([a-z]+)/gi, ' ($1)');
      })
      .join(', ');
  };

  if (status === 'item_unavailable') {
    const names = resolveNames(details?.items);
    return `${names} is currently sold out.`;
  }
  if (status === 'unknown_item') {
    const names = resolveNames(details?.items);
    return `${names} is currently unavailable.`;
  }
  if (status === 'price_changed') {
    return 'Menu prices were just updated. Please review your updated total.';
  }
  if (status === 'closed') {
    const openStr = formatTimeForDisplay(details?.opens_at || '10:30');
    const closeStr = formatTimeForDisplay(details?.closes_at || '23:00');
    return `Vaibhav Grand is currently closed. Operating hours are ${openStr} to ${closeStr}.`;
  }
  if (status === 'closed_last_order') {
    return 'We are no longer taking orders for today.';
  }
  return 'Unable to process order. Please try again.';
}

export interface OrderAvailability {
  open: boolean;
  available?: boolean;
  status: 'open' | 'closed' | 'closed_last_order';
  opens_at: string;
  closes_at: string;
  last_order_at: string;
}

export interface OrderAvailabilityResult {
  success: boolean;
  data?: OrderAvailability;
  error?: string;
  isNetworkError?: boolean;
}

/**
 * Check authoritative server operating hours before customer completes cart form
 */
export async function getOrderAvailability(): Promise<OrderAvailabilityResult> {
  if (!supabase) {
    return {
      success: true,
      data: {
        open: true,
        available: true,
        status: 'open',
        opens_at: '10:30',
        closes_at: '23:00',
        last_order_at: '22:30',
      },
      isNetworkError: false,
    };
  }

  try {
    const { data, error } = await supabase.rpc('get_order_availability');
    if (error) {
      const isNet = isNetworkError(error);
      return {
        success: false,
        error: isNet ? 'Network connection error. Please check your connection and try again.' : error.message,
        isNetworkError: isNet,
      };
    }
    const raw = (data || {}) as Record<string, any>;
    const isOpen = Boolean(raw.open ?? raw.available ?? (raw.status === 'open'));
    return {
      success: true,
      data: {
        open: isOpen,
        available: isOpen,
        status: (raw.status as 'open' | 'closed' | 'closed_last_order') || (isOpen ? 'open' : 'closed'),
        opens_at: raw.opens_at || '10:30',
        closes_at: raw.closes_at || '23:00',
        last_order_at: raw.last_order_at || '22:30',
      },
      isNetworkError: false,
    };
  } catch (err: unknown) {
    const isNet = isNetworkError(err);
    return {
      success: false,
      error: isNet ? 'Network connection error. Please check your connection and try again.' : 'Failed to retrieve order availability.',
      isNetworkError: isNet,
    };
  }
}



/**
 * Save order to `orders` table FIRST before WhatsApp dispatch.
 * Performs backend price validation and live inventory check via submit_verified_order RPC.
 */
export async function createOrder(
  order: DbOrder,
  itemsToValidate?: { id: number | string; quantity: number; name: string; price?: number; size?: string; sku?: string; portionNote?: string }[],
  offer?: StoreOffer | null,
  idempotencyKey?: string,
  paymentMethod?: 'UPI' | 'COD',
  appliedCouponCode?: string | null
): Promise<CreateOrderResult> {
  const soldOutItemIds: (number | string)[] = [];
  const livePriceMap = new Map<number | string, number>();

  // 1. Strict Pre-Checkout Inventory Check (query live status of every item_id)
  if (itemsToValidate && itemsToValidate.length > 0) {
    const dishItemIds = Array.from(
      new Set(
        itemsToValidate.map((i) => {
          const sku = getCanonicalSku(i);
          return sku.split(':')[0]; // e.g. "dish-284"
        })
      )
    );

    if (supabase) {
      try {
        const { data: dbItems, error: fetchErr } = await supabase
          .from('menu_items')
          .select('*')
          .in('item_id', dishItemIds);

        if (!fetchErr && dbItems) {
          dbItems.forEach((d: any) => {
            if (typeof d.price === 'number') {
              livePriceMap.set(d.id, Number(d.price));
              livePriceMap.set(String(d.id), Number(d.price));
              if (d.item_id) {
                livePriceMap.set(d.item_id, Number(d.price));
              }
            }
          });

          for (const item of itemsToValidate) {
            const canonicalSku = getCanonicalSku(item);
            const dishItemId = canonicalSku.split(':')[0];
            const baseNum = dishItemId.replace('dish-', '');

            const dbItem: any = dbItems.find(
              (d: any) =>
                d.item_id === dishItemId ||
                String(d.id) === baseNum ||
                (item.name && d.name.toLowerCase().trim() === item.name.toLowerCase().trim())
            );
            if (dbItem) {
              const isInactive = dbItem.is_active === false;
              const isOutOfStock = dbItem.in_stock === false;
              const isUnavailable = dbItem.is_available === false;
              const isCompleted = dbItem.is_completed === true;
              const isNotDirectEligible = dbItem.direct_order_eligible === false;

              if (isInactive || isOutOfStock || isUnavailable || isCompleted || isNotDirectEligible) {
                if (!soldOutItemIds.includes(item.id)) {
                  soldOutItemIds.push(item.id);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Backend inventory check error, checking cache fallback:', err);
      }
    }

    // Check local items cache if Supabase query returned no live items or offline
    if (localMenuItemsCache) {
      for (const item of itemsToValidate) {
        const canonicalSku = getCanonicalSku(item);
        const dishItemId = canonicalSku.split(':')[0];
        const baseNum = dishItemId.replace('dish-', '');

        const localItem: any = localMenuItemsCache.find(
          (m) =>
            m.item_id === dishItemId ||
            String(m.id) === canonicalSku ||
            String(m.id) === baseNum ||
            m.id === Number(baseNum) ||
            (item.name && m.name.toLowerCase().trim() === item.name.toLowerCase().trim())
        );
        if (localItem) {
          if (typeof localItem.price === 'number' && !livePriceMap.has(item.id)) {
            livePriceMap.set(item.id, Number(localItem.price));
          }
          const isInactive = localItem.is_active === false;
          const isOutOfStock = localItem.in_stock === false;
          const isUnavailable = localItem.is_available === false;
          const isCompleted = localItem.is_completed === true;
          const isNotDirectEligible = localItem.direct_order_eligible === false;

          if (isInactive || isOutOfStock || isUnavailable || isCompleted || isNotDirectEligible) {
            if (!soldOutItemIds.includes(item.id)) {
              soldOutItemIds.push(item.id);
            }
          }
        }
      }
    }

    // If any item is sold out, immediately abort order creation
    if (soldOutItemIds.length > 0) {
      const itemNames = soldOutItemIds.map((id) => {
        const cartItem = itemsToValidate.find((i) => String(i.id) === String(id) || i.id === id);
        if (cartItem && cartItem.name) return cartItem.name;
        const canonicalSku = getCanonicalSku({ id });
        const baseNum = canonicalSku.split(':')[0].replace('dish-', '');
        const localItem = (localMenuItemsCache || MENU_ITEMS).find(
          (m) =>
            String(m.id) === canonicalSku ||
            String(m.id) === canonicalSku.split(':')[0] ||
            String(m.id) === baseNum ||
            m.id === Number(baseNum)
        );
        return localItem ? localItem.name : String(id);
      });
      const friendlyMsg = mapOrderErrorToMessage('item_unavailable', { items: itemNames }, itemsToValidate);
      return {
        success: false,
        status: 'item_unavailable',
        error: 'OUT_OF_STOCK',
        message: friendlyMsg,
        soldOutItemIds,
        unavailableItems: itemNames,
        isNetworkError: false,
      };
    }
  }

  // 2. Authoritative Backend Price Calculation
  let validatedSubtotal = Number(order.subtotal) || 0;

  if (itemsToValidate && itemsToValidate.length > 0) {
    let calculatedSum = 0;
    for (const item of itemsToValidate) {
      let livePrice = livePriceMap.get(item.id);
      if (typeof livePrice !== 'number' || isNaN(livePrice)) {
        const canonicalSku = getCanonicalSku(item);
        const catalogItem = MENU_ITEMS.find((m) => m.id === item.id || m.id === canonicalSku || m.id === canonicalSku.split(':')[0]);
        livePrice = catalogItem ? Number(catalogItem.price) : Number(item.price || 0);
      }
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      calculatedSum += livePrice * qty;
    }

    if (calculatedSum > 0) {
      validatedSubtotal = calculatedSum;
    }
  }

  // 3. Validate discount & final total on server
  let validatedDiscount = 0;
  if (isOfferActive(offer)) {
    const minOrderAmt = Number(offer?.min_order_amount) || 0;
    const discountPercent = Number(offer?.discount_percent) || 0;
    if (minOrderAmt > 0 && validatedSubtotal >= minOrderAmt && discountPercent > 0) {
      validatedDiscount = Math.round((validatedSubtotal * discountPercent) / 100);
    }
    if (
      appliedCouponCode &&
      offer?.coupon_code &&
      appliedCouponCode.trim().toUpperCase() === offer.coupon_code.trim().toUpperCase() &&
      minOrderAmt > 0 &&
      validatedSubtotal >= minOrderAmt
    ) {
      validatedDiscount += Number(offer.coupon_flat_discount) || 0;
    }
  } else if (Number(order.discount_amount) > 0) {
    validatedDiscount = Math.min(Number(order.discount_amount), validatedSubtotal);
  }

  const validatedPackingFee = Math.max(0, Math.floor(Number(order.packing_fee) || 0));
  const validatedFinalTotal = Math.max(0, validatedSubtotal - validatedDiscount) + validatedPackingFee;
  const resolvedIdempotencyKey = idempotencyKey || order.idempotency_key || null;

  const rawMethod = paymentMethod || order.payment_method || (order as unknown as Record<string, unknown>).paymentMethod || 'UPI';
  const resolvedPaymentMethod: 'UPI' | 'COD' = String(rawMethod).toUpperCase().trim() === 'COD' ? 'COD' : 'UPI';

  const orderToSave: DbOrder = {
    ...order,
    subtotal: validatedSubtotal,
    discount_amount: validatedDiscount,
    packing_fee: validatedPackingFee,
    final_total: validatedFinalTotal,
    payment_method: 'UPI',
    payment_status: order.payment_status || 'pending',
    idempotency_key: resolvedIdempotencyKey,
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    orderToSave.id = localOrdersCache.length + 1;
    // Generate 8-character uppercase alphanumeric code if code is legacy short/empty
    if (!orderToSave.order_code || orderToSave.order_code.startsWith('VG-')) {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      orderToSave.order_code = code;
    }
    localOrdersCache.unshift(orderToSave);
    return { success: true, data: orderToSave, isNetworkError: false };
  }

  try {
    // 1. Authoritative Server-Side Order & Price Verification via RPC
    const rpcPayload = {
      p_customer_name: String(orderToSave.customer_name).trim(),
      p_customer_phone: String(orderToSave.customer_phone).trim(),
      p_order_type: String(orderToSave.order_type || 'DELIVERY_5KM'),
      p_distance_km: orderToSave.distance_km !== null && typeof orderToSave.distance_km === 'number' ? Number(orderToSave.distance_km) : null,
      p_items_json: (itemsToValidate || []).map((item) => {
        const canonicalSku = getCanonicalSku(item);
        const variantVal = (item as any).size || (item as any).portionNote || (item as any).variant || null;
        return {
          id: String(item.id),
          sku: canonicalSku,
          name: String(item.name || ''),
          quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
          price: Number(item.price) || 0,
          variant: variantVal ? String(variantVal) : null,
        };
      }),
      p_coupon_code: appliedCouponCode ? appliedCouponCode.trim() : null,
      p_address_notes: String(orderToSave.address_notes || '').trim(),
      p_maps_link: String(orderToSave.maps_link || '').trim(),
      p_payment_method: 'UPI',
      p_idempotency_key: resolvedIdempotencyKey,
      p_expected_total: Number(orderToSave.final_total) || null,
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('submit_verified_order', rpcPayload);

    if (!rpcError && rpcData && typeof rpcData === 'object') {
      if (rpcData.success) {
        orderToSave.id = rpcData.order_id || Date.now();
        orderToSave.order_code = rpcData.order_code || orderToSave.order_code;
        orderToSave.subtotal = Number(rpcData.subtotal) || orderToSave.subtotal;
        orderToSave.discount_amount = Number(rpcData.discount_amount) || orderToSave.discount_amount;
        orderToSave.final_total = Number(rpcData.final_total) || orderToSave.final_total;
        orderToSave.payment_status = rpcData.payment_status || 'pending';
        orderToSave.payment_method = rpcData.payment_method || resolvedPaymentMethod;
        if (resolvedIdempotencyKey) {
          orderToSave.idempotency_key = resolvedIdempotencyKey;
        }

        localOrdersCache.unshift(orderToSave);
        return {
          success: true,
          data: orderToSave,
          free_item_name: rpcData.free_item_name,
          isNetworkError: false,
        };
      }

      // Handle authoritative business rule rejections from server
      const statusVal = String(rpcData.status || '');
      if (statusVal === 'closed') {
        const msg = mapOrderErrorToMessage('closed', {
          opens_at: rpcData.opens_at,
          closes_at: rpcData.closes_at,
        });
        return {
          success: false,
          status: 'closed',
          error: 'STORE_CLOSED',
          message: msg,
          isNetworkError: false,
        };
      }

      if (statusVal === 'closed_last_order') {
        const msg = mapOrderErrorToMessage('closed_last_order');
        return {
          success: false,
          status: 'closed_last_order',
          error: 'CLOSED_LAST_ORDER',
          message: msg,
          isNetworkError: false,
        };
      }

      if (statusVal === 'item_unavailable') {
        const unavailableItems: string[] = Array.isArray(rpcData.items) ? rpcData.items : [];
        const msg = mapOrderErrorToMessage('item_unavailable', { items: unavailableItems }, itemsToValidate);
        return {
          success: false,
          status: 'item_unavailable',
          error: 'OUT_OF_STOCK',
          message: msg,
          unavailableItems,
          soldOutItemIds: unavailableItems,
          isNetworkError: false,
        };
      }

      if (statusVal === 'unknown_item') {
        const unknownItems: string[] = Array.isArray(rpcData.items) ? rpcData.items : [];
        const msg = mapOrderErrorToMessage('unknown_item', { items: unknownItems }, itemsToValidate);
        return {
          success: false,
          status: 'unknown_item',
          error: 'UNKNOWN_ITEM',
          message: msg,
          unknownItems,
          isNetworkError: false,
        };
      }

      if (statusVal === 'price_changed') {
        const msg = mapOrderErrorToMessage('price_changed');
        return {
          success: false,
          status: 'price_changed',
          error: 'PRICE_CHANGED',
          message: msg,
          server_total: Number(rpcData.server_total) || 0,
          lines: Array.isArray(rpcData.lines) ? rpcData.lines : [],
          isNetworkError: false,
        };
      }

      return {
        success: false,
        status: statusVal || 'ORDER_FAILED',
        error: statusVal || 'ORDER_FAILED',
        message: rpcData.message || rpcData.error || 'Database order submission was rejected.',
        isNetworkError: false,
      };
    }

    if (rpcError) {
      const errorMsg = rpcError.message || '';
      if (errorMsg.includes('Sold Out') || errorMsg.includes('item_unavailable')) {
        return {
          success: false,
          status: 'item_unavailable',
          error: 'OUT_OF_STOCK',
          message: errorMsg,
          soldOutItemIds,
          isNetworkError: false,
        };
      }
      const isNet = isNetworkError(rpcError);
      return {
        success: false,
        data: orderToSave,
        error: isNet ? 'NETWORK_ERROR' : 'ORDER_FAILED',
        message: isNet
          ? 'Network connection error. Please check your connection and try again.'
          : errorMsg || 'Database order submission failed.',
        isNetworkError: isNet,
      };
    }

    orderToSave.id = Date.now();
    localOrdersCache.unshift(orderToSave);
    return { success: true, data: orderToSave, isNetworkError: false };
  } catch (err: any) {
    const isNet = isNetworkError(err);
    console.error('Failed to create order in Supabase:', err);
    orderToSave.id = Date.now();
    localOrdersCache.unshift(orderToSave);
    return {
      success: false,
      data: orderToSave,
      error: isNet ? 'NETWORK_ERROR' : 'ORDER_FAILED',
      message: isNet
        ? 'Network connection error. Please check your connection and try again.'
        : err?.message || 'Database insert failed',
      isNetworkError: isNet,
    };
  }
}

/**
 * Backward-compatible & typed alias wrapper for submit_verified_order RPC
 */
export const submitVerifiedOrder = createOrder;

/**
 * Confirm Customer UPI Reference (UTR)
 * Calls the secure confirm_order_utr RPC on Supabase.
 */
export async function confirmOrderUtr(
  orderCode: string,
  utr: string
): Promise<ConfirmUtrResult> {
  const cleanUtr = String(utr || '').trim();
  const cleanCode = String(orderCode || '').trim();

  // Client-side regex pre-check (must be exactly 12 numeric digits)
  if (!/^[0-9]{12}$/.test(cleanUtr)) {
    return {
      success: false,
      status: 'invalid_utr',
      message: UTR_ERROR_MESSAGES.invalid_utr,
      isNetworkError: false,
    };
  }

  if (!cleanCode) {
    return {
      success: false,
      status: 'invalid_order',
      message: UTR_ERROR_MESSAGES.invalid_order,
      isNetworkError: false,
    };
  }

  // Offline / mock fallback
  if (!supabase) {
    const localOrd = localOrdersCache.find((o) => o.order_code === cleanCode);
    if (localOrd) {
      if (localOrd.payment_method === 'COD') {
        return {
          success: false,
          status: 'not_applicable',
          message: UTR_ERROR_MESSAGES.not_applicable,
          isNetworkError: false,
        };
      }
      if (localOrd.payment_status === 'confirmed' || localOrd.payment_status === 'rejected') {
        return {
          success: false,
          status: 'already_processed',
          message: UTR_ERROR_MESSAGES.already_processed,
          isNetworkError: false,
        };
      }
      localOrd.utr = cleanUtr;
      localOrd.payment_status = 'utr_submitted';
      localOrd.utr_submitted_at = new Date().toISOString();
    }
    return {
      success: true,
      status: 'ok',
      message: 'UPI reference submitted successfully.',
      isNetworkError: false,
    };
  }

  try {
    const { data, error } = await supabase.rpc('confirm_order_utr', {
      p_order_code: cleanCode,
      p_utr: cleanUtr,
    });

    if (error) {
      const isNet = isNetworkError(error);
      return {
        success: false,
        status: isNet ? 'network_error' : 'unknown_error',
        message: isNet ? UTR_ERROR_MESSAGES.network_error : error.message || UTR_ERROR_MESSAGES.unknown_error,
        isNetworkError: isNet,
      };
    }

    const statusVal = ((data as Record<string, unknown>)?.status || 'unknown_error') as ConfirmUtrStatus;
    if (statusVal === 'ok') {
      const localOrd = localOrdersCache.find((o) => o.order_code === cleanCode);
      if (localOrd) {
        localOrd.utr = cleanUtr;
        localOrd.payment_status = 'utr_submitted';
        localOrd.utr_submitted_at = new Date().toISOString();
      }
      return {
        success: true,
        status: 'ok',
        message: 'UPI reference recorded successfully.',
        isNetworkError: false,
      };
    }

    if (statusVal === 'not_applicable') {
      return {
        success: false,
        status: 'not_applicable',
        message: UTR_ERROR_MESSAGES.not_applicable,
        isNetworkError: false,
      };
    }

    return {
      success: false,
      status: statusVal,
      message: UTR_ERROR_MESSAGES[statusVal] || UTR_ERROR_MESSAGES.unknown_error,
      isNetworkError: false,
    };
  } catch (err) {
    const isNet = isNetworkError(err);
    return {
      success: false,
      status: isNet ? 'network_error' : 'unknown_error',
      message: isNet ? UTR_ERROR_MESSAGES.network_error : UTR_ERROR_MESSAGES.unknown_error,
      isNetworkError: isNet,
    };
  }
}

export type AdminPaymentStatus = 'confirmed' | 'rejected';

export interface AdminUpdatePaymentResult {
  success: boolean;
  status?: string;
  error?: string | null;
  isNetworkError?: boolean;
}

/**
 * Admin: Update order payment status ('confirmed' | 'rejected') via secure RPC
 */
export async function adminUpdatePaymentStatus(
  pin: string,
  orderId: number,
  status: AdminPaymentStatus | string
): Promise<AdminUpdatePaymentResult> {
  const cleanStatus = String(status || '').toLowerCase().trim();
  if (cleanStatus !== 'confirmed' && cleanStatus !== 'rejected') {
    return {
      success: false,
      error: 'Payment status must be either confirmed or rejected.',
      isNetworkError: false,
    };
  }

  // Update memory cache
  localOrdersCache = localOrdersCache.map((ord) =>
    ord.id === orderId ? { ...ord, payment_status: cleanStatus } : ord
  );

  if (!supabase) {
    return { success: true, status: cleanStatus, isNetworkError: false };
  }

  try {
    const { data, error } = await supabase.rpc('admin_update_payment_status', {
      input_pin: pin.trim(),
      target_order_id: Number(orderId),
      new_payment_status: cleanStatus,
    });

    if (error) {
      const isNet = isNetworkError(error);
      return {
        success: false,
        error: isNet
          ? 'Network connection error. Please check your connection and try again.'
          : error.message || 'Unauthorized or update failed.',
        isNetworkError: isNet,
      };
    }

    if (data && typeof data === 'object') {
      const res = data as Record<string, unknown>;
      const isOk = Boolean(res.success || res.ok);
      if (!isOk) {
        return {
          success: false,
          error: ((res.error || res.message) as string) || 'Update failed.',
          isNetworkError: false,
        };
      }
      return { success: true, status: cleanStatus, isNetworkError: false };
    }

    return { success: true, status: cleanStatus, isNetworkError: false };
  } catch (err) {
    const isNet = isNetworkError(err);
    return {
      success: false,
      error: isNet
        ? 'Network connection error. Please check your connection and try again.'
        : 'Failed to update payment status.',
      isNetworkError: isNet,
    };
  }
}

export interface FetchOrdersResult {
  orders: DbOrder[];
  success: boolean;
  isNetworkError: boolean;
  authError?: boolean;
  error?: string;
}

/**
 * Fetch all orders with detailed status (for silent background polling)
 */
export async function fetchOrdersWithStatus(
  adminPin?: string,
  limit: number = 200
): Promise<FetchOrdersResult> {
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
  if (!supabase) {
    return {
      orders: localOrdersCache.slice(0, boundedLimit),
      success: true,
      isNetworkError: false,
      authError: false,
    };
  }

  const pin = getStoredAdminPin(adminPin);

  try {
    const { data, error } = await supabase.rpc('admin_get_orders', {
      input_pin: pin,
      p_limit: boundedLimit,
    });

    if (error) {
      const isNet = isNetworkError(error);
      const isAuth =
        !isNet &&
        (error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('incorrect pin') ||
          error.message?.toLowerCase().includes('locked') ||
          error.code === 'P0001');
      return {
        orders: [],
        success: false,
        isNetworkError: isNet,
        authError: isAuth,
        error: error.message,
      };
    }

    return {
      orders: (data as DbOrder[]) || [],
      success: true,
      isNetworkError: false,
      authError: false,
    };
  } catch (err: unknown) {
    const isNet = isNetworkError(err);
    return {
      orders: [],
      success: false,
      isNetworkError: isNet,
      authError: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Fetch all orders for Owner Dashboard via secure RPC with optional limit
 */
export async function fetchOrders(
  adminPin?: string,
  limit: number = 200
): Promise<DbOrder[]> {
  const res = await fetchOrdersWithStatus(adminPin, limit);
  if (res.success) {
    return res.orders;
  }
  return localOrdersCache.slice(0, Math.max(1, Math.min(Number(limit) || 200, 500)));
}

/**
 * Update order status (e.g. 'Completed') via secure RPC
 */
export async function updateOrderStatus(
  id: number,
  status: string,
  adminPin?: string
): Promise<boolean> {
  localOrdersCache = localOrdersCache.map((ord) =>
    ord.id === id ? { ...ord, status } : ord
  );

  if (!supabase) {
    return true;
  }

  const pin = getStoredAdminPin(adminPin);

  try {
    const { error } = await supabase.rpc('admin_update_order_status', {
      input_pin: pin,
      target_order_id: Number(id),
      new_status: status,
    });

    if (error) {
      console.error('admin_update_order_status failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update order status:', err);
    return false;
  }
}
