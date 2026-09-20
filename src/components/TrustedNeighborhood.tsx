import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, HeartHandshake, MapPin, Quote } from 'lucide-react';

export const TrustedNeighborhood: React.FC = () => {
  return (
    <section
      id="community-trust"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden border-b border-[#2E4823]/10"
      aria-label="Trusted by the Neighborhood Community Recognition"
    >
      {/* Subtle decorative background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2E4823_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Eyebrow */}
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
          {/* Subtle decorative corner frames for certificate feel */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D3452B]/40 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D3452B]/40 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D3452B]/40 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D3452B]/40 rounded-br-sm pointer-events-none" />

          {/* Top Trust Emblem & Community Badges */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-[#2E4823] text-[#FDFBF7] flex items-center justify-center shadow-md mb-4 ring-4 ring-[#2E4823]/10">
              <HeartHandshake className="w-8 h-8 text-[#D3452B]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#2E4823] block">
              Renigunta Landmark Dining
            </span>
            <span className="text-xs text-[#1C1C1C]/60 mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-[#D3452B]" />
              Opposite HP Petrol Pump, Ramana Vilas Circle
            </span>
          </div>

          {/* Highlight Stats Strip (Certificate Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-bold font-['Playfair_Display'] text-[#2E4823] block">
                5+ Years
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Serving the Community
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                Rooted in Renigunta with daily fresh preparations
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-bold font-['Playfair_Display'] text-[#2E4823] block">
                1000+
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Happy Customers
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                Families, pilgrim groups &amp; local regulars
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#2E4823]/10 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1 text-[#2E4823] font-bold text-2xl sm:text-3xl font-['Playfair_Display']">
                <span>3.6</span>
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D3452B] mt-1 block">
                Verified Rating
              </span>
              <p className="text-xs text-[#1C1C1C]/70 mt-1">
                1,001+ ratings across Google &amp; food portals
              </p>
            </div>
          </div>

          {/* Large Pull-Quote Style Testimonial */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-10 border border-[#2E4823]/15 shadow-sm">
            <Quote className="w-12 h-12 text-[#D3452B]/15 absolute top-4 left-4 -scale-x-100 pointer-events-none" />

            <div className="relative z-10">
              <p className="font-['Playfair_Display'] italic text-lg sm:text-xl md:text-2xl text-[#1C1C1C] leading-relaxed text-center sm:text-left">
                &ldquo;Vaibhav Grand is our family&rsquo;s trusted dining stop whenever we return from Tirumala or have something to celebrate. The Chicken Mandi and kebabs are unmatched in authentic flavor, the AC dining hall is spotless, and the team treats every guest with genuine warmth.&rdquo;
              </p>

              <div className="mt-6 pt-5 border-t border-[#2E4823]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-base text-[#2E4823]">
                      V. Rajeshwar Reddy &amp; Family
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#2E4823]/10 text-[#2E4823] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Patrons
                    </span>
                  </div>
                  <span className="text-xs text-[#1C1C1C]/65">
                    Renigunta Local Residents • Regular Diners
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                  <span className="text-xs font-bold text-[#1C1C1C] ml-1">5.0 Experience</span>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
