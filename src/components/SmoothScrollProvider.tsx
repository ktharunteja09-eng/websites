import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type LenisType from 'lenis';

interface LenisContextType {
  lenis: LenisType | null;
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
  const [lenisInstance, setLenisInstance] = useState<LenisType | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && Boolean(process.versions?.node))) return;

    let isDestroyed = false;
    let lenis: LenisType | null = null;

    // Dynamically import Lenis after first paint to keep the critical path lean
    const initLenis = () => {
      import('lenis')
        .then(({ default: LenisClass }) => {
          if (isDestroyed) return;

          lenis = new LenisClass({
            duration: 1.15,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1,
            syncTouch: false,
            infinite: false,
          });

          setLenisInstance(lenis);

          function raf(time: number) {
            lenis?.raf(time);
            rafRef.current = requestAnimationFrame(raf);
          }
          rafRef.current = requestAnimationFrame(raf);

          (window as unknown as { lenis: LenisType }).lenis = lenis;
        })
        .catch((err) => {
          console.warn('Deferred Lenis load failed:', err);
        });
    };

    if ('requestIdleCallback' in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(initLenis, { timeout: 2000 });
      return () => {
        isDestroyed = true;
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        lenis?.destroy();
        setLenisInstance(null);
      };
    } else {
      const timer = setTimeout(initLenis, 150);
      return () => {
        isDestroyed = true;
        clearTimeout(timer);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        lenis?.destroy();
        setLenisInstance(null);
      };
    }
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
      // Fallback native smooth scroll before Lenis loads
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
