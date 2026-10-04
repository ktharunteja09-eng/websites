import React, { useState, useEffect } from 'react';
import { GALLERY_PHOTOS } from '../data/restaurantData';
import { GalleryPhoto } from '../types';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const categories = ['All', 'Food & Mandi', 'Ambiance', 'Celebrations', 'Front View'];

  const filteredPhotos = GALLERY_PHOTOS.filter((photo) => {
    if (activeCategory === 'All') return true;
    return photo.category === activeCategory;
  });

  const openLightbox = (photo: GalleryPhoto, index: number) => {
    setActivePhoto(photo);
    setActiveIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActivePhoto(null);
    document.body.style.overflow = '';
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (activeIndex + 1) % filteredPhotos.length;
    setActiveIndex(nextIdx);
    setActivePhoto(filteredPhotos[nextIdx]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx = activeIndex === 0 ? filteredPhotos.length - 1 : activeIndex - 1;
    setActiveIndex(prevIdx);
    setActivePhoto(filteredPhotos[prevIdx]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, activeIndex, filteredPhotos]);

  return (
    <section
      id="gallery"
      className="py-16 sm:py-24 bg-[#F7F3EB] relative overflow-hidden scroll-mt-12"
      aria-label="Visual Gallery"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            VISUAL EXPERIENCE
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Photo Gallery
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Real photos from Vaibhav Grand: sizzling tandoor roasts, fragrant Arabic Mandi platters, celebratory dining halls, and welcoming entrance.
          </p>
        </motion.div>

        {/* Gallery Category Filter Tabs (Side-scrollable on mobile, centered on desktop) */}
        <div
          data-lenis-prevent
          className="w-full overflow-x-auto no-scrollbar pb-2 sm:pb-1 mb-8 flex justify-start sm:justify-center -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-[#2E4823]/15 shadow-xs shrink-0 max-sm:min-w-max gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={(e) => {
                  setActiveCategory(cat);
                  e.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest',
                  });
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#2E4823] text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#2E4823]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean CSS Grid of Photos with Hover Zoom */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 rounded-3xl overflow-hidden shadow-xs bg-[#2E4823]/5 p-3 sm:p-4">
          {filteredPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => openLightbox(photo, idx)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-200 cursor-pointer shadow-xs"
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${photo.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openLightbox(photo, idx);
                }
              }}
            >
              <OptimizedImage
                src={photo.imageUrl}
                alt={photo.altText}
                priority={idx < 8}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-all duration-500 ease-out"
                containerClassName="w-full h-full"
              />

              {/* Dark Hover Overlay */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4">
                <div className="self-end bg-white/90 backdrop-blur-xs p-1.5 rounded-full text-[#2E4823] shadow-md transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-0.5">
                    {photo.category}
                  </span>
                  <p className="text-white text-xs sm:text-sm font-bold leading-snug drop-shadow-sm">
                    {photo.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors hidden sm:flex items-center justify-center"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors hidden sm:flex items-center justify-center"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Active Image Container */}
            <div
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.altText}
                width={1000}
                height={750}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <div className="mt-4 text-center">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  {activePhoto.category}
                </span>
                <p className="text-white font-['Playfair_Display'] text-base sm:text-lg font-bold mt-1">
                  {activePhoto.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
