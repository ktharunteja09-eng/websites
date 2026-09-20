import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES, RESTAURANT_INFO } from '../data/restaurantData';
import { Phone, ChevronDown, Utensils, Star, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from './SmoothScrollProvider';

export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  // Auto crossfade every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Preload images so there's never a blank flash
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  // Subtle parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close order dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOrderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDish = HERO_SLIDES[currentIndex];

  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#1C1C1C]"
      aria-label="Restaurant Hero Introduction"
    >
      {/* Rotating Background Images with 1.2s smooth ease-in-out crossfade & subtle parallax */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.25}px)`,
          transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1200 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.altText}
                loading={index === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-7000 ease-out select-none"
                style={{
                  objectFit: 'cover',
                  transform: isActive ? 'scale(1.06)' : 'scale(1.0)'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 40% Dark Overlay (rgba(0,0,0,0.40)) with slight radial depth to guarantee optimal readability */}
      <div
        className="absolute inset-0 z-15 bg-black/45 backdrop-brightness-95 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.60) 100%)'
        }}
      />

      {/* Fixed Foreground Content — Staggered Fade-in & Slide-up on Load */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white flex flex-col items-center">
        
        {/* Heritage Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FDFBF7] text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-4 shadow-md"
        >
          <Star className="w-3.5 h-3.5 text-[#D3452B] fill-[#D3452B]" />
          <span>Renigunta • Tirupati Dining Milestone</span>
        </motion.div>

        {/* Centered Bold H1: Authentic Flavor, Fresh Ingredients */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="font-['Playfair_Display'] text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.15] drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
        >
          Authentic Flavor, Fresh Ingredients
        </motion.h1>

        {/* Supporting Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="mt-5 text-lg sm:text-xl lg:text-2xl text-[#FDFBF7]/95 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        >
          Mughlai Delicacies • Arabian Mandi Platters • Chicken Dum Biryani • Clay Oven Tandoor
        </motion.p>

        {/* Location & Hours Micro-bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#FDFBF7]/80"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Open Daily: 12:00 PM – 11:00 PM
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Near Ramana Vilas Circle, Srikalahasthi Road</span>
        </motion.div>

        {/* CTA Buttons: Staggered entrance, smooth hover scale (1.04x) & shadow lift */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Reserve a Table Button (Calls 7947142432) */}
          <a
            href="tel:7947142432"
            id="hero-reserve-btn"
            className="w-full sm:w-auto min-w-[200px] min-h-[50px] px-8 py-3.5 rounded-full bg-[#2E4823] hover:bg-[#233719] text-[#FDFBF7] font-semibold text-base shadow-[0_4px_16px_rgba(46,72,35,0.4)] hover:shadow-[0_8px_24px_rgba(46,72,35,0.5)] transition-all duration-200 transform hover:scale-[1.04] active:scale-[0.98] flex items-center justify-center gap-2.5 border border-white/20 focus:outline-none"
          >
            <Phone className="w-5 h-5 text-[#FDFBF7]" />
            <span>Reserve a Table</span>
          </a>

          {/* Order Online Button (Opens Dropdown) */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              type="button"
              id="hero-order-btn"
              aria-expanded={orderDropdownOpen}
              aria-haspopup="true"
              onClick={() => setOrderDropdownOpen((prev) => !prev)}
              className="w-full sm:w-auto min-w-[200px] min-h-[50px] px-8 py-3.5 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-semibold text-base shadow-[0_4px_16px_rgba(211,69,43,0.4)] hover:shadow-[0_8px_26px_rgba(211,69,43,0.55)] transition-all duration-200 transform hover:scale-[1.04] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none"
            >
              <Utensils className="w-5 h-5" />
              <span>Order Online</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${orderDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            <AnimatePresence>
              {orderDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-[#2E4823]/10 p-3 z-30 text-[#1C1C1C]"
                  role="menu"
                >
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 border-b border-gray-100">
                    Choose Delivery Platform
                  </div>

                  <a
                    href={RESTAURANT_INFO.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 my-1.5 rounded-xl hover:bg-[#F7F3EB] transition-colors group"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        S
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 group-hover:text-[#D3452B]">Swiggy Delivery</div>
                        <div className="text-xs text-gray-500">Live tracker &amp; discounts</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#D3452B]" />
                  </a>

                  <a
                    href={RESTAURANT_INFO.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F7F3EB] transition-colors group"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#E23744] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        Z
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 group-hover:text-[#D3452B]">Zomato Delivery</div>
                        <div className="text-xs text-gray-500">Full menu &amp; quick order</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#D3452B]" />
                  </a>

                  <div className="mt-2 pt-2 border-t border-gray-100 px-3 py-1 text-center">
                    <span className="text-xs text-gray-600 block">
                      Prefer to pick up? Call{' '}
                      <a href="tel:7947142432" className="text-[#2E4823] font-bold hover:underline">
                        7947142432
                      </a>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dish Name & Subtitle Indicator of Current Rotating Slide with Category Pill */}
        <motion.div
          key={currentDish.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-white/90 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D3452B] animate-pulse" />
            <span className="text-white/60 font-medium">{currentDish.category || 'Featured Special'}:</span>
            <span className="font-semibold text-[#FDFBF7] tracking-wide">{currentDish.title}</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="hidden sm:inline text-xs text-[#FDFBF7]/75 italic max-w-xs truncate">
            {currentDish.subtitle}
          </span>
        </motion.div>

        {/* 5 Slide Indicators with Interactive Click to Preview */}
        <div
          className="mt-4 flex items-center justify-center gap-2.5 z-20"
          role="tablist"
          aria-label="Hero background rotation indicators"
        >
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View slide ${index + 1}: ${slide.title}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ease-out focus:outline-none ${
                  isActive
                    ? 'w-9 bg-[#FDFBF7] shadow-md ring-2 ring-[#D3452B]/80'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>

        {/* Butter Smooth Scroll Prompt */}
        <motion.button
          type="button"
          onClick={() => scrollTo('#why-us', { offset: -70, duration: 1.2 })}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 hidden sm:inline-flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer group focus:outline-none"
          aria-label="Scroll down to explore menu and specialties"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-white/75 group-hover:text-white transition-colors">
            Scroll to Explore
          </span>
          <div className="w-5 h-8 rounded-full border border-white/40 group-hover:border-white/80 flex items-start justify-center p-1 transition-colors">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-[#D3452B]"
            />
          </div>
        </motion.button>
      </div>
    </section>
  );
};
