import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ExternalLink, Phone, ArrowRight, Utensils, TrendingDown, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { RESTAURANT_INFO, MENU_ITEMS, MENU_CATEGORIES } from '../data/restaurantData';
import { MenuItem, MenuCategoryType } from '../types';
import { useLiveMenu } from '../hooks/useLiveMenu';
import { extractSizeFromDish } from '../utils/menuVariants';
import { getDishImage } from '../data/menuImageMap';
import mandiImg from '../assets/events/vaibhav spacialk.webp';
import biryaniImg from '../assets/events/hydrabad chicken dum biriyanik.webp';
import butterChickenImg from '../assets/events/butter chickenk.webp';
import butterNaanImg from '../assets/events/butter naank (1).webp';
import paneerTikkaImg from '../assets/events/panner tikkak.webp';
import tandooriImg from '../assets/events/kidik.webp';

const HOME_MENU_IMAGE_OVERRIDES: Record<string, { src: string; alt: string }> = {
  'dish-144': {
    src: mandiImg,
    alt: 'Vaibhav Special Mandi served on a platter',
  },
  'dish-110': {
    src: biryaniImg,
    alt: 'Hyderabadi Chicken Dum Biryani served with spiced aromatic rice',
  },
  'dish-229': {
    src: butterChickenImg,
    alt: 'Butter Chicken simmered in rich creamy makhani gravy',
  },
  'dish-185': {
    src: butterNaanImg,
    alt: 'Freshly baked Butter Naan brushed with melted butter',
  },
  'dish-102': {
    src: paneerTikkaImg,
    alt: 'Paneer Tikka roasted in clay oven with bell peppers and onions',
  },
  'dish-88': {
    src: tandooriImg,
    alt: 'Tandoori Chicken char-roasted to smoky perfection in clay oven',
  },
  'dish-89': {
    src: tandooriImg,
    alt: 'Tandoori Chicken char-roasted to smoky perfection in clay oven',
  },
};

interface HomeMenuPreviewProps {
  onNavigateMenu: () => void;
  onOpenOrderModal: () => void;
  onOpenCompareModal?: () => void;
}

// Deterministic varied selection: 1 dish from each of 8 different categories spread across the menu (no availability/completed filtering)
function getInitialPreviewDishes(
  items: MenuItem[],
  categories: { id: MenuCategoryType; label: string }[]
): MenuItem[] {
  const validCats = categories
    .filter((c) => c.id !== 'all')
    .filter((c) => items.some((item) => item.category === c.id));

  if (validCats.length === 0) return items.slice(0, 8);

  const selectedDishes: MenuItem[] = [];
  const selectedBaseNames = new Set<string>();
  const usedCatIds = new Set<string>();

  const targetCount = Math.min(8, validCats.length);
  const targetCatIndices: number[] = [];
  for (let k = 0; k < targetCount; k++) {
    targetCatIndices.push(Math.floor((k * (validCats.length - 1)) / (targetCount - 1)));
  }

  for (const catIdx of targetCatIndices) {
    const cat = validCats[catIdx];
    if (!cat || usedCatIds.has(cat.id)) continue;

    const catItems = items.filter((item) => item.category === cat.id);
    const chosen =
      catItems.find((item) => {
        const base = extractSizeFromDish(item.name, item.portionNote).baseName.toLowerCase();
        return item.isChefSpecial && !selectedBaseNames.has(base);
      }) ||
      catItems.find((item) => {
        const base = extractSizeFromDish(item.name, item.portionNote).baseName.toLowerCase();
        return !selectedBaseNames.has(base);
      });

    if (chosen) {
      const base = extractSizeFromDish(chosen.name, chosen.portionNote).baseName.toLowerCase();
      selectedBaseNames.add(base);
      usedCatIds.add(cat.id);
      selectedDishes.push(chosen);
    }
  }

  // Fill up to 8 from any remaining categories without repeats
  if (selectedDishes.length < 8) {
    for (const cat of validCats) {
      if (selectedDishes.length >= 8) break;
      if (usedCatIds.has(cat.id)) continue;

      const catItems = items.filter((item) => item.category === cat.id);
      const chosen =
        catItems.find((item) => {
          const base = extractSizeFromDish(item.name, item.portionNote).baseName.toLowerCase();
          return item.isChefSpecial && !selectedBaseNames.has(base);
        }) ||
        catItems.find((item) => {
          const base = extractSizeFromDish(item.name, item.portionNote).baseName.toLowerCase();
          return !selectedBaseNames.has(base);
        });

      if (chosen) {
        const base = extractSizeFromDish(chosen.name, chosen.portionNote).baseName.toLowerCase();
        selectedBaseNames.add(base);
        usedCatIds.add(cat.id);
        selectedDishes.push(chosen);
      }
    }
  }

  return selectedDishes;
}

