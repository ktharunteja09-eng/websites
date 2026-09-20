import React, { useState, useEffect, useRef } from 'react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { Menu, X, ChevronDown, ExternalLink, Phone } from 'lucide-react';
import { useLenis } from './SmoothScrollProvider';
import { TopUtilityBar } from './TopUtilityBar';

interface NavbarProps {
  onOpenOrderModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      // Transition past hero or 80px scroll
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOrderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Menu', href: '#menu' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Specialties', href: '#specialties' },
    { label: 'About', href: '#about' },
    { label: 'Events & Catering', href: '#catering' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollTo(href, { offset: -70, duration: 1.15 });
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

      {/* 1. Thin Utility Bar ABOVE main navigation (dark background, small text, not sticky) */}
      <TopUtilityBar />

      {/* 2. Main Navigation Header (sticks at top-0 as user scrolls) */}
      <header
        id="navbar-header"
        className={`sticky top-0 z-40 transition-all duration-200 ease-in-out ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-3.5 border-b border-[#2E4823]/10 text-[#1C1C1C]'
            : 'bg-[#1C1C1C]/90 sm:bg-[#1C1C1C]/80 backdrop-blur-md py-4 text-white border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark (Text-based only in Playfair Display, no icon/mark) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0, { duration: 1.2 });
            }}
            id="nav-brand-logo"
            className="group flex flex-col focus:outline-none"
          >
            <span
              className={`font-['Playfair_Display'] text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-200 ${
                isScrolled ? 'text-[#2E4823]' : 'text-[#FDFBF7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
              }`}
            >
              Vaibhav Grand
            </span>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium transition-colors duration-200 ${
                isScrolled ? 'text-[#2E4823]/70' : 'text-[#FDFBF7]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
              }`}
            >
              Family Restaurant • Renigunta
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 lg:space-x-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`relative py-1 text-sm lg:text-base font-medium transition-colors duration-200 group focus:outline-none ${
                  isScrolled
                    ? 'text-[#1C1C1C] hover:text-[#2E4823]'
                    : 'text-[#FDFBF7] hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                }`}
              >
                {link.label}
                {/* Animated underline that slides in on hover */}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D3452B] scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Right Action CTA: Order Online Dropdown */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="tel:7947142432"
              className={`text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors ${
                isScrolled ? 'text-[#2E4823] hover:bg-[#2E4823]/5' : 'text-white hover:bg-white/10'
              }`}
              title="Call for reservation: 7947142432"
            >
              <Phone className="w-4 h-4 text-[#D3452B]" />
              <span className="hidden lg:inline">7947142432</span>
            </a>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="navbar-order-online-btn"
                aria-expanded={orderDropdownOpen}
                aria-haspopup="true"
                onClick={() => setOrderDropdownOpen((prev) => !prev)}
                className="bg-[#D3452B] hover:bg-[#BD3B22] text-[#FDFBF7] font-semibold text-sm px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(211,69,43,0.3)] hover:shadow-[0_6px_20px_rgba(211,69,43,0.4)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 focus:outline-none"
              >
                <span>Order Online</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${orderDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {orderDropdownOpen && (
                <div
                  id="order-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-[#2E4823]/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500 font-medium">
                    Order for Doorstep Delivery
                  </div>
                  <a
                    href={RESTAURANT_INFO.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 my-1 rounded-lg text-sm font-medium text-[#1C1C1C] hover:bg-[#F7F3EB] hover:text-[#D3452B] transition-colors group"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#FC8019]/15 text-[#FC8019] flex items-center justify-center font-bold text-xs">
                        S
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 group-hover:text-[#D3452B]">Order via Swiggy</div>
                        <div className="text-[11px] text-gray-500">Live delivery tracking</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#D3452B]" />
                  </a>

                  <a
                    href={RESTAURANT_INFO.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C1C1C] hover:bg-[#F7F3EB] hover:text-[#D3452B] transition-colors group"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#E23744]/15 text-[#E23744] flex items-center justify-center font-bold text-xs">
                        Z
                      </span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 group-hover:text-[#D3452B]">Order via Zomato</div>
                        <div className="text-[11px] text-gray-500">Menu &amp; ratings</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#D3452B]" />
                  </a>

                  <div className="mt-2 pt-2 border-t border-gray-100 px-3 py-1 text-center">
                    <a
                      href="tel:7947142432"
                      className="text-xs text-[#2E4823] font-semibold hover:underline block"
                    >
                      Prefer to call? 7947142432 (Takeaway)
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              id="mobile-order-button-nav"
              onClick={() => setOrderDropdownOpen((prev) => !prev)}
              className="bg-[#D3452B] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
            >
              Order
            </button>
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'text-[#2E4823] hover:bg-[#2E4823]/5' : 'text-white hover:bg-white/10'
              }`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile quick dropdown when clicking "Order" in top bar */}
        {orderDropdownOpen && (
          <div className="md:hidden mx-4 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in duration-200">
            <div className="flex flex-col gap-2">
              <a
                href={RESTAURANT_INFO.swiggyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 bg-[#FDFBF7] rounded-lg text-sm font-semibold text-gray-900 border border-gray-100"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-bold text-xs">S</span>
                  Order via Swiggy
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href={RESTAURANT_INFO.zomatoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 bg-[#FDFBF7] rounded-lg text-sm font-semibold text-gray-900 border border-gray-100"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E23744] text-white flex items-center justify-center font-bold text-xs">Z</span>
                  Order via Zomato
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer (Slides in from the right smoothly) */}
      <div
        id="mobile-drawer-container"
        className={`fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-sm bg-[#FDFBF7] shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="p-5 flex items-center justify-between border-b border-[#2E4823]/10 bg-white">
          <div className="flex flex-col">
            <span className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823]">Vaibhav Grand</span>
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">Family Restaurant</span>
          </div>
          <button
            type="button"
            id="mobile-drawer-close-btn"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          <div className="text-xs uppercase font-bold text-[#2E4823] tracking-wider px-2">Navigation</div>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-[#1C1C1C] hover:bg-[#2E4823]/10 hover:text-[#2E4823] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-[#2E4823]/10 space-y-3">
            <div className="text-xs uppercase font-bold text-[#2E4823] tracking-wider px-2">Order Online</div>
            <a
              href={RESTAURANT_INFO.swiggyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#2E4823]/10 shadow-sm text-sm font-semibold text-gray-900"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-bold text-xs">
                  S
                </span>
                <span>Order on Swiggy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <a
              href={RESTAURANT_INFO.zomatoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#2E4823]/10 shadow-sm text-sm font-semibold text-gray-900"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E23744] text-white flex items-center justify-center font-bold text-xs">
                  Z
                </span>
                <span>Order on Zomato</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>

          <div className="pt-4 border-t border-[#2E4823]/10 space-y-2">
            <div className="text-xs uppercase font-bold text-[#2E4823] tracking-wider px-2">Table Booking &amp; Takeaway</div>
            <a
              href="tel:7947142432"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#2E4823] text-[#FDFBF7] text-sm font-semibold shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call: 7947142432</span>
            </a>
          </div>
        </div>

        <div className="p-4 bg-[#F7F3EB] border-t border-[#2E4823]/10 text-xs text-gray-600 flex flex-col gap-1">
          <span className="font-semibold text-[#2E4823]">Dining Hours</span>
          <span>Open Daily: 12:00 PM – 11:00 PM</span>
          <span className="text-[11px] text-gray-500">Ramana Vilas Circle, Renigunta, Tirupati</span>
        </div>
      </div>
    </>
  );
};
