import React from 'react';
import { 
  TrendingDown, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Utensils, 
  Gift, 
  ArrowRight,
  Zap,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

interface DirectOrderTrustBannerProps {
  onOpenOrderModal: () => void;
  onOpenCompareModal: () => void;
}

export const DirectOrderTrustBanner: React.FC<DirectOrderTrustBannerProps> = ({
  onOpenOrderModal,
  onOpenCompareModal,
}) => {
  return (
    <section 
      id="direct-order-trust"
      className="py-12 sm:py-16 bg-gradient-to-b from-[#F7F3EB] via-white to-[#F7F3EB] relative overflow-hidden border-y border-[#2E4823]/10"
      aria-label="Why Order Direct from Vaibhav Grand"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Direct Kitchen Ordering Advantage</span>
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Why Pay More on Food Delivery Apps?
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-3.5 rounded-full" />
          <p className="mt-3.5 text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Swiggy &amp; Zomato add hefty aggregator markups, convenience fees, and packaging charges. 
            When you order directly with us, you get <strong className="text-[#2E4823]">genuine dine-in prices</strong>, <strong className="text-[#2E4823]">₹0 platform fees</strong>, and save up to <strong className="text-[#D3452B]">25%–35%</strong> on every meal!
          </p>
        </motion.div>

        {/* Mobile View: Single Best Value Card (< md) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="block md:hidden bg-white rounded-2xl p-5 border-2 border-emerald-500/30 shadow-md relative overflow-hidden mb-6"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
                  Direct Kitchen Advantage
                </span>
                <h3 className="font-['Playfair_Display'] text-base font-bold text-[#1C1C1C] mt-0.5">
                  Dine-In Rates &amp; Zero Hidden Fees
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Why pay 25%–35% Swiggy &amp; Zomato commissions? Order directly to enjoy authentic restaurant rates, zero hidden packaging fees, and free 5km doorstep delivery.
            </p>

            <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Save ₹40–₹80 per dish vs food apps</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>₹0 Platform fee &amp; ₹0 packaging charges</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2E4823] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
                <span>Free 5km direct delivery above ₹299</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Desktop View: 3 Core Trust Pillars Grid (md:grid) */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-10">
          
          {/* Pillar 1: Pure Dine-In Prices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                Zero Aggregator Markup
              </span>
              <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#1C1C1C]">
                Real Dine-In Menu Rates
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Food delivery apps inflate dish prices by 15% to 25% to cover commissions. On our website, you pay the exact same affordable rate as you would sitting in our dining hall.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Save ₹40–₹80 per dish directly</span>
            </div>
          </motion.div>

          {/* Pillar 2: Zero Hidden Fees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                100% Transparent Billing
              </span>
              <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#1C1C1C]">
                ₹0 Platform &amp; Packaging Fees
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                No sneaky ₹12 platform fees. No ₹35–₹50 packaging surcharge added at the last screen. We pack your food in high-grade food-safe insulated containers at zero extra cost.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Save ₹50+ in hidden app charges</span>
            </div>
          </motion.div>

          {/* Pillar 3: Doorstep Delivery & Freshness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-[#2E4823]/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#2E4823]/10 text-[#2E4823] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E4823] bg-[#2E4823]/10 px-2 py-0.5 rounded-md inline-block mb-1.5">
                Speed &amp; Halal Quality
              </span>
              <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#1C1C1C]">
                Free Delivery &amp; Fast Kitchen Prep
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Free delivery within 5.0 km road distance on orders above ₹299. Direct orders are prepped hot on our stoves and sent straight to your doorstep without multi-stop delays.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-[#2E4823] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#2E4823] shrink-0" />
              <span>Hot &amp; fresh with live WhatsApp updates</span>
            </div>
          </motion.div>

        </div>

        {/* Real Cost Comparison Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#213519] via-[#2E4823] to-[#1E3216] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-400/20 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left: Headline & Live Savings Meter */}
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Gift className="w-3.5 h-3.5" />
                <span>Special Online Offer: DIRECT50 + Free Drink</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                Typical Meal Example: 1 Biryani + 1 Chicken Starter
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/85 leading-relaxed">
                On Swiggy/Zomato, inflated rates and extra fees total <strong className="text-white">~₹712</strong>. 
                Direct with us, the exact same meal costs just <strong className="text-amber-300 font-mono text-base sm:text-lg">₹460</strong> — you save <strong className="text-emerald-300">₹252 (35% OFF)</strong>!
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-white/90">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real Menu Prices</span>
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>₹0 Packaging Fee</span>
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free 5km Delivery above ₹299</span>
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <button
                type="button"
                id="trust-order-now-btn"
                onClick={onOpenOrderModal}
                className="btn-shimmer px-6 py-3.5 rounded-full bg-[#D3452B] hover:bg-[#BD3B22] text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Order Direct &amp; Save ₹150+</span>
              </button>

              <button
                type="button"
                id="trust-compare-prices-btn"
                onClick={onOpenCompareModal}
                className="px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white font-bold text-xs sm:text-sm backdrop-blur-xs border border-amber-400/40 transition-all flex items-center justify-center gap-2"
              >
                <span>📊 View Side-by-Side Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
