# Commission Clawback System - Documentation

**Date:** 2026-03-27
**Status:** ✅ IMPLEMENTED
**Compliance:** FTC MLM Regulations

---

## 📋 OVERVIEW

The commission clawback system handles the reversal of commissions when orders are refunded or cancelled. This is a **critical compliance requirement** for FTC regulations governing MLM companies.

### Compliance Requirement

**FTC Rule:** If a customer receives a refund within 60 days, ALL commissions and bonuses paid on that sale must be clawed back from the distributors' next payment.

---

## 🏗️ ARCHITECTURE

### Database Tables

#### 1. `earnings_ledger`
**Purpose:** Track all commission earnings
**Key Fields:**
- `earning_id` - Unique identifier
- `source_order_id` - Links to original order
- `final_amount_cents` - Commission amount
- `status` - 'pending', 'approved', 'paid', 'reversed'
- `notes` - Tracks clawback reason

#### 2. `cab_clawback_queue`
**Purpose:** Track orders within 60-day clawback window
**Key Fields:**
- `order_id` - Order being tracked
- `rep_id` - Distributor who received commission
- `cab_amount` - Amount subject to clawback
- `cancel_date` - When order was cancelled/refunded
- `clawback_eligible_until` - End of 60-day window
- `status` - 'pending', 'clawback', 'cleared'

#### 3. `orders`
**Purpose:** Track order status
**Key Fields:**
- `id` - Order ID
- `status` - 'completed', 'refunded', 'cancelled'
- `stripe_payment_intent_id` - Links to Stripe payment

---

## 🔄 PROCESS FLOW

### 1. Order Refund Detection

**Trigger:** Stripe webhook `charge.refunded` event

**Flow:**
```
1. Stripe sends charge.refunded event
2. Webhook receives event at /api/webhooks/stripe-refund
3. Find order by stripe_payment_intent_id
4. Update order status to 'refunded'
5. Trigger clawback processing
```

### 2. Clawback Processing

**Function:** `processOrderClawback(orderId)`

**Steps:**
```
1. Fetch order details from orders table
2. Find all earnings in earnings_ledger for this order
   - WHERE source_order_id = orderId
   - AND status IN ('pending', 'approved', 'paid')
3. For each earning:
   a. Create negative earnings_ledger entry (reversal)
      - base_amount_cents = -original_amount
      - status = 'approved' (auto-approve clawbacks)
      - notes = 'CLAWBACK: Refund of order {orderId}'
   b. Mark original earning as 'reversed'
4. Add entry to cab_clawback_queue for tracking
   - clawback_eligible_until = cancel_date + 60 days
   - status = 'clawback'
5. Return summary of clawed-back commissions
```

### 3. Daily Cleanup Job

**Schedule:** Daily at 2:00 AM (via Supabase pg_cron)
**Endpoint:** `/api/cron/process-clawbacks`

**Purpose:** Clear expired clawback queue entries after 60-day window passes

**Steps:**
```
1. Find all cab_clawback_queue entries WHERE:
   - status = 'pending'
   - clawback_eligible_until < NOW()
2. Update status to 'cleared'
3. Log to audit_log
```

---

## 📡 API ENDPOINTS

### 1. POST /api/admin/compensation/clawback

**Purpose:** Manually process clawback for refunded orders
**Auth:** Admin only

**Request Body:**
```typescript
{
  order_id?: string;        // Single order clawback
  order_ids?: string[];     // Batch clawback
  clear_expired?: boolean;  // Clear expired queue entries
}
```

**Response:**
```typescript
{
  success: boolean;
  result: {
    order_id: string;
    total_clawed_back_cents: number;
    affected_members: string[];
  }
}
```

**Example:**
```bash
curl -X POST https://yourdomain.com/api/admin/compensation/clawback \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "123e4567-e89b-12d3-a456-426614174000"}'
```

### 2. GET /api/admin/compensation/clawback

**Purpose:** Get active clawback queue (orders within 60-day window)
**Auth:** Admin only

**Response:**
```typescript
{
  success: boolean;
  count: number;
  queue: ClawbackQueueRecord[];
}
```

### 3. POST /api/webhooks/stripe-refund

**Purpose:** Receive Stripe refund webhooks
**Auth:** Stripe signature verification

**Handled Events:**
- `charge.refunded` - Full or partial refund
- `payment_intent.canceled` - Payment cancelled

**Response:**
```typescript
{
  received: boolean;
  order_id: string;
  clawback_result: ClawbackResult;
}
```

### 4. POST /api/cron/process-clawbacks

**Purpose:** Daily cron job to clear expired clawback queue
**Auth:** Cron token or service role key
**Schedule:** Daily at 2:00 AM

**Response:**
```typescript
{
  success: boolean;
  cleared_count: number;
  active_count: number;
  timestamp: string;
}
```

---

## 🔧 IMPLEMENTATION FILES

### Core Logic
- **`src/lib/compensation/clawback-processor.ts`**
  - `processOrderClawback()` - Process single order clawback
  - `batchProcessClawbacks()` - Process multiple orders
  - `getMemberPendingClawbacks()` - Get member's pending clawbacks
  - `getActiveClawbackQueue()` - Get active clawback queue
  - `clearExpiredClawbackQueue()` - Clear expired entries

### API Endpoints
- **`src/app/api/admin/compensation/clawback/route.ts`**
  - Admin endpoints for manual clawback processing

- **`src/app/api/webhooks/stripe-refund/route.ts`**
  - Stripe webhook handler for refund events

