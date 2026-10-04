import { RESTAURANT_INFO, MENU_CATEGORIES, MENU_ITEMS, TESTIMONIALS } from '../data/restaurantData';
import { PHOTO_MENU_ITEMS } from '../data/photoMenuData';

/**
 * Generates Schema.org LocalBusiness / Restaurant JSON-LD structured data.
 * Validated against Google Rich Results guidelines.
 */
export function getRestaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'FoodEstablishment', 'LocalBusiness'],
    '@id': 'https://vaibhavgrand.com/#restaurant',
    name: RESTAURANT_INFO.name,
    alternateName: ['Vaibhav Grand', 'Vaibhav Restaurant Renigunta', 'Vaibhav Grand Tirupati'],
    description:
      'Premier family restaurant in Renigunta, Tirupati specializing in authentic Arabian Chicken & Mutton Mandi platters, firewood Hyderabadi Dum Biryani family buckets, live charcoal tandoori grills, and Mughlai curries. Featuring 100% AC family seating, certified Halal meats, and easy highway parking.',
    image: [
      'https://vaibhavgrand.com/assets/vaibhav-grand-webp-images/front6.webp',
      'https://vaibhavgrand.com/assets/vaibhav-grand-webp-images/food14.webp',
      'https://vaibhavgrand.com/assets/vaibhav-grand-webp-images/ambiance.webp',
      'https://vaibhavgrand.com/assets/vaibhav-grand-webp-images/food12.webp'
    ],
    url: 'https://vaibhavgrand.com/',
    telephone: `+91-${RESTAURANT_INFO.phone}`,
    email: RESTAURANT_INFO.email,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, Google Pay, PhonePe, Paytm',
    servesCuisine: [
      'Indian',
      'Mughlai',
      'Hyderabadi Biryani',
      'Arabic Mandi',
      'Tandoor & Kebab',
      'North Indian',
      'South Indian',
      'Chinese'
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot 157, Near Ramana Vilas Circle, Srikalahasthi Road',
      addressLocality: 'Renigunta, Tirupati',
      postalCode: '517520',
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN'
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Renigunta'
      },
      {
        '@type': 'City',
        name: 'Tirupati'
      }
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.6368,
      longitude: 79.5039
    },
    hasMap: RESTAURANT_INFO.googleMapsUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '12:00',
        closes: '23:00'
      }
    ],
    menu: 'https://vaibhavgrand.com/menu',
    acceptsReservations: true,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: RESTAURANT_INFO.overallRating.toString(),
      reviewCount: RESTAURANT_INFO.totalReviews.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    sameAs: [
      RESTAURANT_INFO.googleMapsUrl,
      RESTAURANT_INFO.instagramUrl,
      RESTAURANT_INFO.facebookUrl,
      RESTAURANT_INFO.swiggyUrl,
      RESTAURANT_INFO.zomatoUrl,
      RESTAURANT_INFO.justdialUrl
    ]
  };
}

/**
 * Generates Schema.org Menu / MenuItem JSON-LD structured data.
 * Validated against Google Rich Results guidelines.
 */
export function getMenuSchema() {
  const categories = MENU_CATEGORIES.filter((c) => c.id !== 'all');

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Vaibhav Grand Culinary Menu',
    url: 'https://vaibhavgrand.com/menu',
    inLanguage: 'en',
    mainEntityOfPage: 'https://vaibhavgrand.com/menu',
    hasMenuSection: categories.map((cat) => {
      const items = MENU_ITEMS.filter((item) => item.category === cat.id);
      return {
        '@type': 'MenuSection',
        name: cat.label,
        hasMenuItem: items.map((dish) => {
          const photoMatch = PHOTO_MENU_ITEMS.find((p) => p.name.toLowerCase() === dish.name.toLowerCase());
          return {
            '@type': 'MenuItem',
            name: dish.name,
            description: dish.description,
            offers: {
              '@type': 'Offer',
              price: dish.price.toString(),
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock'
            },
            ...(dish.isVeg ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
            ...(photoMatch?.image
              ? { image: `https://vaibhavgrand.com${photoMatch.image}` }
              : {})
          };
        })
      };
    })
  };
}

/**
 * Generates Schema.org AggregateRating & Review JSON-LD structured data.
 * Validated against Google Rich Results guidelines.
 */
export function getReviewsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://vaibhavgrand.com/#restaurant',
    name: RESTAURANT_INFO.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: RESTAURANT_INFO.overallRating.toString(),
      reviewCount: RESTAURANT_INFO.totalReviews.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    review: TESTIMONIALS.map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.name
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: rev.quote,
      publisher: {
        '@type': 'Organization',
        name: rev.isGoogleReview ? 'Google Maps' : 'JustDial'
      }
    }))
  };
}
