import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'privacy' | 'terms' | '404';
}

export const PolicyModal: React.FC<ModalProps> = ({ isOpen, onClose, title, type }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-[#FDFBF7] text-[#1C1C1C] rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-[#2E4823]/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2E4823]/10 flex items-center justify-between bg-[#F7F3EB]">
          <div className="flex items-center gap-3">
            {type === 'privacy' ? (
              <ShieldCheck className="w-6 h-6 text-[#2E4823]" />
            ) : (
              <FileText className="w-6 h-6 text-[#2E4823]" />
            )}
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-white text-gray-500 hover:text-[#1C1C1C] hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-sm leading-relaxed text-gray-700 space-y-4">
          {type === 'privacy' && (
            <>
              <p className="font-medium text-gray-900">
                Effective Date: {new Date().getFullYear()}
              </p>
              <p>
                At <strong>{RESTAURANT_INFO.name}</strong>, we respect your privacy and are committed to protecting any personal details you share with us.
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                1. Information Collection
              </h4>
              <p>
                We only collect information necessary to fulfill table reservations, handle takeaway phone inquiries, and facilitate delivery through authorized third-party platforms (Swiggy and Zomato).
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                2. Third-Party Deliveries
              </h4>
              <p>
                When ordering through Swiggy or Zomato, their respective privacy terms and delivery guidelines govern your payment transactions and location tracking.
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                3. Contact Information
              </h4>
              <p>
                If you have questions regarding our privacy practices, please contact us at{' '}
                <a href={`mailto:${RESTAURANT_INFO.email}`} className="text-[#D3452B] underline">
                  {RESTAURANT_INFO.email}
                </a>{' '}
                or call {RESTAURANT_INFO.phone}.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p className="font-medium text-gray-900">
                Last updated: {new Date().getFullYear()}
              </p>
              <p>
                Welcome to <strong>{RESTAURANT_INFO.name}</strong>. By visiting our restaurant or ordering through our official online links, you agree to these standard terms:
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                1. Menu &amp; Pricing
              </h4>
              <p>
                All menu items, ingredients, and pricing are subject to seasonal market availability and may vary without prior notice. Delivery prices on Swiggy and Zomato may differ from our in-restaurant dine-in menu card.
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                2. Dining Reservations &amp; Events
              </h4>
              <p>
                Table reservations are held for up to 15 minutes past the scheduled booking time during peak lunch and dinner hours. For large parties and banquets, advance confirmation is appreciated.
              </p>
              <h4 className="font-bold text-[#2E4823] text-base pt-2">
                3. Hygiene &amp; Service
              </h4>
              <p>
                We maintain the highest standards of culinary hygiene, Halal preparation, and freshness. Please inform our servers beforehand regarding any dietary restrictions or spice preferences.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#2E4823]/10 bg-[#F7F3EB] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2E4823] text-white text-sm font-semibold hover:bg-[#223719] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
