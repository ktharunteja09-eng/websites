import React from 'react';
import { Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

export const TopUtilityBar: React.FC = () => {
  return (
    <div
      id="top-utility-bar"
      className="w-full bg-[#141414] text-[#FDFBF7]/85 border-b border-white/10 select-none text-xs"
      role="region"
      aria-label="Restaurant Quick Information & Hours"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-y-1.5">
        {/* Left: Contact Info (Phone & Email) */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-white/80">
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
            title="Call Vaibhav Grand"
          >
            <Phone className="w-3.5 h-3.5 text-[#D3452B] group-hover:scale-110 transition-transform" />
            <span className="font-medium tracking-wide">{RESTAURANT_INFO.phone}</span>
          </a>

          <a
            href={`mailto:${RESTAURANT_INFO.email}`}
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors group"
            title="Email Vaibhav Grand"
          >
            <Mail className="w-3.5 h-3.5 text-[#D3452B] group-hover:scale-110 transition-transform" />
            <span className="font-normal text-white/75 group-hover:text-white">{RESTAURANT_INFO.email}</span>
          </a>
        </div>

        {/* Right: Operational Hours & Social Icons */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto sm:ml-0 text-xs">
          <div className="flex items-center gap-1.5 text-white/85">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Open Daily: 12PM-11PM</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/15">
            <a
              href={RESTAURANT_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Vaibhav Grand on Instagram"
              title="Instagram @vaibh_avgrand"
              className="text-white/70 hover:text-white hover:scale-110 transition-all p-1"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href={RESTAURANT_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Vaibhav Grand on Facebook"
              title="Facebook @vaibhavgrandfamilyrestaurant"
              className="text-white/70 hover:text-white hover:scale-110 transition-all p-1"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
