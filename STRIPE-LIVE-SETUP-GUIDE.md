# Stripe LIVE Mode Setup Guide

## 📋 Overview

You need to create products in Stripe LIVE mode to match your test products. This guide walks you through the exact steps.

---

## 🚀 Step-by-Step Instructions

### Step 1: Access Stripe Dashboard

1. Go to: https://dashboard.stripe.com/products
2. **Switch to LIVE mode** (toggle at top-left corner)
3. Verify you see "LIVE" badge in top-left

---

### Step 2: Create Each Product

For each product below, follow these steps:

#### **Product 1: PulseMarket**
```
Product Name: PulseMarket
Description: CRM and marketing automation platform
```

**Price 1 - Retail:**
- Click "+ Add price"
- Price: $197.00
- Billing period: Monthly
- Click "Add price"
- Copy the Price ID (starts with `price_`)

**Price 2 - Member:**
- Click "+ Add another price"
- Price: $97.00
- Billing period: Monthly
- Click "Add price"
- Copy the Price ID (starts with `price_`)

---

#### **Product 2: PulseFlow**
```
Product Name: PulseFlow
Description: Advanced workflow automation and CRM integration
```

**Price 1 - Retail:**
- Price: $297.00
- Billing period: Monthly
- Copy Price ID

**Price 2 - Member:**
- Price: $149.00
- Billing period: Monthly
- Copy Price ID

---

#### **Product 3: PulseDrive**
```
Product Name: PulseDrive
Description: Sales pipeline management and lead tracking
```

**Price 1 - Retail:**
- Price: $397.00
- Billing period: Monthly
- Copy Price ID

**Price 2 - Member:**
- Price: $197.00
- Billing period: Monthly
- Copy Price ID

---

#### **Product 4: PulseCommand**
```
Product Name: PulseCommand
Description: Complete business automation suite
```

**Price 1 - Retail:**
- Price: $497.00
- Billing period: Monthly
- Copy Price ID

**Price 2 - Member:**
- Price: $247.00
- Billing period: Monthly
- Copy Price ID

---

### Step 3: Run the Update Script

Once you have all 8 price IDs (2 per product), run:

```bash
node update-stripe-live-prices.js
```

The script will:
1. Prompt you for each price ID
2. Validate the format
3. Update your `.env.local` file
4. Show a summary of changes

---

### Step 4: Restart Dev Server

After updating price IDs:

```bash
# Kill current server
Ctrl+C

# Start with LIVE keys
./dev-server-live.sh
```

---

## 📝 Price ID Format

**TEST mode:** `price_1TGsvC0UcCrfpyRU...` (from test account)
**LIVE mode:** `price_1[random]...` (from live account)

Make sure you're copying from **LIVE mode** in Stripe Dashboard!

---

## ✅ Verification

After setup, verify by:

1. Visit http://localhost:3050/api/debug-stripe
2. Should show: `"secretKeyMode": "LIVE"`
3. Make a test purchase (use test card even in live mode for testing)
4. Should NOT see "No such price" error

---

## 🔧 Troubleshooting

**"No such price" error:**
- You're using TEST price IDs with LIVE Stripe keys
- Solution: Create products in LIVE mode

**"Sandbox" still showing:**
- Browser cache issue
- Solution: Hard refresh (Ctrl+Shift+R) or use incognito

**Dev server using test keys:**
- Shell environment variables overriding .env.local
- Solution: Use `./dev-server-live.sh` to start server

---

## 📞 Need Help?

If you get stuck:
1. Make sure Stripe Dashboard shows "LIVE" badge
2. Double-check you're copying price IDs from the correct product
3. Verify price IDs start with `price_`
4. Ensure amounts match (Retail vs Member prices)
