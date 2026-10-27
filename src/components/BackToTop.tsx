import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from './SmoothScrollProvider';
import { useLocation } from 'react-router-dom';

export interface BackToTopProps {
  hasCartItems?: boolean;
}

export const BackToTop: React.FC<BackToTopProps> = ({ hasCartItems: propHasCart }) => {
  const [visible, setVisible] = useState(false);
  const [internalHasCart, setInternalHasCart] = useState(false);
  const { scrollTo, lenis } = useLenis();
  const location = useLocation();

  const isMenuPage = location.pathname === '/menu' || location.pathname.startsWith('/menu');
  const hasCart = propHasCart !== undefined ? propHasCart : internalHasCart;

  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;
    const handleScroll = (scrollPos?: number) => {
      const currentY =
        typeof scrollPos === 'number'
          ? scrollPos
          : window.scrollY || document.documentElement.scrollTop || window.pageYOffset || 0;
      setVisible(currentY > 200);
    };

    handleScroll();

    const onWindowScroll = () => handleScroll();
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    let unbindLenis: (() => void) | null = null;
    if (lenis && typeof lenis.on === 'function') {
      const onLenisScroll = (e: { scroll: number }) => handleScroll(e.scroll);
      lenis.on('scroll', onLenisScroll);
      unbindLenis = () => {
        try {
          lenis.off('scroll', onLenisScroll);
        } catch {}
      };
    }

    const checkCart = () => {
      if (typeof window === 'undefined') return;
      try {
        const saved = localStorage.getItem('cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          setInternalHasCart(Array.isArray(parsed) && parsed.length > 0);
          return;
        }
      } catch {}
      setInternalHasCart(false);
    };

    checkCart();

    window.addEventListener('cart-updated', checkCart);
    window.addEventListener('storage', checkCart);

    return () => {
      if (unbindLenis) unbindLenis();
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('cart-updated', checkCart);
      window.removeEventListener('storage', checkCart);
    };
  }, [location.pathname, lenis]);

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.2 });
  };

  // Dynamic bottom positioning: when cart has items, push up to bottom-[88px] to clear the cart bar
  const bottomPosition = isMenuPage
    ? hasCart
      ? 'bottom-[88px] md:bottom-8'
      : 'bottom-6 md:bottom-8'
    : hasCart
    ? 'bottom-[88px] md:bottom-8'
    : 'bottom-20 md:bottom-8';

  return (
    <button
      type="button"
      id="back-to-top-button"
      aria-label="Scroll to top of page"
      onClick={scrollToTop}
      className={`fixed ${bottomPosition} right-5 z-[55] w-11 h-11 rounded-full bg-[#2E4823] text-white shadow-lg hover:bg-[#D3452B] hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center transform active:scale-95 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
