import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchLiveMenuOverrides,
  LiveMenuOverridesResult,
  LiveMenuSkuOverride,
  LiveSaleSettings,
  isBrowser,
} from '../utils/supabaseClient';
import { MENU_ITEMS } from '../data/restaurantData';

// Normalized lookup map: dish name / alt ids -> canonical item_id / SKU
const nameToIdMap = new Map<string, string>();
MENU_ITEMS.forEach((item) => {
  nameToIdMap.set(item.name.toLowerCase().trim(), item.id);
  // Also map pure numeric string if item.id has "dish-12"
  if (item.id.startsWith('dish-')) {
    nameToIdMap.set(item.id.replace('dish-', ''), item.id);
  }
});

class LiveMenuStore {
  private state: LiveMenuOverridesResult | null = null;
  private listeners: Set<(state: LiveMenuOverridesResult | null) => void> = new Set();
  private isListeningToBrowserEvents = false;

  constructor() {
    // SSR safe - no browser event registration at import time
  }

  public getState(): LiveMenuOverridesResult | null {
    return this.state;
  }

  public subscribe(listener: (state: LiveMenuOverridesResult | null) => void): () => void {
    this.listeners.add(listener);
    this.initBrowserEvents();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in live menu listener:', err);
      }
    });
  }

  public async fetch(force: boolean = false): Promise<LiveMenuOverridesResult | null> {
    if (!isBrowser) return null;
    const result = await fetchLiveMenuOverrides(force);
    if (result) {
      this.state = result;
      this.notify();
    }
    return this.state;
  }

  private initBrowserEvents() {
    if (!isBrowser || this.isListeningToBrowserEvents || typeof document === 'undefined') {
      return;
    }
    this.isListeningToBrowserEvents = true;

    // Trigger (b): when the tab becomes visible again, throttled to 30s inside fetchLiveMenuOverrides
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.fetch(false);
      }
    });

    // Trigger (c): when browser comes back online
    window.addEventListener('online', () => {
      this.fetch(false);
    });
  }
}

export const globalLiveMenuStore = new LiveMenuStore();

/**
 * Global imperative helper to force or throttle-refresh live menu
 */
export async function refreshLiveMenu(force: boolean = false): Promise<LiveMenuOverridesResult | null> {
  return globalLiveMenuStore.fetch(force);
}

/**
 * Global snapshot reader (safe after mount / in handlers)
 */
export function getLiveMenuSnapshot(): LiveMenuOverridesResult | null {
  return globalLiveMenuStore.getState();
}

/**
 * Resolves a SKU, item_id, numeric id or dish name to a live override
 */
export function findSkuOverride(
  key: string | number | undefined | null,
  overrides: Map<string, LiveMenuSkuOverride> | undefined
): LiveMenuSkuOverride | null {
  if (!key || !overrides || overrides.size === 0) return null;

  const rawKey = String(key).trim();
  const lowerKey = rawKey.toLowerCase();

  // 1. Direct exact match
  if (overrides.has(rawKey)) return overrides.get(rawKey)!;
  if (overrides.has(lowerKey)) return overrides.get(lowerKey)!;

  // 2. If it's a numeric ID e.g. "35" or 35 -> try "dish-35"
  if (/^\d+$/.test(rawKey)) {
    const dishKey = `dish-${rawKey}`;
    if (overrides.has(dishKey)) return overrides.get(dishKey)!;
  }

  // 3. If it starts with "dish-35" -> try "35"
  if (lowerKey.startsWith('dish-')) {
    const numKey = lowerKey.replace('dish-', '');
    if (overrides.has(numKey)) return overrides.get(numKey)!;
  }

  // 4. If key is variant-encoded e.g. "dish-273:half" or "273:half"
  if (lowerKey.includes(':')) {
    const [base, variant] = lowerKey.split(':');
    if (overrides.has(lowerKey)) return overrides.get(lowerKey)!;
    if (base.startsWith('dish-')) {
      const numVariantKey = `${base.replace('dish-', '')}:${variant}`;
      if (overrides.has(numVariantKey)) return overrides.get(numVariantKey)!;
    } else if (/^\d+$/.test(base)) {
      const dishVariantKey = `dish-${base}:${variant}`;
      if (overrides.has(dishVariantKey)) return overrides.get(dishVariantKey)!;
    }
  }

  // 5. Dish name lookup
  const mappedId = nameToIdMap.get(lowerKey);
  if (mappedId) {
    if (overrides.has(mappedId)) return overrides.get(mappedId)!;
    const lowerMapped = mappedId.toLowerCase();
    if (overrides.has(lowerMapped)) return overrides.get(lowerMapped)!;
  }

  return null;
}

