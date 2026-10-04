import React from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Home, ChevronRight, Phone, HeartHandshake, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { TrustedNeighborhood } from '../components/TrustedNeighborhood';
import { SignatureDishes } from '../components/SignatureDishes';
import { ClosingCTA } from '../components/ClosingCTA';

interface AboutPageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigateHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigateHome,
}) => {
  return (
    <div className="pt-4">
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO path="/about" jsonLd={getRestaurantSchema()} />

      {/* Subpage Header Banner */}
      <div className="bg-[#1C1C1C] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/assets/vaibhav-grand-webp-images/front6.webp"
            alt="About banner background"
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
            <span className="text-amber-400">About Us</span>
          </nav>

          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D3452B] block mb-2">
            OUR STORY &amp; HERITAGE
          </span>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            About Vaibhav Grand
          </h1>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Renigunta&rsquo;s trusted family dining landmark, known for firewood-style dum biryanis, char-grilled Mandi feasts &amp; pure hospitality &mdash; proudly serving Renigunta and the greater Tirupati area.
          </p>
        </div>
      </div>

      {/* Story Narrative Section */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D3452B] block mb-2">
                A LOCAL TRADITION
              </span>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E4823] leading-tight">
                Authentic Flavor, Fresh Ingredients &amp; True Family Care
              </h2>
              <div className="w-12 h-1 bg-[#D3452B] mt-3 mb-6 rounded-full" />
              
              <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  Located near Ramana Vilas Circle on Srikalahasthi Road, <strong>Vaibhav Grand Family Restaurant</strong> was born out of a passion to serve authentic Indian, royal Mughlai, and traditional Arabian specialties to our beloved community in Renigunta and the greater Tirupati area.
                </p>
                <p>
                  We believe that great food begins with respect for ingredients. Every cut of chicken and seafood is procured fresh every morning, marinated in hand-ground spices, and slow-cooked over firewood embers to lock in the genuine aromas of heritage cooking.
                </p>
                <p>
                  Whether you are traveling back from Tirumala temple, planning an intimate birthday celebration with family, or ordering a piping hot Dum Biryani bucket for home, we welcome you with open arms and generous hospitality.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenBookModal}
                  className="px-6 py-3 rounded-full bg-[#2E4823] hover:bg-[#233719] text-white font-bold text-sm shadow-md transition-all"
                >
                  Reserve a Table
                </button>
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#D3452B] hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us: {RESTAURANT_INFO.phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/assets/vaibhav-grand-webp-images/front6.webp"
                  alt="Vaibhav Grand Family Restaurant exterior on Srikalahasthi Road, Renigunta, Tirupati"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 text-xs">
                  <strong className="block text-[#2E4823] text-sm font-bold">
                    Vaibhav Grand Family Restaurant
                  </strong>
                  <span className="text-gray-500">
                    Plot 157, Ramana Vilas Circle, Renigunta, Tirupati
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Neighborhood Tribute */}
      <TrustedNeighborhood />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Signature Specialties */}
      <SignatureDishes />

      {/* Closing CTA */}
      <ClosingCTA
        onOpenOrderModal={onOpenOrderModal}
        onOpenBookModal={onOpenBookModal}
      />
    </div>
  );
};
