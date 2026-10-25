-- =====================================================================
-- Supabase Setup Script for Vaibhav Grand Family Restaurant
-- Includes:
-- 1. Tables: menu_items, store_offers, orders, admin_secrets
-- 2. Row Level Security (RLS) policies for complete public lockdown
-- 3. Server-side SECURITY DEFINER RPC functions verified by admin PIN
-- Run this entire script directly in the Supabase SQL Editor.
-- =====================================================================

-- =====================================================================
-- 1. ENSURE TABLES EXIST & FIX ORDER INSERT BUGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  aggregator_price numeric,
  is_veg boolean DEFAULT false,
  direct_order_eligible boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  last_reset_date date DEFAULT current_date
);

CREATE TABLE IF NOT EXISTS store_settings (
  id int PRIMARY KEY DEFAULT 1,
  opens_at time NOT NULL DEFAULT '10:30',
  closes_at time NOT NULL DEFAULT '23:00',
  last_order_buffer_minutes int NOT NULL DEFAULT 30,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata'
);

INSERT INTO store_settings (id, opens_at, closes_at, last_order_buffer_minutes, timezone)
VALUES (1, '10:30', '23:00', 30, 'Asia/Kolkata')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS store_offers (
  id int PRIMARY KEY DEFAULT 1,
  is_active boolean DEFAULT true,
  banner_text text DEFAULT 'Order Direct: Flat 10% OFF above ₹299 + Free Drink above ₹499!',
  discount_percent numeric DEFAULT 10,
  min_order_amount numeric DEFAULT 299,
  free_item_name text DEFAULT 'Free 250ml Cool Drink',
  free_item_min_amount numeric DEFAULT 499,
  coupon_code text DEFAULT 'DIRECT50',
  coupon_flat_discount numeric DEFAULT 50,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '12 hours')
);

INSERT INTO store_offers (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Recreate/fix orders table so no column mismatch ever blocks an order
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  order_code text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  order_type text DEFAULT 'DELIVERY_5KM',
  distance_km numeric DEFAULT 0,
  address_notes text DEFAULT '',
  maps_link text DEFAULT '',
  items_json text NOT NULL,
  subtotal numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  final_total numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'COD')),
  status text DEFAULT 'Initiated',
  utr text,
  utr_submitted_at timestamptz,
  idempotency_key text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'utr_submitted', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Idempotent column migrations for existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_submitted_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'UPI';

-- Normalize legacy or null payment_method rows
UPDATE orders SET payment_method = 'UPI' WHERE payment_method IS NULL OR payment_method NOT IN ('UPI', 'COD');

ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;
ALTER TABLE orders ALTER COLUMN payment_method SET DEFAULT 'UPI';

-- Idempotent constraint verification for payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'utr_submitted', 'confirmed', 'rejected'));
  END IF;
END $$;

-- Idempotent constraint verification for payment_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IN ('UPI', 'COD'));
  END IF;
END $$;

-- Unique partial indexes (prevent duplicate idempotency keys and duplicate UTR references)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_utr_unique ON orders(utr) WHERE utr IS NOT NULL;

-- =====================================================================
-- BACKFILL NOTICE (DO NOT RUN AUTOMATICALLY ON RE-RUN):
-- When adding payment_status, existing rows default to 'pending'.
-- For historical orders placed before this hardening migration, run this one-time backfill:
--   UPDATE orders SET payment_status = 'confirmed' WHERE created_at < '<MIGRATION_TIMESTAMP>' AND utr IS NULL;
-- This statement is intentionally NOT executed in this re-runnable setup script so
-- re-running this script in production will never mark real unpaid orders as confirmed.
-- Use the standalone migration block for the initial one-time backfill.
-- =====================================================================

