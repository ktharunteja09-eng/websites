import React, { useState, useEffect } from 'react';
import { TESTIMONIALS, RESTAURANT_INFO } from '../data/restaurantData';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const currentQuote = TESTIMONIALS[currentIndex];

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#F7F3EB] border-y border-[#2E4823]/10 relative overflow-hidden"
      aria-label="Customer Testimonials & Ratings"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Buttery Smooth Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#2E4823] mb-2 block">
            WHAT OUR GUESTS SAY
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Words From Our Diners
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />

          {/* Rating Callout: 3.6 stars from 1,001 ratings */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#2E4823]/10">
            <div className="flex items-center text-amber-500">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
              ))}
              <div className="relative">
                <Star className="w-4 h-4 text-amber-500" />
                <div className="absolute inset-0 overflow-hidden w-[60%]">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
              </div>
              <Star className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-[#1C1C1C]">
              <span className="font-bold text-[#2E4823]">3.6 Stars</span> based on{' '}
              <span className="text-[#D3452B] font-bold">1,001+ verified reviews</span>
            </div>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#FDFBF7] rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(46,72,35,0.06)] border border-[#2E4823]/10 min-h-[300px] flex flex-col justify-between"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Quote className="w-12 h-12 text-[#2E4823]/15 absolute top-6 right-8 pointer-events-none" />

          {/* Animated Slide Quote with Fade Transition */}
          <div className="relative min-h-[160px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="w-full"
              >
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(currentQuote.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-amber-200 text-amber-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs font-semibold text-gray-500">
                    {currentQuote.rating} / 5.0
                  </span>
                </div>

                <p className="font-['Playfair_Display'] text-lg sm:text-2xl text-[#1C1C1C] italic leading-relaxed font-medium">
                  "{currentQuote.quote}"
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-[#2E4823]">
                      {currentQuote.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {currentQuote.role} • {currentQuote.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[#2E4823]/10 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Go to testimonial ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-[#2E4823]'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-[#2E4823]/20 bg-white text-[#2E4823] flex items-center justify-center hover:bg-[#2E4823] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-[#2E4823]/20 bg-white text-[#2E4823] flex items-center justify-center hover:bg-[#2E4823] hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
