-- =====================================================================
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
  v_norm_phone := regexp_replace(p_customer_phone, '\D', '', 'g');
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
      WHERE sku = (v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\s+', '', 'g')))
         OR sku = ('dish-' || v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\s+', '', 'g')));
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
-- =====================================================================
-- AUTOMATICALLY GENERATED MENU SEED SCRIPT
-- Generated at: 2026-10-26T22:08:41.057Z
-- Total items: 284, Total price SKUs: 318
-- Safe and idempotent: ON CONFLICT DO NOTHING preserves owner edits
-- =====================================================================

-- 1. Seed Menu Items
INSERT INTO menu_items (item_id, name, category, price, aggregator_price, is_veg, available)
VALUES
  ('dish-1', 'Mushroom Corn Soup', 'veg-soups', 140, NULL, true, true),
  ('dish-2', 'Sweet Corn Soup', 'veg-soups', 140, NULL, true, true),
  ('dish-3', 'Veg. Hot & Sour Soup', 'veg-soups', 140, NULL, true, true),
  ('dish-4', 'Veg. Manchow Soup', 'veg-soups', 150, NULL, true, true),
  ('dish-5', 'Cream of Mushroom Soup', 'veg-soups', 190, NULL, true, true),
  ('dish-6', 'Lemon Coriander Soup', 'veg-soups', 190, NULL, true, true),
  ('dish-7', 'Tomato Soup', 'veg-soups', 140, NULL, true, true),
  ('dish-8', 'Chicken Hot & Sour Soup', 'non-veg-soups', 140, NULL, false, true),
  ('dish-9', 'Chicken Manchow Soup', 'non-veg-soups', 140, NULL, false, true),
  ('dish-10', 'Chicken Corn Soup', 'non-veg-soups', 140, NULL, false, true),
  ('dish-11', 'Chicken Coriander Soup', 'non-veg-soups', 150, NULL, false, true),
  ('dish-12', 'Mutton Bone Soup', 'non-veg-soups', 190, NULL, false, true),
  ('dish-13', 'Mutton Pepper Soup', 'non-veg-soups', 190, NULL, false, true),
  ('dish-21', 'Andhra Karivepaku Mutton', 'vaibhav-special-starters', 499, NULL, false, true),
  ('dish-14', 'Andhra Karivepaku Chicken', 'vaibhav-special-starters', 399, NULL, false, true),
  ('dish-15', 'Butterfly Chicken', 'vaibhav-special-starters', 399, NULL, false, true),
  ('dish-16', 'Garlic Chicken Keema Balls', 'vaibhav-special-starters', 399, NULL, false, true),
  ('dish-17', 'Dragon Crispy Chicken', 'vaibhav-special-starters', 399, NULL, false, true),
  ('dish-18', 'Arabian Prawns', 'vaibhav-special-starters', 499, NULL, false, true),
  ('dish-19', 'Arabian Fish', 'vaibhav-special-starters', 499, NULL, false, true),
  ('dish-20', 'Vaibhav''s Non-Veg. Platter', 'vaibhav-special-starters', 999, NULL, false, true),
  ('dish-22', 'Chitti Muthyalu Mutton Biryani', 'nattu-specials', 420, NULL, false, true),
  ('dish-23', 'Chitti Muthyalu Chicken Biryani', 'nattu-specials', 270, NULL, false, true),
  ('dish-24', 'Rayalaseema Chicken Curry with Ragi Sangati', 'nattu-specials', 350, NULL, false, true),
  ('dish-25', 'Mutton Paya with Ragi Sangati', 'nattu-specials', 400, NULL, false, true),
  ('dish-26', 'Chepala Pulusu with Ragi Sangati', 'nattu-specials', 280, NULL, false, true),
  ('dish-27', 'Mutton Pulusu with Ragi Sangati', 'nattu-specials', 420, NULL, false, true),
  ('dish-28', 'Special Curd Rice', 'nattu-specials', 120, NULL, true, true),
  ('dish-29', 'White Rice', 'nattu-specials', 100, NULL, true, true),
  ('dish-30', 'Raagi Ball', 'nattu-specials', 50, NULL, true, true),
  ('dish-31', 'Chilli Chicken', 'chicken-starters', 280, NULL, false, true),
  ('dish-32', 'Vaibhav''s Special Chicken', 'chicken-starters', 320, NULL, false, true),
  ('dish-33', 'Pepper Chicken', 'chicken-starters', 320, NULL, false, true),
  ('dish-34', 'Chicken Majestic', 'chicken-starters', 320, NULL, false, true),
  ('dish-35', 'Chicken 65', 'chicken-starters', 280, NULL, false, true),
  ('dish-36', 'Chicken Lollipop', 'chicken-starters', 300, NULL, false, true),
  ('dish-37', 'Chicken Drumstick', 'chicken-starters', 310, NULL, false, true),
  ('dish-38', 'Chicken Wings', 'chicken-starters', 300, NULL, false, true),
  ('dish-39', 'Cashew Nut Chicken', 'chicken-starters', 360, NULL, false, true),
  ('dish-40', 'Chicken Fry', 'chicken-starters', 280, NULL, false, true),
  ('dish-41', 'Chicken Roast', 'chicken-starters', 280, NULL, false, true),
  ('dish-42', 'Hong Kong Chicken', 'chicken-starters', 340, NULL, false, true),
  ('dish-43', 'Dragon Chicken', 'chicken-starters', 320, NULL, false, true),
  ('dish-44', 'Schezwan Hong Kong Chicken', 'chicken-starters', 360, NULL, false, true),
  ('dish-45', 'Rambo Chicken', 'chicken-starters', 340, NULL, false, true),
  ('dish-46', 'Chicken Manchurian', 'chicken-starters', 320, NULL, false, true),
  ('dish-47', 'Kaju Mutton Roast', 'mutton-starters', 450, NULL, false, true),
  ('dish-48', 'Mutton Ghee Roast', 'mutton-starters', 420, NULL, false, true),
  ('dish-49', 'Kaju Mutton Ghee Roast', 'mutton-starters', 460, NULL, false, true),
  ('dish-50', 'Mutton Fry', 'mutton-starters', 380, NULL, false, true),
  ('dish-51', 'Fish Finger', 'fish-starters', 320, NULL, false, true),
  ('dish-52', 'Pepper Fish', 'fish-starters', 320, NULL, false, true),
  ('dish-53', 'Chilli Fish', 'fish-starters', 320, NULL, false, true),
  ('dish-54', 'Apollo Fish', 'fish-starters', 330, NULL, false, true),
  ('dish-55', 'Fish 65', 'fish-starters', 330, NULL, false, true),
  ('dish-56', 'Loose Prawns', 'prawns-starters', 350, NULL, false, true),
  ('dish-57', 'Chilli Prawns', 'prawns-starters', 350, NULL, false, true),
  ('dish-58', 'Pepper Prawns', 'prawns-starters', 350, NULL, false, true),
  ('dish-59', 'Prawns 65', 'prawns-starters', 350, NULL, false, true),
  ('dish-60', 'Egg Chilly', 'egg-starters', 180, NULL, false, true),
  ('dish-61', 'Egg 65', 'egg-starters', 180, NULL, false, true),
  ('dish-62', 'Omelette', 'egg-starters', 80, NULL, false, true),
  ('dish-63', 'Special Omelette', 'egg-starters', 100, NULL, false, true),
  ('dish-64', 'Egg Manchurian', 'egg-starters', 200, NULL, false, true),
  ('dish-65', 'Boiled Egg', 'egg-starters', 20, NULL, false, true),
  ('dish-66', 'Dragon Egg', 'egg-starters', 200, NULL, false, true),
  ('dish-67', 'Veg. Manchurian', 'veg-starters', 260, NULL, true, true),
  ('dish-68', 'Veg. 65', 'veg-starters', 270, NULL, true, true),
  ('dish-69', 'Baby Corn 65', 'veg-starters', 270, NULL, true, true),
  ('dish-70', 'Baby Corn Chilly', 'veg-starters', 280, NULL, true, true),
  ('dish-71', 'Crispy Baby Corn', 'veg-starters', 280, NULL, true, true),
  ('dish-72', 'Baby Corn 555', 'veg-starters', 290, NULL, true, true),
  ('dish-73', 'Crispy Corn', 'veg-starters', 260, NULL, true, true),
  ('dish-74', 'Paneer Manchurian', 'veg-starters', 290, NULL, true, true),
  ('dish-75', 'Paneer 65', 'veg-starters', 280, NULL, true, true),
  ('dish-76', 'Chilli Paneer', 'veg-starters', 280, NULL, true, true),
  ('dish-77', 'Paneer Majestic', 'veg-starters', 290, NULL, true, true),
  ('dish-78', 'Paneer Pakoda', 'veg-starters', 280, NULL, true, true),
  ('dish-79', 'Gobi Manchuria', 'veg-starters', 220, NULL, true, true),
  ('dish-80', 'Gobi 65', 'veg-starters', 200, NULL, true, true),
  ('dish-81', 'Chilli Gobi', 'veg-starters', 180, NULL, true, true),
  ('dish-82', 'Mushroom Manchurian', 'veg-starters', 280, NULL, true, true),
  ('dish-83', 'Mushroom 65', 'veg-starters', 280, NULL, true, true),
  ('dish-84', 'Mushroom Chilli', 'veg-starters', 280, NULL, true, true),
  ('dish-85', 'Mushroom Pepper', 'veg-starters', 300, NULL, true, true),
  ('dish-86', 'Veg. Platter', 'veg-starters', 570, NULL, true, true),
  ('dish-87', 'French Fries', 'veg-starters', 200, NULL, true, true),
  ('dish-88', 'Tandoori Chicken Half', 'tandoori-fusion', 280, NULL, false, true),
  ('dish-89', 'Tandoori Chicken Full', 'tandoori-fusion', 500, NULL, false, true),
  ('dish-90', 'Tangdi Kabab Half (2 Pcs.)', 'tandoori-fusion', 190, NULL, false, true),
  ('dish-91', 'Tangdi Kabab Full (4 Pcs.)', 'tandoori-fusion', 380, NULL, false, true),
  ('dish-92', 'Grill Chicken Half', 'tandoori-fusion', 260, NULL, false, true),
  ('dish-93', 'Grill Chicken Full', 'tandoori-fusion', 500, NULL, false, true),
  ('dish-94', 'Alfaham Chicken Half', 'tandoori-fusion', 280, NULL, false, true),
  ('dish-95', 'Alfaham Chicken Full', 'tandoori-fusion', 520, NULL, false, true),
  ('dish-96', 'Chicken Tikka', 'tandoori-fusion', 360, NULL, false, true),
  ('dish-97', 'Malai Chicken Tikka', 'tandoori-fusion', 380, NULL, false, true),
  ('dish-98', 'Garlic Chicken Kabab', 'tandoori-fusion', 380, NULL, false, true),
  ('dish-99', 'Chicken Seekh Kabab', 'tandoori-fusion', 390, NULL, false, true),
  ('dish-100', 'Garlic Chicken Kabab', 'tandoori-fusion', 390, NULL, false, true),
  ('dish-101', 'Tiger Prawns Tikka (Sunday)', 'tandoori-fusion', 499, NULL, false, true),
  ('dish-102', 'Paneer Tikka', 'tandoori-fusion', 340, NULL, true, true),
  ('dish-103', 'Veg. Seekh Kabab', 'tandoori-fusion', 320, NULL, true, true),
  ('dish-104', 'Shawarma', 'shawarmas', 100, NULL, false, true),
  ('dish-105', 'Special Shawarma', 'shawarmas', 140, NULL, false, true),
  ('dish-106', 'Butter Shawarma', 'shawarmas', 130, NULL, false, true),
  ('dish-107', 'Special Butter Shawarma', 'shawarmas', 160, NULL, false, true),
  ('dish-108', 'Kaju Shawarma', 'shawarmas', 200, NULL, false, true),
  ('dish-109', 'Plate Shawarma', 'shawarmas', 170, NULL, false, true),
  ('dish-110', 'Chicken Dum Biryani', 'biriyanis', 230, NULL, false, true),
  ('dish-111', 'Mutton Dum Biryani', 'biriyanis', 400, NULL, false, true),
  ('dish-112', 'Chicken Fry Biryani', 'biriyanis', 280, NULL, false, true),
  ('dish-113', 'Mutton Fry Biryani', 'biriyanis', 420, NULL, false, true),
  ('dish-114', 'Chicken Joint Biryani', 'biriyanis', 320, NULL, false, true),
  ('dish-115', 'Chicken Kabab Biryani', 'biriyanis', 320, NULL, false, true),
  ('dish-116', 'Lollipop Biryani', 'biriyanis', 330, NULL, false, true),
  ('dish-117', 'Special Chicken Biryani', 'biriyanis', 320, NULL, false, true),
  ('dish-118', 'Mughalai Chicken Biryani', 'biriyanis', 310, NULL, false, true),
  ('dish-119', 'Gongura Chicken Biryani', 'biriyanis', 320, NULL, false, true),
  ('dish-120', 'Chicken Tikka Biryani', 'biriyanis', 330, NULL, false, true),
  ('dish-121', 'Alfaham Chicken Biryani', 'biriyanis', 330, NULL, false, true),
  ('dish-122', 'Tandoori Chicken Biryani', 'biriyanis', 300, NULL, false, true),
  ('dish-123', 'Grill Chicken Biryani', 'biriyanis', 300, NULL, false, true),
  ('dish-124', 'Fish Biryani', 'biriyanis', 340, NULL, false, true),
  ('dish-125', 'Prawns Biryani', 'biriyanis', 380, NULL, false, true),
  ('dish-126', 'Egg Biryani', 'biriyanis', 180, NULL, false, true),
  ('dish-127', 'Mixed Biryani (Non-Veg.)', 'biriyanis', 420, NULL, false, true),
  ('dish-128', 'Rambo Chicken Biryani', 'biriyanis', 420, NULL, false, true),
  ('dish-129', 'Biryani Rice', 'biriyanis', 140, NULL, false, true),
  ('dish-130', 'Veg. Biryani', 'veg-biryani', 220, NULL, true, true),
  ('dish-131', 'Kaju Biryani', 'veg-biryani', 260, NULL, true, true),
  ('dish-132', 'Kaju Paneer Biryani', 'veg-biryani', 300, NULL, true, true),
  ('dish-133', 'Paneer Biryani', 'veg-biryani', 280, NULL, true, true),
  ('dish-134', 'Mushroom Biryani', 'veg-biryani', 280, NULL, true, true),
  ('dish-135', 'Mixed Biryani (Veg.)', 'veg-biryani', 330, NULL, true, true),
  ('dish-136', 'Chicken Mandi (Single)', 'arabic-mandi', 300, NULL, false, true),
  ('dish-137', 'Tandoori Mandi (Single)', 'arabic-mandi', 320, NULL, false, true),
  ('dish-138', 'Chicken Mandi (Half)', 'arabic-mandi', 500, NULL, false, true),
  ('dish-139', 'Chicken Mandi (Full)', 'arabic-mandi', 980, NULL, false, true),
  ('dish-140', 'Tandoori Chicken Mandi (Half)', 'arabic-mandi', 550, NULL, false, true),
  ('dish-141', 'Tandoori Chicken Mandi (Full)', 'arabic-mandi', 1000, NULL, false, true),
  ('dish-142', 'Alfaham Chicken Mandi (Half)', 'arabic-mandi', 580, NULL, false, true),
  ('dish-143', 'Alfaham Chicken Mandi (Full)', 'arabic-mandi', 1050, NULL, false, true),
  ('dish-144', 'Vaibhav Special Mandi (Half)', 'arabic-mandi', 1050, NULL, false, true),
  ('dish-145', 'Vaibhav Special Mandi (Full)', 'arabic-mandi', 1990, NULL, false, true),
  ('dish-146', 'Alfaham Juicy Mandi (Half)', 'arabic-mandi', 680, NULL, false, true),
  ('dish-147', 'Alfaham Juicy Mandi (Full)', 'arabic-mandi', 1290, NULL, false, true),
  ('dish-148', 'Mutton Juicy Mandi (Half)', 'arabic-mandi', 990, NULL, false, true),
  ('dish-149', 'Mutton Juicy Mandi (Full)', 'arabic-mandi', 1950, NULL, false, true),
  ('dish-150', 'Chicken Fried Rice', 'non-veg-fried-rice', 240, NULL, false, true),
  ('dish-151', 'Schezwan Chicken Fried Rice', 'non-veg-fried-rice', 260, NULL, false, true),
  ('dish-152', 'Prawns Fried Rice', 'non-veg-fried-rice', 320, NULL, false, true),
  ('dish-153', 'Egg Fried Rice', 'non-veg-fried-rice', 190, NULL, false, true),
  ('dish-154', 'Schezwan Egg Fried Rice', 'non-veg-fried-rice', 210, NULL, false, true),
  ('dish-155', 'Special Chicken Fried Rice', 'non-veg-fried-rice', 280, NULL, false, true),
  ('dish-156', 'Veg. Fried Rice', 'veg-fried-rice', 170, NULL, true, true),
  ('dish-157', 'Gobi Fried Rice', 'veg-fried-rice', 180, NULL, true, true),
  ('dish-158', 'Zeera Rice', 'veg-fried-rice', 180, NULL, true, true),
  ('dish-159', 'Ghee Rice', 'veg-fried-rice', 210, NULL, true, true),
  ('dish-160', 'Mushroom Fried Rice', 'veg-fried-rice', 240, NULL, true, true),
  ('dish-161', 'Paneer Fried Rice', 'veg-fried-rice', 240, NULL, true, true),
  ('dish-162', 'Kaju Fried Rice', 'veg-fried-rice', 280, NULL, true, true),
  ('dish-163', 'Schezwan Fried Rice', 'veg-fried-rice', 230, NULL, true, true),
  ('dish-164', 'Baby Corn Fried Rice', 'veg-fried-rice', 240, NULL, true, true),
  ('dish-165', 'Mixed Veg. Fried Rice', 'veg-fried-rice', 260, NULL, true, true),
  ('dish-166', 'Dalkichidi', 'veg-fried-rice', 220, NULL, true, true),
  ('dish-167', 'Egg Noodles', 'non-veg-noodles', 220, NULL, false, true),
  ('dish-168', 'Schezwan Egg Noodles', 'non-veg-noodles', 240, NULL, false, true),
  ('dish-169', 'Chicken Noodles', 'non-veg-noodles', 260, NULL, false, true),
  ('dish-170', 'Chicken Schezwan Noodles', 'non-veg-noodles', 280, NULL, false, true),
  ('dish-171', 'Prawns Noodles', 'non-veg-noodles', 350, NULL, false, true),
  ('dish-172', 'Veg. Noodles', 'veg-noodles', 200, NULL, true, true),
  ('dish-173', 'Gobi Noodles', 'veg-noodles', 200, NULL, true, true),
  ('dish-174', 'Paneer Noodles', 'veg-noodles', 250, NULL, true, true),
  ('dish-175', 'Mushroom Noodles', 'veg-noodles', 250, NULL, true, true),
  ('dish-176', 'Manchurian Noodles', 'veg-noodles', 260, NULL, true, true),
  ('dish-177', 'Veg. Hakka Noodles', 'veg-noodles', 250, NULL, true, true),
  ('dish-178', 'Veg. Pulav', 'veg-pulavs', 200, NULL, true, true),
  ('dish-179', 'Kaju Pulav', 'veg-pulavs', 280, NULL, true, true),
  ('dish-180', 'Paneer Pulav', 'veg-pulavs', 280, NULL, true, true),
  ('dish-181', 'Mushroom Pulav', 'veg-pulavs', 280, NULL, true, true),
  ('dish-182', 'Tandoori Roti', 'indian-breads', 30, NULL, true, true),
  ('dish-183', 'Butter Roti', 'indian-breads', 35, NULL, true, true),
  ('dish-184', 'Plain Naan', 'indian-breads', 55, NULL, true, true),
  ('dish-185', 'Butter Naan', 'indian-breads', 65, NULL, true, true),
  ('dish-186', 'Garlic Naan', 'indian-breads', 70, NULL, true, true),
  ('dish-187', 'Rumali Roti', 'indian-breads', 55, NULL, true, true),
  ('dish-188', 'Kulcha', 'indian-breads', 50, NULL, true, true),
  ('dish-189', 'Butter Kulcha', 'indian-breads', 55, NULL, true, true),
  ('dish-190', 'Onion Kulcha', 'indian-breads', 70, NULL, true, true),
  ('dish-191', 'Masala Kulcha', 'indian-breads', 90, NULL, true, true),
  ('dish-192', 'Paneer Kulcha', 'indian-breads', 90, NULL, true, true),
  ('dish-193', 'Aloo Parota', 'indian-breads', 90, NULL, true, true),
  ('dish-194', 'Parota', 'indian-breads', 50, NULL, true, true),
  ('dish-195', 'Plain Papad', 'indian-breads', 40, NULL, true, true),
  ('dish-196', 'Masala Papad', 'indian-breads', 80, NULL, true, true),
  ('dish-197', 'Kadai Veg.', 'veg-curries', 250, NULL, true, true),
  ('dish-198', 'Mixed Veg. Curry', 'veg-curries', 240, NULL, true, true),
  ('dish-199', 'Veg. Mughlai Curry', 'veg-curries', 280, NULL, true, true),
  ('dish-200', 'Veg. Kofta Curry', 'veg-curries', 270, NULL, true, true),
  ('dish-201', 'Malai Kofta Curry', 'veg-curries', 250, NULL, true, true),
  ('dish-202', 'Shahi Paneer', 'veg-curries', 270, NULL, true, true),
  ('dish-203', 'Paneer Butter Masala', 'veg-curries', 250, NULL, true, true),
  ('dish-204', 'Kadai Paneer', 'veg-curries', 280, NULL, true, true),
  ('dish-205', 'Methi Chaman', 'veg-curries', 270, NULL, true, true),
  ('dish-206', 'Kaju Paneer Masala', 'veg-curries', 280, NULL, true, true),
  ('dish-207', 'Kaju Masala Curry', 'veg-curries', 280, NULL, true, true),
  ('dish-208', 'Mutter Paneer', 'veg-curries', 280, NULL, true, true),
  ('dish-209', 'Aloo Gobi', 'veg-curries', 180, NULL, true, true),
  ('dish-210', 'Aloo Mutter', 'veg-curries', 200, NULL, true, true),
  ('dish-211', 'Aloo Palak', 'veg-curries', 260, NULL, true, true),
  ('dish-212', 'Paneer Kheema Masala', 'veg-curries', 280, NULL, true, true),
  ('dish-213', 'Palak Paneer', 'veg-curries', 270, NULL, true, true),
  ('dish-214', 'Plain Palak', 'veg-curries', 220, NULL, true, true),
  ('dish-215', 'Methi Paneer', 'veg-curries', 280, NULL, true, true),
  ('dish-216', 'Paneer Tikka Masala', 'veg-curries', 290, NULL, true, true),
  ('dish-217', 'Dal Fry', 'veg-curries', 200, NULL, true, true),
  ('dish-218', 'Dal Tadka', 'veg-curries', 220, NULL, true, true),
  ('dish-219', 'Kadai Mushroom', 'veg-curries', 280, NULL, true, true),
  ('dish-220', 'Mushroom Masala', 'veg-curries', 250, NULL, true, true),
  ('dish-221', 'Baby Corn Masala', 'veg-curries', 260, NULL, true, true),
  ('dish-222', 'Paneer Makhani', 'veg-curries', 280, NULL, true, true),
  ('dish-223', 'Chicken Curry (Bone)', 'chicken-curries', 240, NULL, false, true),
  ('dish-224', 'Chicken Curry (Boneless)', 'chicken-curries', 290, NULL, false, true),
  ('dish-225', 'Andhra Chicken Curry (Spicy)', 'chicken-curries', 260, NULL, false, true),
  ('dish-226', 'Chicken Rayalaseema', 'chicken-curries', 280, NULL, false, true),
  ('dish-227', 'Special Chicken Curry', 'chicken-curries', 280, NULL, false, true),
  ('dish-228', 'Kadai Chicken', 'chicken-curries', 280, NULL, false, true),
  ('dish-229', 'Butter Chicken', 'chicken-curries', 280, NULL, false, true),
  ('dish-230', 'Chicken Murgh Masala', 'chicken-curries', 300, NULL, false, true),
  ('dish-231', 'Chicken Kheema Curry', 'chicken-curries', 320, NULL, false, true),
  ('dish-232', 'Chicken Tikka Masala', 'chicken-curries', 320, NULL, false, true),
  ('dish-233', 'Wings Masala', 'chicken-curries', 320, NULL, false, true),
  ('dish-234', 'Chicken Mughalai Curry', 'chicken-curries', 320, NULL, false, true),
  ('dish-235', 'Kaju Chicken Curry', 'chicken-curries', 350, NULL, false, true),
  ('dish-236', 'Methi Chicken (Bone)', 'chicken-curries', 290, NULL, false, true),
  ('dish-237', 'Methi Chicken (Boneless)', 'chicken-curries', 340, NULL, false, true),
  ('dish-238', 'Punjabi Chicken Curry', 'chicken-curries', 320, NULL, false, true),
  ('dish-239', 'Afgani Chicken (Rambha)', 'chicken-curries', 320, NULL, false, true),
  ('dish-240', 'Palak Mutton', 'mutton-curry', 350, NULL, false, true),
  ('dish-241', 'Gongura Mutton', 'mutton-curry', 370, NULL, false, true),
  ('dish-242', 'Mutton Curry', 'mutton-curry', 360, NULL, false, true),
  ('dish-243', 'Kaju Mutton Curry', 'mutton-curry', 450, NULL, false, true),
  ('dish-244', 'Methi Mutton', 'mutton-curry', 350, NULL, false, true),
  ('dish-245', 'Vanilla Milkshake', 'milkshakes', 130, NULL, true, true),
  ('dish-246', 'Butterscotch Milkshake', 'milkshakes', 140, NULL, true, true),
  ('dish-247', 'Chocolate Milkshake', 'milkshakes', 140, NULL, true, true),
  ('dish-248', 'Oreo Milkshake', 'milkshakes', 170, NULL, true, true),
  ('dish-249', 'KitKat Milkshake', 'milkshakes', 170, NULL, true, true),
  ('dish-250', 'Butter Milk', 'beverages', 50, NULL, true, true),
  ('dish-251', 'Sweet Lassi', 'beverages', 80, NULL, true, true),
  ('dish-252', 'Lassi', 'beverages', 80, NULL, true, true),
  ('dish-253', 'Lemon Soda Sweet & Salt', 'beverages', 80, NULL, true, true),
  ('dish-254', 'Lemon Juice', 'beverages', 70, NULL, true, true),
  ('dish-255', 'Water 1 litre', 'beverages', 20, NULL, true, true),
  ('dish-256', 'Thumbs Up 250 ml', 'beverages', 20, NULL, true, true),
  ('dish-257', 'Sprite 250 ml', 'beverages', 20, NULL, true, true),
  ('dish-258', 'Coco Cola 250 ml', 'beverages', 20, NULL, true, true),
  ('dish-259', 'Goli Soda', 'beverages', 30, NULL, true, true),
  ('dish-260', 'Blue Lagoon Mocktail', 'mocktails', 130, NULL, true, true),
  ('dish-261', 'Green Mint Mocktail', 'mocktails', 130, NULL, true, true),
  ('dish-262', 'Naughty Water Melon Mocktail', 'mocktails', 150, NULL, true, true),
  ('dish-263', 'Orange Mocktail', 'mocktails', 130, NULL, true, true),
  ('dish-264', 'Gulab Jamun', 'desserts', 60, NULL, true, true),
  ('dish-265', 'Gulab Jamun with Ice Cream', 'desserts', 150, NULL, true, true),
  ('dish-266', 'Double Ka Meeta', 'desserts', 100, NULL, true, true),
  ('dish-267', 'Badham Kheer', 'desserts', 100, NULL, true, true),
  ('dish-268', 'Vanilla', 'ice-creams', 90, NULL, true, true),
  ('dish-269', 'Butterscotch', 'ice-creams', 90, NULL, true, true),
  ('dish-270', 'Strawberry', 'ice-creams', 90, NULL, true, true),
  ('dish-271', 'Black Current', 'ice-creams', 120, NULL, true, true),
  ('dish-272', 'Chocolate', 'ice-creams', 110, NULL, true, true),
  ('dish-273', 'Chicken Mandi Bucket Half', 'bucket-biryani', 550, NULL, false, true),
  ('dish-274', 'Chicken Mandi Bucket Full', 'bucket-biryani', 1000, NULL, false, true),
  ('dish-275', 'Alfaham Mandi Bucket Half', 'bucket-biryani', 600, NULL, false, true),
  ('dish-276', 'Alfaham Mandi Bucket Full', 'bucket-biryani', 1100, NULL, false, true),
  ('dish-277', 'Tandoori Chicken Mandi Bucket Half', 'bucket-biryani', 550, NULL, false, true),
  ('dish-278', 'Tandoori Chicken Mandi Bucket Full', 'bucket-biryani', 1000, NULL, false, true),
  ('dish-279', 'Alfaham Juicy Mandi Bucket Half', 'bucket-biryani', 630, NULL, false, true),
  ('dish-280', 'Alfaham Juicy Mandi Bucket Full', 'bucket-biryani', 1290, NULL, false, true),
  ('dish-281', 'Family Chicken Dum Biryani Half', 'bucket-biryani', 600, NULL, false, true),
  ('dish-282', 'Family Chicken Dum Biryani Full', 'bucket-biryani', 1100, NULL, false, true),
  ('dish-283', 'Mutton Dum Biryani Half', 'bucket-biryani', 990, NULL, false, true),
  ('dish-284', 'Mutton Dum Biryani Full', 'bucket-biryani', 1990, NULL, false, true)
ON CONFLICT (item_id) WHERE item_id IS NOT NULL DO UPDATE SET price = EXCLUDED.price, aggregator_price = EXCLUDED.aggregator_price;

-- 2. Seed Menu Prices (SKUs)
INSERT INTO menu_prices (sku, item_id, variant, price, mrp)
VALUES
  ('dish-1', 'dish-1', NULL, 140, NULL),
  ('dish-2', 'dish-2', NULL, 140, NULL),
  ('dish-3', 'dish-3', NULL, 140, NULL),
  ('dish-4', 'dish-4', NULL, 150, NULL),
  ('dish-5', 'dish-5', NULL, 190, NULL),
  ('dish-6', 'dish-6', NULL, 190, NULL),
  ('dish-7', 'dish-7', NULL, 140, NULL),
  ('dish-8', 'dish-8', NULL, 140, NULL),
  ('dish-9', 'dish-9', NULL, 140, NULL),
  ('dish-10', 'dish-10', NULL, 140, NULL),
  ('dish-11', 'dish-11', NULL, 150, NULL),
  ('dish-12', 'dish-12', NULL, 190, NULL),
  ('dish-13', 'dish-13', NULL, 190, NULL),
  ('dish-21', 'dish-21', NULL, 499, NULL),
  ('dish-14', 'dish-14', NULL, 399, NULL),
  ('dish-15', 'dish-15', NULL, 399, NULL),
  ('dish-16', 'dish-16', NULL, 399, NULL),
  ('dish-17', 'dish-17', NULL, 399, NULL),
  ('dish-18', 'dish-18', NULL, 499, NULL),
  ('dish-19', 'dish-19', NULL, 499, NULL),
  ('dish-20', 'dish-20', NULL, 999, NULL),
  ('dish-22', 'dish-22', NULL, 420, NULL),
  ('dish-23', 'dish-23', NULL, 270, NULL),
  ('dish-24', 'dish-24', NULL, 350, NULL),
  ('dish-25', 'dish-25', NULL, 400, NULL),
  ('dish-26', 'dish-26', NULL, 280, NULL),
  ('dish-27', 'dish-27', NULL, 420, NULL),
  ('dish-28', 'dish-28', NULL, 120, NULL),
  ('dish-29', 'dish-29', NULL, 100, NULL),
  ('dish-30', 'dish-30', NULL, 50, NULL),
  ('dish-31', 'dish-31', NULL, 280, NULL),
  ('dish-32', 'dish-32', NULL, 320, NULL),
  ('dish-33', 'dish-33', NULL, 320, NULL),
  ('dish-34', 'dish-34', NULL, 320, NULL),
  ('dish-35', 'dish-35', NULL, 280, NULL),
  ('dish-36', 'dish-36', NULL, 300, NULL),
  ('dish-37', 'dish-37', NULL, 310, NULL),
  ('dish-38', 'dish-38', NULL, 300, NULL),
  ('dish-39', 'dish-39', NULL, 360, NULL),
  ('dish-40', 'dish-40', NULL, 280, NULL),
  ('dish-41', 'dish-41', NULL, 280, NULL),
  ('dish-42', 'dish-42', NULL, 340, NULL),
  ('dish-43', 'dish-43', NULL, 320, NULL),
  ('dish-44', 'dish-44', NULL, 360, NULL),
  ('dish-45', 'dish-45', NULL, 340, NULL),
  ('dish-46', 'dish-46', NULL, 320, NULL),
  ('dish-47', 'dish-47', NULL, 450, NULL),
  ('dish-48', 'dish-48', NULL, 420, NULL),
  ('dish-49', 'dish-49', NULL, 460, NULL),
  ('dish-50', 'dish-50', NULL, 380, NULL),
  ('dish-51', 'dish-51', NULL, 320, NULL),
  ('dish-52', 'dish-52', NULL, 320, NULL),
  ('dish-53', 'dish-53', NULL, 320, NULL),
  ('dish-54', 'dish-54', NULL, 330, NULL),
  ('dish-55', 'dish-55', NULL, 330, NULL),
  ('dish-56', 'dish-56', NULL, 350, NULL),
  ('dish-57', 'dish-57', NULL, 350, NULL),
  ('dish-58', 'dish-58', NULL, 350, NULL),
  ('dish-59', 'dish-59', NULL, 350, NULL),
  ('dish-60', 'dish-60', NULL, 180, NULL),
  ('dish-61', 'dish-61', NULL, 180, NULL),
  ('dish-62', 'dish-62', NULL, 80, NULL),
  ('dish-63', 'dish-63', NULL, 100, NULL),
  ('dish-64', 'dish-64', NULL, 200, NULL),
  ('dish-65', 'dish-65', NULL, 20, NULL),
  ('dish-66', 'dish-66', NULL, 200, NULL),
  ('dish-67', 'dish-67', NULL, 260, NULL),
  ('dish-68', 'dish-68', NULL, 270, NULL),
  ('dish-69', 'dish-69', NULL, 270, NULL),
  ('dish-70', 'dish-70', NULL, 280, NULL),
  ('dish-71', 'dish-71', NULL, 280, NULL),
  ('dish-72', 'dish-72', NULL, 290, NULL),
  ('dish-73', 'dish-73', NULL, 260, NULL),
  ('dish-74', 'dish-74', NULL, 290, NULL),
  ('dish-75', 'dish-75', NULL, 280, NULL),
  ('dish-76', 'dish-76', NULL, 280, NULL),
  ('dish-77', 'dish-77', NULL, 290, NULL),
  ('dish-78', 'dish-78', NULL, 280, NULL),
  ('dish-79', 'dish-79', NULL, 220, NULL),
  ('dish-80', 'dish-80', NULL, 200, NULL),
  ('dish-81', 'dish-81', NULL, 180, NULL),
  ('dish-82', 'dish-82', NULL, 280, NULL),
  ('dish-83', 'dish-83', NULL, 280, NULL),
  ('dish-84', 'dish-84', NULL, 280, NULL),
  ('dish-85', 'dish-85', NULL, 300, NULL),
  ('dish-86', 'dish-86', NULL, 570, NULL),
  ('dish-87', 'dish-87', NULL, 200, NULL),
  ('dish-88', 'dish-88', 'Half', 280, NULL),
  ('dish-88:half', 'dish-88', 'Half', 280, NULL),
  ('dish-89', 'dish-89', 'Full', 500, NULL),
  ('dish-89:full', 'dish-89', 'Full', 500, NULL),
  ('dish-90', 'dish-90', '2 Pcs', 190, NULL),
  ('dish-90:2pcs', 'dish-90', '2 Pcs', 190, NULL),
  ('dish-91', 'dish-91', '4 Pcs', 380, NULL),
  ('dish-91:4pcs', 'dish-91', '4 Pcs', 380, NULL),
  ('dish-92', 'dish-92', 'Half', 260, NULL),
  ('dish-92:half', 'dish-92', 'Half', 260, NULL),
  ('dish-93', 'dish-93', 'Full', 500, NULL),
  ('dish-93:full', 'dish-93', 'Full', 500, NULL),
  ('dish-94', 'dish-94', 'Half', 280, NULL),
  ('dish-94:half', 'dish-94', 'Half', 280, NULL),
  ('dish-95', 'dish-95', 'Full', 520, NULL),
  ('dish-95:full', 'dish-95', 'Full', 520, NULL),
  ('dish-96', 'dish-96', NULL, 360, NULL),
  ('dish-97', 'dish-97', NULL, 380, NULL),
  ('dish-98', 'dish-98', NULL, 380, NULL),
  ('dish-99', 'dish-99', NULL, 390, NULL),
  ('dish-100', 'dish-100', NULL, 390, NULL),
  ('dish-101', 'dish-101', NULL, 499, NULL),
  ('dish-102', 'dish-102', NULL, 340, NULL),
  ('dish-103', 'dish-103', NULL, 320, NULL),
  ('dish-104', 'dish-104', NULL, 100, NULL),
  ('dish-105', 'dish-105', NULL, 140, NULL),
  ('dish-106', 'dish-106', NULL, 130, NULL),
  ('dish-107', 'dish-107', NULL, 160, NULL),
  ('dish-108', 'dish-108', NULL, 200, NULL),
  ('dish-109', 'dish-109', NULL, 170, NULL),
  ('dish-110', 'dish-110', NULL, 230, NULL),
  ('dish-111', 'dish-111', NULL, 400, NULL),
  ('dish-112', 'dish-112', NULL, 280, NULL),
  ('dish-113', 'dish-113', NULL, 420, NULL),
  ('dish-114', 'dish-114', NULL, 320, NULL),
  ('dish-115', 'dish-115', NULL, 320, NULL),
  ('dish-116', 'dish-116', NULL, 330, NULL),
  ('dish-117', 'dish-117', NULL, 320, NULL),
  ('dish-118', 'dish-118', NULL, 310, NULL),
  ('dish-119', 'dish-119', NULL, 320, NULL),
  ('dish-120', 'dish-120', NULL, 330, NULL),
  ('dish-121', 'dish-121', NULL, 330, NULL),
  ('dish-122', 'dish-122', NULL, 300, NULL),
  ('dish-123', 'dish-123', NULL, 300, NULL),
  ('dish-124', 'dish-124', NULL, 340, NULL),
  ('dish-125', 'dish-125', NULL, 380, NULL),
  ('dish-126', 'dish-126', NULL, 180, NULL),
  ('dish-127', 'dish-127', NULL, 420, NULL),
  ('dish-128', 'dish-128', NULL, 420, NULL),
  ('dish-129', 'dish-129', NULL, 140, NULL),
  ('dish-130', 'dish-130', NULL, 220, NULL),
  ('dish-131', 'dish-131', NULL, 260, NULL),
  ('dish-132', 'dish-132', NULL, 300, NULL),
  ('dish-133', 'dish-133', NULL, 280, NULL),
  ('dish-134', 'dish-134', NULL, 280, NULL),
  ('dish-135', 'dish-135', NULL, 330, NULL),
  ('dish-136', 'dish-136', 'Single', 300, NULL),
  ('dish-136:single', 'dish-136', 'Single', 300, NULL),
  ('dish-137', 'dish-137', 'Single', 320, NULL),
  ('dish-137:single', 'dish-137', 'Single', 320, NULL),
  ('dish-138', 'dish-138', 'Half', 500, NULL),
  ('dish-138:half', 'dish-138', 'Half', 500, NULL),
  ('dish-139', 'dish-139', 'Full', 980, NULL),
  ('dish-139:full', 'dish-139', 'Full', 980, NULL),
  ('dish-140', 'dish-140', 'Half', 550, NULL),
  ('dish-140:half', 'dish-140', 'Half', 550, NULL),
  ('dish-141', 'dish-141', 'Full', 1000, NULL),
  ('dish-141:full', 'dish-141', 'Full', 1000, NULL),
  ('dish-142', 'dish-142', 'Half', 580, NULL),
  ('dish-142:half', 'dish-142', 'Half', 580, NULL),
  ('dish-143', 'dish-143', 'Full', 1050, NULL),
  ('dish-143:full', 'dish-143', 'Full', 1050, NULL),
  ('dish-144', 'dish-144', 'Half', 1050, NULL),
  ('dish-144:half', 'dish-144', 'Half', 1050, NULL),
  ('dish-145', 'dish-145', 'Full', 1990, NULL),
  ('dish-145:full', 'dish-145', 'Full', 1990, NULL),
  ('dish-146', 'dish-146', 'Half', 680, NULL),
  ('dish-146:half', 'dish-146', 'Half', 680, NULL),
  ('dish-147', 'dish-147', 'Full', 1290, NULL),
  ('dish-147:full', 'dish-147', 'Full', 1290, NULL),
  ('dish-148', 'dish-148', 'Half', 990, NULL),
  ('dish-148:half', 'dish-148', 'Half', 990, NULL),
  ('dish-149', 'dish-149', 'Full', 1950, NULL),
  ('dish-149:full', 'dish-149', 'Full', 1950, NULL),
  ('dish-150', 'dish-150', NULL, 240, NULL),
  ('dish-151', 'dish-151', NULL, 260, NULL),
  ('dish-152', 'dish-152', NULL, 320, NULL),
  ('dish-153', 'dish-153', NULL, 190, NULL),
  ('dish-154', 'dish-154', NULL, 210, NULL),
  ('dish-155', 'dish-155', NULL, 280, NULL),
  ('dish-156', 'dish-156', NULL, 170, NULL),
  ('dish-157', 'dish-157', NULL, 180, NULL),
  ('dish-158', 'dish-158', NULL, 180, NULL),
  ('dish-159', 'dish-159', NULL, 210, NULL),
  ('dish-160', 'dish-160', NULL, 240, NULL),
  ('dish-161', 'dish-161', NULL, 240, NULL),
  ('dish-162', 'dish-162', NULL, 280, NULL),
  ('dish-163', 'dish-163', NULL, 230, NULL),
  ('dish-164', 'dish-164', NULL, 240, NULL),
  ('dish-165', 'dish-165', NULL, 260, NULL),
  ('dish-166', 'dish-166', NULL, 220, NULL),
  ('dish-167', 'dish-167', NULL, 220, NULL),
  ('dish-168', 'dish-168', NULL, 240, NULL),
  ('dish-169', 'dish-169', NULL, 260, NULL),
  ('dish-170', 'dish-170', NULL, 280, NULL),
  ('dish-171', 'dish-171', NULL, 350, NULL),
  ('dish-172', 'dish-172', NULL, 200, NULL),
  ('dish-173', 'dish-173', NULL, 200, NULL),
  ('dish-174', 'dish-174', NULL, 250, NULL),
  ('dish-175', 'dish-175', NULL, 250, NULL),
  ('dish-176', 'dish-176', NULL, 260, NULL),
  ('dish-177', 'dish-177', NULL, 250, NULL),
  ('dish-178', 'dish-178', NULL, 200, NULL),
  ('dish-179', 'dish-179', NULL, 280, NULL),
  ('dish-180', 'dish-180', NULL, 280, NULL),
  ('dish-181', 'dish-181', NULL, 280, NULL),
  ('dish-182', 'dish-182', NULL, 30, NULL),
  ('dish-183', 'dish-183', NULL, 35, NULL),
  ('dish-184', 'dish-184', NULL, 55, NULL),
  ('dish-185', 'dish-185', NULL, 65, NULL),
  ('dish-186', 'dish-186', NULL, 70, NULL),
  ('dish-187', 'dish-187', NULL, 55, NULL),
  ('dish-188', 'dish-188', NULL, 50, NULL),
  ('dish-189', 'dish-189', NULL, 55, NULL),
  ('dish-190', 'dish-190', NULL, 70, NULL),
  ('dish-191', 'dish-191', NULL, 90, NULL),
  ('dish-192', 'dish-192', NULL, 90, NULL),
  ('dish-193', 'dish-193', NULL, 90, NULL),
  ('dish-194', 'dish-194', NULL, 50, NULL),
  ('dish-195', 'dish-195', NULL, 40, NULL),
  ('dish-196', 'dish-196', NULL, 80, NULL),
  ('dish-197', 'dish-197', NULL, 250, NULL),
  ('dish-198', 'dish-198', NULL, 240, NULL),
  ('dish-199', 'dish-199', NULL, 280, NULL),
  ('dish-200', 'dish-200', NULL, 270, NULL),
  ('dish-201', 'dish-201', NULL, 250, NULL),
  ('dish-202', 'dish-202', NULL, 270, NULL),
  ('dish-203', 'dish-203', NULL, 250, NULL),
  ('dish-204', 'dish-204', NULL, 280, NULL),
  ('dish-205', 'dish-205', NULL, 270, NULL),
  ('dish-206', 'dish-206', NULL, 280, NULL),
  ('dish-207', 'dish-207', NULL, 280, NULL),
  ('dish-208', 'dish-208', NULL, 280, NULL),
  ('dish-209', 'dish-209', NULL, 180, NULL),
  ('dish-210', 'dish-210', NULL, 200, NULL),
  ('dish-211', 'dish-211', NULL, 260, NULL),
  ('dish-212', 'dish-212', NULL, 280, NULL),
  ('dish-213', 'dish-213', NULL, 270, NULL),
  ('dish-214', 'dish-214', NULL, 220, NULL),
  ('dish-215', 'dish-215', NULL, 280, NULL),
  ('dish-216', 'dish-216', NULL, 290, NULL),
  ('dish-217', 'dish-217', NULL, 200, NULL),
  ('dish-218', 'dish-218', NULL, 220, NULL),
  ('dish-219', 'dish-219', NULL, 280, NULL),
  ('dish-220', 'dish-220', NULL, 250, NULL),
  ('dish-221', 'dish-221', NULL, 260, NULL),
  ('dish-222', 'dish-222', NULL, 280, NULL),
  ('dish-223', 'dish-223', NULL, 240, NULL),
  ('dish-224', 'dish-224', NULL, 290, NULL),
  ('dish-225', 'dish-225', NULL, 260, NULL),
  ('dish-226', 'dish-226', NULL, 280, NULL),
  ('dish-227', 'dish-227', NULL, 280, NULL),
  ('dish-228', 'dish-228', NULL, 280, NULL),
  ('dish-229', 'dish-229', NULL, 280, NULL),
  ('dish-230', 'dish-230', NULL, 300, NULL),
  ('dish-231', 'dish-231', NULL, 320, NULL),
  ('dish-232', 'dish-232', NULL, 320, NULL),
  ('dish-233', 'dish-233', NULL, 320, NULL),
  ('dish-234', 'dish-234', NULL, 320, NULL),
  ('dish-235', 'dish-235', NULL, 350, NULL),
  ('dish-236', 'dish-236', NULL, 290, NULL),
  ('dish-237', 'dish-237', NULL, 340, NULL),
  ('dish-238', 'dish-238', NULL, 320, NULL),
  ('dish-239', 'dish-239', NULL, 320, NULL),
  ('dish-240', 'dish-240', NULL, 350, NULL),
  ('dish-241', 'dish-241', NULL, 370, NULL),
  ('dish-242', 'dish-242', NULL, 360, NULL),
  ('dish-243', 'dish-243', NULL, 450, NULL),
  ('dish-244', 'dish-244', NULL, 350, NULL),
  ('dish-245', 'dish-245', NULL, 130, NULL),
  ('dish-246', 'dish-246', NULL, 140, NULL),
  ('dish-247', 'dish-247', NULL, 140, NULL),
  ('dish-248', 'dish-248', NULL, 170, NULL),
  ('dish-249', 'dish-249', NULL, 170, NULL),
  ('dish-250', 'dish-250', NULL, 50, NULL),
  ('dish-251', 'dish-251', NULL, 80, NULL),
  ('dish-252', 'dish-252', NULL, 80, NULL),
  ('dish-253', 'dish-253', NULL, 80, NULL),
  ('dish-254', 'dish-254', NULL, 70, NULL),
  ('dish-255', 'dish-255', NULL, 20, NULL),
  ('dish-256', 'dish-256', NULL, 20, NULL),
  ('dish-257', 'dish-257', NULL, 20, NULL),
  ('dish-258', 'dish-258', NULL, 20, NULL),
  ('dish-259', 'dish-259', NULL, 30, NULL),
  ('dish-260', 'dish-260', NULL, 130, NULL),
  ('dish-261', 'dish-261', NULL, 130, NULL),
  ('dish-262', 'dish-262', NULL, 150, NULL),
  ('dish-263', 'dish-263', NULL, 130, NULL),
  ('dish-264', 'dish-264', NULL, 60, NULL),
  ('dish-265', 'dish-265', NULL, 150, NULL),
  ('dish-266', 'dish-266', NULL, 100, NULL),
  ('dish-267', 'dish-267', NULL, 100, NULL),
  ('dish-268', 'dish-268', NULL, 90, NULL),
  ('dish-269', 'dish-269', NULL, 90, NULL),
  ('dish-270', 'dish-270', NULL, 90, NULL),
  ('dish-271', 'dish-271', NULL, 120, NULL),
  ('dish-272', 'dish-272', NULL, 110, NULL),
  ('dish-273', 'dish-273', 'Half', 550, NULL),
  ('dish-273:half', 'dish-273', 'Half', 550, NULL),
  ('dish-274', 'dish-274', 'Full', 1000, NULL),
  ('dish-274:full', 'dish-274', 'Full', 1000, NULL),
  ('dish-275', 'dish-275', 'Half', 600, NULL),
  ('dish-275:half', 'dish-275', 'Half', 600, NULL),
  ('dish-276', 'dish-276', 'Full', 1100, NULL),
  ('dish-276:full', 'dish-276', 'Full', 1100, NULL),
  ('dish-277', 'dish-277', 'Half', 550, NULL),
  ('dish-277:half', 'dish-277', 'Half', 550, NULL),
  ('dish-278', 'dish-278', 'Full', 1000, NULL),
  ('dish-278:full', 'dish-278', 'Full', 1000, NULL),
  ('dish-279', 'dish-279', 'Half', 630, NULL),
  ('dish-279:half', 'dish-279', 'Half', 630, NULL),
  ('dish-280', 'dish-280', 'Full', 1290, NULL),
  ('dish-280:full', 'dish-280', 'Full', 1290, NULL),
  ('dish-281', 'dish-281', 'Half', 600, NULL),
  ('dish-281:half', 'dish-281', 'Half', 600, NULL),
  ('dish-282', 'dish-282', 'Full', 1100, NULL),
  ('dish-282:full', 'dish-282', 'Full', 1100, NULL),
  ('dish-283', 'dish-283', 'Half', 990, NULL),
  ('dish-283:half', 'dish-283', 'Half', 990, NULL),
  ('dish-284', 'dish-284', 'Full', 1990, NULL),
  ('dish-284:full', 'dish-284', 'Full', 1990, NULL)
ON CONFLICT (sku) DO NOTHING;

-- 3. Ensure Sale Settings Exist
INSERT INTO sale_settings (id, sale_active, sale_percent, sale_ends_at, min_order_amount, coupon_code, coupon_flat_discount, free_item_name, free_item_min_amount)
VALUES (1, true, 10, now() + interval '30 days', 299, NULL, 0, 'Free 250ml Cool Drink', 499)
ON CONFLICT (id) DO NOTHING;


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
$$;

-- 5c. Public get_live_menu() RPC
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
$$;

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

  v_norm_phone := regexp_replace(p_customer_phone, '\D', '', 'g');
  IF length(v_norm_phone) = 12 AND v_norm_phone LIKE '91%' THEN
    v_norm_phone := substring(v_norm_phone from 3);
  END IF;
  IF v_norm_phone !~ '^[6-9][0-9]{9}$' THEN
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
      WHERE sku = (v_input_sku || ':' || lower(regexp_replace(v_item.variant, '\s+', '', 'g')));
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
$$;

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
