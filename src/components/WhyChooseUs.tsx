import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Flame, 
  Users, 
  BadgePercent, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Phone,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from './SmoothScrollProvider';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface WhyPoint {
  id: string;
  tabTitle: string;
  tabIcon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  headline: string;
  description: string;
  image: string;
  imageAlt: string;
  perks: string[];
  dishHighlight: {
    name: string;
    portion: string;
    price: string;
    tag: string;
  };
}

export const WhyChooseUs: React.FC = () => {
  const { scrollTo } = useLenis();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [portionModalOpen, setPortionModalOpen] = useState<boolean>(false);

  const pillars: WhyPoint[] = [
    {
      id: 'diverse-menu',
      tabTitle: 'Diverse Menu',
      tabIcon: UtensilsCrossed,
      title: 'Diverse Culinary Range',
      badge: 'Multi-Cuisine Delights',
      headline: 'From Mughlai and Chinese to Arabic specialties and Mandi platters!',
      description: 'Whether your family is craving authentic slow-roasted Arabian Mandi, piping hot Hyderabadi Dum Biryani, Indo-Chinese noodles, clay-oven tandoori chicken, or creamy paneer gravies with butter naan, our kitchen crafts over 120+ freshly prepared specialties under one roof.',
      image: '/assets/vaibhav-grand-webp-images/food14.webp',
      imageAlt: 'Gigantic Arabian Mandi platter with tender roasted chicken cuts, salad, and dips at Vaibhav Grand',
      perks: [
        'Arabian Mandi dastarkhwan platters (Chicken, Tandoori & Alfham)',
        'Traditional firewood-style Hyderabadi Dum Biryani & family buckets',
        'Sizzling clay-oven tandoor kebabs, Apollo fish & spicy Andhra starters',
        'Fiery Indo-Chinese noodles, fried rice & artisan chilled mojitos'
      ],
      dishHighlight: {
        name: 'Vaibhav Special Mandi',
        portion: 'Grand Feast (Serves 4–6)',
        price: '₹1,370',
        tag: 'Crowd Favorite'
      }
    },
    {
      id: 'signature-specialties',
      tabTitle: 'Signature Specialties',
      tabIcon: Flame,
      title: 'Legendary Recipes',
      badge: 'Chef Signature Flavors',
      headline: 'You have to try the Chicken Reshmi Kebab Biryani or the Mughlai Chicken Biryani.',
      description: 'Our master chefs take pride in time-honored slow-cooking methods. Our firewood-simmered dum biryanis, char-grilled kebabs, and velvety gravies feature hand-pounded spices, fresh cuts of meat, and aged long-grain basmati rice.',
      image: '/assets/vaibhav-grand-webp-images/food12.webp',
      imageAlt: 'Hyderabadi Chicken Dum Biryani handi served with boiled egg and spicy sizzling starter platter',
      perks: [
        'Mughlai Chicken Biryani with saffron, roasted cashews & tender chicken',
        'Silky melt-in-the-mouth Chicken Reshmi Kebabs with mint chutney',
        'Clay oven Tandoori Chicken marinated overnight in spiced hung curd',
        'Velvety Paneer Tikka Masala in rich cashew-tomato makhani gravy'
      ],
      dishHighlight: {
        name: 'Mughlai Chicken Biryani',
        portion: 'Aged Basmati & Cashews',
        price: '₹370',
        tag: 'Must Try'
      }
    },
    {
      id: 'family-vibes',
      tabTitle: 'Family Vibes',
      tabIcon: Users,
      title: 'Cool, Clean AC Comfort',
      badge: '100% Family Friendly',
      headline: 'It’s a clean, cool, and casual spot perfect for big family gatherings or birthday celebrations.',
      description: 'Escape the Tirupati heat into our cool air-conditioned family dining hall. Designed with spacious booths, comfortable seating, and festive party setups, we offer an inviting, respectful space where toddlers, youth, and grandparents dine comfortably together.',
      image: '/assets/vaibhav-grand-webp-images/ambiance.webp',
      imageAlt: 'Vaibhav Grand air conditioned family dining hall decorated with balloons for birthday celebration',
      perks: [
        'Spacious, spotless AC dining hall with private family booth seating',
        'Birthday & anniversary celebration assistance with balloon decor & cake table',
        'Courteous, family-first hospitality and attentive table service',
        'Convenient parking and highway connectivity near Ramana Vilas Circle'
      ],
      dishHighlight: {
        name: 'Chicken Dum Biryani Bucket',
        portion: 'Family Bucket (Serves 4–5)',
        price: '₹1,290',
        tag: 'Family Feast'
      }
    },
    {
      id: 'great-value',
      tabTitle: 'Great Value',
      tabIcon: BadgePercent,
      title: 'Pocket-Friendly Feasts',
      badge: 'Generous Portions',
      headline: 'You get generous portions and delicious food at very pocket-friendly prices!',
      description: 'Great dining shouldn’t break the bank. Our family buckets and grand Mandi platters provide bountiful portions designed for sharing, giving you unmatched quality, royal taste, and tremendous value for your hard-earned money.',
      image: '/assets/vaibhav-grand-webp-images/food2.webp',
      imageAlt: 'Grand communal Mandi platter shared among diners at Vaibhav Grand',
      perks: [
        'Generous family buckets that save significantly compared to single orders',
        'Bountiful Mandi platters accompanied by complimentary salad, mayo & salan',
        'Affordable daily prices for college students, families & pilgrims',
        'Direct takeaway and doorstep delivery via Swiggy & Zomato'
      ],
      dishHighlight: {
        name: 'Family Chicken Dum Biryani',
        portion: 'Feast for 3–4 Diners',
        price: '₹680',
        tag: 'Top Value'
      }
    }
  ];

  const current = pillars[activeTab];

  return (
    <section 
      id="why-us" 
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden scroll-mt-12"
      aria-label="Why Choose Vaibhav Grand"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            THE VAIBHAV GRAND ADVANTAGE
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Why Dine With Us?
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Four distinctive reasons why families, food lovers, and travelers choose Vaibhav Grand as Renigunta’s trusted culinary landmark.
          </p>
        </motion.div>

        {/* 4 Interactive Segmented Tabs */}
        <div className="flex justify-center mb-10 sm:mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 p-1.5 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/15 shadow-inner gap-1.5 w-full max-w-4xl">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.tabIcon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 relative ${
                    isActive
                      ? 'bg-[#2E4823] text-[#FDFBF7] shadow-md'
                      : 'text-gray-700 hover:text-[#2E4823] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-[#2E4823]'}`} />
                  <span className="truncate">{pillar.tabTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pillar Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#2E4823]/10 shadow-[0_8px_32px_rgba(46,72,35,0.06)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              {/* Left Column: Rich Copy, Perks, and Dish Highlight */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E4823]/10 text-[#2E4823] text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{current.badge}</span>
                  </div>

                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E4823] leading-tight">
                    {current.title}
                  </h3>

                  <p className="text-sm sm:text-base font-semibold text-[#D3452B] mt-2 italic">
                    "{current.headline}"
                  </p>

                  <p className="mt-4 text-sm sm:text-base text-[#1C1C1C]/80 leading-relaxed">
                    {current.description}
                  </p>

                  {/* Bullet Perks */}
                  <div className="mt-6 space-y-2.5">
                    {current.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Highlight Card & CTA */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="bg-[#F7F3EB] rounded-2xl p-3.5 px-4 border border-[#2E4823]/10 flex items-center gap-3 w-full sm:w-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        {current.dishHighlight.tag}
                      </span>
                      <strong className="text-sm font-bold text-[#2E4823] block">
                        {current.dishHighlight.name}
                      </strong>
                      <span className="text-xs text-gray-500">
                        {current.dishHighlight.portion}
                      </span>
                    </div>
                    <span className="ml-auto text-base font-extrabold text-[#D3452B]">
                      {current.dishHighlight.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => scrollTo('#menu', { offset: -70, duration: 1.1 })}
                      className="px-5 py-2.5 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <span>Explore Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`tel:${RESTAURANT_INFO.phone}`}
                      className="p-2.5 rounded-xl border border-gray-200 text-[#2E4823] hover:bg-[#2E4823]/10 transition-colors"
                      title="Call host stand"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Real Photo with Badge */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 group">
                  <img
                    src={current.image}
                    alt={current.imageAlt}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-300 block mb-0.5">
                      Vaibhav Grand Experience
                    </span>
                    <p className="text-sm font-bold drop-shadow-sm">
                      {current.title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
