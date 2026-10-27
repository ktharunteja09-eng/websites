const fs = require('fs');
const path = require('path');

const items = require('./all_284_menu_items.json');
const restPath = path.join(__dirname, '../src/data/restaurantData.ts');
let fileContent = fs.readFileSync(restPath, 'utf8');

const categoriesTs = `export const MENU_CATEGORIES: { id: MenuCategoryType; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'veg-soups', label: '1. Veg. Soups' },
  { id: 'non-veg-soups', label: '2. Non-Veg. Soups' },
  { id: 'vaibhav-special-starters', label: '3. Special Starters' },
  { id: 'nattu-specials', label: "4. Nattu Specials & Ragi" },
  { id: 'chicken-starters', label: '5. Chicken Starters' },
  { id: 'mutton-starters', label: '6. Mutton Starters' },
  { id: 'fish-starters', label: '7. Fish Starters' },
  { id: 'prawns-starters', label: '8. Prawns Starters' },
  { id: 'egg-starters', label: '9. Egg Starters' },
  { id: 'veg-starters', label: '10. Veg. Starters' },
  { id: 'tandoori-fusion', label: '11. Tandoori Fusion' },
  { id: 'shawarmas', label: '12. Shawarmas' },
  { id: 'biriyanis', label: '13. Biriyanis' },
  { id: 'veg-biryani', label: '14. Veg. Biryani' },
  { id: 'arabic-mandi', label: '15. Arabic Mandi' },
  { id: 'non-veg-fried-rice', label: '16. Non-Veg Fried Rice' },
  { id: 'veg-fried-rice', label: '17. Veg Fried Rice' },
  { id: 'non-veg-noodles', label: '18. Non-Veg Noodles' },
  { id: 'veg-noodles', label: '19. Veg Noodles' },
  { id: 'veg-pulavs', label: '20. Veg Pulavs' },
  { id: 'indian-breads', label: '21. Indian Breads' },
  { id: 'veg-curries', label: '22. Veg. Curries' },
  { id: 'chicken-curries', label: '23. Chicken Curries' },
  { id: 'mutton-curry', label: '24. Mutton Curry' },
  { id: 'milkshakes', label: '25. Milkshakes' },
  { id: 'beverages', label: '26. Beverages' },
  { id: 'mocktails', label: '27. Mocktails' },
  { id: 'desserts', label: '28. Desserts' },
  { id: 'ice-creams', label: '29. Ice Creams' },
  { id: 'bucket-biryani', label: '30. Bucket Biryani' }
];

export const PHOTO_MENU_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'mandi', label: 'Arabic Mandi' },
  { id: 'biryani', label: 'Biryani Specialties' },
  { id: 'starters', label: 'Starters & Tandoor' },
  { id: 'curries', label: 'Curries & Gravies' },
  { id: 'rice-noodles', label: 'Fried Rice & Noodles' },
  { id: 'breads', label: 'Tandoori Breads' },
  { id: 'beverages', label: 'Mojitos & Shakes' }
];`;

const itemsTs = `export const MENU_ITEMS: MenuItem[] = [\n` +
  items.map((item) => {
    const lines = [
      `  {`,
      `    id: ${JSON.stringify(item.id)},`,
      `    name: ${JSON.stringify(item.name)},`,
      `    category: ${JSON.stringify(item.category)},`,
      `    price: ${item.price},`,
      `    description: ${JSON.stringify(item.description)},`,
      `    isVeg: ${item.isVeg},`
    ];
    if (item.isChefSpecial) {
      lines.push(`    isChefSpecial: true,`);
    }
    if (item.portionNote) {
      lines.push(`    portionNote: ${JSON.stringify(item.portionNote)},`);
    }
    lines.push(`  }`);
    return lines.join('\n');
  }).join(',\n') +
  `\n];`;

// Replace from export const MENU_CATEGORIES to export const TESTIMONIALS
const startMarker = "export const MENU_CATEGORIES: { id: MenuCategoryType; label: string }[] = [";
const endMarker = "export const TESTIMONIALS: Testimonial[] = [";

const startIndex = fileContent.indexOf(startMarker);
const endIndex = fileContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers:', { startIndex, endIndex });
  process.exit(1);
}

const newBlock = `${categoriesTs}\n\n${itemsTs}\n\n`;
fileContent = fileContent.slice(0, startIndex) + newBlock + fileContent.slice(endIndex);

fs.writeFileSync(restPath, fileContent, 'utf8');
console.log('Successfully updated restaurantData.ts with all 284 menu items & 30 categories!');
