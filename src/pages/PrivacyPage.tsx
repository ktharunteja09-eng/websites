import React from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Home, ChevronRight, ShieldCheck, Mail, Phone, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface PrivacyPageProps {
  onNavigateHome: () => void;
  onOpenOrderModal?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO
        path="/privacy"
        title="Privacy Policy | Vaibhav Grand Family Restaurant Renigunta"
        description="Read the Privacy Policy of Vaibhav Grand Family Restaurant. Learn how we handle customer details, table reservations, and direct online orders securely."
        jsonLd={getRestaurantSchema()}
      />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/front6.webp"
            alt="Privacy Policy banner background"
            width={1920}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover filter blur-xs"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 mb-4" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400">Privacy Policy</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            YOUR TRUST &amp; SECURITY
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            How we protect and respect your personal details when you dine, reserve tables, or order direct online.
          </p>
        </div>
      </div>

      {/* Main Content Area - Fully Scrollable */}
      <section className="py-12 sm:py-20 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-[#2E4823]/10 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            
            {/* Effective Date Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Effective: January {new Date().getFullYear()}</span>
            </div>

            <p className="text-base sm:text-lg text-gray-900 font-medium leading-relaxed">
              At <strong>{RESTAURANT_INFO.name}</strong>, we respect your privacy and are committed to safeguarding any personal information you entrust to us when visiting our restaurant, using our website, or placing direct online orders.
            </p>

            {/* Section 1 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Lock className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  1. Information We Collect
                </h2>
              </div>
              <p>
                When you place a direct delivery order, book a banquet or family booth, or get in touch with our kitchen team, we may collect the following details:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span><strong>Contact Information:</strong> Your full name, active mobile number, and optional email address.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span><strong>Delivery Details:</strong> Complete street address, nearby landmarks, and GPS pin coordinates solely for delivery routing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span><strong>Payment Verification:</strong> Customer-entered UPI transaction reference IDs used exclusively for order reconciliation with our billing system. We do not collect or store credit/debit card numbers or UPI PINs.</span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Eye className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  2. How We Use &amp; Protect Your Information
                </h2>
              </div>
              <p>
                Your details are utilized strictly for the operational fulfillment of your order or dining reservation:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Communicating order dispatch, kitchen preparation updates, and delivery driver coordination.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Confirming advance table bookings, banquet reservations, and event catering logistics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span><strong>Data Retention:</strong> Direct order records and customer coordinates are permanently wiped after 90 days. We never sell, rent, or trade your personal data to advertisers or third-party marketers.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <FileText className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  3. Third-Party Services (Swiggy &amp; Zomato)
                </h2>
              </div>
              <p>
                When ordering through aggregator partners such as Swiggy or Zomato, their respective privacy policies, location services, and payment gateway terms apply directly to those orders.
              </p>
            </div>

            {/* Section 4 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Phone className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  4. Contact &amp; Privacy Queries
                </h2>
              </div>
              <p>
                If you have any questions or wish to request data deletion regarding your direct orders, please reach out directly:
              </p>
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <strong className="block text-[#2E4823] font-bold">{RESTAURANT_INFO.name}</strong>
                  <span className="text-xs text-gray-600 block">{RESTAURANT_INFO.address}</span>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                    <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-[#D3452B] hover:underline flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {RESTAURANT_INFO.phone}
                    </a>
                    <a href={`mailto:${RESTAURANT_INFO.email}`} className="text-[#2E4823] hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {RESTAURANT_INFO.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-5 py-2.5 rounded-xl bg-[#2E4823] text-white text-xs sm:text-sm font-bold hover:bg-[#223719] transition-all shadow-xs"
                >
                  Back to Home
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
