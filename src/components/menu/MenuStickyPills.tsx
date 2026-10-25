import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CategoryItem {
  id: string;
  label: string;
  count?: number;
}

interface MenuStickyPillsProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  headerHeight: number;
}

export const MenuStickyPills: React.FC<MenuStickyPillsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  headerHeight,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isStuck, setIsStuck] = useState(false);

  // Auto-center the active pill horizontally inside this row container only
  const centerPill = useCallback((catId: string) => {
    const container = rowRef.current;
    const pill = pillRefs.current[catId];
    if (!container || !pill) return;

    const pillLeft = pill.offsetLeft;
    const pillWidth = pill.offsetWidth;
    const containerWidth = container.offsetWidth;
    const targetScrollLeft = pillLeft - containerWidth / 2 + pillWidth / 2;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  // Center active pill whenever it changes
  useEffect(() => {
    if (activeCategory) {
      centerPill(activeCategory);
    }
  }, [activeCategory, centerPill]);

  // Track sticky shadow state via scroll listener (client-side only)
  useEffect(() => {
    const handleScroll = () => {
      if (!rowRef.current) return;
      const rect = rowRef.current.getBoundingClientRect();
      setIsStuck(rect.top <= headerHeight + 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight]);

  return (
    <div
      style={{ top: `${headerHeight}px` }}
      className={`sticky z-40 md:hidden -mx-4 px-4 bg-[#FDFBF7] transition-shadow duration-200 ${
        isStuck
          ? 'shadow-[0_4px_12px_rgba(46,72,35,0.08)] border-b border-[#2E4823]/15'
          : 'border-b border-[#2E4823]/10'
      }`}
    >
      <div
        ref={rowRef}
        role="tablist"
        aria-label="Menu Categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 min-w-0"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                pillRefs.current[cat.id] = el;
              }}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap min-h-[36px] active:scale-95 ${
                isActive
                  ? 'bg-[#2E4823] text-white shadow-xs border border-[#2E4823]'
                  : 'bg-[#FDFBF7] text-[#1C1C1C] border border-[#2E4823]/25 hover:border-[#2E4823] hover:text-[#2E4823]'
              }`}
            >
              <span>{cat.label.replace(/^\d+\.\s*/, '')}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
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
  );
};
