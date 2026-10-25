import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CartItem, StoreOffer, OrderType, DbOrder } from '../types';
import {
  createOrder,
  confirmOrderUtr,
  isNetworkError,
  WHATSAPP_NUMBER,
  getOrderAvailability,
  fetchMenuItems,
  mapOrderErrorToMessage,
} from '../utils/supabaseClient';
import QRCode from 'qrcode';
import { calculateTotals, isRestaurantOpen } from '../utils/cartMath';
import { useScrollLock } from '../utils/scrollLock';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Gift,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Send,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Banknote,
  Copy,
  Check,
  QrCode,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { PriceComparisonModal } from './PriceComparisonModal';

// TEST ONLY: personal UPI ID. Replace with the restaurant's own UPI ID before going live.
export const MERCHANT_UPI_ID = 'Tarunteja190820071@ibl';
export const MERCHANT_UPI_NAME = 'Vaibhav Grand';
export const IS_VERIFIED_MERCHANT_VPA = false; // Set to true only when switching to a restaurant merchant VPA; personal handles often reject the 'tr' parameter on GPay/PhonePe.

/**
 * Single place to build UPI URI and toggle the 'tr' parameter.
 * Personal handles often reject the 'tr' parameter on GPay/PhonePe.
 */
export function buildUpiUri(orderCode: string, finalTotal: number): string {
  const amountStr = Number(finalTotal).toFixed(2);
  let uri = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(
    MERCHANT_UPI_NAME
  )}&tn=${encodeURIComponent(`Order ${orderCode}`)}&am=${amountStr}&cu=INR`;
  if (IS_VERIFIED_MERCHANT_VPA) {
    uri += `&tr=${encodeURIComponent(orderCode)}`;
  }
  return uri;
}

/**
 * Generates safe idempotency key per checkout attempt
 */
function generateIdempotencyKey(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

interface PendingOrderCache {
  idempotencyKey: string;
  validatedOrder: DbOrder;
  createdAt: number;
  fingerprint: string;
}

/**
 * Builds deterministic plain string fingerprint for cart state
 */
export function buildCartFingerprint(
  items: CartItem[],
  phone: string,
  orderType: OrderType,
  paymentMethod: 'UPI' | 'COD',
  location: { lat: number; lng: number } | null,
  serverTotal: number
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const sortedItems = items
    .map((i) => {
      const itemRecord = i as unknown as Record<string, unknown>;
      return {
        id: String(i.id),
        quantity: Number(i.quantity) || 1,
        variant: itemRecord.variant
          ? String(itemRecord.variant)
          : itemRecord.size
          ? String(itemRecord.size)
          : null,
        portion: itemRecord.portion
          ? String(itemRecord.portion)
          : itemRecord.portionNote
          ? String(itemRecord.portionNote)
          : null,
      };
    })
    .sort((a, b) => {
      if (a.id !== b.id) return a.id.localeCompare(b.id);
      const vA = a.variant || '';
      const vB = b.variant || '';
      if (vA !== vB) return vA.localeCompare(vB);
      const pA = a.portion || '';
      const pB = b.portion || '';
      return pA.localeCompare(pB);
    });

  const deliveryLocation =
    orderType === 'SELF_PICKUP' || !location
      ? null
      : {
          latitude: Number(Number(location.lat).toFixed(4)),
          longitude: Number(Number(location.lng).toFixed(4)),
        };

  return JSON.stringify({
    items: sortedItems,
    phone: cleanPhone,
    orderType,
    paymentMethod,
    location: deliveryLocation,
    serverTotal: Number(serverTotal),
  });
}

interface DirectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number | string, delta: number) => void;
  onRemoveItem?: (id: number | string) => void;
  onClearCart: (force?: boolean) => void;
  offer: StoreOffer | null;
  orderType: OrderType;
  userDistanceKm: number | null;
  userLocation: { lat: number; lng: number } | null;
  onSwitchOrderType: (type: OrderType) => void;
}

export const DirectOrderModal: React.FC<DirectOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  offer,
  orderType,
  userDistanceKm,
  userLocation,
  onSwitchOrderType,
}) => {
  useScrollLock(isOpen);

  // Modal Step State: 'form' | 'payment' | 'completed'
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'completed'>('form');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');

  // Store Operating Hours Lock
  const [storeOpen, setStoreOpen] = useState<boolean>(true);
  const [closedMessage, setClosedMessage] = useState<string>('');
  const [soldOutBanner, setSoldOutBanner] = useState<string>('');

  // Pre-flight Operating Hours Check
  useEffect(() => {
    if (
      !isOpen ||
      typeof window === 'undefined' ||
      (typeof process !== 'undefined' && Boolean(process.versions?.node))
    ) {
      return;
    }

    let isMounted = true;
    const checkAvailability = async () => {
      try {
        const avail = await getOrderAvailability();
        if (!isMounted) return;
        if (avail.success && avail.data) {
          if (!avail.data.open) {
            setStoreOpen(false);
            const msg = mapOrderErrorToMessage(avail.data.status, {
              opens_at: avail.data.opens_at,
              closes_at: avail.data.closes_at,
            });
            setClosedMessage(msg);
          } else {
            setStoreOpen(true);
            setClosedMessage('');
          }
        } else {
          const localOpen = isRestaurantOpen();
          setStoreOpen(localOpen);
          if (!localOpen) {
            setClosedMessage('Vaibhav Grand is currently closed. Operating hours are 10:30 AM to 11:00 PM.');
          } else {
            setClosedMessage('');
          }
        }
      } catch {
        if (!isMounted) return;
        const localOpen = isRestaurantOpen();
        setStoreOpen(localOpen);
        if (!localOpen) {
          setClosedMessage('Vaibhav Grand is currently closed. Operating hours are 10:30 AM to 11:00 PM.');
        } else {
          setClosedMessage('');
        }
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  // Device detection for Mobile UPI Intent vs Desktop QR Code fallback
  const [isMobileUser, setIsMobileUser] = useState<boolean>(true);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      (typeof process !== 'undefined' && Boolean(process.versions?.node))
    )
      return;
    const detectDevice = () => {
      const uaMobile =
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
          navigator.userAgent
        );
      const widthMobile = window.innerWidth <= 768;
      setIsMobileUser(uaMobile || widthMobile);
    };
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Delivery distance & eligibility state
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(false);

  // Sync / check sessionStorage on open or when switching tabs
  const syncGpsCache = () => {
    if (orderType === 'SELF_PICKUP') {
      return;
    }

    try {
      const cached = sessionStorage.getItem('delivery_gps_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const dist =
          typeof parsed.distanceKm === 'number' && parsed.distanceKm > 0
            ? parsed.distanceKm
            : null;
        const isEligible =
          dist !== null && dist > 0 && dist <= 5.0 && Boolean(parsed.eligible);
        setDistanceKm(dist);
        setEligible(isEligible);
        return;
      }
    } catch {}

    if (
      typeof userDistanceKm === 'number' &&
      userDistanceKm > 0 &&
      userDistanceKm <= 5.0
    ) {
      setDistanceKm(userDistanceKm);
      setEligible(true);
      return;
    }

    setDistanceKm(null);
    setEligible(false);
  };

  useEffect(() => {
    if (isOpen) {
      syncGpsCache();
    }
  }, [isOpen, orderType, userDistanceKm]);

  // Delivery validation
  const isDeliveryEligible =
    orderType === 'SELF_PICKUP' ||
    (typeof distanceKm === 'number' &&
      !isNaN(distanceKm) &&
      distanceKm > 0 &&
      distanceKm <= 5.0 &&
      eligible === true);

  // Decoupled Validation Flags
  const isTakeaway = orderType === 'SELF_PICKUP';
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const isPhoneValid = /^[6-9]\d{9}$/.test(cleanPhone);
  const isNameValid = customerName.trim().length >= 2;
  const isAddressValid = isTakeaway ? true : addressNotes.trim().length >= 5;

  const isTakeawayValid = isNameValid && isPhoneValid;
  const isDeliveryValid =
    isNameValid && isPhoneValid && isAddressValid && Boolean(isDeliveryEligible);

  // Error & coupon state
  const [formError, setFormError] = useState('');

  // Pre-Checkout Inventory Check state
  const [soldOutItemIds, setSoldOutItemIds] = useState<(number | string)[]>([]);

  // Pre-flight check: Re-fetch availability and prune sold-out items
  const checkAndPruneSoldOutItems = async (currentItems: CartItem[]): Promise<boolean> => {
    if (!currentItems || currentItems.length === 0) return true;
    try {
      const freshMenu = await fetchMenuItems();
      if (!freshMenu || freshMenu.length === 0) return true;

      const removedNames: string[] = [];
      const removedIds: (number | string)[] = [];

      for (const item of currentItems) {
        const baseId = String(item.id).split(':')[0].replace(/^group-/, '').trim();
        const found = freshMenu.find(
          (m) =>
            String(m.id) === baseId ||
            (item.name && m.name.toLowerCase().trim() === item.name.toLowerCase().trim())
        );

        if (found && found.is_completed === true) {
          removedNames.push(item.name);
          removedIds.push(item.id);
        }
      }

      if (removedIds.length > 0) {
        removedIds.forEach((id) => {
          if (onRemoveItem) {
            onRemoveItem(id);
          } else {
            const currentItem = currentItems.find((ci) => ci.id === id);
            if (currentItem) {
              onUpdateQuantity(id, -currentItem.quantity);
            }
          }
        });

        const namesText = removedNames.join(', ');
        const bannerText = `${namesText} is currently sold out. It has been removed from your cart.`;
        setSoldOutBanner(bannerText);

        const remainingCount = currentItems.length - removedIds.length;
        if (remainingCount <= 0) {
          onClose();
          if (typeof window !== 'undefined') {
            window.alert(bannerText);
          }
          return false;
        }

        return false;
      }

      return true;
    } catch (err) {
      console.warn('Sold out preflight check error:', err);
      return true;
    }
  };

  // Pre-flight check when checkout modal opens
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    checkAndPruneSoldOutItems(items);
  }, [isOpen]);

  useEffect(() => {
    if (soldOutItemIds.length > 0) {
      const currentIds = new Set(items.map((i) => String(i.id)));
      setSoldOutItemIds((prev) => {
        const remaining = prev.filter((id) => currentIds.has(String(id)));
        if (remaining.length === 0 && formError.includes('sold out')) {
          setFormError('');
        }
        return remaining;
      });
    }
  }, [items, formError]);

  const handleRemoveCartItem = (
    itemId: number | string,
    currentQty?: number
  ) => {
    setSoldOutItemIds((prev) => {
      const remaining = prev.filter(
        (id) => String(id) !== String(itemId) && id !== itemId
      );
      if (remaining.length === 0 && formError.includes('sold out')) {
        setFormError('');
      }
      return remaining;
    });

    if (onRemoveItem) {
      onRemoveItem(itemId);
    } else if (typeof currentQty === 'number') {
      onUpdateQuantity(itemId, -currentQty);
    }
  };

  const canPlaceOrder =
    items.length > 0 &&
    storeOpen &&
    soldOutItemIds.length === 0 &&
    (isTakeaway ? isTakeawayValid : isDeliveryValid);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Math Engine
  const totals = useMemo(() => {
    return calculateTotals(items, offer);
  }, [items, offer]);

  const couponDiscount = useMemo(() => {
    if (!couponApplied || !offer) return 0;
    return Number(offer.coupon_flat_discount) || 0;
  }, [couponApplied, offer]);

  const totalSavings = totals.discount_amount + couponDiscount;
  const finalTotal = Math.max(0, totals.subtotal - totalSavings);

  // Swiggy/Zomato live contrast calculation
  const swiggyFoodEstimate = useMemo(() => {
    return items.reduce((acc, curr) => {
      const aggPrice = Math.round((curr.price * 1.25) / 10) * 10;
      return acc + aggPrice * curr.quantity;
    }, 0);
  }, [items]);

  const swiggyPackagingFee = items.length > 0 ? 35 : 0;
  const swiggyPlatformFee = items.length > 0 ? 12 : 0;
  const swiggyDeliveryFee =
    orderType === 'DELIVERY_5KM' && items.length > 0 ? 45 : 0;
  const swiggyTotalEstimate =
    swiggyFoodEstimate +
    swiggyPackagingFee +
    swiggyPlatformFee +
    swiggyDeliveryFee;
  const directTotalSavingsVsAggregator = Math.max(
    0,
    swiggyTotalEstimate - finalTotal
  );

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!offer || !offer.coupon_code) {
      setCouponError('No active coupon code available right now.');
      return;
    }
    if (couponInput.trim().toUpperCase() === offer.coupon_code.toUpperCase()) {
      if (totals.subtotal < Number(offer.min_order_amount)) {
        setCouponError(
          `Min order of Rs ${offer.min_order_amount} required for this coupon.`
        );
        return;
      }
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError(`Invalid coupon code. Try "${offer.coupon_code}"`);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponInput('');
    setCouponError('');
  };

  // Active validated order from server
  const [activeOrder, setActiveOrder] = useState<DbOrder | null>(null);
  const [orderAlreadySent, setOrderAlreadySent] = useState(false);

  // UTR Reference Input & Submission state
  const [utr, setUtr] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState('');
  const [isUtrNetworkError, setIsUtrNetworkError] = useState(false);
  const [hasLaunchedUpiApp, setHasLaunchedUpiApp] = useState(false);
  const [isUtrHighlighted, setIsUtrHighlighted] = useState(false);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState('');
  const [submittedWhatsappMessage, setSubmittedWhatsappMessage] = useState('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const utrInputRef = useRef<HTMLInputElement | null>(null);

  // Client-side instant offline-ready QR Code data URL generator
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!activeOrder) {
      setQrDataUrl('');
      return;
    }
    const upiUri = buildUpiUri(activeOrder.order_code, activeOrder.final_total);
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#1C1C1C',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeOrder]);

  // Invalidate pending session cache if cart items change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cachedRaw = sessionStorage.getItem('vaibhav_pending_order_v1');
      if (cachedRaw) {
        const cached: PendingOrderCache = JSON.parse(cachedRaw);
        const currentFp = buildCartFingerprint(
          items,
          customerPhone,
          orderType,
          paymentMethod,
          userLocation,
          finalTotal
        );
        if (cached.fingerprint !== currentFp) {
          sessionStorage.removeItem('vaibhav_pending_order_v1');
          if (checkoutStep === 'payment') {
            setCheckoutStep('form');
            setActiveOrder(null);
          }
        }
      }
    } catch {}
  }, [items, customerPhone, orderType, paymentMethod, userLocation, finalTotal, checkoutStep]);

  // Check sessionStorage on mount / open to resume unexpired pending order (<15 min)
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    try {
      const cachedRaw = sessionStorage.getItem('vaibhav_pending_order_v1');
      if (cachedRaw) {
        const cached: PendingOrderCache = JSON.parse(cachedRaw);
        const ageMs = Date.now() - (cached.createdAt || 0);
        const currentFp = buildCartFingerprint(
          items,
          customerPhone,
          orderType,
          paymentMethod,
          userLocation,
          finalTotal
        );
        if (ageMs < 15 * 60 * 1000 && cached.fingerprint === currentFp) {
          if (
            cached.validatedOrder.payment_status &&
            cached.validatedOrder.payment_status !== 'pending'
          ) {
            setOrderAlreadySent(true);
            setActiveOrder(cached.validatedOrder);
            setCheckoutStep('completed');
          } else {
            setActiveOrder(cached.validatedOrder);
            setCheckoutStep('payment');
          }
        } else {
          sessionStorage.removeItem('vaibhav_pending_order_v1');
        }
      }
    } catch {}
  }, [isOpen]);

  // Return from UPI App: listen ONLY to document visibilitychange (avoid window focus double firing)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        hasLaunchedUpiApp &&
        checkoutStep === 'payment'
      ) {
        if (utrInputRef.current) {
          utrInputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          try {
            utrInputRef.current.focus();
          } catch {}
        }
        setIsUtrHighlighted(true);
        setTimeout(() => {
          setIsUtrHighlighted(false);
        }, 2500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasLaunchedUpiApp, checkoutStep]);

  /**
   * Plain text WhatsApp receipt formatter without emojis
   */
  const buildWhatsappReceipt = (order: DbOrder, utrNumber?: string): string => {
    const sanitize = (text: string) =>
      (text || '')
        .replace(/[*_~`]/g, ' ')
        .replace(/[^\S\r\n]+/g, ' ')
        .trim();

    const safeCustomerName = sanitize(order.customer_name || '');
    const safeAddressText = sanitize(order.address_notes || '');
    const modeText = order.order_type === 'DELIVERY_5KM' ? 'Delivery' : 'Pickup';
    const mapsLink = order.maps_link || 'Self-Pickup at Restaurant';

    let firstLine = `New Order: Order ${order.order_code}`;
    if (order.payment_method === 'COD') {
      firstLine = `PAYMENT: Cash on Delivery (Collect Rs ${order.final_total}) | Order ${order.order_code}`;
    } else if (utrNumber) {
      firstLine = `CHECK SOUNDBOX: Rs ${order.final_total} | UPI Ref: ${utrNumber} | Order ${order.order_code}`;
    }

    let itemsFormatted = '';
    try {
      if (order.items_json.startsWith('[')) {
        const parsed = JSON.parse(order.items_json);
        itemsFormatted = parsed
          .map(
            (i: any, idx: number) =>
              `${idx + 1}. *${sanitize(i.name)}* x ${i.quantity || i.qty} - *Rs ${
                i.itemTotal ?? (i.price || 0) * (i.quantity || i.qty || 1)
              }*`
          )
          .join('\n');
      } else {
        itemsFormatted = order.items_json
          .split(', ')
          .map((s, idx) => `${idx + 1}. ${sanitize(s)}`)
          .join('\n');
      }
    } catch {
      itemsFormatted = sanitize(order.items_json);
    }

    return `${firstLine}

*DIRECT ORDER INVOICE*
*Order ID:* #${order.order_code}
*Mode:* ${modeText} | *Payment:* ${order.payment_method}
*Customer:* ${safeCustomerName} | +91 ${order.customer_phone}
*Address:* ${safeAddressText}
System GPS Pin: ${mapsLink}
--------------------------------
*ITEMS:*
${itemsFormatted}
--------------------------------
*Subtotal:* Rs ${order.subtotal}
*Discount:* -Rs ${order.discount_amount}
*TOTAL PAYABLE:* *Rs ${order.final_total}*
--------------------------------
*Vaibhav Grand Direct Order*
Need help? Call our support desk: +91 7947142432
_Please reply "CONFIRMED" to start preparing my order._`;
  };

  /**
   * Step 1: Submit Details & Proceed to Payment
   */
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!storeOpen) {
      setFormError(
        closedMessage || 'Restaurant Closed. We accept direct orders between 10:30 AM and 11:00 PM.'
      );
      return;
    }

    // Re-fetch availability and prune sold-out items right before submitting
    const allAvailable = await checkAndPruneSoldOutItems(items);
    if (!allAvailable) {
      return;
    }

    if (items.length === 0) {
      setFormError('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError(
        'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).'
      );
      return;
    }

    if (orderType === 'DELIVERY_5KM') {
      if (!isDeliveryEligible) {
        setFormError(
          distanceKm !== null && distanceKm > 5.0
            ? `Direct delivery is limited to 5.0 km road distance. You are ~${distanceKm} km away. Please switch to Self-Pickup.`
            : 'Delivery distance is unverified or outside our 5.0 km delivery zone. Please switch to Self-Pickup.'
        );
        return;
      }
      if (!addressNotes.trim() || addressNotes.trim().length < 5) {
        setFormError(
          'Please enter your complete delivery address or landmark near Renigunta.'
        );
        return;
      }
    }

    setIsSubmittingOrder(true);

    try {
      // 1. Navigation link & GPS
      let lat = userLocation?.lat;
      let lng = userLocation?.lng;

      if (
        (lat === undefined || lng === undefined) &&
        typeof window !== 'undefined'
      ) {
        try {
          const cachedGeo = sessionStorage.getItem('vaibhav_delivery_geo');
          if (cachedGeo) {
            const parsed = JSON.parse(cachedGeo);
            if (parsed.mapsLink) {
              const match = parsed.mapsLink.match(/q=([-\d.]+),([-\d.]+)/);
              if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
              }
            }
          }
        } catch {}
      }

      const hasCoordinates =
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng);

      const typedAddress = isTakeaway
        ? addressNotes.trim() || 'Self-Pickup at Restaurant'
        : addressNotes.trim();

      const finalAddress =
        orderType === 'DELIVERY_5KM' && hasCoordinates
          ? `${typedAddress.trim()}\n\nSystem GPS Pin: https://www.google.com/maps?q=${lat},${lng}`
          : typedAddress.trim();

      const mapsLink = isTakeaway
        ? 'Self-Pickup at Restaurant'
        : hasCoordinates
        ? `https://maps.google.com/?q=${lat},${lng}`
        : addressNotes.trim()
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            addressNotes.trim() + ' Renigunta'
          )}`
        : 'Self-Pickup at Restaurant';

      const itemsFormattedText =
        items
          .map((i) => `${i.quantity}x ${i.name} (Rs ${i.price * i.quantity})`)
          .join(', ') +
        (totals.free_item_name
          ? `, 1x ${totals.free_item_name} (Rs 0 Free Item)`
          : '');

      // Check for reusable idempotency key in sessionStorage (<15m)
      const currentFingerprint = buildCartFingerprint(
        items,
        cleanPhone,
        orderType,
        paymentMethod,
        userLocation,
        finalTotal
      );
      let idempotencyKey = generateIdempotencyKey();

      if (typeof sessionStorage !== 'undefined') {
        try {
          const cachedRaw = sessionStorage.getItem('vaibhav_pending_order_v1');
          if (cachedRaw) {
            const cached: PendingOrderCache = JSON.parse(cachedRaw);
            const ageMs = Date.now() - (cached.createdAt || 0);
            if (
              ageMs < 15 * 60 * 1000 &&
              cached.fingerprint === currentFingerprint &&
              cached.idempotencyKey
            ) {
              idempotencyKey = cached.idempotencyKey;
            } else {
              sessionStorage.removeItem('vaibhav_pending_order_v1');
            }
          }
        } catch {}
      }

      const orderPayload: DbOrder = {
        order_code: '', // server generates unguessable 8-char code
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        order_type: orderType,
        distance_km: isTakeaway ? null : distanceKm,
        address_notes: finalAddress,
        maps_link: mapsLink,
        items_json: itemsFormattedText,
        subtotal: Number(totals.subtotal),
        discount_amount: Number(totalSavings),
        final_total: Number(finalTotal),
        payment_method: paymentMethod,
        status: 'Initiated',
        payment_status: 'pending',
        idempotency_key: idempotencyKey,
      };

      // Call submit_verified_order via createOrder
      const saveResult = await createOrder(
        orderPayload,
        items,
        offer,
        idempotencyKey,
        paymentMethod
      );

      if (!saveResult.success) {
        setIsSubmittingOrder(false);
        if (saveResult.status === 'closed' || saveResult.status === 'closed_last_order') {
          setStoreOpen(false);
          setClosedMessage(saveResult.message || 'Restaurant Closed.');
          setFormError(saveResult.message || 'Restaurant Closed.');
          return;
        }

        if (saveResult.status === 'item_unavailable' || saveResult.error === 'OUT_OF_STOCK') {
          const unavailableList = saveResult.unavailableItems || [];
          const namesText = unavailableList.length > 0 ? unavailableList.join(', ') : 'One or more items';
          const bannerText = `${namesText} is currently sold out. It has been removed from your cart.`;
          setSoldOutBanner(bannerText);

          let removedCount = 0;
          items.forEach((ci) => {
            const isMatch = unavailableList.some(
              (un) => un.toLowerCase().trim() === ci.name.toLowerCase().trim()
            );
            if (isMatch) {
              removedCount++;
              if (onRemoveItem) {
                onRemoveItem(ci.id);
              } else {
                onUpdateQuantity(ci.id, -ci.quantity);
              }
            }
          });

          if (items.length - removedCount <= 0) {
            onClose();
            if (typeof window !== 'undefined') {
              window.alert(bannerText);
            }
            return;
          }
          return;
        }

        setFormError(
          saveResult.message ||
            'Something went wrong. Please check your connection and try again.'
        );
        return;
      }

      // Authoritative order amounts from server response
      const validatedOrder = saveResult.data || orderPayload;

      // If returned order payment_status is no longer 'pending', it was already processed
      if (
        validatedOrder.payment_status &&
        validatedOrder.payment_status !== 'pending'
      ) {
        setOrderAlreadySent(true);
        setActiveOrder(validatedOrder);
        setCheckoutStep('completed');
        setIsSubmittingOrder(false);
        return;
      }

      // Store in sessionStorage cache for 15-minute resume mid-payment
      if (typeof sessionStorage !== 'undefined') {
        try {
          const cacheData: PendingOrderCache = {
            idempotencyKey,
            validatedOrder,
            createdAt: Date.now(),
            fingerprint: currentFingerprint,
          };
          sessionStorage.setItem(
            'vaibhav_pending_order_v1',
            JSON.stringify(cacheData)
          );
        } catch {}
      }

      setActiveOrder(validatedOrder);

      // If payment method is COD, skip UPI payment step
      if (paymentMethod === 'COD') {
        const receipt = buildWhatsappReceipt(validatedOrder);
        const rawNumber = (WHATSAPP_NUMBER || '917702104894').replace(/\D/g, '');
        const targetPhone =
          rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
        const encodedMsg = encodeURIComponent(receipt);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;

        setSubmittedWhatsappUrl(whatsappUrl);
        setSubmittedWhatsappMessage(receipt);

        if (typeof sessionStorage !== 'undefined') {
          try {
            sessionStorage.removeItem('vaibhav_pending_order_v1');
          } catch {}
        }
        onClearCart(true);

        const isMobileDevice =
          typeof navigator !== 'undefined' &&
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        try {
          if (isMobileDevice) {
            window.location.href = whatsappUrl;
          } else {
            const newWin = window.open(
              whatsappUrl,
              '_blank',
              'noopener,noreferrer'
            );
            if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
              window.location.href = whatsappUrl;
            }
          }
        } catch {}

        setCheckoutStep('completed');
        setIsSubmittingOrder(false);
        return;
      }

      // For UPI, proceed to Payment step
      setCheckoutStep('payment');
      setIsSubmittingOrder(false);
    } catch (err) {
      console.error('Order submission error:', err);
      setIsSubmittingOrder(false);
      setFormError(
        'Something went wrong. Please check your connection and try again.'
      );
    }
  };

  /**
   * Step 2: Confirm 12-Digit UTR and Dispatch WhatsApp
   */
  const handleConfirmUtrAndSend = async () => {
    if (!activeOrder || isSubmittingUtr) return;

    const cleanUtr = utr.trim();
    if (!/^[0-9]{12}$/.test(cleanUtr)) {
      setUtrError('Please enter a valid 12-digit UPI reference number.');
      return;
    }

    setIsSubmittingUtr(true);
    setUtrError('');
    setIsUtrNetworkError(false);

    try {
      // 1. Call confirmOrderUtr FIRST and wait
      const res = await confirmOrderUtr(activeOrder.order_code, cleanUtr);

      if (!res.success) {
        setIsSubmittingUtr(false);
        if (res.isNetworkError || res.status === 'network_error') {
          setIsUtrNetworkError(true);
          setUtrError(
            'Network connection error. Please check your internet connection, retry, or use the direct WhatsApp link below.'
          );
        } else {
          setIsUtrNetworkError(false);
          setUtrError(
            res.message ||
              'Unable to confirm UPI reference. Please check your 12-digit reference number.'
          );
        }
        return;
      }

      // 2. OK: Build WhatsApp message with CHECK SOUNDBOX first line
      const receipt = buildWhatsappReceipt(activeOrder, cleanUtr);
      const rawNumber = (WHATSAPP_NUMBER || '917702104894').replace(/\D/g, '');
      const targetPhone =
        rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
      const encodedMsg = encodeURIComponent(receipt);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;

      setSubmittedWhatsappUrl(whatsappUrl);
      setSubmittedWhatsappMessage(receipt);

      // Clear pending order cache & cart
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.removeItem('vaibhav_pending_order_v1');
        } catch {}
      }
      onClearCart(true);

      // Open WhatsApp
      const isMobileDevice =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      try {
        if (isMobileDevice) {
          window.location.href = whatsappUrl;
        } else {
          const newWin = window.open(
            whatsappUrl,
            '_blank',
            'noopener,noreferrer'
          );
          if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
            window.location.href = whatsappUrl;
          }
        }
      } catch (redirectErr) {
        console.warn('WhatsApp window open error:', redirectErr);
      }

      setCheckoutStep('completed');
    } catch (err: unknown) {
      console.error('Error confirming UTR:', err);
      const isNet = isNetworkError(err);
      setIsUtrNetworkError(isNet);
      setUtrError(
        isNet
          ? 'Network connection error. Please check your internet connection, retry, or use the direct WhatsApp link below.'
          : 'Failed to process UPI reference. Please try again.'
      );
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // Safe clipboard helper
  const handleCopyText = (
    text: string,
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  if (!isOpen) return null;

  const currentUpiUri = activeOrder
    ? buildUpiUri(activeOrder.order_code, activeOrder.final_total)
    : '';

  const fallbackWhatsappUrl = activeOrder
    ? `https://api.whatsapp.com/send?phone=${
        (WHATSAPP_NUMBER || '917702104894').replace(/\D/g, '').length === 10
          ? `91${(WHATSAPP_NUMBER || '917702104894').replace(/\D/g, '')}`
          : (WHATSAPP_NUMBER || '917702104894').replace(/\D/g, '')
      }&text=${encodeURIComponent(
        buildWhatsappReceipt(activeOrder, utr || 'Pending Manual Entry')
      )}`
    : '';

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-xs overflow-hidden animate-fade-in p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Mobile slide-up bottom sheet container */}
      <div
        data-lenis-prevent
        className="bg-[#FDFBF7] text-[#1C1C1C] rounded-t-3xl sm:rounded-3xl max-w-xl w-full h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#2E4823]/20 overflow-hidden my-0 sm:my-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* 1. STICKY TOP HEADER */}
        <div className="bg-[#2E4823] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {checkoutStep === 'payment' && (
              <button
                type="button"
                onClick={() => setCheckoutStep('form')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
                aria-label="Back to order form"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h2
                id="checkout-modal-title"
                className="font-['Playfair_Display'] text-lg sm:text-xl font-bold tracking-tight text-white leading-tight"
              >
                {checkoutStep === 'completed'
                  ? 'Order Sent to Restaurant'
                  : checkoutStep === 'payment'
                  ? 'UPI Payment'
                  : 'Review & Checkout'}
              </h2>
              <p className="text-[11px] text-white/80">
                {activeOrder
                  ? `Order Code: #${activeOrder.order_code}`
                  : 'Direct Dine-In Pricing • Zero Commission'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. SCROLLABLE MODAL BODY */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          {/* ======================================================== */}
          {/* SCREEN 3: COMPLETED / DISPATCHED SCREEN */}
          {/* ======================================================== */}
          {checkoutStep === 'completed' && activeOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D3452B]">
                  {orderAlreadySent ? 'Order Already Processed' : 'Order Dispatched'}
                </span>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823] mt-1">
                  {orderAlreadySent
                    ? 'Your order was already sent to the restaurant'
                    : 'Order Sent to Restaurant'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
                  Your request has been received. Please check your WhatsApp—our
                  team will message you shortly to confirm your order and provide
                  an ETA.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-[#2E4823]/10 px-4 py-1.5 rounded-full text-sm font-mono font-bold text-[#2E4823]">
                  <span>Order ID:</span>
                  <span className="text-[#D3452B]">#{activeOrder.order_code}</span>
                </div>
              </div>

              {/* Soundbox Verification Notice */}
              <div className="bg-[#F7F3EB] rounded-2xl p-4 text-left text-xs sm:text-sm text-gray-700 space-y-2 border border-[#2E4823]/15">
                <div className="font-mono font-bold text-xs text-[#2E4823] pb-1 border-b border-gray-200">
                  {activeOrder.payment_method === 'COD'
                    ? `COLLECT CASH: Rs ${activeOrder.final_total} upon delivery or pickup`
                    : `CHECK SOUNDBOX: Rs ${activeOrder.final_total} | UPI Ref: ${utr || 'Pending'}`}
                </div>
                <p className="flex items-center justify-between">
                  <span className="text-gray-500">Total Payable:</span>
                  <span className="font-bold text-[#2E4823] text-base">
                    Rs {activeOrder.final_total}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-gray-500">Payment Mode:</span>
                  <span className="font-semibold">
                    {activeOrder.payment_method === 'UPI'
                      ? 'UPI Payment'
                      : 'Cash on Delivery'}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-gray-500">Fulfillment:</span>
                  <span className="font-semibold">
                    {activeOrder.order_type === 'DELIVERY_5KM'
                      ? '5km Delivery'
                      : 'Self-Pickup'}
                  </span>
                </p>
              </div>

              {/* Receipt Preview */}
              {submittedWhatsappMessage && (
                <div className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      WhatsApp Receipt Dispatched:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(submittedWhatsappMessage, setCopiedReceipt)
                      }
                      className="text-[11px] font-bold text-[#2E4823] hover:underline"
                    >
                      {copiedReceipt ? 'Copied' : 'Copy Receipt'}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-[#FDFBF7] p-2.5 rounded-xl border border-gray-100">
                    {submittedWhatsappMessage}
                  </pre>
                </div>
              )}

              <div className="flex flex-col gap-2.5 pt-1">
                {submittedWhatsappUrl && (
                  <a
                    href={submittedWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open in WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-xs transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 2: UPI PAYMENT & 12-DIGIT UTR ENTRY */}
          {/* ======================================================== */}
          {checkoutStep === 'payment' && activeOrder && (
            <div className="space-y-4">
              {/* Honest Payment Disclaimer */}
              <div className="bg-[#F7F3EB] border border-[#2E4823]/20 rounded-2xl p-3.5 text-xs text-gray-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2E4823]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Soundbox Payment Notice</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  The UPI reference number you enter is recorded for order
                  matching. The restaurant verifies your payment through its UPI
                  soundbox notification before preparing your order.
                </p>
              </div>

              {/* Exact Amount & Order Details Card */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Exact Amount to Pay
                    </span>
                    <span className="font-['Playfair_Display'] text-2xl font-bold text-[#D3452B]">
                      Rs {activeOrder.final_total}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Order Code
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-bold bg-[#2E4823]/10 text-[#2E4823] px-2 py-0.5 rounded-lg">
                        {activeOrder.order_code}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(activeOrder.order_code, setCopiedCode)
                        }
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title="Copy Order Code"
                        aria-label="Copy Order Code"
                      >
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Merchant UPI ID with Copy Button */}
                <div className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-gray-200 text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                      Restaurant UPI ID
                    </span>
                    <span className="font-mono font-bold text-gray-800 break-all select-all">
                      {MERCHANT_UPI_ID}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(MERCHANT_UPI_ID, setCopiedUpi)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2E4823] text-white hover:bg-[#223719] text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-300" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Pay Button / Desktop QR Display */}
              {isMobileUser ? (
                <div className="space-y-2.5">
                  <a
                    href={currentUpiUri}
                    onClick={() => setHasLaunchedUpiApp(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95"
                  >
                    <CreditCard className="w-5 h-5 text-amber-300" />
                    <span>Open UPI app to pay Rs {activeOrder.final_total}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowQrOnMobile(!showQrOnMobile)}
                    className="w-full py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>
                      {showQrOnMobile
                        ? 'Hide QR code'
                        : 'Show QR code instead (to scan from another phone)'}
                    </span>
                  </button>

                  {showQrOnMobile && (
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 text-center space-y-2 animate-fade-in shadow-2xs">
                      <p className="text-xs font-bold text-gray-800">
                        Scan with GPay, PhonePe, Paytm, or any UPI app
                      </p>
                      <div className="p-2 bg-white rounded-xl border border-gray-100 inline-block shadow-2xs">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`UPI QR Code for Order ${activeOrder.order_code}`}
                            width={200}
                            height={200}
                            className="w-48 h-48 rounded-lg mx-auto"
                          />
                        ) : (
                          <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 rounded-lg mx-auto gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#2E4823]" />
                            <span className="text-[11px] text-gray-400">Loading QR code...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Pay exactly Rs {activeOrder.final_total} for Order{' '}
                        {activeOrder.order_code}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop QR View with 2-step status */
                <div className="p-4 bg-white rounded-2xl border border-gray-200 text-center space-y-3 shadow-2xs">
                  <div className="p-2 bg-white rounded-xl border border-gray-100 inline-block shadow-2xs">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`UPI QR Code for Order ${activeOrder.order_code}`}
                        width={200}
                        height={200}
                        className="w-48 h-48 rounded-lg mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 rounded-lg mx-auto gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#2E4823]" />
                        <span className="text-[11px] text-gray-400">Loading QR code...</span>
                      </div>
                    )}
                  </div>

                  {/* Desktop 2-step instructions */}
                  <div className="bg-[#F7F3EB] p-3 rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                    <div className="font-semibold text-gray-800">
                      Step 1: Scan with any UPI app and pay exactly Rs{' '}
                      {activeOrder.final_total}
                    </div>
                    <div className="font-semibold text-gray-800">
                      Step 2: Enter the 12-digit UPI reference below and send your
                      order (required)
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Reference Number Input Section */}
              <div
                className={`bg-white rounded-2xl p-4 border transition-all duration-300 shadow-2xs space-y-2.5 ${
                  isUtrHighlighted
                    ? 'ring-2 ring-[#2E4823] border-[#2E4823] bg-emerald-50/40'
                    : 'border-gray-200'
                }`}
              >
                <label
                  htmlFor="upi-reference-input"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-800"
                >
                  UPI reference number (12 digits) *
                </label>

                <div className="relative">
                  <input
                    ref={utrInputRef}
                    id="upi-reference-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={12}
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value.replace(/\D/g, ''));
                      setUtrError('');
                      setIsUtrNetworkError(false);
                    }}
                    placeholder="Enter 12-digit reference (e.g. 423456789012)"
                    className="w-full px-4 py-3 text-center text-base sm:text-lg font-mono tracking-widest bg-[#F7F3EB] rounded-xl border border-gray-300 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none"
                  />
                  <span className="text-[11px] font-mono font-bold text-gray-400 absolute right-3 top-1/2 -translate-y-1/2">
                    {utr.length}/12
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Find it on your GPay, PhonePe or Paytm payment success screen.
                  The restaurant confirms your payment before preparing the
                  order.
                </p>

                {utrError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{utrError}</span>
                    </div>

                    {isUtrNetworkError && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200/80">
                        <button
                          type="button"
                          onClick={handleConfirmUtrAndSend}
                          disabled={isSubmittingUtr}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                          Retry
                        </button>
                        {fallbackWhatsappUrl && (
                          <a
                            href={fallbackWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#2E4823] underline font-bold hover:text-black"
                          >
                            Open WhatsApp directly
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: "I have paid, send my order" */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmUtrAndSend}
                  disabled={
                    utr.length !== 12 ||
                    !/^[0-9]{12}$/.test(utr) ||
                    isSubmittingUtr
                  }
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BE5A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95"
                >
                  {isSubmittingUtr ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting order...</span>
                    </>
                  ) : (
                    <>
                      <span>I have paid, send my order</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Button activates once all 12 digits of the UPI reference number
                  are entered.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 1: CHECKOUT FORM & ITEMS REVIEW */}
          {/* ======================================================== */}
          {checkoutStep === 'form' && (
            <form
              id="direct-checkout-form"
              onSubmit={handleProceedToPayment}
              className="space-y-4"
            >
              {/* Sold-out Clear Banner */}
              {soldOutBanner && (
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-3.5 sm:p-4 text-left shadow-sm animate-fade-in flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-red-950">
                      Sold-Out Notice
                    </h4>
                    <p className="text-[11px] sm:text-xs text-red-800 leading-relaxed font-semibold">
                      {soldOutBanner}
                    </p>
                  </div>
                </div>
              )}

              {/* Business Hours Warning if Closed */}
              {!storeOpen && (
                <div className="bg-red-50 rounded-2xl p-3.5 border border-red-200 text-left space-y-1 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <h4 className="text-xs font-bold text-red-950">
                      Restaurant Closed for Direct Orders
                    </h4>
                  </div>
                  <p className="text-[11px] text-red-800 leading-relaxed font-semibold">
                    {closedMessage || 'Vaibhav Grand is currently closed. Operating hours are 10:30 AM to 11:00 PM.'}
                  </p>
                </div>
              )}

              {/* Fulfillment Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Fulfillment Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchOrderType('DELIVERY_5KM');
                      syncGpsCache();
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      orderType === 'DELIVERY_5KM'
                        ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-gray-100 text-gray-700 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        5km Delivery
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {distanceKm !== null
                          ? `${distanceKm} km road distance`
                          : 'Doorstep delivery'}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSwitchOrderType('SELF_PICKUP')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      orderType === 'SELF_PICKUP'
                        ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-gray-100 text-gray-700 shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Pickup</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Ready in ~20m at restaurant
                      </p>
                    </div>
                  </button>
                </div>

                {/* Rejection / Unverified Warning in Delivery Mode */}
                {orderType === 'DELIVERY_5KM' && !isDeliveryEligible && (
                  <div className="mt-2.5 bg-red-50 rounded-2xl p-3.5 border border-red-200 text-left space-y-2 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-red-950">
                          {distanceKm !== null && distanceKm > 5.0
                            ? `Outside 5.0 km Delivery Zone (~${distanceKm} km away)`
                            : 'Delivery Distance Verification Required'}
                        </h4>
                        <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                          {distanceKm !== null && distanceKm > 5.0
                            ? `Our direct kitchen fleet delivers strictly within 5.0 km road distance. You are ~${distanceKm} km away. Please switch to Self-Pickup to complete your direct order with full 25%+ savings.`
                            : 'Direct doorstep delivery requires a verified location within 5.0 km road distance. Please switch to Self-Pickup to place your order.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSwitchOrderType('SELF_PICKUP')}
                      className="w-full py-2 px-3 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                      <span>Switch to Self-Pickup &amp; Order Direct</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar Offer Callout */}
              {offer && offer.is_active && Number(offer.min_order_amount) > 0 && (
                <div className="bg-[#F7F3EB] rounded-2xl p-3 border border-[#2E4823]/15 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    {totals.has_discount ? (
                      <span className="font-bold text-emerald-800">
                        {offer.discount_percent}% OFF Applied! You saved Rs{' '}
                        {totals.discount_amount}.
                      </span>
                    ) : (
                      <span className="font-bold text-amber-900">
                        Add Rs {totals.amount_for_discount} more to get{' '}
                        {offer.discount_percent}% OFF!
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-gray-500">
                      Rs {totals.subtotal} / Rs {offer.min_order_amount}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        totals.has_discount ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (totals.subtotal / Number(offer.min_order_amount)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Itemized Mini-Receipt Box */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <span>Order Items</span>
                    <span className="text-[11px] bg-[#2E4823]/10 text-[#2E4823] px-2 py-0.5 rounded-full font-mono">
                      {items.length}
                    </span>
                  </h3>
                  {items.length > 0 && (
                    <button
                      type="button"
                      disabled={isSubmittingOrder}
                      onClick={() => onClearCart(false)}
                      className="text-xs text-[#D3452B] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-6 bg-[#F7F3EB] rounded-xl p-3 border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">
                      Your cart is empty. Add dishes from the menu.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => {
                      const isItemSoldOut = soldOutItemIds.some(
                        (id) => String(id) === String(item.id) || id === item.id
                      );

                      return (
                        <div
                          key={item.id}
                          className={`py-2.5 flex items-center justify-between gap-2 transition-all ${
                            isItemSoldOut
                              ? 'bg-red-50/90 border border-red-300 rounded-xl px-2.5 my-1.5 ring-1 ring-red-400'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p
                                  className={`text-xs sm:text-sm font-bold truncate ${
                                    isItemSoldOut
                                      ? 'text-red-950 line-through'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {item.name}
                                </p>
                                {isItemSoldOut && (
                                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] ${
                                  isItemSoldOut
                                    ? 'text-red-700 font-medium'
                                    : 'text-gray-500'
                                }`}
                              >
                                {isItemSoldOut
                                  ? 'Item unavailable - please delete'
                                  : `Rs ${item.price} each`}
                              </p>
                            </div>
                          </div>

                          {/* Steppers & Trash */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isItemSoldOut && (
                              <div className="flex items-center bg-[#F7F3EB] rounded-lg border border-[#2E4823]/20">
                                <button
                                  type="button"
                                  disabled={isSubmittingOrder}
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-[#D3452B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={isSubmittingOrder}
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-700 hover:text-[#2E4823] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={isSubmittingOrder}
                              onClick={() =>
                                handleRemoveCartItem(item.id, item.quantity)
                              }
                              className={`h-7 px-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                                isItemSoldOut
                                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs animate-pulse'
                                  : 'w-7 bg-red-50 hover:bg-red-100 text-[#D3452B] justify-center'
                              }`}
                              title={
                                isItemSoldOut
                                  ? 'Remove sold-out item'
                                  : 'Remove dish'
                              }
                              aria-label="Remove dish from cart"
                            >
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              {isItemSoldOut && <span>Remove</span>}
                            </button>

                            <span
                              className={`font-bold text-xs sm:text-sm w-14 text-right font-mono ${
                                isItemSoldOut
                                  ? 'text-red-700 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              Rs {item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {totals.free_item_name && (
                      <div className="pt-2.5 pb-1 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-2 min-w-0">
                          <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold truncate">
                            {totals.free_item_name}
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                            Free Gift
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 font-mono">
                          Rs 0
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtotal & Discount Rows */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      Rs {totals.subtotal}
                    </span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Direct Discount Savings</span>
                      <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded text-emerald-800">
                        -Rs {totalSavings} Saved!
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-[#2E4823]">
                      Final Total
                    </span>
                    <span className="font-['Playfair_Display'] text-xl font-bold text-[#D3452B]">
                      Rs {finalTotal}
                    </span>
                  </div>
                </div>

                {/* Swiggy/Zomato live contrast */}
                {directTotalSavingsVsAggregator > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-emerald-500/10 rounded-2xl p-3 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        Rs
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-extrabold text-[#2E4823]">
                            You Save Rs {directTotalSavingsVsAggregator} vs
                            Swiggy/Zomato!
                          </span>
                          <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                            Direct Perk
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          App Bill:{' '}
                          <span className="line-through text-gray-500 font-mono">
                            Rs {swiggyTotalEstimate}
                          </span>{' '}
                          (Markup + Pkg + Platform Fees)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCompareOpen(true)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 hidden sm:inline"
                    >
                      Compare
                    </button>
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              {offer?.coupon_code && (
                <div className="bg-[#F7F3EB] p-3 rounded-2xl border border-[#2E4823]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#D3452B]" />
                      <span className="text-xs font-bold text-gray-700">
                        Coupon Code
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Code:{' '}
                      <strong className="text-[#D3452B]">
                        {offer.coupon_code}
                      </strong>{' '}
                      (Rs {offer.coupon_flat_discount} OFF)
                    </span>
                  </div>

                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold">
                      <span>
                        &quot;{offer.coupon_code}&quot; applied (-Rs{' '}
                        {couponDiscount})
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-950 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder={`Enter ${offer.coupon_code}`}
                        className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-[#2E4823] font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#2E4823] text-white rounded-xl text-xs font-bold hover:bg-[#223719] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium">
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              {/* Customer Details */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Customer &amp; Contact Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tarun Teja"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F3EB]/50 rounded-xl border border-gray-300 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    WhatsApp Phone Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <span className="text-xs font-bold text-gray-500 absolute left-8 top-1/2 -translate-y-1/2">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="9876543210"
                      className="w-full pl-16 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F3EB]/50 rounded-xl border border-gray-300 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none font-mono"
                    />
                  </div>
                  {customerPhone && !/^[6-9]\d{9}$/.test(customerPhone) && (
                    <p className="text-[11px] text-amber-700 mt-1">
                      Must start with 6, 7, 8, or 9 and be 10 digits.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {orderType === 'DELIVERY_5KM'
                      ? 'Flat / Building / Landmark near Renigunta *'
                      : 'Special Requests / Pickup Time Notes (Optional)'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                      required={orderType === 'DELIVERY_5KM'}
                      rows={2}
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder={
                        orderType === 'DELIVERY_5KM'
                          ? 'House/Flat No., Street, Landmark near Renigunta...'
                          : 'e.g. Extra salan & raita, ready in 20 mins'
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F3EB]/50 rounded-xl border border-gray-300 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method Cards */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={!storeOpen}
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                        !storeOpen ? 'opacity-50 cursor-not-allowed ' : ''
                      }${
                        paymentMethod === 'UPI'
                          ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-gray-100 text-gray-700 shrink-0 mt-0.5">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          Pay by UPI
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          GPay, PhonePe, Paytm QR
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={!storeOpen}
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                        !storeOpen ? 'opacity-50 cursor-not-allowed ' : ''
                      }${
                        paymentMethod === 'COD'
                          ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-gray-100 text-gray-700 shrink-0 mt-0.5">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          Cash on Delivery
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Pay upon delivery or pickup
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* 3. STICKY BOTTOM ACTION BAR FOR STEP 1 */}
        {checkoutStep === 'form' && (
          <div className="shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">
                  Total Payable
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold text-[#D3452B]">
                    Rs {finalTotal}
                  </span>
                  {totalSavings > 0 && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Save Rs {totalSavings}
                    </span>
                  )}
                </div>
              </div>

              {/* Business Hours Check */}
              {!storeOpen ? (
                <div className="flex flex-col items-end text-right">
                  <button
                    type="button"
                    disabled
                    className="py-3 px-5 sm:px-6 rounded-2xl bg-gray-400 cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 opacity-95"
                  >
                    <span>Restaurant Closed</span>
                  </button>
                  <span className="text-[10px] text-red-600 font-semibold mt-1">
                    {closedMessage || 'Operating hours: 10:30 AM to 11:00 PM.'}
                  </span>
                </div>
              ) : (
                <button
                  type="submit"
                  form="direct-checkout-form"
                  disabled={
                    isSubmittingOrder || items.length === 0 || !canPlaceOrder
                  }
                  className="py-3 px-5 sm:px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BE5A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform transform active:scale-95"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : soldOutItemIds.length > 0 ? (
                    <span>Remove Out-of-Stock Items</span>
                  ) : !isTakeaway && !isDeliveryEligible ? (
                    <span>Delivery Unavailable (Outside 5km)</span>
                  ) : isTakeaway && (!isNameValid || !isPhoneValid) ? (
                    <span>Enter Name &amp; Phone to Order</span>
                  ) : !isTakeaway &&
                    (!isNameValid || !isPhoneValid || !isAddressValid) ? (
                    <span>Fill Address &amp; Details</span>
                  ) : paymentMethod === 'UPI' ? (
                    <>
                      <span>Proceed to Payment (Rs {finalTotal})</span>
                      <CreditCard className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Order on WhatsApp (Rs {finalTotal})</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 text-[10.5px] sm:text-xs text-slate-500 font-medium pt-2 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Buyer Protection</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Zero-Fee UPI Payments</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Price Comparison Modal */}
      <PriceComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onOrderDirect={() => setIsCompareOpen(false)}
      />
    </div>
  );
};
