-- ============================================================================
-- 02_activate.sql
-- Step C: Atomic Activation Migration (Single Transaction with Marker & Backup Guard)
-- Saves previous settings to offers_migration_backup, increases all menu prices
-- by Rs 10, sets packing fee to Rs 5, activates Free Cool Drink offer above Rs 499,
-- removes 10% discount and coupons.
--
-- EXPECTED SERVER TOTALS FOR OWNER VERIFICATION:
-- Case A: Subtotal Rs 498, Pickup/Delivery:
--         Discount = 0, Packing = 5, Total = Rs 503 (Free Drink: NO)
-- Case B: Subtotal Rs 499, Pickup/Delivery:
--         Discount = 0, Packing = 5, Total = Rs 504 (Free Drink: YES)
-- Case C: Subtotal Rs 500, Pickup/Delivery:
--         Discount = 0, Packing = 5, Total = Rs 505 (Free Drink: YES)
-- ============================================================================

BEGIN;

-- 1. Create migration tracking and backup tables if not exists
CREATE TABLE IF NOT EXISTS public.app_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers_migration_backup (
  migration_name text PRIMARY KEY,
  sale_settings_backup jsonb NOT NULL,
  store_offers_backup jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Guard against re-running
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.app_migrations WHERE name = 'activate_offers_2026_10') THEN
    RAISE EXCEPTION 'Migration activate_offers_2026_10 has already been applied! Aborting.';
  END IF;
END $$;

-- 2. Save the EXACT previous settings before any modifications take place
INSERT INTO public.offers_migration_backup (migration_name, sale_settings_backup, store_offers_backup)
SELECT 
  'activate_offers_2026_10',
  (SELECT to_jsonb(s) FROM public.sale_settings s WHERE id = 1),
  (SELECT to_jsonb(o) FROM public.store_offers o WHERE id = 1)
ON CONFLICT (migration_name) DO UPDATE 
  SET sale_settings_backup = EXCLUDED.sale_settings_backup,
      store_offers_backup = EXCLUDED.store_offers_backup,
      created_at = now();

-- Record migration application marker
INSERT INTO public.app_migrations (name) VALUES ('activate_offers_2026_10');

-- 3. Increase all prices in menu_prices by Rs 10
-- Adding the same 10 to mrp keeps each 'Save Rs X' exact and avoids invented numbers
UPDATE public.menu_prices
SET 
  price = price + 10,
  mrp = CASE WHEN mrp IS NOT NULL THEN mrp + 10 ELSE NULL END,
  updated_at = now();

-- 4. Update menu_items base table to mirror the +Rs 10 change
UPDATE public.menu_items
SET 
  price = price + 10,
  aggregator_price = CASE 
    WHEN aggregator_price IS NOT NULL THEN aggregator_price + 10 
    ELSE round(((price + 10) * 1.25) / 10) * 10 
  END,
  updated_at = now();

-- 5. Update sale_settings table
UPDATE public.sale_settings
SET
  sale_active = true,
  sale_percent = 0,
  sale_ends_at = NULL,
  min_order_amount = 0,
  coupon_code = NULL,
  coupon_flat_discount = 0,
  free_item_name = 'Cool drink 250 ml',
  free_item_min_amount = 499,
  packing_fee = 5,
  updated_at = now()
WHERE id = 1;

-- 6. Update store_offers table
UPDATE public.store_offers
SET
  is_active = true,
  banner_text = 'Order Direct: Free Cool Drink on orders above ₹499 • ₹0 Platform Fees • Free 5km Delivery',
  discount_percent = 0,
  min_order_amount = 0,
  coupon_code = NULL,
  coupon_flat_discount = 0,
  free_item_name = 'Cool drink 250 ml',
  free_item_min_amount = 499,
  packing_fee = 5,
  expires_at = NULL,
  updated_at = now()
WHERE id = 1;

COMMIT;
