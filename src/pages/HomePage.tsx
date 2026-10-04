import React from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Hero } from '../components/Hero';
import { HomeMenuPreview } from '../components/HomeMenuPreview';
import { RatingsBanner } from '../components/RatingsBanner';
import { SignatureDishes } from '../components/SignatureDishes';
import { RestaurantPhotosPreview } from '../components/RestaurantPhotosPreview';
import { AboutVaibhavGrand } from '../components/AboutVaibhavGrand';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { CateringEvents } from '../components/CateringEvents';
import { CustomerReviewsMarquee } from '../components/CustomerReviewsMarquee';
import { ContactSection } from '../components/ContactSection';
import { ClosingCTA } from '../components/ClosingCTA';

interface HomePageProps {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenOrderModal,
  onOpenBookModal,
  onNavigate,
}) => {
  return (
    <>
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO
        path="/"
        preloadImage="/assets/images/chicken_mandi_hero_1789894879370.webp"
        jsonLd={getRestaurantSchema()}
      />

      {/* Responsive layout container:
          - Laptop/Desktop (md:): 100% EXACT original desktop section order
          - Mobile (< md:): Red Onion NYC flow (Hero -> Menu with side scroll & search -> Ratings -> Signature specialties with side scroll -> Photos -> Story -> etc.)
      */}
      <div className="flex flex-col">
        {/* Hero: Mobile 1, Desktop 1 */}
        <div className="order-1 md:order-1">
          <Hero
            onOpenOrderModal={onOpenOrderModal}
            onOpenBookModal={onOpenBookModal}
            onNavigate={onNavigate}
          />
        </div>

        {/* Menu Preview: Mobile 2, Desktop 6 */}
        <div className="order-2 md:order-6">
          <HomeMenuPreview
            onNavigateMenu={() => onNavigate('menu')}
            onOpenOrderModal={onOpenOrderModal}
          />
        </div>

        {/* Ratings: Mobile 3, Desktop 2 */}
        <div className="order-3 md:order-2">
          <RatingsBanner />
        </div>

        {/* Signature Dishes: Mobile 4, Desktop 3 */}
        <div className="order-4 md:order-3">
          <SignatureDishes
            onOpenOrderModal={onOpenOrderModal}
            onNavigateMenu={() => onNavigate('menu')}
          />
        </div>

        {/* Photos: Mobile 5, Desktop 5 */}
        <div className="order-5 md:order-5">
          <RestaurantPhotosPreview
            onNavigateGallery={() => onNavigate('gallery')}
          />
        </div>

        {/* About: Mobile 6, Desktop 4 */}
        <div className="order-6 md:order-4">
          <AboutVaibhavGrand
            onOpenBookModal={onOpenBookModal}
            onNavigateAbout={() => onNavigate('about')}
          />
        </div>

        {/* Why Choose Us: Mobile 7, Desktop 7 */}
        <div className="order-7 md:order-7">
          <WhyChooseUs />
        </div>

        {/* Catering: Mobile 8, Desktop 8 */}
        <div className="order-8 md:order-8">
          <CateringEvents />
        </div>

        {/* Reviews: Mobile 9, Desktop 9 */}
        <div className="order-9 md:order-9">
          <CustomerReviewsMarquee />
        </div>

        {/* Contact: Mobile 10, Desktop 10 */}
        <div className="order-10 md:order-10">
          <ContactSection />
        </div>

        {/* Closing CTA: Mobile 11, Desktop 11 */}
        <div className="order-11 md:order-11">
          <ClosingCTA
            onOpenOrderModal={onOpenOrderModal}
            onOpenBookModal={onOpenBookModal}
          />
        </div>
      </div>
    </>
  );
};