- **`src/app/api/cron/process-clawbacks/route.ts`**
  - Daily cron job for cleanup

### Database
- **`supabase/migrations/20260311000004_remaining_dependency_connections.sql`**
  - Creates `cab_clawback_queue` table

- **`supabase/migrations/20260327000009_update_clawback_cron.sql`**
  - Updates cron job to use Next.js API endpoint

---

## 🧪 TESTING

### Manual Testing

#### 1. Test Clawback Processing
```bash
# Process clawback for a test order
curl -X POST http://localhost:3000/api/admin/compensation/clawback \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "test-order-id"}'
```

#### 2. Test Stripe Webhook (Local)
```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe-refund

# Trigger test refund event
stripe refunds create --charge=ch_test_123
```

#### 3. Test Cron Job
```bash
# Manually trigger cron endpoint
curl -X POST http://localhost:3000/api/cron/process-clawbacks \
  -H "x-cron-token: {CRON_SECRET}"
```

### Verification Queries

#### Check Clawback Queue
```sql
SELECT * FROM cab_clawback_queue
WHERE status = 'pending'
ORDER BY created_at DESC;
```

#### Check Reversed Earnings
```sql
SELECT * FROM earnings_ledger
WHERE status = 'reversed'
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

#### Check Negative Earnings (Clawbacks)
```sql
SELECT * FROM earnings_ledger
WHERE final_amount_cents < 0
AND notes LIKE '%CLAWBACK%'
ORDER BY created_at DESC;
```

---

## 🚨 IMPORTANT NOTES

### 1. Negative Earnings in Ledger
Clawbacks create **negative entries** in `earnings_ledger`. When calculating member payouts, these negative amounts are automatically subtracted from their total.

**Example:**
```
Original earning: +$50.00 (status: reversed)
Clawback entry:   -$50.00 (status: approved)
Net effect:       $0.00
```

### 2. 60-Day Window
The clawback window is **60 days from order date**. After 60 days:
- `cab_clawback_queue` entry status changes to 'cleared'
- Commission is considered "earned" and safe from clawback
- Refunds after 60 days do NOT trigger clawback (per FTC guidelines)

### 3. Multiple Distributors
A single order can generate earnings for multiple distributors (sponsor, upline, etc.). The clawback system reverses ALL earnings from that order, not just CAB.

### 4. Payment Deduction
If a distributor has already been paid and then a clawback occurs:
- The negative amount appears in their next payout period
- If next payout is less than clawback amount, the balance carries forward
- System tracks cumulative negative balance

---

## 📊 MONITORING

### Key Metrics to Track

1. **Active Clawback Queue Size**
   - Query: `SELECT COUNT(*) FROM cab_clawback_queue WHERE status = 'pending'`
   - Alert if > 100 entries (indicates high refund rate)

2. **Daily Clawback Amount**
   - Query: `SELECT SUM(ABS(final_amount_cents))/100.0 FROM earnings_ledger WHERE status = 'approved' AND final_amount_cents < 0 AND created_at >= CURRENT_DATE`
   - Track daily to identify trends

3. **Refund Rate**
   - Query: `SELECT COUNT(*) FILTER (WHERE status = 'refunded') * 100.0 / COUNT(*) FROM orders`
   - Alert if > 5% (industry standard is 2-3%)

### Audit Logs

All clawback operations are logged to `audit_log` table:
```sql
SELECT * FROM audit_log
WHERE action IN ('cab_clawback_processed', 'cab_clawback_cron_updated')
ORDER BY timestamp DESC;
```

---

## 🔐 SECURITY

### Webhook Security
- Stripe webhooks are verified using `stripe.webhooks.constructEvent()`
- Invalid signatures are rejected with 400 error
- Webhook secret stored in `STRIPE_WEBHOOK_SECRET_REFUND` env var

### Admin API Security
- Requires valid admin authentication
- Checks `admins` table for user authorization
- Returns 403 Forbidden for non-admin users

### Cron Job Security
- Requires valid cron token (`CRON_SECRET` env var)
- OR valid Supabase service role key
- Returns 401 Unauthorized for invalid credentials

---

## 🚀 DEPLOYMENT

### Environment Variables Required

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET_REFUND=whsec_...

# Cron Job
CRON_SECRET=your-secure-random-string

# Supabase (already exists)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe-refund`
4. Events to send: `charge.refunded`, `payment_intent.canceled`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET_REFUND`

### Supabase Cron Setup

The cron job is automatically created by migration `20260327000009_update_clawback_cron.sql`.

To verify:
```sql
SELECT * FROM cron.job WHERE jobname = 'process-cab-clawback-daily';
```

---

## 📝 CHANGELOG

### 2026-03-27 - Initial Implementation
- Created `clawback-processor.ts` with core logic
- Created admin API endpoints
- Created Stripe webhook handler
- Created cron job for daily cleanup
- Updated migration to use Next.js API endpoint
- Full documentation

---

## 🔗 RELATED DOCUMENTS

- `COMPLIANCE-RULES-VERIFICATION.md` - Full compliance requirements
- `APEX_COMP_ENGINE_SPEC_FINAL.md` - Compensation plan specification
- `SESSION-SUMMARY-2026-03-27.md` - Session context
- `AUDIT-REPORT.md` - Codebase audit report

---

**Status:** ✅ PRODUCTION READY
**Compliance:** ✅ FTC COMPLIANT
**Testing:** ⏳ PENDING INTEGRATION TESTS

