# Stripe Purchase Buttons Audit

## Audit Date: April 3, 2026

---

## Summary

Found **3 purchase button components** in the back office that need Stripe integration fixes.

---

## Components Audited

### 1. ✅ **BusinessCenterButton** (`src/components/dashboard/BusinessCenterButton.tsx`)
- **Status:** WORKING
- **API:** `/api/stripe/create-product-checkout`
- **Method:** Uses product_id from database
- **Issue:** API version was wrong (fixed)
- **Action:** Already fixed - using correct API version

### 2. ⚠️ **PulseProductCard** (`src/components/dashboard/PulseProductCard.tsx`)
- **Status:** BROKEN
- **API:** `/api/stripe/create-checkout-session`
- **Issue 1:** API uses wrong Stripe API version (`2026-01-28.clover` instead of `2024-11-20.acacia`)
- **Issue 2:** Relies on env variables that don't exist in `.env.local`
- **Expected env vars:**
  - `STRIPE_PULSEMARKET_RETAIL_PRICE_ID`
  - `STRIPE_PULSEMARKET_MEMBER_PRICE_ID`
  - `STRIPE_PULSEFLOW_RETAIL_PRICE_ID`
  - `STRIPE_PULSEFLOW_MEMBER_PRICE_ID`
  - `STRIPE_PULSEDRIVE_RETAIL_PRICE_ID`
  - `STRIPE_PULSEDRIVE_MEMBER_PRICE_ID`
  - `STRIPE_PULSECOMMAND_RETAIL_PRICE_ID`
  - `STRIPE_PULSECOMMAND_MEMBER_PRICE_ID`
- **Action Needed:** Fix API version + add env variables OR switch to database lookup

### 3. ⚠️ **StoreClient** (`src/components/dashboard/StoreClient.tsx`)
- **Status:** FIXED (uses create-product-checkout which we already fixed)
- **API:** `/api/stripe/create-product-checkout`
- **Method:** Uses product_id from database
- **Action:** None needed

### 4. ⚠️ **PulseProductCheckoutButton** (`src/components/PulseProductCheckoutButton.tsx`)
- **Status:** BROKEN
- **API:** `/api/stripe/create-checkout-session`
- **Issue:** Same as PulseProductCard - relies on missing env vars
- **Action Needed:** Fix API version + add env variables OR switch to database lookup

---

## API Endpoints Audited

### `/api/stripe/create-product-checkout` ✅
- **Status:** FIXED
- **Uses:** Database product lookup
- **API Version:** `2024-11-20.acacia` (correct)
- **Components using it:**
  - BusinessCenterButton ✅
  - StoreClient ✅

### `/api/stripe/create-checkout-session` ⚠️
- **Status:** BROKEN
- **Issues:**
  1. Wrong API version: `2026-01-28.clover` (should be `2024-11-20.acacia`)
  2. Relies on env variables that don't exist
- **Components using it:**
  - PulseProductCard ⚠️
  - PulseProductCheckoutButton ⚠️

---

## Price IDs Created in Stripe LIVE Mode

From our earlier setup, we created these price IDs:

| Product | Retail Price ID | Member Price ID |
|---------|----------------|-----------------|
| PulseMarket | `price_1TIClH0s7Jg0EdCpmtyGm6q9` ($79) | `price_1TIClI0s7Jg0EdCp8kq6nbox` ($59) |
| PulseFlow | `price_1TIClI0s7Jg0EdCpVfybCJyT` ($149) | `price_1TIClI0s7Jg0EdCpLwhhiZuz` ($129) |
| PulseDrive | `price_1TIClJ0s7Jg0EdCpiCqXwgel` ($399) | `price_1TIClJ0s7Jg0EdCpWY9OpdFh` ($349) |
| PulseCommand | `price_1TIClJ0s7Jg0EdCpUo41hli0` ($499) | `price_1TIClK0s7Jg0EdCpbAoW8JXA` ($399) |
| Business Center | `price_1TIClL0s7Jg0EdCpx92ZViwP` ($40) | `price_1TIClL0s7Jg0EdCpywREFLha` ($39) |

---

## Recommended Fix Strategy

### Option 1: Add Environment Variables (Quick Fix)
Add these to `.env.local`:
```bash
# Pulse Products - Retail Pricing (LIVE)
STRIPE_PULSEMARKET_RETAIL_PRICE_ID=price_1TIClH0s7Jg0EdCpmtyGm6q9
STRIPE_PULSEFLOW_RETAIL_PRICE_ID=price_1TIClI0s7Jg0EdCpVfybCJyT
STRIPE_PULSEDRIVE_RETAIL_PRICE_ID=price_1TIClJ0s7Jg0EdCpiCqXwgel
STRIPE_PULSECOMMAND_RETAIL_PRICE_ID=price_1TIClJ0s7Jg0EdCpUo41hli0

# Pulse Products - Member Pricing (LIVE)
STRIPE_PULSEMARKET_MEMBER_PRICE_ID=price_1TIClI0s7Jg0EdCp8kq6nbox
STRIPE_PULSEFLOW_MEMBER_PRICE_ID=price_1TIClI0s7Jg0EdCpLwhhiZuz
STRIPE_PULSEDRIVE_MEMBER_PRICE_ID=price_1TIClJ0s7Jg0EdCpWY9OpdFh
STRIPE_PULSECOMMAND_MEMBER_PRICE_ID=price_1TIClK0s7Jg0EdCpbAoW8JXA
```

**PLUS:** Fix API version in `create-checkout-session/route.ts`

### Option 2: Use Database Lookup (Better Long-term)
Update Pulse product cards to use the database lookup API like Business Center does.

**I RECOMMEND OPTION 1** - Quick fix that gets everything working immediately.

---

## Action Items

1. ✅ Fix Business Center button - DONE
2. ⏳ Fix `create-checkout-session` API version
3. ⏳ Add Pulse product price IDs to `.env.local`
4. ⏳ Test all purchase buttons

---

## Testing Checklist

After fixes:
- [ ] Business Center purchase button works
- [ ] PulseMarket purchase button works
- [ ] PulseFlow purchase button works
- [ ] PulseDrive purchase button works
- [ ] PulseCommand purchase button works
- [ ] All buttons redirect to valid Stripe checkout pages
- [ ] All prices match expected amounts
