import React from 'react';
import { Cake, Briefcase, Phone, CheckCircle2, Sparkles, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';
import { RESTAURANT_INFO } from '../data/restaurantData';

export const CateringEvents: React.FC = () => {
  return (
    <section
      id="catering"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden scroll-mt-12"
      aria-label="Catering and Private Celebrations"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            CELEBRATE WITH US
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Catering &amp; Private Events
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            From intimate birthday celebrations to corporate gatherings and bulk biryani bucket deliveries across Renigunta and Tirupati, celebrate with authentic taste and warm hospitality.
          </p>
        </motion.div>

        {/* 2 Main Offerings: Birthdays & Corporate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Birthdays & Small Parties */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#F7F3EB] rounded-3xl p-8 sm:p-10 border border-[#2E4823]/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#D3452B]/10 text-[#D3452B] flex items-center justify-center mb-6">
                <Cake className="w-7 h-7" />
              </div>

              <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2E4823] mb-3">
                Birthdays &amp; Small Parties
              </h3>

              <p className="text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed mb-6">
                Great for intimate celebrations with friends and family. Enjoy reserved air-conditioned dining booths, custom Mandi platters, festive balloon decor arrangements, and delicious treats for all ages.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1C1C1C]/85">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Communal Mandi platters &amp; Dum Biryani family buckets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Reserved family AC seating with party decorations</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Cake cutting table setup &amp; special ice cream desserts</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2E4823]/10 flex flex-wrap items-center justify-between gap-4">
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#D3452B] hover:text-[#BD3B22] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {RESTAURANT_INFO.phone} to Reserve</span>
              </a>
              <a
                href={`mailto:${RESTAURANT_INFO.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#2E4823]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{RESTAURANT_INFO.email}</span>
              </a>
            </div>
          </motion.div>

          {/* Card 2: Corporate Events */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#F7F3EB] rounded-3xl p-8 sm:p-10 border border-[#2E4823]/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>

              <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2E4823] mb-3">
                Corporate Events
              </h3>

              <p className="text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed mb-6">
                A professional space for your office gatherings, team lunches, and farewells. We prepare generous corporate buffet packs and takeaway buckets delivered hot and on time across Renigunta &amp; Tirupati.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1C1C1C]/85">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Bulk Biryani buckets with hygienic thermal sealing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Customizable vegetarian and non-vegetarian menus</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Punctual delivery to Renigunta &amp; Tirupati business hubs</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2E4823]/10 flex flex-wrap items-center justify-between gap-4">
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2E4823] hover:text-[#18310F] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {RESTAURANT_INFO.phone} for Corporate Bookings</span>
              </a>
              <a
                href={`mailto:${RESTAURANT_INFO.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#2E4823]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{RESTAURANT_INFO.email}</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Real Celebration Photos from Vaibhav Grand */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2E4823]/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823]">
                Celebration Highlights at Vaibhav Grand
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Memorable birthday parties and joyous family milestones hosted in our dining hall.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#D3452B] bg-[#D3452B]/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
              Real Diners &amp; Celebrations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="relative h-56 rounded-2xl overflow-hidden group shadow-xs">
              <OptimizedImage
                src="/assets/vaibhav-grand-webp-images/ambiance.webp"
                alt="Birthday party celebration hall with festive balloons at Vaibhav Grand"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">Festive Balloon Hall Setup</span>
              </div>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden group shadow-xs">
              <OptimizedImage
                src="/assets/vaibhav-grand-webp-images/people.webp"
                alt="Family dining together at booth table in Vaibhav Grand"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">Happy Family Feasting Together</span>
              </div>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden group shadow-xs">
              <OptimizedImage
                src="/assets/vaibhav-grand-webp-images/food14.webp"
                alt="Grand communal feast Mandi platter for party"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">Grand Communal Mandi Platter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
