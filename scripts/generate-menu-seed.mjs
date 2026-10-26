import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load TypeScript array literals without tsx or compiler dependencies
function loadTsArray(filePath, exportName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`export\\s+const\\s+${exportName}\\s*:[^=]*=\\s*(\\[[\\s\\S]*?\\n\\]);`);
  const match = content.match(regex);
  if (!match) {
    throw new Error(`Could not find ${exportName} in ${filePath}`);
  }
  const fn = new Function(`return ${match[1]};`);
  return fn();
}

// Port extractSizeFromDish from src/utils/menuVariants.ts
function extractSizeFromDish(name, portionNote) {
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

  const suffixMatch = name.match(/^(.*?)\s+(half|full|single)$/i);
  if (suffixMatch) {
    const rawSize = suffixMatch[2].toLowerCase();
    const size = rawSize.charAt(0).toUpperCase() + rawSize.slice(1);
    return { baseName: suffixMatch[1].trim(), size };
  }

  const tangdiMatch = name.match(/^(Tangdi\s+Kabab)\s+(Half|Full)/i);
  if (tangdiMatch) {
    return { baseName: 'Tangdi Kabab', size: tangdiMatch[2].charAt(0).toUpperCase() + tangdiMatch[2].slice(1).toLowerCase() };
  }

  if (portionNote) {
    const lowerNote = portionNote.toLowerCase();
    if (lowerNote.includes('half')) return { baseName: name.trim(), size: 'Half' };
    if (lowerNote.includes('full')) return { baseName: name.trim(), size: 'Full' };
    if (lowerNote.includes('single')) return { baseName: name.trim(), size: 'Single' };
  }

  return { baseName: name.trim(), size: null };
}

