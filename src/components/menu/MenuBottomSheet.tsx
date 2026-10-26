import React, { useEffect, useRef } from 'react';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Background scroll lock & Lenis pause
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      // Auto-focus the close button or first interactive element
      const timer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        unlockScroll();
        triggerButtonRef.current?.focus();
      };
    }
  }, [isOpen, triggerButtonRef]);

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop with fade */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Slide-up Bottom Sheet */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Categories"
        className="relative z-10 w-full bg-[#FDFBF7] rounded-t-3xl max-h-[70vh] flex flex-col shadow-2xl border-t border-[#2E4823]/15 animate-slide-up"
      >
        {/* Drag Handle Visual */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-[#1C1C1C]/20 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#2E4823]/10">
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
            onClick={onClose}
            className="btn-icon rounded-full bg-black/5 hover:bg-black/10 text-gray-700 transition-colors"
            aria-label="Close menu sheet"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="overflow-y-auto px-4 py-3 divide-y divide-[#2E4823]/8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`w-full py-3 px-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                  isActive
                    ? 'bg-[#2E4823]/10 text-[#2E4823] font-bold'
                    : 'text-[#1C1C1C] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-[#D3452B]' : 'bg-[#2E4823]/30'
                    }`}
                  />
                  <span className="text-sm">
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
      </div>
    </div>
  );
};
