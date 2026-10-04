export type MenuCategoryType = 
  | 'all'
  | 'mandi'
  | 'biryani'
  | 'starters'
  | 'curries'
  | 'rice-noodles'
  | 'breads'
  | 'beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryType;
  price: number;
  description: string;
  isVeg: boolean;
  isChefSpecial?: boolean;
  portionNote?: string;
  image?: string;
}

export interface PhotoMenuItem extends MenuItem {
  image: string;
}

export interface SignatureDish {
  id: string;
  name: string;
  tagline: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  badge: string;
  serving: string;
  spiceLevel?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  date?: string;
  isGoogleReview?: boolean;
  highlightDish?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'All' | 'Food & Mandi' | 'Ambiance' | 'Celebrations' | 'Front View';
  imageUrl: string;
  altText: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  address: string;
  landmark: string;
  phone: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookUrl: string;
  hours: string;
  swiggyUrl: string;
  zomatoUrl: string;
  googleMapsUrl: string;
  googleMapsReviewUrl: string;
  googleMapsEmbedUrl: string;
  overallRating: number;
  totalReviews: number;
  justdialUrl: string;
}

export interface DigitalMenuPage {
  id: string;
  pageNumber: number;
  title: string;
  subtitle: string;
  category: string;
  defaultPlaceholderImage: string;
  itemsPreview: string[];
}
