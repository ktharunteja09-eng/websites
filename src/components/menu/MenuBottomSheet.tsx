import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryItem {
  id: string;
  label: string;
  count?: number;
}

interface MenuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  triggerButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const MenuBottomSheet: React.FC<MenuBottomSheetProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  triggerButtonRef,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeCategoryRef = useRef<HTMLButtonElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const originalBodyOverflow = useRef<string>('');
  const isScrollLocked = useRef<boolean>(false);

  // Mount check and reduced motion detection (pure client side)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Safe Lenis helpers
  const resumeLenis = useCallback(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as { lenis?: { start: () => void } };
    if (win.lenis && typeof win.lenis.start === 'function') {
      try {
        win.lenis.start();
      } catch {
        // noop
      }
    }
  }, []);

  const pauseLenis = useCallback(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as { lenis?: { stop: () => void } };
    if (win.lenis && typeof win.lenis.stop === 'function') {
      try {
        win.lenis.stop();
      } catch {
        // noop
      }
    }
  }, []);

  // Unlock body and resume Lenis safely
  const unlockBackground = useCallback(() => {
    if (typeof document === 'undefined' || !isScrollLocked.current) return;
    document.body.style.overflow = originalBodyOverflow.current;
    isScrollLocked.current = false;
    resumeLenis();
  }, [resumeLenis]);

  // Lock body and pause Lenis safely
  const lockBackground = useCallback(() => {
    if (typeof document === 'undefined' || isScrollLocked.current) return;
    originalBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    isScrollLocked.current = true;
    pauseLenis();
  }, [pauseLenis]);

  // Unified safe close handler that resumes Lenis on EVERY close path
  const handleSafeClose = useCallback(() => {
    unlockBackground();
    onClose();
    if (triggerButtonRef.current) {
      triggerButtonRef.current.focus({ preventScroll: true });
    }
  }, [unlockBackground, onClose, triggerButtonRef]);

  // Sync scroll lock and Lenis state with isOpen
  useEffect(() => {
    if (isOpen) {
      lockBackground();

      const timer = window.setTimeout(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      }, 50);

      return () => {
        clearTimeout(timer);
        unlockBackground();
      };
    } else {
      unlockBackground();
    }
  }, [isOpen, lockBackground, unlockBackground]);

  // Auto-scroll inside bottom sheet to show currently active category
  useEffect(() => {
    if (isOpen && activeCategory) {
      const scrollTimer = window.setTimeout(() => {
        activeCategoryRef.current?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }, 120);

      return () => clearTimeout(scrollTimer);
    }
  }, [isOpen, activeCategory]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSafeClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSafeClose]);

  // Touch swipe-down handler on header & handle to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 50) {
      touchStartY.current = null;
      handleSafeClose();
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  // Category tap handler: closes sheet, unlocks background, then scrolls to category
  const handleCategoryTap = (catId: string) => {
    handleSafeClose();
    const waitMs = prefersReducedMotion ? 16 : 220;
    window.setTimeout(() => {
      onSelectCategory(catId);
    }, waitMs);
  };

  // SSR / SSG safe guard: no render on server to prevent document access
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] md:hidden flex flex-col justify-end pointer-events-auto">
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: 'easeOut' }
            }
            onClick={handleSafeClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs touch-none"
            aria-hidden="true"
          />

          {/* Slide-up Bottom Sheet */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu Categories"
            data-lenis-prevent
            initial={prefersReducedMotion ? { y: 0 } : { y: '100%' }}
            animate={{ y: 0 }}
            exit={prefersReducedMotion ? { y: 0, opacity: 0 } : { y: '100%' }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    damping: 32,
                    stiffness: 360,
                    mass: 0.8,
                  }
            }
            className="fixed bottom-0 left-0 right-0 z-[70] w-full bg-[#FDFBF7] rounded-t-3xl max-h-[75dvh] flex flex-col shadow-[0_-16px_48px_rgba(0,0,0,0.35)] border-t border-[#2E4823]/15 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Visual (Swipe-down capable) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleSafeClose}
              className="pt-3 pb-1 flex justify-center cursor-pointer select-none shrink-0"
              aria-label="Swipe down to dismiss"
            >
              <div className="w-12 h-1.5 bg-[#1C1C1C]/25 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="px-5 py-3 flex items-center justify-between border-b border-[#2E4823]/10 shrink-0 select-none"
            >
              <div>
                <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823]">
                  Menu Categories
                </h2>
                <p className="text-[11px] text-gray-500">
                  Jump directly to any section
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleSafeClose}
                className="btn-icon rounded-full bg-black/5 hover:bg-black/10 text-gray-700 transition-colors"
                aria-label="Close menu sheet"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 divide-y divide-[#2E4823]/8 pb-[max(2rem,env(safe-area-inset-bottom))]"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    ref={isActive ? activeCategoryRef : null}
                    type="button"
                    onClick={() => handleCategoryTap(cat.id)}
                    className={`w-full py-3 px-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                      isActive
                        ? 'bg-[#2E4823]/10 text-[#2E4823] font-bold'
                        : 'text-[#1C1C1C] hover:bg-black/5 active:bg-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full transition-transform ${
                          isActive ? 'bg-[#D3452B] scale-125' : 'bg-[#2E4823]/30'
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {cat.label.replace(/^\d+\.\s*/, '')}
                      </span>
                    </div>

                    {typeof cat.count === 'number' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive
                            ? 'bg-[#2E4823] text-white'
                            : 'bg-black/5 text-gray-600'
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
