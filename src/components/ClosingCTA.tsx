import React from 'react';
import { motion } from 'motion/react';
import { Phone, UtensilsCrossed, Clock, MapPin, Calendar } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface ClosingCTAProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
}

export const ClosingCTA: React.FC<ClosingCTAProps> = ({ onOpenOrderModal, onOpenBookModal }) => {
  return (
    <section
      id="closing-cta"
      className="relative py-20 sm:py-28 overflow-hidden bg-[#141414] text-white"
      aria-label="Call to Action: Reserve or Order"
    >
      {/* Background Image: Real Food Photo with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/vaibhav-grand-webp-images/food14.webp"
          alt="Vaibhav Grand authentic feast spread served in Renigunta, Tirupati"
          width={1920}
          height={1080}
          loading="lazy"
          className="w-full h-full object-cover object-center filter blur-[4px] scale-105 opacity-30 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/85 to-[#141414]/90" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow Label */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-3 block">
            VISIT US TODAY OR ORDER TO YOUR DOORSTEP
          </span>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready for an Unforgettable Family Meal?
          </h2>

          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />

          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether relaxing in our cool air-conditioned dining room or relishing steaming hot dum biryani at home, our kitchen is fired up and ready to serve you.
          </p>

          {/* Action Buttons: Call to Book & Order Online */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Call to Book Button */}
            <button
              type="button"
              onClick={onOpenBookModal}
              id="closing-cta-reserve-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#2E4823] hover:bg-[#24391c] text-white font-semibold text-base shadow-[0_4px_20px_rgba(46,72,35,0.4)] hover:shadow-[0_6px_25px_rgba(46,72,35,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>Call to Book</span>
            </button>

            {/* Order Online Button */}
            <button
              type="button"
              onClick={onOpenOrderModal}
              id="closing-cta-order-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D3452B] hover:bg-[#BD3B22] text-white font-semibold text-base shadow-[0_4px_20px_rgba(211,69,43,0.4)] hover:shadow-[0_6px_25px_rgba(211,69,43,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span>Order Online</span>
            </button>
          </div>

          {/* Direct Takeaway Prompt */}
          <div className="mt-5 text-center">
            <p className="text-xs sm:text-sm text-gray-300">
              Prefer to call? Order directly at{' '}
              <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-[#D3452B] hover:underline font-bold">
                {RESTAURANT_INFO.phone}
              </a>{' '}
              for takeaway!
            </p>
          </div>

          {/* Quick Info Badges */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Open Daily 12:00 PM &ndash; 11:00 PM
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D3452B]" />
              Plot 157, Ramana Vilas Circle, Renigunta
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
