-- ============================================================================
-- 00_checks.sql
-- Diagnostics and Verification Queries (Read-Only)
-- Safe to run before and after applying offers-2026-10 migrations.
-- ============================================================================

-- 1. Check current menu prices summary (count, min, max, average)
SELECT 
  COUNT(*) AS total_skus,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  ROUND(AVG(price), 2) AS avg_price,
  COUNT(CASE WHEN mrp IS NOT NULL THEN 1 END) AS skus_with_mrp
FROM menu_prices;

-- 2. Inspect 10 sample SKUs including base, half, and full variants
SELECT sku, item_id, variant, price, mrp, available
FROM menu_prices
WHERE sku IN (
  'dish-1',            -- Mushroom Corn Soup (Base)
  'dish-35',           -- Chicken 65
  'dish-110',          -- Biryani
  'dish-136',          -- Chicken Mandi (Single)
  'dish-138',          -- Chicken Mandi (Half)
  'dish-138:half',     -- Variant SKU
  'dish-139',          -- Chicken Mandi (Full)
  'dish-139:full',     -- Variant SKU
  'dish-185',          -- Butter Naan
  'dish-273'           -- Chicken Mandi Bucket Half
)
ORDER BY sku;

-- 3. Check current settings in sale_settings and store_offers
SELECT 
  'sale_settings' AS table_name,
  sale_active,
  sale_percent,
  min_order_amount,
  coupon_code,
  coupon_flat_discount,
  free_item_name,
  free_item_min_amount,
  packing_fee,
  sale_ends_at
FROM sale_settings
WHERE id = 1;

SELECT 
  'store_offers' AS table_name,
  is_active,
  discount_percent,
  min_order_amount,
  coupon_code,
  coupon_flat_discount,
  free_item_name,
  free_item_min_amount,
  packing_fee,
  expires_at
FROM store_offers
WHERE id = 1;

-- 4. Verify orders table column definitions for packing_fee
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('subtotal', 'discount_amount', 'packing_fee', 'final_total');

-- 5. Check migration history marker
SELECT * FROM app_migrations WHERE name = 'activate_offers_2026_10';
