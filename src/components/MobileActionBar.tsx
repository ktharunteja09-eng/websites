import React from 'react';
import { Phone, MessageCircle, Utensils, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface MobileActionBarProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
}) => {
  const whatsappUrl = `https://wa.me/91${RESTAURANT_INFO.phone}?text=Hi%2C%20I%27d%20like%20to%20reserve%20a%20table%20%2F%20order%20food%20at%20Vaibhav%20Grand`;

  return (
    <motion.aside
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
      id="mobile-sticky-action-bar"
      aria-label="Quick Mobile Actions"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#2E4823]/15 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] p-2.5 md:hidden"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Call to Book Table */}
        <button
          type="button"
          onClick={onOpenBookModal}
          id="mobile-bar-book-btn"
          className="min-h-[46px] rounded-xl bg-[#2E4823] text-[#FDFBF7] font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform"
        >
          <Calendar className="w-4 h-4 text-amber-300" />
          <span>Call to Book</span>
        </button>

        {/* Order Online (Swiggy / Zomato) */}
        <button
          type="button"
          onClick={onOpenOrderModal}
          id="mobile-bar-order-btn"
          className="min-h-[46px] rounded-xl bg-[#D3452B] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform"
        >
          <Utensils className="w-4 h-4" />
          <span>Order Online</span>
        </button>

        {/* WhatsApp Chat */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="mobile-bar-whatsapp-btn"
          className="min-h-[46px] rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>WhatsApp</span>
        </a>
      </div>
    </motion.aside>
  );
};
