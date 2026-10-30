import React, { useState, useEffect, useRef } from 'react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { WHATSAPP_NUMBER } from '../utils/supabaseClient';
import {
  Menu,
  X,
  Calendar,
  Utensils,
  Phone,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TopUtilityBar } from './TopUtilityBar';
import { BrandEmblem } from './BrandEmblem';
import { useScrollLock } from '../utils/scrollLock';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenOrderModal,
  onOpenBookModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);

  // Lock all background scrolling and pause Lenis when mobile drawer is open
  useScrollLock(mobileMenuOpen);

  // Smooth GPU-accelerated scroll interpolation for desktop navbar (0px -> 100px)
  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;
    let rafId: number | null = null;
    let lastProgress = -1;
    let lastScrolled = window.scrollY > 50;

    const updateScroll = () => {
      const scrollY = window.scrollY;
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop && headerRef.current) {
        // Smoothly interpolate progress from 0 (at 0px) to 1 (at 100px)
        const progress = Math.min(Math.max(scrollY / 100, 0), 1);

        if (progress !== lastProgress) {
          lastProgress = progress;

          // Warm cream off-white background (#FDFBF7): smoothly interpolates from 0.92 to 0.98 opacity
          const alpha = 0.92 + progress * 0.06;
          headerRef.current.style.backgroundColor = `rgba(253, 251, 247, ${alpha.toFixed(3)})`;

          // Interpolate backdrop blur: 8px -> 16px
          const blurPx = 8 + progress * 8;
          const blurVal = `blur(${blurPx.toFixed(1)}px)`;
          headerRef.current.style.backdropFilter = blurVal;
          (headerRef.current.style as unknown as Record<string, string>)['webkitBackdropFilter'] = blurVal;

          // Interpolate shadow and subtle hairline border
          headerRef.current.style.boxShadow =
            progress > 0.05
              ? `0 4px 20px rgba(46, 72, 35, ${(progress * 0.08).toFixed(3)})`
              : 'none';
          headerRef.current.style.borderBottomColor = `rgba(46, 72, 35, ${(0.08 + progress * 0.06).toFixed(3)})`;

          // Subtle padding compression on scroll
          const padY = 10 - progress * 3;
          headerRef.current.style.paddingTop = `${padY.toFixed(1)}px`;
          headerRef.current.style.paddingBottom = `${padY.toFixed(1)}px`;

          // Subtly scale logo on scroll
          if (logoRef.current) {
            const logoScale = 1 - progress * 0.06;
            logoRef.current.style.transform = `scale(${logoScale.toFixed(3)})`;
            logoRef.current.style.transformOrigin = 'left center';
          }
        }
      } else if (headerRef.current) {
        // Reset inline overrides on mobile so responsive Tailwind classes control mobile nav 100%
        if (lastProgress !== -1) {
          lastProgress = -1;
          headerRef.current.style.backgroundColor = '';
          headerRef.current.style.backdropFilter = '';
          (headerRef.current.style as unknown as Record<string, string>)['webkitBackdropFilter'] = '';
          headerRef.current.style.boxShadow = '';
          headerRef.current.style.borderBottomColor = '';
          headerRef.current.style.paddingTop = '';
          headerRef.current.style.paddingBottom = '';
          if (logoRef.current) {
            logoRef.current.style.transform = '';
            logoRef.current.style.transformOrigin = '';
          }
        }
      }

      // Update isScrolled boolean around midpoint threshold (50px) to transition text colors
      const nextScrolled = scrollY > 50;
      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setIsScrolled(nextScrolled);
      }
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateScroll();
      });
    };

    // Run on initial mount
    updateScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);



  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Menu', page: 'menu' },
    { label: 'About Us', page: 'about' },
    { label: 'Catering & Events', page: 'catering' },
    { label: 'Photo Gallery', page: 'gallery' },
    { label: 'Contact & Hours', page: 'contact' },
  ];

  const mobileNavLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Menu', page: 'menu' },
    { label: 'About Us', page: 'about' },
    { label: 'Catering & Events', page: 'catering' },
    { label: 'Photo Gallery', page: 'gallery' },
    { label: 'Reviews', page: 'reviews' },
    { label: 'Contact & Location', page: 'contact' },
  ];

  const handleLinkClick = (page: string) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {/* Skip to main content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2E4823] focus:text-[#FDFBF7] focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* 2. Main Navigation Header (Red Onion NYC Exact Header Style) */}
      <div
        id="navbar-header"
        ref={headerRef}
        className={`w-full transition-colors duration-200 ease-in-out bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#2E4823]/10 text-[#1C1C1C] ${
          isScrolled
            ? 'shadow-[0_4px_20px_rgba(46,72,35,0.08)] py-1.5 sm:py-2'
            : 'py-2 sm:py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo - Master Emblem & Wordmark */}
          <button
            ref={logoRef}
            type="button"
            onClick={() => handleLinkClick('home')}
            id="nav-brand-logo"
            className="group flex items-center focus:outline-none text-left py-0.5"
            aria-label="Vaibhav Grand Family Restaurant Home"
          >
            <img
              src="/assets/images/vaibhav-grand-logo-red.png"
              alt="Vaibhav Grand Family Restaurant Logo"
              width={1766}
              height={866}
              fetchPriority="high"
              className="h-13 sm:h-16 md:h-18 lg:h-20 xl:h-[84px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none drop-shadow-sm"
            />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-5 2xl:space-x-7" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleLinkClick(link.page)}
                  className={`relative py-1 text-sm font-medium transition-colors duration-200 group focus:outline-none ${
                    isActive
                      ? 'text-[#D3452B] font-bold'
                      : 'text-[#1C1C1C] hover:text-[#2E4823]'
                  }`}
                >
                  {link.label}
                  {/* Active Indicator Underline */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] transition-transform duration-300 ease-out ${
                      isActive
                        ? 'bg-[#D3452B] scale-x-100'
                        : 'bg-[#D3452B] scale-x-0 group-hover:scale-x-100 origin-left'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Action CTAs: Call to Book + Order Online Dropdown (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Call to Book Button */}
            <button
              type="button"
              onClick={onOpenBookModal}
              className="btn-md font-bold rounded-full border border-[#2E4823]/30 text-[#2E4823] hover:bg-[#2E4823] hover:text-white bg-white/40 transition-all"
            >
              <Calendar className="w-[18px] h-[18px] text-[#D3452B]" />
              <span>Call to Book</span>
            </button>

            {/* Order Online Button */}
            <button
              type="button"
              id="navbar-order-online-btn"
              aria-label="Order Online from Vaibhav Grand Kitchen"
              onClick={onOpenOrderModal}
              className="btn-shimmer btn-md bg-[#D3452B] hover:bg-[#BD3B22] text-[#FDFBF7] font-semibold rounded-full shadow-[0_4px_14px_rgba(211,69,43,0.3)] hover:shadow-[0_6px_20px_rgba(211,69,43,0.4)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
            >
              <span>Order Online</span>
            </button>
          </div>

          {/* Mobile Actions: Order Button + Direct Call + Hamburger (Red Onion NYC Exact Header Pattern) */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:hidden">
            {/* Quick Order Pill Button */}
            <button
              type="button"
              id="mobile-order-button-nav"
              onClick={onOpenOrderModal}
              className="btn-sm bg-gradient-to-r from-[#D3452B] to-[#E04C32] hover:brightness-110 text-white font-bold tracking-wider uppercase rounded-full shadow-[0_2px_10px_rgba(211,69,43,0.35)] active:scale-95 transition-all"
            >
              <span>Order</span>
            </button>

            {/* Quick Call Icon Button */}
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              id="mobile-call-button-nav"
              aria-label={`Call Vaibhav Grand at ${RESTAURANT_INFO.phone}`}
              className="btn-icon rounded-full border border-[#2E4823]/20 text-[#2E4823] hover:border-[#D3452B] hover:text-[#D3452B] bg-white/80 transition-all duration-200 active:scale-90"
            >
              <Phone className="w-5 h-5" />
            </a>

            {/* Tactile Hamburger Menu Button */}
            <button
              type="button"
              id="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              className="btn-icon rounded-full border border-[#2E4823]/20 text-[#1C1C1C] hover:text-[#D3452B] hover:border-[#D3452B] bg-white/80 transition-all duration-200 active:scale-90 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#D3452B]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Red Onion NYC Exact Mobile Side Drawer & Backdrop Overlay (Rendered outside header to prevent stacking context trap) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] xl:hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm touch-none"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'tween',
                ease: [0.32, 0.72, 0, 1],
                duration: 0.4,
              }}
              className="fixed top-0 right-0 w-[310px] sm:w-[350px] max-w-[88vw] bg-[#0E0E0E] text-[#FDFBF7] z-[100] flex flex-col overflow-hidden shadow-[-10px_0_35px_rgba(0,0,0,0.85)] border-l border-white/10 overscroll-contain"
              style={{ height: '100dvh' }}
            >
              {/* Left edge gold vertical accent line */}
              <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-[#D3452B]/60 to-transparent pointer-events-none" />

              {/* Drawer Top Header: Logo + Close Button */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => handleLinkClick('home')}
                  className="flex items-center text-left focus:outline-none group py-0.5"
                  aria-label="Vaibhav Grand Family Restaurant Home"
                >
                  <img
                    src="/assets/images/vaibhav-grand-logo-red.png"
                    alt="Vaibhav Grand Family Restaurant Logo"
                    width={1766}
                    height={866}
                    className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform select-none"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="btn-icon rounded-full border border-white/20 hover:border-amber-400 text-gray-300 hover:text-amber-400 transition-all duration-200 active:scale-90 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gold gradient divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent flex-shrink-0" />

              {/* Drawer Scrollable Navigation Links (Exact Red Onion NYC Structure, Compact & Optimized) */}
              <nav
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-2 space-y-0 divide-y divide-white/5"
                style={{ WebkitOverflowScrolling: 'touch' }}
                aria-label="Mobile Navigation Links"
              >
                {mobileNavLinks.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => handleLinkClick(item.page)}
                      className={`w-full flex items-center justify-between py-2.5 sm:py-3 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-200 group text-left focus:outline-none ${
                        isActive
                          ? 'text-amber-400 font-bold'
                          : 'text-gray-200 hover:text-amber-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`h-[2px] transition-all duration-300 ${
                          isActive
                            ? 'w-4 bg-amber-400'
                            : 'w-0 group-hover:w-3 bg-amber-400/60'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Quick Action Buttons (Red Onion NYC Style CTAs) */}
              <div className="px-5 py-3.5 space-y-2.5 border-t border-white/10 flex-shrink-0 bg-[#121212]">
                {/* Reserve / Call to Book */}
                <button
                  type="button"
                  id="drawer-book-table-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBookModal();
                  }}
                  className="btn-md w-full !px-3 rounded-xl text-white font-bold !text-xs tracking-wider uppercase bg-gradient-to-r from-[#2E4823] to-[#3B5B2E] border border-emerald-500/30 shadow-[0_4px_16px_rgba(46,72,35,0.4)] active:scale-[0.98] transition-all"
                >
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Reserve Table / Call</span>
                </button>

                {/* Order Online */}
                <button
                  type="button"
                  id="drawer-order-online-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOrderModal();
                  }}
                  className="btn-md w-full !px-2 rounded-xl text-white font-bold !text-[11px] sm:!text-xs !gap-1.5 tracking-wide uppercase bg-gradient-to-r from-[#D3452B] to-[#E04C32] shadow-[0_4px_16px_rgba(211,69,43,0.35)] active:scale-[0.98] transition-all"
                >
                  <Utensils className="w-4 h-4 shrink-0" />
                  <span>Order Online (Swiggy / Zomato)</span>
                </button>

                {/* Direct WhatsApp Quick Chat */}
                <a
                  href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Hi%2C%20I%27d%20like%20to%20reserve%20a%20table%20%2F%20order%20food%20at%20Vaibhav%20Grand`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="drawer-whatsapp-btn"
                  className="btn-md w-full !px-3 rounded-xl text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 font-bold !text-[11px] sm:!text-xs tracking-wider uppercase transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp Quick Enquiry</span>
                </a>
              </div>

              {/* Drawer Footer: Phone, Status, Address, Socials (Exact Red Onion NYC Info section) */}
              <div
                className="px-5 pt-3 pb-4 border-t border-white/10 flex-shrink-0 space-y-2 bg-[#0A0A0A] text-gray-400"
                style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }}
              >
                {/* Phone & Status Badge */}
                <div className="flex items-center justify-between text-xs">
                  <a
                    href={`tel:${RESTAURANT_INFO.phone}`}
                    className="flex items-center gap-1.5 hover:text-amber-400 transition-colors text-white font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D3452B] shrink-0" />
                    <span>{RESTAURANT_INFO.phone}</span>
                  </a>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                    Open: 12PM–11PM
                  </span>
                </div>

                {/* Physical Location */}
                <div className="flex items-start gap-1.5 text-[11px] text-gray-400 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Plot 157, Ramana Vilas Circle, Renigunta, AP 517520</span>
                </div>

                {/* Email & Social Links */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                  <a
                    href={`mailto:${RESTAURANT_INFO.email}`}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Mail className="w-3 h-3 text-[#D3452B]" />
                    <span>{RESTAURANT_INFO.email}</span>
                  </a>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={RESTAURANT_INFO.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-gray-400 hover:text-amber-400 transition-colors p-0.5"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={RESTAURANT_INFO.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-gray-400 hover:text-amber-400 transition-colors p-0.5"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
