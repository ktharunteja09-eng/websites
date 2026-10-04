import React from 'react';
import { ExternalLink, Phone, X, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { useScrollLock } from '../utils/scrollLock';

interface OrderOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderOnlineModal: React.FC<OrderOnlineModalProps> = ({ isOpen, onClose }) => {
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
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#2E4823]/15 overflow-hidden z-10"
        >
          {/* Header banner */}
          <div className="bg-[#2E4823] text-white p-6 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5 text-amber-300 text-xs uppercase tracking-widest font-bold">
              <ShoppingBag className="w-4 h-4" />
              <span>Doorstep Delivery &amp; Takeaway</span>
            </div>

            <p role="heading" aria-level={2} className="font-['Playfair_Display'] text-2xl font-bold">
              Order Online
            </p>
            <p className="text-xs text-white/80 mt-1">
              Choose your preferred food delivery platform or order directly with our kitchen.
            </p>
          </div>

          {/* Platforms Body */}
          <div className="p-6 space-y-4">
            {/* Swiggy */}
            <a
              href={RESTAURANT_INFO.swiggyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#FC8019] hover:bg-[#E57315] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white text-[#FC8019] flex items-center justify-center font-extrabold text-sm shadow-xs">
                  S
                </span>
                <span>Order via Swiggy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Zomato */}
            <a
              href={RESTAURANT_INFO.zomatoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white text-[#E23744] flex items-center justify-center font-extrabold text-sm shadow-xs">
                  Z
                </span>
                <span>Order via Zomato</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Direct Phone Fallback Line */}
            <div className="pt-2 text-center border-t border-gray-200/80">
              <p className="text-xs sm:text-sm font-semibold text-[#2E4823]">
                Prefer to call? Order directly at{' '}
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="text-[#D3452B] hover:underline font-bold"
                >
                  {RESTAURANT_INFO.phone}
                </a>{' '}
                for takeaway!
              </p>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E4823]/10 hover:bg-[#2E4823] hover:text-white text-[#2E4823] font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
                <span>Call Kitchen: {RESTAURANT_INFO.phone}</span>
              </a>
            </div>

            {/* Legal Disclaimer */}
            <div className="pt-2 flex items-start gap-2 text-[11px] text-gray-400 italic">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
              <span>
                Prices, menu items, and availability are subject to change without notice. Delivery prices on Swiggy and Zomato may vary from our dine-in menu.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
