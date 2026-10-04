import React from 'react';
import { RouteRecord } from 'vite-react-ssg';
import { Navigate } from 'react-router-dom';
import App, {
  HomePageWrapper,
  MenuPageWrapper,
  AboutPageWrapper,
  CateringPageWrapper,
  ReviewsPageWrapper,
  GalleryPageWrapper,
  ContactPageWrapper,
  NotFoundPageWrapper,
} from './App';

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePageWrapper />,
      },
      {
        path: 'menu',
        element: <MenuPageWrapper />,
      },
      {
        path: 'about',
        element: <AboutPageWrapper />,
      },
      {
        path: 'catering',
        element: <CateringPageWrapper />,
      },
      {
        path: 'reviews',
        element: <ReviewsPageWrapper />,
      },
      {
        path: 'gallery',
        element: <GalleryPageWrapper />,
      },
      {
        path: 'contact',
        element: <ContactPageWrapper />,
      },
      // 301-equivalent client and SSG redirects for aliases
      {
        path: 'dishes',
        element: <Navigate to="/menu" replace />,
      },
      {
        path: 'our-dishes',
        element: <Navigate to="/menu" replace />,
      },
      {
        path: 'why-us',
        element: <Navigate to="/about" replace />,
      },
      {
        path: 'specialties',
        element: <Navigate to="/about" replace />,
      },
      {
        path: 'events',
        element: <Navigate to="/catering" replace />,
      },
      {
        path: 'testimonials',
        element: <Navigate to="/reviews" replace />,
      },
      {
        path: 'hours',
        element: <Navigate to="/contact" replace />,
      },
      {
        path: 'location',
        element: <Navigate to="/contact" replace />,
      },
      {
        path: 'home',
        element: <Navigate to="/" replace />,
      },
      {
        path: '404',
        element: <NotFoundPageWrapper />,
      },
      {
        path: '*',
        element: <NotFoundPageWrapper />,
      },
    ],
  },
];
