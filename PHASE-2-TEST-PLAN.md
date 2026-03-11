# Phase 2 Testing Plan — Revenue Protection

**Date:** March 11, 2026
**Status:** Testing Phase
**Implementations:** 5 tasks complete, ready for testing

---

## 🎯 Testing Objectives

Verify that all Phase 2 implementations work correctly and prevent revenue loss:

| Implementation | Revenue Impact | Test Priority |
|----------------|----------------|---------------|
| Subscription Renewals | $240k-$1.2M | ⚠️ CRITICAL |
| CAB Clawback | $60k-$120k | ⚠️ CRITICAL |
| Refund Handler | $24k-$120k | ⚠️ CRITICAL |
| Commission Caps | $120k-$600k | HIGH |
| BV Triggers | Data integrity | HIGH |

---

## 📋 Test Suite

### Test 1: BV Recalculation Triggers ✅ CAN TEST NOW

**Purpose:** Verify database triggers recalculate BV in real-time

**Prerequisites:**
- Migrations applied to test database
- Test data: Rep with sponsor chain

**Test Steps:**

```sql
-- Step 1: Create test rep and sponsor
INSERT INTO distributors (id, full_name, email, current_rank, sponsor_id, status)
VALUES
  ('test-sponsor-001', 'Test Sponsor', 'sponsor@test.com', 'GOLD', NULL, 'active'),
  ('test-rep-001', 'Test Rep', 'rep@test.com', 'BRONZE', 'test-sponsor-001', 'active');

-- Step 2: Check initial BV (should be 0)
SELECT * FROM org_bv_cache WHERE rep_id IN ('test-rep-001', 'test-sponsor-001');

-- Step 3: Create test order (complete status)
INSERT INTO orders (
  id, rep_id, customer_id, product_id,
  order_type, gross_amount_cents, status,
  bv_amount, bv_credited, created_at
) VALUES (
  'test-order-001', 'test-rep-001', 'test-customer-001', 'PULSEMARKET',
  'member', 9700, 'complete',
  97.00, false, NOW()
);

-- Step 4: Verify BV updated automatically
SELECT * FROM org_bv_cache WHERE rep_id IN ('test-rep-001', 'test-sponsor-001');
-- Expected: test-rep-001 personal_bv = 97, test-sponsor-001 team_bv includes 97

-- Step 5: Test UPDATE (refund scenario)
UPDATE orders SET status = 'refunded' WHERE id = 'test-order-001';

-- Step 6: Verify BV deducted
SELECT * FROM org_bv_cache WHERE rep_id IN ('test-rep-001', 'test-sponsor-001');
-- Expected: BV back to 0

-- Cleanup
DELETE FROM orders WHERE id = 'test-order-001';
DELETE FROM distributors WHERE id IN ('test-rep-001', 'test-sponsor-001');
```

**Success Criteria:**
- ✅ BV increases when order created
- ✅ BV decreases when order refunded
- ✅ Sponsor chain BV updates correctly
- ✅ Triggers execute in <100ms

---

### Test 2: Subscription Renewal → Order Creation ⚠️ REQUIRES STRIPE

**Purpose:** Verify renewals create new orders and credit BV

**Prerequisites:**
- Stripe test mode configured
- Stripe CLI installed
- Webhook endpoint accessible

**Test Steps:**

```bash
# Step 1: Set up Stripe test mode
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...

# Step 2: Start webhook listener (in one terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Step 3: Create test subscription
stripe subscriptions create \
  --customer cus_test_... \
  --items[0][price]=price_test_...

# Step 4: Trigger invoice.paid event
stripe trigger invoice.payment_succeeded

# Step 5: Verify in database
SELECT * FROM orders WHERE stripe_subscription_id = 'sub_test_...';
-- Expected: New order record created

SELECT * FROM org_bv_cache WHERE rep_id = '[rep-id]';
-- Expected: BV credited

SELECT * FROM notifications WHERE type = 'subscription_renewed';
-- Expected: Notification sent to rep

SELECT * FROM subscription_renewals WHERE stripe_invoice_id = 'in_test_...';
-- Expected: Renewal logged
```

**Success Criteria:**
- ✅ New order created on invoice.paid
- ✅ Idempotency check prevents duplicates
- ✅ BV credited to rep
- ✅ Promotion fund credited (if Business Center)
- ✅ Rep notified
- ✅ Renewal logged

---

### Test 3: CAB Clawback Processing ⚠️ REQUIRES SETUP

**Purpose:** Verify daily cron job processes expired clawbacks

**Prerequisites:**
- Edge Function deployed
- Test data in cab_clawback_queue

**Test Steps:**