function escapeSqlString(str) {
  return String(str || '').replace(/'/g, "''");
}

export function generateMenuSeed() {
  const menuItems = loadTsArray(path.join(rootDir, 'src/data/restaurantData.ts'), 'MENU_ITEMS');
  const photoPath = path.join(rootDir, 'src/data/photoMenuData.ts');
  const photoItems = fs.existsSync(photoPath) ? loadTsArray(photoPath, 'PHOTO_MENU_ITEMS') : [];

  const itemMap = new Map();
  const priceMap = new Map();
  const nameToIdMap = new Map();

  // 1. Process 284 catalog dishes from MENU_ITEMS
  for (const item of menuItems) {
    const itemId = String(item.id).trim();
    const rawName = String(item.name).trim();
    const { baseName, size } = extractSizeFromDish(rawName, item.portionNote);

    const price = Math.round(Number(item.price) || 0);
    const mrp = Math.round(Number(item.aggregator_price) || (price * 1.25));

    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        item_id: itemId,
        name: rawName,
        category: String(item.category || 'other'),
        is_veg: Boolean(item.isVeg),
        available: true,
      });
    }

    nameToIdMap.set(rawName.toLowerCase(), itemId);
    if (baseName.toLowerCase() !== rawName.toLowerCase()) {
      if (!nameToIdMap.has(baseName.toLowerCase())) {
        nameToIdMap.set(baseName.toLowerCase(), itemId);
      }
    }

    // Single / Default SKU
    priceMap.set(itemId, {
      sku: itemId,
      item_id: itemId,
      variant: size || null,
      price: Math.max(1, price),
      mrp: mrp > price ? mrp : null,
    });

    // Sized SKU if applicable
    if (size) {
      const normalizedSize = size.toLowerCase().replace(/\s+/g, '');
      const variantSku = `${itemId}:${normalizedSize}`;
      priceMap.set(variantSku, {
        sku: variantSku,
        item_id: itemId,
        variant: size,
        price: Math.max(1, price),
        mrp: mrp > price ? mrp : null,
      });
    }
  }

  // 2. Process photo menu items (merge shared dishes by name, assign stable canonical ID)
  for (const photoItem of photoItems) {
    const photoId = String(photoItem.id).trim();
    const photoName = String(photoItem.name).trim();
    const { baseName, size } = extractSizeFromDish(photoName, photoItem.portionNote);
    const price = Math.round(Number(photoItem.price) || 0);
    const mrp = Math.round(Number(photoItem.aggregator_price) || (price * 1.25));

    // Match against catalog by exact name or cleaned base name
    const cleanPhotoName = photoName.replace(/\s*\[.*?\]\s*/g, '').trim().toLowerCase();
    const matchId =
      nameToIdMap.get(photoName.toLowerCase()) ||
      nameToIdMap.get(cleanPhotoName) ||
      nameToIdMap.get(baseName.toLowerCase());

    const targetItemId = matchId || photoId;

    if (!itemMap.has(targetItemId)) {
      itemMap.set(targetItemId, {
        item_id: targetItemId,
        name: photoName,
        category: String(photoItem.category || 'other'),
        is_veg: Boolean(photoItem.isVeg),
        available: true,
      });
      nameToIdMap.set(photoName.toLowerCase(), targetItemId);
    }

    // Ensure photoId is also registered as an orderable SKU pointing to canonical item_id
    if (!priceMap.has(photoId)) {
      priceMap.set(photoId, {
        sku: photoId,
        item_id: targetItemId,
        variant: size || null,
        price: Math.max(1, price),
        mrp: mrp > price ? mrp : null,
      });
    }

    if (size) {
      const normalizedSize = size.toLowerCase().replace(/\s+/g, '');
      const variantSku = `${photoId}:${normalizedSize}`;
      if (!priceMap.has(variantSku)) {
        priceMap.set(variantSku, {
          sku: variantSku,
          item_id: targetItemId,
          variant: size,
          price: Math.max(1, price),
          mrp: mrp > price ? mrp : null,
        });
      }
    }
  }

  const itemsList = Array.from(itemMap.values());
  const pricesList = Array.from(priceMap.values());

  // Generate SQL output
  let sql = `-- =====================================================================\n`;
  sql += `-- AUTOMATICALLY GENERATED MENU SEED SCRIPT (TASK 4)\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += `-- Total items: ${itemsList.length}, Total price SKUs: ${pricesList.length}\n`;
  sql += `-- Safe and idempotent: ON CONFLICT DO NOTHING preserves owner edits\n`;
  sql += `-- =====================================================================\n\n`;

  sql += `-- 1. Seed Menu Items\n`;
  sql += `INSERT INTO menu_items (item_id, name, category, is_veg, available)\nVALUES\n`;
  const itemStatements = itemsList.map(
    (m) => `  ('${escapeSqlString(m.item_id)}', '${escapeSqlString(m.name)}', '${escapeSqlString(m.category)}', ${m.is_veg}, ${m.available})`
  );
  sql += itemStatements.join(',\n');
  sql += `\nON CONFLICT (item_id) DO NOTHING;\n\n`;

  sql += `-- 2. Seed Menu Prices (SKUs)\n`;
  sql += `INSERT INTO menu_prices (sku, item_id, variant, price, mrp)\nVALUES\n`;
  const priceStatements = pricesList.map((p) => {
    const variantSql = p.variant ? `'${escapeSqlString(p.variant)}'` : 'NULL';
    const mrpSql = p.mrp ? String(p.mrp) : 'NULL';
    return `  ('${escapeSqlString(p.sku)}', '${escapeSqlString(p.item_id)}', ${variantSql}, ${p.price}, ${mrpSql})`;
  });
  sql += priceStatements.join(',\n');
  sql += `\nON CONFLICT (sku) DO NOTHING;\n\n`;

  sql += `-- 3. Ensure Sale Settings Exist\n`;
  sql += `INSERT INTO sale_settings (id, sale_active, sale_percent, sale_ends_at, min_order_amount, coupon_code, coupon_flat_discount, free_item_name, free_item_min_amount)\n`;
  sql += `VALUES (1, true, 10, now() + interval '12 hours', 299, 'DIRECT50', 50, 'Free 250ml Cool Drink', 499)\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n`;

  return { itemsList, pricesList, sql };
}

// Generate and write file
const { itemsList, pricesList, sql } = generateMenuSeed();
const outputPath = path.resolve(rootDir, 'supabase_menu_seed.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated menu seed at: ${outputPath}`);
console.log(`- Canonical menu_items: ${itemsList.length}`);
console.log(`- Orderable menu_prices (SKUs): ${pricesList.length}`);
