# Integration Test Plan - FTC Compliance Features
**Date:** 2026-03-28
**Environment:** Vercel Staging (`apex-final-pre-lauch-jl8y4pe12-bot-makers.vercel.app`)
**Purpose:** Verify FTC compliance rules deployed to production

---

## Test Coverage

1. ✅ Anti-Frontloading Rule (Max 1 self-purchase per product/month counts toward BV)
2. ✅ 70% Retail Requirement (Override qualification)
3. ✅ Commission Clawback on Refund (60-day window)
4. ✅ Rank Advancement Logic (Credit accumulation and bonuses)

---

## Test 1: Anti-Frontloading Rule

### Feature
**File:** `src/lib/compliance/anti-frontloading.ts`
**Rule:** Only the first self-purchase of each product per month counts toward personal BV credits.

### Test Scenarios

#### Scenario 1.1: First Self-Purchase (Should Count)
**Steps:**
1. Create test distributor: `test-rep-001@example.com`
2. Log in as distributor
3. Purchase Product A (e.g., AI Business Center - $150/month)
4. Verify order completes successfully
5. Check `members.personal_credits_monthly` updated with BV credits

**Expected Result:**
- ✅ Order status: `completed`
- ✅ BV credited to `members.personal_credits_monthly`
- ✅ `checkAntiFrontloading()` returns `counts_toward_bv: true`

**SQL Verification:**
```sql
-- Check order created
SELECT id, rep_id, total_bv, status, created_at
FROM orders
WHERE rep_id = (SELECT id FROM distributors WHERE email = 'test-rep-001@example.com')
  AND status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());

-- Check BV credited
SELECT personal_credits_monthly, tech_rank
FROM members
WHERE distributor_id = (SELECT id FROM distributors WHERE email = 'test-rep-001@example.com');
```

---

#### Scenario 1.2: Second Self-Purchase Same Product (Should NOT Count)
**Steps:**
1. Using same distributor from 1.1
2. Purchase Product A again (second time this month)
3. Verify order completes successfully
4. Check BV NOT added to `personal_credits_monthly`

**Expected Result:**
- ✅ Order status: `completed` (purchase allowed)
- ✅ BV NOT credited (anti-frontloading applied)
- ✅ `checkAntiFrontloading()` returns `counts_toward_bv: false`
- ✅ Reason: "Anti-frontloading: 2 self-purchases this month. Only first purchase counts toward BV."

**SQL Verification:**
```sql
-- Check both orders exist
SELECT COUNT(*) as order_count
FROM orders
WHERE rep_id = (SELECT id FROM distributors WHERE email = 'test-rep-001@example.com')
  AND status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());
-- Should return: 2

-- Check BV only credited once
SELECT personal_credits_monthly
FROM members
WHERE distributor_id = (SELECT id FROM distributors WHERE email = 'test-rep-001@example.com');
-- Should be same as after Scenario 1.1
```

---

#### Scenario 1.3: Different Product (Should Count)
**Steps:**
1. Using same distributor
2. Purchase Product B (e.g., Premium Package - $300/month)
3. Verify BV IS credited (different product = new first purchase)

**Expected Result:**
- ✅ Order status: `completed`
- ✅ BV credited (first purchase of Product B)
- ✅ `personal_credits_monthly` increased

---

#### Scenario 1.4: Next Month Reset
**Steps:**
1. Wait until next month OR manually set `created_at` to next month
2. Purchase Product A again
3. Verify BV IS credited (monthly reset)

**Expected Result:**
- ✅ BV credited (new month = reset counter)
- ✅ `counts_toward_bv: true`

---

## Test 2: 70% Retail Requirement

### Feature
**File:** `src/lib/compliance/retail-validation.ts`
**Rule:** At least 70% of personal BV must come from retail (non-distributor) customers.

### Test Scenarios

#### Scenario 2.1: 100% Retail Sales (Compliant)
**Steps:**
1. Create test distributor: `test-rep-002@example.com`
2. Create 3 retail customers (NOT distributors)
3. Process 3 orders from retail customers to `test-rep-002`
4. Check compliance status

