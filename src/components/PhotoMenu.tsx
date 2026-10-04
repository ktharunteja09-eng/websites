import React, { useState, useMemo } from 'react';
import { PHOTO_MENU_ITEMS, RESTAURANT_INFO, MENU_CATEGORIES } from '../data/restaurantData';
import { PhotoMenuItem, MenuCategoryType } from '../types';
import { Search, Filter, ExternalLink, Phone, Sparkles, Utensils, Maximize2, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OptimizedImage } from './OptimizedImage';

export const PhotoMenu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [activeDish, setActiveDish] = useState<PhotoMenuItem | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PHOTO_MENU_ITEMS.length };
    PHOTO_MENU_ITEMS.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return PHOTO_MENU_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDiet =
        dietFilter === 'all'
          ? true
          : dietFilter === 'veg'
          ? item.isVeg
          : !item.isVeg;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.portionNote && item.portionNote.toLowerCase().includes(q));

      return matchesCat && matchesDiet && matchesQuery;
    });
  }, [selectedCategory, searchQuery, dietFilter]);

  return (
    <div className="w-full space-y-8" id="photo-menu-showcase">
      {/* Category & Search Filter Bar */}
      <div className="bg-[#F7F3EB] rounded-3xl p-5 sm:p-6 border border-[#2E4823]/15 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photo dishes (e.g. Mandi, Biryani)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-gray-200 text-[#1C1C1C] placeholder:text-gray-400 focus:border-[#2E4823] focus:ring-1 focus:ring-[#2E4823] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Diet Segmented Switch */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setDietFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dietFilter === 'all'
                  ? 'bg-[#2E4823] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#2E4823]'
              }`}
            >
              All Dishes ({PHOTO_MENU_ITEMS.length})
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
              <span>Veg Only</span>
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

        {/* Category Navigation Pills */}
        <div className="mt-5 pt-4 border-t border-[#2E4823]/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            if (cat.id !== 'all' && count === 0) return null;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2E4823] text-[#FDFBF7] shadow-md scale-105'
                    : 'bg-white text-[#1C1C1C]/80 hover:bg-[#2E4823]/10 hover:text-[#2E4823] border border-gray-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showing Count Status Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-medium">
        <span>
          Showing <strong className="text-[#2E4823] font-bold">{filteredDishes.length}</strong> real dish photos
        </span>
        {(searchQuery || dietFilter !== 'all' || selectedCategory !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              setSelectedCategory('all');
            }}
            className="text-[#D3452B] hover:underline font-bold"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* 62 Dishe Cards Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-16 bg-[#F7F3EB] rounded-3xl p-8 border border-dashed border-gray-300">
          <Utensils className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="font-['Playfair_Display'] text-xl text-[#2E4823] font-bold">
            No dishes found in this category
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try switching the category tab or clearing your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setDietFilter('all');
            }}
            className="mt-4 px-5 py-2.5 bg-[#2E4823] text-white text-xs font-semibold rounded-xl"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDishes.map((dish, idx) => (
            <motion.div
              key={dish.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="group bg-white rounded-3xl overflow-hidden border border-[#2E4823]/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_rgba(46,72,35,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Slot with Lightbox trigger */}
                <div
                  className="relative aspect-4/3 overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setActiveDish(dish)}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    width={600}
                    height={450}
                    loading={idx < 6 ? 'eager' : 'lazy'}
                    fetchPriority={idx < 6 ? 'high' : 'auto'}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Veg / Non-Veg Indicator Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs text-[11px] font-bold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dish.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                      }`}
                    />
                    <span className={dish.isVeg ? 'text-green-800' : 'text-[#D3452B]'}>
                      {dish.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>

                  {/* View Full Photo hint overlay on hover */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Tap to zoom</span>
                    </span>
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-md border border-[#2E4823]/10">
                    <span className="text-[#D3452B] font-extrabold text-base">
                      ₹{dish.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3
                      className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-[#1C1C1C] group-hover:text-[#2E4823] transition-colors line-clamp-1 cursor-pointer"
                      onClick={() => setActiveDish(dish)}
                    >
                      {dish.name}
                    </h3>
                    {dish.isChefSpecial && (
                      <span className="shrink-0 text-[10px] uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-2 py-0.5 rounded-md">
                        Special
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
                    {dish.description}
                  </p>

                  {dish.portionNote && (
                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-[#2E4823] bg-[#2E4823]/5 px-2.5 py-1 rounded-md">
                        {dish.portionNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order CTAs for each dish */}
              <div className="p-4 pt-0 border-t border-gray-100 flex items-center gap-2 mt-2">
                <a
                  href={RESTAURANT_INFO.swiggyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-center text-xs font-bold rounded-lg bg-[#FC8019]/10 text-[#FC8019] hover:bg-[#FC8019] hover:text-white transition-colors"
                >
                  Swiggy
                </a>
                <a
                  href={RESTAURANT_INFO.zomatoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-center text-xs font-bold rounded-lg bg-[#E23744]/10 text-[#E23744] hover:bg-[#E23744] hover:text-white transition-colors"
                >
                  Zomato
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Selected Dish */}
      <AnimatePresence>
        {activeDish && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveDish(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeDish.name}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveDish(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo Area */}
              <div className="relative aspect-4/3 bg-black">
                <img
                  src={activeDish.image}
                  alt={activeDish.name}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeDish.isVeg ? 'bg-green-600' : 'bg-[#D3452B]'
                    }`}
                  />
                  <span>{activeDish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-4 py-1.5 rounded-xl shadow-lg border border-[#2E4823]/10">
                  <span className="text-[#D3452B] font-extrabold text-xl">
                    ₹{activeDish.price}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#1C1C1C]">
                    {activeDish.name}
                  </h3>
                  {activeDish.isChefSpecial && (
                    <span className="text-xs uppercase font-bold text-[#D3452B] bg-[#D3452B]/10 px-2.5 py-1 rounded-md">
                      Chef's Special
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  {activeDish.description}
                </p>

                {activeDish.portionNote && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-[#2E4823] bg-[#2E4823]/10 px-3 py-1 rounded-md">
                      {activeDish.portionNote}
                    </span>
                  </div>
                )}

                {/* Delivery and Takeaway Buttons */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={RESTAURANT_INFO.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#FC8019] text-white text-xs font-bold text-center shadow-sm hover:bg-[#e67313] transition-colors"
                  >
                    Order on Swiggy
                  </a>
                  <a
                    href={RESTAURANT_INFO.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#E23744] text-white text-xs font-bold text-center shadow-sm hover:bg-[#c92f3b] transition-colors"
                  >
                    Order on Zomato
                  </a>
                  <a
                    href={`tel:${RESTAURANT_INFO.phone}`}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#2E4823] text-white text-xs font-bold text-center shadow-sm hover:bg-[#223719] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Takeaway</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
