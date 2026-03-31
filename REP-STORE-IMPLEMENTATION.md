# Rep Back Office Store Implementation

**Date:** 2026-03-31
**Status:** ✅ COMPLETE

---

## Overview

Added Pulse marketing products to the rep back office store at `/dashboard/store` with member pricing and integrated Stripe checkout.

---

## Features

### 1. Pulse Products Section ✅

**Location:** `/dashboard/store`

**Products Added:**
| Product | Member Price | Retail Price | Savings | QV | BV |
|---------|--------------|--------------|---------|----|----|
| PulseMarket | $59 | $79 | 25% | 59 | $27.58 |
| PulseFlow | $129 | $149 | 13% | 129 | $60.32 |
| PulseDrive | $249 | $299 | 17% | 249 | $116.48 |
| PulseCommand | $399 | $499 | 20% | 399 | $186.62 |

### 2. Member Pricing Display ✅

Each product card shows:
- ✅ **Member price** (large, prominent)
- ✅ **Retail price** (crossed out)
- ✅ **Savings percentage** badge
- ✅ **QV and BV earned** on purchase
- ✅ **Top 3 features** preview
- ✅ **One-click checkout** button

### 3. Stripe Integration ✅

**Component:** `PulseProductCard.tsx`

**Checkout Flow:**
1. Rep clicks "Purchase at Member Price"
2. Calls `/api/stripe/create-checkout-session` with:
   ```typescript
   {
     productSlug: 'pulsedrive',
     priceType: 'member'
   }
   ```
3. Stripe creates checkout session with member price
4. Redirects to Stripe Checkout
5. On success, webhook credits QV/BV to referrer

---

## Files Created

### 1. `src/components/dashboard/PulseProductCard.tsx` (NEW)

**Purpose:** Product card component for Pulse products with member pricing

**Features:**
- Shows member vs retail pricing
- Displays QV/BV earned
- Handles Stripe checkout
- Loading states and error handling
- Responsive design

**Key Code:**
```typescript
const handleCheckout = async () => {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productSlug,
      priceType: 'member', // Member pricing
    }),
  });

  const data = await response.json();
  window.location.href = data.url; // Redirect to Stripe
};
```

---

## Files Modified

### 1. `src/app/dashboard/store/page.tsx`

**Changes:**
- ✅ Added import for `PulseProductCard`
- ✅ Added `pulseProducts` array with member pricing
- ✅ Added "Pulse Marketing Products" section before existing products
- ✅ Renders 4 Pulse product cards in grid layout

**Product Data:**
```typescript
const pulseProducts = [
  {
    productSlug: 'pulsemarket',
    name: 'PulseMarket',
    memberPrice: 59,
    retailPrice: 79,
    qv: 59,
    bv: 27.58,
    features: ['Unlimited social posts', 'AI content', 'Multi-platform'],
  },
  // ... PulseFlow, PulseDrive, PulseCommand
];
```

---

## User Experience

### Rep Journey:

1. **Navigate to Store**
   - Go to `/dashboard/store`
   - See "Pulse Marketing Products" section at top

2. **Browse Products**
   - View all 4 Pulse products in grid
   - See member pricing vs retail pricing
   - See savings percentage
   - See QV/BV they'll earn

3. **Purchase**
   - Click "Purchase at Member Price"
   - Redirected to Stripe Checkout
   - Complete payment

4. **Confirmation**
   - Stripe webhook processes purchase
   - Credits QV and BV to referring rep
   - Rep gets 60% of BV as commission
   - Customer gets product access

---

## Example Purchase Flow

### Rep Buys PulseDrive at Member Price ($249):

**1. Click "Purchase at Member Price"**

**2. Stripe Checkout Session Created:**
```json
{
  "line_items": [{
    "price": "price_1TGtvb0UcCrfpyRUBFOpVxkm", // Member price ID
    "quantity": 1
  }],
  "metadata": {
    "price_type": "member",
    "product_slug": "pulsedrive",
    "referred_by_slug": "johndoe"
  }
}
```