**Expected Result:**
- ✅ `check70PercentRetail()` returns `compliant: true`
- ✅ `retail_percentage: 100`
- ✅ Distributor qualifies for overrides

**SQL Verification:**
```sql
-- Check all orders are retail
SELECT
  o.id,
  o.customer_id,
  o.total_bv,
  d.id as is_distributor
FROM orders o
LEFT JOIN distributors d ON d.id = o.customer_id
WHERE o.rep_id = (SELECT id FROM distributors WHERE email = 'test-rep-002@example.com')
  AND o.status = 'completed'
  AND o.created_at >= DATE_TRUNC('month', NOW());
-- is_distributor should be NULL for all orders
```

---

#### Scenario 2.2: 50% Self-Purchase (Non-Compliant)
**Steps:**
1. Create test distributor: `test-rep-003@example.com`
2. Process 1 self-purchase order ($150 BV)
3. Process 1 retail customer order ($150 BV)
4. Check compliance status

**Expected Result:**
- ✅ `compliant: false`
- ✅ `retail_percentage: 50` (below 70% threshold)
- ✅ `shortfall_bv: 60` (need $60 more retail BV)
- ✅ Override qualification: `qualified: false`
- ✅ Reason: "Retail compliance: 50.0% < 70% required"

---

#### Scenario 2.3: Exactly 70% Retail (Compliant)
**Steps:**
1. Create test distributor: `test-rep-004@example.com`
2. Process retail orders totaling $210 BV
3. Process self-purchase totaling $90 BV
4. Check compliance: 210/(210+90) = 70%

**Expected Result:**
- ✅ `compliant: true`
- ✅ `retail_percentage: 70.0`
- ✅ Qualifies for overrides (if BV >= 50)

---

#### Scenario 2.4: Admin Compliance Report
**Steps:**
1. Login as admin
2. Navigate to `/admin/compliance`
3. View retail compliance dashboard
4. Check non-compliant distributors list

**Expected Result:**
- ✅ Dashboard shows:
  - Total distributors with sales
  - Compliant count
  - Non-compliant count
  - Compliance rate percentage
- ✅ `test-rep-003` appears in non-compliant list
- ✅ `test-rep-002` and `test-rep-004` do NOT appear

**API Test:**
```bash
# Get compliance report
curl -X GET "https://apex-final-pre-lauch-jl8y4pe12-bot-makers.vercel.app/api/admin/compliance/overview" \
  -H "Cookie: <admin-session-cookie>"
```

---

## Test 3: Commission Clawback on Refund

### Feature
**File:** `src/app/api/webhooks/stripe-refund/route.ts`
**File:** `src/lib/compensation/clawback-processor.ts`
**Rule:** When order is refunded, all commissions paid on that order are clawed back within 60 days.

### Test Scenarios

#### Scenario 3.1: Full Refund Within 60 Days
**Steps:**
1. Create order for $300 (generates commissions to sponsor + upline)
2. Wait for commission run to complete
3. Verify commissions created in `earnings_ledger` with `status: 'approved'`
4. Issue full refund via Stripe dashboard
5. Stripe webhook fires: `charge.refunded` event
6. Check clawback processing

**Expected Result:**
- ✅ Order status updated to `refunded`
- ✅ Clawback entries created in `earnings_ledger`:
  - `type: 'clawback'`
  - `amount_usd: -<original_commission>`
  - `status: 'approved'`
  - `source_order_id: <refunded_order_id>`
- ✅ Each recipient's `personal_credits_monthly` reduced
- ✅ Webhook returns: `{ received: true, clawback_result: {...} }`

**SQL Verification:**
```sql
-- Check original commissions
SELECT id, member_id, amount_usd, type, status, source_order_id
FROM earnings_ledger
WHERE source_order_id = '<order_id>'
  AND type IN ('override_l1', 'override_l2', 'rank_bonus')
  AND status = 'approved';

-- Check clawback entries
SELECT id, member_id, amount_usd, type, status, source_order_id
FROM earnings_ledger
WHERE source_order_id = '<order_id>'
  AND type = 'clawback'
  AND status = 'approved';

-- Total should net to $0
SELECT SUM(amount_usd) as net_amount
FROM earnings_ledger
WHERE source_order_id = '<order_id>';
-- Should be close to 0 (accounting for rounding)
```

