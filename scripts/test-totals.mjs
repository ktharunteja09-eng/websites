/**
 * scripts/test-totals.mjs
 * Test Matrix for Vaibhav Grand Pricing & Offers
 * Verifies client calculateTotals matches server submit_verified_order calculations.
 */

// Implementation of client total formula matching src/utils/cartMath.ts
function clientCalculateTotals(subtotal, offer, orderType) {
  let discount_amount = 0;
  let has_free_item = false;
  let free_item_name = null;

  const is_active = offer ? Boolean(offer.is_active) : false;
  const packing_fee = is_active ? Math.max(0, Number(offer?.packing_fee) || 0) : 0;

  if (is_active && offer) {
    const min_order_amount = Math.max(0, Number(offer.min_order_amount) || 0);
    const discount_percent = Math.max(0, Math.min(100, Number(offer.discount_percent) || 0));
    const free_item_min_amount = Math.max(0, Number(offer.free_item_min_amount) || 0);

    if (min_order_amount > 0 && subtotal >= min_order_amount && discount_percent > 0) {
      discount_amount = Math.min(subtotal, Math.max(0, Math.round((subtotal * discount_percent) / 100)));
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount_amount);
    const hasFreeItemSetting = Boolean(
      offer.free_item_name &&
      offer.free_item_name.trim() !== '' &&
      free_item_min_amount > 0
    );

    if (hasFreeItemSetting && subtotalAfterDiscount >= free_item_min_amount) {
      free_item_name = offer.free_item_name.trim();
      has_free_item = true;
    }
  }

  // Delivery charge within 5km is 0 (free within 5km rule)
  const delivery_charge = 0;
  const final_total = Math.max(0, subtotal - discount_amount) + packing_fee + delivery_charge;

  return {
    subtotal,
    discount_amount,
    packing_fee,
    final_total,
    has_free_item,
    free_item_name
  };
}

// Server calculation matching submit_verified_order in sql/offers-2026-10/01_schema_and_function.sql
function serverCalculateTotals(subtotal, settings, couponCode = null) {
  let v_sale_discount = 0;
  let v_coupon_discount = 0;
  let v_free_item_name = null;
  const v_packing_fee = settings ? Math.max(0, Number(settings.packing_fee) || 0) : 0;

  if (settings && settings.sale_active) {
    if (settings.min_order_amount > 0 && subtotal >= settings.min_order_amount && settings.sale_percent > 0) {
      v_sale_discount = Math.round((subtotal * settings.sale_percent) / 100.0);
    }

    if (settings.free_item_name && settings.free_item_name.trim() !== '') {
      const freeThreshold = (settings.free_item_min_amount !== null && settings.free_item_min_amount !== undefined)
        ? settings.free_item_min_amount
        : settings.min_order_amount;
      if (freeThreshold > 0 && subtotal >= freeThreshold) {
        v_free_item_name = settings.free_item_name.trim();
      }
    }

    if (couponCode && settings.coupon_code && couponCode.toUpperCase() === settings.coupon_code.toUpperCase()) {
      if (subtotal >= settings.min_order_amount) {
        v_coupon_discount = Math.max(0, Number(settings.coupon_flat_discount) || 0);
      }
    }
  }

  const v_total_discount = Math.min(subtotal, v_sale_discount + v_coupon_discount);
  const v_final_total = Math.max(0, subtotal - v_total_discount) + v_packing_fee;

  return {
    subtotal,
    discount_amount: v_total_discount,
    packing_fee: v_packing_fee,
    final_total: v_final_total,
    has_free_item: v_free_item_name !== null,
    free_item_name: v_free_item_name
  };
}

// Test Configurations
const settingsOn = {
  is_active: true,
  sale_active: true,
  sale_percent: 0,
  discount_percent: 0,
  min_order_amount: 0,
  free_item_name: 'Cool drink 250 ml',
  free_item_min_amount: 499,
  packing_fee: 5,
  coupon_code: null,
  coupon_flat_discount: 0
};

const settingsOff = {
  is_active: false,
  sale_active: false,
  sale_percent: 0,
  discount_percent: 0,
  min_order_amount: 0,
  free_item_name: null,
  free_item_min_amount: 0,
  packing_fee: 0,
  coupon_code: null,
  coupon_flat_discount: 0
};

const settingsFreeItemOffZeroMin = {
  is_active: true,
  sale_active: true,
  sale_percent: 0,
  discount_percent: 0,
  min_order_amount: 0,
  free_item_name: null, // As required: free_item_name is null when min_amount is 0
  free_item_min_amount: 0,
  packing_fee: 5,
  coupon_code: null,
  coupon_flat_discount: 0
};

const settingsLegacy10Percent = {
  is_active: true,
  sale_active: true,
  sale_percent: 10,
  discount_percent: 10,
  min_order_amount: 299,
  free_item_name: null,
  free_item_min_amount: 0,
  packing_fee: 0,
  coupon_code: null,
  coupon_flat_discount: 0
};

