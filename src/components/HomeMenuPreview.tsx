import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, ExternalLink, Phone, ArrowRight, Utensils, X } from 'lucide-react';
import { RESTAURANT_INFO, MENU_ITEMS } from '../data/restaurantData';
import { PHOTO_MENU_ITEMS } from '../data/photoMenuData';
import { MenuItem, PhotoMenuItem } from '../types';

interface HomeMenuPreviewProps {
  onNavigateMenu: () => void;
  onOpenOrderModal: () => void;
}

// 8 Top Signature & Bestselling Dishes for Classic Desktop View (Untouched)
const PREVIEW_DISH_IDS = [
  'vaibhav-special-mandi',
  'hyderabadi-chicken-dum-biryani',
  'chicken-dum-biryani-bucket',
  'sizzling-tandoori-chicken',
  'chicken-lollipop',
  'dragon-chicken',
  'paneer-butter-masala',
  'butter-naan',
];

// Exact 10 Items Requested for Mobile View in Order:
// 1. Mandi, 2. Baby Corn Manchurian, 3. Chicken 65, 4. Biryani, 5. Butter Chicken,
// 6. Butter Naan, 7. Special Curd Rice, 8. Paneer Tikka Fry, 9. Oreo Milkshake, 10. Chicken Lollipop
const MOBILE_TOP_10_IDS = [
  'm1',                       // 1. Mandi
  's-baby-corn-manchurian',    // 2. Baby Corn Manchurian
  's-chicken-65',             // 3. Chicken 65
  'b-hyd-dum',                // 4. Biryani
  'c-butter-chicken',         // 5. Butter Chicken
  'br-butter-naan',           // 6. Butter Naan
  'r-curd-rice',              // 7. Special Curd Rice
  'panner-tikka-fry',         // 8. Paneer Tikka Fry
  'bev-oreo-shake',           // 9. Oreo Milkshake
  's-chicken-lollipop',       // 10. Chicken Lollipop
];

// Mobile categories for horizontal side-scroll
const MOBILE_CATEGORIES = [
  { id: 'all', label: 'All Favorites' },
  { id: 'mandi', label: 'Arabic Mandi' },
  { id: 'biryani', label: 'Dum Biryanis' },
  { id: 'starters', label: 'Starters & Tandoor' },
  { id: 'curries', label: 'Royal Curries' },
  { id: 'breads', label: 'Breads & Naan' },
  { id: 'rice-noodles', label: 'Rice & Noodles' },
  { id: 'beverages', label: 'Coolers & Shakes' },
];

