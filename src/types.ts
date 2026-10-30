export type MenuCategoryType = 
  | 'all'
  | 'veg-soups'
  | 'non-veg-soups'
  | 'vaibhav-special-starters'
  | 'nattu-specials'
  | 'chicken-starters'
  | 'mutton-starters'
  | 'fish-starters'
  | 'prawns-starters'
  | 'egg-starters'
  | 'veg-starters'
  | 'tandoori-fusion'
  | 'shawarmas'
  | 'biriyanis'
  | 'veg-biryani'
  | 'arabic-mandi'
  | 'non-veg-fried-rice'
  | 'veg-fried-rice'
  | 'non-veg-noodles'
  | 'veg-noodles'
  | 'veg-pulavs'
  | 'indian-breads'
  | 'veg-curries'
  | 'chicken-curries'
  | 'mutton-curry'
  | 'milkshakes'
  | 'beverages'
  | 'mocktails'
  | 'desserts'
  | 'ice-creams'
  | 'bucket-biryani'
  | 'mandi'
  | 'biryani'
  | 'starters'
  | 'curries'
  | 'rice-noodles'
  | 'breads'
  | (string & {});

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryType;
  price: number;
  aggregator_price?: number | null;
  description: string;
  isVeg: boolean;
  isChefSpecial?: boolean;
  portionNote?: string;
  image?: string;
  isBestseller?: boolean;
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
  whatsapp?: string;
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
  logoUrl?: string;
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

// -------------------------------------------------------------
// Supabase Database Models & Direct Ordering Types
// -------------------------------------------------------------
export interface DbMenuItem {
  id: number;
  item_id?: string;
  name: string;
  category: string;
  price: number;
  aggregator_price: number | null;
  is_veg: boolean;
  direct_order_eligible: boolean;
  is_completed: boolean;
  last_reset_date: string;
  // Local presentation enhancements
  description?: string;
  isChefSpecial?: boolean;
  portionNote?: string;
  image?: string;
  isBestseller?: boolean;
}

export interface StoreOffer {
  id: number;
  is_active: boolean;
  banner_text: string;
  discount_percent: number;
  min_order_amount: number;
  free_item_name: string;
  free_item_min_amount: number;
  coupon_code: string;
  coupon_flat_discount: number;
  starts_at: string;
  expires_at: string;
  admin_pin?: string;
  packing_fee?: number;
}

export type OrderType = 'DELIVERY_5KM' | 'SELF_PICKUP';
export type PaymentStatus = 'pending' | 'utr_submitted' | 'confirmed' | 'rejected';

export interface DbOrder {
  id?: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType | string;
  distance_km: number | null;
  address_notes: string | null;
  maps_link: string | null;
  items_json: string;
  subtotal: number;
  discount_amount: number;
  packing_fee?: number;
  final_total: number;
  payment_method: 'UPI' | 'COD' | string;
  status: string;
  utr?: string | null;
  utr_submitted_at?: string | null;
  idempotency_key?: string | null;
  payment_status?: PaymentStatus | string;
  created_at?: string;
}

export interface CartItem {
  id: number | string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  size?: string;
  portionNote?: string;
}

