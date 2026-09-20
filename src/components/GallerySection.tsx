import React, { useState, useEffect } from 'react';
import { GALLERY_PHOTOS } from '../data/restaurantData';
import { GalleryPhoto } from '../types';
import { X, ChevronLeft, ChevronRight, ZoomIn, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

export const GallerySection: React.FC = () => {
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

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
    const nextIdx = (activeIndex + 1) % GALLERY_PHOTOS.length;
    setActiveIndex(nextIdx);
    setActivePhoto(GALLERY_PHOTOS[nextIdx]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx = (activeIndex === 0 ? GALLERY_PHOTOS.length - 1 : activeIndex - 1);
    setActiveIndex(prevIdx);
    setActivePhoto(GALLERY_PHOTOS[prevIdx]);
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
  }, [activePhoto, activeIndex]);

  return (
    <section
      id="gallery"
      className="py-16 sm:py-24 bg-[#F7F3EB] relative overflow-hidden"
      aria-label="Visual Gallery"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Buttery Smooth Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            VISUAL EXPERIENCE
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Visual Gallery
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Glimpses of our sizzling tandoor roasts, fragrant saffron mandi platters, and welcoming family dining atmosphere.
          </p>
        </motion.div>

        {/* Tight, clean CSS grid of 8 photos (aspect-square) with hover zoom + brighten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-[#2E4823]/5 p-2 sm:p-3">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.55,
                delay: idx * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={() => openLightbox(photo, idx)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 cursor-pointer shadow-sm"
              role="button"
              tabIndex={0}
              aria-label={`Open photo: ${photo.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openLightbox(photo, idx);
                }
              }}
            >
              {/* Image with zoom and brighten on hover */}
              <OptimizedImage
                src={photo.imageUrl}
                alt={photo.altText}
                className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-108 group-hover:brightness-105"
                containerClassName="w-full h-full"
              />

              {/* Centered '+' icon badge overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-12 h-12 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xl transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <Plus className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
              </div>

              {/* Hover Overlay with smooth fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex flex-col justify-end p-3 sm:p-4 text-white">
                <span className="text-[10px] sm:text-xs font-semibold text-[#D3452B] uppercase tracking-wider">
                  {photo.category}
                </span>
                <span className="font-['Playfair_Display'] text-xs sm:text-base font-bold leading-tight mt-0.5">
                  {photo.title}
                </span>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-white/80">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Click to expand</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with Smooth Fade + Scale Transition */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image Lightbox"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close Lightbox"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-60 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 sm:left-6 z-60 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 sm:right-6 z-60 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Image & Caption Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.altText}
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />

              <div className="mt-4 text-center text-white px-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#D3452B]">
                  {activePhoto.category}
                </span>
                <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold mt-1">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Image {activeIndex + 1} of {GALLERY_PHOTOS.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
