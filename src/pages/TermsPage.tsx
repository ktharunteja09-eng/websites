import React from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Home, ChevronRight, FileText, CheckCircle2, Phone, Mail, Clock, ShieldCheck, Utensils } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface TermsPageProps {
  onNavigateHome: () => void;
  onOpenOrderModal?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO
        path="/terms"
        title="Terms of Service & Conditions | Vaibhav Grand Family Restaurant Renigunta"
        description="Review the Terms and Conditions for dine-in, advance table reservations, direct website takeaway, and catering orders at Vaibhav Grand Family Restaurant."
        jsonLd={getRestaurantSchema()}
      />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/front1.webp"
            alt="Terms and Conditions banner background"
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
            <span className="text-amber-400">Terms &amp; Conditions</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            TRANSPARENT GUEST POLICIES
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Clear, transparent policies for dining in, takeaway ordering, banquet reservations, and event catering.
          </p>
        </div>
      </div>

      {/* Main Content Area - Fully Scrollable */}
      <section className="py-12 sm:py-20 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-[#2E4823]/10 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            
            {/* Last Updated Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Last Updated: January {new Date().getFullYear()}</span>
            </div>

            <p className="text-base sm:text-lg text-gray-900 font-medium leading-relaxed">
              Welcome to <strong>{RESTAURANT_INFO.name}</strong>. By visiting our restaurant, ordering online through our direct portal, or reserving event banquets, you agree to the following terms:
            </p>

            {/* Section 1 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Utensils className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  1. Menu Pricing &amp; Seasonal Availability
                </h2>
              </div>
              <p>
                All menu items, fresh meat cuts, seafood catches, and prices are subject to daily market availability. While we make every effort to ensure accurate pricing across our digital menu and in-store printed cards:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Prices listed on our direct portal represent genuine in-store dine-in rates with ₹0 platform fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Third-party aggregator prices (Swiggy and Zomato) include their own service markups, commissions, and surge packaging charges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>We reserve the right to modify prices or substitute seasonal ingredients with prior guest consent.</span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Clock className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  2. Table Reservations &amp; Banquet Bookings
                </h2>
              </div>
              <p>
                To provide the best dining experience for all guests during busy pilgrimage and weekend rushes:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Standard table reservations are held for up to 15 minutes past the scheduled arrival time before being released to walk-in diners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>For birthday parties, corporate gatherings, or family groups of 10 or more, please confirm at least 2 hours in advance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Special arrangements such as custom balloon decor, pre-ordered Mandi dastarkhwan platters, or cake storage can be arranged upon prior notice.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <ShieldCheck className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  3. Hygiene, Food Quality &amp; Dietary Notes
                </h2>
              </div>
              <p>
                We adhere strictly to highest standards of food safety, cleanliness, and culinary ethics:
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>All chicken, mutton, and poultry cuts used in our kitchen are 100% Halal certified and prepared fresh daily.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Dedicated prep areas and separate cookware are maintained for vegetarian dishes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <span>Please alert our staff to any food allergies (such as dairy, peanuts, or cashews) or preferred spice levels when placing your order.</span>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5 text-[#2E4823]">
                <Phone className="w-5 h-5 text-[#D3452B] shrink-0" />
                <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
                  4. Direct Inquiries &amp; Host Stand Contact
                </h2>
              </div>
              <p>
                If you have any feedback, questions, or special requests regarding our terms or service:
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
