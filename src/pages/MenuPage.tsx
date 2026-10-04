import React from 'react';
import { SEO } from '../components/SEO';
import { getMenuSchema } from '../utils/schemaGenerator';
import { MenuSection } from '../components/MenuSection';
import { Utensils, Home, ChevronRight, Phone } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { ClosingCTA } from '../components/ClosingCTA';

interface MenuPageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigateHome: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org Menu */}
      <SEO path="/menu" jsonLd={getMenuSchema()} />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/food14.webp"
            alt="Menu banner background"
            width={1920}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover filter blur-xs"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 mb-4" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400">Culinary Menu</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            VAIBHAV GRAND DINING
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Our Grand Culinary Menu
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Authentic Arabic Mandi feasts, Hyderabadi dum biryani family buckets, clay-oven tandoori grills, rich curries &amp; thick milkshakes.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-300">
            <span>Dine-In • Takeaway • Doorstep Delivery</span>
            <span>•</span>
            <span className="font-bold text-amber-300">
              Prefer to call? Call {RESTAURANT_INFO.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Full Menu Section Component */}
      <MenuSection />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
