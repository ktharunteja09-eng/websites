import React, { useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, TrendingDown, ShieldCheck, Clock, Gift, Percent } from 'lucide-react';
import { useScrollLock } from '../utils/scrollLock';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderDirect: () => void;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
  isOpen,
  onClose,
  onOrderDirect,
}) => {
  useScrollLock(isOpen);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[90] overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-comparison-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#2E4823]/20 flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden my-auto animate-scale-up text-[#1C1C1C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner - Fixed / Shrink-0 */}
        <div className="bg-gradient-to-r from-[#2E4823] via-[#1E3216] to-[#2E4823] text-white p-4 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingDown className="w-4 h-4 text-amber-300" />
            <span>Direct Kitchen Advantage</span>
          </div>

          <h2 id="price-comparison-title" className="font-['Playfair_Display'] text-lg sm:text-2xl font-bold pr-8 sm:pr-0">
            Why Order Direct from Our Website?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
            Swiggy &amp; Zomato add hefty aggregator markups &amp; hidden charges. When you order directly from Vaibhav Grand, you save up to <span className="text-amber-300 font-bold">25% to 35%</span> on every single meal!
          </p>
        </div>

        {/* Modal Body - Scrollable with inertia & touch support */}
        <div
          data-lenis-prevent
          className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto overscroll-contain min-h-0"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {/* Side-by-Side Comparison Table */}
          <div className="rounded-2xl border border-gray-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F3EB] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 sm:px-4 font-bold text-[#1C1C1C]">What You Pay For</th>
                  <th className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/70 border-x border-emerald-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2E4823]" />
                      <span>Vaibhav Grand Direct</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-bold text-gray-500">Swiggy / Zomato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Dish Menu Prices</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real Dine-In Menu Rate</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>15% – 25% Higher Markup</span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Platform Convenience Fee</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100">
                    <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">₹0 (Always FREE)</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>+₹10 to ₹15 added</span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Restaurant Packaging Charge</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100">
                    <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">₹0 (FREE Eco-Box)</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>+₹30 to ₹45 added</span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Doorstep Delivery</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100">
                    <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">FREE above ₹299 (5km)</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>+₹35 to ₹60 surge fee</span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Direct Offers &amp; Freebies</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-[#D3452B] shrink-0" />
                    <span>Flat 10% OFF + Free Drink</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>No free drinks</span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 sm:px-4 font-semibold">Food Freshness &amp; Handling</td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-[#2E4823] bg-emerald-50/30 border-x border-emerald-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Kitchen to Doorstep</span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-gray-500">
                    <span>Multi-stop delivery batches</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Real Example Comparison Card */}
          <div className="bg-[#F7F3EB] rounded-2xl p-4 sm:p-5 border border-[#2E4823]/15">
            <h4 className="font-['Playfair_Display'] text-sm sm:text-base font-bold text-[#2E4823] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D3452B]" />
              <span>Real Example Order: 1x Biryani + 1x Chicken Starter</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Aggregator Cost */}
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                  On Swiggy / Zomato
                </span>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li className="flex justify-between"><span>Biryani (Marked up):</span> <span>₹280</span></li>
                  <li className="flex justify-between"><span>Chicken 65 (Marked up):</span> <span>₹340</span></li>
                  <li className="flex justify-between"><span>Packaging charge:</span> <span>₹35</span></li>
                  <li className="flex justify-between"><span>Platform fee:</span> <span>₹12</span></li>
                  <li className="flex justify-between"><span>Delivery fee:</span> <span>₹45</span></li>
                </ul>
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-bold text-sm text-gray-800">
                  <span>Total Bill:</span>
                  <span className="text-[#D3452B]">₹712</span>
                </div>
              </div>

              {/* Direct Website Cost */}
              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <span>On Vaibhav Grand Direct</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold">BEST</span>
                </span>
                <ul className="text-xs space-y-1 text-emerald-900">
                  <li className="flex justify-between"><span>Biryani (Dine-In Price):</span> <span>₹230</span></li>
                  <li className="flex justify-between"><span>Chicken 65 (Dine-In Price):</span> <span>₹280</span></li>
                  <li className="flex justify-between text-emerald-700"><span>Packaging:</span> <span>₹0 FREE</span></li>
                  <li className="flex justify-between text-emerald-700"><span>Platform Fee:</span> <span>₹0 FREE</span></li>
                  <li className="flex justify-between text-[#D3452B] font-semibold"><span>DIRECT50 Discount:</span> <span>-₹50</span></li>
                </ul>
                <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between font-bold text-sm text-[#2E4823]">
                  <span>Total Bill:</span>
                  <span className="text-emerald-700">₹460</span>
                </div>
              </div>
            </div>

            {/* Total Savings Highlight Callout */}
            <div className="mt-4 bg-[#2E4823] text-white rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-400 text-[#2E4823] font-black text-sm flex items-center justify-center">
                  ₹
                </span>
                <div>
                  <span className="text-xs font-bold block text-amber-300">You Save On This Order:</span>
                  <span className="text-sm font-semibold text-white/90">₹252 saved (35% OFF!) + Free Cool Drink</span>
                </div>
              </div>
              <span className="text-lg font-black text-amber-300 font-mono">
                Save ₹252
              </span>
            </div>
          </div>

          {/* Delivery Policy Note */}
          <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Direct delivery is available within <strong>5.0 km road distance</strong> from Vaibhav Grand, Renigunta. Free delivery on orders above ₹299. Self-pickup is also available with zero wait time.
            </p>
          </div>
        </div>

        {/* Modal Footer CTA - Fixed / Shrink-0 */}
        <div className="p-3.5 sm:p-5 bg-[#F7F3EB] border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-xs text-gray-500 font-semibold block">Dine-in menu rates apply direct</span>
            <span className="text-sm font-bold text-[#2E4823]">Start building your cart &amp; save!</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOrderDirect();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#D3452B] hover:bg-[#B3351E] text-white text-xs font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Order Direct &amp; Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
