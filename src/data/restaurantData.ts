import { MenuItem, SignatureDish, Testimonial, GalleryPhoto, RestaurantInfo, DigitalMenuPage } from '../types';

export const RESTAURANT_INFO: RestaurantInfo = {
  name: "Vaibhav Grand Family Restaurant",
  tagline: "Authentic Flavor, Fresh Ingredients",
  address: "Plot 157, Near Ramana Vilas Circle, Srikalahasthi Road, Renigunta, Tirupati-517520, Andhra Pradesh",
  landmark: "Opposite HP Petrol Pump, Renigunta & Mangalam Road",
  phone: "7947142432",
  email: "vaibhavgrand91@gmail.com",
  instagramHandle: "@vaibh_avgrand",
  instagramUrl: "https://www.instagram.com/vaibh_avgrand/",
  facebookUrl: "https://www.facebook.com/vaibhavgrandfamilyrestaurant/",
  hours: "Open daily, 12:00 PM - 11:00 PM (every day)",
  swiggyUrl: "https://www.swiggy.com/city/tirupati/vaibhav-grand-family-restaurant-opp-hp-petrol-pump-renigunta-and-mangalam-road-rest1031959",
  zomatoUrl: "http://zoma.to/r/20751251",
  googleMapsUrl: "https://maps.google.com/?q=Vaibhav+Grand+Family+Restaurant+Renigunta+Tirupati",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15512.450702654316!2d79.5050!3d13.6508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d4bfcd49f6f69%3A0xb30e66d0ef0be1a6!2sRenigunta%2C%20Tirupati%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
  overallRating: 3.6,
  totalReviews: 1001,
};

export const HERO_SLIDES = [
  {
    id: 'chicken-mandi',
    title: 'Vaibhav Special Chicken Mandi',
    subtitle: 'Communal Arabic Platter with Tender Char-grilled Chicken & Fragrant Saffron Basmati',
    category: 'Arabic Specialty',
    imageUrl: '/assets/images/chicken_mandi_hero_1789894879370.jpg',
    altText: 'Vaibhav Special Chicken Mandi platter with tender roasted whole chicken cuts, golden cashews, raisins, cucumber, carrot slices, and Yemeni tomato salsa'
  },
  {
    id: 'chicken-tikka-kebab',
    title: 'Smoky Chicken Tikka Kebab Platter',
    subtitle: 'Charred Spiced Chicken Skewers with Lemon Wedges & Fresh Mint Chutney',
    category: 'Clay Oven Grill',
    imageUrl: '/assets/images/chicken_tikka_hero_1789894901572.jpg',
    altText: 'Skewers of sizzling golden-charred spiced chicken tikka kebabs with aromatic smoke, fresh lemon wedges, and coriander mint chutney'
  },
  {
    id: 'refreshing-drinks',
    title: 'Assorted Vibrant Mocktails & Coolers',
    subtitle: 'Trio of Colorful Signature Coolers: Mint Mojito, Citrus Sunshine & Crimson Berry',
    category: 'Beverages & Coolers',
    imageUrl: '/assets/images/vibrant_mocktails_hero_1789894941398.jpg',
    altText: 'Three colorful artisan mocktails in emerald green, sunny yellow citrus, and vibrant crimson berry with crushed ice and fresh herb garnishes'
  },
  {
    id: 'sizzling-tandoori',
    title: 'Sizzling Tandoori Chicken Platter',
    subtitle: 'Char-Roasted in Traditional Clay Ovens with Kashmiri Spices & Sliced Red Onions',
    category: 'Tandoor Specialty',
    imageUrl: '/assets/images/sizzling_tandoori_hero_1789894957461.jpg',
    altText: 'Authentic sizzling tandoori chicken served in a cast iron skillet with charred marks, lemon wedges, and green mint dip'
  },
  {
    id: 'elegant-dessert',
    title: 'Gourmet Sizzling Brownie & Ice Cream',
    subtitle: 'Warm Chocolate Fudge Brownie with Rich Vanilla Ice Cream & Swirled Dark Chocolate',
    category: 'Elegant Desserts',
    imageUrl: '/assets/images/brownie_dessert_hero_1789894922593.jpg',
    altText: 'Warm chocolate fudge brownie topped with a scoop of Madagascar vanilla ice cream and spiral drizzle of rich dark chocolate sauce'
  }
];

