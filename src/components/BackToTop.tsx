import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from './SmoothScrollProvider';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      // Appears after scrolling past 400px
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.2 });
  };

  return (
    <button
      type="button"
      id="back-to-top-button"
      aria-label="Scroll to top of page"
      onClick={scrollToTop}
      className={`fixed bottom-20 md:bottom-8 right-5 z-30 w-11 h-11 rounded-full bg-[#2E4823] text-white shadow-lg hover:bg-[#D3452B] hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-center transform active:scale-95 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
