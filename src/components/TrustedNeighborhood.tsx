import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, HeartHandshake, MapPin, Sparkles, Award } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

export const TrustedNeighborhood: React.FC = () => {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden border-b border-[#2E4823]/10 scroll-mt-12"
      aria-label="Trusted by the Neighborhood Community Recognition"
    >
      {/* Subtle decorative background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2E4823_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            LOCAL REPUTATION &amp; HERITAGE
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Trusted by the Neighborhood
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Proudly serving families, students, and pilgrims across Renigunta and Tirupati with warm hospitality, authentic recipes, and consistent care.
          </p>
        </motion.div>

        {/* Certificate / Honor Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#F7F3EB] rounded-3xl p-8 sm:p-12 lg:p-14 border-2 border-[#2E4823]/15 shadow-[0_8px_32px_rgba(46,72,35,0.06)] overflow-hidden"
        >
          {/* Decorative corner frames */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D3452B]/40 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D3452B]/40 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D3452B]/40 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D3452B]/40 rounded-br-sm pointer-events-none" />

          {/* Top Trust Emblem */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[#2E4823] text-[#FDFBF7] flex items-center justify-center shadow-md mb-4 ring-4 ring-[#2E4823]/10">
              <HeartHandshake className="w-8 h-8 text-[#D3452B]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2E4823] block">
              Renigunta Landmark Dining
            </span>
            <span className="text-xs text-[#1C1C1C]/60 mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-[#D3452B]" />
              Plot 157, Near Ramana Vilas Circle, Srikalahasthi Road
            </span>
          </div>

          {/* Official Community Recognition Message */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-10 border border-[#2E4823]/15 shadow-sm mb-10">
            <div className="flex items-center gap-2 text-[#D3452B] font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>A Beloved Local Landmark</span>
            </div>

            <p className="font-['Playfair_Display'] text-lg sm:text-xl md:text-2xl text-[#1C1C1C] leading-relaxed">
              While there aren&rsquo;t any corporate industry trophies on public record, <strong className="text-[#2E4823]">Vaibhav Grand Family Restaurant</strong> has built a fantastic reputation as a beloved local neighborhood spot! 🌟
            </p>

            <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              Highly regarded for its consistent culinary quality, especially our non-vegetarian specialties, char-grilled Arabian Mandi platters, and traditional firewood-style biryanis — making us the trusted go-to dining destination for families, travelers, and pilgrims in the Renigunta &amp; Tirupati region.
            </p>

            <div className="mt-6 pt-5 border-t border-[#2E4823]/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E4823]" />
                <span className="text-xs sm:text-sm font-bold text-[#2E4823]">
                  Consistent Taste &amp; Fresh Daily Kitchen
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Verified Google Business:</span>
                <strong className="text-amber-600 font-bold">4.3 ★ (1,001+ Reviews)</strong>
              </div>
            </div>
          </div>

          {/* Highlight Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-bold font-['Playfair_Display'] text-[#2E4823] block">
                120+ Dishes
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Diverse Grand Menu
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                Mandi, Biryani buckets, Tandoor &amp; Chinese
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-bold font-['Playfair_Display'] text-[#2E4823] block">
                1,001+
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Verified Reviews
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                Google Maps &amp; JustDial community ratings
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[#2E4823] font-bold text-2xl sm:text-3xl font-['Playfair_Display']">
                <span>12h Daily</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Continuous Service
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                12:00 PM – 11:00 PM every day of the week
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
