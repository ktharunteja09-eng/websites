import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const MobileActionBar: React.FC = () => {
  const whatsappUrl =
    'https://wa.me/917947142432?text=Hi%2C%20I%27d%20like%20to%20know%20more%20%2F%20book%20a%20table';

  return (
    <motion.aside
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
      id="mobile-sticky-action-bar"
      aria-label="Quick Mobile Actions"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#2E4823]/15 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] p-3 md:hidden"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        {/* Call Now Button */}
        <a
          href="tel:7947142432"
          id="mobile-bar-call-btn"
          className="min-h-[48px] rounded-xl bg-[#2E4823] text-[#FDFBF7] font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          <Phone className="w-4 h-4 text-white" />
          <span>Call Now</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="mobile-bar-whatsapp-btn"
          className="min-h-[48px] rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span>WhatsApp</span>
        </a>
      </div>
    </motion.aside>
  );
};
