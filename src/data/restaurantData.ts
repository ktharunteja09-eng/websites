import { MenuItem, SignatureDish, Testimonial, GalleryPhoto, RestaurantInfo, DigitalMenuPage, MenuCategoryType, PhotoMenuItem } from '../types';
export { PHOTO_MENU_ITEMS } from './photoMenuData';

export const RESTAURANT_INFO: RestaurantInfo = {
  name: "Vaibhav Grand Family Restaurant",
  tagline: "Authentic Flavor, Fresh Ingredients",
  address: "Plot 157, Near Ramana Vilas Circle, Srikalahasthi Road, Renigunta, Tirupati-517520, Andhra Pradesh",
  landmark: "Opposite HP Petrol Pump, Renigunta & Mangalam Road Junction",
  phone: "7947142432",
  email: "vaibhavgrand91@gmail.com",
  instagramHandle: "@vaibh_avgrand",
  instagramUrl: "https://www.instagram.com/vaibh_avgrand/",
  facebookUrl: "https://www.facebook.com/vaibhavgrandfamilyrestaurant/",
  hours: "Open daily, 12:00 PM - 11:00 PM (every day)",
  swiggyUrl: "https://www.swiggy.com/city/tirupati/vaibhav-grand-family-restaurant-opp-hp-petrol-pump-renigunta-and-mangalam-road-rest1031959",
  zomatoUrl: "http://zoma.to/r/20751251",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Vaibhav+Grand+Family+Restaurant+Renigunta",
  googleMapsReviewUrl: "https://www.google.com/maps/search/?api=1&query=Vaibhav+Grand+Family+Restaurant+Renigunta",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Vaibhav+Grand+Family+Restaurant,+Renigunta&t=&z=16&ie=UTF8&iwloc=&output=embed",
  overallRating: 4.3,
  totalReviews: 1001,
  justdialUrl: "https://jsdl.in/DT-99XHP795D46"
};

export const HERO_SLIDES = [
  {
    id: 'chicken-mandi',
    title: 'Vaibhav Special Chicken Mandi',
    subtitle: 'Communal Arabic Platter with Tender Char-grilled Chicken & Fragrant Saffron Basmati',
    category: 'Arabic Mandi Specialty',
    imageUrl: '/assets/images/chicken_mandi_hero_1789894879370.webp',
    altText: 'Vaibhav Special Chicken Mandi platter served at Vaibhav Grand Family Restaurant, Renigunta, Tirupati'
  },
  {
    id: 'chicken-tikka-kebab',
    title: 'Smoky Chicken Tikka Kebab Platter',
    subtitle: 'Charred Spiced Chicken Skewers with Lemon Wedges & Fresh Mint Chutney',
    category: 'Clay Oven Grill',
    imageUrl: '/assets/images/chicken_tikka_hero_1789894901572.webp',
    altText: 'Skewers of sizzling golden-charred spiced chicken tikka kebabs with fresh lemon wedges'
  },
  {
    id: 'sizzling-tandoori',
    title: 'Sizzling Tandoori Chicken Platter',
    subtitle: 'Char-Roasted in Traditional Clay Ovens with Kashmiri Spices & Sliced Red Onions',
    category: 'Tandoor Specialty',
    imageUrl: '/assets/images/sizzling_tandoori_hero_1789894957461.webp',
    altText: 'Tandoori Chicken served at Vaibhav Grand Family Restaurant, Renigunta, Tirupati'
  },
  {
    id: 'refreshing-drinks',
    title: 'Assorted Vibrant Mocktails & Coolers',
    subtitle: 'Trio of Colorful Signature Coolers: Blue Lagoon, Red Melon & Green Mint Mojito',
    category: 'Beverages & Coolers',
    imageUrl: '/assets/images/vibrant_mocktails_hero_1789894941398.webp',
    altText: 'Colorful artisan mocktails with crushed ice and fresh herb garnishes'
  },
  {
    id: 'elegant-dessert',
    title: 'Gourmet Sizzling Brownie & Ice Cream',
    subtitle: 'Warm Chocolate Fudge Brownie with Rich Vanilla Ice Cream & Swirled Dark Chocolate',
    category: 'Desserts & Sweets',
    imageUrl: '/assets/images/brownie_dessert_hero_1789894922593.webp',
    altText: 'Warm chocolate fudge brownie topped with vanilla ice cream and chocolate swirl sauce'
  }
];

export const WHY_CHOOSE_US_ITEMS = [
  {
    id: 'diverse-menu',
    title: 'Diverse Menu',
    description: 'From Mughlai and Chinese to Arabic specialties and Mandi platters! 🥘',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'signature-specialties',
    title: 'Signature Specialties',
    description: 'You have to try the Chicken Reshmi Kebab Biryani or the Mughlai Chicken Biryani. 🍗',
    icon: 'Flame',
  },
  {
    id: 'family-vibes',
    title: 'Family Vibes',
    description: 'It’s a clean, cool, and casual spot perfect for big family gatherings or birthday celebrations. 🎉',
    icon: 'Users',
  },
  {
    id: 'great-value',
    title: 'Great Value',
    description: 'You get generous portions and delicious food at very pocket-friendly prices! 💰',
    icon: 'BadgePercent',
  }
];

export const SIGNATURE_DISHES: SignatureDish[] = [
  {
    id: 'vaibhav-special-mandi',
    name: 'Vaibhav Special Mandi',
    tagline: 'A grand feast for the true Mandi lovers.',
    price: 1370,
    description: 'Our crown jewel Arabian feast. Fragrant long-grain basmati rice seasoned with Yemeni spices, piled high with tender char-grilled chicken portions, roasted cashews, fried onions, served with mint dip and rich tomato salan.',
    image: '/assets/vaibhav-grand-webp-images/food14.webp',
    isVeg: false,
    badge: 'Grand Feast',
    serving: 'Serves 4–6 (Grand Platter)',
    spiceLevel: 'Mild Arabic Spice'
  },
  {
    id: 'chicken-dum-biryani',
    name: 'Chicken Dum Biryani',
    tagline: 'Authentic Hyderabadi firewood dum biryani.',
    price: 345,
    description: 'Piping-hot Hyderabadi dum biryani cooked firewood-style with aged basmati, succulent whole chicken cuts, boiled eggs, crispy golden onions, and fragrant saffron essence. Accompanied by cooling raita and spicy salan.',
    image: '/assets/vaibhav-grand-webp-images/food12.webp',
    isVeg: false,
    badge: 'Chef Special',
    serving: 'Serves 1–2 (Rich Portion)',
    spiceLevel: 'Medium Dum Spice'
  },
  {
    id: 'tandoori-chicken',
    name: 'Tandoori Chicken',
    tagline: 'A classic favorite from our Tandoor Fusion.',
    price: 410,
    description: 'Tender chicken marinated overnight in roasted Kashmiri red chillies, hung curd, crushed ginger-garlic, and secret spices, roasted in our traditional clay oven to smoky, charred perfection.',
    image: '/assets/vaibhav-grand-webp-images/food.webp',
    isVeg: false,
    badge: 'Tandoor Fusion',
    serving: 'Full Platter',
    spiceLevel: 'Smoky & Medium Spice'
  },
  {
    id: 'paneer-tikka-fry',
    name: 'Paneer Tikka Fry',
    tagline: 'A crispy and delicious vegetarian staple.',
    price: 300,
    description: 'Fresh cottage cheese cubes marinated in seasoned yogurt and hand-ground spices, roasted and flash-fried to golden, crisp perfection with tossed bell peppers and onions.',
    image: '/assets/images_processed/panner-tikka-fry.webp',
    isVeg: true,
    badge: 'Vegetarian Staple',
    serving: 'Serves 2–3',
    spiceLevel: 'Crispy & Medium Spice'
  }
];