---

#### Scenario 3.2: Partial Refund
**Steps:**
1. Create order for $500
2. Issue partial refund of $200
3. Check clawback proportional to refund amount

**Expected Result:**
- ✅ Order status: `partially_refunded`
- ✅ Clawback = (refund amount / original amount) × original commissions
- ✅ Example: If $100 commission, clawback = ($200/$500) × $100 = $40

---

#### Scenario 3.3: Refund After 60 Days (Grace Period)
**Steps:**
1. Create order with `created_at` = 61 days ago
2. Issue refund
3. Check clawback still processed (no grace period limit currently)

**Expected Result:**
- ✅ Clawback processed regardless of age
- ✅ FTC compliance: No time limit on clawbacks

**Note:** Current implementation has no 60-day limit. All refunds trigger clawback.

---

#### Scenario 3.4: Webhook Signature Verification
**Steps:**
1. Send fake webhook request without valid Stripe signature
2. Check request rejected

**Expected Result:**
- ✅ Returns `400 Bad Request`
- ✅ Error: "Invalid signature"
- ✅ No clawback processed

**Test Command:**
```bash
curl -X POST "https://apex-final-pre-lauch-jl8y4pe12-bot-makers.vercel.app/api/webhooks/stripe-refund" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type":"charge.refunded","data":{"object":{"id":"ch_test"}}}'
```

---

## Test 4: Rank Advancement Logic

### Feature
**File:** `src/lib/compensation/config.ts`
**File:** `src/app/dashboard/compensation/tech-ladder/page.tsx`
**Rule:** Distributors advance ranks based on personal + team credits, with one-time bonuses.

### Test Scenarios

#### Scenario 4.1: Starter → Bronze Advancement
**Requirements:**
- Personal: 150 credits
- Team: 300 credits
- Bonus: $250

**Steps:**
1. Create test distributor: `test-rep-005@example.com`
2. Generate 150 personal credits (retail sales)
3. Generate 300 team credits (downline sales)
4. Run monthly commission calculation
5. Check rank updated to `bronze`

**Expected Result:**
- ✅ `members.tech_rank = 'bronze'`
- ✅ `members.highest_tech_rank = 'bronze'`
- ✅ One-time bonus of $250 in `earnings_ledger`:
  - `type: 'rank_bonus'`
  - `amount_usd: 250`
  - `metadata: { rank: 'bronze' }`

---

#### Scenario 4.2: Bronze → Silver Advancement
**Requirements:**
- Personal: 500 credits
- Team: 1500 credits
- Bonus: $500

**Steps:**
1. Using `test-rep-005` from previous scenario
2. Generate additional credits to reach 500 personal + 1500 team
3. Run monthly commission calculation
4. Check rank updated to `silver`

**Expected Result:**
- ✅ Rank: `silver`
- ✅ Bronze bonus NOT paid again (already paid)
- ✅ Silver bonus $500 paid (first time achievement)

---

#### Scenario 4.3: Rank Never Goes Down
**Steps:**
1. Using `test-rep-005` at Silver rank
2. Next month, drop below Silver requirements
3. Verify rank stays at Silver

**Expected Result:**
- ✅ `tech_rank` remains `silver` (not demoted)
- ✅ `highest_tech_rank` remains `silver`
- ✅ Override calculation may be affected by current credits

---

#### Scenario 4.4: Dashboard Rank Progress
**Steps:**
1. Login as `test-rep-005`
2. Navigate to `/dashboard`
3. Check "Progress to Next Rank" widget

**Expected Result:**
- ✅ Shows current rank: Silver
- ✅ Shows next rank: Gold
- ✅ Shows credits needed: e.g., "Need 700 more personal credits"
- ✅ Progress bar shows correct percentage

**SQL Verification:**
```sql
SELECT
  tech_rank,
  highest_tech_rank,
  personal_credits_monthly,
  team_credits_monthly
FROM members
WHERE distributor_id = (SELECT id FROM distributors WHERE email = 'test-rep-005@example.com');
```

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Verify staging database has clean test data
- [ ] Create admin test account
- [ ] Create 5 test distributor accounts
- [ ] Create 5 test retail customer accounts
- [ ] Verify Stripe test mode enabled
- [ ] Set up webhook endpoint in Stripe dashboard

