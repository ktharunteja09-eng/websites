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
            From cheerful birthday parties and family reunions to grand marriage banquets and authentic charcoal-sealed bulk Dum Biryani handis in Renigunta and Tirupati.
          </p>

          {/* Key Event Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              💍 Marriage &amp; Reception Banquets
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              🍗 Bulk Dum Biryani Handis
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              🎉 AC Birthday Party Hall
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              💼 Corporate Feasts &amp; GST Invoicing
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenBookModal}
              className="px-6 py-3 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Book Event: {RESTAURANT_INFO.phone}</span>
            </button>
            <a
              href={`https://wa.me/91${(RESTAURANT_INFO.whatsapp || '7702104894').replace(/\D/g, '')}?text=${encodeURIComponent(
                'Hi Vaibhav Grand! I would like to inquire about bulk catering & wedding banquet services in Renigunta/Tirupati.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <span>WhatsApp Catering Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Catering Offerings & Real Photos */}
      <CateringEvents onOpenBookModal={onOpenBookModal} />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
