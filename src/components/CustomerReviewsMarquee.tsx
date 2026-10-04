import React, { useRef } from 'react';
import { TESTIMONIALS, RESTAURANT_INFO } from '../data/restaurantData';
import { Star, ExternalLink, ThumbsUp, CheckCircle, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';

// Color palette for reviewer avatar initials
const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-purple-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
  'bg-orange-600 text-white',
];

export const CustomerReviewsMarquee: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Manual scroll buttons for convenience
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Duplicate reviews array for infinite seamless looping
  const duplicatedReviews = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="customer-reviews"
      className="py-16 sm:py-24 bg-[#F7F3EB] border-t border-[#2E4823]/10 relative overflow-hidden"
      aria-label="Real Google Maps Customer Reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-14"
        >
          {/* Google Verified Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-xs mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Google Maps Verified Customer Reviews
            </span>
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            What Our Guests Say on Google
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Rated <strong className="text-[#2E4823] font-bold">4.3 ★</strong> based on{' '}
            <strong className="text-[#D3452B] font-bold">1,001+ verified ratings</strong> in Renigunta &amp; Tirupati.
            Hover over any review to pause and read.
          </p>

          {/* Manual Scroll Arrows */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-[#2E4823] hover:border-[#2E4823] flex items-center justify-center shadow-xs transition-colors"
              aria-label="Scroll reviews left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-500 font-medium">Scroll to explore</span>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-[#2E4823] hover:border-[#2E4823] flex items-center justify-center shadow-xs transition-colors"
              aria-label="Scroll reviews right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Infinite Side-Scroll Track Container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto no-scrollbar py-4 px-4 cursor-grab active:cursor-grabbing"
      >
        <div className="animate-marquee-slow flex items-stretch gap-6">
          {duplicatedReviews.map((rev, index) => {
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const initial = rev.name.charAt(0).toUpperCase();

            return (
              <article
                key={`${rev.id}-${index}`}
                className="w-[320px] sm:w-[380px] shrink-0 bg-white rounded-3xl p-6 sm:p-7 border border-[#2E4823]/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(46,72,35,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between select-none"
              >
                <div>
                  {/* Card Header: Reviewer info & Google G Emblem */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center font-bold text-base shadow-xs shrink-0`}
                      >
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-['Playfair_Display'] text-base font-bold text-[#1C1C1C] line-clamp-1">
                          {rev.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <span>{rev.role}</span>
                          {rev.date && (
                            <>
                              <span>•</span>
                              <span>{rev.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Official Google G Logo Badge */}
                    <div className="shrink-0 bg-gray-50 p-2 rounded-xl border border-gray-100" title="Posted on Google Maps">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Stars Bar */}
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rev.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : i < rev.rating
                            ? 'fill-amber-400/60 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-1.5">
                      {rev.rating}.0
                    </span>
                  </div>

                  {/* Highlight Dish Tag if present */}
                  {rev.highlightDish && (
                    <div className="mb-3">
                      <span className="inline-block text-[11px] font-semibold text-[#2E4823] bg-[#2E4823]/5 px-2.5 py-1 rounded-md border border-[#2E4823]/10">
                        Ordered: <strong>{rev.highlightDish}</strong>
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic line-clamp-4">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>

                {/* Card Footer: Verified on Google checkmark */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Visit</span>
                  </span>
                  <span>Google Maps</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Bar with Direct Google Maps Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2E4823]/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <span className="font-['Playfair_Display'] text-2xl font-extrabold text-amber-600">
                {RESTAURANT_INFO.overallRating}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-0.5">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <div className="relative w-4 h-4">
                  <Star className="w-4 h-4 text-gray-300" />
                  <div className="absolute inset-0 overflow-hidden w-[35%]">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Verified score across <strong className="text-gray-900">{RESTAURANT_INFO.totalReviews}+ reviews</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={RESTAURANT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2E4823] hover:bg-[#233719] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <span>View All on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={RESTAURANT_INFO.googleMapsReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#D3452B] font-bold text-xs sm:text-sm border-2 border-[#D3452B] transition-all"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-[#D3452B]" />
              <span>Write a Google Review</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
