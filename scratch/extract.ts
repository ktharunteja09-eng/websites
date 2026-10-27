import { MENU_ITEMS } from '../src/data/restaurantData';

const withQuotes = MENU_ITEMS.filter(m => m.name.includes("'"));
console.log('Dishes with quotes:', withQuotes.map(m => m.name));