export const MENU_CATEGORIES: { id: MenuCategoryType; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'mandi', label: 'Arabic Mandi' },
  { id: 'biryani', label: 'Biryani Specialties' },
  { id: 'starters', label: 'Starters & Tandoor' },
  { id: 'curries', label: 'Curries & Gravies' },
  { id: 'rice-noodles', label: 'Fried Rice & Noodles' },
  { id: 'breads', label: 'Tandoori Breads' },
  { id: 'beverages', label: 'Mojitos & Shakes' }
];

export const MENU_ITEMS: MenuItem[] = [
  // 1. ARABIC MANDI PLATTERS
  {
    id: 'm1',
    name: 'Vaibhav Special Mandi',
    category: 'mandi',
    price: 1370,
    description: 'Grand royal Arabian feast with generous char-grilled chicken cuts, fragrant saffron rice, dry fruits & signature dips.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Serves 4–6 (Grand Platter)'
  },
  {
    id: 'm2',
    name: 'Alfham Juicy Mandi',
    category: 'mandi',
    price: 850,
    description: 'Juicy Arabian Alfham chicken steeped in secret herb marinade, char-grilled and served over long-grain Mandi rice.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Serves 3–4'
  },
  {
    id: 'm3',
    name: 'Tandoori Chicken Mandi',
    category: 'mandi',
    price: 690,
    description: 'Smoky clay-oven tandoori chicken cuts nestled over fragrant spiced basmati rice with cucumber, onions and dips.',
    isVeg: false,
    portionNote: 'Serves 2–3'
  },
  {
    id: 'm4',
    name: 'Chicken Mandi',
    category: 'mandi',
    price: 650,
    description: 'Classic Yemeni style Mandi rice topped with slow-roasted tender chicken, raisins, fried cashews and tomato salan.',
    isVeg: false,
    portionNote: 'Serves 2–3'
  },
  {
    id: 'm5',
    name: 'Alfham Chicken Mandi',
    category: 'mandi',
    price: 650,
    description: 'Traditional slow-cooked Mandi rice served with succulent barbecued Alfham chicken cuts.',
    isVeg: false,
    portionNote: 'Serves 2–3'
  },

  // 2. BIRYANI SPECIALTIES & BUCKETS
  {
    id: 'b-bucket-fry',
    name: 'Chicken Fry Biryani Bucket',
    category: 'biryani',
    price: 1400,
    description: 'Party jumbo bucket loaded with crispy spicy fried chicken chunks, aromatic dum basmati rice, eggs & raita.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Bucket Pack (Serves 5–6)'
  },
  {
    id: 'b-bucket-dum',
    name: 'Chicken Dum Biryani Bucket',
    category: 'biryani',
    price: 1290,
    description: 'Generous family feast bucket filled with authentic Hyderabadi chicken dum biryani, whole spiced cuts & boiled eggs.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Bucket Pack (Serves 4–5)'
  },
  {
    id: 'b-fam-dum',
    name: 'Family Chicken Dum Biryani',
    category: 'biryani',
    price: 680,
    description: 'Hearty family platter of traditional dum biryani slow-cooked on firewood embers with tender chicken.',
    isVeg: false,
    portionNote: 'Serves 3–4'
  },
  {
    id: 'b-prawns',
    name: 'Prawns Biryani',
    category: 'biryani',
    price: 450,
    description: 'Fresh coastal prawns marinated in hand-ground garam masala, layered with saffron infused aged basmati.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Seafood Special'
  },
  {
    id: 'b-vaibhav-special',
    name: 'Vaibhav Special Chicken Biryani',
    category: 'biryani',
    price: 400,
    description: 'Our master chef recipe featuring dual chicken preparations over fragrant basmati with golden fried cashews.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Chef Signature'
  },
  {
    id: 'b-fish',
    name: 'Fish Biryani',
    category: 'biryani',
    price: 370,
    description: 'Delicate boneless fish fillets spiced with coastal herbs and steam-cooked in dum rice.',
    isVeg: false,
    portionNote: 'Coastal Specialty'
  },
  {
    id: 'b-tandoori',
    name: 'Tandoori Chicken Biryani',
    category: 'biryani',
    price: 370,
    description: 'Smoky clay-oven charred tandoori chicken served over aromatic Hyderabadi dum rice.',
    isVeg: false,
    portionNote: 'Smoky Delight'
  },
  {
    id: 'b-chicken-fry',
    name: 'Chicken Fry Biryani',
    category: 'biryani',
    price: 370,
    description: 'Crispy seasoned Andhra-style spiced chicken fry topped on a bed of piping hot biryani rice.',
    isVeg: false,
    portionNote: 'Spicy & Flavorful'
  },
  {
    id: 'b-mughlai',
    name: 'Mughlai Chicken Biryani',
    category: 'biryani',
    price: 370,
    description: 'Rich royal recipe cooked with fried cashews, saffron essence, and tender chicken simmered on slow embers.',
    isVeg: false,
    portionNote: 'Royal Mughlai'
  },
  {
    id: 'b-lollipop',
    name: 'Lollipop Biryani',
    category: 'biryani',
    price: 370,
    description: 'Crispy spiced chicken lollipops served on aromatic flavored biryani rice with raita.',
    isVeg: false,
    portionNote: 'Crowd Favorite'
  },
  {
    id: 'b-alfham',
    name: 'Alfham Chicken Biriyani',
    category: 'biryani',
    price: 370,
    description: 'Grilled Arabic style Alfham chicken paired with slow-dum spiced rice.',
    isVeg: false,
    portionNote: 'Arabian Fusion'
  },
  {
    id: 'b-hyd-dum',
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'biryani',
    price: 345,
    description: 'Traditional slow-cooked Hyderabadi biryani with succulent chicken, caramelized onions, and mint.',
    isVeg: false,
    portionNote: 'Authentic Heritage'
  },
  {
    id: 'b-egg',
    name: 'Egg Biriyani',
    category: 'biryani',
    price: 230,
    description: 'Golden boiled eggs pan-tossed in spices and layered with fragrant basmati dum rice.',
    isVeg: false,
    portionNote: 'Classic Favorite'
  },
  {
    id: 'b-veg-mixed',
    name: 'Veg Mixed Biryani',
    category: 'biryani',
    price: 350,
    description: 'Assorted garden vegetables, paneer cubes, and mushrooms simmered with aged basmati.',
    isVeg: true,
    portionNote: 'Rich Vegetarian'
  },
  {
    id: 'b-kaju-paneer',
    name: 'Kaju Paneer Biryani',
    category: 'biryani',
    price: 330,
    description: 'Roasted crunchy cashews and soft paneer cubes layered with saffron spiced rice.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Rich Cashew & Paneer'
  },
  {
    id: 'b-mushroom',
    name: 'Mushroom Biryani',
    category: 'biryani',
    price: 320,
    description: 'Tender button mushrooms tossed in aromatic biryani masala and sealed on dum.',
    isVeg: true,
    portionNote: 'Fresh Mushrooms'
  },
  {
    id: 'b-kaju',
    name: 'Kaju Biryani',
    category: 'biryani',
    price: 300,
    description: 'Abundance of whole roasted cashew nuts cooked in golden dum basmati rice.',
    isVeg: true,
    portionNote: 'Nutty & Fragrant'
  },
  {
    id: 'b-paneer',
    name: 'Paneer Biryani',
    category: 'biryani',
    price: 300,
    description: 'Fresh cottage cheese cubes marinated in mint yogurt masala and layered with basmati.',
    isVeg: true,
    portionNote: 'Vegetarian Delight'
  },
  {
    id: 'b-veg',
    name: 'Veg Biryani',
    category: 'biryani',
    price: 260,
    description: 'Fresh farm vegetables cooked with whole spices and basmati rice, served with raita and salan.',
    isVeg: true,
    portionNote: 'Wholesome Veg'
  },

  // 3. STARTERS & TANDOOR (CHICKEN, SEAFOOD, EGG & VEG)
  {
    id: 's-tandoori',
    name: 'Tandoori Chicken',
    category: 'starters',
    price: 410,
    description: 'Classic clay oven roasted whole chicken with Kashmiri chillies, curd, and hand-ground spices.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Tandoor Specialty'
  },
  {
    id: 's-alfham',
    name: 'Alfham Chicken',
    category: 'starters',
    price: 410,
    description: 'Arabic barbecue chicken marinated in olive oil, crushed garlic, and Yemeni herbs.',
    isVeg: false,
    portionNote: 'Char-Grilled'
  },
  {
    id: 's-kaju-chicken',
    name: 'Kaju Chicken',
    category: 'starters',
    price: 400,
    description: 'Boneless tender chicken tossed in a rich roasted cashew nut and green chilli reduction.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Chef Special'
  },
  {
    id: 's-vaibhav-chicken',
    name: 'Vaibhav Special Chicken',
    category: 'starters',
    price: 400,
    description: 'Signature spiced crispy chicken tossed with curry leaves, cashews and special masala.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'House Specialty'
  },
  {
    id: 's-apollo-fish',
    name: 'Apollo Fish',
    category: 'starters',
    price: 400,
    description: 'Boneless fish fillets tossed with coastal curry leaves, mustard seeds, and curd masala.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Andhra Seafood Classic'
  },
  {
    id: 's-prawns-65',
    name: 'Prawns 65',
    category: 'starters',
    price: 390,
    description: 'Crispy fried juicy prawns tossed with red chillies, garlic crisps, and curry leaves.',
    isVeg: false,
    portionNote: 'Crispy Prawns'
  },
  {
    id: 's-pepper-chicken',
    name: 'Pepper Chicken',
    category: 'starters',
    price: 370,
    description: 'Succulent chicken pieces wok-tossed with freshly ground black peppercorns and onions.',
    isVeg: false,
    portionNote: 'Spicy Black Pepper'
  },
  {
    id: 's-dragon-chicken',
    name: 'Dragon Chicken',
    category: 'starters',
    price: 370,
    description: 'Stir-fried chicken strips coated in spicy red sauce with crunchy bell peppers and cashews.',
    isVeg: false,
    portionNote: 'Indo-Chinese Zing'
  },
  {
    id: 's-chicken-majestic',
    name: 'Chicken Majestic',
    category: 'starters',
    price: 370,
    description: 'Thin chicken strips tossed in spiced buttermilk, mint, and green chilli temper.',
    isVeg: false,
    portionNote: 'Hyderabadi Street Special'
  },
  {
    id: 's-pepper-fish',
    name: 'Pepper Fish',
    category: 'starters',
    price: 360,
    description: 'Fish fillets pan-tossed with coarse black pepper and crushed garlic.',
    isVeg: false,
    portionNote: 'Peppery Seafood'
  },
  {
    id: 's-fish-65',
    name: 'Fish 65',
    category: 'starters',
    price: 360,
    description: 'Golden batter-fried fish cubes seasoned in classic 65 red spice marinade.',
    isVeg: false,
    portionNote: 'Crispy Bites'
  },
  {
    id: 's-chilli-fish',
    name: 'Chilli Fish',
    category: 'starters',
    price: 360,
    description: 'Wok-tossed fish pieces in soya sauce, capsicum, and fresh green chillies.',
    isVeg: false,
    portionNote: 'Indo-Chinese'
  },
  {
    id: 's-chilli-prawns',
    name: 'Chilli Prawns',
    category: 'starters',
    price: 360,
    description: 'Plump prawns stir-fried with onions, capsicum, garlic, and hot chilli sauce.',
    isVeg: false,
    portionNote: 'Hot & Tangy'
  },
  {
    id: 's-prawns-fry',
    name: 'Prawns Fry',
    category: 'starters',
    price: 360,
    description: 'Traditional coastal Andhra style pan-roasted spiced prawns with curry leaves.',
    isVeg: false,
    portionNote: 'Andhra Roast'
  },
  {
    id: 's-pepper-prawns',
    name: 'Pepper Prawns',
    category: 'starters',
    price: 360,
    description: 'Tender prawns sauteed with aromatic cracked black pepper and green chillies.',
    isVeg: false,
    portionNote: 'Peppery Delight'
  },
  {
    id: 's-loose-prawns',
    name: 'Loose Prawns',
    category: 'starters',
    price: 360,
    description: 'Crispy batter-coated individual prawns fried golden and sprinkled with chaat spices.',
    isVeg: false,
    portionNote: 'Crispy Starter'
  },
  {
    id: 's-chicken-lollipop',
    name: 'Chicken Lollipop',
    category: 'starters',
    price: 350,
    description: 'Frenched chicken wings marinated, fried crisp, and served with spicy schezwan dip.',
    isVeg: false,
    portionNote: 'All-Time Favorite'
  },
  {
    id: 's-chicken-drumstick',
    name: 'Chicken Drumstick',
    category: 'starters',
    price: 350,
    description: 'Juicy chicken drumsticks seasoned in aromatic herbs and fried till golden brown.',
    isVeg: false,
    portionNote: 'Juicy Legs'
  },
  {
    id: 's-chicken-65',
    name: 'Chicken 65',
    category: 'starters',
    price: 340,
    description: 'Classic spicy, deep-fried chicken cubes tossed with curry leaves, ginger, and garlic.',
    isVeg: false,
    portionNote: 'South Indian Classic'
  },
  {
    id: 's-chilli-chicken',
    name: 'Chilli Chicken',
    category: 'starters',
    price: 340,
    description: 'Tender chicken cubes stir-fried with dark soya sauce, green chillies, and bell peppers.',
    isVeg: false,
    portionNote: 'Indo-Chinese'
  },
  {
    id: 's-chicken-fry',
    name: 'Chicken Fry',
    category: 'starters',
    price: 320,
    description: 'Traditional home-style spiced dry chicken fry sauteed with onions and coriander.',
    isVeg: false,
    portionNote: 'Crisp & Spiced'
  },
  {
    id: 's-tangdi-kabab',
    name: 'Tangdi Kabab',
    category: 'starters',
    price: 280,
    description: 'Chicken leg pieces marinated in rich spiced yogurt and roasted in the clay tandoor.',
    isVeg: false,
    portionNote: 'Tandoori Legs'
  },
  {
    id: 's-loaded-chicken-fries',
    name: 'Loaded Chicken Fries',
    category: 'starters',
    price: 300,
    description: 'Crisp golden potato fries smothered in shredded chicken, creamy mayo, and seasoning.',
    isVeg: false,
    portionNote: 'Loaded Snack'
  },
  {
    id: 's-peri-fried-chicken',
    name: 'Peri Peri Fried Chicken',
    category: 'starters',
    price: 300,
    description: 'Crunchy battered chicken pieces tossed with spicy peri peri seasoning dust.',
    isVeg: false,
    portionNote: 'Zesty & Crunchy'
  },
  {
    id: 's-loaded-fries',
    name: 'Loaded French Fries',
    category: 'starters',
    price: 280,
    description: 'Crispy salted fries generously topped with melted cheese sauce and herbs.',
    isVeg: true,
    portionNote: 'Cheesy & Golden'
  },
  {
    id: 's-peri-fries',
    name: 'Peri Peri French Fries',
    category: 'starters',
    price: 250,
    description: 'Hot potato fries dusted with tangy, fiery African bird’s eye peri-peri spice.',
    isVeg: true,
    portionNote: 'Spicy Fries'
  },

  // Egg Starters
  {
    id: 's-egg-manchurian',
    name: 'Egg Manchurian',
    category: 'starters',
    price: 250,
    description: 'Crispy egg bites tossed in tangy ginger-garlic manchurian gravy and spring onions.',
    isVeg: false,
    portionNote: 'Egg Starter'
  },
  {
    id: 's-egg-chilli',
    name: 'Egg Chilli',
    category: 'starters',
    price: 250,
    description: 'Boiled egg slices batter-fried and tossed with soy sauce and green chillies.',
    isVeg: false,
    portionNote: 'Wok-Tossed Egg'
  },
  {
    id: 's-egg-burji',
    name: 'Egg Burji',
    category: 'starters',
    price: 200,
    description: 'Scrambled eggs cooked with finely chopped onions, tomatoes, and green chillies.',
    isVeg: false,
    portionNote: 'Desi Scramble'
  },
  {
    id: 's-special-omlette',
    name: 'Special Omlette',
    category: 'starters',
    price: 150,
    description: 'Fluffy double-egg omelette prepared with onions, fresh coriander, and spices.',
    isVeg: false,
    portionNote: 'Quick Bite'
  },
  {
    id: 's-boiled-egg',
    name: 'Boiled Egg [1 Egg]',
    category: 'starters',
    price: 30,
    description: 'Farm-fresh hard boiled egg served with salt and pepper.',
    isVeg: false,
    portionNote: 'Single Serving'
  },

  // Veg Starters
  {
    id: 's-paneer-tikka',
    name: 'Panneer Tikka',
    category: 'starters',
    price: 400,
    description: 'Juicy cottage cheese cubes, capsicum and onions skewered and roasted in the clay tandoor.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Tandoori Skewers'
  },
  {
    id: 's-baby-corn-555',
    name: 'Baby Corn 555',
    category: 'starters',
    price: 340,
    description: 'Crispy baby corn fingers tossed in special spicy 555 sauce with garlic and herbs.',
    isVeg: true,
    portionNote: 'Spicy Specialty'
  },
  {
    id: 's-mushroom-pepper',
    name: 'Mushroom Pepper',
    category: 'starters',
    price: 330,
    description: 'Button mushrooms sauteed with coarse black pepper, onions, and curry leaves.',
    isVeg: true,
    portionNote: 'Pepper Saute'
  },
  {
    id: 's-paneer-manchurian',
    name: 'Paneer Manchurian',
    category: 'starters',
    price: 330,
    description: 'Crisp paneer cubes tossed in garlic, ginger, soya sauce, and spring onion greens.',
    isVeg: true,
    portionNote: 'Indo-Chinese'
  },
  {
    id: 's-crispy-baby-corn',
    name: 'Crispy Baby Corn',
    category: 'starters',
    price: 300,
    description: 'Golden fried crunchy baby corn seasoned with salt, pepper, and mild herbs.',
    isVeg: true,
    portionNote: 'Crunchy Veg'
  },
  {
    id: 's-mushroom-65',
    name: 'Mushroom 65',
    category: 'starters',
    price: 300,
    description: 'Marinated button mushrooms fried crisp and tossed in south Indian 65 masala.',
    isVeg: true,
    portionNote: 'Crisp Mushroom'
  },
  {
    id: 's-paneer-65',
    name: 'Paneer 65',
    category: 'starters',
    price: 300,
    description: 'Fresh paneer cubes tossed with red spices, curry leaves, and green chillies.',
    isVeg: true,
    portionNote: 'Spicy Paneer'
  },
  {
    id: 's-chilli-paneer',
    name: 'Chilli Paneer',
    category: 'starters',
    price: 300,
    description: 'Paneer cubes tossed with diced onions, capsicum, soya, and chilli sauce.',
    isVeg: true,
    portionNote: 'Tangy & Spicy'
  },
  {
    id: 's-baby-corn-manchurian',
    name: 'Baby Corn Manchurian',
    category: 'starters',
    price: 290,
    description: 'Baby corn fritters simmered in Indo-Chinese manchurian sauce.',
    isVeg: true,
    portionNote: 'Chinese Veg'
  },

  // 4. MAIN COURSE CURRIES & GRAVIES
  {
    id: 'c-kadai-prawns',
    name: 'Kadai Prawns',
    category: 'curries',
    price: 390,
    description: 'Juicy prawns simmered in an iron wok with bell peppers, crushed coriander, and rich onion-tomato gravy.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Wok Gravy'
  },
  {
    id: 'c-kaju-chicken-curry',
    name: 'Kaju Chicken Curry',
    category: 'curries',
    price: 390,
    description: 'Tender chicken cooked in an opulent cashew nut gravy with whole roasted cashews.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Royal Cashew Gravy'
  },
  {
    id: 'c-kadai-fish-curry',
    name: 'Kadai Fish Curry',
    category: 'curries',
    price: 370,
    description: 'Fish fillets simmered with capsicum, whole spices, and rich tomato reduction.',
    isVeg: false,
    portionNote: 'Kadai Seafood'
  },
  {
    id: 'c-prawns-masala',
    name: 'Prawns Masala',
    category: 'curries',
    price: 370,
    description: 'Fresh prawns cooked in a traditional coastal onion, tomato, and garam masala gravy.',
    isVeg: false,
    portionNote: 'Spiced Prawns'
  },
  {
    id: 'c-chicken-mughlai-curry',
    name: 'Chicken Mughlai Curry',
    category: 'curries',
    price: 350,
    description: 'Royal aromatic Mughlai gravy infused with cashew paste, egg ribbons, and tender chicken.',
    isVeg: false,
    portionNote: 'Mughlai Style'
  },
  {
    id: 'c-chicken-curry-boneless',
    name: 'Chicken Curry (boneless)',
    category: 'curries',
    price: 350,
    description: 'Succulent boneless chicken chunks slow-simmered in rich Andhra spice gravy.',
    isVeg: false,
    portionNote: 'Boneless Special'
  },
  {
    id: 'c-rayalaseema-chicken-curry',
    name: 'Rayalaseema Chicken Curry',
    category: 'curries',
    price: 350,
    description: 'Authentic local Rayalaseema spicy curry cooked with fiery red chillies and coriander.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Fiery Regional Style'
  },
  {
    id: 'c-fish-masala',
    name: 'Fish Masala',
    category: 'curries',
    price: 340,
    description: 'Tender fish pieces cooked in a fragrant mustard, tomato, and tamarind curry.',
    isVeg: false,
    portionNote: 'Fish Gravy'
  },
  {
    id: 'c-chicken-fry-curries',
    name: 'Chicken Fry Curries',
    category: 'curries',
    price: 330,
    description: 'Semi-dry chicken curry sauteed with roasted spices, onions, and curry leaves.',
    isVeg: false,
    portionNote: 'Semi-Dry Fry'
  },
  {
    id: 'c-chicken-rayalaseema',
    name: 'Chicken Rayalaseema',
    category: 'curries',
    price: 320,
    description: 'Signature regional chicken preparation packed with roasted dry spices and green chillies.',
    isVeg: false,
    portionNote: 'Spicy Andhra'
  },
  {
    id: 'c-chicken-murgh-masala',
    name: 'Chicken Murgh Masala',
    category: 'curries',
    price: 310,
    description: 'Traditional slow-cooked spiced chicken gravy enriched with fresh ginger and coriander.',
    isVeg: false,
    portionNote: 'Classic Murgh'
  },
  {
    id: 'c-special-chicken-curry',
    name: 'Special Chicken Curry',
    category: 'curries',
    price: 310,
    description: 'Chef signature chicken gravy cooked with a house blend of freshly roasted aromatics.',
    isVeg: false,
    portionNote: 'House Recipe'
  },
  {
    id: 'c-butter-chicken',
    name: 'Butter Chicken',
    category: 'curries',
    price: 300,
    description: 'Tandoori chicken pieces simmered in an indulgent tomato, butter, and cream makhani gravy.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Mild & Creamy'
  },
  {
    id: 'c-andhra-chicken-spicy',
    name: 'Andhra Chicken Curry (spicy)',
    category: 'curries',
    price: 290,
    description: 'Traditional fiery Andhra style chicken curry with roasted Guntur chillies and garlic.',
    isVeg: false,
    portionNote: 'High Spice'
  },
  {
    id: 'c-chicken-curry-bone',
    name: 'Chicken Curry (bone)',
    category: 'curries',
    price: 290,
    description: 'Home-style chicken curry with bone simmered in a spiced onion-tomato gravy.',
    isVeg: false,
    portionNote: 'Home Comfort'
  },
  {
    id: 'c-chicken-masala',
    name: 'Chicken Masala',
    category: 'curries',
    price: 270,
    description: 'Classic medium-spiced chicken curry ideal with butter naan or hot basmati rice.',
    isVeg: false,
    portionNote: 'Popular Choice'
  },

  // Vegetarian Curries
  {
    id: 'c-paneer-tikka-masala',
    name: 'Panneer Tikka Masala',
    category: 'curries',
    price: 300,
    description: 'Char-grilled cottage cheese cubes in rich tomato, cashew cream makhani sauce with fenugreek.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Vegetarian Staple'
  },
  {
    id: 'c-kaju-paneer-masala',
    name: 'Kaju Panneer Masala',
    category: 'curries',
    price: 300,
    description: 'Soft paneer cubes and whole roasted cashews in an aromatic creamy gravy.',
    isVeg: true,
    portionNote: 'Rich Gravy'
  },
  {
    id: 'c-kaju-masala',
    name: 'Kaju Masala Curry',
    category: 'curries',
    price: 290,
    description: 'Roasted cashew nuts simmered in an indulgent, mildly spiced onion-cashew reduction.',
    isVeg: true,
    portionNote: 'Cashew Delight'
  },
  {
    id: 'c-sahi-paneer',
    name: 'Sahi Paneer',
    category: 'curries',
    price: 290,
    description: 'Royal cottage cheese curry cooked in a fragrant saffron, cardamom, and almond gravy.',
    isVeg: true,
    portionNote: 'Royal Mild'
  },
  {
    id: 'c-kadai-baby-corn',
    name: 'Kadai Baby Corn Masala',
    category: 'curries',
    price: 270,
    description: 'Crisp baby corn wok-cooked with capsicum, coarse coriander seeds, and tomato masala.',
    isVeg: true,
    portionNote: 'Kadai Veg'
  },
  {
    id: 'c-kadai-veg',
    name: 'Kadai Veg.',
    category: 'curries',
    price: 270,
    description: 'Medley of fresh garden vegetables tossed in an iron kadai with freshly ground spices.',
    isVeg: true,
    portionNote: 'Fresh Vegetables'
  },
  {
    id: 'c-paneer-kheema',
    name: 'Panneer Kheema Masala',
    category: 'curries',
    price: 270,
    description: 'Minced fresh paneer cooked with green peas, onions, and aromatic garam masala.',
    isVeg: true,
    portionNote: 'Minced Paneer'
  },
  {
    id: 'c-mushroom-masala',
    name: 'Mushroom Masala',
    category: 'curries',
    price: 260,
    description: 'Fresh sliced button mushrooms cooked in a spiced onion, tomato, and coriander gravy.',
    isVeg: true,
    portionNote: 'Savory Mushroom'
  },

  // 5. FRIED RICE & NOODLES
  {
    id: 'r-sp-chicken-fried-rice',
    name: 'Special Chicken Fried Rice',
    category: 'rice-noodles',
    price: 400,
    description: 'Wok-tossed basmati grains with shredded chicken, eggs, crispy cashews, and aromatics.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Chef Special Wok'
  },
  {
    id: 'r-schez-mix-veg-rice',
    name: 'Schezwan Mixed Veg Fried Rice',
    category: 'rice-noodles',
    price: 390,
    description: 'Fiery wok-tossed rice with assorted garden vegetables, paneer, and homemade schezwan sauce.',
    isVeg: true,
    portionNote: 'Spicy Veg'
  },
  {
    id: 'r-prawns-fried-rice',
    name: 'Prawns Fried Rice',
    category: 'rice-noodles',
    price: 360,
    description: 'Wok-fried rice with tender coastal prawns, spring onions, and gentle soya seasoning.',
    isVeg: false,
    portionNote: 'Seafood Rice'
  },
  {
    id: 'r-schez-chicken-rice',
    name: 'Schezwan Chicken Fried Rice',
    category: 'rice-noodles',
    price: 345,
    description: 'Fiery wok rice tossed with shredded chicken, egg scramble, and in-house red schezwan sauce.',
    isVeg: false,
    portionNote: 'Spicy Wok'
  },
  {
    id: 'r-chicken-fried-rice',
    name: 'Chicken Fried Rice',
    category: 'rice-noodles',
    price: 345,
    description: 'Classic wok-tossed rice with shredded chicken, egg ribbons, and julienned vegetables.',
    isVeg: false,
    portionNote: 'Crowd Favorite'
  },
  {
    id: 'r-mix-veg-fried-rice',
    name: 'Mixed Veg Fried Rice',
    category: 'rice-noodles',
    price: 300,
    description: 'Basmati rice wok-fried with carrots, beans, peas, and fragrant Chinese spices.',
    isVeg: true,
    portionNote: 'Loaded Veg'
  },
  {
    id: 'r-kaju-fried-rice',
    name: 'Kaju Fried Rice',
    category: 'rice-noodles',
    price: 279,
    description: 'Wok-tossed rice sprinkled with generous whole roasted golden cashews.',
    isVeg: true,
    portionNote: 'Golden Cashew'
  },
  {
    id: 'r-paneer-fried-rice',
    name: 'Paneer Fried Rice',
    category: 'rice-noodles',
    price: 270,
    description: 'Fragrant rice stir-fried with golden soft paneer cubes and spring onions.',
    isVeg: true,
    portionNote: 'Paneer Rice'
  },
  {
    id: 'r-babycorn-rice',
    name: 'Baby Corn Fried Rice',
    category: 'rice-noodles',
    price: 259,
    description: 'Wok-tossed rice with tender baby corn slices and crisp vegetables.',
    isVeg: true,
    portionNote: 'Crunchy Corn'
  },
  {
    id: 'r-mushroom-rice',
    name: 'Mushroom Fried Rice',
    category: 'rice-noodles',
    price: 259,
    description: 'Stir-fried rice with seasoned button mushrooms and aromatic spring greens.',
    isVeg: true,
    portionNote: 'Earthy Mushroom'
  },
  {
    id: 'r-schez-veg-rice',
    name: 'Schezwan Veg Fried Rice',
    category: 'rice-noodles',
    price: 249,
    description: 'Spicy wok rice with julienned vegetables tossed in pungent schezwan chilli sauce.',
    isVeg: true,
    portionNote: 'Hot & Zesty'
  },
  {
    id: 'r-schez-egg-rice',
    name: 'Schezwan Egg Fried Rice',
    category: 'rice-noodles',
    price: 240,
    description: 'Egg ribbons and rice tossed vigorously in spicy schezwan wok reduction.',
    isVeg: false,
    portionNote: 'Spicy Egg'
  },
  {
    id: 'r-veg-fried-rice',
    name: 'Veg Fried Rice',
    category: 'rice-noodles',
    price: 229,
    description: 'Classic mild Indo-Chinese fried rice with crunchy vegetables and white pepper.',
    isVeg: true,
    portionNote: 'Classic Mild'
  },
  {
    id: 'r-egg-fried-rice',
    name: 'Egg Fried Rice',
    category: 'rice-noodles',
    price: 220,
    description: 'Wok-tossed basmati rice with fluffy scrambled eggs and green onions.',
    isVeg: false,
    portionNote: 'Simple Comfort'
  },
  {
    id: 'r-jeera-rice',
    name: 'Jeera Rice',
    category: 'rice-noodles',
    price: 210,
    description: 'Fragrant long-grain basmati tempered with crackling roasted cumin and pure ghee.',
    isVeg: true,
    portionNote: 'Ghee Tempered'
  },
  {
    id: 'r-gobi-fried-rice',
    name: 'Gobi Fried Rice',
    category: 'rice-noodles',
    price: 200,
    description: 'Stir-fried rice with crispy spiced cauliflower florets and soy seasoning.',
    isVeg: true,
    portionNote: 'Crisp Gobi'
  },
  {
    id: 'r-curd-rice',
    name: 'Special Curd Rice',
    category: 'rice-noodles',
    price: 150,
    description: 'Soothing creamy churned curd rice tempered with mustard seeds, curry leaves, and ginger.',
    isVeg: true,
    portionNote: 'Cooling Finish'
  },

  // Noodles
  {
    id: 'n-prawns-noodles',
    name: 'Prawns Noodles',
    category: 'rice-noodles',
    price: 360,
    description: 'Stir-fried soft hakka noodles tossed with coastal prawns, garlic, and shredded veggies.',
    isVeg: false,
    portionNote: 'Seafood Noodles'
  },
  {
    id: 'n-chicken-schezwan',
    name: 'Chicken Schezwan Noodles',
    category: 'rice-noodles',
    price: 300,
    description: 'Spicy stir-fried noodles with chicken ribbons and fiery schezwan pepper oil.',
    isVeg: false,
    portionNote: 'Fiery Wok'
  },
  {
    id: 'n-veg-hakka',
    name: 'Veg Hakka Noodles',
    category: 'rice-noodles',
    price: 300,
    description: 'Ribbon noodles tossed with cabbage, capsicum, carrots, and light soy sauce.',
    isVeg: true,
    portionNote: 'Hakka Classic'
  },
  {
    id: 'n-paneer-noodles',
    name: 'Panneer Noodles',
    category: 'rice-noodles',
    price: 300,
    description: 'Wok-tossed noodles with soft golden paneer strips and crunchy vegetables.',
    isVeg: true,
    portionNote: 'Paneer Wok'
  },
  {
    id: 'n-mushroom-noodles',
    name: 'Mushroom Noodles',
    category: 'rice-noodles',
    price: 300,
    description: 'Stir-fried noodles sauteed with seasoned button mushrooms and spring onions.',
    isVeg: true,
    portionNote: 'Mushroom Wok'
  },
  {
    id: 'n-chicken-noodles',
    name: 'Chicken Noodles',
    category: 'rice-noodles',
    price: 250,
    description: 'Classic wok noodles tossed with tender chicken strips, egg, and fresh vegetables.',
    isVeg: false,
    portionNote: 'Wok Classic'
  },
  {
    id: 'n-schez-egg-noodles',
    name: 'Schezwan Egg Noodles',
    category: 'rice-noodles',
    price: 250,
    description: 'Egg ribbons tossed with soft noodles and spicy red schezwan sauce.',
    isVeg: false,
    portionNote: 'Spicy Egg'
  },
  {
    id: 'n-gobi-noodles',
    name: 'Gobi Noodles',
    category: 'rice-noodles',
    price: 250,
    description: 'Stir-fried noodles paired with crispy cauliflower florets and savory sauces.',
    isVeg: true,
    portionNote: 'Crispy Gobi'
  },
  {
    id: 'n-veg-noodles',
    name: 'Veg Noodles',
    category: 'rice-noodles',
    price: 250,
    description: 'Popular street-style tossed noodles with crisp julienned farm vegetables.',
    isVeg: true,
    portionNote: 'Street Style'
  },
  {
    id: 'n-egg-noodles',
    name: 'Egg Noodles',
    category: 'rice-noodles',
    price: 220,
    description: 'Wok-tossed noodles with fluffy scrambled eggs, spring onions, and white pepper.',
    isVeg: false,
    portionNote: 'Egg Classic'
  },

  // 6. TANDOORI BREADS & KULCHAS
  {
    id: 'br-paneer-kulcha',
    name: 'Panneer Kulcha',
    category: 'breads',
    price: 100,
    description: 'Tandoor baked soft leavened bread stuffed with spiced crumbled paneer and fresh coriander.',
    isVeg: true,
    portionNote: 'Stuffed Paneer'
  },
  {
    id: 'br-onion-kulcha',
    name: 'Onion Kulcha',
    category: 'breads',
    price: 90,
    description: 'Crisp flatbread stuffed with finely chopped spiced onions and carom seeds.',
    isVeg: true,
    portionNote: 'Onion Stuffed'
  },
  {
    id: 'br-masala-kulcha',
    name: 'Masala Kulcha',
    category: 'breads',
    price: 85,
    description: 'Leavened bread stuffed with potatoes, herbs, and warm chaat spices.',
    isVeg: true,
    portionNote: 'Spiced Potato'
  },
  {
    id: 'br-butter-naan',
    name: 'Butter Naan',
    category: 'breads',
    price: 75,
    description: 'Soft, tear-apart tandoori leavened flatbread brushed with golden desi butter.',
    isVeg: true,
    portionNote: 'Tandoor Classic'
  },
  {
    id: 'br-butter-kulcha',
    name: 'Butter Kulclha',
    category: 'breads',
    price: 70,
    description: 'Soft tandoori kulcha baked till golden and brushed generously with butter.',
    isVeg: true,
    portionNote: 'Buttery Kulcha'
  },
  {
    id: 'br-kulcha',
    name: 'Kulcha',
    category: 'breads',
    price: 65,
    description: 'Traditional plain soft kulcha baked against the clay tandoor pit.',
    isVeg: true,
    portionNote: 'Clay Oven'
  },
  {
    id: 'br-parota',
    name: 'Parota',
    category: 'breads',
    price: 60,
    description: 'Multi-layered flaky south Indian flatbread pan-grilled to crisp perfection.',
    isVeg: true,
    portionNote: 'Flaky Layered'
  },
  {
    id: 'br-butter-roti',
    name: 'Butter Roti',
    category: 'breads',
    price: 45,
    description: 'Whole wheat tandoori roti brushed with melted desi butter.',
    isVeg: true,
    portionNote: 'Desi Butter'
  },
  {
    id: 'br-tandoori-roti',
    name: 'Tandoori Roti',
    category: 'breads',
    price: 40,
    description: 'Crisp unleavened whole wheat bread baked directly on clay tandoor walls.',
    isVeg: true,
    portionNote: 'Healthy Whole Wheat'
  },

  // 7. MOJITOS & MILKSHAKES
  {
    id: 'bev-oreo-shake',
    name: 'Oreo Milkshake',
    category: 'beverages',
    price: 150,
    description: 'Rich thick vanilla ice cream blended with crushed crunchy Oreo cookies and chocolate drizzle.',
    isVeg: true,
    portionNote: 'Chilled Milkshake'
  },
  {
    id: 'bev-strawberry-shake',
    name: 'Strawberry Milkshake',
    category: 'beverages',
    price: 150,
    description: 'Thick and creamy milkshake crafted with luscious strawberry fruit puree and fresh milk.',
    isVeg: true,
    portionNote: 'Fruit Milkshake'
  },
  {
    id: 'bev-chocolate-shake',
    name: 'Chocolate Milkshake',
    category: 'beverages',
    price: 150,
    description: 'Decadent chocolate milkshake made with rich cocoa, ice cream, and chocolate curls.',
    isVeg: true,
    portionNote: 'Chocolate Bliss'
  },
  {
    id: 'bev-blue-lagoon',
    name: 'Blue Lagoon Mojito',
    category: 'beverages',
    price: 150,
    description: 'Electric blue cooler with crushed ice, fresh garden mint, key lime, and fizzy soda.',
    isVeg: true,
    portionNote: 'Signature Cooler'
  },
  {
    id: 'bev-red-melon',
    name: 'Red Melon Mojito',
    category: 'beverages',
    price: 150,
    description: 'Refreshing sweet watermelon cooler infused with hand-crushed mint leaves and lime.',
    isVeg: true,
    portionNote: 'Chilled Watermelon'
  },
  {
    id: 'bev-green-mint',
    name: 'Green Mint Mojito',
    category: 'beverages',
    price: 150,
    description: 'Zesty palate cleanser with fresh crushed mint, citrus juice, sugar syrup, and sparkling soda.',
    isVeg: true,
    portionNote: 'Zesty Cooler'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-g1',
    name: 'Karthik Varma',
    role: 'Local Guide • 42 Reviews',
    quote: 'The Vaibhav Special Mandi is unbeatable in Renigunta! The rice had authentic Arabian aroma with roasted dry fruits and the chicken was falling off the bone tender. Big spacious AC booths, perfect for weekend family outings.',
    rating: 5,
    date: '2 weeks ago',
    isGoogleReview: true,
    highlightDish: 'Vaibhav Special Mandi'
  },
  {
    id: 't-g2',
    name: 'Suresh Babu Naidu',
    role: 'Tirupati Resident',
    quote: 'We ordered the Chicken Dum Biryani Bucket for our house warming celebration. Huge quantity, supreme firewood flavor, and everyone asked where we ordered from. Very pocket friendly price for a family bucket.',
    rating: 5,
    date: '1 month ago',
    isGoogleReview: true,
    highlightDish: 'Chicken Dum Biryani Bucket'
  },
  {
    id: 't-g3',
    name: 'Lakshmi Prasanna',
    role: 'Family Diner',
    quote: 'We celebrated my daughter’s birthday party here. The staff helped us arrange the tables and the balloon decoration in the AC hall was lovely. Kids loved the Oreo Milkshake and Loaded Fries, while we enjoyed the Tandoori Chicken.',
    rating: 4,
    date: '3 weeks ago',
    isGoogleReview: true,
    highlightDish: 'Tandoori Chicken'
  },
  {
    id: 't-g4',
    name: 'Mohammad Riaz',
    role: 'Frequent Pilgrim & Traveler',
    quote: 'On our way to Srikalahasthi after Tirumala darshan, we stopped at Vaibhav Grand near Ramana Vilas Circle. Super fast service, clean washrooms, and the Apollo Fish and Paneer Tikka Fry were outstanding.',
    rating: 4.5,
    date: '1 month ago',
    isGoogleReview: true,
    highlightDish: 'Apollo Fish & Paneer Tikka Fry'
  },
  {
    id: 't-g5',
    name: 'Anil Kumar Reddy',
    role: 'Local Resident',
    quote: 'Best non-veg restaurant in Renigunta. The Chicken Majestic and Rayalaseema Chicken Curry are true Andhra spice masterclasses. Consistent taste every time we visit or order on Swiggy.',
    rating: 5,
    date: '2 months ago',
    isGoogleReview: true,
    highlightDish: 'Chicken Majestic'
  },
  {
    id: 't-g6',
    name: 'Venkatesh Prasad',
    role: 'Local Guide • 18 Reviews',
    quote: 'The Alfham Juicy Mandi here is an absolute culinary gem. The char on the chicken is authentic and the spiced basmati is cooked to perfection with ghee-roasted cashews and raisins.',
    rating: 5,
    date: '3 weeks ago',
    isGoogleReview: true,
    highlightDish: 'Alfham Juicy Mandi'
  },
  {
    id: 't-g7',
    name: 'Deepa Narayanan',
    role: 'Family Diner',
    quote: 'We had a family dinner with both vegetarians and non-veg lovers. The Paneer Tikka Fry, Butter Naan, and Kadai Veg were delicious. Very courteous staff and comfortable air conditioning.',
    rating: 5,
    date: '1 month ago',
    isGoogleReview: true,
    highlightDish: 'Paneer Tikka Fry & Butter Naan'
  },
  {
    id: 't-g8',
    name: 'Shakeel Ahmed',
    role: 'Frequent Diner',
    quote: 'One of the best Mandi spots in Tirupati and Renigunta. The Tandoori Chicken Mandi has that authentic coal-fired aroma. Salan and garlic mint dips were on point.',
    rating: 5,
    date: '3 weeks ago',
    isGoogleReview: true,
    highlightDish: 'Tandoori Chicken Mandi'
  },
  {
    id: 't-g9',
    name: 'Haritha Chowdary',
    role: 'Weekend Diner',
    quote: 'The Chicken Lollipop and Kaju Chicken were super crispy, fresh, and bursting with flavors. Fast service and clean family dining hall right opposite the HP petrol pump.',
    rating: 4.5,
    date: '4 weeks ago',
    isGoogleReview: true,
    highlightDish: 'Chicken Lollipop & Kaju Chicken'
  },
  {
    id: 't-g10',
    name: 'Rajesh Goud',
    role: 'Tirupati Pilgrimage Organizer',
    quote: 'Brought a group of 35 pilgrims after Tirumala darshan. They arranged tables quickly and served piping-hot Chicken Dum Biryani buckets. Great taste, generous quantity, and very polite management.',
    rating: 5,
    date: '2 months ago',
    isGoogleReview: true,
    highlightDish: 'Chicken Dum Biryani Bucket'
  }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g-front-night',
    title: 'Vaibhav Grand Illuminated Night Facade',
    category: 'Front View',
    imageUrl: '/assets/vaibhav-grand-webp-images/front6.webp',
    altText: 'Vaibhav Grand Family Restaurant illuminated night facade in Renigunta, Tirupati'
  },
  {
    id: 'g-mandi-platter',
    title: 'Vaibhav Special Mandi Grand Platter',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/food14.webp',
    altText: 'Gigantic Arabic Mandi platter served at Vaibhav Grand Family Restaurant, Renigunta, Tirupati'
  },
  {
    id: 'g-biryani-starter',
    title: 'Hyderabadi Dum Biryani & Spicy Sizzler',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/food12.webp',
    altText: 'Steaming Hyderabadi Biryani handi topped with boiled egg and spicy chicken starter'
  },
  {
    id: 'g-birthday-hall',
    title: 'Birthday & Event Celebration Hall',
    category: 'Ambiance',
    imageUrl: '/assets/vaibhav-grand-webp-images/ambiance.webp',
    altText: 'Family dining hall with festive balloons setup for birthday celebration in Renigunta, Tirupati'
  },
  {
    id: 'g-family-dining',
    title: 'Families Dining & Enjoying Feasts',
    category: 'Celebrations',
    imageUrl: '/assets/vaibhav-grand-webp-images/people.webp',
    altText: 'Happy family dining at booth table with Vaibhav Grand menu card and biryani'
  },
  {
    id: 'g-mocktails-trio',
    title: 'Signature Chilled Mojitos & Coolers',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/drinlk.webp',
    altText: 'Four vibrant chilled artisan mocktails: Blue Lagoon, Red Melon, Mint, and Citrus'
  },
  {
    id: 'g-kaju-chicken',
    title: 'Crispy Kaju Chicken Starter',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/food8.webp',
    altText: 'Golden fried crispy chicken tossed with roasted cashews and shredded cabbage'
  },
  {
    id: 'g-blue-lagoon',
    title: 'Electric Blue Lagoon Mojito',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/drink1.webp',
    altText: 'Refreshing Blue Lagoon Mojito garnished with lemon wheel and fresh garden mint'
  },
  {
    id: 'g-communal-mandi',
    title: 'Arabic Communal Dastarkhwan Feast',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/food2.webp',
    altText: 'Large communal Mandi platter shared among friends at table'
  },
  {
    id: 'g-dessert-icecream',
    title: 'Gulab Jamun & Ice Cream Sundae',
    category: 'Food & Mandi',
    imageUrl: '/assets/vaibhav-grand-webp-images/food6.webp',
    altText: 'Chilled vanilla ice cream sundae served with warm gulab jamuns, wafer rolls, and nuts'
  },
  {
    id: 'g-front-day',
    title: 'Daylight View & Irani Chai Counter',
    category: 'Front View',
    imageUrl: '/assets/vaibhav-grand-webp-images/front1.webp',
    altText: 'Front facade of Vaibhav Grand with Irani Chai counter and welcoming entrance'
  },
  {
    id: 'g-child-celebration',
    title: 'Little Moments of Joy & Warmth',
    category: 'Celebrations',
    imageUrl: '/assets/vaibhav-grand-webp-images/people2.webp',
    altText: 'Little child reaching for the illuminated chandelier lamp inside restaurant booth'
  }
];