### Test Execution
- [ ] Test 1.1: First self-purchase counts
- [ ] Test 1.2: Second self-purchase doesn't count
- [ ] Test 1.3: Different product counts
- [ ] Test 1.4: Monthly reset
- [ ] Test 2.1: 100% retail (compliant)
- [ ] Test 2.2: 50% retail (non-compliant)
- [ ] Test 2.3: Exactly 70% retail (edge case)
- [ ] Test 2.4: Admin compliance dashboard
- [ ] Test 3.1: Full refund clawback
- [ ] Test 3.2: Partial refund clawback
- [ ] Test 3.3: Refund after 60 days
- [ ] Test 3.4: Webhook signature verification
- [ ] Test 4.1: Starter → Bronze
- [ ] Test 4.2: Bronze → Silver
- [ ] Test 4.3: Rank never goes down
- [ ] Test 4.4: Dashboard rank progress

### Post-Test Verification
- [ ] Document all test results
- [ ] Screenshot evidence for each scenario
- [ ] Export SQL query results
- [ ] Check Vercel logs for errors
- [ ] Verify no regression in other features

---

## Known Issues / Edge Cases

### Anti-Frontloading
- ⚠️ Currently uses `rep_id` field - ensure all self-purchases set this correctly
- ⚠️ Monthly reset at midnight UTC - may cause timezone edge cases

### 70% Retail
- ⚠️ Checks if `customer_id` exists in `distributors` table
- ⚠️ If customer later becomes distributor, past orders still count as retail
- ⚠️ Performance: Each order does separate lookup - may be slow for large volumes

### Commission Clawback
- ⚠️ Clawback processes immediately on webhook
- ⚠️ If webhook fails, clawback may not process (need retry mechanism)
- ⚠️ Partial refunds calculate proportionally - verify rounding

### Rank Advancement
- ⚠️ Rank bonuses paid once per rank (stored in member record)
- ⚠️ Monthly commission run required to trigger advancement
- ⚠️ If commission run fails, ranks may not update

---

## Success Criteria

**All tests must pass:**
- ✅ 16/16 test scenarios pass
- ✅ No errors in Vercel logs
- ✅ SQL verifications match expected results
- ✅ Admin dashboard shows correct data
- ✅ Email alerts sent for compliance violations (if configured)

---

## Test Results Log

**Tester:** _________________
**Date:** _________________
**Environment:** Vercel Staging

| Test # | Scenario | Pass/Fail | Notes |
|--------|----------|-----------|-------|
| 1.1 | First self-purchase counts | ☐ Pass ☐ Fail | |
| 1.2 | Second purchase doesn't count | ☐ Pass ☐ Fail | |
| 1.3 | Different product counts | ☐ Pass ☐ Fail | |
| 1.4 | Monthly reset | ☐ Pass ☐ Fail | |
| 2.1 | 100% retail compliant | ☐ Pass ☐ Fail | |
| 2.2 | 50% retail non-compliant | ☐ Pass ☐ Fail | |
| 2.3 | 70% retail edge case | ☐ Pass ☐ Fail | |
| 2.4 | Admin compliance dashboard | ☐ Pass ☐ Fail | |
| 3.1 | Full refund clawback | ☐ Pass ☐ Fail | |
| 3.2 | Partial refund clawback | ☐ Pass ☐ Fail | |
| 3.3 | Refund after 60 days | ☐ Pass ☐ Fail | |
| 3.4 | Webhook signature reject | ☐ Pass ☐ Fail | |
| 4.1 | Starter → Bronze | ☐ Pass ☐ Fail | |
| 4.2 | Bronze → Silver | ☐ Pass ☐ Fail | |
| 4.3 | Rank never goes down | ☐ Pass ☐ Fail | |
| 4.4 | Dashboard rank progress | ☐ Pass ☐ Fail | |

**Overall Result:** ☐ All Pass ☐ Some Failures

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**Report Generated:** 2026-03-28
**Next Review:** After test execution
