import React from 'react';
import { SIGNATURE_DISHES, RESTAURANT_INFO } from '../data/restaurantData';
import { ExternalLink, Sparkles, Flame, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

export const SignatureDishes: React.FC = () => {
  return (
    <section
      id="specialties"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative"
      aria-label="Signature Dishes Showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Buttery Smooth Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            SIGNATURE FLAVORS
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Signature Specialties
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Slow-simmered dum, clay-roasted tandoor meats, and rich royal gravies hand-crafted for the ultimate dining experience.
          </p>
        </motion.div>

        {/* 5 Signature Highlights Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {SIGNATURE_DISHES.map((dish, idx) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#2E4823]/10 hover:shadow-[0_16px_36px_rgba(46,72,35,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with Hover Zoom (scale 1.05, overflow hidden) */}
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-[#F7F3EB]">
                  <OptimizedImage
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm text-[11px] font-semibold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dish.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                      }`}
                    />
                    <span className={dish.isVeg ? 'text-green-800' : 'text-[#D3452B]'}>
                      {dish.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10 bg-[#2E4823]/95 text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                    {dish.badge}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-md px-3 py-0.5 rounded-xl shadow-md border border-[#2E4823]/10">
                    <span className="text-[#D3452B] font-bold text-base">₹{dish.price}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823] group-hover:text-[#D3452B] transition-colors duration-200 leading-snug line-clamp-2">
                    {dish.name}
                  </h3>

                  <p className="text-[11px] font-semibold text-[#D3452B] mt-1 italic tracking-wide line-clamp-1">
                    {dish.tagline}
                  </p>

                  <p className="text-xs text-[#1C1C1C]/75 mt-2.5 leading-relaxed line-clamp-3">
                    {dish.description}
                  </p>
                </div>
              </div>

              {/* Card Footer with Details & Quick Order Link */}
              <div className="px-5 pb-5 pt-2 border-t border-[#2E4823]/5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#2E4823]" />
                    <span className="truncate max-w-[100px]">{dish.serving}</span>
                  </span>
                  {dish.spiceLevel && (
                    <span className="flex items-center gap-1 text-amber-800">
                      <Flame className="w-3 h-3 text-amber-600" />
                      <span className="truncate max-w-[85px]">{dish.spiceLevel}</span>
                    </span>
                  )}
                </div>

                {/* Action Links */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <a
                    href={RESTAURANT_INFO.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-[#FC8019]/10 text-[#FC8019] hover:bg-[#FC8019] hover:text-white transition-colors"
                  >
                    <span>Swiggy</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href={RESTAURANT_INFO.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-[#E23744]/10 text-[#E23744] hover:bg-[#E23744] hover:text-white transition-colors"
                  >
                    <span>Zomato</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

