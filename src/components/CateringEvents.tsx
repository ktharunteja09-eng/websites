import React, { useState, useMemo } from 'react';
import {
  Cake,
  Briefcase,
  Phone,
  CheckCircle2,
  Sparkles,
  Mail,
  HeartHandshake,
  Flame,
  UtensilsCrossed,
  Users,
  Calendar,
  ShieldCheck,
  Award,
  Send,
  ArrowRight,
  Clock,
  ChevronRight,
  MessageCircle,
  Truck,
  PartyPopper,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface CateringEventsProps {
  onOpenBookModal?: () => void;
  showWeddingSpecialist?: boolean;
  isHomePage?: boolean;
}

type EventType = 'marriage' | 'birthday' | 'corporate' | 'bulk_biryani';

interface PackageTier {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  priceEstimate: string;
  minGuests: number;
  highlightColor: string;
  menuHighlights: string[];
  idealFor: string;
}

const CATERING_PACKAGES: PackageTier[] = [
  {
    id: 'silver-biryani',
    name: 'Silver Biryani Feast',
    tagline: 'Classic & Hearty Hyderabadi Feast',
    priceEstimate: '₹299 - ₹349 / head',
    minGuests: 30,
    highlightColor: 'border-slate-300',
    idealFor: 'Birthday celebrations, housewarmings & team lunches',
    menuHighlights: [
      'Welcome Fresh Lime Mint Cooler',
      '1 Non-Veg Starter (Chicken 65 or Chilli Chicken)',
      '1 Veg Starter (Crispy Veg Manchurian)',
      'Authentic Hyderabadi Chicken Dum Biryani Handi',
      'Rich Mirchi Ka Salan & Mint Onion Raita',
      'Hot Tandoori Roti with Dal Makhani',
      'Double Ka Meetha or Gulab Jamun with Rabri',
    ],
  },
  {
    id: 'gold-wedding',
    name: 'Royal Wedding Banquet',
    tagline: 'Our #1 Choice for Marriages & Engagements',
    badge: 'MOST POPULAR FOR MARRIAGES',
    priceEstimate: '₹499 - ₹599 / head',
    minGuests: 100,
    highlightColor: 'border-amber-400 ring-2 ring-amber-400/50',
    idealFor: 'Wedding receptions, engagements & grand family milestones',
    menuHighlights: [
      'Welcome Mocktail Station (Blue Lagoon & Virgin Mojito)',
      '2 Non-Veg Starters (Murgh Malai Tikka & Apollo Fish Fry)',
      '1 Veg Starter (Paneer Tikka Kebab)',
      'Traditional Hyderabadi Mutton Dum Biryani Handi',
      'Signature Arabian Chicken Mandi with Smoked Rice',
      'Fresh Butter Naan & Rumali Roti (Live Chafing)',
      'Vaibhav Butter Chicken & Mutton Rogan Josh Gravy',
      'Royal Shahi Tukda + Apricot Delight with Ice Cream',
      'Paan Counter & Mouth Freshener Station',
    ],
  },
  {
    id: 'emperor-grand',
    name: 'Emperor Multi-Course Live Banquet',
    tagline: 'The Ultimate Luxury Celebration with Live Counters',
    badge: 'LUXURY LIVE BUFFET',
    priceEstimate: '₹749 - ₹899 / head',
    minGuests: 150,
    highlightColor: 'border-emerald-600',
    idealFor: 'Grand destination weddings & executive corporate galas',
    menuHighlights: [
      'Live Clay-Oven Tandoor Station (Tandoori, Kebabs & Naans made on-site)',
      '3 Non-Veg Starters (Malai Tikka, Mutton Seekh, Crispy Pepper Prawns)',
      '2 Veg Starters (Paneer 65 & Mushroom Manchurian)',
      'Royal Charcoal-Sealed Mutton & Chicken Dum Biryani Degs',
      'Grand Arabian Whole-Mutton Mandi Platter Spread',
      'Rayalaseema Special Nattu Kodi Pulusu & Andhra Mutton Curry',
      'Assorted Bread Basket (Live Butter Naans, Kulchas & Parathas)',
      'Full Dessert Counter: Double Ka Meetha, Matka Kulfi & Fresh Fruit Salad',
      'Live Ice Cream Sundae & Beverage Bar',
      'Complete Uniformed Service Staff & Luxury Table Chafers',
    ],
  },
];

export const CateringEvents: React.FC<CateringEventsProps> = ({
  onOpenBookModal,
  showWeddingSpecialist = true,
  isHomePage = false,
}) => {
  // Interactive Quote Calculator State
  const [selectedEventType, setSelectedEventType] = useState<EventType>('marriage');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [cuisineChoice, setCuisineChoice] = useState<'wedding_royal' | 'biryani_handi' | 'mandi_spread'>('wedding_royal');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // WhatsApp Pre-filled message generator
  const whatsappQuoteUrl = useMemo(() => {
    const eventLabels: Record<EventType, string> = {
      marriage: 'Grand Marriage / Reception Catering',
      birthday: 'Birthday Party / Family Gathering',
      corporate: 'Corporate Banquet / Team Dinner',
      bulk_biryani: 'Bulk Biryani Handis & Takeaway Feast',
    };

    const cuisineLabels = {
      wedding_royal: 'Royal Multi-Course Non-Veg Banquet (Biryani, Mandi & Live Tandoor)',
      biryani_handi: 'Authentic Hyderabadi Mutton & Chicken Dum Biryani Handis',
      mandi_spread: 'Royal Arabian Mandi Communal Feast Spread',
    };

    const cleanNumber = (RESTAURANT_INFO.whatsapp || '7702104894').replace(/\D/g, '');
    const phoneWithCountry = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const message = `*👑 BULK CATERING & EVENT INQUIRY — VAIBHAV GRAND*
━━━━━━━━━━━━━━━━━━━━
👤 *Host / Organizer:* ${customerName.trim() || 'Valued Customer'}
📱 *Contact Phone:* ${customerPhone.trim() || 'Not specified'}
🎪 *Event Type:* ${eventLabels[selectedEventType]}
👥 *Estimated Guests:* ~${guestCount} Pax
🍽️ *Preferred Cuisine:* ${cuisineLabels[cuisineChoice]}
📍 *Event Location:* Renigunta / Tirupati / Srikalahasthi Region
━━━━━━━━━━━━━━━━━━━━
Hi Vaibhav Grand Team! We are planning an upcoming event and would like a detailed menu list, date availability, and a customized quotation. Please get back to us!`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  }, [selectedEventType, guestCount, cuisineChoice, customerName, customerPhone]);

  return (
    <section
      id="catering"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden scroll-mt-12"
      aria-label="Catering, Weddings and Private Celebrations"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================= */}
        {/* SECTION HEADER                                                */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#D3452B]/10 text-[#D3452B] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM BANQUETS &amp; WEDDING CATERING</span>
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Grand Celebrations &amp; Bulk Catering
          </h2>
          <div className="w-20 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            From joyful birthday milestones and executive corporate dinners to grand marriage receptions and authentic charcoal-sealed Dum Biryani handis across Renigunta and Tirupati.
          </p>
        </motion.div>

        {/* ============================================================= */}
        {/* 4 PROFESSIONAL EVENT & CATERING CARDS                         */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
          
          {/* Card 1: Birthdays & Private Milestones (With Real Birthday Photo) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-white rounded-3xl overflow-hidden border border-[#2E4823]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Header */}
              <div className="relative aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
                <OptimizedImage
                  src="/assets/events/birthday-celebration.jpg"
                  alt="Joyous birthday party with cake, party hats, blowers and confetti celebration at Vaibhav Grand"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5" />
                    <span>In-House AC Hall</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D3452B] text-white shadow-xs">
                    15 - 80+ Guests
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block mb-1">
                    Family &amp; Milestone Celebrations
                  </span>
                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                    Birthday Parties &amp; Anniversaries
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Celebrate life&apos;s special milestones in our spacious, fully air-conditioned family party hall. We take care of every detail from festive balloon decor and cake cutting setups to generous communal Mandi platters that delight every guest.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Reserved private AC party section with festive balloon &amp; backdrop styling</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Communal Arabic Mandi platters, Biryani buckets &amp; sizzling chicken tikkas</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Dedicated cake table setup, celebration cutlery, dessert &amp; ice-cream counter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]/60">
              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Starting Package
                </span>
                <span className="text-sm font-bold text-[#D3452B]">
                  From ₹299 / Guest
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
                <button
                  type="button"
                  onClick={onOpenBookModal}
                  className="px-4 py-2.5 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>Reserve Hall</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Corporate Banquets (With Real Corporate / Dining Photo) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-white rounded-3xl overflow-hidden border border-[#2E4823]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Header */}
              <div className="relative aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
                <OptimizedImage
                  src="/assets/events/corporate-celebration.jpg"
                  alt="Young professionals raising glasses together in celebration over restaurant feast"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Executive Banquets</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2E4823] text-white shadow-xs">
                    20 - 150+ Guests
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block mb-1">
                    Corporate &amp; Team Lunches
                  </span>
                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                    Office Dinners &amp; Client Feasts
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Impress your team, executive guests, and clients with professional dining setups. We accommodate corporate lunch meetings, project milestone parties, and provide hot, thermally sealed boxed feasts delivered on time across Renigunta and Tirupati tech hubs.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Flexible seating configurations with audio-visual &amp; music system access</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Hygienic multi-course buffet or individualized hot executive thermal lunch boxes</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Official GST billing invoices provided for easy corporate reimbursement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]/60">
              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Corporate Pricing
                </span>
                <span className="text-sm font-bold text-[#2E4823]">
                  From ₹349 / Guest
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
                <a
                  href={whatsappQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Corporate Quote</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Grand Marriage Receptions & Engagements (NEW Heavy Wedding Specialist) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-white rounded-3xl overflow-hidden border border-[#2E4823]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Header */}
              <div className="relative aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
                <OptimizedImage
                  src="/assets/events/grand-celebration.webp"
                  alt="Grand celebration banquet and royal wedding reception catering at Vaibhav Grand"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Wedding &amp; Reception Specialist</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D3452B] text-white shadow-xs">
                    100 - 1,500+ Guests
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block mb-1">
                    Weddings, Engagements &amp; Sangeet
                  </span>
                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                    Grand Marriage Banquet Catering
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Make your wedding day unforgettable with authentic royal hospitality. We specialize in lavish non-vegetarian marriage feasts, live clay-oven tandoor counters, copper deg Dum Biryanis, and traditional South Indian &amp; Mughlai delicacies served by uniformed catering professionals at marriage halls across Tirupati and Renigunta.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Live on-site Tandoor counter with piping hot Butter Naans, Tikkas &amp; Kebabs</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Authentic slow-dum Mutton &amp; Chicken Biryani handis with rich Mirchi Salan</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Luxury chafing dish setups, uniformed waiters, dessert counters &amp; welcome drinks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]/60">
              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Wedding Packages
                </span>
                <span className="text-sm font-bold text-[#D3452B]">
                  From ₹449 / Guest
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Banquet Chef</span>
                </a>
                <a
                  href={whatsappQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Marriage Quote</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Mega Dum Biryani Handis & Bulk Orders (Outdoor & Hall Feasts) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-white rounded-3xl overflow-hidden border border-[#2E4823]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Photo Header */}
              <div className="relative aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
                <OptimizedImage
                  src="/assets/events/dumbiriyani-handi.webp"
                  alt="Authentic Dum Biryani handi prepared in traditional charcoal-sealed pots for bulk party orders"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Bulk Handi Delivery</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                    5kg to 100kg+ Handis
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block mb-1">
                    Direct Kitchen Bulk Orders
                  </span>
                  <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                    Mega Dum Biryani Handis &amp; Buckets
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Feeding a large gathering at home, in a marriage choultry, farmhouse, or pilgrimage camp? Order authentic bulk Biryani handis prepared in authentic charcoal-sealed degs. Loaded with juicy marinated chicken or tender mutton, aromatic saffron rice, and full accompaniments.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Traditional dough-sealed hot handis delivered piping hot to your doorstep</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Generous tubs of authentic Mirchi ka Salan, mint onion raitha &amp; Double ka Meetha</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0 mt-0.5" />
                    <span>Custom orders available for 20, 50, 100, 250 to 500+ attendees</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-[#FDFBF7]/60">
              <div>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Handi Bulk Pricing
                </span>
                <span className="text-sm font-bold text-[#2E4823]">
                  Best Bulk Value Guarantee
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Kitchen</span>
                </a>
                <a
                  href={whatsappQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Order Handi</span>
                </a>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ============================================================= */}
        {/* NEW SPECIALIST SECTION: NON-VEG MARRIAGE & BULK FEASTS        */}
        {/* ============================================================= */}
        {showWeddingSpecialist && (
          <div className="bg-[#1C1C1C] text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl mb-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D3452B]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2E4823]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>THE NON-VEG WEDDING &amp; FEAST SPECIALIST</span>
              </span>
              <h3 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Royal Non-Veg Marriage Menus &amp; Mega Spreads
              </h3>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
                In Renigunta &amp; Tirupati, a grand marriage feast is defined by authentic flavor, generous meat portions, and hot, fragrant Dum Biryanis. Here is why families trust Vaibhav Grand:
              </p>
            </div>

            {/* 4 Pillars of Non-Veg Bulk Excellence */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              
              {/* Pillar 1 */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h4 className="font-['Playfair_Display'] text-lg font-bold text-white mb-2">
                    Mega Dum Biryani Degs
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Slow-cooked Hyderabadi Mutton &amp; Chicken Dum Biryani sealed in traditional copper degs with pure ghee, whole secret spices, and tender meat.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                  ✓ 5kg to 100kg+ Handis
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <h4 className="font-['Playfair_Display'] text-lg font-bold text-white mb-2">
                    Grand Arabian Mandi
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Authentic Arabian communal feasts with tender mutton lahm, whole faham grilled chicken, smoked basmati rice, fried cashews &amp; garlic toum.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                  ✓ Signature Mandi Platters
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <PartyPopper className="w-6 h-6" />
                  </div>
                  <h4 className="font-['Playfair_Display'] text-lg font-bold text-white mb-2">
                    Live Clay Oven Tandoor
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Live on-site tandoors serving piping hot Murgh Malai Tikka, Tandoori Chicken, Mutton Seekh Kebabs &amp; Butter Naans directly to wedding guests.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                  ✓ Live Counters at Venue
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-['Playfair_Display'] text-lg font-bold text-white mb-2">
                    Rayalaseema Curries
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Authentic local Andhra &amp; Mughlai rich gravies: Nattu Kodi Pulusu, Mutton Rogan Josh, Vaibhav Butter Chicken, Gongura Mutton &amp; hot Rumali Rotis.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                  ✓ Authentic Andhra Taste
                </div>
              </div>

            </div>

            {/* Wedding Catering Guarantee Strip */}
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left text-xs text-gray-300 relative z-10">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>100% Halal &amp; Hygienically Inspected Meat</span>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Guaranteed Punctual Serving at Function Hall</span>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Uniformed, Courteous Banquet Staff Included</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TIERED WEDDING & BULK PACKAGES TABLE                          */}
        {/* ============================================================= */}
        <div className={`mb-20 ${isHomePage ? 'hidden md:block' : ''}`}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
              TRANSPARENT VALUE
            </span>
            <h3 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E4823]">
              Curated Marriage &amp; Party Packages
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Select one of our proven celebration menus or customize every single dish to your family&apos;s exact preference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {CATERING_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-7 sm:p-8 border-2 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative ${pkg.highlightColor}`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full shadow-md">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h4 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E4823]">
                      {pkg.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {pkg.tagline}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline gap-2">
                      <span className="font-['Playfair_Display'] text-2xl font-bold text-[#D3452B]">
                        {pkg.priceEstimate}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        (Min {pkg.minGuests} Pax)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2E4823] font-semibold mt-1">
                      Best suited for: {pkg.idealFor}
                    </p>
                  </div>

                  {/* Highlights List */}
                  <div className="space-y-2.5 mb-8">
                    <span className="text-xs uppercase font-bold text-gray-700 tracking-wider block">
                      Package Inclusions:
                    </span>
                    {pkg.menuHighlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={`https://wa.me/91${(RESTAURANT_INFO.whatsapp || '7702104894').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hi Vaibhav Grand! I am interested in booking the "${pkg.name}" (${pkg.priceEstimate}) for an upcoming event in Renigunta/Tirupati. Please send menu details.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-amber-300" />
                    <span>Inquire for {pkg.name}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* INTERACTIVE INSTANT CATERING & WEDDING QUOTE CALCULATOR      */}
        {/* ============================================================= */}
        <div className="bg-[#F7F3EB] rounded-3xl p-6 sm:p-10 border border-[#2E4823]/15 shadow-sm mb-20">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
              INSTANT ESTIMATOR
            </span>
            <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E4823]">
              Plan Your Event &amp; Get an Instant Quote
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Select your event requirements below to generate a tailored WhatsApp inquiry directly to our banquet management desk.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            
            {/* Step 1: Event Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                1. Select Event Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'marriage', label: '💍 Marriage / Reception', sub: 'Hall or Venue' },
                  { id: 'birthday', label: '🎉 Birthday / Party', sub: 'AC Party Hall' },
                  { id: 'corporate', label: '💼 Corporate Dinner', sub: 'Office / Banquet' },
                  { id: 'bulk_biryani', label: '🍗 Bulk Biryani Handi', sub: 'Home / Outdoor' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedEventType(item.id as EventType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedEventType === item.id
                        ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900 leading-tight">{item.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Guest Count Slider & Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  2. Number of Guests (Pax)
                </label>
                <span className="font-['Playfair_Display'] text-lg font-bold text-[#D3452B]">
                  ~{guestCount} Guests
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2E4823]"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {[30, 50, 100, 200, 500, 1000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuestCount(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      guestCount === num
                        ? 'bg-[#2E4823] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} Guests
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Cuisine Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                3. Preferred Cuisine &amp; Serving Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'wedding_royal',
                    title: '👑 Royal Wedding Banquet',
                    desc: 'Biryani Handis, Mandi Spreads, Live Tandoor & Curries',
                  },
                  {
                    id: 'biryani_handi',
                    title: '🍗 Dum Biryani Handis',
                    desc: 'Hyderabadi Chicken & Mutton Biryani Handis with Salan',
                  },
                  {
                    id: 'mandi_spread',
                    title: '🍖 Arabian Mandi Feast',
                    desc: 'Communal Smoked Mutton & Chicken Mandi Spreads',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCuisineChoice(item.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      cuisineChoice === item.id
                        ? 'border-[#2E4823] bg-[#2E4823]/5 ring-2 ring-[#2E4823] shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Contact Inputs for WhatsApp pre-fill */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F3EB]/60 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2E4823]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Your Mobile (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F3EB]/60 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2E4823]"
                />
              </div>
            </div>

            {/* WhatsApp Inquiry Button & Phone Hotline */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-900">
                  Ready to check dates &amp; pricing?
                </p>
                <p className="text-[11px] text-gray-500">
                  Our Banquet Manager will respond within 15 minutes with customized menus.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#2E4823]" />
                  <span>Call {RESTAURANT_INFO.phone}</span>
                </a>
                <a
                  href={whatsappQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Get WhatsApp Quote</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================= */}
        {/* REAL CELEBRATION HIGHLIGHTS (USER ATTACHED PHOTOS SHOWCASE)   */}
        {/* ============================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#2E4823]/10 shadow-sm">
          <div className="mb-8">
            <span className="text-xs uppercase font-bold text-[#D3452B] tracking-wider block mb-1">
              AUTHENTIC HOSPITALITY &amp; CELEBRATIONS
            </span>
            <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2E4823]">
              Celebration Highlights at Vaibhav Grand
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Birthday parties, corporate toasts, and grand communal dining moments hosted in our halls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Real Photo 1: User uploaded Birthday Celebration */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <OptimizedImage
                src="/assets/events/birthday-celebration.jpg"
                alt="Birthday milestone celebration with colorful hats, blowers and cake"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Birthday Parties
                </span>
                <span className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                  Joyous Birthday Milestones &amp; Family Gatherings
                </span>
              </div>
            </div>

            {/* Real Photo 2: User uploaded Corporate / Dining Celebration */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <OptimizedImage
                src="/assets/events/corporate-celebration.jpg"
                alt="Young professionals raising glasses together at elegant restaurant table"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Corporate Dinners
                </span>
                <span className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                  Team Celebrations &amp; Executive Toasts
                </span>
              </div>
            </div>

            {/* Real Photo 3: Grand Mandi Feast */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <OptimizedImage
                src="/assets/events/grand-celebration.webp"
                alt="Grand celebration banquet at Vaibhav Grand"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Signature Spreads
                </span>
                <span className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                  Grand Arabian Mandi &amp; Royal Feasts
                </span>
              </div>
            </div>

            {/* Real Photo 4: Authentic Handi Biryani */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <OptimizedImage
                src="/assets/events/dumbiriyani-handi.webp"
                alt="Authentic Dum Biryani handi pot for wedding and bulk feasts"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Bulk Orders
                </span>
                <span className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                  Traditional Handi Dum Biryani Degs
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
