import { DbMenuItem } from '../types';
import { getDishImage } from '../data/menuImageMap';

export interface ItemVariantOption {
  dishId: number;
  size: string;
  price: number;
  aggregatorPrice: number | null;
  isCompleted: boolean;
  directEligible: boolean;
}

export interface GroupedMobileDish {
  baseId: string;
  primaryDish: DbMenuItem;
  name: string;
  category: string;
  description?: string;
  isVeg: boolean;
  isChefSpecial?: boolean;
  portionNote?: string;
  image?: string;
  isBestseller?: boolean;
  variants: ItemVariantOption[];
  minPrice: number;
}

/**
 * Extracts size variant info if dish name indicates a portion
 */
export function extractSizeFromDish(name: string, portionNote?: string): { baseName: string; size: string | null } {
  // Check parenthesis patterns: (Half), (Full), (Single), (2 Pcs.), (4 Pcs.)
  const parenMatch = name.match(/^(.*?)\s*\((half|full|single|\d+\s*pcs?\.?)\)\s*$/i);
  if (parenMatch) {
    const rawSize = parenMatch[2].toLowerCase();
    let size = 'Portion';
    if (rawSize.includes('half')) size = 'Half';
    else if (rawSize.includes('full')) size = 'Full';
    else if (rawSize.includes('single')) size = 'Single';
    else if (rawSize.includes('2')) size = '2 Pcs';
    else if (rawSize.includes('4')) size = '4 Pcs';
    else size = parenMatch[2];
    return { baseName: parenMatch[1].trim(), size };
  }

  // Check suffix patterns: " Name Half", " Name Full", " Name Single"
  const suffixMatch = name.match(/^(.*?)\s+(half|full|single)$/i);
  if (suffixMatch) {
    const rawSize = suffixMatch[2].toLowerCase();
    const size = rawSize.charAt(0).toUpperCase() + rawSize.slice(1);
    return { baseName: suffixMatch[1].trim(), size };
  }

  // Check Tangdi Kabab style
  const tangdiMatch = name.match(/^(Tangdi\s+Kabab)\s+(Half|Full)/i);
  if (tangdiMatch) {
    return { baseName: 'Tangdi Kabab', size: tangdiMatch[2].charAt(0).toUpperCase() + tangdiMatch[2].slice(1).toLowerCase() };
  }

  // Check portionNote if name doesn't specify
  if (portionNote && /^(half|full|single)/i.test(portionNote.trim())) {
    const raw = portionNote.trim().toLowerCase();
    if (raw.includes('half')) return { baseName: name, size: 'Half' };
    if (raw.includes('full')) return { baseName: name, size: 'Full' };
    if (raw.includes('single')) return { baseName: name, size: 'Single' };
  }

  return { baseName: name, size: null };
}

/**
 * Groups a flat list of category dishes into mobile-optimized items with size variants
 */
export function groupDishesForMobile(dishes: DbMenuItem[]): GroupedMobileDish[] {
  const map = new Map<string, GroupedMobileDish>();
  const order: string[] = [];

  dishes.forEach((dish) => {
    const { baseName, size } = extractSizeFromDish(dish.name, dish.portionNote);
    const key = `${dish.category}:::${baseName.toLowerCase()}`;

    if (!size) {
      // Standard item with no variants
      const singleKey = `${dish.category}:::${dish.id}`;
      map.set(singleKey, {
        baseId: String(dish.id),
        primaryDish: dish,
        name: dish.name,
        category: dish.category,
        description: dish.description,
        isVeg: dish.is_veg,
        isChefSpecial: dish.isChefSpecial,
        portionNote: dish.portionNote,
        image: dish.image || getDishImage(dish.name),
        isBestseller: dish.isBestseller,
        variants: [],
        minPrice: dish.price,
      });
      order.push(singleKey);
      return;
    }

    // Dish with a size variant
    const existing = map.get(key);
    const variantOption: ItemVariantOption = {
      dishId: dish.id,
      size,
      price: dish.price,
      aggregatorPrice: dish.aggregator_price,
      isCompleted: dish.is_completed,
      directEligible: dish.direct_order_eligible,
    };

    if (existing) {
      existing.variants.push(variantOption);
      existing.minPrice = Math.min(existing.minPrice, dish.price);
      // Prefer non-completed as primary if possible
      if (existing.primaryDish.is_completed && !dish.is_completed) {
        existing.primaryDish = dish;
      }
    } else {
      const grouped: GroupedMobileDish = {
        baseId: `group-${dish.id}`,
        primaryDish: dish,
        name: baseName,
        category: dish.category,
        description: dish.description,
        isVeg: dish.is_veg,
        isChefSpecial: dish.isChefSpecial,
        portionNote: undefined,
        image: dish.image || getDishImage(baseName) || getDishImage(dish.name),
        isBestseller: dish.isBestseller,
        variants: [variantOption],
        minPrice: dish.price,
      };
      map.set(key, grouped);
      order.push(key);
    }
  });

  return order.map((k) => map.get(k)!);
}
