import React from 'react';
import { Star, ShieldCheck, ExternalLink, ThumbsUp, MapPin } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface RatingsBannerProps {
  onNavigateReviews?: () => void;
}

export const RatingsBanner: React.FC<RatingsBannerProps> = () => {
  return (
    <div
      id="ratings-banner"
      className="bg-[#213519] text-[#FDFBF7] border-y border-amber-400/20 py-4 sm:py-5 relative z-25 shadow-md"
      aria-label="Verified Customer Ratings and Trust Highlights"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          
          {/* Left: Google Rating Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-center lg:text-left">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-amber-400/30">
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">
                {RESTAURANT_INFO.overallRating}
              </span>
              <div className="flex items-center text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <div className="relative w-3.5 h-3.5">
                  <Star className="w-3.5 h-3.5 text-amber-400/40" />
                  <div className="absolute inset-0 overflow-hidden w-[35%]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white tracking-wide">
                Google &amp; JustDial Verified:
              </span>{' '}
              <span className="text-amber-300 font-semibold">
                {RESTAURANT_INFO.totalReviews}+ Local Reviews
              </span>
            </div>

            <span className="hidden sm:inline text-white/30">•</span>

            <div className="flex items-center gap-1 text-xs text-white/90">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">100% Halal Cuts &amp; Fresh Daily Kitchen</span>
            </div>
          </div>

          {/* Right: Quick Review Links (Google Maps & JustDial) */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <a
              href={RESTAURANT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all hover:scale-[1.02]"
              title="View Google Map Location and Verified Reviews"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Google Reviews</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </a>

            <a
              href={RESTAURANT_INFO.googleMapsReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-semibold border border-amber-400/40 transition-all hover:scale-[1.02]"
              title="Write a Google Review for Vaibhav Grand"
            >
              <ThumbsUp className="w-3 h-3 text-amber-300" />
              <span>Write a Review</span>
              <ExternalLink className="w-3 h-3 text-amber-300/80" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