```sql
-- Step 1: Create test data (backdated to 65 days ago)
INSERT INTO cab_clawback_queue (
  id, rep_id, customer_id, order_id, cab_amount,
  cancel_date, clawback_eligible_until, status, created_at
) VALUES (
  'test-clawback-001',
  'test-rep-001',
  'test-customer-001',
  'test-order-001',
  50.00,
  NOW() - INTERVAL '65 days',
  NOW() - INTERVAL '5 days',
  'pending',
  NOW() - INTERVAL '65 days'
);

-- Step 2: Create CAB record in PENDING state
INSERT INTO commissions_cab (
  id, rep_id, customer_id, order_id, amount, state,
  release_eligible_date, month_year, status, created_at
) VALUES (
  'test-cab-001',
  'test-rep-001',
  'test-customer-001',
  'test-order-001',
  50.00,
  'PENDING',
  NOW() - INTERVAL '5 days',
  '2026-01',
  'pending',
  NOW() - INTERVAL '65 days'
);
```

```bash
# Step 3: Manually trigger Edge Function
curl -X POST https://[project-ref].supabase.co/functions/v1/process-cab-clawback \
  -H "Authorization: Bearer [service-role-key]" \
  -H "Content-Type: application/json"
```

```sql
-- Step 4: Verify clawback processed
SELECT * FROM cab_clawback_queue WHERE id = 'test-clawback-001';
-- Expected: status = 'clawback', processed_at populated

SELECT * FROM commissions_cab WHERE rep_id = 'test-rep-001' AND state = 'CLAWBACK';
-- Expected: Original CAB state = 'CLAWBACK', negative entry created

SELECT * FROM notifications WHERE type = 'cab_clawback';
-- Expected: Rep notified

SELECT * FROM audit_log WHERE action = 'cab_clawback_processed';
-- Expected: Audit entry created

-- Cleanup
DELETE FROM cab_clawback_queue WHERE id = 'test-clawback-001';
DELETE FROM commissions_cab WHERE id IN ('test-cab-001', ...);
```

**Success Criteria:**
- ✅ Expired clawbacks identified correctly
- ✅ CAB state updated to 'CLAWBACK'
- ✅ Negative commission entry created
- ✅ Queue status updated to 'clawback'
- ✅ Rep notified
- ✅ Admin notified (if count > 0)
- ✅ Audit log entry created

---

### Test 4: Refund Handler ⚠️ REQUIRES STRIPE

**Purpose:** Verify charge.refunded webhook deducts BV

**Prerequisites:**
- Stripe test mode configured
- Test order in database

**Test Steps:**

```bash
# Step 1: Create test charge
stripe charges create \
  --amount 9700 \
  --currency usd \
  --source tok_visa \
  --description "Test order"

# Step 2: Create matching order in database
INSERT INTO orders (...) VALUES (...);

# Step 3: Trigger refund
stripe refunds create --charge ch_test_...

# Alternatively, use Stripe CLI trigger
stripe trigger charge.refunded
```

```sql
-- Step 4: Verify refund processed
SELECT * FROM orders WHERE stripe_payment_intent_id = 'pi_test_...';
-- Expected: status = 'refunded'

SELECT * FROM org_bv_cache WHERE rep_id = '[rep-id]';
-- Expected: BV deducted

SELECT * FROM audit_log WHERE action = 'order_refunded_needs_clawback';
-- Expected: Audit entry for manual clawback

SELECT * FROM notifications WHERE type = 'order_refunded';
-- Expected: Rep notified
```

**Success Criteria:**
- ✅ Order status updated to 'refunded'
- ✅ BV deducted from org_bv_cache
- ✅ Audit log entry created
- ✅ Rep notified
- ✅ Admin notified

---

### Test 5: Commission Cap Enforcement 🧪 UNIT TEST

**Purpose:** Verify $25k matching cap and $3k car cap

**Prerequisites:**
- Test environment with TypeScript/Node

**Test Steps:**

Create test file: `src/lib/compensation/__tests__/bonuses.test.ts`