-- =====================================================================
-- 2. PRIVATE ADMIN CREDENTIALS TABLE (HIDDEN FROM BROWSERS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS admin_secrets (
  id int PRIMARY KEY DEFAULT 1,
  passcode text NOT NULL DEFAULT '1234' -- Default Admin PIN/Password
);

INSERT INTO admin_secrets (id, passcode) VALUES (1, '1234') ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 3. SEED MENU ITEMS (If table is empty)
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN

    -- Category 1. VEG. SOUPS (7 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Mushroom Corn Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Sweet Corn Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Veg. Hot & Sour Soup', 'veg-soups', 140, 170, true, true, false, current_date),
      ('Veg. Manchow Soup', 'veg-soups', 150, 180, true, true, false, current_date),
      ('Cream of Mushroom Soup', 'veg-soups', 190, 230, true, true, false, current_date),
      ('Lemon Coriander Soup', 'veg-soups', 190, 230, true, true, false, current_date),
      ('Tomato Soup', 'veg-soups', 140, 170, true, true, false, current_date);

    -- Category 2. NON-VEG. SOUPS (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Hot & Sour Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Manchow Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Corn Soup', 'non-veg-soups', 140, 170, false, true, false, current_date),
      ('Chicken Coriander Soup', 'non-veg-soups', 150, 180, false, true, false, current_date),
      ('Mutton Bone Soup', 'non-veg-soups', 190, 230, false, true, false, current_date),
      ('Mutton Pepper Soup', 'non-veg-soups', 190, 230, false, true, false, current_date);

    -- Category 3. VAIBHAV SPECIAL STARTERS (8 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Andhra Karivepaku Mutton', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Andhra Karivepaku Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Butterfly Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Garlic Chicken Keema Balls', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Dragon Crispy Chicken', 'vaibhav-special-starters', 399, 480, false, true, false, current_date),
      ('Arabian Prawns', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Arabian Fish', 'vaibhav-special-starters', 499, 600, false, true, false, current_date),
      ('Vaibhav''s Non-Veg. Platter', 'vaibhav-special-starters', 999, 1200, false, true, false, current_date);

    -- Category 4. VAIBHAV'S NATTU SPECIALS (9 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chitti Muthyalu Mutton Biryani', 'nattu-specials', 420, 500, false, true, false, current_date),
      ('Chitti Muthyalu Chicken Biryani', 'nattu-specials', 270, 320, false, true, false, current_date),
      ('Rayalaseema Chicken Curry with Ragi Sangati', 'nattu-specials', 350, 420, false, true, false, current_date),
      ('Mutton Paya with Ragi Sangati', 'nattu-specials', 400, 480, false, true, false, current_date),
      ('Chepala Pulusu with Ragi Sangati', 'nattu-specials', 280, 340, false, true, false, current_date),
      ('Mutton Pulusu with Ragi Sangati', 'nattu-specials', 420, 500, false, true, false, current_date),
      ('Special Curd Rice', 'nattu-specials', 120, 140, true, true, false, current_date),
      ('White Rice', 'nattu-specials', 100, 120, true, true, false, current_date),
      ('Raagi Ball', 'nattu-specials', 50, 60, true, true, false, current_date);

    -- Category 5. CHICKEN STARTERS (16 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chilli Chicken', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Vaibhav''s Special Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Pepper Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Chicken Majestic', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Chicken 65', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Chicken Lollipop', 'chicken-starters', 300, 360, false, true, false, current_date),
      ('Chicken Drumstick', 'chicken-starters', 310, 370, false, true, false, current_date),
      ('Chicken Wings', 'chicken-starters', 300, 360, false, true, false, current_date),
      ('Cashew Nut Chicken', 'chicken-starters', 360, 430, false, true, false, current_date),
      ('Chicken Fry', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Chicken Roast', 'chicken-starters', 280, 340, false, true, false, current_date),
      ('Hong Kong Chicken', 'chicken-starters', 340, 410, false, true, false, current_date),
      ('Dragon Chicken', 'chicken-starters', 320, 380, false, true, false, current_date),
      ('Schezwan Hong Kong Chicken', 'chicken-starters', 360, 430, false, true, false, current_date),
      ('Rambo Chicken', 'chicken-starters', 340, 410, false, true, false, current_date),
      ('Chicken Manchurian', 'chicken-starters', 320, 380, false, true, false, current_date);

    -- Category 6. MUTTON STARTERS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Kaju Mutton Roast', 'mutton-starters', 450, 540, false, true, false, current_date),
      ('Mutton Ghee Roast', 'mutton-starters', 420, 500, false, true, false, current_date),
      ('Kaju Mutton Ghee Roast', 'mutton-starters', 460, 550, false, true, false, current_date),
      ('Mutton Fry', 'mutton-starters', 380, 460, false, true, false, current_date);

    -- Category 7. FISH STARTERS (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Fish Finger', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Pepper Fish', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Chilli Fish', 'fish-starters', 320, 380, false, true, false, current_date),
      ('Apollo Fish', 'fish-starters', 330, 400, false, true, false, current_date),
      ('Fish 65', 'fish-starters', 330, 400, false, true, false, current_date);

    -- Category 8. PRAWNS STARTERS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Loose Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Chilli Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Pepper Prawns', 'prawns-starters', 350, 420, false, true, false, current_date),
      ('Prawns 65', 'prawns-starters', 350, 420, false, true, false, current_date);

    -- Category 9. EGG STARTERS (7 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Egg Chilly', 'egg-starters', 180, 220, false, true, false, current_date),
      ('Egg 65', 'egg-starters', 180, 220, false, true, false, current_date),
      ('Omelette', 'egg-starters', 80, 100, false, true, false, current_date),
      ('Special Omelette', 'egg-starters', 100, 120, false, true, false, current_date),
      ('Egg Manchurian', 'egg-starters', 200, 240, false, true, false, current_date),
      ('Boiled Egg', 'egg-starters', 20, 20, false, false, false, current_date),
      ('Dragon Egg', 'egg-starters', 200, 240, false, true, false, current_date);

    -- Category 10. VEG. STARTERS (21 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Manchurian', 'veg-starters', 260, 310, true, true, false, current_date),
      ('Veg. 65', 'veg-starters', 270, 320, true, true, false, current_date),
      ('Baby Corn 65', 'veg-starters', 270, 320, true, true, false, current_date),
      ('Baby Corn Chilly', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Crispy Baby Corn', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Baby Corn 555', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Crispy Corn', 'veg-starters', 260, 310, true, true, false, current_date),
      ('Paneer Manchurian', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Paneer 65', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Chilli Paneer', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Paneer Majestic', 'veg-starters', 290, 350, true, true, false, current_date),
      ('Paneer Pakoda', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Gobi Manchuria', 'veg-starters', 220, 260, true, true, false, current_date),
      ('Gobi 65', 'veg-starters', 200, 240, true, true, false, current_date),
      ('Chilli Gobi', 'veg-starters', 180, 220, true, true, false, current_date),
      ('Mushroom Manchurian', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom 65', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom Chilli', 'veg-starters', 280, 340, true, true, false, current_date),
      ('Mushroom Pepper', 'veg-starters', 300, 360, true, true, false, current_date),
      ('Veg. Platter', 'veg-starters', 570, 680, true, true, false, current_date),
      ('French Fries', 'veg-starters', 200, 240, true, true, false, current_date);

    -- Category 11. TANDOORI FUSION (16 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Tandoori Chicken Half', 'tandoori-fusion', 280, 340, false, true, false, current_date),
      ('Tandoori Chicken Full', 'tandoori-fusion', 500, 600, false, true, false, current_date),
      ('Tangdi Kabab Half (2 Pcs.)', 'tandoori-fusion', 190, 230, false, true, false, current_date),
      ('Tangdi Kabab Full (4 Pcs.)', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Grill Chicken Half', 'tandoori-fusion', 260, 310, false, true, false, current_date),
      ('Grill Chicken Full', 'tandoori-fusion', 500, 600, false, true, false, current_date),
      ('Alfaham Chicken Half', 'tandoori-fusion', 280, 340, false, true, false, current_date),
      ('Alfaham Chicken Full', 'tandoori-fusion', 520, 620, false, true, false, current_date),
      ('Chicken Tikka', 'tandoori-fusion', 360, 430, false, true, false, current_date),
      ('Malai Chicken Tikka', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Garlic Chicken Kabab', 'tandoori-fusion', 380, 460, false, true, false, current_date),
      ('Chicken Seekh Kabab', 'tandoori-fusion', 390, 470, false, true, false, current_date),
      ('Garlic Chicken Kabab', 'tandoori-fusion', 390, 470, false, true, false, current_date),
      ('Tiger Prawns Tikka (Sunday)', 'tandoori-fusion', 499, 600, false, true, false, current_date),
      ('Paneer Tikka', 'tandoori-fusion', 340, 410, true, true, false, current_date),
      ('Veg. Seekh Kabab', 'tandoori-fusion', 320, 380, true, true, false, current_date);

    -- Category 12. SHAWARMAS (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Shawarma', 'shawarmas', 100, 120, false, true, false, current_date),
      ('Special Shawarma', 'shawarmas', 140, 170, false, true, false, current_date),
      ('Butter Shawarma', 'shawarmas', 130, 160, false, true, false, current_date),
      ('Special Butter Shawarma', 'shawarmas', 160, 190, false, true, false, current_date),
      ('Kaju Shawarma', 'shawarmas', 200, 240, false, true, false, current_date),
      ('Plate Shawarma', 'shawarmas', 170, 200, false, true, false, current_date);

    -- Category 13. BIRIYANIS (20 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Dum Biryani', 'biriyanis', 230, 280, false, true, false, current_date),
      ('Mutton Dum Biryani', 'biriyanis', 400, 480, false, true, false, current_date),
      ('Chicken Fry Biryani', 'biriyanis', 280, 340, false, true, false, current_date),
      ('Mutton Fry Biryani', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Chicken Joint Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Chicken Kabab Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Lollipop Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Special Chicken Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Mughalai Chicken Biryani', 'biriyanis', 310, 370, false, true, false, current_date),
      ('Gongura Chicken Biryani', 'biriyanis', 320, 380, false, true, false, current_date),
      ('Chicken Tikka Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Alfaham Chicken Biryani', 'biriyanis', 330, 400, false, true, false, current_date),
      ('Tandoori Chicken Biryani', 'biriyanis', 300, 360, false, true, false, current_date),
      ('Grill Chicken Biryani', 'biriyanis', 300, 360, false, true, false, current_date),
      ('Fish Biryani', 'biriyanis', 340, 410, false, true, false, current_date),
      ('Prawns Biryani', 'biriyanis', 380, 460, false, true, false, current_date),
      ('Egg Biryani', 'biriyanis', 180, 220, false, true, false, current_date),
      ('Mixed Biryani (Non-Veg.)', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Rambo Chicken Biryani', 'biriyanis', 420, 500, false, true, false, current_date),
      ('Biryani Rice', 'biriyanis', 140, 170, false, true, false, current_date);

    -- Category 14. VEG. BIRYANI (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Biryani', 'veg-biryani', 220, 260, true, true, false, current_date),
      ('Kaju Biryani', 'veg-biryani', 260, 310, true, true, false, current_date),
      ('Kaju Paneer Biryani', 'veg-biryani', 300, 360, true, true, false, current_date),
      ('Paneer Biryani', 'veg-biryani', 280, 340, true, true, false, current_date),
      ('Mushroom Biryani', 'veg-biryani', 280, 340, true, true, false, current_date),
      ('Mixed Biryani (Veg.)', 'veg-biryani', 330, 400, true, true, false, current_date);

    -- Category 15. ARABIC MANDI (14 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Mandi (Single)', 'arabic-mandi', 300, 360, false, true, false, current_date),
      ('Tandoori Mandi (Single)', 'arabic-mandi', 320, 380, false, true, false, current_date),
      ('Chicken Mandi (Half)', 'arabic-mandi', 500, 600, false, true, false, current_date),
      ('Chicken Mandi (Full)', 'arabic-mandi', 980, 1180, false, true, false, current_date),
      ('Tandoori Chicken Mandi (Half)', 'arabic-mandi', 550, 660, false, true, false, current_date),
      ('Tandoori Chicken Mandi (Full)', 'arabic-mandi', 1000, 1200, false, true, false, current_date),
      ('Alfaham Chicken Mandi (Half)', 'arabic-mandi', 580, 700, false, true, false, current_date),
      ('Alfaham Chicken Mandi (Full)', 'arabic-mandi', 1050, 1260, false, true, false, current_date),
      ('Vaibhav Special Mandi (Half)', 'arabic-mandi', 1050, 1260, false, true, false, current_date),
      ('Vaibhav Special Mandi (Full)', 'arabic-mandi', 1990, 2390, false, true, false, current_date),
      ('Alfaham Juicy Mandi (Half)', 'arabic-mandi', 680, 820, false, true, false, current_date),
      ('Alfaham Juicy Mandi (Full)', 'arabic-mandi', 1290, 1550, false, true, false, current_date),
      ('Mutton Juicy Mandi (Half)', 'arabic-mandi', 990, 1190, false, true, false, current_date),
      ('Mutton Juicy Mandi (Full)', 'arabic-mandi', 1950, 2340, false, true, false, current_date);

    -- Category 16. NON-VEG. FRIED RICE (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Fried Rice', 'non-veg-fried-rice', 240, 290, false, true, false, current_date),
      ('Schezwan Chicken Fried Rice', 'non-veg-fried-rice', 260, 310, false, true, false, current_date),
      ('Prawns Fried Rice', 'non-veg-fried-rice', 320, 380, false, true, false, current_date),
      ('Egg Fried Rice', 'non-veg-fried-rice', 190, 230, false, true, false, current_date),
      ('Schezwan Egg Fried Rice', 'non-veg-fried-rice', 210, 250, false, true, false, current_date),
      ('Special Chicken Fried Rice', 'non-veg-fried-rice', 280, 340, false, true, false, current_date);

    -- Category 17. VEG. FRIED RICE (11 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Fried Rice', 'veg-fried-rice', 170, 200, true, true, false, current_date),
      ('Gobi Fried Rice', 'veg-fried-rice', 180, 220, true, true, false, current_date),
      ('Zeera Rice', 'veg-fried-rice', 180, 220, true, true, false, current_date),
      ('Ghee Rice', 'veg-fried-rice', 210, 250, true, true, false, current_date),
      ('Mushroom Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Paneer Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Kaju Fried Rice', 'veg-fried-rice', 280, 340, true, true, false, current_date),
      ('Schezwan Fried Rice', 'veg-fried-rice', 230, 280, true, true, false, current_date),
      ('Baby Corn Fried Rice', 'veg-fried-rice', 240, 290, true, true, false, current_date),
      ('Mixed Veg. Fried Rice', 'veg-fried-rice', 260, 310, true, true, false, current_date),
      ('Dalkichidi', 'veg-fried-rice', 220, 260, true, true, false, current_date);

    -- Category 18. NON-VEG. NOODLES (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Egg Noodles', 'non-veg-noodles', 220, 260, false, true, false, current_date),
      ('Schezwan Egg Noodles', 'non-veg-noodles', 240, 290, false, true, false, current_date),
      ('Chicken Noodles', 'non-veg-noodles', 260, 310, false, true, false, current_date),
      ('Chicken Schezwan Noodles', 'non-veg-noodles', 280, 340, false, true, false, current_date),
      ('Prawns Noodles', 'non-veg-noodles', 350, 420, false, true, false, current_date);

    -- Category 19. VEG. NOODLES (6 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Noodles', 'veg-noodles', 200, 240, true, true, false, current_date),
      ('Gobi Noodles', 'veg-noodles', 200, 240, true, true, false, current_date),
      ('Paneer Noodles', 'veg-noodles', 250, 300, true, true, false, current_date),
      ('Mushroom Noodles', 'veg-noodles', 250, 300, true, true, false, current_date),
      ('Manchurian Noodles', 'veg-noodles', 260, 310, true, true, false, current_date),
      ('Veg. Hakka Noodles', 'veg-noodles', 250, 300, true, true, false, current_date);

    -- Category 20. VEG. PULAVS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Veg. Pulav', 'veg-pulavs', 200, 240, true, true, false, current_date),
      ('Kaju Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date),
      ('Paneer Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date),
      ('Mushroom Pulav', 'veg-pulavs', 280, 340, true, true, false, current_date);

    -- Category 21. INDIAN BREADS (15 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Tandoori Roti', 'indian-breads', 30, 40, true, true, false, current_date),
      ('Butter Roti', 'indian-breads', 35, 40, true, true, false, current_date),
      ('Plain Naan', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Butter Naan', 'indian-breads', 65, 80, true, true, false, current_date),
      ('Garlic Naan', 'indian-breads', 70, 80, true, true, false, current_date),
      ('Rumali Roti', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Kulcha', 'indian-breads', 50, 60, true, true, false, current_date),
      ('Butter Kulcha', 'indian-breads', 55, 70, true, true, false, current_date),
      ('Onion Kulcha', 'indian-breads', 70, 80, true, true, false, current_date),
      ('Masala Kulcha', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Paneer Kulcha', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Aloo Parota', 'indian-breads', 90, 110, true, true, false, current_date),
      ('Parota', 'indian-breads', 50, 60, true, true, false, current_date),
      ('Plain Papad', 'indian-breads', 40, 50, true, false, false, current_date),
      ('Masala Papad', 'indian-breads', 80, 100, true, true, false, current_date);

    -- Category 22. VEG. CURRIES (26 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Kadai Veg.', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Mixed Veg. Curry', 'veg-curries', 240, 290, true, true, false, current_date),
      ('Veg. Mughlai Curry', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Veg. Kofta Curry', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Malai Kofta Curry', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Shahi Paneer', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Paneer Butter Masala', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Kadai Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Methi Chaman', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Kaju Paneer Masala', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Kaju Masala Curry', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Mutter Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Aloo Gobi', 'veg-curries', 180, 220, true, true, false, current_date),
      ('Aloo Mutter', 'veg-curries', 200, 240, true, true, false, current_date),
      ('Aloo Palak', 'veg-curries', 260, 310, true, true, false, current_date),
      ('Paneer Kheema Masala', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Palak Paneer', 'veg-curries', 270, 320, true, true, false, current_date),
      ('Plain Palak', 'veg-curries', 220, 260, true, true, false, current_date),
      ('Methi Paneer', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Paneer Tikka Masala', 'veg-curries', 290, 350, true, true, false, current_date),
      ('Dal Fry', 'veg-curries', 200, 240, true, true, false, current_date),
      ('Dal Tadka', 'veg-curries', 220, 260, true, true, false, current_date),
      ('Kadai Mushroom', 'veg-curries', 280, 340, true, true, false, current_date),
      ('Mushroom Masala', 'veg-curries', 250, 300, true, true, false, current_date),
      ('Baby Corn Masala', 'veg-curries', 260, 310, true, true, false, current_date),
      ('Paneer Makhani', 'veg-curries', 280, 340, true, true, false, current_date);

    -- Category 23. NON-VEG. CURRIES — CHICKEN (17 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Curry (Bone)', 'chicken-curries', 240, 290, false, true, false, current_date),
      ('Chicken Curry (Boneless)', 'chicken-curries', 290, 350, false, true, false, current_date),
      ('Andhra Chicken Curry (Spicy)', 'chicken-curries', 260, 310, false, true, false, current_date),
      ('Chicken Rayalaseema', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Special Chicken Curry', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Kadai Chicken', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Butter Chicken', 'chicken-curries', 280, 340, false, true, false, current_date),
      ('Chicken Murgh Masala', 'chicken-curries', 300, 360, false, true, false, current_date),
      ('Chicken Kheema Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Chicken Tikka Masala', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Wings Masala', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Chicken Mughalai Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Kaju Chicken Curry', 'chicken-curries', 350, 420, false, true, false, current_date),
      ('Methi Chicken (Bone)', 'chicken-curries', 290, 350, false, true, false, current_date),
      ('Methi Chicken (Boneless)', 'chicken-curries', 340, 410, false, true, false, current_date),
      ('Punjabi Chicken Curry', 'chicken-curries', 320, 380, false, true, false, current_date),
      ('Afgani Chicken (Rambha)', 'chicken-curries', 320, 380, false, true, false, current_date);

    -- Category 24. MUTTON CURRY (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Palak Mutton', 'mutton-curry', 350, 420, false, true, false, current_date),
      ('Gongura Mutton', 'mutton-curry', 370, 440, false, true, false, current_date),
      ('Mutton Curry', 'mutton-curry', 360, 430, false, true, false, current_date),
      ('Kaju Mutton Curry', 'mutton-curry', 450, 540, false, true, false, current_date),
      ('Methi Mutton', 'mutton-curry', 350, 420, false, true, false, current_date);

    -- Category 25. MILKSHAKES (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Vanilla Milkshake', 'milkshakes', 130, 160, true, true, false, current_date),
      ('Butterscotch Milkshake', 'milkshakes', 140, 170, true, true, false, current_date),
      ('Chocolate Milkshake', 'milkshakes', 140, 170, true, true, false, current_date),
      ('Oreo Milkshake', 'milkshakes', 170, 200, true, true, false, current_date),
      ('KitKat Milkshake', 'milkshakes', 170, 200, true, true, false, current_date);

    -- Category 26. BEVERAGES (10 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Butter Milk', 'beverages', 50, 60, true, true, false, current_date),
      ('Sweet Lassi', 'beverages', 80, 100, true, true, false, current_date),
      ('Lassi', 'beverages', 80, 100, true, true, false, current_date),
      ('Lemon Soda Sweet & Salt', 'beverages', 80, 100, true, true, false, current_date),
      ('Lemon Juice', 'beverages', 70, 80, true, true, false, current_date),
      ('Water 1 litre', 'beverages', 20, 20, true, false, false, current_date),
      ('Thumbs Up 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Sprite 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Coco Cola 250 ml', 'beverages', 20, 20, true, true, false, current_date),
      ('Goli Soda', 'beverages', 30, 40, true, true, false, current_date);

    -- Category 27. MOCKTAILS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Blue Lagoon Mocktail', 'mocktails', 130, 160, true, true, false, current_date),
      ('Green Mint Mocktail', 'mocktails', 130, 160, true, true, false, current_date),
      ('Naughty Water Melon Mocktail', 'mocktails', 150, 180, true, true, false, current_date),
      ('Orange Mocktail', 'mocktails', 130, 160, true, true, false, current_date);

    -- Category 28. DESSERTS (4 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Gulab Jamun', 'desserts', 60, 70, true, true, false, current_date),
      ('Gulab Jamun with Ice Cream', 'desserts', 150, 180, true, true, false, current_date),
      ('Double Ka Meeta', 'desserts', 100, 120, true, true, false, current_date),
      ('Badham Kheer', 'desserts', 100, 120, true, true, false, current_date);

    -- Category 29. ICE CREAMS (5 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Vanilla', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Butterscotch', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Strawberry', 'ice-creams', 90, 110, true, true, false, current_date),
      ('Black Current', 'ice-creams', 120, 140, true, true, false, current_date),
      ('Chocolate', 'ice-creams', 110, 130, true, true, false, current_date);

    -- Category 30. BUCKET BIRYANI — PORTIONS ONLY (12 items)
    INSERT INTO menu_items (name, category, price, aggregator_price, is_veg, direct_order_eligible, is_completed, last_reset_date) VALUES
      ('Chicken Mandi Bucket Half', 'bucket-biryani', 550, 660, false, true, false, current_date),
      ('Chicken Mandi Bucket Full', 'bucket-biryani', 1000, 1200, false, true, false, current_date),
      ('Alfaham Mandi Bucket Half', 'bucket-biryani', 600, 720, false, true, false, current_date),
      ('Alfaham Mandi Bucket Full', 'bucket-biryani', 1100, 1320, false, true, false, current_date),
      ('Tandoori Chicken Mandi Bucket Half', 'bucket-biryani', 550, 660, false, true, false, current_date),
      ('Tandoori Chicken Mandi Bucket Full', 'bucket-biryani', 1000, 1200, false, true, false, current_date),
      ('Alfaham Juicy Mandi Bucket Half', 'bucket-biryani', 630, 760, false, true, false, current_date),
      ('Alfaham Juicy Mandi Bucket Full', 'bucket-biryani', 1290, 1550, false, true, false, current_date),
      ('Family Chicken Dum Biryani Half', 'bucket-biryani', 600, 720, false, true, false, current_date),
      ('Family Chicken Dum Biryani Full', 'bucket-biryani', 1100, 1320, false, true, false, current_date),
      ('Mutton Dum Biryani Half', 'bucket-biryani', 990, 1190, false, true, false, current_date),
      ('Mutton Dum Biryani Full', 'bucket-biryani', 1990, 2390, false, true, false, current_date);

  END IF;
END $$;

-- =====================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) TO LOCK DOWN DATA
-- =====================================================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_secrets ENABLE ROW LEVEL SECURITY;

-- Ensure columns exist for brute-force lock protection
ALTER TABLE admin_secrets ADD COLUMN IF NOT EXISTS failed_attempts int NOT NULL DEFAULT 0;
ALTER TABLE admin_secrets ADD COLUMN IF NOT EXISTS locked_until timestamptz DEFAULT NULL;

-- Drop old policies if re-running
DROP POLICY IF EXISTS "Public can read menu" ON menu_items;
DROP POLICY IF EXISTS "Public can read offers" ON store_offers;
DROP POLICY IF EXISTS "Customers can insert orders" ON orders;
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public read store_offers" ON store_offers;
DROP POLICY IF EXISTS "Public read store_settings" ON store_settings;
DROP POLICY IF EXISTS "Orders strict insert only" ON orders;

-- A. menu_items: Public read only (SELECT). Drop all public write/update/delete.
CREATE POLICY "Public read menu_items" ON menu_items
  FOR SELECT TO anon, authenticated USING (true);

-- B. store_offers: Public read only (SELECT). Drop all public write/update/delete.
CREATE POLICY "Public read store_offers" ON store_offers
  FOR SELECT TO anon, authenticated USING (true);

-- C. store_settings: Public read only (SELECT). Revoke direct modification.
CREATE POLICY "Public read store_settings" ON store_settings
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON store_settings FROM anon, authenticated, public;

-- D. admin_secrets: ZERO public policies. Revoke all access from anon and authenticated.
REVOKE ALL ON admin_secrets FROM anon, authenticated, public;

-- D. orders: Revoke direct SELECT, INSERT, UPDATE, DELETE from anon and authenticated.
-- Orders are completely unreadable and unwritable by direct table access.
-- All operations are performed exclusively through audited SECURITY DEFINER RPCs.
REVOKE ALL ON orders FROM anon;
REVOKE ALL ON orders FROM authenticated;
REVOKE ALL ON orders FROM public;

-- Drop all direct policies on orders (no direct access allowed)
DROP POLICY IF EXISTS "Orders strict insert only" ON orders;
DROP POLICY IF EXISTS "Customers can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;

-- Remove orders table from supabase_realtime publication to protect customer PII
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE orders;
  END IF;
END $$;

-- =====================================================================
-- 5. BRUTE-FORCE LOCKDOWN & PIN VERIFICATION HELPER
-- ===============================================================-- Centralized PIN Verification with Brute-Force Rate Limiting (Returns JSONB to prevent transaction rollback)
CREATE OR REPLACE FUNCTION check_and_verify_pin(input_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sec RECORD;
  v_new_attempts int;
  v_new_lock timestamptz;
BEGIN
  SELECT * INTO v_sec FROM admin_secrets WHERE id = 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'locked', false,
      'error', 'Admin secrets configuration not initialized.'
    );
  END IF;

  -- 1. Check if account is currently locked out
  IF v_sec.locked_until IS NOT NULL AND v_sec.locked_until > now() THEN
    RETURN jsonb_build_object(
      'ok', false,
      'locked', true,
      'locked_until', v_sec.locked_until,
      'error', 'Account locked due to too many failed attempts. Try again in 15 minutes.'
    );
  END IF;

  -- 2. If input_pin does NOT match passcode
  IF v_sec.passcode <> input_pin THEN
    v_new_attempts := COALESCE(v_sec.failed_attempts, 0) + 1;
    IF v_new_attempts >= 5 THEN
      v_new_lock := now() + interval '15 minutes';
      UPDATE admin_secrets
      SET failed_attempts = 0, locked_until = v_new_lock
      WHERE id = 1;

      PERFORM pg_sleep(1);

      RETURN jsonb_build_object(
        'ok', false,
        'locked', true,
        'locked_until', v_new_lock,
        'failed_attempts', 5,
        'error', 'Incorrect PIN. Account is now locked for 15 minutes.'
      );
    ELSE
      UPDATE admin_secrets
      SET failed_attempts = v_new_attempts, locked_until = NULL
      WHERE id = 1;

      PERFORM pg_sleep(1);

      RETURN jsonb_build_object(
        'ok', false,
        'locked', false,
        'failed_attempts', v_new_attempts,
        'error', 'Incorrect PIN.'
      );
    END IF;
  END IF;

  -- 3. If input_pin matches: reset lockouts and failed attempts
  IF COALESCE(v_sec.failed_attempts, 0) > 0 OR v_sec.locked_until IS NOT NULL THEN
    UPDATE admin_secrets
    SET failed_attempts = 0, locked_until = NULL
    WHERE id = 1;
  END IF;

  RETURN jsonb_build_object('ok', true, 'locked', false, 'error', NULL);
END;
$$;

-- A. Verify Admin PIN (Returns JSONB status without raising exception)
CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN check_and_verify_pin(input_pin);
END;
$$;

-- Drop old signatures to prevent return type mismatch or overload collision (42P13 / 42725)
DROP FUNCTION IF EXISTS admin_fetch_orders(text);
DROP FUNCTION IF EXISTS admin_fetch_orders(text, int);
DROP FUNCTION IF EXISTS admin_fetch_orders(text, integer);
DROP FUNCTION IF EXISTS admin_get_orders(text);
DROP FUNCTION IF EXISTS admin_get_orders(text, int);
DROP FUNCTION IF EXISTS admin_get_orders(text, integer);

-- B. Fetch All Orders for Admin with optional limit (Returns full orders row including payment_method, utr, payment_status)
CREATE OR REPLACE FUNCTION admin_get_orders(input_pin text, p_limit int DEFAULT 200)
RETURNS setof orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth jsonb;
  v_max_rows int;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'Unauthorized: %', COALESCE(v_auth->>'error', 'Invalid PIN');
  END IF;

  v_max_rows := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);

  RETURN query
    SELECT *
    FROM orders
    ORDER BY created_at DESC
    LIMIT v_max_rows;
END;
$$;

CREATE OR REPLACE FUNCTION admin_fetch_orders(input_pin text, p_limit int DEFAULT 200)
RETURNS setof orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN query SELECT * FROM admin_get_orders(input_pin, p_limit);
END;
$$;

-- Drop previous signatures of admin_update_payment_status
DROP FUNCTION IF EXISTS admin_update_payment_status(text, int, text);
DROP FUNCTION IF EXISTS admin_update_payment_status(text, integer, text);

-- C. Update Payment Status (Owner confirms or rejects payment after bank/soundbox verification)
CREATE OR REPLACE FUNCTION admin_update_payment_status(
  input_pin text,
  p_order_id int,
  p_payment_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth jsonb;
  v_status text;
BEGIN
  -- 1. Check PIN first (returns generic error on wrong PIN)
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Unauthorized');
  END IF;

  -- 2. Validate payment status: accepts only 'confirmed' or 'rejected'
  v_status := lower(trim(COALESCE(p_payment_status, '')));
  IF v_status NOT IN ('confirmed', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid status. Only confirmed or rejected are allowed.');
  END IF;

  -- 3. Update payment_status on order
  UPDATE orders
  SET payment_status = v_status
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', v_status);
END;
$$;

-- C. Update Order Status (Returns boolean without raising exception)
CREATE OR REPLACE FUNCTION admin_update_order_status(input_pin text, target_order_id int, new_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  UPDATE orders SET status = new_status WHERE id = target_order_id;
  RETURN true;
END;
$$;

-- D. Toggle Menu Item Stock, 5km Delivery Eligibility, & Live Direct/Aggregator Price Editing

-- Drop previous signatures to prevent conflicts or ambiguities
DROP FUNCTION IF EXISTS admin_update_menu_item(text, int, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, integer, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, text, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, int, boolean, boolean, numeric, numeric);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, integer, boolean, boolean, numeric, numeric);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, text, boolean, boolean, numeric, numeric);

-- Primary 6-parameter implementation (int item_id)
CREATE OR REPLACE FUNCTION admin_update_menu_item(
  input_pin text,
  item_id int,
  completed_val boolean,
  eligible_val boolean,
  new_price numeric,
  new_aggregator_price numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth jsonb;
  v_cur_price numeric;
  v_val_price numeric;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- Verify item exists and get current price
  SELECT price INTO v_cur_price FROM menu_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Validate Direct Price bounds: > 0 and <= 10000
  IF new_price IS NOT NULL THEN
    IF new_price <= 0 OR new_price > 10000 THEN
      RAISE EXCEPTION 'Price must be greater than 0 and up to 10,000.';
    END IF;
    v_val_price := new_price;
  ELSE
    v_val_price := v_cur_price;
  END IF;

  -- Validate Aggregator Price bounds: >= Direct Price and <= 15000
  IF new_aggregator_price IS NOT NULL THEN
    IF new_aggregator_price < v_val_price OR new_aggregator_price > 15000 THEN
      RAISE EXCEPTION 'Aggregator price must be at least the direct price and up to 15,000.';
    END IF;
  END IF;

  UPDATE menu_items
  SET
    is_completed = completed_val,
    direct_order_eligible = eligible_val,
    price = COALESCE(new_price, price),
    aggregator_price = COALESCE(new_aggregator_price, aggregator_price),
    last_reset_date = current_date
  WHERE id = item_id;

  RETURN true;
END;
$$;

-- 6-parameter overload (text item_id)
CREATE OR REPLACE FUNCTION admin_update_menu_item(
  input_pin text,
  item_id text,
  completed_val boolean,
  eligible_val boolean,
  new_price numeric,
  new_aggregator_price numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN admin_update_menu_item(input_pin, item_id::int, completed_val, eligible_val, new_price, new_aggregator_price);
END;
$$;

-- 4-parameter backward-compatible overload (int item_id)
CREATE OR REPLACE FUNCTION admin_update_menu_item(
  input_pin text,
  item_id int,
  completed_val boolean,
  eligible_val boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN admin_update_menu_item(input_pin, item_id, completed_val, eligible_val, NULL::numeric, NULL::numeric);
END;
$$;

-- 4-parameter backward-compatible overload (text item_id)
CREATE OR REPLACE FUNCTION admin_update_menu_item(
  input_pin text,
  item_id text,
  completed_val boolean,
  eligible_val boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN admin_update_menu_item(input_pin, item_id::int, completed_val, eligible_val, NULL::numeric, NULL::numeric);
END;
$$;

-- E. Morning Reset All Items to Available
CREATE OR REPLACE FUNCTION admin_reset_all_stock(input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  UPDATE menu_items SET is_completed = false, last_reset_date = current_date;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION admin_morning_reset(input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN admin_reset_all_stock(input_pin);
END;
$$;

-- F. Update Flash Offers & Timer
CREATE OR REPLACE FUNCTION admin_update_offers(
  input_pin text, active_val boolean, banner_val text, disc_val numeric,
  min_amt numeric, free_item text, free_min numeric, code_val text, flat_val numeric, exp_val timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  UPDATE store_offers SET
    is_active = active_val, banner_text = banner_val, discount_percent = disc_val,
    min_order_amount = min_amt, free_item_name = free_item, free_item_min_amount = free_min,
    coupon_code = code_val, coupon_flat_discount = flat_val, expires_at = exp_val
  WHERE id = 1;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_store_offer(
  input_pin text, active_val boolean, banner_val text, disc_val numeric,
  min_amt numeric, free_item text, free_min numeric, code_val text, flat_val numeric, exp_val timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN admin_update_offers(
    input_pin, active_val, banner_val, disc_val,
    min_amt, free_item, free_min, code_val, flat_val, exp_val
  );
END;
$$;

-- G. Change Admin PIN securely
CREATE OR REPLACE FUNCTION admin_change_pin(input_pin text, new_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', v_auth->>'error');
  END IF;

  IF length(trim(new_pin)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'error', 'PIN must be at least 4 characters long.');
  END IF;

  UPDATE admin_secrets SET passcode = trim(new_pin) WHERE id = 1;
  RETURN jsonb_build_object('success', true, 'error', NULL);
END;
$$;

-- =====================================================================
-- 6. AUTHORITATIVE SERVER-SIDE ORDER & PRICE VERIFICATION RPC
-- =====================================================================

-- Drop previous signatures of get_order_availability
DROP FUNCTION IF EXISTS get_order_availability();

-- Read-only Public RPC to inspect store operating hours authoritatively computed on server
CREATE OR REPLACE FUNCTION get_order_availability()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_opens_at time := '10:30'::time;
  v_closes_at time := '23:00'::time;
  v_buffer_mins int := 30;
  v_last_order_at time;
  v_now_time time;
  v_is_open boolean;
  v_status text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'store_settings') THEN
    SELECT opens_at, closes_at, last_order_buffer_minutes
    INTO v_opens_at, v_closes_at, v_buffer_mins
    FROM store_settings WHERE id = 1;
  END IF;

  v_last_order_at := (v_closes_at - (v_buffer_mins || ' minutes')::interval)::time;
  v_now_time := (now() AT TIME ZONE 'Asia/Kolkata')::time;

  IF v_now_time >= v_opens_at AND v_now_time < v_last_order_at THEN
    v_is_open := true;
    v_status := 'open';
  ELSIF v_now_time >= v_last_order_at AND v_now_time < v_closes_at THEN
    v_is_open := false;
    v_status := 'closed_last_order';
  ELSE
    v_is_open := false;
    v_status := 'closed';
  END IF;

  RETURN jsonb_build_object(
    'open', v_is_open,
    'status', v_status,
    'opens_at', to_char(v_opens_at, 'HH24:MI'),
    'closes_at', to_char(v_closes_at, 'HH24:MI'),
    'last_order_at', to_char(v_last_order_at, 'HH24:MI')
  );
END;
$$;

-- Drop previous signatures of submit_verified_order to prevent PostgreSQL 42725 ambiguity
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text);
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text);

CREATE OR REPLACE FUNCTION submit_verified_order(
  p_customer_name text,
  p_customer_phone text,
  p_order_type text,
  p_distance_km numeric,
  p_items_json jsonb,
  p_coupon_code text DEFAULT NULL,
  p_address_notes text DEFAULT '',
  p_maps_link text DEFAULT '',
  p_payment_method text DEFAULT 'UPI',
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_opens_at time;
  v_closes_at time;
  v_buffer_mins int;
  v_last_order_at time;
  v_now_time time;
  v_norm_payment_method text;
  v_unavailable_items text[] := ARRAY[]::text[];
  v_base_id_text text;
  v_norm_name text;
  v_norm_phone text;
  v_norm_type text;
  v_norm_address text;
  v_norm_idempotency_key text;
  v_is_delivery boolean;
  v_item record;
  v_db_item record;
  v_item_name text;
  v_item_qty int;
  v_unit_price numeric;
  v_calculated_subtotal numeric := 0;
  v_items_formatted_text text := '';
  v_offer record;
  v_offer_discount numeric := 0;
  v_coupon_discount numeric := 0;
  v_total_discount numeric := 0;
  v_final_total numeric := 0;
  v_free_item_name text := NULL;
  v_order_code text;
  v_inserted_id int;
  v_item_index int := 0;
  -- Return variables for idempotency conflict resolution
  v_ret_order_code text;
  v_ret_subtotal numeric;
  v_ret_discount_amount numeric;
  v_ret_final_total numeric;
  v_ret_payment_status text;
  v_ret_items_json text;
BEGIN
  -- 0. Check Operating Hours on Server (Asia/Kolkata)
  v_opens_at := '10:30'::time;
  v_closes_at := '23:00'::time;
  v_buffer_mins := 30;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'store_settings') THEN
    SELECT opens_at, closes_at, last_order_buffer_minutes
    INTO v_opens_at, v_closes_at, v_buffer_mins
    FROM store_settings WHERE id = 1;
  END IF;

  v_last_order_at := (v_closes_at - (v_buffer_mins || ' minutes')::interval)::time;
  v_now_time := (now() AT TIME ZONE 'Asia/Kolkata')::time;

  IF v_now_time < v_opens_at OR v_now_time >= v_closes_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'closed',
      'opens_at', to_char(v_opens_at, 'HH24:MI'),
      'closes_at', to_char(v_closes_at, 'HH24:MI')
    );
  END IF;

  IF v_now_time >= v_last_order_at AND v_now_time < v_closes_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'closed_last_order',
      'opens_at', to_char(v_opens_at, 'HH24:MI'),
      'closes_at', to_char(v_closes_at, 'HH24:MI'),
      'last_order_at', to_char(v_last_order_at, 'HH24:MI')
    );
  END IF;

  -- 1. Validate payment method (accepts only 'UPI' or 'COD', default 'UPI')
  v_norm_payment_method := UPPER(TRIM(COALESCE(p_payment_method, 'UPI')));
  IF v_norm_payment_method NOT IN ('UPI', 'COD') THEN
    RAISE EXCEPTION 'Invalid payment method. Only UPI and COD are accepted.';
  END IF;

  -- 2. Validate customer name
  v_norm_name := trim(p_customer_name);
  IF length(v_norm_name) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
  END IF;

  -- 3. Validate Indian phone number (10 digits)
  v_norm_phone := regexp_replace(p_customer_phone, '\D', '', 'g');
  IF length(v_norm_phone) = 12 AND v_norm_phone LIKE '91%' THEN
    v_norm_phone := substring(v_norm_phone from 3);
  END IF;
  IF v_norm_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit Indian mobile number.';
  END IF;

  -- 4. Validate order type and delivery bounds
  v_norm_type := UPPER(TRIM(p_order_type));
  IF v_norm_type IN ('DELIVERY', 'DELIVERY_5KM') THEN
    v_is_delivery := true;
    v_norm_type := 'DELIVERY_5KM';
    IF p_distance_km IS NULL OR p_distance_km <= 0 OR p_distance_km > 5.0 THEN
      RAISE EXCEPTION 'Direct delivery is strictly limited to addresses within 5.0 km road distance.';
    END IF;
    v_norm_address := trim(p_address_notes);
    IF length(v_norm_address) < 5 THEN
      RAISE EXCEPTION 'Please enter a complete delivery address or landmark.';
    END IF;
  ELSE
    v_is_delivery := false;
    v_norm_type := 'TAKEAWAY';
    v_norm_address := COALESCE(NULLIF(trim(p_address_notes), ''), 'Self-Pickup at Restaurant');
  END IF;

  -- 5. Validate items array
  IF p_items_json IS NULL OR jsonb_typeof(p_items_json) <> 'array' OR jsonb_array_length(p_items_json) = 0 THEN
    RAISE EXCEPTION 'Cart is empty. Please add items to proceed.';
  END IF;

  -- 6. Loop items, resolving by stable id (extracting base item id for variants) and checking stock
  v_unavailable_items := ARRAY[]::text[];

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items_json) AS x(
    id text,
    name text,
    quantity numeric,
    price numeric,
    variant text,
    portion text
  )
  LOOP
    v_item_qty := floor(v_item.quantity);
    IF v_item_qty <= 0 OR v_item_qty > 50 THEN
      RAISE EXCEPTION 'Invalid item quantity (% for "%"). Must be between 1 and 50.', v_item_qty, COALESCE(v_item.name, 'Item');
    END IF;

    -- Extract base item id for items with size variants (e.g. "474:half", "474:full", "group-474")
    v_base_id_text := split_part(trim(COALESCE(v_item.id, '')), ':', 1);
    IF v_base_id_text LIKE 'group-%' THEN
      v_base_id_text := substring(v_base_id_text from 7);
    END IF;

    v_db_item := NULL;
    IF v_base_id_text ~ '^[0-9]+$' THEN
      SELECT * INTO v_db_item FROM menu_items WHERE id = (v_base_id_text::int);
    END IF;

    IF v_db_item IS NULL AND v_item.name IS NOT NULL THEN
      SELECT * INTO v_db_item FROM menu_items WHERE lower(trim(name)) = lower(trim(v_item.name)) LIMIT 1;
    END IF;

    -- Check if found in database
    IF v_db_item IS NOT NULL THEN
      v_item_name := v_db_item.name;

      -- Check Sold Out (is_completed flag on menu_items)
      IF v_db_item.is_completed = true THEN
        IF NOT (v_item_name = ANY(v_unavailable_items)) THEN
          v_unavailable_items := array_append(v_unavailable_items, v_item_name);
        END IF;
      END IF;

      -- Check Delivery Eligibility
      IF v_is_delivery AND v_db_item.direct_order_eligible = false THEN
        RAISE EXCEPTION 'Item "%" is not eligible for delivery. Please choose pickup or select another item.', v_item_name;
      END IF;

      v_unit_price := v_db_item.price;
    ELSE
      -- Fallback to item.name and submitted price if catalog item is a dynamic variant
      v_item_name := COALESCE(v_item.name, 'Item');
      v_unit_price := GREATEST(0, COALESCE(v_item.price, 0));
    END IF;

    -- Accrue authoritative subtotal
    v_calculated_subtotal := v_calculated_subtotal + (v_unit_price * v_item_qty);

    -- Format items text
    IF v_item_index > 0 THEN
      v_items_formatted_text := v_items_formatted_text || ', ';
    END IF;
    v_items_formatted_text := v_items_formatted_text || v_item_qty || 'x ' || v_item_name || ' (₹' || (v_unit_price * v_item_qty) || ')';
    v_item_index := v_item_index + 1;
  END LOOP;

  -- Reject the whole order if any item is currently marked finished
  IF cardinality(v_unavailable_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'item_unavailable',
      'items', to_jsonb(v_unavailable_items)
    );
  END IF;

  -- 7. Verify Store Offers & Discounts on Server
  SELECT * INTO v_offer FROM store_offers WHERE id = 1;
  IF FOUND AND v_offer.is_active = true AND now() >= v_offer.starts_at AND now() <= v_offer.expires_at THEN
    -- Percentage discount check
    IF v_offer.min_order_amount > 0 AND v_calculated_subtotal >= v_offer.min_order_amount AND v_offer.discount_percent > 0 THEN
      v_offer_discount := round((v_calculated_subtotal * v_offer.discount_percent) / 100);
    END IF;

    -- Free item threshold check
    IF v_offer.free_item_name IS NOT NULL AND trim(v_offer.free_item_name) <> '' THEN
      IF v_calculated_subtotal >= COALESCE(NULLIF(v_offer.free_item_min_amount, 0), v_offer.min_order_amount) THEN
        v_free_item_name := trim(v_offer.free_item_name);
        v_items_formatted_text := v_items_formatted_text || ', 1x ' || v_free_item_name || ' (₹0 Free Item)';
      END IF;
    END IF;

    -- Coupon code check
    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
      IF UPPER(TRIM(p_coupon_code)) = UPPER(TRIM(v_offer.coupon_code)) THEN
        IF v_calculated_subtotal >= v_offer.min_order_amount THEN
          v_coupon_discount := COALESCE(v_offer.coupon_flat_discount, 0);
        END IF;
      END IF;
    END IF;
  END IF;

  v_total_discount := LEAST(v_calculated_subtotal, v_offer_discount + v_coupon_discount);
  v_final_total := GREATEST(0, v_calculated_subtotal - v_total_discount);

  -- 8. Generate random, unguessable 8-character uppercase alphanumeric order code (excluding 0, O, 1, I)
  -- 32 characters: 23456789ABCDEFGHJKLMNPQRSTUVWXYZ (32^8 = 1.09+ trillion combinations)
  LOOP
    v_order_code := '';
    FOR i IN 1..8 LOOP
      v_order_code := v_order_code || substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', floor(random() * 32 + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = v_order_code) THEN
      EXIT;
    END IF;
  END LOOP;

  v_norm_idempotency_key := NULLIF(trim(p_idempotency_key), '');

  -- 9. Insert authoritative order with ON CONFLICT DO NOTHING for idempotency key
  INSERT INTO orders (
    order_code,
    customer_name,
    customer_phone,
    order_type,
    distance_km,
    address_notes,
    maps_link,
    items_json,
    subtotal,
    discount_amount,
    final_total,
    payment_method,
    status,
    idempotency_key,
    payment_status,
    created_at
  ) VALUES (
    v_order_code,
    v_norm_name,
    v_norm_phone,
    v_norm_type,
    CASE WHEN v_is_delivery THEN p_distance_km ELSE NULL END,
    v_norm_address,
    COALESCE(NULLIF(trim(p_maps_link), ''), CASE WHEN v_is_delivery THEN 'Delivery' ELSE 'Self-Pickup' END),
    v_items_formatted_text,
    v_calculated_subtotal,
    v_total_discount,
    v_final_total,
    v_norm_payment_method,
    'Initiated',
    v_norm_idempotency_key,
    'pending',
    now()
  )
  ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  RETURNING id, order_code, subtotal, discount_amount, final_total, payment_status, items_json
  INTO v_inserted_id, v_ret_order_code, v_ret_subtotal, v_ret_discount_amount, v_ret_final_total, v_ret_payment_status, v_ret_items_json;

  -- 10. If conflict occurred on idempotency_key, fetch the existing order row
  IF v_inserted_id IS NULL AND v_norm_idempotency_key IS NOT NULL THEN
    SELECT id, order_code, subtotal, discount_amount, final_total, payment_status, items_json
    INTO v_inserted_id, v_ret_order_code, v_ret_subtotal, v_ret_discount_amount, v_ret_final_total, v_ret_payment_status, v_ret_items_json
    FROM orders
    WHERE idempotency_key = v_norm_idempotency_key
    LIMIT 1;
  ELSE
    IF v_ret_order_code IS NULL THEN
      v_ret_order_code := v_order_code;
      v_ret_subtotal := v_calculated_subtotal;
      v_ret_discount_amount := v_total_discount;
      v_ret_final_total := v_final_total;
      v_ret_payment_status := 'pending';
      v_ret_items_json := v_items_formatted_text;
    END IF;
  END IF;

  -- 11. Return JSON payload to client
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_inserted_id,
    'order_code', v_ret_order_code,
    'items', v_ret_items_json,
    'subtotal', v_ret_subtotal,
    'discount_amount', v_ret_discount_amount,
    'final_total', v_ret_final_total,
    'payment_status', v_ret_payment_status,
    'payment_method', v_norm_payment_method,
    'free_item_name', v_free_item_name
  );
END;
$$;

-- Drop previous signatures of confirm_order_utr
DROP FUNCTION IF EXISTS confirm_order_utr(text, text);

-- 7. Confirm Customer UPI Reference (UTR) RPC
CREATE OR REPLACE FUNCTION confirm_order_utr(p_order_code text, p_utr text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_code text;
  v_clean_utr text;
  v_order record;
BEGIN
  -- 1. Validate UTR format: exactly 12 numeric digits
  v_clean_utr := trim(COALESCE(p_utr, ''));
  IF v_clean_utr !~ '^[0-9]{12}$' THEN
    RETURN jsonb_build_object('status', 'invalid_utr');
  END IF;

  -- 2. Validate Order Code
  v_clean_code := trim(COALESCE(p_order_code, ''));
  IF v_clean_code = '' THEN
    RETURN jsonb_build_object('status', 'invalid_order');
  END IF;

  -- 3. Lookup order with lock
  SELECT id, payment_status, utr, payment_method
  INTO v_order
  FROM orders
  WHERE order_code = v_clean_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid_order');
  END IF;

  -- 4. Reject COD orders: a COD order can never receive a UTR
  IF v_order.payment_method = 'COD' THEN
    RETURN jsonb_build_object('status', 'not_applicable');
  END IF;

  -- 5. Never modify confirmed or rejected orders
  IF v_order.payment_status IN ('confirmed', 'rejected') THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  -- 6. If already submitted with a different UTR, never overwrite
  IF v_order.payment_status = 'utr_submitted' AND v_order.utr IS DISTINCT FROM v_clean_utr THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  -- 7. Perform atomic update (catching unique violation on idx_orders_utr_unique)
  BEGIN
    UPDATE orders
    SET
      utr = v_clean_utr,
      payment_status = 'utr_submitted',
      utr_submitted_at = COALESCE(utr_submitted_at, now())
    WHERE order_code = v_clean_code
      AND (
        (payment_status = 'pending' AND utr IS NULL)
        OR (payment_status = 'utr_submitted' AND utr = v_clean_utr)
      );

    IF NOT FOUND THEN
      RETURN jsonb_build_object('status', 'already_processed');
    END IF;

    RETURN jsonb_build_object('status', 'ok');
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object('status', 'duplicate_utr');
  END;
END;
$$;

-- =====================================================================
-- 8. GRANT EXECUTE ON RPC FUNCTIONS TO ANON & AUTHENTICATED ROLES
-- =====================================================================
GRANT EXECUTE ON FUNCTION check_and_verify_pin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_pin(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION admin_get_orders(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_get_orders(text, int) TO anon, authenticated;
REVOKE ALL ON FUNCTION admin_fetch_orders(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_fetch_orders(text, int) TO anon, authenticated;
REVOKE ALL ON FUNCTION get_order_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_availability() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_order_status(text, int, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION admin_update_payment_status(text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_payment_status(text, int, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, int, boolean, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, text, boolean, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, int, boolean, boolean, numeric, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, text, boolean, boolean, numeric, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_reset_all_stock(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_morning_reset(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_offers(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_store_offer(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_change_pin(text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION confirm_order_utr(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_order_utr(text, text) TO anon, authenticated;

-- =====================================================================
-- 9. OPTIONAL DATA RETENTION (pg_cron)
-- =====================================================================
-- To automatically delete old orders older than 90 days:
-- 1. Enable the 'pg_cron' extension in Supabase Dashboard (Database -> Extensions)
-- 2. Uncomment and run the following schedule in the SQL Editor:
--
-- SELECT cron.schedule(
--   'purge-old-orders-90d',
--   '0 3 * * *', -- Runs daily at 03:00 UTC
--   $$DELETE FROM public.orders WHERE created_at < now() - interval '90 days';$$
-- );