**3. Rep Completes Payment: $249**

**4. Webhook Processes:**
```typescript
// Calculate QV/BV
const { qv, bv } = calculateQVAndBV(24900, 'pulsedrive');
// Result: QV = 249, BV = $116.48

// Credit referrer
await supabase.from('members').update({
  personal_qv_monthly: referrer.personal_qv_monthly + 249,
  personal_bv_monthly: referrer.personal_bv_monthly + 116.48,
});

// Referrer earns: 60% × $116.48 = $69.89
```

---

## Testing Checklist

- [ ] Navigate to `/dashboard/store`
- [ ] Verify Pulse products section displays at top
- [ ] Verify all 4 products show correct member prices
- [ ] Verify savings percentages are correct
- [ ] Verify QV/BV amounts are correct
- [ ] Click "Purchase at Member Price" for PulseMarket
- [ ] Verify Stripe checkout opens with $59 price
- [ ] Complete test purchase
- [ ] Verify webhook credits 59 QV and $27.58 BV
- [ ] Verify referrer earns $16.55 commission

---

## Design Features

### Product Cards:
- **Gradient header** with icon when no image
- **Large member price** for emphasis
- **Strikethrough retail price** to show savings
- **Green savings badge** shows percentage off
- **QV/BV display** below pricing
- **Feature bullets** with checkmarks
- **Bold CTA button** "Purchase at Member Price"
- **Hover effects** for interactivity

### Grid Layout:
- **Mobile:** 1 column (stacked)
- **Tablet:** 2 columns
- **Desktop:** 4 columns

### Color Scheme:
- **Primary:** Blue (#2563eb) for buttons
- **Success:** Green for savings badges
- **Neutral:** Slate for text and borders

---

## Integration Points

### 1. Stripe Checkout API ✅
- Endpoint: `/api/stripe/create-checkout-session`
- Uses existing member price IDs
- No changes needed to API

### 2. Stripe Webhook ✅
- Endpoint: `/api/webhooks/stripe`
- Already handles member pricing
- Credits QV/BV automatically

### 3. QV/BV Calculator ✅
- Function: `calculateQVAndBV()`
- Automatically calculates from price
- No manual configuration needed

---

## Next Steps

### Optional Enhancements:

1. **Product Images**
   - Add professional product images to cards
   - Currently using gradient placeholder

2. **Detailed Product Pages**
   - Link to `/products/[slug]` for full details
   - Show all features, not just top 3

3. **Purchase History**
   - Show rep's previous Pulse purchases
   - Track which products they own

4. **Recommended Products**
   - Suggest upgrade path (Market → Flow → Drive → Command)
   - Show "most popular" badge

5. **Testimonials**
   - Add rep testimonials for each product
   - Social proof for purchasing decision

---

## Important Notes

- **Member pricing only** - No retail pricing in rep store
- **One-time purchase** - Not subscriptions (different from other store products)
- **Instant access** - Products activated immediately after payment
- **Commission eligible** - Reps earn on their own purchases (referral credits to sponsor)
- **QV/BV counted** - Purchases count toward rank qualification

---

## Technical Details

### Component Props:
```typescript
interface PulseProductCardProps {
  productSlug: 'pulsemarket' | 'pulseflow' | 'pulsedrive' | 'pulsecommand';
  name: string;
  description: string;
  memberPrice: number;
  retailPrice: number;
  qv: number;
  bv: number;
  features: string[];
  imageUrl?: string;
}
```

### API Request:
```typescript
POST /api/stripe/create-checkout-session
{
  "productSlug": "pulsedrive",
  "priceType": "member"
}
```

### Response:
```typescript
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

**Implementation Complete!** ✅

Reps can now purchase Pulse products at member pricing directly from their back office store.

**Last Updated:** 2026-03-31
