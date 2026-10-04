import React, { useState } from 'react';
import { SIGNATURE_DISHES, RESTAURANT_INFO } from '../data/restaurantData';
import { ExternalLink, Sparkles, Flame, Users, Phone, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

interface SignatureDishesProps {
  onOpenOrderModal?: () => void;
  onNavigateMenu?: () => void;
}

export const SignatureDishes: React.FC<SignatureDishesProps> = ({
  onOpenOrderModal,
  onNavigateMenu,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section
      id="specialties"
      className="py-14 sm:py-24 bg-[#FDFBF7] relative scroll-mt-12 overflow-hidden"
      aria-label="Signature Dishes Showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#D3452B] mb-2 block">
            ✦ VAIBHAV CULINARY HIGHLIGHTS ✦
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Our Signature Specialties
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-3.5 rounded-full" />
          <p className="mt-3.5 text-sm sm:text-base text-[#1C1C1C]/80 font-normal leading-relaxed">
            Handcrafted Arabic Mandi platters, firewood-style Hyderabadi dum biryani buckets, clay-oven tandoor, and velvety curries.
          </p>
        </motion.div>

        {/* MOBILE VIEW: Side Scroll Animation Carousel (Red Onion NYC Mobile Style) */}
        <div className="sm:hidden">
          <div
            className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-5 pt-1 no-scrollbar overscroll-x-contain -mx-4 px-4"
            onScroll={(e) => {
              const el = e.currentTarget;
              const slideWidth = el.scrollWidth / SIGNATURE_DISHES.length;
              const current = Math.round(el.scrollLeft / slideWidth);
              setActiveSlide(Math.min(current, SIGNATURE_DISHES.length - 1));
            }}
          >
            {SIGNATURE_DISHES.map((dish) => (
              <article
                key={dish.id}
                className="w-[84vw] max-w-[320px] shrink-0 snap-center bg-white rounded-2xl overflow-hidden shadow-md border border-[#2E4823]/10 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-[#F7F3EB]">
                    <OptimizedImage
                      src={dish.image}
                      alt={dish.name}
                      priority={true}
                      className="w-full h-full object-cover object-center"
                      containerClassName="w-full h-full"
                    />

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs text-[10px] font-semibold">
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
                    <div className="absolute top-2.5 right-2.5 z-10 bg-[#2E4823]/95 text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      {dish.badge}
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-[#2E4823]/10">
                      <span className="text-[#D3452B] font-bold text-base">₹{dish.price}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823] leading-snug line-clamp-1">
                      {dish.name}
                    </h3>

                    <p className="text-[11px] font-semibold text-[#D3452B] mt-1 italic tracking-wide line-clamp-1">
                      {dish.tagline}
                    </p>

                    <p className="text-xs text-[#1C1C1C]/75 mt-2 leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Details & Quick Order Link */}
                <div className="px-4 pb-4 pt-2 border-t border-[#2E4823]/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#2E4823]" />
                      <span className="truncate">{dish.serving}</span>
                    </span>
                    {dish.spiceLevel && (
                      <span className="flex items-center gap-1 text-amber-800">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span className="truncate">{dish.spiceLevel}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={RESTAURANT_INFO.swiggyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-xl bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/25 hover:bg-[#FC8019] hover:text-white shadow-xs active:scale-95 transition-all"
                    >
                      <span>Swiggy</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={RESTAURANT_INFO.zomatoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2.5 rounded-xl bg-[#E23744]/10 text-[#E23744] border border-[#E23744]/25 hover:bg-[#E23744] hover:text-white shadow-xs active:scale-95 transition-all"
                    >
                      <span>Zomato</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Swipe Indicator & Active Dots on Mobile */}
          <div className="flex flex-col items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-1.5">
              {SIGNATURE_DISHES.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeSlide
                      ? 'w-6 h-1.5 bg-[#D3452B]'
                      : 'w-1.5 h-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">← Swipe to view all 4 specialties →</span>
          </div>
        </div>

        {/* DESKTOP VIEW: 4-Column Responsive Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SIGNATURE_DISHES.map((dish, idx) => (
            <motion.article
              key={dish.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#2E4823]/10 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with Hover Zoom */}
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-[#F7F3EB]">
                  <OptimizedImage
                    src={dish.image}
                    alt={dish.name}
                    priority={true}
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs text-[11px] font-semibold">
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
                  <div className="absolute top-2.5 right-2.5 z-10 bg-[#2E4823]/95 text-[#FDFBF7] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    {dish.badge}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-xs border border-[#2E4823]/10">
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
                    <span className="truncate">{dish.serving}</span>
                  </span>
                  {dish.spiceLevel && (
                    <span className="flex items-center gap-1 text-amber-800">
                      <Flame className="w-3 h-3 text-amber-600" />
                      <span className="truncate">{dish.spiceLevel}</span>
                    </span>
                  )}
                </div>

                {/* Action Links */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={RESTAURANT_INFO.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/25 hover:bg-[#FC8019] hover:text-white shadow-xs hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Swiggy</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={RESTAURANT_INFO.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl bg-[#E23744]/10 text-[#E23744] border border-[#E23744]/25 hover:bg-[#E23744] hover:text-white shadow-xs hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Zomato</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Quick order fallback reminder line */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
            Prefer to call? Order directly at{' '}
            <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-[#D3452B] hover:underline font-bold">
              {RESTAURANT_INFO.phone}
            </a>{' '}
            for takeaway!
          </p>
        </div>
      </div>
    </section>
  );
};
