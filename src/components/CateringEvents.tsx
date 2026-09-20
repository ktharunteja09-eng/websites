import React from 'react';
import { Cake, Briefcase, Phone, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

export const CateringEvents: React.FC = () => {
  return (
    <section
      id="catering"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden"
      aria-label="Catering and Private Celebrations"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Buttery Smooth Scroll Reveal */}
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
            From intimate birthday parties to corporate feasts and bulk biryani buckets, let us bring royal warmth to your celebration.
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
                Intimate celebrations with friends and family. Enjoy reserved air-conditioned booths, personalized multi-course banquet menus, celebratory dessert platters, and attentive host support.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1C1C1C]/85">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Customizable Mandi platters &amp; Dum Biryani buckets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Reserved family seating with pleasant ambient music</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Cake cutting setup &amp; special dessert surprises</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2E4823]/10">
              <a
                href="tel:7947142432"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#D3452B] hover:text-[#BD3B22] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call 7947142432 to book party tables</span>
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
                Professional space for office gatherings and team celebrations. Hot biryani buckets, Mandi platters, and full corporate catering packages delivered steaming hot and on schedule.
              </p>

              <ul className="space-y-2.5 text-sm text-[#1C1C1C]/85">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Bulk orders with hygienic thermal packaging</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>GST invoice support for corporate accounts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                  <span>Punctual delivery to Renigunta &amp; Tirupati business hubs</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2E4823]/10">
              <a
                href="tel:7947142432"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E4823] hover:text-[#18310F] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call 7947142432 for corporate packages</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Small photo gallery specifically for celebration photos */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2E4823]/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823]">
                Celebration Highlights
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                Memorable birthday parties and joyous family milestones hosted at Vaibhav Grand.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#D3452B] bg-[#D3452B]/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
              Real Guest Memories (More uploaded soon)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden group">
              <OptimizedImage
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5-8QddXDcJKEqBG9vb1tCEJz7vihSvnheuGKxsjS7jlOlOCXXctVmfFk-fF8SuHP-2f_via00hQPw69PebDVr3F8i-HGElSH7ReBR0P1W-AtYx7kuqSzB5fnrhGs_u3gLyErRzp9fiaVfQonj5hh-W9KL3MGjsGlynWzKiRK2vJdbQ7rgOHAqIbgTpCSVJECxIOd25wrs086A2qAmwdjnfR9Pt00Lg3bTBvchwopk8k2loC71_UeG-w"
                alt="Birthday party celebration setup at Vaibhav Grand"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">Birthday Table Decorations</span>
              </div>
            </div>

            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden group">
              <OptimizedImage
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8ZZMhezpLLgAfrxt2KuNbjnk3Roco8_Fyt9aWQknBJaW2f-CI5InUCBZdLR_FzCI9_alnlnXD4hKfKT28hDz-I-sTlsydublhQjM7-VStjUZ346u9d8dg8GBT0KnK-QFhkDdHS2D4UK4d6AGJq883fWO7iPAhfAaQdRfP7EHgjNAZgn4zn2J997FoLshoOr2MFxWTPqEFZwjg9qUJ5li4NlPHYzbR8dQE83rZV8fmLpt70sgQdZTfkQ"
                alt="Family dinner banquet celebration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">AC Dining Family Hall</span>
              </div>
            </div>

            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden group">
              <OptimizedImage
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrSixTzzhkFhTcbByjcyEuITdjWOkjj2UdX3gNeI-A7_wcZ_bqRNq0r9L9bMYGNI9v6fpjrjPMyJI5vEA7Ldffp4EW66OVjqxU87f7vb5knCSy8ecVVJCt38fn0oKnUX9G1wc0ZRhZ6VXW_DFkO06kKJEPtEcO6xn2OyWf2ao8wSnrwgTFB8QSNzNtAnS9h9NgaWqkl1jUXmrD4O5MUEAa2DpgaZ5yrDDyhA-Mn6xNGkpk9MRPEuohOg"
                alt="Communal feast Mandi platter for party"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                <span className="text-white text-xs font-semibold">Grand Communal Feast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
