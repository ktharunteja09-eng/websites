import React, { useState, useMemo, useEffect } from 'react';
import { MENU_CATEGORIES, RESTAURANT_INFO } from '../data/restaurantData';
import {
  Search,
  ExternalLink,
  Phone,
  Sparkles,
  Camera,
  ListOrdered,
  Utensils,
  MapPin,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Navigation,
  X,
  TrendingDown,
  ShieldCheck,
  Gift,
  Percent,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PhotoMenu } from './PhotoMenu';
import { MenuCategoryType, DbMenuItem, CartItem, StoreOffer, OrderType } from '../types';
import {
  fetchMenuItems,
  fetchStoreOffer,
  getLocalFallbackMenuItems,
  calculateHaversineDistanceKm,
  verifyDeliveryDistance,
  RESTAURANT_COORDS,
  DELIVERY_RADIUS_KM,
  SWIGGY_URL,
  ZOMATO_URL,
} from '../utils/supabaseClient';
import { FloatingCartBar } from './FloatingCartBar';
import { DirectOrderModal } from './DirectOrderModal';
import { PriceComparisonModal } from './PriceComparisonModal';
import { useLenis } from './SmoothScrollProvider';
import { MenuStickyPills } from './menu/MenuStickyPills';
import { MenuBottomSheet } from './menu/MenuBottomSheet';
import { MenuMobileItemCard } from './menu/MenuMobileItemCard';
import { MenuSizePickerModal } from './menu/MenuSizePickerModal';
import { MenuFloatingButton } from './menu/MenuFloatingButton';
import { groupDishesForMobile, GroupedMobileDish, ItemVariantOption } from '../utils/menuVariants';

