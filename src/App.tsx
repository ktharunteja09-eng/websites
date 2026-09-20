/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhyChooseUs } from './components/WhyChooseUs';
import { SignatureDishes } from './components/SignatureDishes';
import { MenuSection } from './components/MenuSection';
import { Testimonials } from './components/Testimonials';
import { TrustedNeighborhood } from './components/TrustedNeighborhood';
import { CateringEvents } from './components/CateringEvents';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { ClosingCTA } from './components/ClosingCTA';
import { Footer } from './components/Footer';
import { MobileActionBar } from './components/MobileActionBar';
import { BackToTop } from './components/BackToTop';
import { PolicyModal } from './components/PolicyModals';
import { NotFoundView } from './components/NotFoundView';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { ScrollProgressBar } from './components/ScrollProgressBar';

export default function App() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [is404, setIs404] = useState(false);

  // Check if initial URL or hash points to 404
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#404' || path === '/404') {
        setIs404(true);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  const handleBackHome = () => {
    setIs404(false);
    if (window.location.hash === '#404') {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user navigates to a simulated 404 or tests the 404 route
  if (is404) {
    return <NotFoundView onBackHome={handleBackHome} />;
  }

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#FDFBF7] text-[#1C1C1C] flex flex-col selection:bg-[#2E4823] selection:text-[#FDFBF7]">
        {/* Luxury Butter Smooth Scroll Reading Progress Indicator */}
        <ScrollProgressBar />

        {/* 1. Sticky Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 w-full flex flex-col">
          {/* 2. Hero Section with 4-Image Crossfading Background */}
          <Hero />

          {/* 3. Why Choose Us Section */}
          <WhyChooseUs />

          {/* 4. Signature Dishes Showcase */}
          <SignatureDishes />

          {/* 5. Full Menu Section with Live Search & Category Filtering */}
          <MenuSection />

          {/* 6. Testimonials Section with Carousel & 3.6★ Rating */}
          <Testimonials />

          {/* 7. Trusted by the Neighborhood Section */}
          <TrustedNeighborhood />

          {/* 8. Catering & Private Events Section */}
          <CateringEvents />

          {/* 9. Visual Gallery with Interactive Lightbox */}
          <GallerySection />

          {/* 10. Contact & Location Section (No Form, Embedded Google Map) */}
          <ContactSection />

          {/* 11. Full-Width Closing CTA Section */}
          <ClosingCTA />
        </main>

        {/* 10. Footer */}
        <Footer
          onOpenPrivacy={() => setPrivacyOpen(true)}
          onOpenTerms={() => setTermsOpen(true)}
          onOpen404={() => setIs404(true)}
        />

        {/* Mobile-Only Sticky Action Bar (<768px) */}
        <MobileActionBar />

        {/* Back to Top Button */}
        <BackToTop />

        {/* Policy Modals */}
        <PolicyModal
          isOpen={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          title="Privacy Policy"
          type="privacy"
        />

        <PolicyModal
          isOpen={termsOpen}
          onClose={() => setTermsOpen(false)}
          title="Terms of Service"
          type="terms"
        />
      </div>
    </SmoothScrollProvider>
  );
}
