import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Flame, 
  Users, 
  BadgePercent, 
  CheckCircle2, 
  Snowflake, 
  ShieldCheck, 
  Car, 
  Star, 
  Sparkles, 
  ArrowRight,
  Phone,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from './SmoothScrollProvider';

interface FamilyPillar {
  id: string;
  tabTitle: string;
  tabIcon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  headline: string;
  description: string;
  naturalImage: string;
  imageAlt: string;
  perks: string[];
  recommendedDish: {
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

  const pillars: FamilyPillar[] = [
    {
      id: 'family-gatherings',
      tabTitle: 'Family AC Comfort',
      tabIcon: Users,
      title: 'Family Comfort & Cool Seating',
      badge: '100% Air Conditioned',
      headline: 'A welcoming, relaxed retreat for dinners, birthdays, and celebrations',
      description: 'Step out of the warm Tirupati sun into our cool, air-conditioned dining room. Designed thoughtfully with spacious tables, comfortable banquet chairs, and dedicated family sections so everyone from toddlers to grandparents feels at home.',
      naturalImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900&auto=format&fit=crop',
      imageAlt: 'Comfortable air conditioned family dining room tables with warm ambient lighting',
      perks: [
        'Dedicated family booths with ample elbow room for big groups',
        'Customizable mild spice levels suitable for kids & elders',
        'Spotless, well-maintained dining space and hygienic restrooms',
        'Birthday & small event celebration assistance with cake service'
      ],
      recommendedDish: {
        name: 'Chicken Reshmi Kebab Biryani',
        portion: 'Silky, mild & rich',
        price: '₹340',
        tag: 'Kid & Elder Friendly'
      }
    },
    {
      id: 'sharing-platters',
      tabTitle: 'Generous Platters & Buckets',
      tabIcon: UtensilsCrossed,
      title: 'Communal Feasting Made Affordable',
      badge: 'Bountiful Sharing',
      headline: 'Grand Mandi platters & Biryani buckets crafted for 3 to 6 people',
      description: 'Dining is best enjoyed together. Rather than ordering multiple individual plates, our signature Arabic Mandi platters and Hyderabadi Dum Biryani buckets bring whole families around a single delicious feast with generous servings.',
      naturalImage: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=900&auto=format&fit=crop',
      imageAlt: 'Traditional Arabic Mandi platter with long-grain spiced basmati rice and char-grilled chicken',
      perks: [
        'Vaibhav Special Mandi generously serves 3–4 adults with Salan & chutney',
        'Biryani Buckets save up to 25% compared to individual single portions',
        'Includes complimentary accompaniments: boiled eggs, salan & raita',
        'Fast and sturdy parcel packaging if you prefer taking the feast home'
      ],
      recommendedDish: {
        name: 'Vaibhav Special Chicken Mandi',
        portion: 'Family Platter (Serves 3-4)',
        price: '₹699',
        tag: 'Bestselling Platter'
      }
    },
    {
      id: 'fresh-quality',
      tabTitle: '100% Halal & Fresh Daily',
      tabIcon: ShieldCheck,
      title: 'Uncompromising Kitchen Purity',
      badge: 'Pure & Wholesome',
      headline: 'Fresh local meats, pure spices, and zero reused cooking oils',
      description: 'We feed your family what we feed our own. Every cut of chicken and mutton is 100% Halal and procured fresh every morning. We slow-simmer our gravies with whole roasted spices, fresh malai paneer, and strictly zero artificial taste enhancers.',
      naturalImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=900&auto=format&fit=crop',
      imageAlt: 'Freshly prepared char-grilled tandoori chicken with hand-pounded spices and fresh herbs',
      perks: [
        '100% certified Halal meats prepared under strict hygienic protocols',
        'Traditional clay tandoors and slow wood-fire dum for authentic aromas',
        'No artificial colors or excess additives in our curries and biryanis',
        'Fresh batch cooking ensures food is served piping hot directly to your table'
      ],
      recommendedDish: {
        name: 'Sizzling Tandoori Chicken',
        portion: 'Full / Half Platter',
        price: '₹320',
        tag: 'Clay Oven Roasted'
      }
    },
    {
      id: 'convenience-parking',
      tabTitle: 'Highway Location & Parking',
      tabIcon: Car,
      title: 'Hassle-Free Pilgrimage & Transit Stop',
      badge: 'Prime Highway Access',
      headline: 'Opposite HP Petrol Pump with spacious, easy parking',
      description: 'Whether you are returning from Lord Venkateswara’s darshan, heading to Srikalahasthi temple, or traveling to Tirupati Airport, our prime highway location on Srikalahasthi Road offers swift entry, hassle-free parking, and fast 15-minute service.',
      naturalImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop',
      imageAlt: 'Welcoming dining environment convenient for transit passengers and pilgrims',
      perks: [
        'Direct roadside landmark opposite HP Petrol Pump on Mangalam Road',
        'Ample dedicated parking space for four-wheelers and two-wheelers',
        'Quick 15-minute preparation time ideal for travelers on a schedule',
        'Close to Renigunta Junction (5 mins) and Tirupati Airport (15 mins)'
      ],
      recommendedDish: {
        name: 'Chicken Dum Biryani Bucket',
        portion: 'Quick Travel Pack',
        price: '₹450',
        tag: 'Fast Takeaway'
      }
    }
  ];

  const currentPillar = pillars[activeTab];

  return (
    <section
      id="why-us"
      className="py-16 sm:py-24 bg-[#F7F3EB] border-y border-[#2E4823]/10 relative overflow-hidden"
      aria-label="Why Families Choose Us"
    >
      {/* Subtle geometric background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2E4823_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          {/* Eyebrow Label in burnt orange */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
            OUR COMMITMENT
          </span>
          
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Why Families Choose Us
          </h2>
          
          <div className="w-20 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            From pilgrim groups returning from the hill shrine to weekend family get-togethers, discover why locals and travelers trust Vaibhav Grand for wholesome meals and genuine warmth.
          </p>
        </motion.div>

        {/* 4 Redesigned Feature Cards with Circular Icon Badges & Subtle Learn More Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Diverse Menu -> Links to #menu */}
          <div className="bg-white rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_20px_rgba(46,72,35,0.04)] hover:shadow-[0_8px_30px_rgba(46,72,35,0.08)] hover:border-[#2E4823]/25 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-full bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823] mb-2 group-hover:text-[#D3452B] transition-colors">
                Diverse Menu
              </h3>
              <p className="text-sm text-[#1C1C1C]/75 leading-relaxed">
                From Mughlai and Chinese to authentic Arabic Mandi platters, rich gravies, and clay oven tandoors.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#2E4823]/10">
              <button
                type="button"
                onClick={() => scrollTo('#menu', { offset: -70, duration: 1.15 })}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors group/link cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Signature Specialties -> Links to #specialties */}
          <div className="bg-white rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_20px_rgba(46,72,35,0.04)] hover:shadow-[0_8px_30px_rgba(46,72,35,0.08)] hover:border-[#2E4823]/25 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-full bg-[#D3452B]/10 text-[#D3452B] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823] mb-2 group-hover:text-[#D3452B] transition-colors">
                Signature Specialties
              </h3>
              <p className="text-sm text-[#1C1C1C]/75 leading-relaxed">
                Try our celebrated Chicken Reshmi Kebab Biryani, smoky tandoori chicken, and dum mutton mandi.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#2E4823]/10">
              <button
                type="button"
                onClick={() => scrollTo('#specialties', { offset: -70, duration: 1.15 })}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors group/link cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Family Vibes -> Links to #gallery */}
          <div className="bg-white rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_20px_rgba(46,72,35,0.04)] hover:shadow-[0_8px_30px_rgba(46,72,35,0.08)] hover:border-[#2E4823]/25 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-full bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823] mb-2 group-hover:text-[#D3452B] transition-colors">
                Family Vibes
              </h3>
              <p className="text-sm text-[#1C1C1C]/75 leading-relaxed">
                Spotless, cool, air-conditioned retreat designed for comfortable family dinners, birthdays, and celebrations.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#2E4823]/10">
              <button
                type="button"
                onClick={() => scrollTo('#gallery', { offset: -70, duration: 1.15 })}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors group/link cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Great Value -> Links to #menu */}
          <div className="bg-white rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_20px_rgba(46,72,35,0.04)] hover:shadow-[0_8px_30px_rgba(46,72,35,0.08)] hover:border-[#2E4823]/25 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-full bg-[#D3452B]/10 text-[#D3452B] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <BadgePercent className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E4823] mb-2 group-hover:text-[#D3452B] transition-colors">
                Great Value
              </h3>
              <p className="text-sm text-[#1C1C1C]/75 leading-relaxed">
                Generous communal portions, authentic culinary recipes, and pocket-friendly family meal options.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#2E4823]/10">
              <button
                type="button"
                onClick={() => scrollTo('#menu', { offset: -70, duration: 1.15 })}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors group/link cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 4-Item Quick Trust Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-5xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#2E4823]/10 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[#D3452B] font-bold text-lg">
              <Star className="w-5 h-5 fill-current" />
              <span>3.6 / 5.0</span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70 mt-1 font-medium">1,001+ Verified Reviews</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#2E4823]/10 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#2E4823] font-bold text-lg">
              <Snowflake className="w-5 h-5" />
              <span>100% AC</span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70 mt-1 font-medium">Chilled Family Seating</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#2E4823]/10 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#2E4823] font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#2E4823]" />
              <span>100% Halal</span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70 mt-1 font-medium">Daily Procured Fresh Meats</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#2E4823]/10 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-[#D3452B] font-bold text-lg">
              <Car className="w-5 h-5" />
              <span>Easy Parking</span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70 mt-1 font-medium">Opp. HP Petrol Pump</p>
          </div>
        </motion.div>

        {/* Interactive Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/5 border border-[#2E4823]/10 max-w-full overflow-x-auto no-scrollbar">
            {pillars.map((pillar, idx) => {
              const TabIcon = pillar.tabIcon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#2E4823] text-white shadow-sm'
                      : 'text-[#1C1C1C]/70 hover:text-[#2E4823] hover:bg-white/50'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#D3452B]' : 'text-[#2E4823]/60'}`} />
                  <span>{pillar.tabTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Showcase Panel for Selected Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPillar.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-[#2E4823]/15 shadow-[0_12px_40px_rgba(46,72,35,0.06)] overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Left Details Column (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-[#D3452B] uppercase tracking-wider bg-[#D3452B]/10 px-3 py-1 rounded-full">
                      {currentPillar.badge}
                    </span>
                    <span className="text-xs font-medium text-[#2E4823]/75 bg-[#2E4823]/5 px-2.5 py-1 rounded-full">
                      Vaibhav Standard
                    </span>
                  </div>

                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E4823] leading-snug">
                    {currentPillar.title}
                  </h3>

                  <p className="mt-3 text-base font-medium text-[#1C1C1C] leading-relaxed">
                    {currentPillar.headline}
                  </p>

                  <p className="mt-3 text-sm sm:text-base text-[#1C1C1C]/75 leading-relaxed font-normal">
                    {currentPillar.description}
                  </p>

                  {/* 4 Feature Checklist Items */}
                  <div className="mt-6 pt-6 border-t border-[#2E4823]/10">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#2E4823] mb-3.5">
                      What Your Family Can Expect:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPillar.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-sm text-[#1C1C1C]/85">
                          <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Highlight Strip: Recommended Dish & Actions */}
                <div className="mt-8 pt-6 border-t border-[#2E4823]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-[#F7F3EB] px-4 py-2.5 rounded-xl border border-[#2E4823]/10">
                    <div className="w-2 h-2 rounded-full bg-[#D3452B]" />
                    <div>
                      <span className="text-[11px] font-semibold text-[#D3452B] block uppercase tracking-wider">
                        {currentPillar.recommendedDish.tag}
                      </span>
                      <span className="text-sm font-bold text-[#2E4823]">
                        {currentPillar.recommendedDish.name} ({currentPillar.recommendedDish.price})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPortionModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors cursor-pointer py-2 px-3 rounded-lg hover:bg-[#2E4823]/5"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Portion Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollTo('#menu', { offset: -70, duration: 1.15 })}
                      className="inline-flex items-center gap-2 bg-[#2E4823] hover:bg-[#23371b] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      <span>Explore Menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Natural Food/Ambiance Image Column (5 cols) */}
              <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full overflow-hidden bg-gray-100">
                <img
                  src={currentPillar.naturalImage}
                  alt={currentPillar.imageAlt}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle gradient vignette for photographic contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {/* Natural Photo Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/20">
                  Natural Kitchen &amp; Dining
                </div>

                {/* Quick Call Out at Bottom of Image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs text-white/80 font-normal block">
                    {currentPillar.tabTitle}
                  </span>
                  <p className="text-sm font-semibold drop-shadow-sm">
                    {currentPillar.recommendedDish.portion}
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* 4 Bottom Micro-Cards for Instant Scanning */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {pillars.map((pillar, pIdx) => {
            const isSelected = activeTab === pIdx;
            const Icon = pillar.tabIcon;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveTab(pIdx)}
                className={`text-left p-4 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isSelected 
                    ? 'bg-white border-[#2E4823] shadow-md -translate-y-0.5' 
                    : 'bg-[#FDFBF7] border-[#2E4823]/10 hover:border-[#2E4823]/30 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#2E4823] text-white' : 'bg-[#2E4823]/10 text-[#2E4823]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#D3452B]' : 'text-[#1C1C1C]/60'}`}>
                    {pillar.badge}
                  </span>
                </div>
                <h4 className="font-bold text-[#2E4823] text-sm mb-1">{pillar.tabTitle}</h4>
                <p className="text-xs text-[#1C1C1C]/70 line-clamp-2 leading-relaxed">
                  {pillar.headline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Quick Family Reservation Banner */}
        <div className="mt-12 bg-[#2E4823] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <span className="text-xs font-bold text-[#D3452B] uppercase tracking-wider block mb-1">
              Visiting with 6+ People?
            </span>
            <h4 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold">
              Reserve Large Family Tables in Advance
            </h4>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Avoid weekend waiting times. Call us directly to have your air-conditioned family booth prepared with your preferred appetizers ready upon arrival.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="tel:7947142432"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#D3452B] hover:bg-[#BD3B22] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call 7947142432</span>
            </a>
          </div>
        </div>

      </div>

      {/* Portion Guide Modal */}
      <AnimatePresence>
        {portionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#2E4823]/15 relative"
            >
              <button
                type="button"
                onClick={() => setPortionModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close portion guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-[#D3452B] mb-2">
                <UtensilsCrossed className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Family Dining Advice</span>
              </div>

              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823] mb-4">
                Family Portion &amp; Order Guide
              </h3>

              <div className="space-y-4 text-sm text-[#1C1C1C]/80">
                <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#2E4823]/10">
                  <p className="font-bold text-[#2E4823] mb-1">🥘 For 2–3 People:</p>
                  <p>1 Chicken Dum Biryani Bucket (₹450) or 1 Tandoori Starter + 1 Biryani Single.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#2E4823]/10">
                  <p className="font-bold text-[#2E4823] mb-1">👑 For 4–5 People:</p>
                  <p>1 Vaibhav Special Chicken Mandi Platter (₹699) + 1 Tandoori Chicken Starter (₹320). Perfect balanced feast!</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#2E4823]/10">
                  <p className="font-bold text-[#2E4823] mb-1">🎉 For 6+ People (Celebrations):</p>
                  <p>1 Mandi Platter + 1 Biryani Bucket + 2 Tandoor Platters + Butter Naans & Gravy. Customizes easily for all palates.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPortionModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#2E4823] text-white text-xs font-semibold hover:bg-[#23371b] transition-colors cursor-pointer"
                >
                  Got It, Thanks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
