import React from 'react';
import { Phone, X, Clock, MapPin, Users, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { BrandEmblem } from './BrandEmblem';
import { useScrollLock } from '../utils/scrollLock';

interface CallToBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallToBookModal: React.FC<CallToBookModalProps> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm touch-none"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#2E4823]/15 overflow-hidden z-10"
        >
          {/* Header banner */}
          <div className="bg-[#2E4823] text-white p-6 sm:p-7 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <BrandEmblem className="w-8 h-8 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                Table Reservations &amp; Gatherings
              </span>
            </div>

            <p role="heading" aria-level={2} className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold">
              Reserve Your Table
            </p>
            <p className="text-xs sm:text-sm text-white/80 mt-1">
              Call our host stand directly for quick table bookings, family celebrations &amp; Mandi platters.
            </p>
          </div>

          {/* Body content */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Primary Call Button */}
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="w-full py-4 px-6 rounded-2xl bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="w-6 h-6 animate-pulse" />
              <span>Call Now: {RESTAURANT_INFO.phone}</span>
            </a>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
              <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#2E4823]/10 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1C1C1C] font-semibold">Dining Hours</strong>
                  <span>12:00 PM – 11:00 PM (Every Day)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#2E4823]/10 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1C1C1C] font-semibold">Group Seating</strong>
                  <span>Spacious AC booths &amp; Party tables</span>
                </div>
              </div>
            </div>

            {/* Reservation Advice */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                Walk-ins Always Welcome!
              </p>
              <span>
                For groups of 5 or more, birthday party balloon setups, or pre-ordering large Vaibhav Special Mandi platters, we recommend calling 1 to 2 hours ahead of your arrival.
              </span>
            </div>

            {/* Address snippet */}
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-4 h-4 text-[#2E4823] shrink-0" />
              <span>Plot 157, Ramana Vilas Circle, Srikalahasthi Rd, Renigunta</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
