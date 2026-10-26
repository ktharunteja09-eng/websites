import React from 'react';

interface MenuFloatingButtonProps {
  onClick: () => void;
  isSheetOpen: boolean;
  isFooterVisible: boolean;
  hasCartItems: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const MenuFloatingButton: React.FC<MenuFloatingButtonProps> = ({
  onClick,
  isSheetOpen,
  isFooterVisible,
  hasCartItems,
  buttonRef,
}) => {
  // If sheet is open or footer is in view, hide or fade out
  const isHidden = isSheetOpen || isFooterVisible;

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 md:hidden transition-all duration-300 ease-in-out pointer-events-none ${
        hasCartItems ? 'bottom-[140px]' : 'bottom-6'
      } ${
        isHidden
          ? 'opacity-0 scale-90 translate-y-4 pointer-events-none'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label="Open menu categories"
        className="pointer-events-auto btn-md min-w-[108px] rounded-full bg-[#1C1C1C] hover:bg-black text-[#FDFBF7] font-bold shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-white/15 flex items-center justify-center active:scale-95 transition-all select-none"
      >
        {/* Inline SVG List Icon */}
        <svg className="w-4 h-4 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="tracking-wide">Menu</span>
      </button>
    </div>
  );
};
