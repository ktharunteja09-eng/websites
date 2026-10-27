import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const seedSql = fs.readFileSync(path.join(rootDir, 'supabase_menu_seed.sql'), 'utf8');

const setupSql = `-- =====================================================================
-- Supabase Setup Script for Vaibhav Grand Family Restaurant
-- Authoritative Server-Side Single Source of Truth
-- Includes:
-- 1. Tables: menu_items, menu_prices, sale_settings, menu_price_log, orders, store_settings, store_offers, admin_secrets
-- 2. Row Level Security (RLS) policies for complete public lockdown
-- 3. Server-side SECURITY DEFINER RPC functions verified by admin PIN
-- 4. Public get_live_menu() RPC & authoritative submit_verified_order()
-- =====================================================================

-- =====================================================================
-- 1. ENSURE TABLES & COLUMNS EXIST (RE-RUNNABLE DDL)
-- =====================================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id serial,
  item_id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  aggregator_price numeric,
  is_veg boolean DEFAULT false,
  direct_order_eligible boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  last_reset_date date DEFAULT current_date,
  updated_at timestamptz DEFAULT now()
);

-- Idempotent column upgrades for menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS item_id text;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_item_id ON menu_items(item_id) WHERE item_id IS NOT NULL;

-- 1b. Menu Prices Table (Server source of truth for orderable SKUs and portion variants)
CREATE TABLE IF NOT EXISTS menu_prices (
  sku text PRIMARY KEY,
  item_id text NOT NULL,
  variant text,
  price integer NOT NULL CHECK (price >= 1 AND price <= 99999),
  mrp integer,
  updated_at timestamptz DEFAULT now()
);

-- 1c. Sale Settings Table (Server source of truth for flash sales & discounts)
CREATE TABLE IF NOT EXISTS sale_settings (
  id int PRIMARY KEY DEFAULT 1,
  sale_active boolean NOT NULL DEFAULT true,
  sale_percent integer NOT NULL DEFAULT 10 CHECK (sale_percent >= 0 AND sale_percent <= 100),
  sale_ends_at timestamptz DEFAULT (now() + interval '30 days'),
  min_order_amount integer DEFAULT 299,
  coupon_code text DEFAULT NULL,
  coupon_flat_discount integer DEFAULT 0,
  free_item_name text DEFAULT 'Free 250ml Cool Drink',
  free_item_min_amount integer DEFAULT 499,
  updated_at timestamptz DEFAULT now()
);

-- 1d. Menu Price Log (Audit trail for price updates)
CREATE TABLE IF NOT EXISTS menu_price_log (
  id serial PRIMARY KEY,
  sku text NOT NULL,
  old_price integer,
  new_price integer NOT NULL,
  changed_at timestamptz DEFAULT now()
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
  coupon_code text DEFAULT NULL,
  coupon_flat_discount numeric DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
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
  items_snapshot jsonb,
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
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_snapshot jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'UPI';

-- Unique partial indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_utr_unique ON orders(utr) WHERE utr IS NOT NULL;

-- Normalize legacy or null payment_method rows
UPDATE orders SET payment_method = 'UPI' WHERE payment_method IS NULL OR payment_method NOT IN ('UPI', 'COD');
ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;
ALTER TABLE orders ALTER COLUMN payment_method SET DEFAULT 'UPI';

-- =====================================================================
-- 2. PRIVATE ADMIN CREDENTIALS TABLE (HIDDEN FROM BROWSERS)
-- =====================================================================
CREATE TABLE IF NOT EXISTS admin_secrets (
  id int PRIMARY KEY DEFAULT 1,
  passcode text NOT NULL DEFAULT '1234' -- Default Admin PIN
);

INSERT INTO admin_secrets (id, passcode) VALUES (1, '1234') ON CONFLICT (id) DO NOTHING;
ALTER TABLE admin_secrets ADD COLUMN IF NOT EXISTS failed_attempts int NOT NULL DEFAULT 0;
ALTER TABLE admin_secrets ADD COLUMN IF NOT EXISTS locked_until timestamptz DEFAULT NULL;

-- =====================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) FOR COMPLETE DATA LOCKDOWN
-- =====================================================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_price_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_secrets ENABLE ROW LEVEL SECURITY;

-- A. menu_items: Public read only
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
CREATE POLICY "Public read menu_items" ON menu_items
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON menu_items FROM anon, authenticated, public;

-- B. menu_prices: Public read only
DROP POLICY IF EXISTS "Public read menu_prices" ON menu_prices;
CREATE POLICY "Public read menu_prices" ON menu_prices
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON menu_prices FROM anon, authenticated, public;

-- C. sale_settings: Public read only
DROP POLICY IF EXISTS "Public read sale_settings" ON sale_settings;
CREATE POLICY "Public read sale_settings" ON sale_settings
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON sale_settings FROM anon, authenticated, public;

-- D. menu_price_log: Zero public access (Admin audit only)
REVOKE ALL ON menu_price_log FROM anon, authenticated, public;

-- E. store_offers: Public read only
DROP POLICY IF EXISTS "Public read store_offers" ON store_offers;
CREATE POLICY "Public read store_offers" ON store_offers
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON store_offers FROM anon, authenticated, public;

-- F. store_settings: Public read only
DROP POLICY IF EXISTS "Public read store_settings" ON store_settings;
CREATE POLICY "Public read store_settings" ON store_settings
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON store_settings FROM anon, authenticated, public;

-- G. admin_secrets: Zero public policies
REVOKE ALL ON admin_secrets FROM anon, authenticated, public;

-- H. orders: Zero direct table access. All actions through SECURITY DEFINER RPCs.
REVOKE ALL ON orders FROM anon, authenticated, public;
DROP POLICY IF EXISTS "Orders strict insert only" ON orders;
DROP POLICY IF EXISTS "Customers can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;

-- Remove orders table from realtime publication to protect customer PII
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
-- 4. BRUTE-FORCE LOCKDOWN & PIN VERIFICATION HELPER
-- =====================================================================
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

  -- Check lockout
  IF v_sec.locked_until IS NOT NULL AND v_sec.locked_until > now() THEN
    RETURN jsonb_build_object(
      'ok', false,
      'locked', true,
      'locked_until', v_sec.locked_until,
      'error', 'Account locked due to too many failed attempts. Try again in 15 minutes.'
    );
  END IF;

  -- Incorrect PIN
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

  -- Correct PIN: reset lockouts
  IF COALESCE(v_sec.failed_attempts, 0) > 0 OR v_sec.locked_until IS NOT NULL THEN
    UPDATE admin_secrets
    SET failed_attempts = 0, locked_until = NULL
    WHERE id = 1;
  END IF;

  RETURN jsonb_build_object('ok', true, 'locked', false, 'error', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN check_and_verify_pin(input_pin);
END;
$$;

-- =====================================================================
-- 5. ADMIN CRM & ORDER HANDLING RPCS
-- =====================================================================
DROP FUNCTION IF EXISTS admin_fetch_orders(text);
DROP FUNCTION IF EXISTS admin_fetch_orders(text, int);
DROP FUNCTION IF EXISTS admin_fetch_orders(text, integer);
DROP FUNCTION IF EXISTS admin_get_orders(text);
DROP FUNCTION IF EXISTS admin_get_orders(text, int);
DROP FUNCTION IF EXISTS admin_get_orders(text, integer);

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

DROP FUNCTION IF EXISTS admin_update_payment_status(text, int, text);
DROP FUNCTION IF EXISTS admin_update_payment_status(text, integer, text);

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
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Unauthorized');
  END IF;

  v_status := lower(trim(COALESCE(p_payment_status, '')));
  IF v_status NOT IN ('confirmed', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid status. Only confirmed or rejected are allowed.');
  END IF;

  UPDATE orders
  SET payment_status = v_status
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', v_status);
END;
$$;

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

-- =====================================================================
-- 6. AUTHORITATIVE PRICE & AVAILABILITY RPCS (TASKS 6 & 7)
-- =====================================================================

-- 6a. Admin Set Available RPC
DROP FUNCTION IF EXISTS admin_set_available(text, text, boolean);
CREATE OR REPLACE FUNCTION admin_set_available(
  input_pin text,
  p_item_id text,
  p_available boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', COALESCE(v_auth->>'error', 'Unauthorized'));
  END IF;

  UPDATE menu_items
  SET
    available = p_available,
    is_completed = NOT p_available,
    updated_at = now()
  WHERE item_id = p_item_id OR id::text = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found in menu_items.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'available', p_available
  );
END;
$$;

-- 6b. Admin Set Price RPC (Validates 1..99999, logs to menu_price_log, updates updated_at)
DROP FUNCTION IF EXISTS admin_set_price(text, text, integer);
DROP FUNCTION IF EXISTS admin_set_price(text, text, int);
CREATE OR REPLACE FUNCTION admin_set_price(
  input_pin text,
  p_sku text,
  p_price integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth jsonb;
  v_old_price integer;
  v_target_item_id text;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', COALESCE(v_auth->>'error', 'Unauthorized'));
  END IF;

  -- Validate price range: 1 to 99999
  IF p_price IS NULL OR p_price < 1 OR p_price > 99999 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Price must be between ₹1 and ₹99,999.');
  END IF;

  -- Find current price in menu_prices
  SELECT price, item_id INTO v_old_price, v_target_item_id
  FROM menu_prices
  WHERE sku = p_sku;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SKU not found in menu_prices.');
  END IF;

  -- Write audit log
  INSERT INTO menu_price_log (sku, old_price, new_price, changed_at)
  VALUES (p_sku, v_old_price, p_price, now());

  -- Update menu_prices
  UPDATE menu_prices
  SET price = p_price, updated_at = now()
  WHERE sku = p_sku;

  -- Synchronize menu_items price if sku matches item_id
  IF v_target_item_id IS NOT NULL AND (p_sku = v_target_item_id OR p_sku NOT LIKE '%:%') THEN
    UPDATE menu_items
    SET price = p_price, updated_at = now()
    WHERE item_id = v_target_item_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'sku', p_sku,
    'old_price', v_old_price,
    'new_price', p_price
  );
END;
$$;

-- 6c. Compatibility update for AdminDashboard.tsx
DROP FUNCTION IF EXISTS admin_update_menu_item(text, int, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, integer, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, text, boolean, boolean);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, int, boolean, boolean, numeric, numeric);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, integer, boolean, boolean, numeric, numeric);
DROP FUNCTION IF EXISTS admin_update_menu_item(text, text, boolean, boolean, numeric, numeric);

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
  v_target_item_id text;
  v_old_sku_price int;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  SELECT price, item_id INTO v_cur_price, v_target_item_id FROM menu_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF new_price IS NOT NULL THEN
    IF new_price <= 0 OR new_price > 99999 THEN
      RAISE EXCEPTION 'Price must be greater than 0 and up to 99,999.';
    END IF;

    -- Sync to menu_prices and audit log
    IF v_target_item_id IS NOT NULL THEN
      SELECT price INTO v_old_sku_price FROM menu_prices WHERE sku = v_target_item_id LIMIT 1;
      IF FOUND THEN
        INSERT INTO menu_price_log (sku, old_price, new_price, changed_at)
        VALUES (v_target_item_id, v_old_sku_price, round(new_price)::integer, now());

        UPDATE menu_prices
        SET price = round(new_price)::integer, updated_at = now()
        WHERE sku = v_target_item_id;
      END IF;
    END IF;
  END IF;

  UPDATE menu_items
  SET
    is_completed = completed_val,
    available = NOT completed_val,
    direct_order_eligible = eligible_val,
    price = COALESCE(new_price, price),
    aggregator_price = COALESCE(new_aggregator_price, aggregator_price),
    last_reset_date = current_date,
    updated_at = now()
  WHERE id = item_id;

  RETURN true;
END;
$$;

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

  UPDATE menu_items SET is_completed = false, available = true, last_reset_date = current_date, updated_at = now();
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

  UPDATE sale_settings SET
    sale_active = active_val,
    sale_percent = round(disc_val)::integer,
    min_order_amount = round(min_amt)::integer,
    free_item_name = free_item,
    free_item_min_amount = round(free_min)::integer,
    coupon_code = code_val,
    coupon_flat_discount = round(flat_val)::integer,
    sale_ends_at = exp_val,
    updated_at = now()
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
-- 7. PUBLIC READ: get_live_menu() RPC (TASK 7)
-- =====================================================================
DROP FUNCTION IF EXISTS get_live_menu();
CREATE OR REPLACE FUNCTION get_live_menu()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale RECORD;
  v_items jsonb;
  v_server_time timestamptz := now();
  v_sale_active boolean := false;
BEGIN
  -- 1. Fetch sale settings
  SELECT sale_active, sale_percent, sale_ends_at, min_order_amount, coupon_code, coupon_flat_discount
  INTO v_sale
  FROM sale_settings
  WHERE id = 1;

  IF FOUND THEN
    v_sale_active := COALESCE(v_sale.sale_active, false)
      AND (v_sale.sale_ends_at IS NULL OR v_server_time <= v_sale.sale_ends_at);
  END IF;

  -- 2. Fetch compact item list
  -- ONLY: item_id, sku, variant, price, mrp, available
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_id', p.item_id,
      'sku', p.sku,
      'variant', p.variant,
      'price', p.price,
      'mrp', p.mrp,
      'available', (COALESCE(m.available, true) AND (m.is_completed IS NOT TRUE))
    )
  )
  INTO v_items
  FROM menu_prices p
  LEFT JOIN menu_items m ON m.item_id = p.item_id;

  RETURN jsonb_build_object(
    'server_time', v_server_time,
    'sale', jsonb_build_object(
      'active', v_sale_active,
      'percent', COALESCE(v_sale.sale_percent, 10),
      'ends_at', v_sale.sale_ends_at,
      'min_order', COALESCE(v_sale.min_order_amount, 299),
      'coupon', v_sale.coupon_code,
      'flat_discount', v_sale.coupon_flat_discount
    ),
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

-- Store operating hours RPC
DROP FUNCTION IF EXISTS get_order_availability();
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

-- =====================================================================
-- 8. AUTHORITATIVE ORDER SUBMISSION: submit_verified_order() (TASK 5)
-- =====================================================================
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text);
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text);
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric);

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
  p_idempotency_key text DEFAULT NULL,
  p_expected_total numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_opens_at time := '10:30'::time;
  v_closes_at time := '23:00'::time;
  v_buffer_mins int := 30;
  v_last_order_at time;
  v_now_time time;
  v_norm_payment_method text;
  v_norm_name text;
  v_norm_phone text;
  v_norm_type text;
  v_norm_address text;
  v_norm_idempotency_key text;
  v_is_delivery boolean;
  
  v_item record;
  v_item_qty int;
  v_input_id text;
  v_input_sku text;
  
  v_price_row record;
  v_menu_item record;
  v_item_name text;
  v_unit_price integer;
  
  v_unknown_items text[] := ARRAY[]::text[];
  v_unavailable_items text[] := ARRAY[]::text[];
  v_price_lines jsonb[] := ARRAY[]::jsonb[];
  v_snapshot_lines jsonb[] := ARRAY[]::jsonb[];
  
  v_calculated_subtotal integer := 0;
  v_items_formatted_text text := '';
  v_item_index int := 0;
  
  v_sale record;
  v_sale_discount integer := 0;
  v_coupon_discount integer := 0;
  v_total_discount integer := 0;
  v_final_total integer := 0;
  v_free_item_name text := NULL;
  
  v_order_code text;
  v_inserted_id int;
  v_order_snapshot jsonb;
  
  -- Idempotency check return variables
  v_existing_order record;
  v_ret_order_code text;
  v_ret_subtotal numeric;
  v_ret_discount_amount numeric;
  v_ret_final_total numeric;
  v_ret_payment_status text;
  v_ret_items_json text;
BEGIN
  -- 0. Check Operating Hours on Server (Asia/Kolkata)
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

  -- 1. Check idempotency BEFORE doing anything else
  v_norm_idempotency_key := NULLIF(trim(p_idempotency_key), '');
  IF v_norm_idempotency_key IS NOT NULL THEN
    SELECT id, order_code, subtotal, discount_amount, final_total, payment_status, payment_method, items_json
    INTO v_existing_order
    FROM orders
    WHERE idempotency_key = v_norm_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order.id,
        'order_code', v_existing_order.order_code,
        'items', v_existing_order.items_json,
        'subtotal', v_existing_order.subtotal,
        'discount_amount', v_existing_order.discount_amount,
        'final_total', v_existing_order.final_total,
        'payment_status', v_existing_order.payment_status,
        'payment_method', v_existing_order.payment_method,
        'idempotent_replay', true
      );
    END IF;
  END IF;

  -- 2. Validate payment method
  v_norm_payment_method := UPPER(TRIM(COALESCE(p_payment_method, 'UPI')));
  IF v_norm_payment_method NOT IN ('UPI', 'COD') THEN
    RAISE EXCEPTION 'Invalid payment method. Only UPI and COD are accepted.';
  END IF;

  -- 3. Validate customer name
  v_norm_name := trim(p_customer_name);
  IF length(v_norm_name) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
  END IF;

  -- 4. Validate Indian phone number (10 digits)
  v_norm_phone := regexp_replace(p_customer_phone, '\\D', '', 'g');
  IF length(v_norm_phone) = 12 AND v_norm_phone LIKE '91%' THEN
    v_norm_phone := substring(v_norm_phone from 3);
  END IF;
  IF v_norm_phone !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit Indian mobile number.';
  END IF;

  -- 5. Validate order type and delivery bounds
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

  -- 6. Validate items array
  IF p_items_json IS NULL OR jsonb_typeof(p_items_json) <> 'array' OR jsonb_array_length(p_items_json) = 0 THEN
    RAISE EXCEPTION 'Cart is empty. Please add items to proceed.';
  END IF;

  -- 7. Authoritatively Resolve Each Item from menu_prices & menu_items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items_json) AS x(
    id text,
    sku text,
    name text,
    quantity numeric,
    price numeric,
    variant text,
    portion text
  )
  LOOP
    v_item_qty := floor(COALESCE(v_item.quantity, 1));
    IF v_item_qty <= 0 OR v_item_qty > 50 THEN
      RAISE EXCEPTION 'Invalid item quantity (% for "%"). Must be between 1 and 50.', v_item_qty, COALESCE(v_item.name, 'Item');
    END IF;

    v_input_id := trim(COALESCE(v_item.id, ''));
    v_input_sku := trim(COALESCE(v_item.sku, v_input_id));

    -- Clean group prefixes (e.g. "group-dish-278")
    IF v_input_sku LIKE 'group-%' THEN
      v_input_sku := substring(v_input_sku from 7);
    END IF;
    IF v_input_id LIKE 'group-%' THEN
      v_input_id := substring(v_input_id from 7);
    END IF;

    -- Look up in menu_prices
    v_price_row := NULL;

    -- A. Exact SKU match
    SELECT * INTO v_price_row FROM menu_prices WHERE sku = v_input_sku;

    -- B. If not found and input_sku != input_id, try input_id
    IF v_price_row IS NULL AND v_input_id <> '' AND v_input_id <> v_input_sku THEN
      SELECT * INTO v_price_row FROM menu_prices WHERE sku = v_input_id;
    END IF;

    -- C. Try with 'dish-' prefix if missing (e.g. '284:full' -> 'dish-284:full' or '284' -> 'dish-284')
    IF v_price_row IS NULL AND NOT (v_input_sku LIKE 'dish-%') THEN
      SELECT * INTO v_price_row FROM menu_prices WHERE sku = ('dish-' || v_input_sku);
      IF v_price_row IS NULL AND v_input_id <> '' AND NOT (v_input_id LIKE 'dish-%') THEN
        SELECT * INTO v_price_row FROM menu_prices WHERE sku = ('dish-' || v_input_id);
      END IF;
    END IF;

    -- D. If sku contains colon (e.g. '284:full' or 'dish-284:full'), match base or variant
    IF v_price_row IS NULL AND v_input_sku LIKE '%:%' THEN
      SELECT * INTO v_price_row FROM menu_prices
      WHERE sku = split_part(v_input_sku, ':', 1)
         OR sku = ('dish-' || split_part(v_input_sku, ':', 1))
         OR (item_id = ('dish-' || split_part(v_input_sku, ':', 1)) AND lower(variant) = lower(split_part(v_input_sku, ':', 2)))
      LIMIT 1;
    END IF;

    -- E. If not found and variant is specified, try sku:variant
    IF v_price_row IS NULL AND v_item.variant IS NOT NULL AND trim(v_item.variant) <> '' THEN
      SELECT * INTO v_price_row FROM menu_prices
      WHERE sku = (v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\\s+', '', 'g')))
         OR sku = ('dish-' || v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\\s+', '', 'g')));
    END IF;

    -- F. If not found and input is numeric id (legacy catalog id), lookup item_id from menu_items
    IF v_price_row IS NULL THEN
      IF split_part(v_input_id, ':', 1) ~ '^[0-9]+$' THEN
        SELECT * INTO v_price_row FROM menu_prices
        WHERE item_id = ('dish-' || split_part(v_input_id, ':', 1)) OR sku = ('dish-' || split_part(v_input_id, ':', 1))
        LIMIT 1;
        IF v_price_row IS NULL THEN
          SELECT p.* INTO v_price_row
          FROM menu_prices p
          JOIN menu_items m ON m.item_id = p.item_id
          WHERE m.id = split_part(v_input_id, ':', 1)::int
          LIMIT 1;
        END IF;
      ELSIF split_part(v_input_sku, ':', 1) ~ '^[0-9]+$' THEN
        SELECT * INTO v_price_row FROM menu_prices
        WHERE item_id = ('dish-' || split_part(v_input_sku, ':', 1)) OR sku = ('dish-' || split_part(v_input_sku, ':', 1))
        LIMIT 1;
        IF v_price_row IS NULL THEN
          SELECT p.* INTO v_price_row
          FROM menu_prices p
          JOIN menu_items m ON m.item_id = p.item_id
          WHERE m.id = split_part(v_input_sku, ':', 1)::int
          LIMIT 1;
        END IF;
      END IF;
    END IF;

    -- G. Exact name match fallback for items without sizes/variants (never choose a size)
    IF v_price_row IS NULL AND v_item.name IS NOT NULL AND trim(v_item.name) <> '' THEN
      SELECT p.* INTO v_price_row
      FROM menu_prices p
      JOIN menu_items m ON m.item_id = p.item_id
      WHERE lower(trim(m.name)) = lower(trim(v_item.name))
        AND (p.variant IS NULL OR p.variant = 'default' OR p.variant = '')
      LIMIT 1;
    END IF;

    -- If still not found, record as unknown_item
    IF v_price_row IS NULL THEN
      IF NOT (COALESCE(v_item.name, v_input_sku) = ANY(v_unknown_items)) THEN
        v_unknown_items := array_append(v_unknown_items, COALESCE(v_item.name, NULLIF(v_input_sku, ''), v_input_id));
      END IF;
      CONTINUE;
    END IF;

    -- Lookup menu_items for name and availability
    SELECT * INTO v_menu_item FROM menu_items WHERE item_id = v_price_row.item_id LIMIT 1;
    v_item_name := COALESCE(v_menu_item.name, v_item.name, v_price_row.sku);

    -- Check sold out / availability
    IF (v_menu_item IS NOT NULL AND (v_menu_item.available = false OR v_menu_item.is_completed = true)) THEN
      IF NOT (v_item_name = ANY(v_unavailable_items)) THEN
        v_unavailable_items := array_append(v_unavailable_items, v_item_name);
      END IF;
    END IF;

    -- Check direct order delivery eligibility
    IF v_is_delivery AND v_menu_item IS NOT NULL AND v_menu_item.direct_order_eligible = false THEN
      RAISE EXCEPTION 'Item "%" is not eligible for delivery. Please choose pickup or select another item.', v_item_name;
    END IF;

    -- Authoritative price ONLY from database
    v_unit_price := v_price_row.price;
    v_calculated_subtotal := v_calculated_subtotal + (v_unit_price * v_item_qty);

    -- Append to price_lines array
    v_price_lines := array_append(v_price_lines, jsonb_build_object(
      'sku', v_price_row.sku,
      'unit_price', v_unit_price
    ));

    -- Append to order snapshot lines
    v_snapshot_lines := array_append(v_snapshot_lines, jsonb_build_object(
      'sku', v_price_row.sku,
      'item_id', v_price_row.item_id,
      'name', v_item_name,
      'quantity', v_item_qty,
      'unit_price', v_unit_price,
      'line_total', (v_unit_price * v_item_qty)
    ));

    -- Format items human-readable text
    IF v_item_index > 0 THEN
      v_items_formatted_text := v_items_formatted_text || ', ';
    END IF;
    v_items_formatted_text := v_items_formatted_text || v_item_qty || 'x ' || v_item_name || ' (₹' || (v_unit_price * v_item_qty) || ')';
    v_item_index := v_item_index + 1;
  END LOOP;

  -- 8. Return structured statuses if any items unknown or unavailable (no free-text exception)
  IF cardinality(v_unknown_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'unknown_item',
      'items', to_jsonb(v_unknown_items)
    );
  END IF;

  IF cardinality(v_unavailable_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'item_unavailable',
      'items', to_jsonb(v_unavailable_items)
    );
  END IF;

  -- 9. Authoritative Server-Side Discount Calculation
  -- Computed ONLY from sale_settings and server clock now()
  SELECT * INTO v_sale FROM sale_settings WHERE id = 1;
  IF FOUND AND v_sale.sale_active = true AND (v_sale.sale_ends_at IS NULL OR now() <= v_sale.sale_ends_at) THEN
    -- Percentage sale discount
    IF v_sale.min_order_amount > 0 AND v_calculated_subtotal >= v_sale.min_order_amount AND v_sale.sale_percent > 0 THEN
      v_sale_discount := round((v_calculated_subtotal * v_sale.sale_percent) / 100.0);
    END IF;

    -- Free item threshold
    IF v_sale.free_item_name IS NOT NULL AND trim(v_sale.free_item_name) <> '' THEN
      IF v_calculated_subtotal >= COALESCE(v_sale.free_item_min_amount, v_sale.min_order_amount) THEN
        v_free_item_name := trim(v_sale.free_item_name);
        v_items_formatted_text := v_items_formatted_text || ', 1x ' || v_free_item_name || ' (₹0 Free Item)';
      END IF;
    END IF;

    -- Coupon code check
    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
      IF upper(trim(p_coupon_code)) = upper(trim(v_sale.coupon_code)) THEN
        IF v_calculated_subtotal >= v_sale.min_order_amount THEN
          v_coupon_discount := COALESCE(v_sale.coupon_flat_discount, 0);
        END IF;
      END IF;
    END IF;
  END IF;

  v_total_discount := LEAST(v_calculated_subtotal, v_sale_discount + v_coupon_discount);
  v_final_total := GREATEST(0, v_calculated_subtotal - v_total_discount);

  -- 10. Expected Total Verification
  -- If client sent an expected total that differs from server total, reject with price_changed
  IF p_expected_total IS NOT NULL AND round(p_expected_total) <> round(v_final_total) THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'price_changed',
      'server_total', v_final_total,
      'lines', to_jsonb(v_price_lines)
    );
  END IF;

  -- 11. Generate Unguessable 8-char Order Code
  LOOP
    v_order_code := '';
    FOR i IN 1..8 LOOP
      v_order_code := v_order_code || substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', floor(random() * 32 + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = v_order_code) THEN
      EXIT;
    END IF;
  END LOOP;

  -- 12. Build Snapshot JSON
  v_order_snapshot := jsonb_build_object(
    'lines', to_jsonb(v_snapshot_lines),
    'subtotal', v_calculated_subtotal,
    'discount', v_total_discount,
    'final_total', v_final_total,
    'free_item', v_free_item_name,
    'created_at', now()
  );

  -- 13. Insert Order with Snapshot
  INSERT INTO orders (
    order_code,
    customer_name,
    customer_phone,
    order_type,
    distance_km,
    address_notes,
    maps_link,
    items_json,
    items_snapshot,
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
    v_order_snapshot,
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

  -- If conflict occurred on idempotency key, fetch the existing order
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

-- 8b. Customer UTR Confirmation RPC
DROP FUNCTION IF EXISTS confirm_order_utr(text, text);
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
  v_clean_utr := trim(COALESCE(p_utr, ''));
  IF v_clean_utr !~ '^[0-9]{12}$' THEN
    RETURN jsonb_build_object('status', 'invalid_utr');
  END IF;

  v_clean_code := trim(COALESCE(p_order_code, ''));
  IF v_clean_code = '' THEN
    RETURN jsonb_build_object('status', 'invalid_order');
  END IF;

  SELECT id, payment_status, utr, payment_method
  INTO v_order
  FROM orders
  WHERE order_code = v_clean_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid_order');
  END IF;

  IF v_order.payment_method = 'COD' THEN
    RETURN jsonb_build_object('status', 'not_applicable');
  END IF;

  IF v_order.payment_status IN ('confirmed', 'rejected') THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  IF v_order.payment_status = 'utr_submitted' AND v_order.utr IS DISTINCT FROM v_clean_utr THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

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
-- 9. REVOKE & GRANT PERMISSIONS ON RPC FUNCTIONS
-- =====================================================================
GRANT EXECUTE ON FUNCTION check_and_verify_pin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_pin(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_get_orders(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_get_orders(text, int) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_fetch_orders(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_fetch_orders(text, int) TO anon, authenticated;

REVOKE ALL ON FUNCTION get_order_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_availability() TO anon, authenticated;

REVOKE ALL ON FUNCTION get_live_menu() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_live_menu() TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_set_available(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_available(text, text, boolean) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_set_price(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_price(text, text, integer) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_order_status(text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_order_status(text, int, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_payment_status(text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_payment_status(text, int, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_menu_item(text, int, boolean, boolean, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, int, boolean, boolean, numeric, numeric) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_menu_item(text, text, boolean, boolean, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_menu_item(text, text, boolean, boolean, numeric, numeric) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_reset_all_stock(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_reset_all_stock(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_morning_reset(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_morning_reset(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_offers(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_offers(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_update_store_offer(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_store_offer(text, boolean, text, numeric, numeric, text, numeric, text, numeric, timestamptz) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_change_pin(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_change_pin(text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric) TO anon, authenticated;

REVOKE ALL ON FUNCTION confirm_order_utr(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_order_utr(text, text) TO anon, authenticated;


-- =====================================================================
-- 10. STANDALONE MIGRATION BLOCK (ONE-TIME EXECUTION FOR SUPABASE SQL EDITOR)
-- =====================================================================
-- Copy and run everything between BEGIN and COMMIT in Supabase SQL Editor.
-- Idempotent and safe: ON CONFLICT DO NOTHING preserves owner edits.
-- =====================================================================

BEGIN;

-- 1. Table schema updates & columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS item_id text;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_item_id ON menu_items(item_id) WHERE item_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS menu_prices (
  sku text PRIMARY KEY,
  item_id text NOT NULL,
  variant text,
  price integer NOT NULL CHECK (price >= 1 AND price <= 99999),
  mrp integer,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_settings (
  id int PRIMARY KEY DEFAULT 1,
  sale_active boolean NOT NULL DEFAULT true,
  sale_percent integer NOT NULL DEFAULT 10 CHECK (sale_percent >= 0 AND sale_percent <= 100),
  sale_ends_at timestamptz DEFAULT (now() + interval '12 hours'),
  min_order_amount integer DEFAULT 299,
  coupon_code text DEFAULT 'DIRECT50',
  coupon_flat_discount integer DEFAULT 50,
  free_item_name text DEFAULT 'Free 250ml Cool Drink',
  free_item_min_amount integer DEFAULT 499,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_price_log (
  id serial PRIMARY KEY,
  sku text NOT NULL,
  old_price integer,
  new_price integer NOT NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_snapshot jsonb;

-- 2. Backfill existing items: synchronize available with is_completed
UPDATE menu_items
SET available = NOT is_completed, updated_at = now()
WHERE available IS NULL OR (available = true AND is_completed = true);

-- 3. RLS Lockdown on New Tables
ALTER TABLE menu_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_price_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read menu_prices" ON menu_prices;
CREATE POLICY "Public read menu_prices" ON menu_prices
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON menu_prices FROM anon, authenticated, public;

DROP POLICY IF EXISTS "Public read sale_settings" ON sale_settings;
CREATE POLICY "Public read sale_settings" ON sale_settings
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON sale_settings FROM anon, authenticated, public;

REVOKE ALL ON menu_price_log FROM anon, authenticated, public;

-- 4. Seed Canonical menu_items & menu_prices (Idempotent: preserves owner edits)
${seedSql}

-- 5. Deploy / Upgrade RPC Functions (Drop old signatures first, keeping single authoritative overload)

-- 5a. Admin Set Available RPC
DROP FUNCTION IF EXISTS admin_set_available(text, text, boolean);
CREATE OR REPLACE FUNCTION admin_set_available(
  input_pin text,
  p_item_id text,
  p_available boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS \$\$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', COALESCE(v_auth->>'error', 'Unauthorized'));
  END IF;

  UPDATE menu_items
  SET
    available = p_available,
    is_completed = NOT p_available,
    updated_at = now()
  WHERE item_id = p_item_id OR id::text = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found in menu_items.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'available', p_available
  );
END;
\$\$;

-- 5b. Admin Set Price RPC
DROP FUNCTION IF EXISTS admin_set_price(text, text, integer);
DROP FUNCTION IF EXISTS admin_set_price(text, text, int);
CREATE OR REPLACE FUNCTION admin_set_price(
  input_pin text,
  p_sku text,
  p_price integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS \$\$
DECLARE
  v_auth jsonb;
  v_old_price integer;
  v_target_item_id text;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', COALESCE(v_auth->>'error', 'Unauthorized'));
  END IF;

  IF p_price IS NULL OR p_price < 1 OR p_price > 99999 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Price must be between ₹1 and ₹99,999.');
  END IF;

  SELECT price, item_id INTO v_old_price, v_target_item_id
  FROM menu_prices
  WHERE sku = p_sku;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SKU not found in menu_prices.');
  END IF;

  INSERT INTO menu_price_log (sku, old_price, new_price, changed_at)
  VALUES (p_sku, v_old_price, p_price, now());

  UPDATE menu_prices
  SET price = p_price, updated_at = now()
  WHERE sku = p_sku;

  IF v_target_item_id IS NOT NULL AND (p_sku = v_target_item_id OR p_sku NOT LIKE '%:%') THEN
    UPDATE menu_items
    SET price = p_price, updated_at = now()
    WHERE item_id = v_target_item_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'sku', p_sku,
    'old_price', v_old_price,
    'new_price', p_price
  );
END;
\$\$;

-- 5c. Public get_live_menu() RPC
DROP FUNCTION IF EXISTS get_live_menu();
CREATE OR REPLACE FUNCTION get_live_menu()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS \$\$
DECLARE
  v_sale RECORD;
  v_items jsonb;
  v_server_time timestamptz := now();
  v_sale_active boolean := false;
BEGIN
  SELECT sale_active, sale_percent, sale_ends_at, min_order_amount, coupon_code, coupon_flat_discount
  INTO v_sale
  FROM sale_settings
  WHERE id = 1;

  IF FOUND THEN
    v_sale_active := COALESCE(v_sale.sale_active, false)
      AND (v_sale.sale_ends_at IS NULL OR v_server_time <= v_sale.sale_ends_at);
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'item_id', p.item_id,
      'sku', p.sku,
      'variant', p.variant,
      'price', p.price,
      'mrp', p.mrp,
      'available', (COALESCE(m.available, true) AND (m.is_completed IS NOT TRUE))
    )
  )
  INTO v_items
  FROM menu_prices p
  LEFT JOIN menu_items m ON m.item_id = p.item_id;

  RETURN jsonb_build_object(
    'server_time', v_server_time,
    'sale', jsonb_build_object(
      'active', v_sale_active,
      'percent', COALESCE(v_sale.sale_percent, 10),
      'ends_at', v_sale.sale_ends_at,
      'min_order', COALESCE(v_sale.min_order_amount, 299),
      'coupon', v_sale.coupon_code,
      'flat_discount', v_sale.coupon_flat_discount
    ),
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
\$\$;

-- 5d. Authoritative submit_verified_order RPC
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text);
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text);
DROP FUNCTION IF EXISTS submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric);

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
  p_idempotency_key text DEFAULT NULL,
  p_expected_total numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS \$\$
DECLARE
  v_opens_at time := '10:30'::time;
  v_closes_at time := '23:00'::time;
  v_buffer_mins int := 30;
  v_last_order_at time;
  v_now_time time;
  v_norm_payment_method text;
  v_norm_name text;
  v_norm_phone text;
  v_norm_type text;
  v_norm_address text;
  v_norm_idempotency_key text;
  v_is_delivery boolean;
  
  v_item record;
  v_item_qty int;
  v_input_id text;
  v_input_sku text;
  
  v_price_row record;
  v_menu_item record;
  v_item_name text;
  v_unit_price integer;
  
  v_unknown_items text[] := ARRAY[]::text[];
  v_unavailable_items text[] := ARRAY[]::text[];
  v_price_lines jsonb[] := ARRAY[]::jsonb[];
  v_snapshot_lines jsonb[] := ARRAY[]::jsonb[];
  
  v_calculated_subtotal integer := 0;
  v_items_formatted_text text := '';
  v_item_index int := 0;
  
  v_sale record;
  v_sale_discount integer := 0;
  v_coupon_discount integer := 0;
  v_total_discount integer := 0;
  v_final_total integer := 0;
  v_free_item_name text := NULL;
  
  v_order_code text;
  v_inserted_id int;
  v_order_snapshot jsonb;
  
  v_existing_order record;
  v_ret_order_code text;
  v_ret_subtotal numeric;
  v_ret_discount_amount numeric;
  v_ret_final_total numeric;
  v_ret_payment_status text;
  v_ret_items_json text;
BEGIN
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

  v_norm_idempotency_key := NULLIF(trim(p_idempotency_key), '');
  IF v_norm_idempotency_key IS NOT NULL THEN
    SELECT id, order_code, subtotal, discount_amount, final_total, payment_status, payment_method, items_json
    INTO v_existing_order
    FROM orders
    WHERE idempotency_key = v_norm_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order.id,
        'order_code', v_existing_order.order_code,
        'items', v_existing_order.items_json,
        'subtotal', v_existing_order.subtotal,
        'discount_amount', v_existing_order.discount_amount,
        'final_total', v_existing_order.final_total,
        'payment_status', v_existing_order.payment_status,
        'payment_method', v_existing_order.payment_method,
        'idempotent_replay', true
      );
    END IF;
  END IF;

  v_norm_payment_method := UPPER(TRIM(COALESCE(p_payment_method, 'UPI')));
  IF v_norm_payment_method NOT IN ('UPI', 'COD') THEN
    RAISE EXCEPTION 'Invalid payment method. Only UPI and COD are accepted.';
  END IF;

  v_norm_name := trim(p_customer_name);
  IF length(v_norm_name) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters long.';
  END IF;

  v_norm_phone := regexp_replace(p_customer_phone, '\\D', '', 'g');
  IF length(v_norm_phone) = 12 AND v_norm_phone LIKE '91%' THEN
    v_norm_phone := substring(v_norm_phone from 3);
  END IF;
  IF v_norm_phone !~ '^[6-9][0-9]{9}\$' THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit Indian mobile number.';
  END IF;

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

  IF p_items_json IS NULL OR jsonb_typeof(p_items_json) <> 'array' OR jsonb_array_length(p_items_json) = 0 THEN
    RAISE EXCEPTION 'Cart is empty. Please add items to proceed.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items_json) AS x(
    id text,
    sku text,
    name text,
    quantity numeric,
    price numeric,
    variant text,
    portion text
  )
  LOOP
    v_item_qty := floor(COALESCE(v_item.quantity, 1));
    IF v_item_qty <= 0 OR v_item_qty > 50 THEN
      RAISE EXCEPTION 'Invalid item quantity (% for "%"). Must be between 1 and 50.', v_item_qty, COALESCE(v_item.name, 'Item');
    END IF;

    v_input_id := trim(COALESCE(v_item.id, ''));
    v_input_sku := trim(COALESCE(v_item.sku, v_input_id));

    IF v_input_sku LIKE 'group-%' THEN
      v_input_sku := substring(v_input_sku from 7);
    END IF;
    IF v_input_id LIKE 'group-%' THEN
      v_input_id := substring(v_input_id from 7);
    END IF;

    v_price_row := NULL;

    -- A. Exact SKU match
    SELECT * INTO v_price_row FROM menu_prices WHERE sku = v_input_sku;

    -- B. If not found and input_sku != input_id, try input_id
    IF v_price_row IS NULL AND v_input_id <> '' AND v_input_id <> v_input_sku THEN
      SELECT * INTO v_price_row FROM menu_prices WHERE sku = v_input_id;
    END IF;

    -- C. Try with 'dish-' prefix if missing (e.g. '284:full' -> 'dish-284:full' or '284' -> 'dish-284')
    IF v_price_row IS NULL AND NOT (v_input_sku LIKE 'dish-%') THEN
      SELECT * INTO v_price_row FROM menu_prices WHERE sku = ('dish-' || v_input_sku);
      IF v_price_row IS NULL AND v_input_id <> '' AND NOT (v_input_id LIKE 'dish-%') THEN
        SELECT * INTO v_price_row FROM menu_prices WHERE sku = ('dish-' || v_input_id);
      END IF;
    END IF;

    -- D. If sku contains colon (e.g. '284:full' or 'dish-284:full'), match base or variant
    IF v_price_row IS NULL AND v_input_sku LIKE '%:%' THEN
      SELECT * INTO v_price_row FROM menu_prices
      WHERE sku = split_part(v_input_sku, ':', 1)
         OR sku = ('dish-' || split_part(v_input_sku, ':', 1))
         OR (item_id = ('dish-' || split_part(v_input_sku, ':', 1)) AND lower(variant) = lower(split_part(v_input_sku, ':', 2)))
      LIMIT 1;
    END IF;

    -- E. If not found and variant is specified, try sku:variant
    IF v_price_row IS NULL AND v_item.variant IS NOT NULL AND trim(v_item.variant) <> '' THEN
      SELECT * INTO v_price_row FROM menu_prices
      WHERE sku = (v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\\s+', '', 'g')));
    END IF;

    -- F. If not found and input is numeric id (legacy catalog id), lookup item_id from menu_items
    IF v_price_row IS NULL THEN
      IF split_part(v_input_id, ':', 1) ~ '^[0-9]+$' THEN
        SELECT * INTO v_price_row FROM menu_prices
        WHERE item_id = ('dish-' || split_part(v_input_id, ':', 1)) OR sku = ('dish-' || split_part(v_input_id, ':', 1))
        LIMIT 1;
        IF v_price_row IS NULL THEN
          SELECT p.* INTO v_price_row
          FROM menu_prices p
          JOIN menu_items m ON m.item_id = p.item_id
          WHERE m.id = split_part(v_input_id, ':', 1)::int
          LIMIT 1;
        END IF;
      ELSIF split_part(v_input_sku, ':', 1) ~ '^[0-9]+$' THEN
        SELECT * INTO v_price_row FROM menu_prices
        WHERE item_id = ('dish-' || split_part(v_input_sku, ':', 1)) OR sku = ('dish-' || split_part(v_input_sku, ':', 1))
        LIMIT 1;
        IF v_price_row IS NULL THEN
          SELECT p.* INTO v_price_row
          FROM menu_prices p
          JOIN menu_items m ON m.item_id = p.item_id
          WHERE m.id = split_part(v_input_sku, ':', 1)::int
          LIMIT 1;
        END IF;
      END IF;
    END IF;

    -- G. Exact name match fallback for items without sizes/variants (never choose a size)
    IF v_price_row IS NULL AND v_item.name IS NOT NULL AND trim(v_item.name) <> '' THEN
      SELECT p.* INTO v_price_row
      FROM menu_prices p
      JOIN menu_items m ON m.item_id = p.item_id
      WHERE lower(trim(m.name)) = lower(trim(v_item.name))
        AND (p.variant IS NULL OR p.variant = 'default' OR p.variant = '')
      LIMIT 1;
    END IF;

    -- If still not found, record as unknown_item
    IF v_price_row IS NULL THEN
      IF NOT (COALESCE(v_item.name, v_input_sku) = ANY(v_unknown_items)) THEN
        v_unknown_items := array_append(v_unknown_items, COALESCE(v_item.name, NULLIF(v_input_sku, ''), v_input_id));
      END IF;
      CONTINUE;
    END IF;

    SELECT * INTO v_menu_item FROM menu_items WHERE item_id = v_price_row.item_id LIMIT 1;
    v_item_name := COALESCE(v_menu_item.name, v_item.name, v_price_row.sku);

    IF (v_menu_item IS NOT NULL AND (v_menu_item.available = false OR v_menu_item.is_completed = true)) THEN
      IF NOT (v_item_name = ANY(v_unavailable_items)) THEN
        v_unavailable_items := array_append(v_unavailable_items, v_item_name);
      END IF;
    END IF;

    IF v_is_delivery AND v_menu_item IS NOT NULL AND v_menu_item.direct_order_eligible = false THEN
      RAISE EXCEPTION 'Item "%" is not eligible for delivery. Please choose pickup or select another item.', v_item_name;
    END IF;

    v_unit_price := v_price_row.price;
    v_calculated_subtotal := v_calculated_subtotal + (v_unit_price * v_item_qty);

    v_price_lines := array_append(v_price_lines, jsonb_build_object(
      'sku', v_price_row.sku,
      'unit_price', v_unit_price
    ));

    v_snapshot_lines := array_append(v_snapshot_lines, jsonb_build_object(
      'sku', v_price_row.sku,
      'item_id', v_price_row.item_id,
      'name', v_item_name,
      'quantity', v_item_qty,
      'unit_price', v_unit_price,
      'line_total', (v_unit_price * v_item_qty)
    ));

    IF v_item_index > 0 THEN
      v_items_formatted_text := v_items_formatted_text || ', ';
    END IF;
    v_items_formatted_text := v_items_formatted_text || v_item_qty || 'x ' || v_item_name || ' (₹' || (v_unit_price * v_item_qty) || ')';
    v_item_index := v_item_index + 1;
  END LOOP;

  IF cardinality(v_unknown_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'unknown_item',
      'items', to_jsonb(v_unknown_items)
    );
  END IF;

  IF cardinality(v_unavailable_items) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'item_unavailable',
      'items', to_jsonb(v_unavailable_items)
    );
  END IF;

  SELECT * INTO v_sale FROM sale_settings WHERE id = 1;
  IF FOUND AND v_sale.sale_active = true AND (v_sale.sale_ends_at IS NULL OR now() <= v_sale.sale_ends_at) THEN
    IF v_sale.min_order_amount > 0 AND v_calculated_subtotal >= v_sale.min_order_amount AND v_sale.sale_percent > 0 THEN
      v_sale_discount := round((v_calculated_subtotal * v_sale.sale_percent) / 100.0);
    END IF;

    IF v_sale.free_item_name IS NOT NULL AND trim(v_sale.free_item_name) <> '' THEN
      IF v_calculated_subtotal >= COALESCE(v_sale.free_item_min_amount, v_sale.min_order_amount) THEN
        v_free_item_name := trim(v_sale.free_item_name);
        v_items_formatted_text := v_items_formatted_text || ', 1x ' || v_free_item_name || ' (₹0 Free Item)';
      END IF;
    END IF;

    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
      IF upper(trim(p_coupon_code)) = upper(trim(v_sale.coupon_code)) THEN
        IF v_calculated_subtotal >= v_sale.min_order_amount THEN
          v_coupon_discount := COALESCE(v_sale.coupon_flat_discount, 0);
        END IF;
      END IF;
    END IF;
  END IF;

  v_total_discount := LEAST(v_calculated_subtotal, v_sale_discount + v_coupon_discount);
  v_final_total := GREATEST(0, v_calculated_subtotal - v_total_discount);

  IF p_expected_total IS NOT NULL AND round(p_expected_total) <> round(v_final_total) THEN
    RETURN jsonb_build_object(
      'success', false,
      'status', 'price_changed',
      'server_total', v_final_total,
      'lines', to_jsonb(v_price_lines)
    );
  END IF;

  LOOP
    v_order_code := '';
    FOR i IN 1..8 LOOP
      v_order_code := v_order_code || substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', floor(random() * 32 + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = v_order_code) THEN
      EXIT;
    END IF;
  END LOOP;

  v_order_snapshot := jsonb_build_object(
    'lines', to_jsonb(v_snapshot_lines),
    'subtotal', v_calculated_subtotal,
    'discount', v_total_discount,
    'final_total', v_final_total,
    'free_item', v_free_item_name,
    'created_at', now()
  );

  INSERT INTO orders (
    order_code,
    customer_name,
    customer_phone,
    order_type,
    distance_km,
    address_notes,
    maps_link,
    items_json,
    items_snapshot,
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
    v_order_snapshot,
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
\$\$;

-- 6. Permissions for Upgraded Functions
REVOKE ALL ON FUNCTION get_live_menu() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_live_menu() TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_set_available(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_available(text, text, boolean) TO anon, authenticated;

REVOKE ALL ON FUNCTION admin_set_price(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_price(text, text, integer) TO anon, authenticated;

REVOKE ALL ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_verified_order(text, text, text, numeric, jsonb, text, text, text, text, text, numeric) TO anon, authenticated;

COMMIT;
`;

fs.writeFileSync(path.join(rootDir, 'supabase_setup.sql'), setupSql, 'utf8');
console.log('Successfully generated supabase_setup.sql with standalone migration block!');
