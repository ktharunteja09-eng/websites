import React from 'react';
import { SEO } from '../components/SEO';
import { getReviewsSchema } from '../utils/schemaGenerator';
import { Home, ChevronRight, Star, ExternalLink, MessageSquarePlus } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { Testimonials } from '../components/Testimonials';
import { ClosingCTA } from '../components/ClosingCTA';

interface ReviewsPageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigateHome: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org Reviews */}
      <SEO path="/reviews" jsonLd={getReviewsSchema()} />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/food2.webp"
            alt="Reviews banner background"
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
            <span className="text-amber-400">Google Reviews &amp; Ratings</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            1,001+ VERIFIED RATINGS
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Guest Reviews &amp; Stories
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Direct feedback from families, local regulars, and pilgrims who have experienced our food, ambiance &amp; service.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href={RESTAURANT_INFO.googleMapsReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#2E4823] hover:bg-[#233719] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-300" />
              <span>Write a Google Review</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Google Reviews Showcase */}
      <Testimonials />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
