import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DbMenuItem, StoreOffer, DbOrder } from '../types';
import {
  fetchMenuItems,
  updateMenuItem,
  morningResetAllMenuItems,
  fetchStoreOffer,
  updateStoreOffer,
  fetchOrders,
  fetchOrdersWithStatus,
  updateOrderStatus,
  adminUpdatePaymentStatus,
  verifyAdminPin,
  changeAdminPin,
  WHATSAPP_NUMBER
} from '../utils/supabaseClient';
import { Head } from 'vite-react-ssg';
import {
  Lock,
  Unlock,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  ShoppingBag,
  Phone,
  Calendar,
  Save,
  LogOut,
  RefreshCw,
  ExternalLink,
  Shield,
  KeyRound,
  Sliders,
  DollarSign,
  Gift,
  Check,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  // Authentication State
  const [pinInput, setPinInput] = useState('');
  const [currentPin, setCurrentPin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vaibhav_admin_pin') || '';
    }
    return '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vaibhav_admin_auth') === 'true';
    }
    return false;
  });
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check brute-force lockout on mount & tick countdown
  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;
    const updateLockout = () => {
      const lockoutUntil = Number(localStorage.getItem('vaibhav_admin_lockout_until')) || 0;
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
        localStorage.removeItem('vaibhav_admin_lockout_until');
      }
    };

    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // 30-minute inactivity auto-logout
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;

    let lastActivity = Date.now();
    const resetActivity = () => {
      lastActivity = Date.now();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivity > 30 * 60 * 1000) {
        handleLogout();
        alert('You have been logged out after 30 minutes of inactivity for security.');
      }
    }, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated]);

  // Tab 2 PIN Change states
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  const [pinChangeMessage, setPinChangeMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Active Tab: 1 = Menu Stock, 2 = Flash Offers, 3 = Orders
  const [activeTab, setActiveTab] = useState<'menu' | 'offers' | 'orders'>('menu');

  // Tab 1: Menu Items
  const [menuItems, setMenuItems] = useState<DbMenuItem[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState<'all' | 'delivery' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isResettingMorning, setIsResettingMorning] = useState(false);
  const [menuUpdateToast, setMenuUpdateToast] = useState('');

  // Dynamically derive unique categories from loaded menu items
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category && item.category.trim()) {
        cats.add(item.category.trim());
      }
    });
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  // Tab 2: Store Offers
  const [offer, setOffer] = useState<StoreOffer | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerSuccessToast, setOfferSuccessToast] = useState('');

  // Tab 3: Orders
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Initiated' | 'Confirmed' | 'Completed' | 'Rejected'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Audio Alerts and New Order Detection
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vaibhav_admin_sound') === 'true';
    }
    return false;
  });
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const [newOrderHighlight, setNewOrderHighlight] = useState(false);
  const highlightTimerRef = useRef<any>(null);
  const [newOrderAlertCount, setNewOrderAlertCount] = useState(0);
  const knownOrderIdsRef = useRef<Set<string | number>>(new Set());
  const isFirstLoadRef = useRef(true);

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext blocked or unsupported
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vaibhav_admin_sound', String(next));
    }
    if (next) {
      playChime();
    }
  };

  // Clear new order alert count and restore title on interaction
  useEffect(() => {
    if (newOrderAlertCount <= 0 || typeof window === 'undefined') return;
    const handleUserInteraction = () => {
      setNewOrderAlertCount(0);
    };
    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, handleUserInteraction, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserInteraction));
    };
  }, [newOrderAlertCount]);

  // Update browser tab title on new order
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (newOrderAlertCount > 0) {
      document.title = `(${newOrderAlertCount}) New order - Vaibhav Grand`;
    } else if (isAuthenticated) {
      document.title = 'Admin Dashboard | Vaibhav Grand';
    }
  }, [newOrderAlertCount, isAuthenticated]);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [fetchedItems, fetchedOffer] = await Promise.all([
        fetchMenuItems(),
        fetchStoreOffer()
      ]);

      if (!isMounted) return;
      setMenuItems(fetchedItems);
      setOffer(fetchedOffer);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchOrdersData = async (silent = false) => {
    if (!currentPin) return;
    if (!silent) setOrdersLoading(true);

    try {
      const res = await fetchOrdersWithStatus(currentPin, 200);

      if (res.authError) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('vaibhav_admin_auth');
        sessionStorage.removeItem('vaibhav_admin_pin');
        setCurrentPin('');
        setPinInput('');
        knownOrderIdsRef.current.clear();
        isFirstLoadRef.current = true;
        setAuthError('Session expired, enter the PIN again.');
        return;
      }

      if (res.isNetworkError) {
        // Keep old list and retry on next tick
        return;
      }

      const fetched = res.orders;

      if (!isFirstLoadRef.current && knownOrderIdsRef.current.size > 0) {
        const newOrders = fetched.filter(
          (o) => !knownOrderIdsRef.current.has(o.id || o.order_code)
        );
        if (newOrders.length > 0) {
          setNewOrderHighlight(true);
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
          highlightTimerRef.current = setTimeout(() => {
            setNewOrderHighlight(false);
          }, 4000);

          setNewOrderAlertCount((prev) => prev + newOrders.length);

          if (soundEnabledRef.current) {
            playChime();
          }
        }
      }

      fetched.forEach((o) => knownOrderIdsRef.current.add(o.id || o.order_code));
      isFirstLoadRef.current = false;
      setOrders(fetched);
    } catch {
      // Retain current orders
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  };

  // CRM Dashboard: Fetch orders using RPC and auto-poll every 27 seconds while visible
  useEffect(() => {
    if (!isAuthenticated || !currentPin || typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;

    fetchOrdersData(false);

    const handlePoll = () => {
      if (document.visibilityState === 'visible') {
        fetchOrdersData(true);
      }
    };

    const pollTimer = setInterval(handlePoll, 27000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrdersData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [isAuthenticated, currentPin]);

  const loadOrders = async () => {
    await fetchOrdersData(false);
  };

  // Authenticate PIN securely on server with brute-force protection
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (lockoutRemaining > 0) {
      const mins = Math.floor(lockoutRemaining / 60);
      const secs = lockoutRemaining % 60;
      setAuthError(`Login locked due to too many failed attempts. Try again in ${mins}m ${secs}s.`);
      return;
    }

    const pin = pinInput.trim();
    if (!pin) {
      setAuthError('Please enter your Admin PIN.');
      return;
    }

    setIsVerifyingPin(true);
    try {
      const res = await verifyAdminPin(pin);
      if (res.success) {
        localStorage.removeItem('vaibhav_admin_failed_attempts');
        localStorage.removeItem('vaibhav_admin_lockout_until');
        setIsAuthenticated(true);
        setCurrentPin(pin);
        sessionStorage.setItem('vaibhav_admin_auth', 'true');
        sessionStorage.setItem('vaibhav_admin_pin', pin);
      } else {
        if (res.locked) {
          const lockoutUntil = res.locked_until
            ? new Date(res.locked_until).getTime()
            : Date.now() + 15 * 60 * 1000;
          localStorage.setItem('vaibhav_admin_lockout_until', String(lockoutUntil));
          setLockoutRemaining(Math.max(1, Math.ceil((lockoutUntil - Date.now()) / 1000)));
          setAuthError(res.error || 'Account locked due to too many failed attempts. Try again in 15 minutes.');
        } else {
          const attempts =
            res.failed_attempts !== undefined
              ? res.failed_attempts
              : (Number(localStorage.getItem('vaibhav_admin_failed_attempts')) || 0) + 1;
          localStorage.setItem('vaibhav_admin_failed_attempts', String(attempts));
          setAuthError(res.error || `Incorrect PIN. (Attempt ${attempts} of 5)`);
        }
      }
    } catch {
      setAuthError('Error verifying PIN with server. Please try again.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('vaibhav_admin_auth');
    sessionStorage.removeItem('vaibhav_admin_pin');
    setCurrentPin('');
    setPinInput('');
  };

  // Inline Price & Aggregator Price Editing (Tab 1)
  const [editingDishId, setEditingDishId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editAggregatorPrice, setEditAggregatorPrice] = useState<string>('');
  const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);

  const handleStartEditPrice = (dish: DbMenuItem) => {
    setEditingDishId(dish.id);
    setEditPrice(String(dish.price));
    setEditAggregatorPrice(
      dish.aggregator_price ? String(dish.aggregator_price) : ''
    );
  };

  const handleCancelEditPrice = () => {
    setEditingDishId(null);
    setEditPrice('');
    setEditAggregatorPrice('');
  };

  const handleSavePrice = async (dish: DbMenuItem) => {
    const numPrice = Number(editPrice);
    const numAggPrice = Number(editAggregatorPrice);

    if (isNaN(numPrice) || numPrice <= 0 || numPrice > 10000) {
      alert('Direct Price must be a valid number between ₹1 and ₹10,000.');
      return;
    }

    if (isNaN(numAggPrice) || numAggPrice < numPrice || numAggPrice > 15000) {
      alert(`Aggregator Price must be between ₹${numPrice} (Direct Price) and ₹15,000.`);
      return;
    }

    setIsSavingPrice(true);
    const success = await updateMenuItem(
      dish.id,
      { price: numPrice, aggregator_price: numAggPrice },
      currentPin,
      dish
    );

    if (success) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === dish.id
            ? { ...item, price: numPrice, aggregator_price: numAggPrice }
            : item
        )
      );
      showToast(`Updated "${dish.name}" price to ₹${numPrice} (Swiggy ₹${numAggPrice})`);
      setEditingDishId(null);
    } else {
      alert('Failed to update price. Please check your admin PIN or connection.');
    }
    setIsSavingPrice(false);
  };

  // Toggle Direct Order Eligible
  const handleToggleEligibility = async (dish: DbMenuItem) => {
    const newValue = !dish.direct_order_eligible;
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === dish.id ? { ...item, direct_order_eligible: newValue } : item
      )
    );

    const success = await updateMenuItem(
      dish.id,
      { direct_order_eligible: newValue },
      currentPin,
      dish
    );
    if (success) {
      showToast(`Updated "${dish.name}" delivery eligibility to ${newValue ? 'ON' : 'OFF'}`);
    }
  };

  // Toggle Completed Stock Status
  const handleToggleCompleted = async (dish: DbMenuItem) => {
    const newValue = !dish.is_completed;
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === dish.id ? { ...item, is_completed: newValue } : item
      )
    );

    const success = await updateMenuItem(
      dish.id,
      { is_completed: newValue },
      currentPin,
      dish
    );
    if (success) {
      showToast(`Marked "${dish.name}" as ${newValue ? 'Completed (Out of stock)' : 'Available'}`);
    }
  };

  // Morning Reset
  const handleMorningReset = async () => {
    if (!window.confirm('Reset all menu items to "Available" for today?')) return;
    setIsResettingMorning(true);
    const success = await morningResetAllMenuItems(currentPin);
    if (success) {
      const refreshed = await fetchMenuItems();
      setMenuItems(refreshed);
      showToast('Morning Reset Complete: All dishes marked Available!');
    }
    setIsResettingMorning(false);
  };

  const showToast = (msg: string) => {
    setMenuUpdateToast(msg);
    setTimeout(() => setMenuUpdateToast(''), 3500);
  };

  // Save Store Offer changes
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    setOfferSaving(true);
    setOfferSuccessToast('');

    const success = await updateStoreOffer(offer, currentPin);
    if (success) {
      setOfferSuccessToast('Flash offer and settings saved successfully!');
      setTimeout(() => setOfferSuccessToast(''), 3500);
    }
    setOfferSaving(false);
  };

  // Change Admin Passcode securely in admin_secrets
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMessage(null);
    const newPin = newPinInput.trim();
    if (!newPin || newPin.length < 4) {
      setPinChangeMessage({ text: 'PIN must be at least 4 digits.', isError: true });
      return;
    }

    setPinChangeLoading(true);
    const res = await changeAdminPin(currentPin, newPin);
    if (res.success) {
      setCurrentPin(newPin);
      sessionStorage.setItem('vaibhav_admin_pin', newPin);
      setNewPinInput('');
      setPinChangeMessage({ text: 'PIN successfully updated in database!', isError: false });
      setTimeout(() => setPinChangeMessage(null), 4000);
    } else {
      setPinChangeMessage({ text: res.error || 'Failed to update PIN', isError: true });
    }
    setPinChangeLoading(false);
  };

  // Quick Offer Expiration Helpers
  const extendOfferHours = (hours: number) => {
    if (!offer) return;
    const newExpires = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    setOffer({ ...offer, expires_at: newExpires, is_active: true });
  };

  // 1-Tap WhatsApp Accept Order
  const handleAcceptOrder = async (order: DbOrder) => {
    if (!order.id) return;
    const success = await updateOrderStatus(order.id, 'Confirmed', currentPin);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Confirmed' } : o))
      );
      showToast(`Order #${order.order_code} Accepted. Preparing food.`);

      const rawPhone = order.customer_phone.replace(/\D/g, '');
      const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const acceptMsg = `ORDER ACCEPTED: Hi ${order.customer_name}, we received order #${order.order_code}. Our kitchen is preparing your food. ETA: 30-40 Mins. Amount: Rs ${order.final_total} (${order.payment_method}).`;
      const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(acceptMsg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 1-Tap WhatsApp Reject Order
  const handleRejectOrder = async (order: DbOrder) => {
    if (!order.id) return;
    const success = await updateOrderStatus(order.id, 'Rejected', currentPin);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Rejected' } : o))
      );
      showToast(`Order #${order.order_code} marked Rejected.`);

      const rawPhone = order.customer_phone.replace(/\D/g, '');
      const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const rejectMsg = `ORDER UPDATE: Hi ${order.customer_name}, we apologize but we cannot accept order #${order.order_code} at this moment (Kitchen busy/Out of stock). Please check our availability on Swiggy/Zomato.`;
      const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(rejectMsg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Complete Order & WhatsApp Customer
  const handleCompleteOrder = async (order: DbOrder) => {
    if (!order.id) return;
    const success = await updateOrderStatus(order.id, 'Completed', currentPin);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'Completed' } : o))
      );
      showToast(`Order #${order.order_code} marked Completed.`);

      const rawPhone = order.customer_phone.replace(/\D/g, '');
      const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const msg = `Hello ${order.customer_name}! Your order #${order.order_code} from Vaibhav Grand is ready and dispatched. Total Bill: Rs ${order.final_total}. Thank you for choosing Vaibhav Grand!`;
      const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Payment Status Management (Confirmed / Rejected) with optimistic update
  const handlePaymentStatusUpdate = async (order: DbOrder, newPaymentStatus: 'confirmed' | 'rejected') => {
    if (!order.id) return;
    if (newPaymentStatus === 'rejected') {
      const confirmed = window.confirm(
        `Are you sure you want to mark payment for Order #${order.order_code} as rejected?`
      );
      if (!confirmed) return;
    }

    const previousOrders = [...orders];
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, payment_status: newPaymentStatus } : o))
    );

    const result = await adminUpdatePaymentStatus(currentPin, order.id, newPaymentStatus);
    if (!result.success) {
      setOrders(previousOrders);
      showToast(result.error || 'Failed to update payment status');
    } else {
      showToast(
        newPaymentStatus === 'confirmed'
          ? `Payment confirmed for order #${order.order_code}`
          : `Payment marked rejected for order #${order.order_code}`
      );
    }
  };

  const formatUtrTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMins < 1) return 'Submitted just now';
    if (diffMins < 60) return `Submitted ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Submitted ${diffHours}h ago`;
    return `Submitted ${Math.floor(diffHours / 24)}d ago`;
  };

  // Filtered Menu Items for Tab 1
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((dish) => {
      // Category filter
      if (selectedCategory !== 'All' && dish.category !== selectedCategory) {
        return false;
      }

      // Filter tab
      if (menuFilter === 'delivery' && !dish.direct_order_eligible) return false;
      if (menuFilter === 'completed' && !dish.is_completed) return false;

      // Search query
      if (!menuSearch) return true;
      const q = menuSearch.toLowerCase().trim();
      return (
        dish.name.toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q)
      );
    });
  }, [menuItems, selectedCategory, menuFilter, menuSearch]);

  // Filtered Orders for Tab 3
  const filteredOrders = useMemo(() => {
    const list = orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase().trim();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        (o.utr && o.utr.toLowerCase().includes(q))
      );
    });

    // Priority sort: UPI orders with utr_submitted first, then COD orders that are pending, then the rest, newest first within each group
    return [...list].sort((a, b) => {
      const getGroup = (order: DbOrder) => {
        const isCod = order.payment_method?.toUpperCase() === 'COD';
        const ps = (order.payment_status || 'pending').toLowerCase();
        if (!isCod && ps === 'utr_submitted') return 1;
        if (isCod && ps === 'pending') return 2;
        return 3;
      };

      const groupA = getGroup(a);
      const groupB = getGroup(b);

      if (groupA !== groupB) {
        return groupA - groupB;
      }

      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Stats
  const totalCount = menuItems.length;
  const eligibleCount = menuItems.filter((i) => i.direct_order_eligible).length;
  const completedCount = menuItems.filter((i) => i.is_completed).length;

  // -------------------------------------------------------------
  // Screen: PIN Authentication if not logged in
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <Head>
          <title>Admin Dashboard | Vaibhav Grand</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#2E4823]/15 p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2E4823] text-amber-300 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#D3452B]">
              Restricted Area
            </span>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2E4823] mt-1">
              Owner Admin Portal
            </h1>
            <p className="text-xs text-gray-500 mt-1.5">
              Enter the restaurant PIN to manage WhatsApp stock, flash discounts &amp; live incoming orders.
            </p>
          </div>

          {lockoutRemaining > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-xs space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-red-600" />
                <span>Brute-Force Lockout Active</span>
              </div>
              <p className="text-[11px] text-red-600">
                Too many failed attempts. Try again in{' '}
                <strong className="font-mono text-sm">
                  {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
                </strong>
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={8}
                disabled={lockoutRemaining > 0}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder={lockoutRemaining > 0 ? "Login locked" : "Enter Admin PIN"}
                className="w-full pl-11 pr-4 py-3 text-center text-lg font-mono tracking-widest bg-[#F7F3EB] rounded-2xl border border-gray-300 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isVerifyingPin || lockoutRemaining > 0}
              className="w-full py-3 px-6 rounded-2xl bg-[#2E4823] hover:bg-[#223719] disabled:bg-gray-400 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isVerifyingPin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <span>Unlock Dashboard</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-center text-xs text-gray-500">
            <button
              type="button"
              onClick={onBackToSite}
              className="text-[#D3452B] hover:underline font-semibold"
            >
              Back to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Screen: Authenticated 3-Tab Owner Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1C1C] w-full max-w-full overflow-x-hidden">
      <Head>
        <title>
          {newOrderAlertCount > 0
            ? `(${newOrderAlertCount}) New order - Vaibhav Grand`
            : 'Admin Dashboard | Vaibhav Grand'}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#2E4823] text-white shadow-md border-b border-white/10 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/images/vaibhav-grand-logo.png"
                alt="Vaibhav Grand Logo"
                width={1766}
                height={866}
                className="h-9 w-auto object-contain shrink-0"
              />
              <div>
                <h1 className="font-['Playfair_Display'] text-lg font-bold text-white tracking-tight">
                  Vaibhav Grand • Owner Admin
                </h1>
                <p className="text-[11px] text-white/70">
                  Supabase Live Sync (menu_items, store_offers, orders)
                </p>
              </div>
            </div>

            {/* Back to site / Sound / Logout */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={handleToggleSound}
                className="text-xs bg-white/10 text-white px-2.5 py-1.5 rounded-lg"
              >
                {soundEnabled ? 'Sound: On' : 'Sound: Off'}
              </button>
              <button
                type="button"
                onClick={onBackToSite}
                className="text-xs bg-white/10 px-2.5 py-1.5 rounded-lg text-white"
              >
                Website
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs bg-red-500/20 text-red-200 px-2.5 py-1.5 rounded-lg"
              >
                Lock
              </button>
            </div>
          </div>

          {/* 3 Tabs Navigation */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'menu'
                  ? 'bg-white text-[#2E4823] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Stock &amp; Delivery</span>
              <span className="text-[10px] bg-[#2E4823]/20 text-[#2E4823] px-1.5 py-0.2 rounded-full">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('offers')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-white text-[#2E4823] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Flash Offers</span>
              {offer?.is_active && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-[#2E4823] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Orders</span>
              <span className="text-[10px] bg-[#D3452B] text-white px-1.5 py-0.2 rounded-full font-mono">
                {orders.length}
              </span>
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSound}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              {soundEnabled ? 'Sound alerts: On' : 'Enable sound alerts'}
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              Back to Website
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/80 hover:text-red-200 transition-colors"
              title="Lock Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Status Toast */}
      {menuUpdateToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#2E4823] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{menuUpdateToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 w-full max-w-full overflow-x-hidden">
        {/* ============================================================= */}
        {/* TAB 1: MENU STOCK & DELIVERY ELIGIBILITY                     */}
        {/* ============================================================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Header + Stats Banner */}
            <div className="bg-[#F7F3EB] rounded-3xl p-4 sm:p-6 border border-[#2E4823]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-full">
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823]">
                  Menu Stock &amp; 5 km Delivery Eligibility
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Control which dishes appear with &quot;+ Add&quot; for direct ordering, and mark items Completed when sold out.
                </p>
              </div>

              {/* Morning Reset Button */}
              <button
                type="button"
                onClick={handleMorningReset}
                disabled={isResettingMorning}
                className="w-full md:w-auto py-2.5 px-5 rounded-2xl bg-[#2E4823] hover:bg-[#223719] disabled:bg-gray-400 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95"
              >
                <RotateCcw className={`w-4 h-4 ${isResettingMorning ? 'animate-spin' : ''}`} />
                <span>Morning Reset: Mark All Available</span>
              </button>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-center">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold block">
                  Total Dishes
                </span>
                <span className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823]">
                  {totalCount}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-2xs text-center">
                <span className="text-[11px] uppercase tracking-wider text-green-700 font-bold block">
                  Delivery Eligible
                </span>
                <span className="font-['Playfair_Display'] text-2xl font-bold text-green-700">
                  {eligibleCount}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-2xs text-center">
                <span className="text-[11px] uppercase tracking-wider text-red-700 font-bold block">
                  Completed / Out
                </span>
                <span className="font-['Playfair_Display'] text-2xl font-bold text-red-600">
                  {completedCount}
                </span>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full">
              {/* Search input */}
              <div className="relative w-full sm:w-80 min-w-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dish or category..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-200 focus:outline-none focus:border-[#2E4823]"
                />
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1.5 bg-[#F7F3EB] p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMenuFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    menuFilter === 'all'
                      ? 'bg-[#2E4823] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-[#2E4823]'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setMenuFilter('delivery')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    menuFilter === 'delivery'
                      ? 'bg-green-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-green-700'
                  }`}
                >
                  Delivery Eligible ({eligibleCount})
                </button>
                <button
                  type="button"
                  onClick={() => setMenuFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    menuFilter === 'completed'
                      ? 'bg-red-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-red-700'
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Scrollable Category Bar */}
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 max-w-full no-scrollbar">
              {uniqueCategories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E4823] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-[#F7F3EB] border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Dishes Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-hidden w-full max-w-full">
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-full">
                  <thead>
                    <tr className="bg-[#F7F3EB] border-b border-[#2E4823]/10 text-gray-700 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Dish Details</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Price</th>
                      <th className="py-3.5 px-4 text-center">
                        5 km Delivery Eligible
                      </th>
                      <th className="py-3.5 px-4 text-center">
                        Stock Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMenuItems.map((dish) => (
                      <tr
                        key={dish.id}
                        className={`hover:bg-[#FDFBF7] transition-colors ${
                          dish.is_completed ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* Dish Details */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                                dish.is_veg ? 'border-green-600' : 'border-[#D3452B]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  dish.is_veg ? 'bg-green-600' : 'bg-[#D3452B]'
                                }`}
                              />
                            </span>
                            <div>
                              <span className="font-bold text-[#1C1C1C] block">
                                {dish.name}
                              </span>
                              {dish.portionNote && (
                                <span className="text-[11px] text-gray-500">
                                  {dish.portionNote}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="text-[11px] bg-[#2E4823]/10 text-[#2E4823] px-2 py-0.5 rounded-full font-medium uppercase">
                            {dish.category}
                          </span>
                        </td>

                        {/* Price & Live Price Editing */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {editingDishId === dish.id ? (
                            <div className="flex flex-col gap-1.5 p-2 bg-amber-50/90 rounded-xl border border-amber-300 shadow-sm min-w-[150px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-500 w-11">Direct:</span>
                                <div className="relative flex-1">
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D3452B]">₹</span>
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full pl-4 pr-1 py-1 text-xs font-bold bg-white rounded border border-gray-300 focus:outline-none focus:border-[#2E4823]"
                                    min={1}
                                    max={10000}
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-500 w-11">Swiggy:</span>
                                <div className="relative flex-1">
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">₹</span>
                                  <input
                                    type="number"
                                    value={editAggregatorPrice}
                                    onChange={(e) => setEditAggregatorPrice(e.target.value)}
                                    className="w-full pl-4 pr-1 py-1 text-xs text-gray-700 bg-white rounded border border-gray-300 focus:outline-none focus:border-[#2E4823]"
                                    min={Number(editPrice) || 1}
                                    max={15000}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(dish)}
                                  disabled={isSavingPrice}
                                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-0.5 shadow-2xs disabled:opacity-50"
                                  title="Save Price"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isSavingPrice ? '...' : 'Save'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditPrice}
                                  disabled={isSavingPrice}
                                  className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-medium"
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditPrice(dish)}
                              className="text-left group p-1 -m-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer block"
                              title="Click to edit Direct & Swiggy prices"
                            >
                              <div className="flex items-center gap-1 font-bold text-[#D3452B]">
                                <span>₹{dish.price}</span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#2E4823] transition-colors font-medium">Edit</span>
                              </div>
                              {dish.aggregator_price ? (
                                <div className="text-[10px] text-gray-400 line-through">
                                  ₹{dish.aggregator_price} (Swiggy)
                                </div>
                              ) : (
                                <div className="text-[10px] text-gray-400">
                                  No app price set
                                </div>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Switch 1: Delivery Eligible */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleEligibility(dish)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                              dish.direct_order_eligible
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {dish.direct_order_eligible ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Eligible: ON</span>
                              </>
                            ) : (
                              <span>Dine-In: OFF</span>
                            )}
                          </button>
                        </td>

                        {/* Switch 2: Stock Status (Available / Completed) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleCompleted(dish)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                              dish.is_completed
                                ? 'bg-[#D3452B] text-white hover:bg-[#B3351E]'
                                : 'bg-[#2E4823] text-white hover:bg-[#223719]'
                            }`}
                          >
                            {dish.is_completed ? (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Completed (Out)</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                                <span>Available</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: FLASH OFFERS & TIMER                                  */}
        {/* ============================================================= */}
        {activeTab === 'offers' && offer && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[#F7F3EB] rounded-3xl p-6 border border-[#2E4823]/15 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#D3452B] text-white flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-200" />
                </span>
                <div>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823]">
                    Time-Limited Flash Offers &amp; Countdown
                  </h2>
                  <p className="text-xs text-gray-600">
                    Row id = 1 in store_offers table. Powers the sticky countdown banner and automatic checkout discounts.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveOffer} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
              {offerSuccessToast && (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span>{offerSuccessToast}</span>
                </div>
              )}

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/10">
                <div>
                  <span className="font-bold text-sm text-[#2E4823] block">
                    Flash Banner Active Status
                  </span>
                  <span className="text-xs text-gray-500">
                    When active and before expiry, the banner displays with a live countdown.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOffer({ ...offer, is_active: !offer.is_active })}
                  className={`w-14 h-8 rounded-full transition-colors p-1 flex items-center ${
                    offer.is_active ? 'bg-[#2E4823] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Banner Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Top Banner Headline
                </label>
                <input
                  type="text"
                  required
                  value={offer.banner_text}
                  onChange={(e) => setOffer({ ...offer, banner_text: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                />
              </div>

              {/* Discount Percent & Min Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Discount Percent (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={offer.discount_percent}
                      onChange={(e) => setOffer({ ...offer, discount_percent: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Min Order for Discount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={offer.min_order_amount}
                      onChange={(e) => setOffer({ ...offer, min_order_amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Free Item Name & Min Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Free Item Name (₹0 at Checkout)
                  </label>
                  <input
                    type="text"
                    value={offer.free_item_name}
                    onChange={(e) => setOffer({ ...offer, free_item_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Min Order for Free Item (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={offer.free_item_min_amount}
                      onChange={(e) => setOffer({ ...offer, free_item_min_amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code & Coupon Flat Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={offer.coupon_code}
                    onChange={(e) => setOffer({ ...offer, coupon_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Coupon Flat Discount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={offer.coupon_flat_discount}
                      onChange={(e) => setOffer({ ...offer, coupon_flat_discount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Expiry Timer Section */}
              <div className="p-4 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2E4823] block">
                      Offer Expiry Time (Countdown Target)
                    </span>
                    <span className="text-xs text-gray-500">
                      Currently set to: {new Date(offer.expires_at).toLocaleString()}
                    </span>
                  </div>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs font-bold text-gray-500 self-center">Quick Set:</span>
                  <button
                    type="button"
                    onClick={() => extendOfferHours(1)}
                    className="px-3 py-1 bg-white hover:bg-[#2E4823] hover:text-white rounded-lg text-xs font-semibold border border-gray-300 transition-colors"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => extendOfferHours(6)}
                    className="px-3 py-1 bg-white hover:bg-[#2E4823] hover:text-white rounded-lg text-xs font-semibold border border-gray-300 transition-colors"
                  >
                    +6 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => extendOfferHours(12)}
                    className="px-3 py-1 bg-white hover:bg-[#2E4823] hover:text-white rounded-lg text-xs font-semibold border border-gray-300 transition-colors"
                  >
                    +12 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => extendOfferHours(24)}
                    className="px-3 py-1 bg-white hover:bg-[#2E4823] hover:text-white rounded-lg text-xs font-semibold border border-gray-300 transition-colors"
                  >
                    +24 Hours
                  </button>
                </div>
              </div>

              {/* Submit button for Offers */}
              <button
                type="submit"
                disabled={offerSaving}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2E4823] hover:bg-[#223719] disabled:bg-gray-400 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{offerSaving ? 'Saving Changes...' : 'Save Offer Settings to Supabase'}</span>
              </button>
            </form>

            {/* Dedicated Secure Admin PIN Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823]">
                    Admin Security Passcode (Private)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Stored in a server-side protected table (<code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[#2E4823]">admin_secrets</code>) hidden from public browsers.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePin} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    New Admin PIN (Min 4 digits)
                  </label>
                  <input
                    type="password"
                    maxLength={12}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter new secret PIN"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pinChangeLoading || !newPinInput.trim()}
                  className="py-2.5 px-5 rounded-xl bg-[#2E4823] hover:bg-[#223719] disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{pinChangeLoading ? 'Updating PIN...' : 'Change Passcode'}</span>
                </button>
              </form>

              {pinChangeMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  pinChangeMessage.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {pinChangeMessage.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{pinChangeMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: INCOMING ORDERS                                       */}
        {/* ============================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-[#F7F3EB] rounded-3xl p-6 border border-[#2E4823]/15 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823]">
                  Incoming Orders &amp; WhatsApp Notifications
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Orders submitted through the WhatsApp checkout are logged in Supabase orders table first.
                </p>
                <p className="text-[11px] text-amber-900/80 bg-amber-50 border border-amber-200/60 rounded-lg px-2.5 py-1 mt-2 inline-block">
                  Note: Background browser tabs may be throttled by operating systems. Direct WhatsApp notifications remain your primary real-time order alert.
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                disabled={ordersLoading}
                className="py-2 px-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order code, name, phone..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F7F3EB] rounded-xl border border-gray-200 focus:outline-none focus:border-[#2E4823]"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#F7F3EB] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === 'all'
                      ? 'bg-[#2E4823] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#2E4823]'
                  }`}
                >
                  All Orders ({orders.length})
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('Initiated')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderStatusFilter === 'Initiated'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <span>Initiated</span>
                  <span className="font-mono text-[10px] bg-black/15 px-1.5 py-0.2 rounded-full">
                    {orders.filter((o) => o.status === 'Initiated').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('Confirmed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderStatusFilter === 'Confirmed'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <span>Confirmed</span>
                  <span className="font-mono text-[10px] bg-black/15 px-1.5 py-0.2 rounded-full">
                    {orders.filter((o) => o.status === 'Confirmed').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('Completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderStatusFilter === 'Completed'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span>Completed</span>
                  <span className="font-mono text-[10px] bg-black/15 px-1.5 py-0.2 rounded-full">
                    {orders.filter((o) => o.status === 'Completed').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('Rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    orderStatusFilter === 'Rejected'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-red-800 hover:bg-red-100'
                  }`}
                >
                  <span>Rejected</span>
                  <span className="font-mono text-[10px] bg-black/15 px-1.5 py-0.2 rounded-full">
                    {orders.filter((o) => o.status === 'Rejected').length}
                  </span>
                </button>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-['Playfair_Display'] text-xl font-bold text-gray-600">
                  No orders found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Orders submitted through the website or WhatsApp will appear here automatically every 10 seconds.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full">
                {filteredOrders.map((order, orderIndex) => {
                  const isCompleted = order.status === 'Completed';
                  const isConfirmed = order.status === 'Confirmed';
                  const isCod = order.payment_method?.toUpperCase() === 'COD';

                  return (
                    <div
                      key={order.order_code + (order.id || '')}
                      className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-2xs space-y-4 flex flex-col justify-between transition-all duration-300 break-words min-w-0 w-full max-w-full ${
                        newOrderHighlight && orderIndex === 0
                          ? 'ring-2 ring-emerald-500 shadow-md'
                          : ''
                      } ${
                        isCompleted
                          ? 'border-emerald-200'
                          : isConfirmed
                          ? 'border-blue-200 bg-blue-50/10'
                          : order.payment_status === 'utr_submitted'
                          ? 'border-indigo-300 bg-indigo-50/20'
                          : 'border-amber-200 bg-amber-50/20'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Order Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm bg-[#2E4823]/10 text-[#2E4823] px-2.5 py-1 rounded-lg">
                              {order.order_code}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isConfirmed
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>

                            {/* Badge for COD or UPI payment status */}
                            {isCod ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border bg-amber-100 text-amber-900 border-amber-300">
                                CASH ORDER
                              </span>
                            ) : (
                              (() => {
                                const ps = (order.payment_status || 'pending').toLowerCase();
                                let colorClass = 'bg-amber-100 text-amber-900 border-amber-300';
                                let label = 'PENDING';
                                if (ps === 'utr_submitted') {
                                  colorClass = 'bg-blue-100 text-blue-900 border-blue-300';
                                  label = 'UTR SUBMITTED';
                                } else if (ps === 'confirmed') {
                                  colorClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                                  label = 'CONFIRMED';
                                } else if (ps === 'rejected') {
                                  colorClass = 'bg-red-100 text-red-900 border-red-300';
                                  label = 'REJECTED';
                                }
                                return (
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${colorClass}`}>
                                    {label}
                                  </span>
                                );
                              })()
                            )}
                          </div>

                          <span className="text-[11px] text-gray-400">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        {/* Soundbox Banner for UPI or Cash Collection Banner for COD */}
                        {isCod ? (
                          <div className="bg-[#F7F3EB] border border-[#2E4823]/20 rounded-xl p-3 text-xs font-mono font-semibold text-[#1C1C1C] break-words min-w-0">
                            COLLECT CASH: Rs {order.final_total} upon delivery or pickup
                          </div>
                        ) : (
                          <div className="bg-[#F7F3EB] border border-[#2E4823]/20 rounded-xl p-3 text-xs font-mono font-semibold text-[#1C1C1C] break-words min-w-0">
                            {order.utr ? (
                              <div className="space-y-0.5 break-words min-w-0">
                                <div className="break-words">CHECK SOUNDBOX: Rs {order.final_total} | UPI Ref (entered by customer, not verified): {order.utr}</div>
                                {order.utr_submitted_at && (
                                  <div className="text-[11px] text-[#2E4823] font-normal">
                                    {formatUtrTimeAgo(order.utr_submitted_at)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500 break-words">
                                CHECK SOUNDBOX: Rs {order.final_total} | UPI Ref: Not submitted yet
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customer Information */}
                        <div className="bg-[#F7F3EB] rounded-2xl p-3 text-xs space-y-1 break-words min-w-0">
                          <div className="flex justify-between font-bold text-[#1C1C1C] gap-2">
                            <span className="break-words min-w-0">{order.customer_name}</span>
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="text-[#D3452B] hover:underline font-mono shrink-0"
                            >
                              +91 {order.customer_phone}
                            </a>
                          </div>
                          <div className="text-gray-500 flex items-center justify-between text-[11px] flex-wrap gap-1">
                            <span>
                              Type: <strong>{order.order_type === 'DELIVERY_5KM' ? '5km Delivery' : 'Self-Pickup'}</strong>
                              {order.distance_km ? ` (${order.distance_km} km)` : ''}
                            </span>
                            <span>Payment: <strong>{order.payment_method}</strong></span>
                          </div>
                          {order.address_notes && (
                            <p className="text-gray-600 text-[11px] pt-1 border-t border-gray-200/80 break-words">
                              Address: {order.address_notes}
                            </p>
                          )}
                          {order.maps_link && (
                            <a
                              href={order.maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#2E4823] hover:underline flex items-center gap-1 font-semibold pt-0.5 break-all"
                            >
                              <span>View GPS Location on Google Maps</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-1 text-xs break-words min-w-0">
                          <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                            Items Ordered:
                          </span>
                          <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-gray-200 text-gray-800 text-xs font-medium leading-relaxed max-h-32 overflow-y-auto">
                            {order.items_json.startsWith('[') ? (
                              (() => {
                                try {
                                  return JSON.parse(order.items_json).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between py-0.5 border-b border-gray-100 last:border-b-0">
                                      <span>{item.qty || item.quantity}x {item.name}</span>
                                      <span className="font-mono text-gray-600">Rs {item.itemTotal ?? ((item.price || 0) * (item.qty || 1))}</span>
                                    </div>
                                  ));
                                } catch {
                                  return <div>{order.items_json}</div>;
                                }
                              })()
                            ) : (
                              order.items_json.split(', ').map((str, idx) => (
                                <div key={idx} className="py-0.5 flex items-center gap-1">
                                  <span className="text-gray-400">•</span>
                                  <span>{str}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-gray-600 pt-1 border-t border-gray-100 flex-wrap gap-1 font-mono">
                            <span>Subtotal: Rs {order.subtotal}</span>
                            {order.discount_amount > 0 && (
                              <span className="text-emerald-700">Disc: -Rs {order.discount_amount}</span>
                            )}
                            <span>Packing: Rs {order.packing_fee !== undefined && order.packing_fee !== null ? order.packing_fee : 5}</span>
                            <span className="font-bold text-[#2E4823]">Total: Rs {order.final_total}</span>
                          </div>
                        </div>

                        {/* Payment Verification Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-500">Payment:</span>
                          {isCod ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePaymentStatusUpdate(order, 'confirmed')}
                                disabled={order.payment_status === 'confirmed'}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  order.payment_status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                                }`}
                              >
                                Cash collected
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePaymentStatusUpdate(order, 'rejected')}
                                disabled={order.payment_status === 'rejected'}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  order.payment_status === 'rejected'
                                    ? 'bg-red-100 text-red-800 cursor-default'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95'
                                }`}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePaymentStatusUpdate(order, 'confirmed')}
                                disabled={order.payment_status === 'confirmed'}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  order.payment_status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                                }`}
                              >
                                Payment received
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePaymentStatusUpdate(order, 'rejected')}
                                disabled={order.payment_status === 'rejected'}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  order.payment_status === 'rejected'
                                    ? 'bg-red-100 text-red-800 cursor-default'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95'
                                }`}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer & Order Acceptance Actions */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 break-words min-w-0">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                            Final Total
                          </span>
                          <span className="font-['Playfair_Display'] text-xl font-bold text-[#D3452B]">
                            Rs {order.final_total}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {order.status !== 'Confirmed' && order.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleAcceptOrder(order)}
                              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                              title="Accept order and notify customer via WhatsApp"
                            >
                              <span>Accept</span>
                            </button>
                          )}

                          {order.status !== 'Rejected' && order.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleRejectOrder(order)}
                              className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                              title="Reject order and notify customer via WhatsApp"
                            >
                              <span>Reject</span>
                            </button>
                          )}

                          {order.status === 'Confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleCompleteOrder(order)}
                              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Completed</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              <Check className="w-3.5 h-3.5" />
                              <span>Order Fulfilled</span>
                            </span>
                          )}

                          {order.status === 'Rejected' && (
                            <span className="text-xs text-red-800 font-bold flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Order Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
