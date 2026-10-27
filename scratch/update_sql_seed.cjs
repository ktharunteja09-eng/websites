const fs = require('fs');
const path = require('path');

const parsed = require('./parsed_menu_items.json');
const items = require('./all_284_menu_items.json');

const sqlPath = path.join(__dirname, '../supabase_setup.sql');
let sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Group items by category
const byCat = new Map();
parsed.categories.forEach(c => {
  byCat.set(c.slug, { label: `${c.num}. ${c.name}`, slug: c.slug, items: [] });
});

items.forEach(i => {
  const grp = byCat.get(i.category);
  if (grp) grp.items.push(i);
});

let sqlInserts = '';

for (const [slug, grp] of byCat.entries()) {
  if (grp.items.length === 0) continue;

  sqlInserts += `    -- Category ${grp.label} (${grp.items.length} items)\n`;
  sqlInserts += `    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES\n`;
  
  const itemRows = grp.items.map(item => {
    const aggPrice = Math.round((item.price * 1.2) / 10) * 10;
    const cleanName = item.name.replace(/'/g, "''");
    return `      ('${cleanName}', '${item.category}', ${item.price}, ${aggPrice}, ${item.isVeg}, ${item.directOrderEligible}, false, current_date)`;
  });

  sqlInserts += itemRows.join(',\n') + ';\n\n';
}

const seedBlock = `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN

${sqlInserts}  END IF;
END $$;`;

// Replace in supabase_setup.sql
const startMarker = 'DO $$';
const endMarker = '-- =====================================================================\n-- 4. ENABLE ROW LEVEL SECURITY';

const startIndex = sqlContent.indexOf(startMarker);
const endIndex = sqlContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found in supabase_setup.sql:', { startIndex, endIndex });
  process.exit(1);
}

sqlContent = sqlContent.slice(0, startIndex) + seedBlock + '\n\n' + sqlContent.slice(endIndex);
fs.writeFileSync(sqlPath, sqlContent, 'utf8');

// Also save standalone seed script for easy one-click execution
fs.writeFileSync(path.join(__dirname, 'seed_menu_items.sql'), `-- Reset and re-seed all 284 menu items with dine-in prices
DELETE FROM menu_items;
${sqlInserts}
SELECT COUNT(*) AS total_dishes_inserted FROM menu_items;
`);

console.log('Successfully updated supabase_setup.sql and created scratch/seed_menu_items.sql!');
