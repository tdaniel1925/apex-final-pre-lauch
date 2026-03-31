# COMMISSION RUN ENGINE - DOCUMENTATION

**Version:** 1.0
**Date:** March 31, 2026
**Status:** ✅ Complete

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Commission Calculation Process](#commission-calculation-process)
4. [API Endpoints](#api-endpoints)
5. [Admin Interface](#admin-interface)
6. [Database Schema](#database-schema)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 OVERVIEW

The Commission Run Engine is the core component of the Apex MLM compensation system. It calculates and distributes monthly commissions to all distributors based on the 7-level override system.

### Key Features

- ✅ **Automated Monthly Calculation**: Processes all transactions for a given month
- ✅ **7-Level Override System**: L1 enrollment (25%) + L2-L7 matrix (varies by rank)
- ✅ **50 QV Minimum**: Enforces qualification rules
- ✅ **Breakage Tracking**: 100% unpaid overrides go to Apex
- ✅ **Business Center Exception**: Fixed $1.75 per level
- ✅ **Dry Run Mode**: Test calculations without database writes
- ✅ **CSV Export**: Export commissions for payment processing
- ✅ **Audit Trail**: Complete logging of all calculations

---

## 🏗️ ARCHITECTURE

### File Structure

```
src/
├── lib/
│   ├── commission-engine/
│   │   ├── monthly-run.ts          # Core commission calculation logic
│   │   └── qualification-check.ts  # 50 QV qualification checks
│   └── compensation/
│       ├── config.ts               # Override schedules and constants
│       ├── override-calculator.ts  # L1-L7 override calculations
│       └── waterfall.ts            # BV calculation from sale amount
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── commission-run/
│   │           ├── execute/
│   │           │   └── route.ts    # POST endpoint to run commissions
│   │           └── [id]/
│   │               └── export/
│   │                   └── route.ts # GET endpoint to export CSV
│   └── admin/
│       └── commission-run/
│           └── page.tsx            # Admin UI for commission runs
└── tests/
    └── commission-engine/
        └── test-monthly-run.ts     # Comprehensive test script
```

### Data Flow

```
1. Admin triggers commission run (manual or scheduled)
   ↓
2. Fetch all product_sale transactions for the month
   ↓
3. For each transaction:
   a. Calculate BV from sale amount (waterfall)
   b. Calculate seller commission (60% of BV)
   c. Calculate L1 enrollment override (25% of pool)
   d. Calculate L2-L7 matrix overrides (varies by rank)
   e. Check 50 QV minimum for each recipient
   f. Calculate breakage (unpaid overrides)
   ↓
4. Insert all commission entries into earnings_ledger
   ↓
5. Return summary with totals
   ↓
6. Admin reviews and exports CSV for payment processing
```

---

## 💰 COMMISSION CALCULATION PROCESS

### Step 1: BV Calculation (Waterfall)

From APEX_COMP_ENGINE_SPEC_7_LEVEL.md:

```
STEP 1: Customer pays PRICE (retail or member)
STEP 2: BotMakers takes 30% of price = ADJUSTED GROSS
STEP 3: Apex takes 30% of Adjusted Gross = REMAINDER
STEP 4: Leadership Pool: 1.5% of Remainder
STEP 5: Bonus Pool: 3.5% of Remainder
STEP 6: BV (Business Volume) = Remainder - Pools
STEP 7: Seller gets 60% of BV
STEP 8: Override Pool gets 40% of BV
```

**Example: $149 PulseFlow Sale**

```
$149.00  Retail Price
- $44.70  BotMakers (30%)
---------
$104.30  Adjusted Gross
- $31.29  Apex (30%)
---------
  $73.01  Remainder
-  $1.10  Leadership Pool (1.5%)
-  $2.52  Bonus Pool (3.5%)
---------
  $69.39  BV (Commission Pool)
=========
  $41.63  Seller (60% of BV)
  $27.76  Override Pool (40% of BV)
```

### Step 2: Seller Commission

- **Always paid** (even if distributor doesn't qualify for overrides)
- **60% of BV**
- Logged in `earnings_ledger` with `earning_type = 'seller_commission'`

### Step 3: Override Distribution (L1-L7)

#### L1 Enrollment Override (25%)

- Uses **ENROLLMENT TREE** (`distributors.sponsor_id`)
- **Always 25%** for all ranks
- Paid to the sponsor (who enrolled the seller)

#### L2-L7 Matrix Overrides

- Uses **MATRIX TREE** (`distributors.matrix_parent_id`)
- **Percentages vary by rank**:

| Rank | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Total | Breakage |
|------|----|----|----|----|----|----|----| ------|----------|
| Starter | 25% | — | — | — | — | — | — | 25% | 75% |
| Bronze | 25% | 20% | — | — | — | — | — | 45% | 55% |
| Silver | 25% | 20% | 18% | — | — | — | — | 63% | 37% |
| Gold | 25% | 20% | 18% | 15% | — | — | — | 78% | 22% |
| Platinum | 25% | 20% | 18% | 15% | 10% | — | — | 88% | 12% |
| Ruby | 25% | 20% | 18% | 15% | 10% | 7% | — | 95% | 5% |
| Diamond Ambassador | 25% | 20% | 18% | 15% | 10% | 7% | 5% | 100% | 0% |

### Step 4: 50 QV Minimum Enforcement

**CRITICAL RULE**: Must generate 50+ personal QV/month to earn overrides

- If `members.personal_qv_monthly < 50`:
  - ✅ Seller commission is **STILL PAID**
  - ❌ Override commissions = **$0**
  - ❌ Bonuses = **$0**

- If unqualified, override payment is **skipped** (compression continues to next upline)
- Unpaid overrides become **breakage** (100% to Apex)

### Step 5: Breakage Calculation

**Breakage** = Override Pool - Total Overrides Paid

- 100% goes to Apex (not split with BotMakers)
- Tracked for reporting and transparency
- Logged in commission run summary

---

## 🔌 API ENDPOINTS

### POST /api/admin/commission-run/execute

Execute monthly commission calculation.

**Authentication**: Super Admin or Finance role required

**Request Body**:
```json
{
  "month": "2026-03",
  "dryRun": false
}
```

**Response**:
```json
{
  "success": true,
  "run_id": "RUN-2026-03",
  "month": "2026-03",
  "totals": {
    "transactions_processed": 150,
    "total_sales_amount": 15000.00,
    "total_bv_amount": 7000.00,
    "total_seller_commissions": 4200.00,
    "total_override_commissions": 2100.00,
    "total_commissions": 6300.00,
    "breakage_amount": 700.00,
    "distributors_paid": 50
  },
  "status": "completed"
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not an admin
- `409 Conflict`: Commission run already exists for this month
- `500 Internal Server Error`: Calculation failed

### GET /api/admin/commission-run/[id]/export

Export commission run as CSV.

**Authentication**: Super Admin or Finance role required

**Response**: CSV file download

**CSV Columns**:
- Member ID
- Member Name
- Email
- Earning Type
- Source Member
- Source Product
- Override Level
- Override %
- Rank
- Amount
- Status
- Notes

---

## 🖥️ ADMIN INTERFACE

### Commission Run Dashboard

**URL**: `/admin/commission-run`

**Features**:
- View all past commission runs
- Manual trigger for commission calculation
- Dry run mode for testing
- Run status tracking
- Summary statistics

**Screenshot**:
```
┌─────────────────────────────────────────────────────┐
│  Commission Runs                                     │
├─────────────────────────────────────────────────────┤
│  Run Commission Calculation                          │
│  ┌────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Month  │  │ Dry Run  │  │ Execute  │           │
│  └────────┘  └──────────┘  └──────────┘           │
├─────────────────────────────────────────────────────┤
│  Commission Run History                              │
│  Month     | Transactions | Commissions | Status   │
│  ─────────────────────────────────────────────────  │
│  Mar 2026  |     150      |  $6,300.00  | ✓        │
│  Feb 2026  |     120      |  $4,800.00  | ✓        │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### earnings_ledger

All commission payments are stored in the `earnings_ledger` table:

```sql
CREATE TABLE earnings_ledger (
  earning_id UUID PRIMARY KEY,
  run_id UUID NOT NULL,
  run_date DATE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  member_id UUID NOT NULL,
  member_name TEXT NOT NULL,
  earning_type TEXT NOT NULL CHECK (earning_type IN (
    'override',
    'seller_commission',
    'rank_bonus',
    'bonus_pool',
    'leadership_pool',
    'fast_start_bonus',
    'generation_bonus',
    'business_center'
  )),
  source_member_id UUID,
  source_member_name TEXT,
  source_order_id UUID,
  source_product_name TEXT,
  override_level INTEGER,
  override_percentage NUMERIC(5, 2),
  member_tech_rank TEXT,
  member_insurance_rank TEXT,
  base_amount_cents INTEGER NOT NULL,
  adjustment_cents INTEGER DEFAULT 0,
  final_amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'paid',
    'held',
    'reversed',
    'disputed'
  )),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Query Examples

**Get all commissions for a specific run**:
```sql
SELECT * FROM earnings_ledger
WHERE run_id = 'RUN-2026-03'
ORDER BY member_name;
```

**Get total commissions by member**:
```sql
SELECT
  member_name,
  SUM(final_amount_cents) / 100.0 AS total_usd
FROM earnings_ledger
WHERE run_id = 'RUN-2026-03'
GROUP BY member_id, member_name
ORDER BY total_usd DESC;
```

**Get override breakdown by level**:
```sql
SELECT
  override_level,
  COUNT(*) AS count,
  SUM(final_amount_cents) / 100.0 AS total_usd
FROM earnings_ledger
WHERE run_id = 'RUN-2026-03'
  AND earning_type = 'override'
GROUP BY override_level
ORDER BY override_level;
```

---

## 🧪 TESTING

### Manual Testing Steps

1. **Create Test Transactions**:
   ```sql
   -- Insert test product sale transactions
   INSERT INTO transactions (
     distributor_id,
     transaction_type,
     amount,
     product_slug,
     status,
     created_at
   ) VALUES (
     'test-distributor-id',
     'product_sale',
     149.00,
     'pulseflow',
     'completed',
     '2026-03-15'
   );
   ```

2. **Run Dry Run**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/commission-run/execute \
     -H "Content-Type: application/json" \
     -d '{"month": "2026-03", "dryRun": true}'
   ```

3. **Verify Calculations**:
   - Check console output for detailed breakdown
   - Verify BV calculations match expected values
   - Verify override distributions match rank schedules
   - Verify 50 QV minimum is enforced

4. **Run Actual Commission Calculation**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/commission-run/execute \
     -H "Content-Type: application/json" \
     -d '{"month": "2026-03", "dryRun": false}'
   ```

5. **Export CSV**:
   ```bash
   curl http://localhost:3000/api/admin/commission-run/RUN-2026-03/export \
     -o commission-run-2026-03.csv
   ```

### Automated Tests

Run the test script:
```bash
npx ts-node tests/commission-engine/test-monthly-run.ts
```

**Expected Output**:
```
🧪 COMMISSION ENGINE TEST SUITE
========================================

TEST 1: BV Calculation from Sale Amount
----------------------------------------
✅ PASS: BV calculation matches spec

TEST 2: Business Center Fixed Split
----------------------------------------
✅ PASS: Business Center matches spec

TEST 3: Override Schedules by Rank
----------------------------------------
✅ PASS: Override schedules match 7-level spec

TEST 4: Waterfall Percentages
----------------------------------------
✅ PASS: Waterfall percentages match spec

========================================
TEST SUMMARY
========================================
✅ All automated tests passed!
```

---

## 🔧 TROUBLESHOOTING

### Issue: Commission run already exists

**Error**: `Commission run for 2026-03 already exists`

**Solution**: Each month can only have one commission run. If you need to re-run:
1. Delete existing entries from `earnings_ledger` for that run_id
2. Re-run the commission calculation

### Issue: No transactions found

**Error**: `No transactions to process`

**Solution**: Verify transactions exist for the selected month:
```sql
SELECT * FROM transactions
WHERE transaction_type = 'product_sale'
  AND status = 'completed'
  AND created_at >= '2026-03-01'
  AND created_at < '2026-04-01';
```

### Issue: Override calculations seem wrong

**Checklist**:
1. ✅ Verify `distributors.sponsor_id` is correct (enrollment tree)
2. ✅ Verify `distributors.matrix_parent_id` is correct (matrix tree)
3. ✅ Verify `members.personal_qv_monthly >= 50` for override recipients
4. ✅ Verify `members.paying_rank` is correct (NOT tech_rank)
5. ✅ Check for double-dipping (same person paid twice)

### Issue: Breakage amount is too high

**Explanation**: Breakage is normal! It represents unpaid override pool.

**Common Causes**:
- Low rank distributors (Starter = 75% breakage)
- Unqualified uplines (below 50 QV minimum)
- Short matrix chains (not enough levels)

**Expected Breakage by Rank**:
- Starter: 75%
- Bronze: 55%
- Silver: 37%
- Gold: 22%
- Platinum: 12%
- Ruby: 5%
- Diamond Ambassador: 0%

---

## 📞 SUPPORT

For questions or issues, contact:
- **Developer**: Trent Daniel
- **Email**: trent@theapexway.net
- **Documentation**: `APEX_COMP_ENGINE_SPEC_7_LEVEL.md`

---

**Last Updated**: March 31, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