export const WHY_CHOOSE_US_ITEMS = [
  {
    id: 'diverse-menu',
    title: 'Diverse Menu',
    description: 'From Mughlai and Chinese to Arabic specialties and Mandi platters',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'signature-specialties',
    title: 'Signature Specialties',
    description: 'Try the Chicken Reshmi Kebab Biryani or Mughlai Chicken Biryani',
    icon: 'Flame',
  },
  {
    id: 'family-vibes',
    title: 'Family Vibes',
    description: 'Clean, cool, casual spot perfect for family gatherings and birthdays',
    icon: 'Users',
  },
  {
    id: 'great-value',
    title: 'Great Value',
    description: 'Generous portions, delicious food, pocket-friendly prices',
    icon: 'BadgePercent',
  }
];

export const SIGNATURE_DISHES: SignatureDish[] = [
  {
    id: 'special-mandi',
    name: 'Vaibhav Special Chicken Mandi',
    tagline: 'Grand Arabian feast with saffron rice & tender roasted chicken',
    price: 699,
    description: 'Fragrant Arabic seasoned long-grain rice topped with char-grilled tender chicken cuts, roasted cashew nuts, raisins, and spicy Yemeni tomato chutney with Salan.',
    image: '/assets/images/chicken_mandi_hero_1789894879370.jpg',
    isVeg: false,
    badge: 'Signature Platter',
    serving: 'Serves 3–4 (Family Platter)',
    spiceLevel: 'Mild to Medium'
  },
  {
    id: 'chicken-tikka-kebab',
    name: 'Smoky Chicken Tikka Kebab',
    tagline: 'Charred spiced chicken skewers with lemon & fresh mint chutney',
    price: 280,
    description: 'Skewered boneless chicken chunks marinated overnight in aromatic tandoori masala and hung curd, roasted over live coals with crispy charred edges and herb smoke.',
    image: '/assets/images/chicken_tikka_hero_1789894901572.jpg',
    isVeg: false,
    badge: 'Clay Oven Grill',
    serving: 'Platter (6 Large Skewers)',
    spiceLevel: 'Medium Charred Spice'
  },
  {
    id: 'signature-coolers-trio',
    name: 'Signature Refreshment Trio',
    tagline: '3 Vibrant chilled coolers: Mint Mojito, Citrus Sunshine & Berry Fizz',
    price: 180,
    description: 'Three handcrafted chilled coolers in emerald green, sunny yellow citrus, and vibrant crimson berry, prepared with fresh mint, key lime, fruit nectars, and effervescent fizz.',
    image: '/assets/images/vibrant_mocktails_hero_1789894941398.jpg',
    isVeg: true,
    badge: 'Artisan Coolers',
    serving: 'Flight of 3 Coolers',
    spiceLevel: 'Chilled & Zesty'
  },
  {
    id: 'tandoori-chicken',
    name: 'Sizzling Tandoori Chicken',
    tagline: 'Char-roasted in traditional clay ovens with hand-pounded spices',
    price: 320,
    description: 'Succulent farm-fresh chicken marinated overnight in Kashmiri chilli, hung curd, ginger-garlic paste, and roasted cumin, finished in a live charcoal clay tandoor.',
    image: '/assets/images/sizzling_tandoori_hero_1789894957461.jpg',
    isVeg: false,
    badge: 'Tandoor Specialty',
    serving: 'Half / Full Platter',
    spiceLevel: 'Medium Spice'
  },
  {
    id: 'sizzling-brownie-dessert',
    name: 'Sizzling Brownie with Ice Cream',
    tagline: 'Warm fudge brownie, vanilla bean ice cream & rich chocolate swirls',
    price: 160,
    description: 'Gourmet warm chocolate fudge brownie served with a velvety scoop of Madagascar vanilla ice cream, topped with generous spiral drizzles of dark chocolate sauce.',
    image: '/assets/images/brownie_dessert_hero_1789894922593.jpg',
    isVeg: true,
    badge: 'Elegant Dessert',
    serving: 'Platter with Ice Cream',
    spiceLevel: 'Sweet Indulgence'
  }
];

