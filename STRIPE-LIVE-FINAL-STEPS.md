# Stripe Live Mode - Final Steps

## ✅ What's Been Done

1. ✅ **Created 6 Products in Stripe LIVE mode:**
   - PulseMarket ($79 retail / $59 member)
   - PulseFlow ($149 retail / $129 member)
   - PulseDrive ($399 retail / $349 member)
   - PulseCommand ($499 retail / $399 member)
   - SmartLock ($99 retail / $79 member)
   - Business Center ($40 retail / $39 member)

2. ✅ **Updated Database:**
   All 6 products now have LIVE price IDs in the database

3. ✅ **Updated `.env.local`:**
   - Changed secret key to LIVE: `sk_live_51T9s4M0s7Jg0EdCp...`
   - Marked placeholders for publishable key and webhook secret

---

## 🎯 What You Need To Do (2 Steps)

### Step 1: Get Your LIVE Publishable Key

1. Go to **https://dashboard.stripe.com/apikeys**
2. **Toggle to "Live mode"** (top right - should show red "Live" badge)
3. Find **Publishable key** (starts with `pk_live_`)
4. Click "Reveal test key" to copy it
5. Update in `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

---

### Step 2: Create LIVE Webhook Endpoint

1. Go to **https://dashboard.stripe.com/webhooks**
2. Make sure you're in **LIVE mode** (red badge)
3. Click **"+ Add endpoint"**
4. Enter endpoint URL:
   ```
   https://reachtheapex.net/api/webhooks/stripe
   ```
5. Click **"Select events"** and choose these:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Click on the newly created webhook
8. Find **"Signing secret"** (starts with `whsec_`)
9. Click **"Reveal"** and copy it
10. Update in `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

---

## 🔄 Step 3: Restart Dev Server

After updating `.env.local` with both values:

```bash
# Stop current server (Ctrl+C or kill the process)
npm run dev
```

---

## ✅ Verification Checklist

After completing the above steps, verify:

- [ ] `.env.local` has `pk_live_` publishable key (not `pk_test_`)
- [ ] `.env.local` has `sk_live_` secret key (not `sk_test_`)
- [ ] `.env.local` has `whsec_` webhook secret (from LIVE webhook)
- [ ] Dev server restarted successfully
- [ ] Navigate to `/dashboard/store` (or wherever Stripe checkout is)
- [ ] Test a checkout (use test card: `4242 4242 4242 4242`)
- [ ] Verify webhook received in Stripe Dashboard → Webhooks → Events

---

## 📊 Complete Product Summary (LIVE Mode)

All products are now in Stripe with these IDs:

### PulseMarket
- Product ID: `prod_UGkFnZAC6UHZZ9`
- Retail ($79/mo): `price_1TIClH0s7Jg0EdCpmtyGm6q9`
- Member ($59/mo): `price_1TIClI0s7Jg0EdCp8kq6nbox` ✅ (in database)

### PulseFlow
- Product ID: `prod_UGkFVtSwE5tvlO`
- Retail ($149/mo): `price_1TIClI0s7Jg0EdCpVfybCJyT`
- Member ($129/mo): `price_1TIClI0s7Jg0EdCpLwhhiZuz` ✅ (in database)

### PulseDrive
- Product ID: `prod_UGkFYH6wKTsZzt`
- Retail ($399/mo): `price_1TIClJ0s7Jg0EdCpiCqXwgel`
- Member ($349/mo): `price_1TIClJ0s7Jg0EdCpWY9OpdFh` ✅ (in database)

### PulseCommand
- Product ID: `prod_UGkF233LDpGpEj`
- Retail ($499/mo): `price_1TIClJ0s7Jg0EdCpUo41hli0`
- Member ($399/mo): `price_1TIClK0s7Jg0EdCpbAoW8JXA` ✅ (in database)

### SmartLock
- Product ID: `prod_UGkFeulYGBXwwg`
- Retail ($99/mo): `price_1TIClK0s7Jg0EdCpXlZMz93e`
- Member ($79/mo): `price_1TIClL0s7Jg0EdCp58wU2LyJ` ✅ (in database)

### Business Center
- Product ID: `prod_UGkFLPjQ6wYytN`
- Retail ($40/mo): `price_1TIClL0s7Jg0EdCpx92ZViwP`
- Member ($39/mo): `price_1TIClL0s7Jg0EdCpywREFLha` ✅ (in database)

---

## 🚨 Important Notes

### Testing Payments in LIVE Mode

Use these Stripe test cards:
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0027 6000 3184`

All test cards:
- Any future expiration date (e.g., `12/34`)
- Any 3-digit CVC (e.g., `123`)
- Any billing postal code (e.g., `12345`)

### Webhook Testing

To test webhooks locally during development:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3050/api/webhooks/stripe`
3. Use the webhook secret provided by the CLI

---

## 📞 Need Help?

If you encounter issues:
1. Check Stripe Dashboard → Logs for API errors
2. Check Stripe Dashboard → Webhooks → Events for delivery failures
3. Check your Next.js dev server console for errors
4. Verify all environment variables are set correctly

---

**Last Updated:** April 3, 2026
**Status:** Products created ✅ | Database updated ✅ | Awaiting publishable key & webhook setup