export const DIGITAL_MENU_PAGES: DigitalMenuPage[] = [
  {
    id: 'menu-page-bucket',
    pageNumber: 1,
    title: 'Bucket Biryani Packs & Parcel Specials',
    subtitle: 'Vaibhav Grand Family Takeaway & Gathering Packs',
    category: 'Bucket Packs',
    defaultPlaceholderImage: '/assets/vaibhav-grand-webp-images/menu.webp',
    itemsPreview: [
      'Chicken Mandi Bucket - ₹850',
      'Chicken Tandoori Mandi Bucket - ₹950',
      'Arabian Al Faham Mandi Bucket - ₹950',
      'Chicken Dum Biryani Bucket - ₹800',
      'Chicken Fry Biryani Bucket - ₹950',
      'Family Dum Biryani Bucket - ₹550'
    ]
  },
  {
    id: 'menu-page-mandi',
    pageNumber: 2,
    title: 'Arabic Mandi Platters & Dastarkhwan',
    subtitle: 'Communal roasted chicken platters with spiced basmati',
    category: 'Mandi Platters',
    defaultPlaceholderImage: '/assets/vaibhav-grand-webp-images/poster.webp',
    itemsPreview: [
      'Vaibhav Special Mandi - ₹1370',
      'Alfham Juicy Mandi - ₹850',
      'Tandoori Chicken Mandi - ₹690',
      'Chicken Mandi - ₹650',
      'Alfham Chicken Mandi - ₹650'
    ]
  },
  {
    id: 'menu-page-starters',
    pageNumber: 3,
    title: 'Tandoor Grills & Andhra Crispy Starters',
    subtitle: 'Clay oven kebabs, seafood sizzlers & vegetarian appetizers',
    category: 'Starters',
    defaultPlaceholderImage: '/assets/vaibhav-grand-webp-images/food12.webp',
    itemsPreview: [
      'Tandoori Chicken - ₹410',
      'Kaju Chicken - ₹400',
      'Apollo Fish - ₹400',
      'Panneer Tikka - ₹400',
      'Chicken Majestic - ₹370',
      'Prawns 65 - ₹390'
    ]
  },
  {
    id: 'menu-page-beverages',
    pageNumber: 4,
    title: 'Fresh Juices, Mocktails & Thick Milkshakes',
    subtitle: 'Chilled artisan refreshments and milkshakes',
    category: 'Beverages',
    defaultPlaceholderImage: '/assets/vaibhav-grand-webp-images/drinlk.webp',
    itemsPreview: [
      'Blue Lagoon Mojito - ₹150',
      'Red Melon Mojito - ₹150',
      'Green Mint Mojito - ₹150',
      'Oreo Milkshake - ₹150',
      'Strawberry Milkshake - ₹150',
      'Chocolate Milkshake - ₹150'
    ]
  }
];
