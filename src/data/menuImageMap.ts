/**
 * Authentic Dish Image Map & Bestsellers Registry
 * Maps menu items strictly to existing verified images in /public/assets/
 * NO placeholder images, NO stock substitutions.
 */

// Normalized dish name (lowercase, stripped of punctuation, extra spaces, and size suffixes) to verified local image path
export const DISH_IMAGE_MAP: Record<string, string> = {
  // Starters & Tandoor
  'apollo fish': '/assets/images_processed/apollo-fish.webp',
  'baby corn 555': '/assets/images_processed/baby-corn-555.webp',
  'baby corn manchurian': '/assets/images_processed/baby-corn-manchurian.webp',
  'boiled egg': '/assets/images_processed/boiled-egg.webp',
  'chicken 65': '/assets/images_processed/chicken-65.webp',
  'chicken drumstick': '/assets/images_processed/chicken-drumstick.webp',
  'chicken lollipop': '/assets/images_processed/chicken-lollipop.webp',
  'chilli paneer': '/assets/images_processed/chilli-paneer.webp',
  'fish 65': '/assets/images_processed/fish-65.webp',
  'loaded chicken fries': '/assets/images_processed/loaded-chicken-fries.webp',
  'loaded french fries': '/assets/images_processed/loaded-french-fries.webp',
  'mushroom 65': '/assets/images_processed/mushroom-65.webp',
  'paneer 65': '/assets/images_processed/paneer-65.webp',
  'paneer manchurian': '/assets/images_processed/paneer-manchurian.webp',
  'paneer tikka': '/assets/images_processed/panneer-tikka.webp',
  'panneer tikka': '/assets/images_processed/panneer-tikka.webp',
  'paneer tikka fry': '/assets/images_processed/panner-tikka-fry.webp',
  'panner tikka fry': '/assets/images_processed/panner-tikka-fry.webp',
  'pepper chicken': '/assets/images_processed/pepper-chicken.webp',
  'pepper fish': '/assets/images_processed/pepper-fish.webp',
  'peri peri french fries': '/assets/images_processed/peri-peri-french-fries.webp',
  'peri peri fried chicken': '/assets/images_processed/peri-peri-fried-chicken.webp',
  'prawns 65': '/assets/images_processed/prawns-65.webp',
  'special omlette': '/assets/images_processed/special-omlette.webp',
  'tandoori chicken': '/assets/images_processed/tandoori-chicken.webp',

  // Mandi & Biryani
  'vaibhav special mandi': '/assets/vaibhav-grand-webp-images/food14.webp',
  'chicken mandi': '/assets/vaibhav-grand-webp-images/food14.webp',
  'tandoori chicken mandi': '/assets/vaibhav-grand-webp-images/food14.webp',
  'chicken dum biryani': '/assets/images_processed/chicken-dum-biriyani.webp',
  'chicken dum biriyani': '/assets/images_processed/chicken-dum-biriyani.webp',
  'family chicken dum biryani': '/assets/images_processed/chicken-dum-biriyani.webp',
  'fish biryani': '/assets/images_processed/fish-biryani.webp',
  'paneer biryani': '/assets/images_processed/paneer-biryani.webp',
  'prawns biryani': '/assets/images_processed/prawns-biryani.webp',

  // Curries & Gravies
  'butter chicken': '/assets/images_processed/butter-chicken.webp',
  'chicken curry with bone': '/assets/images_processed/chicken-curry-bone.webp',
  'chicken curry boneless': '/assets/images_processed/chicken-curry-boneless.webp',
  'chicken fry curries': '/assets/images_processed/chicken-fry-curries.webp',
  'chicken mughlai curry': '/assets/images_processed/chicken-mughlai-curry.webp',
  'chicken rayalaseema': '/assets/images_processed/chicken-rayalaseema.webp',
  'fish masala': '/assets/images_processed/fish-masala.webp',
  'kadai fish curry': '/assets/images_processed/kadai-fish-curry.webp',
  'kadai veg': '/assets/images_processed/kadai-veg.webp',
  'paneer kheema masala': '/assets/images_processed/panneer-kheema-masala.webp',
  'panneer kheema masala': '/assets/images_processed/panneer-kheema-masala.webp',
  'paneer tikka masala': '/assets/images_processed/panneer-tikka-masala.webp',
  'panneer tikka masala': '/assets/images_processed/panneer-tikka-masala.webp',
  'rayalaseema chicken curry': '/assets/images_processed/rayalaseema-chicken-curry.webp',
  'sahi paneer': '/assets/images_processed/sahi-paneer.webp',
  'shahi paneer': '/assets/images_processed/sahi-paneer.webp',

  // Rice & Noodles
  'chicken fried rice': '/assets/images_processed/chicken-fried-rice.webp',
  'chicken noodles': '/assets/images_processed/chicken-noodles.webp',
  'egg fried rice': '/assets/images_processed/egg-fried-rice.webp',
  'egg noodles': '/assets/images_processed/egg-noodles.webp',
  'jeera rice': '/assets/images_processed/jeera-rice.webp',
  'mushroom fried rice': '/assets/images_processed/mushroom-fried-rice.webp',
  'mushroom noodles': '/assets/images_processed/mushroom-noodles.webp',
  'prawns noodles': '/assets/images_processed/prawns-noodles.webp',
  'special chicken fried rice': '/assets/images_processed/special-chicken-fried-rice.webp',
  'special curd rice': '/assets/images_processed/special-curd-rice.webp',
  'veg fried rice': '/assets/images_processed/veg-fried-rice.webp',
  'veg noodles': '/assets/images_processed/veg-noodles.webp',

  // Indian Breads
  'butter kulcha': '/assets/images_processed/butter-kulcha.webp',
  'butter naan': '/assets/images_processed/butter-naan.webp',
  'butter roti': '/assets/images_processed/butter-roti.webp',
  'kulcha': '/assets/images_processed/kulcha.webp',
  'masala kulcha': '/assets/images_processed/masala-kulcha.webp',

  // Beverages & Shakes
  'chocolate milkshake': '/assets/images_processed/chocolate-milkshake.webp',
  'green mint mojito': '/assets/images_processed/green-mint-mojito.webp',
  'oreo milkshake': '/assets/images_processed/oreo-milkshake.webp',
  'strawberry milkshake': '/assets/images_processed/strawberry-milkshake.webp',
};