export const MenuSection: React.FC = () => {
  // Menu View Mode: Classic A La Carte vs Photo Menu Cards
  const [menuViewMode, setMenuViewMode] = useState<'list' | 'cards'>('list');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Mobile Classic Menu States
  const { scrollTo } = useLenis();
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(false);
  const [sizePickerDish, setSizePickerDish] = useState<GroupedMobileDish | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [headerHeight, setHeaderHeight] = useState<number>(68);
  const isScrollingProgrammatically = React.useRef<boolean>(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);
  const menuBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // Supabase Data (Pre-initialized with fallback menu for complete static HTML pre-rendering)
  const [dishes, setDishes] = useState<DbMenuItem[]>(() => getLocalFallbackMenuItems());
  const [offer, setOffer] = useState<StoreOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ordering & Geolocation State
  const [orderingMode, setOrderingMode] = useState<'none' | 'delivery' | 'pickup'>('none');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userDistanceKm, setUserDistanceKm] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'checking' | 'eligible' | 'outside' | 'error'>('idle');
  const [showEligibleOnly, setShowEligibleOnly] = useState<boolean>(false);

  // Cart & Checkout State (Synced to localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // LocalStorage Persistence: Sync cart array to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: cartItems.length } }));
      }
    } catch {}
  }, [cartItems]);

  // Fetch Menu & Store Offer from Supabase (with daily auto-reset)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const [fetchedItems, fetchedOffer] = await Promise.all([
        fetchMenuItems(),
        fetchStoreOffer(),
      ]);

      if (!isMounted) return;
      setDishes(fetchedItems);
      setOffer(fetchedOffer);
      setLoading(false);

      // Dynamic price sync: Update any active cart items to reflect live Supabase prices!
      if (fetchedItems && fetchedItems.length > 0) {
        const livePriceMap = new Map<string, number>();
        fetchedItems.forEach((d) => {
          livePriceMap.set(String(d.id), d.price);
        });

        setCartItems((prevCart) => {
          if (!prevCart || prevCart.length === 0) return prevCart;
          let changed = false;
          const updated = prevCart.map((item) => {
            const baseId = String(item.id).split(':')[0];
            const livePrice = livePriceMap.get(baseId);
            if (
              livePrice !== undefined &&
              livePrice > 0 &&
              !String(item.id).includes(':') &&
              item.price !== livePrice
            ) {
              changed = true;
              return { ...item, price: livePrice };
            }
            return item;
          });
          return changed ? updated : prevCart;
        });
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Restore previously verified GPS session if available
  useEffect(() => {
    try {
      const savedMode = sessionStorage.getItem('vaibhav_order_mode');
      if (savedMode === 'takeaway' || savedMode === 'pickup') {
        setOrderingMode('pickup');
        setShowEligibleOnly(true);
        setGeoStatus('idle');
      }

      // Check delivery_gps_cache first
      const cachedGps = sessionStorage.getItem('delivery_gps_cache');
      if (cachedGps) {
        const parsed = JSON.parse(cachedGps);
        const dist = typeof parsed.distanceKm === 'number' && parsed.distanceKm > 0 ? parsed.distanceKm : null;
        const isEligible = dist !== null && dist > 0 && dist <= 5.0 && Boolean(parsed.eligible);
        setUserDistanceKm(dist);
        if (isEligible && savedMode !== 'takeaway' && savedMode !== 'pickup') {
          setGeoStatus('eligible');
          setOrderingMode('delivery');
          setShowEligibleOnly(true);
        } else if (!isEligible && savedMode !== 'takeaway' && savedMode !== 'pickup') {
          setGeoStatus('outside');
          setOrderingMode('none');
        }
      } else {
        const savedGeo = sessionStorage.getItem('vaibhav_delivery_geo');
        if (savedGeo) {
          const parsed = JSON.parse(savedGeo);
          const dist = typeof parsed.distanceKm === 'number' ? parsed.distanceKm : parsed.roadKm;
          if (typeof dist === 'number' && dist > 0) {
            const isEligible = Boolean(parsed.eligible) && dist > 0 && dist <= 5.0;
            setUserDistanceKm(dist);
            if (isEligible && savedMode !== 'takeaway' && savedMode !== 'pickup') {
              setGeoStatus('eligible');
              setOrderingMode('delivery');
              setShowEligibleOnly(true);
            } else if (!isEligible && savedMode !== 'takeaway' && savedMode !== 'pickup') {
              setGeoStatus('outside');
              setOrderingMode('none');
            }
          }
        }
      }
    } catch {}
  }, []);

  // Handle Geolocation Check for 5.0 km Direct Delivery (via ORS with Haversine fallback)
  const handleUnlockDelivery = () => {
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationError(true);
      setUserDistanceKm(null);
      setGeoStatus('outside');
      setOrderingMode('none');
      sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: null, eligible: false }));
      sessionStorage.setItem('vaibhav_order_mode', 'outside');
      return;
    }

    setGeoStatus('checking');

    let handled = false;
    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerOutsideState = (err?: GeolocationPositionError | { code: number; message: string }) => {
      if (handled) return;
      handled = true;
      if (watchdogTimer) clearTimeout(watchdogTimer);

      console.warn('Native GPS error or blocked, switching to Outside 5km / Takeaway state:', err);
      // Code 1: PERMISSION_DENIED, Code 2: POSITION_UNAVAILABLE, Code 3: TIMEOUT
      setLocationError(true);
      setUserDistanceKm(null);
      setGeoStatus('outside');
      setOrderingMode('none');
      sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: null, eligible: false }));
      sessionStorage.setItem('vaibhav_order_mode', 'outside');
    };

    // Safety watchdog: Give full 15s to native GPS, trigger after 16s if browser freezes
    watchdogTimer = setTimeout(() => {
      triggerOutsideState({ code: 3, message: 'GPS watchdog timeout exceeded' });
    }, 16000);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (handled) return;
          handled = true;
          if (watchdogTimer) clearTimeout(watchdogTimer);

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          try {
            const result = await verifyDeliveryDistance(lat, lng);
            const dist = typeof result.distanceKm === 'number' ? result.distanceKm : (typeof result.roadKm === 'number' ? result.roadKm : null);
            const isEligible = Boolean(result.eligible) && dist !== null && dist > 0 && dist <= 5.0;
            setUserDistanceKm(dist);
            setLocationError(false);

            sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: dist, eligible: isEligible }));
            if (isEligible) {
              setGeoStatus('eligible');
              setOrderingMode('delivery');
              setShowEligibleOnly(true);
              sessionStorage.setItem('vaibhav_order_mode', 'delivery');
            } else {
              setGeoStatus('outside');
              setOrderingMode('none');
              sessionStorage.setItem('vaibhav_order_mode', 'outside');
            }
          } catch {
            triggerOutsideState({ code: 2, message: 'Distance verification failed' });
          }
        },
        (error) => {
          // Native PositionError codes: 1 (Permission Denied), 2 (Position Unavailable), 3 (Timeout)
          triggerOutsideState(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch {
      triggerOutsideState({ code: 2, message: 'Geolocation invocation exception' });
    }
  };

  // Handle Unlock for Self-Pickup
  const handleUnlockPickup = () => {
    setLocationError(false);
    setOrderingMode('pickup');
    setShowEligibleOnly(true);
    // Keep delivery_gps_cache so rejection or verified state survives tab switching
    sessionStorage.setItem('vaibhav_order_mode', 'pickup');
  };

  // Cart Operations (Locked when checkout modal is open or when ordering mode is exited/locked)
  const handleAddToCart = (dish: DbMenuItem) => {
    if (isCheckoutOpen) return;
    if (!isUnlocked) return;
    if (!dish.direct_order_eligible || dish.is_completed) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(dish.id));
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(dish.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          category: dish.category,
          price: dish.price,
          quantity: 1,
          isVeg: dish.is_veg,
        },
      ];
    });
  };

  const handleSelectVariant = (groupedDish: GroupedMobileDish, variant: ItemVariantOption) => {
    if (isCheckoutOpen) return;
    if (!isUnlocked) return;
    if (!variant.directEligible || variant.isCompleted) return;

    const lineId = `${variant.dishId}:${variant.size.toLowerCase()}`;
    const lineName = `${groupedDish.name} (${variant.size})`;

    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === lineId);
      if (existing) {
        return prev.map((item) =>
          String(item.id) === lineId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          name: lineName,
          category: groupedDish.category,
          price: variant.price,
          quantity: 1,
          isVeg: groupedDish.isVeg,
          size: variant.size,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (id: number | string, delta: number) => {
    if (!isUnlocked) return;
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (String(item.id) === String(id) || item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (id: number | string) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(id) && item.id !== id));
  };

  const handleClearCart = (force = false) => {
    // Only allow clearing while checkout modal is open if force is explicitly passed
    if (isCheckoutOpen && !force) return;
    setCartItems([]);
    try {
      localStorage.removeItem('cart');
    } catch {}
  };

  const isUnlocked = orderingMode !== 'none';

  // Filtered menu items
  const filteredDishes = useMemo(() => {
    return dishes.filter((item) => {
      // Direct delivery filter toggle
      if (isUnlocked && showEligibleOnly && !item.direct_order_eligible) {
        return false;
      }

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      // Dietary filter
      const matchesDiet =
        dietFilter === 'all'
          ? true
          : dietFilter === 'veg'
          ? item.is_veg
          : !item.is_veg;

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.portionNote && item.portionNote.toLowerCase().includes(q));

      return matchesCategory && matchesDiet && matchesQuery;
    });
  }, [dishes, selectedCategory, searchQuery, dietFilter, isUnlocked, showEligibleOnly]);

  // Category dish counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dishes.length };
    dishes.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [dishes]);

  // Group filtered dishes into ordered categories based on MENU_CATEGORIES
  const groupedSections = useMemo(() => {
    const categoryMap = new Map<string, { id: string; label: string; items: DbMenuItem[] }>();

    MENU_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        categoryMap.set(cat.id, { id: cat.id, label: cat.label, items: [] });
      }
    });

    filteredDishes.forEach((item) => {
      let grp = categoryMap.get(item.category);
      if (!grp) {
        grp = { id: item.category, label: item.category, items: [] };
        categoryMap.set(item.category, grp);
      }
      grp.items.push(item);
    });

    return Array.from(categoryMap.values()).filter((g) => g.items.length > 0);
  }, [filteredDishes]);

  // Group mobile dishes with size variants for each section
  const groupedSectionsWithMobile = useMemo(() => {
    return groupedSections.map((section) => ({
      ...section,
      mobileItems: groupDishesForMobile(section.items),
    }));
  }, [groupedSections]);

  // Mobile categories list for pills and bottom sheet
  const mobileCategories = useMemo(() => {
    return MENU_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: categoryCounts[cat.id] ?? 0,
    }));
  }, [categoryCounts]);

  // Programmatic scroll to category with smooth Lenis, suppressed observer, and auto-centering
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    isScrollingProgrammatically.current = true;

    const targetEl = document.getElementById(`category-${catId}`);
    if (targetEl) {
      // Offset accounts for sticky navbar + sticky pills row height
      const offset = -(headerHeight + 54);
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        const top = targetEl.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: 'instant' });
        isScrollingProgrammatically.current = false;
      } else {
        scrollTo(targetEl, { offset, duration: 0.85 });
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 900);
      }
    }
  };

  // 1. Measure sticky header height dynamically and listen for resize
  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;

    const measureHeader = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        const h = Math.round(headerEl.getBoundingClientRect().height);
        if (h > 0) {
          setHeaderHeight(h);
          document.documentElement.style.setProperty('--header-height', `${h}px`);
        }
      }
    };

    measureHeader();
    window.addEventListener('resize', measureHeader, { passive: true });
    return () => window.removeEventListener('resize', measureHeader);
  }, []);

  // 2. Scroll-spy IntersectionObserver on category sections
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      (typeof process !== 'undefined' && Boolean(process.versions?.node))
    ) {
      return;
    }

    const categoryElements = document.querySelectorAll('[id^="category-"]');
    if (categoryElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('category-', '');
            setActiveCategory(id);
          }
        });
      },
      {
        rootMargin: `-${headerHeight + 52}px 0px -65% 0px`,
        threshold: 0,
      }
    );

    categoryElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headerHeight, groupedSections]);

  // 3. Footer visibility observer to fade out floating Menu button
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      (typeof process !== 'undefined' && Boolean(process.versions?.node))
    ) {
      return;
    }

    const footerEl = document.querySelector('footer');
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { rootMargin: '0px', threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  // Order buttons component to reuse at TOP and BOTTOM
  const OrderBanner = ({ idPrefix }: { idPrefix: string }) => (
    <div
      id={`${idPrefix}-order-banner`}
      className="bg-[#F7F3EB] rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div className="text-center sm:text-left">
        <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#2E4823]">
          Craving Our Firewood Flavors at Home?
        </h3>
        <p className="text-sm text-[#1C1C1C]/75 mt-0.5">
          Steaming hot Mandi platters, Hyderabadi biryanis &amp; tandoor curries delivered to your doorstep.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Swiggy Button */}
        <a
          href={SWIGGY_URL}
          target="_blank"
          rel="noopener noreferrer"
          id={`${idPrefix}-swiggy-btn`}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(252,128,25,0.25)] hover:shadow-[0_6px_18px_rgba(252,128,25,0.35)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white text-[#FC8019] flex items-center justify-center font-bold text-xs">
            S
          </span>
          <span>Order via Swiggy</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Zomato Button */}
        <a
          href={ZOMATO_URL}
          target="_blank"
          rel="noopener noreferrer"
          id={`${idPrefix}-zomato-btn`}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(226,55,68,0.25)] hover:shadow-[0_6px_18px_rgba(226,55,68,0.35)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white text-[#E23744] flex items-center justify-center font-bold text-xs">
            Z
          </span>
          <span>Order via Zomato</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section
      id="menu"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative scroll-mt-12"
      aria-label="Full Culinary Menu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#2E4823] mb-2 block">
            OUR CULINARY MENU
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Explore Our Grand Menu
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            From Arabian Mandi feasts and aged basmati Dum Biryanis to sizzling tandoor grills, rich gravies &amp; thick milkshakes.
          </p>
        </motion.div>

        {/* View Mode Toggle: Classic A La Carte Menu vs Visual Photo Menu */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/15 shadow-inner">
            <button
              type="button"
              onClick={() => setMenuViewMode('list')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                menuViewMode === 'list'
                  ? 'bg-[#2E4823] text-white shadow-md'
                  : 'text-gray-700 hover:text-[#2E4823]'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Classic Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuViewMode('cards')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                menuViewMode === 'cards'
                  ? 'bg-[#2E4823] text-white shadow-md'
                  : 'text-gray-700 hover:text-[#2E4823]'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Photo Menu</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TOP BAR ABOVE MENU: UNLOCK 5 KM DELIVERY & SELF-PICKUP        */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-6 sm:mb-8">
          {!isUnlocked ? (
            /* Locked Default State: Mobile-optimized Direct Ordering Card */
            <div>
              <div className="bg-gradient-to-r from-[#2E4823] via-[#1E3216] to-[#2E4823] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-white/10">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 bg-white/10 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dine-In Rates at Home (Save 20% to 35% vs Apps)</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-lg sm:text-2xl font-bold">
                    Order Direct from Our Kitchen &amp; Save
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl hidden sm:block">
                    Enjoy real restaurant prices, ₹0 platform charges, free delivery above ₹299, plus a free drink above ₹499 with code <strong>DIRECT50</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-amber-300 font-extrabold hover:text-white underline transition-colors"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Compare Live Prices vs Swiggy/Zomato (Save ₹120–₹250+) →</span>
                  </button>
                </div>

                {/* Action Buttons: 2-column on mobile, inline on desktop */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleUnlockDelivery}
                    disabled={geoStatus === 'checking'}
                    className="py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-[#D3452B] hover:bg-[#B3351E] disabled:bg-gray-500 text-white font-bold text-xs sm:text-sm shadow-md flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-transform transform active:scale-95 text-center min-h-[48px]"
                  >
                    <MapPin className="w-4 h-4 text-amber-200 shrink-0" />
                    <span className="flex flex-col sm:inline items-center justify-center">
                      {geoStatus === 'checking' ? (
                        <span>Detecting Location...</span>
                      ) : (
                        <>
                          <span className="sm:hidden leading-tight">Verify Location</span>
                          <span className="hidden sm:inline">Verify Location to Unlock Delivery</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-amber-200/90 font-normal sm:hidden leading-none">
                      To Unlock Delivery
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUnlockPickup}
                    className="py-2.5 sm:py-3.5 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm shadow-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors text-center min-h-[48px]"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      <span className="sm:hidden leading-tight">Self-Pickup</span>
                      <span className="hidden sm:inline">Order for Self-Pickup</span>
                    </span>
                    <span className="text-[10px] text-white/75 font-normal sm:hidden leading-none">
                      Ready in 20m
                    </span>
                  </button>
                </div>
              </div>

              {/* High-Converting 4 Perks Ticker */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#F7F3EB] p-2.5 rounded-xl border border-[#2E4823]/10 shadow-2xs">
                  <span className="font-extrabold text-[#2E4823] block text-xs sm:text-sm">💰 20–35% Cheaper</span>
                  <span className="text-[10.5px] text-gray-600">Dine-in menu rates</span>
                </div>
                <div className="bg-[#F7F3EB] p-2.5 rounded-xl border border-[#2E4823]/10 shadow-2xs">
                  <span className="font-extrabold text-[#2E4823] block text-xs sm:text-sm">🛵 FREE 5km Delivery</span>
                  <span className="text-[10.5px] text-gray-600">On orders above ₹299</span>
                </div>
                <div className="bg-[#F7F3EB] p-2.5 rounded-xl border border-[#2E4823]/10 shadow-2xs">
                  <span className="font-extrabold text-[#2E4823] block text-xs sm:text-sm">🥤 Free Drink Offer</span>
                  <span className="text-[10.5px] text-gray-600">Above ₹499 (DIRECT50)</span>
                </div>
                <div className="bg-[#F7F3EB] p-2.5 rounded-xl border border-[#2E4823]/10 shadow-2xs">
                  <span className="font-extrabold text-[#2E4823] block text-xs sm:text-sm">⚡ ₹0 Hidden Fees</span>
                  <span className="text-[10.5px] text-gray-600">Zero app commission</span>
                </div>
              </div>
            </div>
          ) : (
            /* Unlocked Ordering Active Bar (Clean, Compact Single-Row on Mobile) */
            <div className="bg-[#2E4823] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-white shadow-lg flex flex-row items-center justify-between gap-2.5 sm:gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 shrink-0">
                  {orderingMode === 'delivery' ? (
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-xs sm:text-base truncate">
                      {orderingMode === 'delivery'
                        ? '🛵 5 km Delivery Active'
                        : '🛍️ Self-Pickup Active'}
                    </span>
                    {userDistanceKm !== null && orderingMode === 'delivery' && (
                      <span className="text-[9px] sm:text-[11px] bg-white/20 px-1.5 sm:px-2 py-0.2 rounded-full font-mono shrink-0">
                        {userDistanceKm} km
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/75 truncate">
                    Tap &quot;+ Add&quot; on dishes to build your WhatsApp order.
                  </p>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOrderingMode('none');
                    setShowEligibleOnly(false);
                    setGeoStatus('idle');
                    setCartItems([]);
                    sessionStorage.removeItem('vaibhav_order_mode');
                    sessionStorage.removeItem('delivery_gps_cache');
                    localStorage.removeItem('direct_order_cart');
                  }}
                  className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1 text-white active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Order Mode</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* OUTSIDE ZONE (> 5km OR GPS DENIED): Premium Alert Card       */}
          {/* ------------------------------------------------------------- */}
          {(geoStatus === 'outside' || geoStatus === 'error') && (
            <div className="mt-3 sm:mt-4 bg-[#F7F3EB] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-[#D3452B]/40 shadow-md animate-fade-in">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-red-100 text-[#D3452B] flex items-center justify-center shrink-0 mt-0.5 text-base">
                    📍
                  </span>
                  <div>
                    {locationError ? (
                      <>
                        <h4 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#1C1C1C]">
                          📍 Location Access Failed
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          We couldn&apos;t detect your exact location. To proceed with Direct Delivery, please ensure your device GPS is turned on and location permissions are allowed for this browser.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#1C1C1C]">
                          📍 Outside 5km Delivery Zone. Order via:
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {userDistanceKm !== null
                            ? `You are ${userDistanceKm} km away. We deliver directly up to 5.0 km road distance.`
                            : 'Direct doorstep delivery is limited to 5 km. Order via Swiggy/Zomato or switch to Takeaway!'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 3 Big Touch-Friendly Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto pt-1 lg:pt-0">
                  <button
                    type="button"
                    onClick={handleUnlockPickup}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform transform active:scale-95 text-center"
                  >
                    <span>🛍️ Switch to Takeaway</span>
                  </button>

                  <a
                    href={SWIGGY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform transform active:scale-95 text-center"
                  >
                    <span>🛵 Order on Swiggy</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={ZOMATO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform transform active:scale-95 text-center"
                  >
                    <span>🛵 Order on Zomato</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ORDER BUTTONS AT TOP OF MENU: Desktop full banner & Mobile slim partner bar */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile slim partner bar (Takes minimal vertical space!) */}
          <div className="sm:hidden flex items-center justify-between bg-[#F7F3EB] px-3.5 py-2.5 rounded-2xl border border-[#2E4823]/10 text-xs shadow-2xs">
            <span className="text-gray-600 font-medium text-[11px]">Beyond 5 km? Order via:</span>
            <div className="flex items-center gap-2">
              <a
                href={SWIGGY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-lg bg-[#FC8019] text-white font-bold text-[10px] flex items-center gap-1"
              >
                <span>Swiggy</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href={ZOMATO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-lg bg-[#E23744] text-white font-bold text-[10px] flex items-center gap-1"
              >
                <span>Zomato</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-2 py-1 rounded-lg bg-[#2E4823] text-white font-bold text-[10px] flex items-center gap-1"
              >
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Desktop full banner (Hidden on mobile) */}
          <div className="hidden sm:block">
            <OrderBanner idPrefix="menu-top" />
            <div className="mt-2.5 text-center">
              <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
                Prefer to call? Order directly at{' '}
                <a href="tel:7947142432" className="text-[#D3452B] hover:underline font-bold">
                  7947142432
                </a>{' '}
                for takeaway!
              </p>
            </div>
          </div>
        </div>

        {/* CONDITIONALLY RENDER PHOTO MENU OR INTERACTIVE CLASSIC LIST */}
        {menuViewMode === 'cards' ? (
          <PhotoMenu />
        ) : (
          <>
            {/* STICKY CATEGORY PILLS WITH SCROLL-SPY (Mobile only, sticky directly under navbar) */}
            <MenuStickyPills
              categories={mobileCategories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              headerHeight={headerHeight}
            />

            {/* SEARCH / FILTER CONTROLS BAR */}
            <div className="bg-[#F7F3EB] rounded-2xl p-4 sm:p-5 border border-[#2E4823]/10 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Live Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes (e.g., Mandi, Biryani, Naan)..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 text-[#1C1C1C] placeholder:text-gray-400 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Dietary Filter Segmented Control */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setDietFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'all'
                        ? 'bg-[#2E4823] text-white shadow-xs'
                        : 'text-gray-600 hover:text-[#2E4823]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('veg')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'veg'
                        ? 'bg-green-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-green-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('non-veg')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'non-veg'
                        ? 'bg-[#D3452B] text-white shadow-xs'
                        : 'text-gray-600 hover:text-[#D3452B]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D3452B]" />
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="mt-4 pt-3 border-t border-[#2E4823]/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {MENU_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] ?? 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#2E4823] text-[#FDFBF7] shadow-sm'
                          : 'bg-white text-[#1C1C1C]/80 hover:bg-[#2E4823]/10 hover:text-[#2E4823]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filter Toggle when Direct Ordering is Unlocked */}
            {isUnlocked && (
              <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F7F3EB] p-3 rounded-2xl border border-[#2E4823]/15">
                <span className="text-xs font-bold text-[#2E4823] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D3452B]" />
                  <span>Direct Ordering View Options:</span>
                </span>

                <div className="inline-flex p-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShowEligibleOnly(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      showEligibleOnly
                        ? 'bg-[#2E4823] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-[#2E4823]'
                    }`}
                  >
                    🛵 Delivery Eligible Items Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEligibleOnly(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !showEligibleOnly
                        ? 'bg-[#2E4823] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-[#2E4823]'
                    }`}
                  >
                    📖 View Full Classic Menu
                  </button>
                </div>
              </div>
            )}

            {/* Dishes Count Indicator */}
            <div className="flex items-center justify-between mb-6 px-2 text-xs text-gray-500 font-medium">
              <span>
                Showing <strong className="text-[#2E4823]">{filteredDishes.length}</strong> delicious dishes
                {isUnlocked && showEligibleOnly && ' (Delivery Eligible)'}
              </span>
              {(searchQuery || dietFilter !== 'all' || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDietFilter('all');
                    setSelectedCategory('all');
                  }}
                  className="text-[#D3452B] hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* CATEGORIZED 2-COLUMN GRID (Classic Layout Preserved!) */}
            {filteredDishes.length === 0 ? (
              <div className="text-center py-16 bg-[#F7F3EB] rounded-2xl p-8 border border-dashed border-gray-300">
                <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-['Playfair_Display'] text-xl text-[#2E4823] font-bold">
                  No dishes found matching your search
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try clearing your search query or selecting a different category tab.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setDietFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#2E4823] text-white text-xs font-semibold rounded-xl hover:bg-[#223719] transition-colors"
                >
                  Reset Menu Filters
                </button>
              </div>
            ) : (
              <div className="space-y-10 pb-[180px]">
                {groupedSectionsWithMobile.map((section) => (
                  <section
                    key={section.id}
                    id={`category-${section.id}`}
                    className="scroll-mt-32 sm:scroll-mt-36 bg-white/70 backdrop-blur-xs rounded-3xl p-4 sm:p-7 border border-[#2E4823]/10 shadow-xs"
                  >
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between border-b-2 border-[#2E4823]/15 pb-3.5 mb-6">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D3452B]" />
                        <h2 className="font-['Playfair_Display'] text-lg sm:text-2xl font-bold text-[#2E4823]">
                          {section.label}
                        </h2>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2E4823]/10 text-[#2E4823]">
                          {section.items.length} {section.items.length === 1 ? 'dish' : 'dishes'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#D3452B] uppercase tracking-wider hidden sm:inline">
                        Dine-In Menu
                      </span>
                    </div>

                    {/* Responsive Dish Cards Grid for Desktop (hidden below md, pixel-identical on md+) */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {section.items.map((item) => {
                        const cartItem = cartItems.find((c) => c.id === item.id);
                        const isEligible = item.direct_order_eligible;
                        const isCompleted = item.is_completed;

                        return (
                          <article
                            key={item.id}
                            className={`p-3.5 sm:p-4 rounded-2xl transition-colors duration-200 hover:bg-[#F7F3EB]/70 flex flex-col justify-between border border-[#2E4823]/10 shadow-2xs ${
                              isCompleted && isUnlocked ? 'opacity-70 bg-red-50/20' : 'bg-white/80'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2.5 min-w-0">
                                {/* Green square for Veg, Red triangle for Non-veg */}
                                <span
                                  className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 mt-1 ${
                                    item.is_veg ? 'border-green-600' : 'border-[#D3452B]'
                                  }`}
                                  title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.is_veg ? 'bg-green-600' : 'bg-[#D3452B]'
                                    }`}
                                  />
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-[#1C1C1C] hover:text-[#2E4823] transition-colors line-clamp-2 break-words leading-snug">
                                      {item.name}
                                    </h3>

                                    {item.isChefSpecial && (
                                      <span className="text-[10px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-2 py-0.5 rounded-md shrink-0">
                                        Special
                                      </span>
                                    )}

                                    {/* Stock Status Badge if completed */}
                                    {isUnlocked && isCompleted && (
                                      <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md shrink-0">
                                        Completed for Today
                                      </span>
                                    )}

                                    {/* Dine-in only badge for non-eligible items when ordering mode is active */}
                                    {isUnlocked && !isEligible && (
                                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-md shrink-0">
                                        Dine-In Only
                                      </span>
                                    )}
                                  </div>

                                  {/* Italicized short description */}
                                  {item.description && (
                                    <p className="mt-1 text-xs sm:text-sm text-gray-500 italic font-normal leading-relaxed line-clamp-2 break-words">
                                      {item.description}
                                    </p>
                                  )}

                                  {item.portionNote && (
                                    <div className="mt-1.5 flex items-center gap-2">
                                      <span className="text-[11px] text-[#2E4823] font-medium bg-[#2E4823]/5 px-2 py-0.5 rounded">
                                        {item.portionNote}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Row: Dual Pricing & Add Button Wrapper */}
                            <div className="mt-3 pt-3 border-t border-[#2E4823]/10 flex items-center justify-between gap-2.5">
                              {/* Dual-Pricing: Stack vertically on mobile but side-by-side on desktop */}
                              {(() => {
                                const aggPrice = item.aggregator_price || Math.round((item.price * 1.25) / 10) * 10;
                                const showDual = isEligible && aggPrice > item.price;
                                const itemSavings = Math.max(0, aggPrice - item.price);

                                return (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {showDual && (
                                        <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-mono whitespace-nowrap">
                                          App Price: ₹{aggPrice}
                                        </span>
                                      )}
                                      <span className="font-bold text-sm sm:text-base text-[#2E4823] whitespace-nowrap">
                                        Direct Price: ₹{item.price}
                                      </span>
                                    </div>
                                    {showDual && itemSavings > 0 && (
                                      <span className="inline-block text-[9px] sm:text-[10px] font-extrabold bg-[#25D366] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap self-start sm:self-auto">
                                        Save ₹{itemSavings}!
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* + ADD BUTTON LOGIC (Desktop: Only shown when ordering is unlocked & dish is eligible) */}
                              {isUnlocked && isEligible && (
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <button
                                      type="button"
                                      disabled
                                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-200 text-gray-500 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:active:scale-100 cursor-not-allowed whitespace-nowrap"
                                    >
                                      Sold Out
                                    </button>
                                  ) : cartItem ? (
                                    /* Quantity Stepper if already in cart (Locked when checkout is active) */
                                    <div
                                      className={`flex items-center bg-[#2E4823] text-white rounded-lg shadow-2xs flex-shrink-0 transition-opacity ${
                                        isCheckoutOpen ? 'opacity-40 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        disabled={isCheckoutOpen}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateCartQuantity(item.id, -1);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-l-lg transition-colors"
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-6 text-center text-xs font-mono font-bold">
                                        {cartItem.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isCheckoutOpen}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateCartQuantity(item.id, 1);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-r-lg transition-colors"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    /* Initial "+ Add" Button */
                                    <button
                                      type="button"
                                      disabled={item.is_completed || isCheckoutOpen}
                                      onClick={() => handleAddToCart(item)}
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#2E4823] hover:bg-[#223719] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:active:scale-100 disabled:cursor-not-allowed text-white shadow-2xs flex items-center gap-1 transition-transform transform active:scale-95 flex-shrink-0 whitespace-nowrap"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Mobile Dish Cards List (Dense horizontal flex layout below md) */}
                    <div className="md:hidden divide-y divide-[#2E4823]/10">
                      {section.mobileItems.map((dish, itemIdx) => (
                        <MenuMobileItemCard
                          key={dish.baseId}
                          dish={dish}
                          imageIndex={itemIdx}
                          cartItems={cartItems}
                          isUnlocked={isUnlocked}
                          onAddToCart={(d) => handleAddToCart(d.primaryDish)}
                          onUpdateCartQuantity={handleUpdateCartQuantity}
                          onOpenSizePicker={(d) => setSizePickerDish(d)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* FLOATING "MENU" BUTTON (Mobile only) */}
            <MenuFloatingButton
              onClick={() => setIsSheetOpen(true)}
              isSheetOpen={isSheetOpen}
              isFooterVisible={isFooterVisible}
              hasCartItems={isUnlocked && cartItems.length > 0}
              buttonRef={menuBtnRef}
            />

            {/* CATEGORY BOTTOM SHEET (Mobile only) */}
            <MenuBottomSheet
              isOpen={isSheetOpen}
              onClose={() => setIsSheetOpen(false)}
              categories={mobileCategories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              triggerButtonRef={menuBtnRef}
            />

            {/* SIZE VARIANT PICKER MODAL (Mobile only) */}
            <MenuSizePickerModal
              isOpen={Boolean(sizePickerDish) && isUnlocked}
              dish={sizePickerDish}
              cartItems={cartItems}
              onClose={() => setSizePickerDish(null)}
              onSelectVariant={handleSelectVariant}
              onUpdateCartQuantity={handleUpdateCartQuantity}
            />
          </>
        )}

        {/* ORDER BUTTONS AT BOTTOM OF MENU */}
        <div className="mt-12">
          <OrderBanner idPrefix="menu-bottom" />
          <div className="mt-2.5 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
              Prefer to call? Order directly at{' '}
              <a href="tel:7947142432" className="text-[#D3452B] hover:underline font-bold">
                7947142432
              </a>{' '}
              for takeaway!
            </p>
          </div>
        </div>

        {/* MENU PRICING & INGREDIENT DISCLAIMER */}
        <div className="mt-8 text-center max-w-3xl mx-auto px-4 pb-28 sm:pb-8">
          <p className="text-xs text-gray-500 leading-relaxed italic border-t border-gray-200/80 pt-4">
            Prices, menu items, and availability are subject to change without notice. Delivery prices on Swiggy and Zomato may vary from our dine-in menu.
          </p>
        </div>
      </div>

      {/* Floating Bottom Cart Bar when items are selected (hidden while checkout modal is open or ordering is locked/exited) */}
      {!isCheckoutOpen && isUnlocked && (
        <FloatingCartBar
          items={cartItems}
          offer={offer}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* Direct Order Checkout Modal */}
      <DirectOrderModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        offer={offer}
        orderType={orderingMode === 'pickup' ? 'SELF_PICKUP' : 'DELIVERY_5KM'}
        userDistanceKm={userDistanceKm}
        userLocation={userLocation}
        onSwitchOrderType={(type: OrderType) => {
          if (type === 'SELF_PICKUP') {
            setOrderingMode('pickup');
            sessionStorage.setItem('vaibhav_order_mode', 'pickup');
          } else {
            try {
              const cached = sessionStorage.getItem('delivery_gps_cache');
              if (cached) {
                const parsed = JSON.parse(cached);
                const dist = typeof parsed.distanceKm === 'number' && parsed.distanceKm > 0 ? parsed.distanceKm : null;
                const isEligible = dist !== null && dist > 0 && dist <= 5.0 && Boolean(parsed.eligible);
                setUserDistanceKm(dist);
                if (isEligible) {
                  setGeoStatus('eligible');
                  setOrderingMode('delivery');
                  sessionStorage.setItem('vaibhav_order_mode', 'delivery');
                } else {
                  setGeoStatus('outside');
                  setOrderingMode('none');
                  sessionStorage.setItem('vaibhav_order_mode', 'outside');
                }
                return;
              }
            } catch {}
            setOrderingMode('delivery');
          }
        }}
      />

      {/* Price Comparison vs Aggregators Modal */}
      <PriceComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onOrderDirect={() => {
          handleUnlockDelivery();
        }}
      />
    </section>
  );
};
