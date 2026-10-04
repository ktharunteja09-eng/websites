import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyPosition = '';
let originalBodyTop = '';
let originalBodyLeft = '';
let originalBodyRight = '';
let originalBodyWidth = '';

export function lockScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount++;
  if (lockCount === 1) {
    savedScrollY = window.scrollY;

    // Pause Lenis smooth scroll if active
    const win = window as unknown as { lenis?: { stop: () => void; start: () => void } };
    if (win.lenis && typeof win.lenis.stop === 'function') {
      try {
        win.lenis.stop();
      } catch (e) {
        // noop
      }
    }

    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPosition = document.body.style.position;
    originalBodyTop = document.body.style.top;
    originalBodyLeft = document.body.style.left;
    originalBodyRight = document.body.style.right;
    originalBodyWidth = document.body.style.width;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}

export function unlockScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.position = originalBodyPosition;
    document.body.style.top = originalBodyTop;
    document.body.style.left = originalBodyLeft;
    document.body.style.right = originalBodyRight;
    document.body.style.width = originalBodyWidth;
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;

    window.scrollTo(0, savedScrollY);

    // Resume Lenis smooth scroll if active
    const win = window as unknown as { lenis?: { stop: () => void; start: () => void } };
    if (win.lenis && typeof win.lenis.start === 'function') {
      try {
        win.lenis.start();
      } catch (e) {
        // noop
      }
    }
  }
}

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
