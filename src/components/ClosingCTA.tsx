import React from 'react';
import { motion } from 'motion/react';
import { Phone, UtensilsCrossed, Clock, MapPin } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface ClosingCTAProps {
  onOpenOrderModal?: () => void;
}

export const ClosingCTA: React.FC<ClosingCTAProps> = ({ onOpenOrderModal }) => {
  return (
    <section
      id="closing-cta"
      className="relative py-20 sm:py-28 overflow-hidden bg-[#141414] text-white"
      aria-label="Call to Action: Reserve or Order"
    >
      {/* Background Image: Blurred Food Photo with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/chicken_mandi_hero_1789894879370.webp"
          alt="Vaibhav Grand authentic feast spread"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-[4px] scale-105 opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/90" />
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
            VISIT US TODAY OR ORDER HOME
          </span>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready for an Unforgettable Family Meal?
          </h2>

          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />

          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether relaxing in our cool air-conditioned dining room or relishing steaming hot dum biryani at home, our kitchen is fired up and ready to serve you.
          </p>

          {/* Action Buttons: Reserve a Table & Order Online */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Reserve a Table Button */}
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              id="closing-cta-reserve-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#2E4823] hover:bg-[#24391c] text-white font-semibold text-base shadow-[0_4px_20px_rgba(46,72,35,0.4)] hover:shadow-[0_6px_25px_rgba(46,72,35,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Phone className="w-5 h-5 text-[#D3452B]" />
              <span>Reserve a Table</span>
            </a>

            {/* Order Online Button (opens order modal or links to Swiggy/Zomato) */}
            {onOpenOrderModal ? (
              <button
                type="button"
                onClick={onOpenOrderModal}
                id="closing-cta-order-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D3452B] hover:bg-[#BD3B22] text-white font-semibold text-base shadow-[0_4px_20px_rgba(211,69,43,0.4)] hover:shadow-[0_6px_25px_rgba(211,69,43,0.6)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span>Order Online</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={RESTAURANT_INFO.swiggyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-semibold text-sm shadow-md transition-all transform hover:scale-105"
                >
                  <span>Swiggy</span>
                </a>
                <a
                  href={RESTAURANT_INFO.zomatoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-semibold text-sm shadow-md transition-all transform hover:scale-105"
                >
                  <span>Zomato</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Info Badges */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Open Daily 12:00 PM &ndash; 11:00 PM
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D3452B]" />
              Opposite HP Petrol Pump, Ramana Vilas Circle, Renigunta
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              Call: {RESTAURANT_INFO.phone}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
