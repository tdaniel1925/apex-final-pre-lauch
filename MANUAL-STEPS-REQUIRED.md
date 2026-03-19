# 📋 Manual Steps Required for Full Production Deployment

## ✅ What's Already Done
- ✅ All code merged to master
- ✅ TypeScript compilation clean
- ✅ 250+ tests created
- ✅ Critical bugs fixed
- ✅ Database migrations applied

## 🔧 Required Manual Steps

### 1. Apply RLS Fix in Supabase (5 minutes)

**Why:** Fixes infinite recursion in Row Level Security policies for genealogy/team queries

**Steps:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy ENTIRE contents of `apply-rls-fix-direct.sql` from project root
6. Paste into SQL Editor
7. Click "Run" (or press Ctrl+Enter)
8. Verify you see: "Success. No rows returned"

**Expected Result:** Function `get_user_downline` created, new policy `member_read_downline` active

**Verification:**
```bash
npm test -- tests/unit/api-genealogy.test.ts --run
# Should go from 27/54 passing to 54/54 passing
```

---

### 2. Configure Stripe Products (10 minutes)

**Why:** Enables Autopilot subscription purchases

**Steps:**

#### A. Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Create 3 products:

**Product 1: Social Connector**
- Name: "Apex Lead Autopilot - Social Connector"
- Description: "Social posting and event flyers"
- Pricing: $9/month recurring
- Copy the **Price ID** (starts with `price_...`)

**Product 2: Lead Autopilot Pro**
- Name: "Apex Lead Autopilot - Pro"
- Description: "CRM, SMS campaigns, and AI lead scoring"
- Pricing: $79/month recurring
- Add 14-day free trial
- Copy the **Price ID**

**Product 3: Team Edition**
- Name: "Apex Lead Autopilot - Team Edition"
- Description: "Unlimited features with team broadcasts and training"
- Pricing: $119/month recurring
- Copy the **Price ID**

#### B. Add Price IDs to Environment

1. Open `.env.local`
2. Add these lines (replace with your actual Price IDs):
```env
STRIPE_AUTOPILOT_SOCIAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_AUTOPILOT_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_AUTOPILOT_TEAM_PRICE_ID=price_xxxxxxxxxxxxx
```

#### C. Configure Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe-autopilot`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret** (starts with `whsec_...`)
6. Add to `.env.local`:
```env
STRIPE_AUTOPILOT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Verification:**
```bash
# Test subscription creation
curl -X POST http://localhost:3050/api/autopilot/subscribe \
  -H "Content-Type: application/json" \
  -d '{"tier":"social_connector"}'
```

---

### 3. Configure Email Service (5 minutes)

**Why:** Enables meeting invitation emails

**Steps:**

1. Sign up for [Resend](https://resend.com) (free tier: 100 emails/day)
2. Verify your domain or use `onboarding@resend.dev` for testing
3. Get your API key from Resend Dashboard
4. Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Verification:**
```bash
# Test sending invitation
# After creating an invitation via UI, check Resend logs
```

---

### 4. Optional: Configure SMS (if using SMS features)

**Why:** Enables SMS campaigns in CRM

**Steps:**

1. Sign up for [Twilio](https://www.twilio.com)
2. Get phone number
3. Get Account SID and Auth Token
4. Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🧪 Testing After Configuration

### Test 1: Signup Flow
```bash
# Run signup test
npm run dev
# Open browser: http://localhost:3050/signup?ref=apex-vision
# Fill form and submit
# Verify success
```

### Test 2: Matrix View
```bash
# Login as Charles Potter: fyifromcharles@gmail.com
# Navigate to /back-office/matrix
# Verify shows 3 reps: Sella, Donna, Brian
```

### Test 3: Autopilot Subscription
```bash
# Login as any distributor
# Navigate to /autopilot/subscription
# Click "Upgrade to Social Connector"
# Complete Stripe checkout (use test card 4242 4242 4242 4242)
# Verify tier upgraded
```

### Test 4: Meeting Invitations
```bash
# Navigate to /autopilot/invitations
# Create new invitation
# Verify email sent (check Resend logs)
```

---

## 📊 Monitoring & Verification

### Check Database Health
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM autopilot_subscriptions;
SELECT COUNT(*) FROM meeting_invitations;
SELECT * FROM autopilot_usage_limits LIMIT 10;
```

### Check Logs
```bash
# Check for errors
npm run dev
# Monitor console for any errors
```

### Run Full Test Suite
```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e
```

---

## 🚀 Deploy to Production

Once all manual steps are complete:

```bash
# Build for production
npm run build

# Deploy to Vercel/your hosting
vercel --prod
# or
npm run deploy
```

---

## 📞 Support

If you encounter issues:

1. Check `FINAL-COMPREHENSIVE-TEST-REPORT.md` for detailed information
2. Check `BACK-OFFICE-AUDIT-REPORT.md` for specific issue resolutions
3. Review agent summaries in `AGENT-*` files
4. All test files are in `tests/` directory

---

## ✅ Checklist

- [ ] RLS fix applied in Supabase
- [ ] Stripe products created
- [ ] Stripe Price IDs added to .env.local
- [ ] Stripe webhook configured
- [ ] Resend API key added
- [ ] Signup test passing
- [ ] Matrix view shows reps
- [ ] Subscription upgrade works
- [ ] Meeting invitations send emails
- [ ] Production build successful
- [ ] Deployed to production

---

**Total Time Required:** ~30 minutes

**Priority:** High (RLS fix) > Medium (Stripe) > Low (SMS)

**Current Status:** Code is 100% ready, just needs configuration
