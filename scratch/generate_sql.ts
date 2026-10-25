import fs from 'fs';
import { MENU_ITEMS } from '../src/data/restaurantData';

function calcAggregatorPrice(price: number): number {
  return Math.round((price * 1.2) / 10) * 10;
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// Full array of existing dishes
const existingItems = [...MENU_ITEMS];
const existingNames = new Set(existingItems.map(i => i.name.toLowerCase().trim()));

// Include specialty dishes from photoMenu/signatureDishes if not already in MENU_ITEMS
const extraDishes = [
  {
    name: 'Rayalaseema Chicken Fry',
    category: 'starters',
    price: 370,
    isVeg: false
  },
  {
    name: 'Paneer Tikka Fry',
    category: 'starters',
    price: 300,
    isVeg: true
  }
];

extraDishes.forEach(extra => {
  if (!existingNames.has(extra.name.toLowerCase().trim())) {
    existingItems.push({
      id: extra.name.toLowerCase().replace(/\s+/g, '-'),
      name: extra.name,
      category: extra.category as any,
      price: extra.price,
      description: 'Authentic house specialty prepared fresh with premium ingredients.',
      isVeg: extra.isVeg
    });
    existingNames.add(extra.name.toLowerCase().trim());
  }
});

console.log('Total dishes to insert:', existingItems.length);

const lines: string[] = [];

lines.push('-- =====================================================================');
lines.push('-- Supabase Setup Script for Vaibhav Grand Family Restaurant');
lines.push('-- Includes 3 Tables: menu_items, store_offers, orders');
lines.push('-- Automatically generated from existing Vite project menu data');
lines.push('-- Run this script directly in the Supabase SQL Editor');
lines.push('-- =====================================================================\n');

lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 1. TABLE: menu_items');
lines.push('-- ---------------------------------------------------------------------');
lines.push('DROP TABLE IF EXISTS menu_items CASCADE;');
lines.push(`CREATE TABLE menu_items (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  aggregator_price numeric,
  is_veg boolean DEFAULT false,
  direct_order_eligible boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  last_reset_date date DEFAULT current_date
);\n`);

lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 2. TABLE: store_offers');
lines.push('-- ---------------------------------------------------------------------');
lines.push('DROP TABLE IF EXISTS store_offers CASCADE;');
lines.push(`CREATE TABLE store_offers (
  id int PRIMARY KEY DEFAULT 1,
  is_active boolean DEFAULT true,
  banner_text text DEFAULT '🔥 Order Direct: Flat 10% OFF above ₹299 + Free Drink above ₹499!',
  discount_percent numeric DEFAULT 10,
  min_order_amount numeric DEFAULT 299,
  free_item_name text DEFAULT 'Free 250ml Cool Drink',
  free_item_min_amount numeric DEFAULT 499,
  coupon_code text DEFAULT 'DIRECT50',
  coupon_flat_discount numeric DEFAULT 50,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '12 hours'),
  admin_pin text DEFAULT '1234'
);\n`);

lines.push('-- Insert default store offer row (id = 1)');
lines.push(`INSERT INTO store_offers (
  id,
  is_active,
  banner_text,
  discount_percent,
  min_order_amount,
  free_item_name,
  free_item_min_amount,
  coupon_code,
  coupon_flat_discount,
  starts_at,
  expires_at,
  admin_pin
) VALUES (
  1,
  true,
  '🔥 Order Direct: Flat 10% OFF above ₹299 + Free Drink above ₹499!',
  10,
  299,
  'Free 250ml Cool Drink',
  499,
  'DIRECT50',
  50,
  now(),
  now() + interval '12 hours',
  '1234'
) ON CONFLICT (id) DO NOTHING;\n`);

lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 3. TABLE: orders');
lines.push('-- ---------------------------------------------------------------------');
lines.push(`CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  order_code text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  order_type text NOT NULL,
  distance_km numeric,
  address_notes text,
  maps_link text,
  items_json text NOT NULL,
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  final_total numeric NOT NULL,
  payment_method text NOT NULL,
  status text DEFAULT 'Initiated',
  created_at timestamptz DEFAULT now()
);\n`);

lines.push('-- ---------------------------------------------------------------------');
lines.push('-- 4. INSERT MENU ITEMS');
lines.push('-- ---------------------------------------------------------------------');

const categories = [
  { id: 'mandi', label: 'Arabic Mandi Platters' },
  { id: 'biryani', label: 'Biryani Specialties' },
  { id: 'starters', label: 'Starters & Tandoor' },
  { id: 'curries', label: 'Curries & Gravies' },
  { id: 'rice-noodles', label: 'Fried Rice & Noodles' },
  { id: 'breads', label: 'Tandoori Breads (Minor Sides / Rotis)' },
  { id: 'beverages', label: 'Mojitos & Shakes' }
];

categories.forEach(cat => {
  const catItems = existingItems.filter(i => i.category === cat.id);
  if (catItems.length === 0) return;

  lines.push(`\n-- Category: ${cat.label} (${catItems.length} items)`);
  lines.push('INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES');

  const valueRows = catItems.map(item => {
    const aggPrice = calcAggregatorPrice(item.price);
    // Breads are minor sides/rotis -> false
    // Boiled egg is minor side -> false
    const isDirect = item.category !== 'breads' && !item.name.toLowerCase().includes('boiled egg');
    return `  ('${escapeSql(item.name)}', '${escapeSql(item.category)}', ${item.price}, ${aggPrice}, ${item.isVeg}, ${isDirect}, false, current_date)`;
  });

  lines.push(valueRows.join(',\n') + ';');
});

lines.push('\n-- ---------------------------------------------------------------------');
lines.push('-- 5. DISABLE ROW LEVEL SECURITY (RLS)');
lines.push('-- ---------------------------------------------------------------------');
lines.push('ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;');
lines.push('ALTER TABLE store_offers DISABLE ROW LEVEL SECURITY;');
lines.push('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;\n');

lines.push('-- Verification queries:');
lines.push('-- SELECT category, count(*), min(price), max(price) FROM menu_items GROUP BY category ORDER BY count(*) DESC;');
lines.push('-- SELECT count(*) AS total_dishes FROM menu_items;');
lines.push('-- SELECT * FROM store_offers WHERE id = 1;');

const finalSql = lines.join('\n');
fs.writeFileSync('supabase_setup.sql', finalSql, 'utf8');
console.log('Successfully wrote supabase_setup.sql! Total dishes:', existingItems.length, 'File size:', finalSql.length, 'bytes');
