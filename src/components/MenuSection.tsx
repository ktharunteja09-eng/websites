import React, { useState, useMemo } from 'react';
import { MENU_ITEMS, MENU_CATEGORIES, RESTAURANT_INFO, PHOTO_MENU_ITEMS } from '../data/restaurantData';
import { Search, ExternalLink, Phone, Sparkles, Camera, ListOrdered, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { PhotoMenu } from './PhotoMenu';
import { MenuCategoryType } from '../types';

export const MenuSection: React.FC = () => {
  const [menuViewMode, setMenuViewMode] = useState<'list' | 'cards'>('list');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Filtered menu items
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      // Dietary filter
      const matchesDiet =
        dietFilter === 'all'
          ? true
          : dietFilter === 'veg'
          ? item.isVeg
          : !item.isVeg;

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.portionNote && item.portionNote.toLowerCase().includes(q));

      return matchesCategory && matchesDiet && matchesQuery;
    });
  }, [selectedCategory, searchQuery, dietFilter]);

  // Order buttons component to reuse at TOP and BOTTOM
  const OrderBanner = ({ idPrefix }: { idPrefix: string }) => (
    <div
      id={`${idPrefix}-order-banner`}
      className="bg-[#F7F3EB] rounded-2xl p-6 border border-[#2E4823]/10 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div className="text-center sm:text-left">
        <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#2E4823]">
          Craving Our Firewood Flavors at Home?
        </h3>
        <p className="text-sm text-[#1C1C1C]/75 mt-0.5">
          Steaming hot Mandi platters, Hyderabadi biryanis &amp; tandoor curries delivered to your doorstep.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Swiggy Button */}
        <a
          href={RESTAURANT_INFO.swiggyUrl}
          target="_blank"
          rel="noopener noreferrer"
          id={`${idPrefix}-swiggy-btn`}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FC8019] hover:bg-[#E57315] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(252,128,25,0.25)] hover:shadow-[0_6px_18px_rgba(252,128,25,0.35)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white text-[#FC8019] flex items-center justify-center font-bold text-xs">
            S
          </span>
          <span>Order via Swiggy</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Zomato Button */}
        <a
          href={RESTAURANT_INFO.zomatoUrl}
          target="_blank"
          rel="noopener noreferrer"
          id={`${idPrefix}-zomato-btn`}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E23744] hover:bg-[#CB202D] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(226,55,68,0.25)] hover:shadow-[0_6px_18px_rgba(226,55,68,0.35)] transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white text-[#E23744] flex items-center justify-center font-bold text-xs">
            Z
          </span>
          <span>Order via Zomato</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section
      id="menu"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative scroll-mt-12"
      aria-label="Full Culinary Menu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#2E4823] mb-2 block">
            OUR CULINARY MENU
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Explore Our Grand Menu
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            From Arabian Mandi feasts and aged basmati Dum Biryanis to sizzling tandoor grills, rich gravies &amp; thick milkshakes.
          </p>
        </motion.div>

        {/* View Mode Toggle: Classic A La Carte Menu vs Visual Photo Menu */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#F7F3EB] border border-[#2E4823]/15 shadow-inner">
            <button
              type="button"
              onClick={() => setMenuViewMode('list')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                menuViewMode === 'list'
                  ? 'bg-[#2E4823] text-white shadow-md'
                  : 'text-gray-700 hover:text-[#2E4823]'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Classic Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuViewMode('cards')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                menuViewMode === 'cards'
                  ? 'bg-[#2E4823] text-white shadow-md'
                  : 'text-gray-700 hover:text-[#2E4823]'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Photo Menu</span>
            </button>
          </div>
        </div>

        {/* ORDER BUTTONS AT TOP OF MENU */}
        <div className="mb-8">
          <OrderBanner idPrefix="menu-top" />
          <div className="mt-2.5 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
              Prefer to call? Order directly at{' '}
              <a href="tel:7947142432" className="text-[#D3452B] hover:underline font-bold">
                7947142432
              </a>{' '}
              for takeaway!
            </p>
          </div>
        </div>

        {/* CONDITIONALLY RENDER PHOTO MENU (62 PROCESSED WEBP DISHES) OR INTERACTIVE LIST */}
        {menuViewMode === 'cards' ? (
          <PhotoMenu />
        ) : (
          <>
            {/* SEARCH / FILTER CONTROLS BAR */}
            <div className="bg-[#F7F3EB] rounded-2xl p-4 sm:p-5 border border-[#2E4823]/10 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Live Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes (e.g., Mandi, Biryani, Naan)..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 text-[#1C1C1C] placeholder:text-gray-400 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Dietary Filter Segmented Control */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setDietFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'all'
                        ? 'bg-[#2E4823] text-white shadow-xs'
                        : 'text-gray-600 hover:text-[#2E4823]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('veg')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'veg'
                        ? 'bg-green-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-green-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('non-veg')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      dietFilter === 'non-veg'
                        ? 'bg-[#D3452B] text-white shadow-xs'
                        : 'text-gray-600 hover:text-[#D3452B]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D3452B]" />
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="mt-4 pt-3 border-t border-[#2E4823]/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {MENU_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#2E4823] text-[#FDFBF7] shadow-sm'
                          : 'bg-white text-[#1C1C1C]/80 hover:bg-[#2E4823]/10 hover:text-[#2E4823]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dishes Count Indicator */}
            <div className="flex items-center justify-between mb-6 px-2 text-xs text-gray-500 font-medium">
              <span>
                Showing <strong className="text-[#2E4823]">{filteredDishes.length}</strong> delicious dishes
              </span>
              {(searchQuery || dietFilter !== 'all' || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDietFilter('all');
                    setSelectedCategory('all');
                  }}
                  className="text-[#D3452B] hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* CATEGORIZED 2-COLUMN GRID */}
            {filteredDishes.length === 0 ? (
              <div className="text-center py-16 bg-[#F7F3EB] rounded-2xl p-8 border border-dashed border-gray-300">
                <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-['Playfair_Display'] text-xl text-[#2E4823] font-bold">
                  No dishes found matching your search
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try clearing your search query or selecting a different category tab.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setDietFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#2E4823] text-white text-xs font-semibold rounded-xl hover:bg-[#223719] transition-colors"
                >
                  Reset Menu Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                {filteredDishes.map((item) => (
                  <article
                    key={item.id}
                    className="p-4 rounded-xl transition-colors duration-200 hover:bg-[#F7F3EB]/60 flex flex-col justify-between border-b border-[#2E4823]/10 pb-4"
                  >
                    <div>
                      {/* Top line: Dish Name (with veg/non-veg indicator) & Price in #D3452B */}
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {/* Green square for Veg, Red triangle for Non-veg */}
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

                          <h3 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-[#1C1C1C] hover:text-[#2E4823] transition-colors">
                            {item.name}
                          </h3>

                          {item.isChefSpecial && (
                            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-2 py-0.5 rounded-md">
                              Special
                            </span>
                          )}
                        </div>

                        {/* Price right aligned in #D3452B */}
                        <div className="text-right shrink-0">
                          <span className="font-bold text-base sm:text-lg text-[#D3452B]">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>

                      {/* Italicized short description */}
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 italic font-normal leading-relaxed pl-5">
                        {item.description}
                      </p>
                    </div>

                    {item.portionNote && (
                      <div className="mt-1.5 pl-5 flex items-center gap-2">
                        <span className="text-[11px] text-[#2E4823] font-medium bg-[#2E4823]/5 px-2 py-0.5 rounded">
                          {item.portionNote}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* ORDER BUTTONS AT BOTTOM OF MENU */}
        <div className="mt-12">
          <OrderBanner idPrefix="menu-bottom" />
          <div className="mt-2.5 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#2E4823] flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D3452B]" />
              Prefer to call? Order directly at{' '}
              <a href="tel:7947142432" className="text-[#D3452B] hover:underline font-bold">
                7947142432
              </a>{' '}
              for takeaway!
            </p>
          </div>
        </div>

        {/* MENU PRICING & INGREDIENT DISCLAIMER */}
        <div className="mt-8 text-center max-w-3xl mx-auto px-4">
          <p className="text-xs text-gray-500 leading-relaxed italic border-t border-gray-200/80 pt-4">
            Prices, menu items, and availability are subject to change without notice. Delivery prices on Swiggy and Zomato may vary from our dine-in menu.
          </p>
        </div>
      </div>
    </section>
  );
};
