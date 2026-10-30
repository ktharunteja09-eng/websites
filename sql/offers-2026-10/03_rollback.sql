-- ============================================================================
-- 03_rollback.sql
-- Step D: Rollback Migration (Single Transaction with Exact Backup Restoration)
-- Reverses 02_activate.sql: prices -10, packing fee to 0, and restores the EXACT
-- saved snapshot of settings from offers_migration_backup.
-- Crucial rule: Never leaves free_item_name filled if free_item_min_amount = 0/null
-- to prevent the order function from treating it as "always award".
-- ============================================================================

BEGIN;

-- 1. Guard: Only proceed if activate_offers_2026_10 was previously applied and backup exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.app_migrations WHERE name = 'activate_offers_2026_10') THEN
    RAISE EXCEPTION 'Cannot rollback: migration activate_offers_2026_10 has not been applied! Aborting.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.offers_migration_backup WHERE migration_name = 'activate_offers_2026_10') THEN
    RAISE EXCEPTION 'Cannot rollback: backup data for activate_offers_2026_10 is missing! Aborting.';
  END IF;
END $$;

-- 2. Reverse menu_prices by -Rs 10
UPDATE public.menu_prices
SET 
  price = GREATEST(1, price - 10),
  mrp = CASE WHEN mrp IS NOT NULL THEN GREATEST(1, mrp - 10) ELSE NULL END,
  updated_at = now();

-- 3. Reverse menu_items base table by -Rs 10
UPDATE public.menu_items
SET 
  price = GREATEST(1, price - 10),
  aggregator_price = CASE 
    WHEN aggregator_price IS NOT NULL THEN GREATEST(1, aggregator_price - 10) 
    ELSE NULL 
  END,
  updated_at = now();

-- 4. Restore EXACT saved values from backup into sale_settings
UPDATE public.sale_settings s
SET
  sale_active = (b.sale_settings_backup->>'sale_active')::boolean,
  sale_percent = (b.sale_settings_backup->>'sale_percent')::integer,
  sale_ends_at = CASE 
    WHEN (b.sale_settings_backup->>'sale_ends_at') IS NOT NULL 
    THEN (b.sale_settings_backup->>'sale_ends_at')::timestamptz 
    ELSE NULL 
  END,
  min_order_amount = (b.sale_settings_backup->>'min_order_amount')::integer,
  coupon_code = b.sale_settings_backup->>'coupon_code',
  coupon_flat_discount = (b.sale_settings_backup->>'coupon_flat_discount')::integer,
  -- Crucial: never leave free_item_name filled if free_item_min_amount is 0 or NULL
  free_item_name = CASE 
    WHEN COALESCE((b.sale_settings_backup->>'free_item_min_amount')::integer, 0) > 0 
    THEN b.sale_settings_backup->>'free_item_name' 
    ELSE NULL 
  END,
  free_item_min_amount = (b.sale_settings_backup->>'free_item_min_amount')::integer,
  packing_fee = COALESCE((b.sale_settings_backup->>'packing_fee')::integer, 0),
  updated_at = now()
FROM public.offers_migration_backup b
WHERE s.id = 1 AND b.migration_name = 'activate_offers_2026_10';

-- 5. Restore EXACT saved values from backup into store_offers
UPDATE public.store_offers o
SET
  is_active = (b.store_offers_backup->>'is_active')::boolean,
  banner_text = b.store_offers_backup->>'banner_text',
  discount_percent = (b.store_offers_backup->>'discount_percent')::numeric,
  min_order_amount = (b.store_offers_backup->>'min_order_amount')::numeric,
  coupon_code = b.store_offers_backup->>'coupon_code',
  coupon_flat_discount = (b.store_offers_backup->>'coupon_flat_discount')::numeric,
  -- Crucial: never leave free_item_name filled if free_item_min_amount is 0 or NULL
  free_item_name = CASE 
    WHEN COALESCE((b.store_offers_backup->>'free_item_min_amount')::numeric, 0) > 0 
    THEN b.store_offers_backup->>'free_item_name' 
    ELSE NULL 
  END,
  free_item_min_amount = (b.store_offers_backup->>'free_item_min_amount')::numeric,
  packing_fee = COALESCE((b.store_offers_backup->>'packing_fee')::numeric, 0),
  expires_at = CASE 
    WHEN (b.store_offers_backup->>'expires_at') IS NOT NULL 
    THEN (b.store_offers_backup->>'expires_at')::timestamptz 
    ELSE NULL 
  END,
  updated_at = now()
FROM public.offers_migration_backup b
WHERE o.id = 1 AND b.migration_name = 'activate_offers_2026_10';

-- 6. Cleanup migration marker and backup record
DELETE FROM public.app_migrations WHERE name = 'activate_offers_2026_10';
DELETE FROM public.offers_migration_backup WHERE migration_name = 'activate_offers_2026_10';

COMMIT;
