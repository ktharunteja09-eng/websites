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

function checkMenuSync() {
  const seedPath = path.resolve(rootDir, 'supabase_menu_seed.sql');
  if (!fs.existsSync(seedPath)) {
    console.error('ERROR: supabase_menu_seed.sql does not exist. Run "node scripts/generate-menu-seed.mjs" to generate it.');
    process.exit(1);
  }

  const seedContent = fs.readFileSync(seedPath, 'utf8');

  // Extract all SKUs present in seed SQL
  const seedSkus = new Set();
  const skuRegex = /INSERT INTO menu_prices[\s\S]*?VALUES([\s\S]*?);/g;
  let match;
  while ((match = skuRegex.exec(seedContent)) !== null) {
    const valuesBlock = match[1];
    const rowRegex = /\(\s*'([^']+)'/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      seedSkus.add(rowMatch[1]);
    }
  }

  const menuItems = loadTsArray(path.join(rootDir, 'src/data/restaurantData.ts'), 'MENU_ITEMS');
  const photoPath = path.join(rootDir, 'src/data/photoMenuData.ts');
  const photoItems = fs.existsSync(photoPath) ? loadTsArray(photoPath, 'PHOTO_MENU_ITEMS') : [];

  const missingSkus = [];

  // Check all catalog items
  for (const item of menuItems) {
    const itemId = String(item.id).trim();
    if (!seedSkus.has(itemId)) {
      missingSkus.push(itemId);
    }
    const { size } = extractSizeFromDish(item.name, item.portionNote);
    if (size) {
      const normalizedSize = size.toLowerCase().replace(/\s+/g, '');
      const variantSku = `${itemId}:${normalizedSize}`;
      if (!seedSkus.has(variantSku)) {
        missingSkus.push(variantSku);
      }
    }
  }

  // Check all photo menu items
  for (const photoItem of photoItems) {
    const photoId = String(photoItem.id).trim();
    if (!seedSkus.has(photoId)) {
      missingSkus.push(photoId);
    }
    const { size } = extractSizeFromDish(photoItem.name, photoItem.portionNote);
    if (size) {
      const normalizedSize = size.toLowerCase().replace(/\s+/g, '');
      const variantSku = `${photoId}:${normalizedSize}`;
      if (!seedSkus.has(variantSku)) {
        missingSkus.push(variantSku);
      }
    }
  }

  if (missingSkus.length > 0) {
    console.error(`ERROR: Menu sync check failed! ${missingSkus.length} static SKUs are missing from supabase_menu_seed.sql:`);
    console.error(missingSkus.slice(0, 10).join(', ') + (missingSkus.length > 10 ? ` ...and ${missingSkus.length - 10} more` : ''));
    console.error('Run "node scripts/generate-menu-seed.mjs" to synchronize the seed SQL.');
    process.exit(1);
  }

  console.log(`SUCCESS: Menu sync check passed. All static menu SKUs are present in supabase_menu_seed.sql (${seedSkus.size} total SKUs verified).`);
  process.exit(0);
}

checkMenuSync();
