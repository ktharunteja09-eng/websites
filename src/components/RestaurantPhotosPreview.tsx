import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, ArrowRight } from 'lucide-react';

interface RestaurantPhotosPreviewProps {
  onNavigateGallery: () => void;
}

// Desktop Photos: Complete 3-Row Mosaic Grid (9 Photos)
const DESKTOP_PHOTOS = [
  {
    id: 'front-exterior',
    title: 'Grand Exterior & Entrance',
    category: 'Restaurant Front',
    image: '/assets/vaibhav-grand-webp-images/front6.webp',
    span: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2',
    aspect: 'aspect-4/3 sm:aspect-auto sm:h-full',
  },
  {
    id: 'family-ambiance',
    title: 'Spacious AC Family Hall',
    category: 'Interior Dining',
    image: '/assets/vaibhav-grand-webp-images/ambiance.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'refreshing-coolers',
    title: 'Chilled Mocktails & Coolers',
    category: 'Beverage Bar',
    image: '/assets/vaibhav-grand-webp-images/drinlk.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'happy-gatherings',
    title: 'Celebrations & Family Dinners',
    category: 'Guest Moments',
    image: '/assets/vaibhav-grand-webp-images/people.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'arabic-mandi-platter',
    title: 'Char-Grilled Mandi Feasts',
    category: 'Kitchen Specialties',
    image: '/assets/vaibhav-grand-webp-images/food14.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'tandoori-delicacies',
    title: 'Smoky Clay Oven Tandoori',
    category: 'Clay Oven Grill',
    image: '/assets/vaibhav-grand-webp-images/food.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'royal-ambiance-booths',
    title: 'Comfortable Family Cabins',
    category: 'Private Dining',
    image: '/assets/vaibhav-grand-webp-images/ambiance8.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'daylight-facade',
    title: 'Welcoming Day Facade & Chai',
    category: 'Exterior',
    image: '/assets/vaibhav-grand-webp-images/front1.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
  {
    id: 'crispy-kaju-starter',
    title: 'Golden Kaju Chicken Starters',
    category: 'Chef Special',
    image: '/assets/vaibhav-grand-webp-images/food8.webp',
    span: 'col-span-1',
    aspect: 'aspect-4/3',
  },
];

// Mobile Row 1: Ambiance, Exterior & Dining Spaces
const MOBILE_PHOTOS_ROW_1 = [
  {
    id: 'm-front-exterior',
    title: 'Grand Exterior & Entrance',
    category: 'Restaurant Front',
    image: '/assets/vaibhav-grand-webp-images/front6.webp',
  },
  {
    id: 'm-family-ambiance',
    title: 'Spacious AC Family Hall',
    category: 'Interior Dining',
    image: '/assets/vaibhav-grand-webp-images/ambiance.webp',
  },
  {
    id: 'm-royal-cabins',
    title: 'Comfortable Family Cabins',
    category: 'Private Dining',
    image: '/assets/vaibhav-grand-webp-images/ambiance8.webp',
  },
  {
    id: 'm-daylight-facade',
    title: 'Welcoming Day Facade & Chai',
    category: 'Exterior',
    image: '/assets/vaibhav-grand-webp-images/front1.webp',
  },
  {
    id: 'm-happy-gatherings',
    title: 'Celebrations & Family Dinners',
    category: 'Guest Moments',
    image: '/assets/vaibhav-grand-webp-images/people.webp',
  },
];

// Mobile Row 2: Kitchen Delicacies & Specialties (Extra Row on Mobile)
const MOBILE_PHOTOS_ROW_2 = [
  {
    id: 'm-arabic-mandi',
    title: 'Char-Grilled Mandi Feasts',
    category: 'Kitchen Specialties',
    image: '/assets/vaibhav-grand-webp-images/food14.webp',
  },
  {
    id: 'm-tandoori',
    title: 'Smoky Clay Oven Tandoori',
    category: 'Clay Oven Grill',
    image: '/assets/vaibhav-grand-webp-images/food.webp',
  },
  {
    id: 'm-crispy-kaju',
    title: 'Golden Kaju Starters',
    category: 'Chef Special',
    image: '/assets/vaibhav-grand-webp-images/food8.webp',
  },
  {
    id: 'm-coolers',
    title: 'Chilled Mocktails & Coolers',
    category: 'Beverage Bar',
    image: '/assets/vaibhav-grand-webp-images/drinlk.webp',
  },
  {
    id: 'm-biryani-platter',
    title: 'Aromatic Dum Biryani Feast',
    category: 'Dum Biryani',
    image: '/assets/vaibhav-grand-webp-images/food11.webp',
  },
];

export const RestaurantPhotosPreview: React.FC<RestaurantPhotosPreviewProps> = ({
  onNavigateGallery,
}) => {
  return (
    <section
      id="restaurant-photos"
      className="py-14 sm:py-24 bg-[#F7F3EB] relative border-t border-[#2E4823]/10 overflow-hidden"
      aria-label="Photos of Vaibhav Grand Restaurant"
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
            ✦ STEP INSIDE OUR RESTAURANT ✦
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Photos of Our Restaurant
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-3.5 rounded-full" />
          <p className="mt-3.5 text-sm sm:text-base text-[#1C1C1C]/80 font-normal leading-relaxed">
            Take a look at our spacious dining ambiance, welcoming exterior at Ramana Vilas Circle, and delicious kitchen creations.
          </p>
        </motion.div>

        {/* ======================================================== */}
        {/* MOBILE VIEW (sm:hidden): 2 Dedicated Horizontal Rows     */}
        {/* Row 1: Ambiance & Dining Spaces                          */}
        {/* Row 2: Kitchen Delights & Sizzling Specialties           */}
        {/* ======================================================== */}
        <div className="sm:hidden space-y-4">
          
          {/* Row 1: Ambiance & Spaces */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-[#2E4823] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D3452B]" />
                Ambiance & Dining Spaces
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Swipe →</span>
            </div>
            <div
              className="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-2 pt-0.5 no-scrollbar overscroll-x-contain -mx-4 px-4 scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
            >
              {MOBILE_PHOTOS_ROW_1.map((photo) => (
                <div
                  key={photo.id}
                  className="w-[72vw] max-w-[260px] h-[160px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-md relative group cursor-pointer border border-white/60 bg-gray-200"
                  onClick={onNavigateGallery}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-85" />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-black/60 backdrop-blur-xs text-amber-300 border border-white/20">
                      {photo.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
                    <h3 className="font-['Playfair_Display'] text-sm font-bold leading-tight drop-shadow-sm">
                      {photo.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Kitchen Delights & Feasts (Extra Row in Mobile View) */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-[#2E4823] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Kitchen Delights & Specialties
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Swipe →</span>
            </div>
            <div
              className="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-2 pt-0.5 no-scrollbar overscroll-x-contain -mx-4 px-4 scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
            >
              {MOBILE_PHOTOS_ROW_2.map((photo) => (
                <div
                  key={photo.id}
                  className="w-[72vw] max-w-[260px] h-[160px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-md relative group cursor-pointer border border-white/60 bg-gray-200"
                  onClick={onNavigateGallery}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-85" />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] uppercase font-bold tracking-wider bg-black/60 backdrop-blur-xs text-amber-300 border border-white/20">
                      {photo.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
                    <h3 className="font-['Playfair_Display'] text-sm font-bold leading-tight drop-shadow-sm">
                      {photo.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swipe indicator hint */}
          <div className="text-center pt-1">
            <span className="text-[11px] text-gray-500 font-medium">← Swipe photos to explore ambiance & dishes →</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW (hidden sm:grid): Exact Original 2-Row      */}
        {/* Mosaic Grid with 5 Core Photos (100% Preserved)          */}
        {/* ======================================================== */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px]">
          {DESKTOP_PHOTOS.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className={`group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-white bg-gray-200 cursor-pointer ${photo.span}`}
              onClick={onNavigateGallery}
            >
              <img
                src={photo.image}
                alt={photo.title}
                width={600}
                height={450}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Tag / Category */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-black/50 backdrop-blur-xs text-amber-300 border border-white/20">
                  {photo.category}
                </span>
              </div>

              {/* Title & Caption */}
              <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold leading-snug drop-shadow-sm group-hover:text-amber-300 transition-colors">
                  {photo.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore Full Gallery CTA Button (Clean: no numbers like 38) */}
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={onNavigateGallery}
            className="btn-shimmer inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#2E4823] hover:bg-[#233719] text-white font-bold text-xs sm:text-base shadow-[0_4px_16px_rgba(46,72,35,0.4)] hover:shadow-[0_8px_24px_rgba(46,72,35,0.5)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>View Full Photo Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
