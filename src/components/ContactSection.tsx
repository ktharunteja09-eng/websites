import React from 'react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-16 sm:py-24 bg-[#FDFBF7] relative scroll-mt-12"
      aria-label="Restaurant Contact and Location"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Buttery Smooth Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#D3452B] block mb-2">
            Visit Our Hearth
          </span>
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E4823] tracking-tight">
            Location &amp; Hours
          </h2>
          <div className="w-16 h-1 bg-[#D3452B] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-[#1C1C1C]/80 font-normal leading-relaxed">
            Conveniently situated on Srikalahasthi Road in Renigunta, Tirupati, with easy parking and direct highway connectivity.
          </p>
        </motion.div>

        {/* 2-Column Layout: Left Direct Details with Icons (No Form!), Right Embedded Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Direct Business Details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              
              {/* Phone Card */}
              <div className="bg-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/10 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E4823] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Direct Telephone
                  </span>
                  <div className="mt-1">
                    <a
                      href="tel:7947142432"
                      id="contact-phone-link"
                      className="text-lg sm:text-xl font-bold text-[#1C1C1C] hover:text-[#D3452B] transition-colors"
                    >
                      {RESTAURANT_INFO.phone}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tap to call for table reservations, takeaway parcels, or bulk catering.
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/10 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E4823] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email Inquiries
                  </span>
                  <div className="mt-1">
                    <a
                      href={`mailto:${RESTAURANT_INFO.email}`}
                      className="text-base sm:text-lg font-bold text-[#1C1C1C] hover:text-[#D3452B] transition-colors break-all"
                    >
                      {RESTAURANT_INFO.email}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For corporate dining contracts and feedback.
                  </p>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/10 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D3452B] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Restaurant Address
                  </span>
                  <p className="mt-1 text-sm sm:text-base font-medium text-[#1C1C1C] leading-relaxed">
                    {RESTAURANT_INFO.address}
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold text-[#2E4823] bg-[#2E4823]/10 px-2.5 py-1 rounded-md">
                    {RESTAURANT_INFO.landmark}
                  </span>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-[#F7F3EB] rounded-2xl p-5 sm:p-6 border border-[#2E4823]/10 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E4823] text-white flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Operating Hours
                  </span>
                  <p className="mt-1 text-base sm:text-lg font-bold text-[#2E4823]">
                    {RESTAURANT_INFO.hours}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Continuous dining service through lunch, high tea, and late dinner.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Channels Bar */}
            <div className="bg-white rounded-2xl p-5 border border-[#2E4823]/10 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Connect on Social
                </span>
                <span className="text-sm font-bold text-[#2E4823]">
                  {RESTAURANT_INFO.instagramHandle}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={RESTAURANT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Vaibhav Grand on Instagram"
                  className="w-10 h-10 rounded-full bg-[#F7F3EB] text-[#1C1C1C] hover:bg-[#D3452B] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={RESTAURANT_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Vaibhav Grand on Facebook"
                  className="w-10 h-10 rounded-full bg-[#F7F3EB] text-[#1C1C1C] hover:bg-[#2E4823] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Embedded Interactive Google Map */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="relative w-full h-[450px] sm:h-full min-h-[420px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(46,72,35,0.08)] border border-[#2E4823]/15 bg-[#F7F3EB]">
              
              {/* Interactive Iframe */}
              <iframe
                title="Vaibhav Grand Family Restaurant Location on Google Maps"
                src="https://maps.google.com/maps?q=13.6508,79.5144+(Vaibhav+Grand+Family+Restaurant)&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />

              {/* Floating Directions Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#2E4823]/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-['Playfair_Display'] text-sm font-bold text-[#2E4823]">
                      Vaibhav Grand
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Ramana Vilas Circle, Renigunta
                    </p>
                  </div>
                  <a
                    href={RESTAURANT_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-[#2E4823] hover:bg-[#223719] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    <span>Directions</span>
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
