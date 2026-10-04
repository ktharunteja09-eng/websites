import React from 'react';
import { SEO } from '../components/SEO';
import { Home, ChevronRight, Phone, Mail, Cake, Briefcase, Sparkles, CheckCircle2, Calendar } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { CateringEvents } from '../components/CateringEvents';
import { ClosingCTA } from '../components/ClosingCTA';

interface CateringPageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigateHome: () => void;
}

export const CateringPage: React.FC<CateringPageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO */}
      <SEO path="/catering" />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/ambiance.webp"
            alt="Catering banner background"
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
            <span className="text-amber-400">Catering &amp; Private Events</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            CELEBRATE WITH VAIBHAV GRAND
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Catering &amp; Private Celebrations
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            From cheerful birthday parties and family reunions to corporate gatherings and bulk biryani bucket feasts in Renigunta and Tirupati.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenBookModal}
              className="px-6 py-3 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Book Your Event: {RESTAURANT_INFO.phone}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catering Offerings & Real Photos */}
      <CateringEvents />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