export interface UseLiveMenuReturn {
  loaded: boolean;
  serverTime: string | null;
  sale: LiveSaleSettings;
  overrides: Map<string, LiveMenuSkuOverride>;
  getPrice: (key: string | number | undefined | null, fallbackPrice: number) => number;
  getMrp: (
    key: string | number | undefined | null,
    fallbackMrp: number | null | undefined,
    fallbackPrice: number
  ) => number;
  isAvailable: (key: string | number | undefined | null, fallbackAvailable?: boolean) => boolean;
  getSavings: (price: number, mrp: number) => number;
  refetch: (force?: boolean) => Promise<LiveMenuOverridesResult | null>;
}

const DEFAULT_SALE: LiveSaleSettings = {
  active: false,
  percent: 10,
  ends_at: null,
};

/**
 * Shared hook for live menu sync across the customer application.
 *
 * Strict requirements satisfied:
 * 1. Static prices render first; updates applied only after mount via useEffect.
 * 2. Struck-through old price & "Save Rs X" computed from live price & mrp; hidden if saving <= 0.
 * 3. Server settings govern flash sale; countdown is display only; sale disappears when inactive.
 * 4. Deduplicated, throttled (30s) visibilitychange & online triggers.
 */
export function useLiveMenu(): UseLiveMenuReturn {
  // During SSR and initial render, liveData is null so static values render first without layout shifts
  const [liveData, setLiveData] = useState<LiveMenuOverridesResult | null>(null);

  useEffect(() => {
    // Only runs in browser after mount
    setLiveData(globalLiveMenuStore.getState());

    const unsubscribe = globalLiveMenuStore.subscribe((updated) => {
      setLiveData(updated);
    });

    // Trigger (a): initial fetch on mount
    globalLiveMenuStore.fetch(false);

    return unsubscribe;
  }, []);

  const loaded = Boolean(liveData?.loaded);
  const serverTime = liveData?.server_time || null;
  const overrides = useMemo(() => liveData?.overrides || new Map<string, LiveMenuSkuOverride>(), [liveData]);

  // Server sale settings with client-side expiration validation
  const sale = useMemo<LiveSaleSettings>(() => {
    if (!liveData || !liveData.sale) return DEFAULT_SALE;
    const rawSale = liveData.sale;
    let isActive = Boolean(rawSale.active);

    if (isActive && rawSale.ends_at) {
      const ends = new Date(rawSale.ends_at).getTime();
      if (!isNaN(ends) && Date.now() > ends) {
        isActive = false;
      }
    }

    return {
      active: isActive,
      percent: rawSale.percent || 10,
      ends_at: rawSale.ends_at,
      min_order: rawSale.min_order,
      coupon: rawSale.coupon,
      flat_discount: rawSale.flat_discount,
    };
  }, [liveData]);

  const getPrice = useCallback(
    (key: string | number | undefined | null, fallbackPrice: number): number => {
      if (!liveData) return fallbackPrice;
      const override = findSkuOverride(key, liveData.overrides);
      if (override && typeof override.price === 'number' && override.price > 0) {
        return override.price;
      }
      return fallbackPrice;
    },
    [liveData]
  );

  const getMrp = useCallback(
    (
      key: string | number | undefined | null,
      fallbackMrp: number | null | undefined,
      fallbackPrice: number
    ): number => {
      const activePrice = getPrice(key, fallbackPrice);
      if (!liveData) {
        if (typeof fallbackMrp === 'number' && fallbackMrp > 0) return fallbackMrp;
        return activePrice;
      }

      const override = findSkuOverride(key, liveData.overrides);
      if (override && typeof override.mrp === 'number' && override.mrp > 0) {
        return override.mrp;
      }

      if (typeof fallbackMrp === 'number' && fallbackMrp > 0) {
        return fallbackMrp;
      }

      // No synthetic markup; return activePrice so savings is 0 unless real aggregator price is set
      return activePrice;
    },
    [liveData, getPrice]
  );

  const isAvailable = useCallback(
    (key: string | number | undefined | null, fallbackAvailable: boolean = true): boolean => {
      if (!liveData) return fallbackAvailable;
      const override = findSkuOverride(key, liveData.overrides);
      if (override && typeof override.available === 'boolean') {
        return override.available;
      }
      return fallbackAvailable;
    },
    [liveData]
  );

  const getSavings = useCallback((price: number, mrp: number): number => {
    const diff = mrp - price;
    return diff > 0 ? diff : 0;
  }, []);

  const refetch = useCallback(async (force: boolean = false) => {
    return globalLiveMenuStore.fetch(force);
  }, []);

  return {
    loaded,
    serverTime,
    sale,
    overrides,
    getPrice,
    getMrp,
    isAvailable,
    getSavings,
    refetch,
  };
}
