# Post-Purchase Workflow

## Overview

After a customer completes a Stripe checkout, the workflow intelligently redirects them based on whether the product requires onboarding.

---

## Updated Workflow (CURRENT)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Completes Stripe Checkout                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Redirect to /api/checkout/redirect                       │
│    - Receives: session_id, product slug                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Check Product Onboarding Requirement                     │
│    - Query: products.requires_onboarding                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Requires Onboarding  │      │ No Onboarding Needed │
│ (requires_onboarding │      │ (requires_onboarding │
│  = true)             │      │  = false)            │
└──────────┬───────────┘      └──────────┬───────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│ REDIRECT TO CAL.COM  │      │ Show Success Page    │
│                      │      │                      │
│ https://cal.com/     │      │ /products/success    │
│ botmakers/apex-      │      │                      │
│ affinity-group-      │      │ Generic thank you    │
│ onboarding           │      │ with next steps      │
│                      │      │                      │
│ Customer books       │      └──────────────────────┘
│ onboarding session   │
│ IMMEDIATELY          │
└──────────────────────┘
```

---

## Old Workflow (BEFORE FIX)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Completes Stripe Checkout                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Redirect to /products/success                            │
│    - Generic success page                                   │
│    - Shows modal with Cal.com embed (auto-opens 1 sec)      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
           ❌ USER HAS TO INTERACT WITH MODAL
           ❌ EXTRA STEP, NOT DIRECT
```

---

## Implementation Details

### 1. Smart Redirect Route
**File:** `src/app/api/checkout/redirect/route.ts`

**Logic:**
```typescript
if (product.requires_onboarding) {
  // Direct redirect to cal.com
  redirect('https://cal.com/botmakers/apex-affinity-group-onboarding?...');
} else {
  // Show success page
  redirect('/products/success?session_id=xxx&product=yyy');
}
```

### 2. Cal.com URL Parameters
When redirecting to cal.com, we include:
- `metadata[stripe_session_id]` - Stripe session ID for tracking
- `metadata[product]` - Product name purchased
- `duration` - Onboarding session duration (from product settings)

Example URL:
```
https://cal.com/botmakers/apex-affinity-group-onboarding
  ?metadata[stripe_session_id]=cs_test_xxx
  &metadata[product]=Business%20Center
  &duration=30
```

### 3. Updated Checkout Routes

**Distributor Checkout** (`/api/checkout/route.ts`):
```typescript
success_url: `${SITE_URL}/api/checkout/redirect?session_id={CHECKOUT_SESSION_ID}&product=${product.slug}`
```

**Retail Checkout** (`/api/checkout/retail/route.ts`):
```typescript
success_url: `${SITE_URL}/api/checkout/redirect?session_id={CHECKOUT_SESSION_ID}&product=${productSlug}`
```

---

## Products Configuration

Products are configured in the `products` table with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `requires_onboarding` | boolean | If true, redirect to cal.com |
| `onboarding_duration_minutes` | integer | Session duration (default: 30) |

**Example:**
```sql
UPDATE products
SET requires_onboarding = true,
    onboarding_duration_minutes = 30
WHERE slug = 'business-center';
```

---

## Benefits of New Workflow

### ✅ Direct to Calendar
- Customers go IMMEDIATELY to booking page
- No extra clicks or modal interactions
- Higher booking conversion rate

### ✅ Intelligent Routing
- Products requiring onboarding → Cal.com
- Products not requiring onboarding → Success page
- Fallback to success page on errors

### ✅ Prefilled Data
- Stripe session ID tracked
- Product name prefilled
- Session duration configured

### ✅ Better UX
- No "modal popup" friction
- Clear next step (book appointment)
- Seamless post-purchase experience

---

## Testing the Workflow

### Test Products Requiring Onboarding:
1. Go to products page
2. Purchase a product with `requires_onboarding = true`
3. Complete Stripe checkout
4. **Verify:** You are redirected DIRECTLY to cal.com booking page
5. **Verify:** You can see product name and session info prefilled

### Test Products Not Requiring Onboarding:
1. Purchase a product with `requires_onboarding = false`
2. Complete Stripe checkout
3. **Verify:** You see the success page at `/products/success`
4. **Verify:** Generic "Thank You" message is shown

---

## Fallback Behavior

If any error occurs in the redirect route:
- Redirect to `/products/success` (generic success page)
- Log error to console
- Customer still sees confirmation

**Error scenarios:**
- Product not found in database
- Database query fails
- Missing session_id or product parameter

---

## Future Enhancements

### Potential Improvements:
1. **Email Integration**
   - Send cal.com link via email immediately after purchase
   - Reminder email if booking not completed within 24 hours

2. **Multiple Onboarding Sessions**
   - Different cal.com links based on product type
   - Group onboarding vs individual onboarding

3. **Booking Tracking**
   - Webhook from cal.com when booking completed
   - Mark customer as "onboarded" in database
   - Send confirmation email

4. **Analytics**
   - Track booking completion rate
   - A/B test direct redirect vs modal popup
   - Measure time to first booking

---

## Files Modified

1. **Created:**
   - `src/app/api/checkout/redirect/route.ts` - Smart redirect logic

2. **Updated:**
   - `src/app/api/checkout/route.ts` - Changed success_url
   - `src/app/api/checkout/retail/route.ts` - Changed success_url

3. **Unchanged (still works as fallback):**
   - `src/app/products/success/page.tsx` - Generic success page
   - `src/components/booking/CalComModal.tsx` - Cal.com modal component

---

## Summary

**Before:** Stripe checkout → Generic success page → Modal popup → User clicks "Schedule Now" → Cal.com

**After:** Stripe checkout → Smart redirect → **DIRECTLY TO CAL.COM** ✅

This provides a seamless, frictionless post-purchase experience for customers who need onboarding!