export const MENU_CATEGORIES = [
  { id: 'all', label: 'All Dishes' },
  { id: 'biryani-mandi', label: 'Biryani & Mandi' },
  { id: 'starters', label: 'Starters & Tandoor' },
  { id: 'mains', label: 'Mains & Gravies' },
  { id: 'breads', label: 'Tandoori Breads' },
  { id: 'chinese', label: 'Indo-Chinese' },
  { id: 'beverages', label: 'Beverages & Sweets' }
];

export const MENU_ITEMS: MenuItem[] = [
  // Biryani & Mandi
  {
    id: 'm1',
    name: 'Vaibhav Special Chicken Mandi',
    category: 'biryani-mandi',
    price: 699,
    description: 'Signature Arabian rice platter with marinated char-grilled chicken, dry fruits, served with special Mandi tomato dip & Salan.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Serves 3-4'
  },
  {
    id: 'm2',
    name: 'Chicken Dum Biryani Bucket',
    category: 'biryani-mandi',
    price: 450,
    description: 'Generous family bucket packed with authentic Hyderabadi dum biryani, whole spiced chicken cuts, and boiled eggs with Raita.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Family Pack'
  },
  {
    id: 'm3',
    name: 'Chicken Reshmi Kebab Biryani',
    category: 'biryani-mandi',
    price: 340,
    description: 'Silky, melt-in-the-mouth reshmi kebabs laid over fragrant spiced basmati dum rice.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Single / Jumbo'
  },
  {
    id: 'm4',
    name: 'Mughlai Chicken Biryani',
    category: 'biryani-mandi',
    price: 320,
    description: 'Rich royal recipe cooked with fried cashews, saffron essence, and tender chicken cooked on slow embers.',
    isVeg: false,
    portionNote: 'Serves 1-2'
  },
  {
    id: 'm5',
    name: 'Mutton Dum Biryani',
    category: 'biryani-mandi',
    price: 380,
    description: 'Juicy tender mutton cuts slow-cooked with aromatic garam masala and layered long-grain basmati.',
    isVeg: false,
    portionNote: 'Special Weekend Batch'
  },
  {
    id: 'm6',
    name: 'Paneer Dum Biryani',
    category: 'biryani-mandi',
    price: 250,
    description: 'Fresh cottage cheese cubes sauteed in special spices and sealed with long-grain saffron rice.',
    isVeg: true,
    portionNote: 'Vegetarian Delight'
  },

  // Starters & Tandoor
  {
    id: 's1',
    name: 'Tandoori Chicken (Full / Half)',
    category: 'starters',
    price: 320,
    description: 'Whole chicken steeped in Kashmiri mirch, hung curd, and roasted aromatics, blistered in the clay pit.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: '4 / 8 Pieces'
  },
  {
    id: 's2',
    name: 'Chicken Reshmi Kebab',
    category: 'starters',
    price: 290,
    description: 'Boneless chicken cubes infused with cream, crushed black pepper, and almond paste, lightly charred.',
    isVeg: false,
    portionNote: '8 Pieces'
  },
  {
    id: 's3',
    name: 'Chicken Tikka Kebab',
    category: 'starters',
    price: 280,
    description: 'Spicy skewered chicken chunks char-grilled over charcoal embers, tossed in chaat masala and lemon.',
    isVeg: false,
    portionNote: '8 Pieces'
  },
  {
    id: 's4',
    name: 'Paneer Tikka (Tandoor)',
    category: 'starters',
    price: 240,
    description: 'Cubes of fresh malai paneer, bell peppers, and red onion skewers seasoned with mustard oil & carom seeds.',
    isVeg: true,
    portionNote: '6 Large Pieces'
  },
  {
    id: 's5',
    name: 'Apollo Fish Tikka',
    category: 'starters',
    price: 340,
    description: 'Fresh river fish fillets tossed with curry leaves, cracked pepper, and coastal Andhra spices.',
    isVeg: false,
    portionNote: 'Chef Special'
  },
  {
    id: 's6',
    name: 'Crispy Corn & Pepper Salt',
    category: 'starters',
    price: 190,
    description: 'Golden fried sweet corn kernels tossed with spring onions, garlic crisps, and freshly ground peppercorns.',
    isVeg: true,
    portionNote: 'Vegetarian Starter'
  },

  // Mains & Gravies
  {
    id: 'g1',
    name: 'Paneer Tikka Masala',
    category: 'mains',
    price: 260,
    description: 'Tandoor-charred paneer cubes in a velvety tomato, cream, and butter makhani sauce with fenugreek leaves.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Rich Makhani'
  },
  {
    id: 'g2',
    name: 'Mughlai Butter Chicken',
    category: 'mains',
    price: 290,
    description: 'Shredded tandoori chicken simmered in an indulgent cashew nut and ripe tomato butter reduction.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Crowd Favorite'
  },
  {
    id: 'g3',
    name: 'Kadai Chicken Lahori',
    category: 'mains',
    price: 280,
    description: 'Tender chicken tossed in an iron wok with crushed coriander seeds, bell peppers, and rich onion gravy.',
    isVeg: false,
    portionNote: 'Medium Spicy'
  },
  {
    id: 'g4',
    name: 'Dal Tadka Double Ghee',
    category: 'mains',
    price: 180,
    description: 'Slow-simmered yellow lentils tempered with roasted cumin, garlic cloves, dry red chillies, and pure ghee.',
    isVeg: true,
    portionNote: 'Home Comfort'
  },
  {
    id: 'g5',
    name: 'Chicken Kolhapuri',
    category: 'mains',
    price: 280,
    description: 'Fiery chicken preparation with roasted dry spices, coconut paste, and red chillies.',
    isVeg: false,
    portionNote: 'Spicy Delight'
  },
  {
    id: 'g6',
    name: 'Kadai Paneer Masala',
    category: 'mains',
    price: 240,
    description: 'Cottage cheese cubes wok-tossed with thick capsicum wedges, onions, and coarse hand-ground spices.',
    isVeg: true,
    portionNote: 'Pure Veg'
  },

  // Breads
  {
    id: 'b1',
    name: 'Butter Naan',
    category: 'breads',
    price: 45,
    description: 'Soft, tear-apart tandoori leavened flatbread brushed with golden desi butter.',
    isVeg: true,
    portionNote: 'Clay Oven Fresh'
  },
  {
    id: 'b2',
    name: 'Garlic Butter Naan',
    category: 'breads',
    price: 55,
    description: 'Hand-stretched naan sprinkled with minced roasted garlic, fresh cilantro, and melted butter.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Crisp & Aromatic'
  },
  {
    id: 'b3',
    name: 'Tandoori Roti (Wheat)',
    category: 'breads',
    price: 30,
    description: 'Traditional whole wheat unleavened bread baked crisp against the blazing tandoor wall.',
    isVeg: true,
    portionNote: 'Healthy Whole Wheat'
  },
  {
    id: 'b4',
    name: 'Lachha Paratha',
    category: 'breads',
    price: 45,
    description: 'Multi-layered flaky whole wheat bread layered with ghee and baked until golden.',
    isVeg: true,
    portionNote: 'Layered Flaky'
  },
  {
    id: 'b5',
    name: 'Cheese Naan',
    category: 'breads',
    price: 75,
    description: 'Stuffed with melted mozzarella and mild herbs, served hot and gooey.',
    isVeg: true,
    portionNote: 'Kids Favorite'
  },

  // Indo-Chinese
  {
    id: 'c1',
    name: 'Chilli Chicken (Dry / Gravy)',
    category: 'chinese',
    price: 260,
    description: 'Crispy fried chicken tossed in wok with dark soy sauce, crunchy green capsicum, and fresh green chillies.',
    isVeg: false,
    isChefSpecial: true,
    portionNote: 'Hot & Tangy'
  },
  {
    id: 'c2',
    name: 'Chicken Schezwan Fried Rice',
    category: 'chinese',
    price: 230,
    description: 'Wok-tossed basmati grains with shredded chicken, diced veggies, egg ribbons, and fiery in-house Schezwan sauce.',
    isVeg: false,
    portionNote: 'Hearty Wok Bowl'
  },
  {
    id: 'c3',
    name: 'Veg Manchurian (Dry / Gravy)',
    category: 'chinese',
    price: 200,
    description: 'Crisp vegetable dumplings simmered in ginger, garlic, spring onion, and spiced soy reduction.',
    isVeg: true,
    portionNote: 'Indo-Chinese Classic'
  },
  {
    id: 'c4',
    name: 'Chicken Hakka Noodles',
    category: 'chinese',
    price: 220,
    description: 'Stir-fried ribbon noodles tossed with crisp julienned cabbage, carrots, egg, and tender chicken strips.',
    isVeg: false,
    portionNote: 'Street Style Wok'
  },

  // Beverages & Sweets
  {
    id: 'v1',
    name: 'Special Matka Kulfi',
    category: 'beverages',
    price: 80,
    description: 'Slow-reduced milk kulfi infused with saffron strands, crushed pistachios, and green cardamom in earthen clay matka.',
    isVeg: true,
    isChefSpecial: true,
    portionNote: 'Royal Dessert'
  },
  {
    id: 'v2',
    name: 'Gulab Jamun with Rabdi (2 Pcs)',
    category: 'beverages',
    price: 90,
    description: 'Warm khoya dumplings soaked in fragrant cardamom rose sugar syrup, topped with chilled thick rabdi.',
    isVeg: true,
    portionNote: 'Warm & Sweet'
  },
  {
    id: 'v3',
    name: 'Fresh Mint Lime Soda (Sweet / Salt)',
    category: 'beverages',
    price: 60,
    description: 'Crushed garden mint, freshly squeezed key lime, and fizzy soda water to refresh the palate.',
    isVeg: true,
    portionNote: 'Chilled Cooler'
  },
  {
    id: 'v4',
    name: 'Sweet Punjabi Lassi',
    category: 'beverages',
    price: 70,
    description: 'Rich churned yogurt topped with a dollop of fresh cream and crushed almonds.',
    isVeg: true,
    portionNote: 'Creamy & Refreshing'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Karthik Reddy',
    role: 'Local Guide & Food Enthusiast',
    quote: 'The Vaibhav Special Mandi is hands down the best in Renigunta! The chicken was supremely tender and flavorful, and the fragrant rice had just the right hint of roasted nuts and Arabic spice. Perfect place for large family weekend dinners.',
    rating: 5,
    date: '2 weeks ago'
  },
  {
    id: 't2',
    name: 'Ananya Sharma',
    role: 'Tirupati Temple Pilgrim',
    quote: 'After our darshan at Tirumala, our family wanted good wholesome food on the way to Srikalahasthi. We were amazed by the cool AC ambiance, fast courteous service, and the Chicken Dum Biryani bucket was piping hot and so generous.',
    rating: 4.5,
    date: '1 month ago'
  },
  {
    id: 't3',
    name: 'Venkatesh Babu',
    role: 'Renigunta Resident',
    quote: 'We celebrated my son’s 7th birthday here in the family dining section. The staff went out of their way to make us comfortable, and their Tandoori Chicken and Reshmi Kebab Biryani won everyone over. Great value for pocket-friendly prices!',
    rating: 5,
    date: '3 weeks ago'
  },
  {
    id: 't4',
    name: 'Dr. Srinivasulu M.',
    role: 'Family Physician',
    quote: 'Very clean, cool, and respectful family atmosphere. Their Paneer Tikka Masala and Garlic Butter Naan are exceptional for vegetarians. Swiggy delivery is also super reliable when we crave their biryani on busy clinic days.',
    rating: 4.5,
    date: '2 months ago'
  }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g1',
    title: 'Vaibhav Special Mandi Platter',
    category: 'Arabic Specialty',
    imageUrl: '/assets/images/chicken_mandi_hero_1789894879370.jpg',
    altText: 'Grand Arabian Mandi platter on communal dastarkhwan at Vaibhav Grand'
  },
  {
    id: 'g2',
    title: 'Authentic Dum Biryani Handi',
    category: 'Biryani Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
    altText: 'Traditional Hyderabadi Chicken Dum Biryani in brass handi with hard-boiled egg'
  },
  {
    id: 'g3',
    title: 'Sizzling Tandoori Chicken Skillet',
    category: 'Tandoor Grill',
    imageUrl: '/assets/images/sizzling_tandoori_hero_1789894957461.jpg',
    altText: 'Sizzling tandoori chicken roasted in traditional clay oven with fresh lemon wedges'
  },
  {
    id: 'g4',
    title: 'Family Dining Hall & AC Seating',
    category: 'Restaurant Interior',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    altText: 'Spacious, cool air-conditioned dining interior arranged for family gatherings'
  },
  {
    id: 'g5',
    title: 'Royal Paneer Tikka & Naan',
    category: 'Vegetarian Feast',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
    altText: 'Rich creamy Paneer Tikka Masala paired with freshly baked butter naan'
  },
  {
    id: 'g6',
    title: 'Birthday & Event Celebrations',
    category: 'Private Banquets',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    altText: 'Festive dining table setup with warm ambiance and hospitality at Vaibhav Grand'
  },
  {
    id: 'g7',
    title: 'Smoky Chicken Tikka Kebab Skewers',
    category: 'Mughlai Starters',
    imageUrl: '/assets/images/chicken_tikka_hero_1789894901572.jpg',
    altText: 'Platter of succulent tender chicken tikka kebabs on skewers served with fresh lemon and mint dip'
  },
  {
    id: 'g8',
    title: 'Gourmet Sizzling Brownie & Ice Cream',
    category: 'Desserts & Refreshments',
    imageUrl: '/assets/images/brownie_dessert_hero_1789894922593.jpg',
    altText: 'Warm chocolate fudge brownie topped with vanilla ice cream and chocolate swirl sauce'
  }
];

