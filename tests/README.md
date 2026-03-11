# Phase 2 Testing Suite

Test scripts for validating Phase 2 Revenue Protection implementations.

---

## 📋 Test Files

| Test File | Purpose | Requirements |
|-----------|---------|--------------|
| `test-bv-triggers.sql` | BV recalculation triggers | Database access |
| `test-cab-clawback.sql` | CAB clawback processing | Edge Function deployed |
| `test-stripe-webhooks.sh` | Stripe webhook handlers | Stripe CLI + test mode |

---

## 🚀 Quick Start

### Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked:**
   ```bash
   supabase login
   supabase link --project-ref [your-project-ref]
   ```

3. **Migrations applied:**
   ```bash
   cd supabase
   supabase db push
   ```

4. **Stripe CLI installed (for webhook tests):**
   ```bash
   brew install stripe/stripe-cli/stripe
   # or
   scoop install stripe
   ```

---

## 🧪 Running Tests

### Test 1: BV Recalculation Triggers

**What it tests:** Database triggers that automatically recalculate BV when orders change

**Run:**
```bash
# Using Supabase CLI
supabase db execute -f tests/test-bv-triggers.sql

# Or using psql directly
psql "postgresql://..." -f tests/test-bv-triggers.sql
```

**Expected Output:**
```
=== TEST 1: Insert Order (Complete Status) ===
BV Before Order:
 rep_id           | personal_bv | team_bv | org_bv
------------------+-------------+---------+--------
 test-rep-001     |           0 |       0 |      0
 test-sponsor-001 |           0 |       0 |      0

BV After Order:
 rep_id           | personal_bv | team_bv | org_bv
------------------+-------------+---------+--------
 test-rep-001     |          97 |       0 |     97
 test-sponsor-001 |           0 |      97 |     97

✅ PASS: BV increased after order created
```

**Success Criteria:**
- ✅ BV increases when complete order inserted
- ✅ BV decreases when order refunded
- ✅ BV decreases when order deleted
- ✅ NO BV change for pending orders
- ✅ Sponsor chain updated correctly

---

### Test 2: CAB Clawback Processing

**What it tests:** Daily cron job that processes CAB clawbacks

**Prerequisites:**
- Edge Function `process-cab-clawback` deployed to Supabase

**Run:**
```bash
# Step 1: Set up test data
supabase db execute -f tests/test-cab-clawback.sql

# Step 2: Manually trigger Edge Function
curl -X POST https://[project-ref].supabase.co/functions/v1/process-cab-clawback \
  -H "Authorization: Bearer $(supabase secrets get SERVICE_ROLE_KEY)" \
  -H "Content-Type: application/json"

# Step 3: Verify results (re-run SQL verification section)
```

**Expected Response:**
```json
{
  "success": true,
  "processed_at": "2026-03-11T...",
  "cabs_clawed_back": 1,
  "cabs_cleared": 1,
  "total_processed": 2
}
```

**Success Criteria:**
- ✅ Expired clawbacks processed
- ✅ Original CAB state = 'CLAWBACK'
- ✅ Negative commission entry created
- ✅ Rep notified
- ✅ Audit log entry created

---

### Test 3: Stripe Webhook Handlers

**What it tests:** Subscription renewals and refund processing

**Prerequisites:**
- Stripe CLI installed and authenticated
- Stripe test mode configured in .env.local

**Run:**
```bash
# Step 1: Start webhook listener (Terminal 1)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Step 2: Start Next.js dev server (Terminal 2)
npm run dev

# Step 3: Run test script (Terminal 3)
bash tests/test-stripe-webhooks.sh
```

**Test Script will:**
1. Create test subscription
2. Trigger `invoice.paid` event (renewal)
3. Verify new order created
4. Trigger `charge.refunded` event
5. Verify BV deducted

**Success Criteria:**
- ✅ Renewal creates new order
- ✅ BV credited on renewal
- ✅ Rep notified of renewal
- ✅ Refund updates order status
- ✅ BV deducted on refund
- ✅ Audit log entries created

---

## 📊 Test Results

Track test results here:

| Test | Status | Date | Duration | Notes |
|------|--------|------|----------|-------|
| BV Triggers | ⏳ PENDING | - | - | - |
| CAB Clawback | ⏳ PENDING | - | - | - |
| Stripe Webhooks | ⏳ PENDING | - | - | - |

---

## 🚨 Troubleshooting

### Issue: "relation does not exist"
**Cause:** Migrations not applied
**Fix:**
```bash
cd supabase
supabase db push
```

### Issue: "function recalculate_sponsor_chain does not exist"
**Cause:** Missing database function
**Fix:** Check that migration `20260311000007_bv_recalculation_triggers.sql` was applied

### Issue: "Edge Function not found"
**Cause:** Edge Function not deployed
**Fix:**
```bash
supabase functions deploy process-cab-clawback
```

### Issue: Stripe webhooks not received
**Cause:** Webhook listener not running or wrong endpoint
**Fix:**
```bash
# Check webhook listener is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify endpoint is correct
curl http://localhost:3000/api/webhooks/stripe
```

---

## 📝 Manual Test Checklist

Before deploying to production:

- [ ] All SQL tests pass
- [ ] Edge Function processes clawbacks correctly
- [ ] Stripe renewals create orders
- [ ] Stripe refunds deduct BV
- [ ] Notifications sent correctly
- [ ] Audit logs populated
- [ ] No console errors
- [ ] Performance acceptable (<100ms)

---

## 🔗 Related Documentation

- [Phase 2 Test Plan](../PHASE-2-TEST-PLAN.md) - Full testing strategy
- [Production Readiness Roadmap](../PRODUCTION-READINESS-ROADMAP.md) - Overall plan
- [Handoff Document](../HANDOFF-NEXT-SESSION.md) - Session context

---

## ✅ Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**All Tests Passed:** [ ] Yes [ ] No
**Notes:** ___________________________________