export const HomeMenuPreview: React.FC<HomeMenuPreviewProps> = ({
  onNavigateMenu,
  onOpenOrderModal,
}) => {
  // Mobile search & category filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [mobileActiveSlide, setMobileActiveSlide] = useState(0);

  // Desktop dishes (exact original 8 preview dishes)
  const desktopDishes = useMemo(() => {
    const list = PREVIEW_DISH_IDS.map((id) =>
      MENU_ITEMS.find((item) => item.id === id)
    ).filter((item): item is MenuItem => item !== undefined);
    return list.length >= 6 ? list : MENU_ITEMS.slice(0, 8);
  }, []);

  // Curated 10 items in exact requested order for default mobile view
  const mobileCurated10 = useMemo(() => {
    return MOBILE_TOP_10_IDS.map((id) =>
      PHOTO_MENU_ITEMS.find((item) => item.id === id)
    ).filter((item): item is PhotoMenuItem => item !== undefined);
  }, []);

  // Mobile filtered dishes (when searching or category selected)
  const mobileFilteredDishes = useMemo(() => {
    return PHOTO_MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesDiet =
        dietFilter === 'all'
          ? true
          : dietFilter === 'veg'
          ? item.isVeg
          : !item.isVeg;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.portionNote && item.portionNote.toLowerCase().includes(q));

      return matchesCategory && matchesDiet && matchesSearch;
    });
  }, [searchQuery, selectedCategory, dietFilter]);

  // When no filter/search is active, display the exact 10 curated items!
  const isFiltering = Boolean(searchQuery || selectedCategory !== 'all' || dietFilter !== 'all');
  const mobileDisplayDishes = isFiltering ? mobileFilteredDishes : mobileCurated10;

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
          </div>

          {/* Mobile Live Search & Filter Controls */}
          <div className="bg-[#F7F3EB] rounded-2xl p-3.5 border border-[#2E4823]/10 shadow-xs mb-5">
            {/* Search Input */}
            <div className="relative w-full mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes (e.g., Mandi, Biryani, Naan)..."
                aria-label="Search menu dishes"
                className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-xl border border-gray-200 text-[#1C1C1C] placeholder:text-gray-400 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dietary Segmented Control */}
            <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-xl border border-gray-200 mb-3">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all text-center ${
                  dietFilter === 'all'
                    ? 'bg-[#2E4823] text-white shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('veg')}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  dietFilter === 'veg'
                    ? 'bg-green-700 text-white shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('non-veg')}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  dietFilter === 'non-veg'
                    ? 'bg-[#D3452B] text-white shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#D3452B]" />
                <span>Non-Veg</span>
              </button>
            </div>

            {/* Horizontal Side-Scroll Category Tabs */}
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 overscroll-x-contain scroll-smooth"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {MOBILE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#2E4823] text-[#FDFBF7] shadow-xs'
                        : 'bg-white text-[#1C1C1C]/80 hover:bg-[#2E4823]/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Header (Removed "62 dishes") */}
          <div className="flex items-center justify-between mb-3 px-1 text-xs text-gray-500 font-medium">
            <span>
              {isFiltering ? (
                <>Found <strong className="text-[#2E4823]">{mobileDisplayDishes.length}</strong> matching dishes</>
              ) : (
                <>Top <strong className="text-[#2E4823]">10</strong> Guest Favorites</>
              )}
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setDietFilter('all');
                }}
                className="text-[#D3452B] font-semibold underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Mobile Side-Scroll Dish Cards (Exact 10 Curated Items on Default) */}
          {mobileDisplayDishes.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-xs text-gray-600">No dishes match your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setDietFilter('all');
                }}
                className="mt-2 text-xs text-[#2E4823] font-bold underline"
              >
                View all dishes
              </button>
            </div>
          ) : (
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
                {mobileDisplayDishes.map((item, idx) => (
                  <article
                    key={item.id}
                    className="w-[78vw] max-w-[270px] shrink-0 snap-center rounded-2xl bg-white border border-[#2E4823]/10 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          width={360}
                          height={240}
                          loading={idx < 3 ? 'eager' : 'lazy'}
                          fetchPriority={idx < 3 ? 'high' : 'auto'}
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
                        {/* Price */}
                        <div className="absolute bottom-2 right-2 z-10 bg-white/95 px-2 py-0.5 rounded-md shadow-xs border border-[#2E4823]/10">
                          <span className="text-[#D3452B] font-bold text-xs">₹{item.price}</span>
                        </div>
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

                    {/* Order Online Button */}
                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={onOpenOrderModal}
                        className="w-full py-2 px-3 rounded-xl bg-[#D3452B] hover:bg-[#bd3b22] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>Order Online</span>
                      </button>
                    </div>
                  </article>
                ))}
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
          )}

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
              Popular Menu Highlights
            </h2>
            <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
              Here is a curated preview of our guests&rsquo; favorite dishes. Browse our complete grand menu on our dedicated menu page.
            </p>
          </motion.div>

          {/* Delivery Banner */}
          <div className="mb-10 bg-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/10 shadow-xs flex flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2E4823]">
                Craving Our Firewood Flavors at Home?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Doorstep delivery via Swiggy &amp; Zomato across Renigunta &amp; Tirupati.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={RESTAURANT_INFO.swiggyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-white text-[#FC8019] flex items-center justify-center font-bold text-[10px]">
                  S
                </span>
                <span>Swiggy</span>
              </a>

              <a
                href={RESTAURANT_INFO.zomatoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-white text-[#E23744] flex items-center justify-center font-bold text-[10px]">
                  Z
                </span>
                <span>Zomato</span>
              </a>
            </div>
          </div>

          {/* 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
            {desktopDishes.map((item) => (
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
                      <span className="font-bold text-base sm:text-lg text-[#D3452B]">
                        ₹{item.price}
                      </span>
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
            ))}
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
