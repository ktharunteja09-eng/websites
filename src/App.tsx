import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileActionBar } from './components/MobileActionBar';
import { BackToTop } from './components/BackToTop';
import { PolicyModal } from './components/PolicyModals';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { HelmetProvider } from 'react-helmet-async';
import { CallToBookModal } from './components/CallToBookModal';
import { OrderOnlineModal } from './components/OrderOnlineModal';
import { useScrollLock } from './utils/scrollLock';

// Dedicated Pages matching Red Onion NYC structure
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { AboutPage } from './pages/AboutPage';
import { CateringPage } from './pages/CateringPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

export interface RouteOutletContext {
  onOpenOrderModal: () => void;
  onOpenBookModal: () => void;
  onNavigate: (path: string) => void;
  onNavigateHome: () => void;
}

export function useAppOutletContext() {
  return useOutletContext<RouteOutletContext>();
}

// Page wrappers to pass context callbacks seamlessly to existing page signatures
export const HomePageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigate } = useAppOutletContext();
  return (
    <HomePage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigate={onNavigate}
    />
  );
};

export const MenuPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <MenuPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const AboutPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <AboutPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const CateringPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <CateringPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const ReviewsPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <ReviewsPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const GalleryPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <GalleryPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const ContactPageWrapper: React.FC = () => {
  const { onOpenOrderModal, onOpenBookModal, onNavigateHome } = useAppOutletContext();
  return (
    <ContactPage
      onOpenOrderModal={onOpenOrderModal}
      onOpenBookModal={onOpenBookModal}
      onNavigateHome={onNavigateHome}
    />
  );
};

export const NotFoundPageWrapper: React.FC = () => {
  const { onNavigateHome } = useAppOutletContext();
  return <NotFoundPage onBackHome={onNavigateHome} />;
};

export default function App() {
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  const [orderOpen, setOrderOpen] = useState<boolean>(false);
  const [bookOpen, setBookOpen] = useState<boolean>(false);

  // Lock background scrolling and pause Lenis when any modal is open
  useScrollLock(privacyOpen || termsOpen || orderOpen || bookOpen);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Derive active page identifier for navbar indicator
  const cleanPath = location.pathname.replace(/^\//, '').toLowerCase();
  const currentPage = !cleanPath ? 'home' : cleanPath;

  const handleNavigate = (pathOrPage: string) => {
    const target =
      pathOrPage === 'home' || pathOrPage === '/'
        ? '/'
        : pathOrPage.startsWith('/')
        ? pathOrPage
        : `/${pathOrPage}`;
    navigate(target);
  };

  const outletContext: RouteOutletContext = {
    onOpenOrderModal: () => setOrderOpen(true),
    onOpenBookModal: () => setBookOpen(true),
    onNavigate: handleNavigate,
    onNavigateHome: () => handleNavigate('/'),
  };

  return (
    <HelmetProvider>
      <SmoothScrollProvider>
        <div className="min-h-screen bg-[#FDFBF7] text-[#1C1C1C] flex flex-col selection:bg-[#2E4823] selection:text-[#FDFBF7]">
          {/* Luxury Butter Smooth Scroll Reading Progress Indicator */}
          <ScrollProgressBar />

          {/* 1. Header Navigation with Red Onion NYC style Pages */}
          <Navbar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onOpenOrderModal={() => setOrderOpen(true)}
            onOpenBookModal={() => setBookOpen(true)}
          />

          {/* 2. Main Page Views rendered via Router Outlet */}
          <main id="main-content" className="flex-1 w-full flex flex-col">
            <Outlet context={outletContext} />
          </main>

          {/* 3. Footer */}
          <Footer
            onNavigate={handleNavigate}
            onOpenPrivacy={() => setPrivacyOpen(true)}
            onOpenTerms={() => setTermsOpen(true)}
            onOpen404={() => handleNavigate('/404')}
          />

          {/* Mobile Sticky Action Bar */}
          <MobileActionBar
            onOpenOrderModal={() => setOrderOpen(true)}
            onOpenBookModal={() => setBookOpen(true)}
          />

          {/* Back to Top Button */}
          <BackToTop />

          {/* Call to Book Modal */}
          <CallToBookModal
            isOpen={bookOpen}
            onClose={() => setBookOpen(false)}
          />

          {/* Order Online Modal (Swiggy / Zomato + Call Takeaway) */}
          <OrderOnlineModal
            isOpen={orderOpen}
            onClose={() => setOrderOpen(false)}
          />

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
    </HelmetProvider>
  );
}
