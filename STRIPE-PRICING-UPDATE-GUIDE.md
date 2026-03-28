# Stripe Autopilot Pricing Update Guide

**Date**: March 19, 2026
**Task**: Update Social Connector pricing from $9/month to $39/month

---

## ✅ Code Changes (Already Complete)

The following code has been updated to reflect the new $39 pricing:

### 1. Product Configuration Updated
**File**: `src/lib/stripe/autopilot-products.ts`

```typescript
social_connector: {
  tier: 'social_connector',
  name: 'Social Connector',
  displayName: 'Social Connector',
  description: 'Boost your reach with social media posting and custom event flyers',
  priceMonthly: 39,      // ✅ Updated from 9 to 39
  priceCents: 3900,      // ✅ Updated from 900 to 3900
  bvValue: 39,           // ✅ 1:1 BV ratio
  stripePriceId: process.env.STRIPE_AUTOPILOT_SOCIAL_PRICE_ID || '',
  // ... rest of config
}
```

### 2. BV Configuration Added
All tiers now have 1:1 BV (Business Volume) ratios:
- **Free**: $0 = 0 BV
- **Social Connector**: $39 = 39 BV ✅ (was $9)
- **Pro Edition**: $79 = 79 BV
- **Team Edition**: $119 = 119 BV

### 3. Checkout Metadata Updated
**File**: `src/lib/stripe/autopilot-helpers.ts`

The checkout session now includes BV tracking:
```typescript
metadata: {
  distributor_id: distributorId,
  autopilot_tier: tier,
  product_type: 'autopilot_subscription',
  bv_amount: product.bvValue.toString(), // ✅ Added BV tracking
  is_personal_purchase: 'true',
}
```

---

## 🔄 Stripe Dashboard Changes Required

Since Stripe Price objects are immutable, you need to create a NEW price for the $39/month tier.

### Option A: Create New Price in Stripe Dashboard (Recommended)

1. **Go to Stripe Dashboard**:
   https://dashboard.stripe.com/test/products

2. **Find the "Social Connector" product**

3. **Add a New Price**:
   - Click "+ Add another price"
   - **Amount**: $39.00
   - **Billing period**: Monthly
   - **Description**: Social Connector - Updated pricing
   - Click "Add price"

4. **Copy the New Price ID**:
   - It will look like: `price_XXXXXXXXXXXXXXXXXX`
   - Copy this ID

5. **Update `.env.local`**:
   ```env
   STRIPE_AUTOPILOT_SOCIAL_PRICE_ID=price_XXXXXXXXXXXXXXXXXX  # New $39 price ID
   ```

6. **Update production `.env`** with the same new price ID

7. **Archive the old $9 price** (optional):
   - Go to the old $9 price
   - Click "Archive price" to hide it from new customers

---

### Option B: Create New Price via Stripe CLI

```bash
# Install Stripe CLI if needed
brew install stripe/stripe-cli/stripe  # macOS
# or download from: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Create new price
stripe prices create \
  --unit-amount=3900 \
  --currency=usd \
  --recurring[interval]=month \
  --recurring[interval_count]=1 \
  --product=prod_XXXXXXXXXXXX \  # Replace with your Social Connector product ID
  --nickname="Social Connector - $39/month" \
  --lookup_key="autopilot_social_connector_39"

# The output will include the new price ID
# Copy it to your .env.local file
```

---

### Option C: Create via Node.js Script

```javascript
// scripts/update-stripe-social-price.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createNewPrice() {
  try {
    // Get the existing Social Connector product
    const products = await stripe.products.list({
      lookup_keys: ['autopilot_social_connector'],
    });

    if (products.data.length === 0) {
      throw new Error('Social Connector product not found');
    }

    const product = products.data[0];
    console.log('Found product:', product.id, product.name);

    // Create new $39/month price
    const newPrice = await stripe.prices.create({
      unit_amount: 3900, // $39.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      product: product.id,
      nickname: 'Social Connector - $39/month',
      lookup_key: 'autopilot_social_connector_39',
    });

    console.log('✅ New price created!');
    console.log('Price ID:', newPrice.id);
    console.log('\nAdd this to your .env.local:');
    console.log(`STRIPE_AUTOPILOT_SOCIAL_PRICE_ID=${newPrice.id}`);

    // List all prices for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    console.log('\nAll prices for this product:');
    prices.data.forEach((price) => {
      console.log(`- ${price.id}: $${price.unit_amount / 100}/month ${price.active ? '(active)' : '(archived)'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createNewPrice();
```

**Run the script**:
```bash
node scripts/update-stripe-social-price.js
```

---

## 📋 Verification Checklist

After updating the Stripe price:

- [ ] New $39 price created in Stripe Dashboard
- [ ] Price ID copied to `.env.local`
- [ ] Price ID copied to production `.env`
- [ ] Application restarted to load new environment variables
- [ ] Test signup flow:
  - [ ] Navigate to `/autopilot/subscription`
  - [ ] Click "Subscribe" for Social Connector
  - [ ] Verify Stripe Checkout shows **$39.00/month**
  - [ ] Complete test purchase (use Stripe test card: `4242 4242 4242 4242`)
  - [ ] Verify subscription created successfully
  - [ ] Check database: `autopilot_subscriptions` table shows tier `social_connector`
  - [ ] Verify BV tracked: Check `orders` table for `bv_amount = 39`

---

## 🎯 Current Stripe Price IDs

**From `.env.local`**:

```env
# Current (BEFORE UPDATE)
STRIPE_AUTOPILOT_SOCIAL_PRICE_ID=price_1TCVHY0UcCrfpyRUBdnyKKRF   # $9/month (OLD)
STRIPE_AUTOPILOT_PRO_PRICE_ID=price_1TCVHZ0UcCrfpyRUuwMfPTTV     # $79/month ✅
STRIPE_AUTOPILOT_TEAM_PRICE_ID=price_1TCVHZ0UcCrfpyRUZ4v63jss    # $119/month ✅

# After updating Social Connector:
STRIPE_AUTOPILOT_SOCIAL_PRICE_ID=price_XXXXXXXXXXXXXXXXXX  # $39/month (NEW) ⬅️ Update this
```

---

## 🔍 Current Status

**Code**: ✅ Updated to $39
**Stripe Dashboard**: ⏳ Needs manual update
**BV Configuration**: ✅ 1:1 ratio configured
**Metadata Tracking**: ✅ BV included in checkout

---

## 📞 Questions?

If you need help with Stripe configuration, refer to:
- [Stripe Prices Documentation](https://stripe.com/docs/api/prices)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- Stripe Dashboard: https://dashboard.stripe.com