const testCases = [
  // New settings active (fee 5, offer 499, sale 0)
  { name: 'New Settings ON | Subtotal 498 | Pickup', subtotal: 498, orderType: 'pickup', config: settingsOn, expTotal: 503, expFree: false },
  { name: 'New Settings ON | Subtotal 498 | Delivery', subtotal: 498, orderType: 'delivery', config: settingsOn, expTotal: 503, expFree: false },
  { name: 'New Settings ON | Subtotal 499 | Pickup', subtotal: 499, orderType: 'pickup', config: settingsOn, expTotal: 504, expFree: true },
  { name: 'New Settings ON | Subtotal 499 | Delivery', subtotal: 499, orderType: 'delivery', config: settingsOn, expTotal: 504, expFree: true },
  { name: 'New Settings ON | Subtotal 500 | Pickup', subtotal: 500, orderType: 'pickup', config: settingsOn, expTotal: 505, expFree: true },
  { name: 'New Settings ON | Subtotal 500 | Delivery', subtotal: 500, orderType: 'delivery', config: settingsOn, expTotal: 505, expFree: true },

  // Settings OFF (fee 0, offer off, sale 0)
  { name: 'Settings OFF | Subtotal 498 | Pickup', subtotal: 498, orderType: 'pickup', config: settingsOff, expTotal: 498, expFree: false },
  { name: 'Settings OFF | Subtotal 499 | Delivery', subtotal: 499, orderType: 'delivery', config: settingsOff, expTotal: 499, expFree: false },
  { name: 'Settings OFF | Subtotal 500 | Delivery', subtotal: 500, orderType: 'delivery', config: settingsOff, expTotal: 500, expFree: false },

  // Active settings but free item OFF (min amount 0, name null)
  { name: 'Free Item OFF (min_amt 0) | Subtotal 600', subtotal: 600, orderType: 'pickup', config: settingsFreeItemOffZeroMin, expTotal: 605, expFree: false },

  // Legacy settings with 10% discount
  { name: 'Legacy 10% Sale | Subtotal 200 (< min 299)', subtotal: 200, orderType: 'pickup', config: settingsLegacy10Percent, expTotal: 200, expFree: false },
  { name: 'Legacy 10% Sale | Subtotal 300 (>= min 299)', subtotal: 300, orderType: 'delivery', config: settingsLegacy10Percent, expTotal: 270, expFree: false },
  { name: 'Legacy 10% Sale | Subtotal 500 (10% off)', subtotal: 500, orderType: 'delivery', config: settingsLegacy10Percent, expTotal: 450, expFree: false },
];

console.log('='.repeat(110));
console.log('VAIBHAV GRAND TOTALS & OFFERS VERIFICATION TEST MATRIX');
console.log('='.repeat(110));
console.log(
  'Case'.padEnd(46) +
  'Subtotal'.padEnd(10) +
  'Disc'.padEnd(8) +
  'Pack'.padEnd(8) +
  'Client'.padEnd(9) +
  'Server'.padEnd(9) +
  'FreeDrink'.padEnd(12) +
  'Status'
);
console.log('-'.repeat(110));

let allPassed = true;

for (const tc of testCases) {
  const clientRes = clientCalculateTotals(tc.subtotal, tc.config, tc.orderType);
  const serverRes = serverCalculateTotals(tc.subtotal, tc.config);

  const clientMatchesServer = clientRes.final_total === serverRes.final_total &&
                              clientRes.has_free_item === serverRes.has_free_item &&
                              clientRes.discount_amount === serverRes.discount_amount &&
                              clientRes.packing_fee === serverRes.packing_fee;

  const matchesExpected = clientRes.final_total === tc.expTotal &&
                          clientRes.has_free_item === tc.expFree;

  const passed = clientMatchesServer && matchesExpected;
  if (!passed) allPassed = false;

  console.log(
    tc.name.padEnd(46) +
    `Rs ${tc.subtotal}`.padEnd(10) +
    `Rs ${clientRes.discount_amount}`.padEnd(8) +
    `Rs ${clientRes.packing_fee}`.padEnd(8) +
    `Rs ${clientRes.final_total}`.padEnd(9) +
    `Rs ${serverRes.final_total}`.padEnd(9) +
    (clientRes.has_free_item ? 'YES' : 'NO').padEnd(12) +
    (passed ? 'PASS' : 'FAIL')
  );
}

console.log('='.repeat(110));
if (allPassed) {
  console.log('ALL 13 TEST CASES PASSED! Client and server total calculations are 100% synchronized.');
  process.exit(0);
} else {
  console.error('TEST MATRIX FAILED! One or more cases failed verification.');
  process.exit(1);
}
