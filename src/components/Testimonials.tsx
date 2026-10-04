import React, { useState } from 'react';
import { TESTIMONIALS, RESTAURANT_INFO } from '../data/restaurantData';
import { Star, ExternalLink, MessageSquarePlus, CheckCircle, MapPin, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';

export const Testimonials: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'mandi' | 'family' | 'service'>('all');

  const filteredReviews = TESTIMONIALS.filter((review) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mandi') return review.highlightDish?.toLowerCase().includes('mandi') || review.quote.toLowerCase().includes('mandi') || review.quote.toLowerCase().includes('biryani');
    if (activeFilter === 'family') return review.quote.toLowerCase().includes('family') || review.quote.toLowerCase().includes('birthday');
    if (activeFilter === 'service') return review.quote.toLowerCase().includes('service') || review.quote.toLowerCase().includes('ac') || review.quote.toLowerCase().includes('clean');
    return true;
  });

  return (
    <section
      id="reviews"
      className="py-16 sm:py-24 bg-[#F7F3EB] border-y border-[#2E4823]/10 relative overflow-hidden scroll-mt-12"
      aria-label="Google Reviews & Guest Testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/80 shadow-xs mb-3">
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
              Google Maps Verified Ratings
            </span>
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Loved by Over 1,000+ Diners
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Real guest reviews and authentic dining stories from families, travelers, and pilgrims visiting Vaibhav Grand in Renigunta.
          </p>
        </motion.div>

        {/* Master Google Reviews Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#2E4823]/10 mb-10"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Overall Rating & Stars */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200/60 shadow-xs">
                <span className="text-4xl font-extrabold text-amber-600 font-['Playfair_Display']">
                  4.3
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                  <div className="relative w-5 h-5">
                    <Star className="w-5 h-5 text-gray-300" />
                    <div className="absolute inset-0 overflow-hidden w-[35%]">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 ml-2">4.3 / 5.0</span>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Based on <span className="font-bold text-[#1C1C1C]">1,001+ Ratings</span> on Google &amp; JustDial
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-[#2E4823]" />
                  <span>Plot 157, Near Ramana Vilas Circle, Renigunta, Tirupati</span>
                </div>
              </div>
            </div>

            {/* Right: Direct Google Review Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <a
                href={RESTAURANT_INFO.googleMapsReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-300" />
                <span>Write a Google Review</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
              </a>

              <a
                href={RESTAURANT_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#1C1C1C] border border-gray-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:border-[#2E4823]/30"
              >
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
                <span>View on Google Maps</span>
              </a>

              <a
                href={RESTAURANT_INFO.justdialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>JustDial (4.3★)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Review Category Filters */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
              Filter by:
            </span>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#2E4823] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Reviews ({TESTIMONIALS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('mandi')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'mandi'
                  ? 'bg-[#2E4823] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mandi &amp; Biryani Feasts
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('family')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'family'
                  ? 'bg-[#2E4823] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Family Celebrations &amp; Birthdays
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('service')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'service'
                  ? 'bg-[#2E4823] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Service &amp; AC Dining Ambiance
            </button>
          </div>
        </motion.div>

        {/* Google Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review, idx) => {
            // Pick a distinctive avatar color
            const avatarColors = [
              'bg-blue-600',
              'bg-emerald-600',
              'bg-amber-600',
              'bg-purple-600',
              'bg-rose-600'
            ];
            const colorClass = avatarColors[idx % avatarColors.length];

            return (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#2E4823]/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Reviewer Avatar, Name, and Verified Google Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                      >
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#1C1C1C] flex items-center gap-1.5">
                          <span>{review.name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                        </h3>
                        <p className="text-xs text-gray-500">{review.role}</p>
                      </div>
                    </div>

                    {/* Google G icon */}
                    <div className="p-1 rounded-md bg-gray-50 border border-gray-100 shrink-0">
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

                  {/* Stars and Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(review.rating)
                              ? 'fill-amber-500 text-amber-500'
                              : i < review.rating
                              ? 'fill-amber-500/50 text-amber-500'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {review.date && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        • {review.date}
                      </span>
                    )}
                  </div>

                  {/* Highlight Dish Tag */}
                  {review.highlightDish && (
                    <div className="mb-2.5">
                      <span className="inline-block text-[11px] font-semibold text-[#2E4823] bg-[#2E4823]/5 border border-[#2E4823]/10 px-2 py-0.5 rounded-md">
                        Ordered: {review.highlightDish}
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                    "{review.quote}"
                  </p>
                </div>

                {/* Card Footer: Verified Visit */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <ThumbsUp className="w-3 h-3" />
                    Verified Dine-in Guest
                  </span>
                  <span>Google Review</span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Prompt Card: Invite Guests to Review on Google Maps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 bg-gradient-to-r from-[#2E4823] to-[#1E3017] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left">
            <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
              Dined with us at Vaibhav Grand recently?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Your honest feedback helps us maintain our quality and firewood biryani traditions. Share your experience with local food lovers on Google Maps!
            </p>
          </div>

          <a
            href={RESTAURANT_INFO.googleMapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1C1C1C] font-bold text-sm shadow-md transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Rate Us on Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