/**
 * Normalizes a dish name to find an image match
 */
export function getDishImage(dishName: string): string | undefined {
  if (!dishName) return undefined;
  
  // Clean name: remove size suffixes like (Half), (Full), (Single), Half, Full, etc.
  const cleaned = dishName
    .toLowerCase()
    .replace(/\s*\((half|full|single|\d+\s*pcs?\.?)\)/i, '')
    .replace(/\s+(half|full|single)$/i, '')
    .trim();

  return DISH_IMAGE_MAP[cleaned] || DISH_IMAGE_MAP[dishName.toLowerCase().trim()];
}

/**
 * The 8 user-requested bestseller dishes:
 * - Vaibhav Special Mandi (has photo)
 * - Chicken Dum Biryani (has photo)
 * - Tandoori Chicken (has photo)
 * - Paneer Tikka (has photo)
 * - Chicken 65 (has photo)
 * - Butter Chicken (has photo)
 * - Chittimuthyalu Chicken Biriyani (SKIPPED: no photo exists)
 * - Shawarma (SKIPPED: no photo exists)
 */
export const BESTSELLER_TARGET_NAMES = [
  'vaibhav special mandi',
  'chicken dum biryani',
  'tandoori chicken',
  'paneer tikka',
  'paneer tikka fry',
  'chicken 65',
  'butter chicken',
];
