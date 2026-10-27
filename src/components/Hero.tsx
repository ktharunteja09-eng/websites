import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES } from '../data/restaurantData';
import { Utensils, Star, BookOpen, ArrowRight } from 'lucide-react';
import { useLenis } from './SmoothScrollProvider';

interface HeroProps {
  onOpenBookModal?: () => void;
  onOpenOrderModal: () => void;
  onNavigate?: (page: string) => void;
  onOpenCompareModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenOrderModal, 
  onNavigate,
  onOpenCompareModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesReady, setSlidesReady] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  // Load slides 2 to 4/5 only after the page is interactive (defer non-critical images)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const enableOtherSlides = () => {
      setSlidesReady(true);
    };

    if ('requestIdleCallback' in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(enableOtherSlides, { timeout: 3000 });
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        }
      };
    } else {
      const timer = setTimeout(enableOtherSlides, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto crossfade every 5 seconds once slides 2+ are loaded
  useEffect(() => {
    if (!slidesReady) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesReady]);

  // Butter-smooth compositor parallax using requestAnimationFrame
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (parallaxRef.current && window.scrollY <= window.innerHeight) {
          parallaxRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.2}px, 0)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const firstSlide = HERO_SLIDES[0];
  const currentDish = HERO_SLIDES[currentIndex];

  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#1C1C1C]"
      aria-label="Restaurant Hero Introduction"
    >
      {/* Background Images with smooth crossfade & hardware-accelerated parallax */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
      >
        {/* Slide 1: Direct in pre-rendered HTML, eager, high priority, responsive srcset */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            currentIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src="/assets/images/chicken_mandi_hero_1080w.webp"
            srcSet="/assets/images/chicken_mandi_hero_640w.webp 640w, /assets/images/chicken_mandi_hero_1080w.webp 1080w, /assets/images/chicken_mandi_hero_1400w.webp 1400w"
            sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1400px"
            alt={firstSlide.altText}
            width={1080}
            height={603}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center select-none"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Slides 2 to 5: Loaded lazily only after the page is interactive */}
        {slidesReady &&
          HERO_SLIDES.slice(1).map((slide, idx) => {
            const index = idx + 1;
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.altText}
                  width={1080}
                  height={603}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center select-none"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            );
          })}
      </div>

      {/* Dark Overlay with radial vignette for contrast */}
      <div
        className="absolute inset-0 z-15 bg-black/55 backdrop-brightness-95 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Foreground Content: Rendered directly in HTML without opacity-0 animation delays */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white flex flex-col items-center">
        
        {/* Heritage Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FDFBF7] text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-4 shadow-md">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Renigunta • Tirupati Family Dining Landmark</span>
        </div>

        {/* Centered Bold Title (LCP critical element - immediately visible at opacity 1) */}
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.12] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          Authentic Flavor, Fresh Ingredients
        </h1>

        {/* Supporting Subtext */}
        <p className="mt-5 text-base sm:text-xl lg:text-2xl text-[#FDFBF7]/95 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          Renigunta&rsquo;s favorite family restaurant for Mandi, biryani &amp; Mughlai dining &mdash; serving Tirupati and surrounding areas
        </p>

        {/* Location & Hours Micro-bar */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#FDFBF7]/85">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Open Daily: 10:30 AM – 11:00 PM
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Plot 157, Ramana Vilas Circle, Renigunta</span>
        </div>

        {/* Call to Action Buttons: Direct Order & View Menu */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {/* Order Online Button (Primary Conversion CTA) */}
          <button
            type="button"
            id="hero-order-btn"
            onClick={onOpenOrderModal}
            className="btn-shimmer btn-lg relative w-full sm:w-auto rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold shadow-[0_4px_20px_rgba(211,69,43,0.55)] hover:shadow-[0_8px_28px_rgba(211,69,43,0.7)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            <Utensils className="w-5 h-5" />
            <span>Order Online</span>
            <span className="ml-1 text-[10px] font-extrabold uppercase bg-amber-400 text-[#1C1C1C] px-2 py-0.5 rounded-full shadow-xs tracking-wider">
              Save 25%+
            </span>
          </button>

          {/* View Menu Button */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('menu') : scrollTo('#menu', { offset: -70, duration: 1.15 })}
            id="hero-menu-btn"
            className="btn-lg w-full sm:w-auto rounded-full bg-white/15 hover:bg-white/25 text-white font-bold backdrop-blur-md border border-white/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-white" />
            <span>View Full Menu</span>
          </button>
        </div>

        {/* Direct Order Trust & Savings Strip */}
        <div className="mt-6 w-full max-w-2xl bg-black/50 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-[#D3452B] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Order Direct &amp; Save ₹150–₹250+
                </span>
                <span className="text-[10px] bg-emerald-500/90 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Zero App Markup
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">
                ₹0 Platform Fees • Real Dine-In Menu Prices • Free 5km Delivery above ₹299
              </p>
            </div>
          </div>

          {onOpenCompareModal && (
            <button
              type="button"
              onClick={onOpenCompareModal}
              className="btn-sm shrink-0 w-full sm:w-auto rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white border border-amber-400/40 font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span>Compare Prices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hero Slider Dots & Active Slide Name */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-white/70 font-medium tracking-wide">
            Now Showing: <strong className="text-white">{currentDish.category}</strong>
          </span>
        </div>

      </div>
    </section>
  );
};
