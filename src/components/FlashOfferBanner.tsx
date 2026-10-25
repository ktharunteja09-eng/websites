import React, { useState, useEffect } from 'react';
import { StoreOffer } from '../types';
import { fetchStoreOffer } from '../utils/supabaseClient';
import { Flame, Clock, Sparkles, X, ArrowRight } from 'lucide-react';

interface FlashOfferBannerProps {
  onOfferLoaded?: (offer: StoreOffer) => void;
  onExploreOffers?: () => void;
}

export const FlashOfferBanner: React.FC<FlashOfferBannerProps> = ({
  onOfferLoaded,
  onExploreOffers,
}) => {
  const [offer, setOffer] = useState<StoreOffer | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOffer() {
      const data = await fetchStoreOffer();
      if (!isMounted) return;
      setOffer(data);
      if (onOfferLoaded) onOfferLoaded(data);

      const expires = new Date(data.expires_at).getTime();
      const now = Date.now();
      if (expires <= now) {
        setIsExpired(true);
      }
    }

    loadOffer();
    return () => {
      isMounted = false;
    };
  }, []);

  // Live Countdown Timer
  useEffect(() => {
    if (!offer || !offer.is_active || typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;

    const updateTimer = () => {
      const expiresAt = new Date(offer.expires_at).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
      setTimeLeft(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [offer]);

  if (!offer || !offer.is_active || isExpired || isDismissed) {
    return null;
  }

  const handleBannerClick = () => {
    if (onExploreOffers) {
      onExploreOffers();
    } else {
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <aside
      aria-label="Limited time flash offer"
      className="w-full bg-gradient-to-r from-[#FF5722] via-[#D32F2F] to-[#E64A19] text-white shadow-xs border-b border-black/20 transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* ======================================================== */}
        {/* 1. MOBILE VIEW (sm:hidden): Compact High-Impact Hook     */}
        {/* ======================================================== */}
        <div className="flex sm:hidden items-center justify-between gap-2 py-2">
          <button
            type="button"
            onClick={handleBannerClick}
            className="flex items-center gap-1.5 min-w-0 flex-1 text-left active:opacity-80"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">
                🔥 Flash Sale: <span className="font-medium text-amber-100">{offer.banner_text}</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] text-amber-200 font-mono font-semibold mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>Ends in {timeLeft || 'Ending soon'}</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleBannerClick}
              className="px-2.5 py-1 rounded-full bg-white text-[#D32F2F] font-extrabold text-[10px] hover:bg-amber-50 active:scale-95 transition-all shadow-xs flex items-center gap-0.5"
            >
              <span>Order</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="w-5 h-5 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
              title="Dismiss offer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. DESKTOP & TABLET VIEW (hidden sm:flex)                */}
        {/* ======================================================== */}
        <div className="hidden sm:flex items-center justify-between gap-4 py-2 sm:py-2.5">
          <button
            type="button"
            onClick={handleBannerClick}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
          >
            <p className="font-bold text-xs md:text-sm text-white tracking-wide truncate group-hover:underline">
              🔥 Flash Sale: <span className="font-semibold text-amber-100">{offer.banner_text}</span>{' '}
              <span className="text-amber-200 font-mono font-bold ml-1.5">
                Ends in {timeLeft || 'Ending soon'}
              </span>
            </p>
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleBannerClick}
              className="inline-flex items-center gap-1 bg-white text-[#D32F2F] hover:bg-amber-100 font-bold text-xs px-3.5 py-1 rounded-full transition-colors shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-[#D32F2F]" />
              <span>Claim Offer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
