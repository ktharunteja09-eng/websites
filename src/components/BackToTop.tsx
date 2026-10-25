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
  const { scrollTo } = useLenis();
  const location = useLocation();

  const isMenuPage = location.pathname === '/menu';
  const hasCart = propHasCart !== undefined ? propHasCart : internalHasCart;

  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;
    const handleScroll = () => {
      // Appears after scrolling past 400px
      setVisible(window.scrollY > 400);
    };

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('cart-updated', checkCart);
    window.addEventListener('storage', checkCart);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', checkCart);
      window.removeEventListener('storage', checkCart);
    };
  }, [location.pathname]);

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.2 });
  };

  // Dynamic bottom positioning: when cart has items, push up to bottom-[140px] to clear the Checkout button
  const bottomPosition = isMenuPage
    ? hasCart
      ? 'bottom-[140px] md:bottom-8'
      : 'bottom-6 md:bottom-8'
    : hasCart
    ? 'bottom-[140px] md:bottom-8'
    : 'bottom-20 md:bottom-8';

  return (
    <button
      type="button"
      id="back-to-top-button"
      aria-label="Scroll to top of page"
      onClick={scrollToTop}
      className={`fixed ${bottomPosition} right-5 z-40 w-11 h-11 rounded-full bg-[#2E4823] text-white shadow-lg hover:bg-[#D3452B] hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center transform active:scale-95 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
