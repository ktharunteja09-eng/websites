import React from 'react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { MapPin, Clock, Phone, Mail, Instagram, Facebook, MessageCircle, ExternalLink, Star } from 'lucide-react';
import { BrandEmblem } from './BrandEmblem';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpen404: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onOpen404,
}) => {
  return (
    <footer className="bg-[#141414] text-[#FDFBF7] pt-16 pb-24 md:pb-12 border-t border-white/10" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 4 Columns Layout matching Red Onion NYC footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Column 1: Restaurant Brand & Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandEmblem className="w-10 h-10 shrink-0" idSuffix="footer" />
              <div className="flex flex-col">
                <span className="font-['Playfair_Display'] text-2xl font-bold tracking-tight text-white">
                  Vaibhav Grand
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D3452B] font-semibold mt-0.5">
                  Family Restaurant • Renigunta
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Authentic Indian, royal Mughlai, Arabian Mandi platters, and clay oven tandoors. Proudly serving families, students, and pilgrims in Renigunta, Tirupati.
            </p>

            <div className="pt-2">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-[#D3452B] shrink-0 mt-0.5" />
                <span>{RESTAURANT_INFO.address}</span>
              </div>
              <div className="mt-2 pl-6">
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D3452B] hover:text-[#ff6a50] transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Page Navigation */}
          <div className="space-y-3">
            <h3 className="font-['Playfair_Display'] text-base font-bold text-white tracking-wide">
              Explore Pages
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('menu')}
                  className="hover:text-white transition-colors"
                >
                  Grand Culinary Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  About Our Kitchen &amp; Heritage
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catering')}
                  className="hover:text-white transition-colors"
                >
                  Catering &amp; Birthday Parties
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors"
                >
                  Photo Gallery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Location &amp; Hours
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Delivery Links */}
          <div className="space-y-4">
            <h3 className="font-['Playfair_Display'] text-base font-bold text-white tracking-wide">
              Dining Hours
            </h3>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Open Daily (365 Days)</p>
                <p className="text-gray-400 mt-0.5">12:00 PM – 11:00 PM</p>
                <p className="text-[11px] text-gray-500 mt-1">Lunch, High Tea &amp; Late Dinner</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Order Delivery Online
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={RESTAURANT_INFO.swiggyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-gray-300 hover:text-[#FC8019] transition-colors flex items-center gap-1"
                >
                  <span>Swiggy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href={RESTAURANT_INFO.zomatoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-gray-300 hover:text-[#E23744] transition-colors flex items-center gap-1"
                >
                  <span>Zomato</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h3 className="font-['Playfair_Display'] text-base font-bold text-white tracking-wide">
              Direct Contact
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D3452B]" />
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="font-bold text-white hover:text-[#D3452B] transition-colors text-base"
                >
                  {RESTAURANT_INFO.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D3452B]" />
                <a
                  href={`mailto:${RESTAURANT_INFO.email}`}
                  className="text-gray-300 hover:text-white transition-colors text-xs break-all"
                >
                  {RESTAURANT_INFO.email}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2.5">
                Follow &amp; Chat
              </span>
              <div className="flex items-center gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/91${RESTAURANT_INFO.phone}?text=Hi%2C%20I%27d%20like%20to%20know%20more%20%2F%20book%20a%20table`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Vaibhav Grand on WhatsApp"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                {/* Instagram */}
                <a
                  href={RESTAURANT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Vaibhav Grand on Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E1306C] text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                {/* Facebook */}
                <a
                  href={RESTAURANT_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Vaibhav Grand on Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer row */}
        <div className="py-4 text-center border-b border-white/5">
          <p className="text-[11px] text-gray-500 italic max-w-3xl mx-auto">
            Prices, menu items, and availability are subject to change without notice. Delivery prices on Swiggy and Zomato may vary from our dine-in menu.
          </p>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Vaibhav Grand Family Restaurant. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpen404}
              className="hover:text-white transition-colors underline-offset-4 hover:underline text-[11px]"
            >
              404 Page
            </button>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors underline-offset-4 hover:underline text-[11px]"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-white transition-colors underline-offset-4 hover:underline text-[11px]"
            >
              Terms of Service
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
