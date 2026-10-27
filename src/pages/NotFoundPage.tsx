import React from 'react';
import { SEO } from '../components/SEO';
import { Home, UtensilsCrossed, Phone, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { RESTAURANT_INFO, SIGNATURE_DISHES } from '../data/restaurantData';
import { OptimizedImage } from '../components/OptimizedImage';

import { useNavigate } from 'react-router-dom';

interface NotFoundPageProps {
  onBackHome: () => void;
  onNavigateAdmin?: () => void;
  isError?: boolean;
  onReload?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onBackHome,
  onNavigateAdmin,
  isError = false,
  onReload,
}) => {
  const navigate = useNavigate();

  const handleOpenAdmin = () => {
    if (onNavigateAdmin) {
      onNavigateAdmin();
    } else {
      navigate('/admin');
    }
  };

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      id="not-found-container"
      className="min-h-screen bg-[#FDFBF7] text-[#1C1C1C] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8"
      role="region"
      aria-label={isError ? 'Loading Error' : '404 Page Not Found'}
    >
      <SEO
        path={isError ? '/error' : '/404'}
        title={isError ? 'Loading Error | Vaibhav Grand Family Restaurant' : 'Page Not Found | Vaibhav Grand Family Restaurant'}
        description={
          isError
            ? 'A temporary loading error occurred. Please reload to refresh the latest menu and specials from Vaibhav Grand.'
            : 'The page you requested could not be found. Explore our authentic biryanis, mandi, and kebabs at Vaibhav Grand in Renigunta, Tirupati.'
        }
      />

      {/* Brand Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8 border-b border-[#2E4823]/10">
        <button
          type="button"
          onClick={onBackHome}
          className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-[#2E4823] text-left"
        >
          Vaibhav Grand
          <span className="block text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#D3452B]">
            Family Restaurant • Renigunta
          </span>
        </button>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E4823] hover:text-[#D3452B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-3xl mx-auto w-full py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#D3452B]/10 text-[#D3452B] flex items-center justify-center mx-auto mb-6 shadow-inner">
          <UtensilsCrossed className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D3452B] block mb-2">
          {isError ? 'Temporary Loading Hiccup' : 'Error 404 — Missing Dish or Table'}
        </span>

        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2E4823] tracking-tight mb-4">
          {isError ? 'Unable to Load This Page' : "This Recipe Isn't On Our Stove"}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
          {isError
            ? 'A connection hiccup or updated menu version interrupted loading. Please reload the page to fetch the latest version fresh from our kitchen.'
            : 'The page or link you requested couldn’t be found. Don’t let your appetite wait — explore our bestselling dishes or return to the main feast!'}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
          {isError ? (
            <>
              <button
                type="button"
                onClick={handleReload}
                id="error-reload-btn"
                className="w-full sm:w-auto min-w-[200px] min-h-[48px] px-8 py-3 rounded-full bg-[#2E4823] hover:bg-[#223719] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={onBackHome}
                id="error-return-home-btn"
                className="w-full sm:w-auto min-w-[200px] min-h-[48px] px-8 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#ede7db] text-[#1C1C1C] font-semibold text-sm border border-[#2E4823]/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#2E4823]" />
                <span>Return to Home &amp; Menu</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onBackHome}
                id="notfound-return-home-btn"
                className="w-full sm:w-auto min-w-[200px] min-h-[48px] px-8 py-3 rounded-full bg-[#2E4823] hover:bg-[#223719] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home &amp; Menu</span>
              </button>

              {onReload && (
                <button
                  type="button"
                  onClick={handleReload}
                  id="notfound-reload-btn"
                  className="w-full sm:w-auto min-w-[180px] min-h-[48px] px-6 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#ede7db] text-[#1C1C1C] font-semibold text-sm border border-[#2E4823]/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#2E4823]" />
                  <span>Reload</span>
                </button>
              )}

              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="w-full sm:w-auto min-w-[200px] min-h-[48px] px-8 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#ede7db] text-[#1C1C1C] font-semibold text-sm border border-[#2E4823]/15 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-[#D3452B]" />
                <span>Call: {RESTAURANT_INFO.phone}</span>
              </a>
            </>
          )}
        </div>

        {/* Recommended Dishes Snapshot */}
        <div className="text-left bg-white rounded-3xl p-6 sm:p-8 border border-[#2E4823]/10 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#D3452B]" />
            <h2 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#2E4823]">
              Popular House Specialties While You're Here:
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {SIGNATURE_DISHES.map((dish) => (
              <div
                key={dish.id}
                onClick={onBackHome}
                className="group cursor-pointer rounded-2xl p-3 bg-[#FDFBF7] border border-[#2E4823]/10 hover:border-[#2E4823]/30 transition-all flex flex-col justify-between"
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden mb-3">
                  <OptimizedImage
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#2E4823] line-clamp-1">{dish.name}</span>
                    <span className="text-xs font-bold text-[#D3452B]">₹{dish.price}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="max-w-4xl mx-auto w-full pt-8 border-t border-[#2E4823]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Vaibhav Grand Family Restaurant. Renigunta, Tirupati.</p>
        <button
          type="button"
          onClick={handleOpenAdmin}
          id="admin-portal-link"
          aria-label="Admin Portal"
          className="hover:text-[#2E4823] text-gray-400 transition-colors underline-offset-4 hover:underline text-[11px] font-semibold"
        >
          Admin Portal
        </button>
      </div>
    </div>
  );
};
