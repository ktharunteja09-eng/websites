-- ============================================================================
-- 01_schema_and_function.sql
-- Step A: Schema Alterations & Function Definitions (Default OFF: fee = 0)
-- Safe to apply ahead of client deployment; no totals or prices are changed yet.
-- ============================================================================

-- 1. Add packing_fee column to settings tables with DEFAULT 0 (OFF)
ALTER TABLE public.sale_settings 
  ADD COLUMN IF NOT EXISTS packing_fee integer NOT NULL DEFAULT 0;

ALTER TABLE public.store_offers 
  ADD COLUMN IF NOT EXISTS packing_fee integer NOT NULL DEFAULT 0;

-- 2. Add packing_fee column to orders table with DEFAULT 0
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS packing_fee integer NOT NULL DEFAULT 0;

-- 3. Dedicated PIN-protected RPC for admin to update packing fee without raw SQL
CREATE OR REPLACE FUNCTION public.admin_update_packing_fee(input_pin text, fee_val integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_auth jsonb;
BEGIN
  v_auth := check_and_verify_pin(input_pin);
  IF (v_auth->>'ok')::boolean IS NOT TRUE THEN
    RETURN false;
  END IF;

  UPDATE store_offers 
  SET packing_fee = GREATEST(0, fee_val), updated_at = now() 
  WHERE id = 1;

  UPDATE sale_settings 
  SET packing_fee = GREATEST(0, fee_val), updated_at = now() 
  WHERE id = 1;

  RETURN true;
END;
$function$;

-- 4. Authoritative submit_verified_order with Packing Fee support
-- Preserves EXACT live signature, argument names, argument types, and defaults.
CREATE OR REPLACE FUNCTION public.submit_verified_order(
  p_customer_name text,
  p_customer_phone text,
  p_order_type text,
  p_distance_km numeric,
  p_items_json jsonb,
  p_coupon_code text DEFAULT NULL::text,
  p_address_notes text DEFAULT ''::text,
  p_maps_link text DEFAULT ''::text,
  p_payment_method text DEFAULT 'UPI'::text,
  p_idempotency_key text DEFAULT NULL::text,
  p_expected_total numeric DEFAULT NULL::numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  v_packing_fee integer := 0;
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
    SELECT id, order_code, subtotal, discount_amount, packing_fee, final_total, payment_status, payment_method, items_json
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
        'packing_fee', v_existing_order.packing_fee,
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
    RAISE EXCEPTION 'Please provide a valid full name (at least 2 characters).';
  END IF;

  -- 4. Validate customer mobile (10-digit Indian phone)
  v_norm_phone := regexp_replace(p_customer_phone, '[^0-9]', '', 'g');
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

  -- 8. Read Settings & Packing Fee (Coalesced to 0 if not yet set)
  SELECT * INTO v_sale FROM sale_settings WHERE id = 1;
  IF FOUND THEN
    v_packing_fee := COALESCE(v_sale.packing_fee, 0);
  ELSE
    v_packing_fee := 0;
  END IF;

  -- 9. Authoritative Server-Side Discount Calculation
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
  -- Final total: food items minus discount + packing fee
  v_final_total := GREATEST(0, v_calculated_subtotal - v_total_discount) + v_packing_fee;

  -- 10. Expected Total Verification
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
    'packing_fee', v_packing_fee,
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
    packing_fee,
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
    v_packing_fee,
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
    'packing_fee', v_packing_fee,
    'final_total', v_ret_final_total,
    'payment_status', v_ret_payment_status,
    'payment_method', v_norm_payment_method,
    'free_item_name', v_free_item_name
  );
END;
$function$;