// Exact 10 Classic Menu Items for Mobile View in Order:
// 1. Mandi, 2. Baby Corn 555, 3. Chicken 65, 4. Biryani, 5. Butter Chicken,
// 6. Butter Naan, 7. Special Curd Rice, 8. Paneer Tikka, 9. Oreo Milkshake, 10. Chicken Lollipop
const MOBILE_TOP_10_IDS = [
  'dish-144', // 1. Mandi
  'dish-72',  // 2. Baby Corn 555
  'dish-35',  // 3. Chicken 65
  'dish-110', // 4. Biryani
  'dish-229', // 5. Butter Chicken
  'dish-185', // 6. Butter Naan
  'dish-28',  // 7. Special Curd Rice
  'dish-102', // 8. Paneer Tikka
  'dish-248', // 9. Oreo Milkshake
  'dish-36',  // 10. Chicken Lollipop
];

export const HomeMenuPreview: React.FC<HomeMenuPreviewProps> = ({
  onNavigateMenu,
  onOpenOrderModal,
  onOpenCompareModal,
}) => {
  const [mobileActiveSlide, setMobileActiveSlide] = useState(0);
  const { getPrice, getMrp, isAvailable, getSavings } = useLiveMenu();

  // Desktop dishes: starts with 8 deterministic dishes from 8 different categories for SSG/prerender
  const [desktopDishes, setDesktopDishes] = useState<MenuItem[]>(() =>
    getInitialPreviewDishes(MENU_ITEMS, MENU_CATEGORIES)
  );

  // Client-only randomized rotation after mount (no hydration mismatch, layout shift prevented by identical card dimensions)
  useEffect(() => {
    try {
      const validCats = MENU_CATEGORIES
        .filter((c) => c.id !== 'all')
        .filter((c) => MENU_ITEMS.some((item) => item.category === c.id));

      if (validCats.length < 8) return;

      const shuffledCats = [...validCats];
      for (let i = shuffledCats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCats[i], shuffledCats[j]] = [shuffledCats[j], shuffledCats[i]];
      }

      const randomDishes: MenuItem[] = [];
      const seenBases = new Set<string>();

      for (const cat of shuffledCats) {
        if (randomDishes.length >= 8) break;
        const catItems = MENU_ITEMS.filter((item) => item.category === cat.id);
        if (catItems.length === 0) continue;

        const shuffledItems = [...catItems];
        for (let i = shuffledItems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
        }

        const picked = shuffledItems.find((item) => {
          const base = extractSizeFromDish(item.name, item.portionNote).baseName.toLowerCase();
          return !seenBases.has(base);
        });

        if (picked) {
          const base = extractSizeFromDish(picked.name, picked.portionNote).baseName.toLowerCase();
          seenBases.add(base);
          randomDishes.push(picked);
        }
      }

      if (randomDishes.length === 8) {
        setDesktopDishes(randomDishes);
      }
    } catch {}
  }, []);

  // Curated 10 items in exact requested order for mobile view from classic MENU_ITEMS
  const mobileDisplayDishes = useMemo(() => {
    return MOBILE_TOP_10_IDS.map((id) =>
      MENU_ITEMS.find((item) => item.id === id)
    ).filter((item): item is MenuItem => item !== undefined);
  }, []);

  return (
    <section
      id="menu"
      className="py-14 sm:py-24 bg-[#FDFBF7] relative scroll-mt-12 overflow-hidden"
      aria-label="Popular Menu Preview"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ======================================================== */}
        {/* 1. MOBILE VIEW (md:hidden): Red Onion NYC Style with     */}
        {/*    Live Search Bar + Horizontal Category Side Scroll +   */}
        {/*    Curated 10 Dishes Side-Scroll Carousel                */}
        {/* ======================================================== */}
        <div className="md:hidden">
          {/* Mobile Header */}
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D3452B] mb-1.5 block">
              ✦ POPULAR MENU HIGHLIGHTS ✦
            </span>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2E4823] tracking-tight">
              Explore Our Grand Menu
            </h2>
            <div className="w-14 h-1 bg-[#D3452B] mx-auto mt-2.5 rounded-full" />
            <p className="mt-2.5 text-xs text-gray-600 leading-relaxed">
              Search our aromatic Dum Biryanis, Arabian Mandis, sizzling clay-oven tandoor, and curries.
            </p>

            {/* Trust & Ratings Highlights (Replaces Redundant CTA Button) */}
            <div className="mt-4 mb-3 flex flex-col items-center gap-2.5">
              {/* Verified Google Rating Pill */}
              <a
                href={RESTAURANT_INFO.googleMapsReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/90 hover:bg-amber-100 border border-amber-200/80 shadow-2xs transition-colors"
                title="4.3 out of 5 stars based on 1,000+ verified Google Reviews"
              >
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/40 text-amber-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-stone-900">
                  {RESTAURANT_INFO.overallRating}
                </span>
                <span className="text-[11px] text-stone-600 font-medium">
                  ({RESTAURANT_INFO.totalReviews}+ Google Reviews)
                </span>
              </a>

              {/* Culinary Trust Line */}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-stone-600/90">
                <span className="whitespace-nowrap flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  100% Halal Cuts
                </span>
                <span className="text-stone-300 select-none">•</span>
                <span className="whitespace-nowrap">Fresh Daily Kitchen</span>
                <span className="text-stone-300 select-none">•</span>
                <span className="whitespace-nowrap">Authentic Recipes</span>
              </div>
            </div>
          </div>

          {/* Mobile Direct Savings Trust Strip */}
          <div className="bg-emerald-50 rounded-xl p-2.5 px-3 border border-emerald-200 mb-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-emerald-900 leading-tight">
                Direct Dine-In Rates: Save ₹40–₹80 / dish vs Apps
              </span>
            </div>
            {onOpenCompareModal && (
              <button
                type="button"
                onClick={onOpenCompareModal}
                className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-xs shrink-0 active:scale-95"
              >
                Compare
              </button>
            )}
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-3 px-1 text-xs text-gray-500 font-medium">
            <span>
              Top <strong className="text-[#2E4823]">10</strong> Guest Favorites
            </span>
          </div>

          {/* Mobile Side-Scroll Dish Cards (Exact 10 Curated Items) */}
          <div>
            {/* Butter-smooth touch scrolling carousel */}
              <div
                className="flex overflow-x-auto gap-3.5 snap-x snap-mandatory pb-4 pt-1 no-scrollbar overscroll-x-contain -mx-4 px-4 scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const slideWidth = el.scrollWidth / mobileDisplayDishes.length;
                  const current = Math.round(el.scrollLeft / slideWidth);
                  setMobileActiveSlide(Math.min(current, mobileDisplayDishes.length - 1));
                }}
              >
                {mobileDisplayDishes.map((item, idx) => {
                  const activePrice = getPrice(item.id, item.price);
                  const estimatedAggPrice = getMrp(item.id, item.aggregator_price, item.price);
                  const savings = getSavings(activePrice, estimatedAggPrice);
                  const available = isAvailable(item.id, true);
                  const customImage = HOME_MENU_IMAGE_OVERRIDES[item.id];
                  const imgSrc = customImage ? customImage.src : (item.image || getDishImage(item.name) || '/assets/vaibhav-grand-webp-images/food14.webp');
                  const imgAlt = customImage ? customImage.alt : item.name;
                  return (
                    <article
                      key={item.id}
                      className="w-[78vw] max-w-[270px] shrink-0 snap-center rounded-2xl bg-white border border-[#2E4823]/10 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                          <img
                            src={imgSrc}
                            alt={imgAlt}
                            width={360}
                            height={240}
                            loading="lazy"
                            fetchPriority="auto"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                          />
                          {/* Veg / Non-Veg tag */}
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                              }`}
                            />
                            <span className={item.isVeg ? 'text-green-800' : 'text-[#D3452B]'}>
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </span>
                          </div>
                          {/* Price Tag with Direct Savings */}
                          <div className="absolute bottom-2 right-2 z-10 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg shadow-xs border border-[#2E4823]/10 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              {savings > 0 && (
                                <span className="text-[10px] text-gray-400 line-through">₹{estimatedAggPrice}</span>
                              )}
                              <span className="text-[#D3452B] font-bold text-xs">₹{activePrice}</span>
                            </div>
                            {savings > 0 && (
                              <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded block text-center">
                                Save ₹{savings}
                              </span>
                            )}
                          </div>
                          {!available && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-20 flex items-center justify-center">
                              <span className="bg-[#D3452B] text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <h3 className="font-['Playfair_Display'] text-sm font-bold text-[#1C1C1C] leading-tight line-clamp-1">
                            {item.name}
                          </h3>
                          {item.portionNote && (
                            <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider text-[#2E4823] bg-[#2E4823]/10 px-1.5 py-0.5 rounded">
                              {item.portionNote}
                            </span>
                          )}
                          <p className="mt-1 text-[11px] text-gray-500 line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Order Direct Button */}
                      <div className="p-3 pt-0">
                        <button
                          type="button"
                          onClick={onOpenOrderModal}
                          className="w-full py-2 px-3 rounded-xl bg-[#D3452B] hover:bg-[#bd3b22] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                        >
                          <Utensils className="w-3 h-3" />
                          <span>{savings > 0 ? `Order Direct • Save ₹${savings}` : 'Order Direct'}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Mobile Swipe Hint with Active Dots */}
              <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                <div className="flex items-center gap-1">
                  {mobileDisplayDishes.slice(0, 10).map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === mobileActiveSlide
                          ? 'w-5 h-1.5 bg-[#D3452B]'
                          : 'w-1.5 h-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-500 font-medium">← Swipe to explore dishes →</span>
              </div>
            </div>

          {/* Mobile Full Menu CTA (No "62") */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onNavigateMenu}
              className="w-full py-3 px-4 rounded-xl bg-[#2E4823] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Explore Complete Grand Menu</span>
            </button>
          </div>
        </div>


        {/* ======================================================== */}
        {/* 2. DESKTOP VIEW (hidden md:block): Exactly Original      */}
        {/*    Desktop 2-Column List Layout (100% Preserved)         */}
        {/* ======================================================== */}
        <div className="hidden md:block">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D3452B] mb-2 block">
              A TASTE OF OUR KITCHEN
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
              Explore Our Grand Menu
            </h2>
            <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
              Here is a curated preview of our guests&rsquo; favorite dishes. Browse our complete grand menu on our dedicated menu page.
            </p>

            {/* Desktop Trust & Ratings Highlights */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <a
                href={RESTAURANT_INFO.googleMapsReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 hover:bg-amber-100 border border-amber-200/80 shadow-2xs transition-all hover:scale-[1.02]"
                title="4.3 out of 5 stars based on 1,000+ verified Google Reviews"
              >
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/40 text-amber-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                  {RESTAURANT_INFO.overallRating}
                </span>
                <span className="text-stone-600 font-medium text-xs">
                  ({RESTAURANT_INFO.totalReviews}+ Google Reviews)
                </span>
              </a>

              <span className="text-stone-300 hidden sm:inline select-none">•</span>

              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.12em] uppercase text-stone-600/90">
                <span className="whitespace-nowrap flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  100% Halal Cuts
                </span>
                <span className="text-stone-300 mx-1 select-none">•</span>
                <span className="whitespace-nowrap">Fresh Daily Kitchen</span>
                <span className="text-stone-300 mx-1 select-none">•</span>
                <span className="whitespace-nowrap">Authentic Recipes</span>
              </div>
            </div>
          </motion.div>

          {/* Direct Ordering Savings & Transparency Callout Banner */}
          <div className="mb-8 sm:mb-10 bg-gradient-to-r from-[#F7F3EB] via-white to-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/15 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Save 20% to 35% Ordering Direct</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#2E4823]">
                Order Directly from Our Kitchen &amp; Save ₹150–₹250+
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Genuine dine-in pricing • ₹0 platform fees • ₹0 packaging charges • Free 5km delivery above ₹299.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                type="button"
                onClick={onOpenOrderModal}
                className="btn-shimmer flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Order Direct Online</span>
              </button>

              {onOpenCompareModal && (
                <button
                  type="button"
                  onClick={onOpenCompareModal}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#2E4823] border border-[#2E4823]/25 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compare vs Apps</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-gray-200">
                <a
                  href={RESTAURANT_INFO.swiggyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Also available on Swiggy at app rates"
                >
                  <span className="w-4 h-4 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-bold text-[9px]">
                    S
                  </span>
                </a>
                <a
                  href={RESTAURANT_INFO.zomatoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Also available on Zomato at app rates"
                >
                  <span className="w-4 h-4 rounded-full bg-[#E23744] text-white flex items-center justify-center font-bold text-[9px]">
                    Z
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
            {desktopDishes.map((item) => {
              const activePrice = getPrice(item.id, item.price);
              const estimatedAggPrice = getMrp(item.id, item.aggregator_price, item.price);
              const itemSavings = getSavings(activePrice, estimatedAggPrice);
              const available = isAvailable(item.id, true);
              return (
                <article
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/70 hover:bg-[#F7F3EB] border border-[#2E4823]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                            item.isVeg ? 'border-green-600' : 'border-[#D3452B]'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                            }`}
                          />
                        </span>

                        <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-[#1C1C1C] hover:text-[#2E4823] transition-colors line-clamp-1">
                          {item.name}
                        </h3>

                        {item.isChefSpecial && (
                          <span className="shrink-0 text-[10px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-2 py-0.5 rounded-md">
                            Special
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          {itemSavings > 0 && (
                            <span className="text-xs text-gray-400 line-through">₹{estimatedAggPrice}</span>
                          )}
                          <span className="font-bold text-base sm:text-lg text-[#D3452B]">
                            ₹{activePrice}
                          </span>
                        </div>
                        {itemSavings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                            Save ₹{itemSavings} Direct
                          </span>
                        )}
                        {!available && (
                          <span className="text-[10px] font-bold text-[#D3452B] bg-red-50 border border-red-200/60 px-1.5 py-0.2 rounded-full inline-block mt-0.5 ml-1">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-gray-500 italic leading-relaxed pl-5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {item.portionNote && (
                    <div className="mt-2 pl-5">
                      <span className="text-[11px] text-[#2E4823] font-medium bg-[#2E4823]/5 px-2 py-0.5 rounded">
                        {item.portionNote}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Desktop Full Menu Callout Bar (No "62") */}
          <div className="mt-12 text-center bg-gradient-to-r from-[#2E4823] to-[#1c3016] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-amber-400/20 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-300 block mb-2">
                HUNGRY FOR MORE?
              </span>
              <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold tracking-tight">
                Explore Our Full Grand Menu
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/85 leading-relaxed">
                Mughlai curries, sizzling starters, Chinese fried rice, roti platters, and artisan shakes await you.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={onNavigateMenu}
                  id="home-explore-full-menu-btn"
                  className="px-8 py-3.5 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>Explore Full Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onNavigateMenu}
                  id="home-explore-photo-menu-btn"
                  className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-xs border border-white/25 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Browse Photo Menu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Takeaway Reminder */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
              Prefer to call? Order directly at{' '}
              <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-[#D3452B] hover:underline font-bold">
                {RESTAURANT_INFO.phone}
              </a>{' '}
              for takeaway!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
