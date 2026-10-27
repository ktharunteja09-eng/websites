import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { getRestaurantSchema } from '../utils/schemaGenerator';
import { Hero } from '../components/Hero';
import { DirectOrderTrustBanner } from '../components/DirectOrderTrustBanner';
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
import { PriceComparisonModal } from '../components/PriceComparisonModal';

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
  const [isPriceCompareOpen, setIsPriceCompareOpen] = useState(false);

  return (
    <>
      {/* Dynamic SEO & Schema.org LocalBusiness */}
      <SEO
        path="/"
        preloadImage="/assets/images/chicken_mandi_hero_1080w.webp"
        preloadImageSrcSet="/assets/images/chicken_mandi_hero_640w.webp 640w, /assets/images/chicken_mandi_hero_1080w.webp 1080w, /assets/images/chicken_mandi_hero_1400w.webp 1400w"
        preloadImageSizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1400px"
        jsonLd={getRestaurantSchema()}
      />

      {/* Responsive layout container:
          - Laptop/Desktop (md:): Enhanced flow with trust banner & price comparison
          - Mobile (< md:): Red Onion NYC flow (Hero -> Direct Trust -> Menu -> Ratings -> Signature -> Photos -> Story -> etc.)
      */}
      <div className="flex flex-col">
        {/* Hero: Mobile 1, Desktop 1 */}
        <div className="order-1 md:order-1">
          <Hero
            onOpenOrderModal={onOpenOrderModal}
            onOpenBookModal={onOpenBookModal}
            onNavigate={onNavigate}
            onOpenCompareModal={() => setIsPriceCompareOpen(true)}
          />
        </div>

        {/* Direct Order Trust Banner: Mobile 2, Desktop 3 */}
        <div className="order-2 md:order-3">
          <DirectOrderTrustBanner
            onOpenOrderModal={onOpenOrderModal}
            onOpenCompareModal={() => setIsPriceCompareOpen(true)}
          />
        </div>

        {/* Menu Preview: Mobile 3, Desktop 7 */}
        <div className="order-3 md:order-7">
          <HomeMenuPreview
            onNavigateMenu={() => onNavigate('menu')}
            onOpenOrderModal={onOpenOrderModal}
            onOpenCompareModal={() => setIsPriceCompareOpen(true)}
          />
        </div>

        {/* Ratings: Mobile 4, Desktop 2 */}
        <div className="order-4 md:order-2">
          <RatingsBanner />
        </div>

        {/* Signature Dishes: Mobile 5, Desktop 4 */}
        <div className="order-5 md:order-4">
          <SignatureDishes
            onOpenOrderModal={onOpenOrderModal}
            onNavigateMenu={() => onNavigate('menu')}
          />
        </div>

        {/* Photos: Mobile 6, Desktop 6 */}
        <div className="order-6 md:order-6">
          <RestaurantPhotosPreview
            onNavigateGallery={() => onNavigate('gallery')}
          />
        </div>

        {/* About: Mobile 7, Desktop 5 */}
        <div className="order-7 md:order-5">
          <AboutVaibhavGrand
            onOpenBookModal={onOpenBookModal}
            onNavigateAbout={() => onNavigate('about')}
          />
        </div>

        {/* Why Choose Us: Mobile 8, Desktop 8 */}
        <div className="order-8 md:order-8">
          <WhyChooseUs />
        </div>

        {/* Catering: Mobile 9, Desktop 9 */}
        <div className="order-9 md:order-9">
          <CateringEvents
            onOpenBookModal={onOpenBookModal}
            showWeddingSpecialist={false}
            isHomePage={true}
          />
        </div>

        {/* Reviews: Mobile 10, Desktop 10 */}
        <div className="order-10 md:order-10">
          <CustomerReviewsMarquee />
        </div>

        {/* Contact: Mobile 11, Desktop 11 */}
        <div className="order-11 md:order-11">
          <ContactSection />
        </div>

        {/* Closing CTA: Mobile 12, Desktop 12 */}
        <div className="order-12 md:order-12">
          <ClosingCTA
            onOpenOrderModal={onOpenOrderModal}
            onOpenBookModal={onOpenBookModal}
          />
        </div>
      </div>

      {/* Side-by-Side Swiggy/Zomato vs Direct Price Comparison Modal */}
      <PriceComparisonModal
        isOpen={isPriceCompareOpen}
        onClose={() => setIsPriceCompareOpen(false)}
        onOrderDirect={onOpenOrderModal}
      />
    </>
  );
};
