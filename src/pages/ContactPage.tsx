import React from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Home, ChevronRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { ContactSection } from '../components/ContactSection';
import { ClosingCTA } from '../components/ClosingCTA';

interface ContactPageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigateHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO path="/contact" jsonLd={getRestaurantSchema()} />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/front1.webp"
            alt="Contact banner background"
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
            <span className="text-amber-400">Location &amp; Hours</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            WE ARE HERE TO SERVE YOU
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Contact &amp; Visit Us
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Conveniently located on Srikalahasthi Road near Ramana Vilas Circle in Renigunta, Tirupati.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Open Daily: 12:00 PM – 11:00 PM
            </span>
            <span>•</span>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="font-bold text-amber-300 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {RESTAURANT_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Contact Section with Map and Details (No form!) */}
      <ContactSection />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