export const DIGITAL_MENU_PAGES: DigitalMenuPage[] = [
  {
    id: 'page-1',
    pageNumber: 1,
    title: 'Tandoor Grill & Royal Starters',
    subtitle: 'Clay oven sizzlers, spicy kebabs & vegetarian appetizers',
    category: 'Starters',
    defaultPlaceholderImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop',
    itemsPreview: [
      'Tandoori Chicken (Full / Half) - ₹320',
      'Chicken Reshmi Kebab - ₹290',
      'Murgh Tikka Kebab (8 Pcs) - ₹290',
      'Apollo Fish Tikka - ₹340',
      'Paneer Tikka Tandoor - ₹240',
      'Crispy Corn & Pepper Salt - ₹190'
    ]
  },
  {
    id: 'page-2',
    pageNumber: 2,
    title: 'Arabian Mandi & Hyderabadi Dum Biryani',
    subtitle: 'Communal dastarkhwan platters & aged basmati family buckets',
    category: 'Biryani & Mandi',
    defaultPlaceholderImage: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop',
    itemsPreview: [
      'Vaibhav Special Chicken Mandi - ₹699',
      'Chicken Dum Biryani Bucket - ₹450',
      'Chicken Reshmi Kebab Biryani - ₹340',
      'Mughlai Chicken Biryani - ₹320',
      'Mutton Dum Biryani - ₹380',
      'Paneer Dum Biryani - ₹250'
    ]
  },
  {
    id: 'page-3',
    pageNumber: 3,
    title: 'Royal Mughlai Curries & Vegetarian Gravies',
    subtitle: 'Simmered slow gravies, velvety makhani & fragrant dals',
    category: 'Mains',
    defaultPlaceholderImage: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
    itemsPreview: [
      'Royal Paneer Tikka Masala - ₹260',
      'Mughlai Butter Chicken - ₹290',
      'Kadai Chicken Lahori - ₹280',
      'Dal Tadka Double Ghee - ₹180',
      'Chicken Kolhapuri - ₹280',
      'Kadai Paneer Masala - ₹240'
    ]
  },
  {
    id: 'page-4',
    pageNumber: 4,
    title: 'Tandoori Breads, Indo-Chinese & Desserts',
    subtitle: 'Clay oven naans, fiery wok noodles & authentic royal sweets',
    category: 'Breads & Desserts',
    defaultPlaceholderImage: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=800&auto=format&fit=crop',
    itemsPreview: [
      'Butter Naan & Garlic Roti - ₹45 / ₹55',
      'Tandoori Roti (Wheat) - ₹30',
      'Chilli Chicken (Dry / Gravy) - ₹260',
      'Chicken Schezwan Fried Rice - ₹230',
      'Special Matka Kulfi - ₹80',
      'Gulab Jamun with Rabdi - ₹90'
    ]
  }
];

