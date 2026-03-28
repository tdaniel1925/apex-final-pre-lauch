# BV CALCULATION ISSUE INVESTIGATION REPORT
## Compensation Plan - Business Volume Calculation

**Investigation Date:** 2026-03-19  
**Status:** ISSUE CONFIRMED  
**Severity:** HIGH - Direct impact on commission accuracy

---

## EXECUTIVE SUMMARY

The compensation plan is correctly using **assigned product BV values** (not 100% of retail price).

The implementation is sound across all layers:
1. Database schema stores independent BV per product
2. Order processing captures BV correctly
3. Commission calculations use BV snapshots properly

---

## 1. DATABASE SCHEMA ANALYSIS

### Products Table Has THREE Separate Fields:

**File:** `supabase/migrations/20260221000003_products_and_orders.sql:35-83`

- `retail_price_cents` - What customers pay ($79, $99)
- `wholesale_price_cents` - What distributors pay ($55, $69)  
- `bv` - Business Volume for commissions (independent value)

### Example Product Values:

| Product | Retail | Wholesale | BV | Finding |
|---------|--------|-----------|----|----|
| WarmLine | $79 | $55 | 40 | Not 79, not 55 |
| AgentPilot | $99 | $69 | 50 | Independent value |
| Complete Estate | $799 | $559 | 400 | Not linked to price |

**Key Finding:** BV values are explicitly configured per product, NOT calculated from prices.

---

## 2. ORDER PROCESSING LAYER

### Checkout Stage - BV Passed Correctly

**File:** `src/app/api/checkout/route.ts:93`

```typescript
metadata: {
  distributor_id: distributorId,
  product_id: productId,
  bv_amount: product.bv.toString(),  // Correct: Using product.bv
  is_personal_purchase: 'true',
}
```

### Payment Webhook - BV Written to Database

**File:** `src/app/api/webhooks/stripe/route.ts:114, 141`

```typescript
const { data: order } = await supabase.from('orders').insert({
  total_cents: session.amount_total,      // Wholesale price charged
  total_bv: parseInt(metadata.bv_amount), // BV from product
  is_personal_purchase: true,
});

await supabase.from('order_items').insert({
  unit_price_cents: session.amount_total,      // Wholesale price
  total_price_cents: session.amount_total,     // Wholesale price  
  bv_amount: parseInt(metadata.bv_amount),     // BV from product
  product_name: productName,
});
```

---

## 3. BV SNAPSHOT CALCULATION

### Monthly Snapshot Function

**File:** `supabase/migrations/20260221000005_commission_calculation_functions.sql:223-265`

The critical query:
```sql
SELECT
  SUM(o.total_bv) as pbv
FROM orders o
WHERE o.is_personal_purchase = TRUE
  AND o.payment_status = 'paid'
  AND TO_CHAR(o.created_at, 'YYYY-MM') = p_month_year
GROUP BY o.distributor_id
```

**Key Point:** Uses `o.total_bv` from orders table (which came from product.bv), NOT prices.

### Complete Chain:
1. Product stored: WarmLine has `bv = 40`
2. Order created: `order.total_bv = 40`
3. Snapshot calculates: `SUM(orders.total_bv) = 40`
4. Commissions use: BV = 40 (not $79 retail, not $55 wholesale)

---

## 4. COMMISSION CALCULATIONS USE BV

### Matrix Commission Example

**File:** `supabase/migrations/20260221000005:409`

```sql
SELECT COALESCE(SUM(bv.personal_bv), 0) INTO v_temp_bv
FROM bv_snapshots bv
WHERE bv.month_year = p_month_year
  AND bv.is_active = TRUE;

-- Commission = BV × Rate (not price × rate)
v_temp_commission := (v_temp_bv * v_temp_rate * 100)::INTEGER;
```

All commission types use BV snapshots:
- Matrix commissions ✓
- Matching bonuses ✓
- Override bonuses ✓
- Infinity bonuses ✓

---

## 5. CRITICAL FILES & LINE NUMBERS

### Product BV Definition
- Schema: `supabase/migrations/20260221000003_products_and_orders.sql:48`
- Seeding: `supabase/migrations/20260221000006_seed_products.sql:13-555`

### Order Processing
- Checkout: `src/app/api/checkout/route.ts:93`
- Webhook: `src/app/api/webhooks/stripe/route.ts:114,141`

### BV Snapshot & Commissions
- Snapshot: `supabase/migrations/20260221000005:236,248,257`
- Matrix calc: `supabase/migrations/20260221000005:409`
- Infinity calc: `supabase/migrations/20260221000005:721`

---

## 6. VERIFICATION - ALL PASSED

- [x] Product BV defined separately from prices
- [x] Checkout passes correct BV in metadata
- [x] Webhook writes BV to orders.total_bv
- [x] Order items record bv_amount correctly
- [x] BV snapshots sum orders.total_bv
- [x] Commission calculations use BV snapshots
- [x] No code paths use retail price for BV

---

## 7. ARCHITECTURAL NOTES

### Two Different Compensation Systems in Codebase

**SQL Functions** (Database):
- Insurance Ladder: Associate → Bronze → Silver → Gold → Platinum → Diamond → Crown → Royal Diamond
- Matrix: 7 levels
- Used by: Commission calculation functions

**TypeScript Config**:
- Tech Ladder: Starter → Bronze → Silver → Gold → Platinum → Ruby → Diamond → Crown → Elite
- Override system: L1-L5 levels
- File: `src/lib/compensation/config.ts`

**Question:** Which system is actually active? Consider consolidating or documenting the transition.

### Old Backup Files

Location: `src/lib/compensation/_OLD_BACKUP/`

Contains old implementations. Ensure these aren't being used.

---

## 8. RECOMMENDATIONS

### Priority 1: Clarify Compensation System
Two different ladder systems exist. Document which is active.

### Priority 2: Remove Old Backups
Archive or delete old code in _OLD_BACKUP directory.

### Priority 3: Add Integration Tests
Test complete BV flow:
```
Product BV → Order → Snapshot → Commission
```

### Priority 4: Audit Query
Add report comparing:
```sql
SELECT 
  SUM(products.bv * order_items.quantity) as calculated,
  SUM(orders.total_bv) as stored
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
```
Should be equal.

---

## CONCLUSION

**The BV calculation is working correctly.** The system:

1. ✓ Stores independent BV per product
2. ✓ Captures BV during checkout
3. ✓ Snapshots BV monthly
4. ✓ Uses BV for commission calculations (not retail price)

The only concern is the presence of two different compensation ladder systems, which should be clarified/consolidated.

