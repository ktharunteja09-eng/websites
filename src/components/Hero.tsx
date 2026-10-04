import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES, RESTAURANT_INFO } from '../data/restaurantData';
import { Phone, ChevronDown, Utensils, Star, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from './SmoothScrollProvider';

interface HeroProps {
  onOpenBookModal: () => void;
  onOpenOrderModal: () => void;
  onNavigate?: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBookModal, onOpenOrderModal, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  // Auto crossfade every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Preload all slides immediately in memory
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  // Butter-smooth, zero-React-re-render compositor parallax using requestAnimationFrame
  useEffect(() => {
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
      {/* Rotating Background Images with smooth crossfade & hardware-accelerated parallax */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
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
                width={1920}
                height={1080}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading="eager"
                decoding="async"
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

      {/* Dark Overlay with radial vignette for contrast */}
      <div
        className="absolute inset-0 z-15 bg-black/55 backdrop-brightness-95 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%)'
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white flex flex-col items-center">
        
        {/* Heritage Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FDFBF7] text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-4 shadow-md"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Renigunta • Tirupati Family Dining Landmark</span>
        </motion.div>

        {/* Centered Bold Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="font-['Playfair_Display'] text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.12] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
        >
          Authentic Flavor, Fresh Ingredients
        </motion.h1>

        {/* Supporting Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="mt-5 text-base sm:text-xl lg:text-2xl text-[#FDFBF7]/95 max-w-2xl font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          Renigunta&rsquo;s favorite family restaurant for Mandi, biryani &amp; Mughlai dining &mdash; serving Tirupati and surrounding areas
        </motion.p>

        {/* Location & Hours Micro-bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#FDFBF7]/85"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Open Daily: 12:00 PM – 11:00 PM
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Plot 157, Ramana Vilas Circle, Renigunta</span>
        </motion.div>

        {/* 3 Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          {/* Call to Book Table Button */}
          <button
            type="button"
            onClick={onOpenBookModal}
            id="hero-reserve-btn"
            className="btn-shimmer w-full sm:w-auto min-w-[180px] min-h-[50px] px-7 py-3.5 rounded-full bg-[#2E4823] hover:bg-[#233719] text-[#FDFBF7] font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(46,72,35,0.5)] hover:shadow-[0_8px_24px_rgba(46,72,35,0.6)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 border border-white/20 focus:outline-none"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Call to Book</span>
          </button>

          {/* View Menu Button */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('menu') : scrollTo('#menu', { offset: -70, duration: 1.15 })}
            id="hero-menu-btn"
            className="w-full sm:w-auto min-w-[180px] min-h-[50px] px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-md border border-white/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-white" />
            <span>View Full Menu</span>
          </button>

          {/* Order Online Button */}
          <button
            type="button"
            id="hero-order-btn"
            onClick={onOpenOrderModal}
            className="btn-shimmer w-full sm:w-auto min-w-[180px] min-h-[50px] px-7 py-3.5 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(211,69,43,0.5)] hover:shadow-[0_8px_26px_rgba(211,69,43,0.65)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none"
          >
            <Utensils className="w-4 h-4" />
            <span>Order Online</span>
          </button>
        </motion.div>

        {/* Hero Slider Dots & Active Slide Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full ${
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
        </motion.div>

      </div>
    </section>
  );
};