```typescript
import { calculateMatchingBonus, calculateCarAllowance } from '../bonuses';
import type { Rep, Rank } from '../types';

describe('Commission Cap Enforcement', () => {
  const mockDb = {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve()),
    })),
  };

  describe('Matching Bonus Cap ($25k)', () => {
    it('should cap matching bonus at $25,000', async () => {
      const rep: Rep = {
        rep_id: 'test-rep-001',
        full_name: 'Test Rep',
        current_rank: 'PLATINUM',
        // ... other required fields
      };

      const l1Overrides = new Map([
        ['leader-1', 100000], // Would earn $20k (20% of $100k)
        ['leader-2', 50000],  // Would earn $10k (20% of $50k)
        // Total = $30k, should be capped to $25k
      ]);

      const l1Ranks = new Map<string, Rank>([
        ['leader-1', 'GOLD'],
        ['leader-2', 'SILVER'],
      ]);

      const result = await calculateMatchingBonus(rep, l1Overrides, l1Ranks, mockDb);

      expect(result).toBe(25000); // Capped
      expect(mockDb.from).toHaveBeenCalledWith('audit_log');
      expect(mockDb.from).toHaveBeenCalledWith('notifications');
    });

    it('should not cap if under $25,000', async () => {
      const rep: Rep = {
        rep_id: 'test-rep-001',
        full_name: 'Test Rep',
        current_rank: 'SILVER',
        // ... other required fields
      };

      const l1Overrides = new Map([
        ['leader-1', 10000], // Would earn $1k (10% of $10k)
      ]);

      const l1Ranks = new Map<string, Rank>([
        ['leader-1', 'BRONZE'],
      ]);

      const result = await calculateMatchingBonus(rep, l1Overrides, l1Ranks, mockDb);

      expect(result).toBe(1000); // Not capped
    });
  });

  describe('Car Bonus Cap ($3k)', () => {
    it('should not cap normal $400 car bonus', async () => {
      const rep: Rep = {
        rep_id: 'test-rep-001',
        full_name: 'Test Rep',
        car_allowance_active: true,
        // ... other required fields
      };

      const result = await calculateCarAllowance(rep, mockDb);

      expect(result).toBe(400); // Normal amount
    });
  });
});
```

```bash
# Run tests
npm test -- bonuses.test.ts
```

**Success Criteria:**
- ✅ Matching bonus capped at $25k when exceeded
- ✅ Car bonus capped at $3k when exceeded (edge case)
- ✅ Audit log entries created
- ✅ Notifications sent
- ✅ No cap applied when under threshold

---

## 🚀 Deployment Testing (Staging)

After unit tests pass, deploy to staging:

### Step 1: Apply Migrations

```bash
cd supabase
supabase db push --db-url postgresql://...staging...
```

**Verify:**
```sql
-- Check triggers exist
SELECT tgname FROM pg_trigger WHERE tgname LIKE 'recalculate_bv%';
-- Expected: 3 triggers (insert, update, delete)

-- Check cron job scheduled
SELECT * FROM cron.job WHERE jobname = 'process-cab-clawback-daily';
-- Expected: 1 row, schedule = '0 2 * * *'
```

### Step 2: Deploy Edge Functions

```bash
# Deploy stripe-webhook
supabase functions deploy stripe-webhook --project-ref [staging-ref]

# Deploy process-cab-clawback
supabase functions deploy process-cab-clawback --project-ref [staging-ref]
```

### Step 3: Set Secrets

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  --project-ref [staging-ref]
```

### Step 4: End-to-End Test

Run all test scenarios from Tests 1-4 against staging environment.

---

## 📊 Test Results Log

| Test | Status | Date | Notes |
|------|--------|------|-------|
| BV Triggers | ⏳ PENDING | - | - |
| Renewal Flow | ⏳ PENDING | - | Requires Stripe CLI |
| CAB Clawback | ⏳ PENDING | - | Requires Edge Function |
| Refund Handler | ⏳ PENDING | - | Requires Stripe CLI |
| Commission Caps | ⏳ PENDING | - | Unit tests |
| Staging Deploy | ⏳ PENDING | - | After all tests pass |

---

## ✅ Sign-Off Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Staging deployment successful
- [ ] End-to-end test in staging passes
- [ ] Cron job verified (check at 2:01 AM next day)
- [ ] Webhook signatures verified
- [ ] Audit log entries correct
- [ ] Notifications sent correctly
- [ ] No TypeScript errors
- [ ] No console errors in logs
- [ ] Performance acceptable (<100ms for triggers)

---

## 🚨 Rollback Plan

If issues found in production:

```bash
# Disable cron job
SELECT cron.unschedule('process-cab-clawback-daily');

# Disable triggers (emergency only)
ALTER TABLE orders DISABLE TRIGGER recalculate_bv_on_order_insert;
ALTER TABLE orders DISABLE TRIGGER recalculate_bv_on_order_update;
ALTER TABLE orders DISABLE TRIGGER recalculate_bv_on_order_delete;

# Revert Edge Functions (deploy previous version)
supabase functions deploy stripe-webhook --project-ref [prod-ref]
```

---

**Next Steps:**
1. Run Test 1 (BV Triggers) - can test immediately
2. Set up Stripe CLI for Tests 2 & 4
3. Deploy Edge Function for Test 3
4. Create unit tests for Test 5
5. Deploy to staging
6. Final verification

**Estimated Time:** 8-12 hours for complete test suite
