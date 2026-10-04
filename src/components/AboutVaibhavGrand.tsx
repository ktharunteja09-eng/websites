import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Utensils, HeartHandshake, ShieldCheck, Flame, Calendar, ArrowRight } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface AboutVaibhavGrandProps {
  onOpenBookModal: () => void;
  onNavigateAbout: () => void;
}

export const AboutVaibhavGrand: React.FC<AboutVaibhavGrandProps> = ({
  onOpenBookModal,
  onNavigateAbout,
}) => {
  return (
    <section
      id="about-vaibhav"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden"
      aria-label="About Vaibhav Grand Family Restaurant"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Image Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Main Featured Photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-square bg-gray-100 group">
              <img
                src="/assets/vaibhav-grand-webp-images/food14.webp"
                alt="Vaibhav Grand Royal Platter and Authentic Dining in Renigunta, Tirupati"
                width={800}
                height={800}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block">
                  Signature Arabic Platter
                </span>
                <p className="font-['Playfair_Display'] text-lg font-bold">
                  Vaibhav Special Mandi Feast
                </p>
              </div>
            </div>

            {/* Overlapping Secondary Card (Ambiance) */}
            <div className="hidden sm:block absolute -bottom-8 -right-6 w-52 h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 group">
              <img
                src="/assets/vaibhav-grand-webp-images/ambiance.webp"
                alt="Vaibhav Grand Warm Ambiance"
                width={400}
                height={350}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold text-center bg-black/60 backdrop-blur-xs py-1 px-2 rounded-lg">
                Warm Family Ambiance
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -top-4 -left-4 bg-[#2E4823] text-white p-3.5 rounded-2xl shadow-lg border border-amber-400/30 flex items-center gap-2.5 z-20">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Renigunta • Tirupati Landmark
                </div>
                <div className="text-xs font-bold">1,001+ Verified Reviews</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative Content */}
          <motion.article
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
              SOMETHING ABOUT VAIBHAV GRAND
            </span>
            
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight leading-tight">
              Authentic Firewood Cooking, Arabian Traditions &amp; Royal Mughlai Feasts
            </h2>
            
            <div className="w-16 h-1 bg-[#D3452B] mt-4 mb-6 rounded-full" />

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Conveniently situated near Ramana Vilas Circle on Srikalahasthi Road,{' '}
                <strong className="text-[#2E4823]">Vaibhav Grand Family Restaurant</strong> is
                celebrated for authentic dining across Renigunta and the greater Tirupati area. Inspired by traditional dum-cooking
                methods and authentic Arabian hearths, we bring families and food lovers together over
                steaming platters of rich, unforgettable flavors.
              </p>
              <p>
                From tender cuts of fresh, 100% Halal chicken roasted over glowing charcoal, to whole-spice
                infused basmati dum biryanis and communal Mandi platters, each recipe is handcrafted by our master
                chefs without cutting corners. Whether you are returning from the holy Tirumala pilgrimage or
                celebrating an anniversary with loved ones, our doors are open 365 days a year with warm, royal hospitality.
              </p>
            </div>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-3.5 mt-6 pt-4 border-t border-[#2E4823]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-[#D3452B]" />
                </div>
                <div className="text-xs font-bold text-gray-900">Firewood Dum Cooking</div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#2E4823]" />
                </div>
                <div className="text-xs font-bold text-gray-900">100% Halal Fresh Cuts</div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-4 h-4 text-[#2E4823]" />
                </div>
                <div className="text-xs font-bold text-gray-900">Warm Family Seating</div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4 text-[#D3452B]" />
                </div>
                <div className="text-xs font-bold text-gray-900">120+ Grand Dishes</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onNavigateAbout}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2E4823] hover:bg-[#233719] text-white font-bold text-sm shadow-md transition-all transform hover:scale-[1.02]"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenBookModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-[#2E4823] font-bold text-sm border-2 border-[#2E4823] transition-all transform hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4 text-[#D3452B]" />
                <span>Call to Book a Table</span>
              </button>
            </div>

          </motion.article>

        </div>
      </div>
    </section>
  );
};
