import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Utensils, 
  ShoppingBag, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  RefreshCw, 
  X,
  Clock,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { 
  verifyDeliveryDistance, 
  DeliveryVerificationResult, 
  RESTAURANT_COORDS, 
  SWIGGY_URL, 
  ZOMATO_URL 
} from '../utils/supabaseClient';
import { useScrollLock } from '../utils/scrollLock';

interface OrderOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

// Popular Renigunta & Tirupati landmarks for 1-click verification
const POPULAR_LANDMARKS = [
  { name: 'Ramana Vilas Circle', lat: 13.6368, lng: 79.5039, tag: '0.1 km' },
  { name: 'Renigunta Railway Station', lat: 13.6455, lng: 79.5152, tag: '1.4 km' },
  { name: 'Gajulamandyam Industrial', lat: 13.6150, lng: 79.5190, tag: '3.2 km' },
  { name: 'Karakambadi Road', lat: 13.6420, lng: 79.4750, tag: '4.2 km' },
  { name: 'Tirupati Central Bus Stand', lat: 13.6288, lng: 79.4192, tag: '9.2 km (Apps)' },
  { name: 'Alipiri / Tirumala Foot', lat: 13.6550, lng: 79.3900, tag: '13.5 km (Apps)' },
];

export const OrderOnlineModal: React.FC<OrderOnlineModalProps> = ({ 
  isOpen, 
  onClose,
  onNavigate,
}) => {
  useScrollLock(isOpen);

  // Mode: 'delivery' | 'takeaway'
  // Mode: 'delivery' | 'takeaway'
  const [orderMode, setOrderMode] = useState<'delivery' | 'takeaway'>('delivery');
  
  // Delivery distance & eligibility state (CRITICAL: distanceKm MUST be null, eligible MUST be false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(false);

  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<DeliveryVerificationResult | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [geoError, setGeoError] = useState<string | null>(null);

  // Helper to check and restore delivery_gps_cache from sessionStorage
  const checkAndRestoreGpsCache = (): boolean => {
    try {
      const cached = sessionStorage.getItem('delivery_gps_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const dist = typeof parsed.distanceKm === 'number' ? parsed.distanceKm : null;
        const isEligible = dist !== null && dist > 0 && dist <= 5.0 && Boolean(parsed.eligible);

        setDistanceKm(dist);
        setEligible(isEligible);
        setVerificationResult({
          eligible: isEligible,
          distanceKm: dist,
          roadKm: dist,
          mapsLink: parsed.mapsLink || '',
          source: 'cache',
        });

        if (dist !== null) {
          setLocationName(isEligible ? 'Your Verified Location' : 'Outside Delivery Radius');
        }
        return true;
      }
    } catch {}
    return false;
  };

  // Restore cached delivery status if available
  useEffect(() => {
    if (isOpen) {
      try {
        const savedMode = sessionStorage.getItem('vaibhav_order_mode');
        if (savedMode === 'takeaway') {
          setOrderMode('takeaway');
        }
        checkAndRestoreGpsCache();
      } catch {}
    }
  }, [isOpen]);

  // Handle GPS Auto-detect
  const handleDetectGPS = () => {
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationError(true);
      setGeoError('GPS location is not supported by your browser.');
      setDistanceKm(null);
      setEligible(false);
      setVerificationResult({
        eligible: false,
        distanceKm: null,
        roadKm: null,
        mapsLink: '',
        source: 'haversine',
      });
      sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: null, eligible: false }));
      sessionStorage.setItem('vaibhav_order_mode', 'outside');
      return;
    }

    setIsVerifying(true);
    setGeoError(null);

    let handled = false;
    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerOutsideState = (err?: GeolocationPositionError | { code: number; message: string }) => {
      if (handled) return;
      handled = true;
      if (watchdogTimer) clearTimeout(watchdogTimer);
      setIsVerifying(false);
      setLocationError(true);

      const code = err?.code;
      if (code === 1) {
        // PERMISSION_DENIED
        setGeoError('Location permission was denied. Switched to partner delivery & takeaway options below.');
      } else if (code === 2) {
        // POSITION_UNAVAILABLE
        setGeoError('Location unavailable (check GPS/network). Switched to partner delivery & takeaway options below.');
      } else if (code === 3) {
        // TIMEOUT
        setGeoError('GPS request timed out. Switched to partner delivery & takeaway options below.');
      } else {
        setGeoError('Unable to detect location. Switched to partner delivery & takeaway options below.');
      }

      setDistanceKm(null);
      setEligible(false);

      // Immediately trigger the "Outside 5km / Switch to Takeaway" UI state with eligible: false
      setVerificationResult({
        eligible: false,
        distanceKm: null,
        roadKm: null,
        mapsLink: '',
        source: 'haversine',
      });
      sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: null, eligible: false }));
      sessionStorage.setItem('vaibhav_order_mode', 'outside');
    };

    // Safety watchdog: Give full 15s to native GPS, trigger after 16s if browser freezes
    watchdogTimer = setTimeout(() => {
      triggerOutsideState({ code: 3, message: 'GPS watchdog timeout exceeded' });
    }, 16000);

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (handled) return;
          handled = true;
          if (watchdogTimer) clearTimeout(watchdogTimer);

          try {
            const { latitude, longitude } = pos.coords;
            setLocationName('Current GPS Location');
            const result = await verifyDeliveryDistance(latitude, longitude);
            const dist = typeof result.distanceKm === 'number' ? result.distanceKm : (typeof result.roadKm === 'number' ? result.roadKm : null);
            const isEligible = Boolean(result.eligible) && dist !== null && dist > 0 && dist <= 5.0;

            setDistanceKm(dist);
            setEligible(isEligible);
            setVerificationResult({
              ...result,
              eligible: isEligible,
              distanceKm: dist,
              roadKm: dist,
            });
            setLocationError(false);
            try {
              sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: dist, eligible: isEligible }));
              sessionStorage.setItem('vaibhav_delivery_geo', JSON.stringify(result));
              sessionStorage.setItem('vaibhav_order_mode', isEligible ? 'delivery' : 'outside');
            } catch {}
          } catch {
            triggerOutsideState({ code: 2, message: 'Could not verify distance' });
          } finally {
            setIsVerifying(false);
          }
        },
        (err) => {
          // Native PositionError codes: 1 (Permission Denied), 2 (Position Unavailable), 3 (Timeout)
          triggerOutsideState(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch {
      triggerOutsideState({ code: 2, message: 'Failed to access native geolocation' });
    }
  };

  // Handle Landmark Selection
  const handleSelectLandmark = async (landmark: typeof POPULAR_LANDMARKS[0]) => {
    setIsVerifying(true);
    setGeoError(null);
    setLocationError(false);
    setLocationName(landmark.name);

    try {
      const result = await verifyDeliveryDistance(landmark.lat, landmark.lng);
      const dist = typeof result.distanceKm === 'number' ? result.distanceKm : (typeof result.roadKm === 'number' ? result.roadKm : null);
      const isEligible = Boolean(result.eligible) && dist !== null && dist > 0 && dist <= 5.0;

      setDistanceKm(dist);
      setEligible(isEligible);
      setVerificationResult({
        ...result,
        eligible: isEligible,
        distanceKm: dist,
        roadKm: dist,
      });
      try {
        sessionStorage.setItem('delivery_gps_cache', JSON.stringify({ distanceKm: dist, eligible: isEligible }));
        sessionStorage.setItem('vaibhav_delivery_geo', JSON.stringify(result));
        sessionStorage.setItem('vaibhav_order_mode', isEligible ? 'delivery' : 'outside');
      } catch {}
    } catch {
      setGeoError('Distance check failed. Please try another landmark.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Manual Address Check
  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualAddress.trim().toLowerCase();
    if (!query) return;

    // Smart heuristic matching for Tirupati / Renigunta locations
    if (query.includes('tirupati') || query.includes('alipiri') || query.includes('chandragiri') || query.includes('svu') || query.includes('ruia')) {
      handleSelectLandmark({ name: manualAddress, lat: 13.6288, lng: 79.4192, tag: 'Tirupati' });
    } else if (query.includes('gajulamandyam') || query.includes('industrial') || query.includes('apiic')) {
      handleSelectLandmark({ name: manualAddress, lat: 13.6150, lng: 79.5190, tag: 'Gajulamandyam' });
    } else if (query.includes('karakambadi') || query.includes('settipalli') || query.includes('airport road')) {
      handleSelectLandmark({ name: manualAddress, lat: 13.6420, lng: 79.4750, tag: 'Karakambadi' });
    } else {
      // Default to Renigunta town center
      handleSelectLandmark({ name: manualAddress, lat: 13.6368, lng: 79.5039, tag: 'Renigunta' });
    }
  };

  // Proceed to Menu & Cart
  const handleProceedToMenu = () => {
    // Delivery check: strictly requires distanceKm > 0 and <= 5.0 and eligible === true
    if (orderMode === 'delivery') {
      if (distanceKm === null || distanceKm <= 0 || distanceKm > 5.0 || !eligible) {
        return;
      }
    }
    try {
      sessionStorage.setItem('vaibhav_order_mode', orderMode);
    } catch {}
    onClose();
    if (onNavigate) {
      onNavigate('/menu');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/menu';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-online-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs touch-none"
        />

        {/* Modal Window */}
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto overscroll-contain bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#2E4823]/20 z-10 text-[#1C1C1C]"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#213519] via-[#2E4823] to-[#1E3216] text-white p-5 sm:p-6 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Kitchen Ordering</span>
            </div>

            <h2 id="order-online-title" className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold tracking-tight">
              Order Online &amp; Save 25%+
            </h2>
            <p className="text-xs sm:text-sm text-white/85 mt-1 leading-relaxed">
              Enjoy real dine-in menu prices, ₹0 platform fees, and fresh food delivered straight from our stoves.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-4 grid grid-cols-2 p-1 rounded-xl bg-black/30 backdrop-blur-xs border border-white/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setOrderMode('delivery');
                  const restored = checkAndRestoreGpsCache();
                  if (!restored) {
                    setDistanceKm(null);
                    setEligible(false);
                    setVerificationResult(null);
                  }
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  orderMode === 'delivery'
                    ? 'bg-[#D3452B] text-white shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Home Delivery (5km)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderMode('takeaway');
                }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  orderMode === 'takeaway'
                    ? 'bg-[#2E4823] text-white shadow-md border border-amber-400/30'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Self-Pickup / Takeaway</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5">

            {/* ==================================================== */}
            {/* OPTION A: TAKEAWAY / SELF-PICKUP (100% ELIGIBLE)      */}
            {/* ==================================================== */}
            {orderMode === 'takeaway' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        100% Eligible Anywhere
                      </span>
                      <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-emerald-950 mt-1">
                        Self-Pickup at Vaibhav Grand, Renigunta
                      </h3>
                      <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                        Ready in <strong>20–25 minutes</strong> with zero wait time. Packaged hot in insulated eco-boxes with full 25%+ direct savings.
                      </p>
                      <div className="mt-2.5 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Plot 157, Ramana Vilas Circle, Renigunta</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Proceed CTA */}
                <button
                  type="button"
                  onClick={handleProceedToMenu}
                  className="btn-shimmer w-full py-3.5 px-4 rounded-2xl bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Proceed to Add Dishes to Cart →</span>
                </button>
              </div>
            )}

            {/* ==================================================== */}
            {/* OPTION B: HOME DELIVERY WITH REAL DISTANCE CHECK     */}
            {/* ==================================================== */}
            {orderMode === 'delivery' && (
              <div className="space-y-4">
                
                {/* 1. If not yet checked or verifying */}
                {!verificationResult && !isVerifying && (
                  <div className="space-y-4">
                    <div className="bg-[#F7F3EB] rounded-2xl p-4 border border-[#2E4823]/10">
                      <h3 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#2E4823] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#D3452B]" />
                        <span>Check Delivery to Your Location</span>
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        We deliver directly within <strong>5.0 km road driving distance</strong> from our kitchen with ₹0 platform fees and free delivery above ₹299.
                      </p>
                    </div>

                    {/* Auto-detect button */}
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="btn-shimmer w-full py-3.5 px-4 rounded-2xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-98"
                    >
                      <Navigation className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>Auto-Detect My Location (GPS)</span>
                    </button>

                    {geoError && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{geoError}</span>
                      </div>
                    )}

                    {/* Quick Landmark Chips */}
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Or select your nearest area:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {POPULAR_LANDMARKS.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handleSelectLandmark(item)}
                            className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-left transition-all text-xs flex flex-col justify-between shadow-2xs active:scale-95"
                          >
                            <span className="font-bold text-[#1C1C1C] line-clamp-1">{item.name}</span>
                            <span className="text-[10px] text-gray-500 mt-0.5">{item.tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Address Search */}
                    <form onSubmit={handleManualCheck} className="pt-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Or type your colony / street:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          placeholder="e.g. Karakambadi Road, Renigunta..."
                          className="flex-1 px-3.5 py-2 text-xs bg-white rounded-xl border border-gray-200 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#2E4823] text-white text-xs font-bold hover:bg-[#223719] transition-colors"
                        >
                          Check
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 2. Loading Spinner */}
                {isVerifying && (
                  <div className="py-10 text-center space-y-3 bg-white rounded-2xl border border-gray-200">
                    <RefreshCw className="w-8 h-8 text-[#2E4823] animate-spin mx-auto" />
                    <p className="text-sm font-bold text-[#2E4823]">
                      Calculating Road Distance...
                    </p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Checking real 5.0 km driving distance via OpenRouteService &amp; road maps.
                    </p>
                  </div>
                )}

                {/* 3. CASE 1: ELIGIBLE (strictly > 0 and <= 5.0 km) */}
                {!isVerifying &&
                  verificationResult &&
                  verificationResult.eligible &&
                  eligible &&
                  distanceKm !== null &&
                  distanceKm > 0 &&
                  distanceKm <= 5.0 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Delivery Confirmed
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              ~{distanceKm} km road distance
                            </span>
                          </div>
                          <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-emerald-950 mt-1">
                            Great News! You are within our Free Delivery Zone!
                          </h3>
                          <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                            {locationName ? <strong>{locationName}</strong> : 'Your location'} is eligible for direct doorstep delivery with zero aggregator markup.
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-emerald-800 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Free Delivery above ₹299</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>₹0 Platform Fees</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>₹0 Packaging Charge</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hot &amp; Fresh Kitchen Dispatch</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      type="button"
                      onClick={handleProceedToMenu}
                      disabled={distanceKm === null || distanceKm <= 0 || distanceKm > 5.0 || !eligible}
                      className="btn-shimmer w-full py-3.5 px-4 rounded-2xl bg-[#D3452B] hover:bg-[#BD3B22] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Proceed to Add Dishes to Cart →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVerificationResult(null);
                        setDistanceKm(null);
                        setEligible(false);
                        sessionStorage.removeItem('delivery_gps_cache');
                      }}
                      className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold text-center"
                    >
                      Check a different delivery location
                    </button>
                  </div>
                )}

                {/* 4. CASE 2: NOT ELIGIBLE (> 5.0 km) OR LOCATION ERROR */}
                {!isVerifying && verificationResult && !verificationResult.eligible && (
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-2xl p-4 sm:p-5 border border-red-200 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                          {locationError ? (
                            <>
                              <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-red-950 mt-0.5">
                                📍 Location Access Failed
                              </h3>
                              <p className="text-xs text-red-900 mt-1 leading-relaxed">
                                We couldn&apos;t detect your exact location. To proceed with Direct Delivery, please ensure your device GPS is turned on and location permissions are allowed for this browser.
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-800 bg-red-100 px-2 py-0.5 rounded">
                                  Outside 5.0 km Radius
                                </span>
                                <span className="text-xs font-mono font-bold text-red-700">
                                  ~{distanceKm ?? verificationResult.roadKm} km away
                                </span>
                              </div>
                              <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-red-950 mt-1">
                                Direct Doorstep Delivery Not Available
                              </h3>
                              <p className="text-xs text-red-900 mt-1 leading-relaxed">
                                To ensure our Biryanis, Mandis, and sizzling tandoori items arrive piping-hot and fresh from our clay ovens, our direct kitchen fleet delivers strictly within <strong>5.0 km road distance</strong> from Renigunta.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Solutions & Options */}
                    <div className="bg-[#F7F3EB] rounded-2xl p-4 border border-[#2E4823]/10 space-y-3">
                      <span className="text-xs font-bold text-[#2E4823] block uppercase tracking-wider">
                        How you can still enjoy our food:
                      </span>

                      {/* Solution 1: Swiggy & Zomato (Extended delivery) */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">
                          1. <strong>Order via Swiggy or Zomato</strong> (Food delivery apps cover longer distances across Tirupati &amp; surrounding areas):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={SWIGGY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <span className="w-4 h-4 rounded-full bg-white text-[#FC8019] flex items-center justify-center font-bold text-[9px]">
                              S
                            </span>
                            <span>Order on Swiggy</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <a
                            href={ZOMATO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <span className="w-4 h-4 rounded-full bg-white text-[#E23744] flex items-center justify-center font-bold text-[9px]">
                              Z
                            </span>
                            <span>Order on Zomato</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Solution 2: Switch to Takeaway */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">
                          2. <strong>Switch to Self-Pickup &amp; Save 25%+</strong> (No distance restrictions! Pick up freshly packed hot food yourself):
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderMode('takeaway');
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                          <span>Switch to Takeaway &amp; Order Direct</span>
                        </button>
                      </div>

                      {/* Solution 3: Large Catering / Party Delivery */}
                      <div className="pt-2 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-600">
                          3. Need a large party or catering order delivered beyond 5 km?
                        </p>
                        <a
                          href={`tel:${RESTAURANT_INFO.phone}`}
                          className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#D3452B] hover:underline font-bold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Kitchen for Bulk Catering: {RESTAURANT_INFO.phone}</span>
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setVerificationResult(null);
                        setDistanceKm(null);
                        setEligible(false);
                        sessionStorage.removeItem('delivery_gps_cache');
                      }}
                      className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold text-center"
                    >
                      ← Check a different location
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Halal Cuts • Transparent Dine-In Rates • WhatsApp Real-Time Tracking</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
