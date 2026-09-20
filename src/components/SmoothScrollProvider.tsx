import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Lenis with luxury exponential ease-out for a silky "butter-smooth" glide
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      infinite: false,
    });

    setLenisInstance(lenis);

    // Bind to requestAnimationFrame
    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    // Make lenis globally accessible for convenience
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = (
    target: string | HTMLElement | number,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, {
        offset: options?.offset ?? -70,
        duration: options?.duration ?? 1.1,
        immediate: options?.immediate ?? false,
      });
    } else {
      // Fallback
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -70);
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  };

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
};
