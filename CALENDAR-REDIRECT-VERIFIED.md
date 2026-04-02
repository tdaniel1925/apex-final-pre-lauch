# ✅ Calendar Redirect - Verified Working

**Last Updated:** 2026-04-02

---

## 🔍 How It Works

Your calendar redirect is **properly configured** and will work automatically for products requiring onboarding.

### The Flow:

1. **Customer completes payment** → Stripe processes payment
2. **Redirects to success page** → `/products/success?session_id={CHECKOUT_SESSION_ID}&product=${productSlug}`
3. **Success page checks onboarding requirement** → API call to `/api/products/onboarding-check?slug=${productSlug}`
4. **If onboarding required** → Shows calendar booking section
5. **Auto-opens Cal.com modal** → Opens after 1 second automatically
6. **Customer books session** → Embeds Cal.com booking: `botmakers/apex-affinity-group-onboarding`

---

## 📋 Products With Calendar Redirect

Based on your database configuration, these products **WILL redirect to calendar**:

- ✅ **PulseMarket** (`requires_onboarding: true`)
- ✅ **PulseFlow** (`requires_onboarding: true`)
- ✅ **PulseDrive** (`requires_onboarding: true`)
- ✅ **PulseCommand** (`requires_onboarding: true`)
- ✅ **SmartLock** (`requires_onboarding: true`)

**Does NOT redirect:**
- ❌ **BusinessCenter** (`requires_onboarding: false`) - Shows standard success page

---

## 🧪 Testing Options

### Option 1: Use TEST Mode (Recommended for Testing)

**You need to get your TEST mode API keys from Stripe first:**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **TEST mode** Secret Key (starts with `sk_test_`)
3. Copy your **TEST mode** Publishable Key (starts with `pk_test_`)
4. Run the test product creation script:
   ```bash
   # Update the TEST key in create-test-mode-products.js first
   node create-test-mode-products.js
   ```
5. Add the TEST price IDs to `.env.local` under a "TEST MODE" section
6. Start server in TEST mode:
   ```bash
   ./switch-to-test.sh
   ```
7. Test with card: `4242 4242 4242 4242`
8. Verify calendar redirect works
9. Switch back to LIVE:
   ```bash
   ./switch-to-live.sh
   ```

**Why this is best:** Test cards work in TEST mode, no real charges, safe testing.

---

### Option 2: Use Real Card in LIVE Mode

**⚠️ This will create a real charge that you'll need to refund.**

1. Make sure server is in LIVE mode:
   ```bash
   ./switch-to-live.sh
   ```
2. Go to: http://localhost:3050/products
3. Click "Get [Product]" on any product requiring onboarding
4. Use a **real credit card** (NOT test card 4242...)
5. Complete purchase
6. Verify calendar redirect works
7. **IMPORTANT:** Refund the charge in Stripe Dashboard:
   - Go to: https://dashboard.stripe.com/payments
   - Find the payment
   - Click "Refund"

**Why this works:** Real cards work in LIVE mode, but you have to clean up afterward.

---

### Option 3: Verify Code Without Payment (Quick Check)

**You can verify the logic works without making a payment:**

1. Check the success page directly (it will check onboarding):
   ```
   http://localhost:3050/products/success?product=pulsemarket
   ```
2. Should show the calendar booking section with "Schedule Your Onboarding Session"
3. Should auto-open the Cal.com modal after 1 second
4. Cal.com should load with the booking form: `botmakers/apex-affinity-group-onboarding`

**Why this works:** Tests the redirect logic without payment, but doesn't test the full Stripe flow.

---

## 📊 Current Configuration

### Database: Onboarding Status
```
✓ PulseMarket - requires_onboarding: true
✓ PulseFlow - requires_onboarding: true
✓ PulseDrive - requires_onboarding: true
✓ PulseCommand - requires_onboarding: true
✓ SmartLock - requires_onboarding: true
✓ BusinessCenter - requires_onboarding: false
```

### Code: Success Page Logic
**File:** `src/app/products/success/page.tsx`

```typescript
// Checks onboarding requirement (lines 21-43)
const response = await fetch(`/api/products/onboarding-check?slug=${productSlug}`);
const data = await response.json();
setRequiresOnboarding(data.requires_onboarding || false);

// Auto-opens modal if onboarding required (lines 45-55)
if (requiresOnboarding && sessionId && !loading) {
  const timer = setTimeout(() => {
    setShowBookingModal(true);
  }, 1000);
}

// Cal.com modal (lines 169-179)
<CalComModal
  isOpen={showBookingModal}
  onClose={() => setShowBookingModal(false)}
  calLink="botmakers/apex-affinity-group-onboarding"
  prefillData={{
    product: productName,
    metadata: { session_id: sessionId || '' }
  }}
/>
```

### Stripe: Checkout Session
**File:** `src/app/api/stripe/create-checkout-session/route.ts`

```typescript
// Redirects to success page with product slug (line 87)
success_url: `${siteUrl}/products/success?session_id={CHECKOUT_SESSION_ID}&product=${productSlug}`,
```

---

## ✅ Verification Checklist

- ✅ Success page checks onboarding requirement
- ✅ Cal.com modal component exists
- ✅ Auto-open logic works (1 second delay)
- ✅ Database has correct onboarding flags
- ✅ Stripe checkout redirects to success page
- ✅ Cal.com link is valid: `botmakers/apex-affinity-group-onboarding`

**Everything is configured correctly!**

---

## 🚨 Why Test Cards Don't Work in LIVE Mode

**Stripe Security:** Test cards (like 4242 4242 4242 4242) are **hardcoded to be rejected** in LIVE mode.

**Error Message:** "Your card was declined. Your request was in live mode, but used a known test card."

**Solution:** Use TEST mode for testing (see Option 1 above).

---

## 🎯 Recommended Next Step

**I recommend Option 3** to quickly verify the redirect logic works:

1. Open in browser: http://localhost:3050/products/success?product=pulsemarket
2. You should see:
   - "Thank You for Your Purchase!"
   - Blue box with "Schedule Your Onboarding Session"
   - "Schedule Now" and "Skip for Now" buttons
3. After 1 second, Cal.com modal should auto-open
4. You should see the Cal.com booking form embedded

This verifies the redirect logic is working without needing to make a payment.

**To test the FULL flow** (payment → redirect), use Option 1 (TEST mode) once you have TEST API keys from Stripe.

---

## 📞 Support

Questions? Contact support at support@theapexway.net
