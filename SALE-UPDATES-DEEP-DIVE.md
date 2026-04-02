# 🔍 Deep Dive: What Updates When a Sale Happens

**Complete flow of database updates and rep back office changes**

---

## 📊 Overview

When a customer completes a purchase, the system updates **11 different places** in real-time. Here's the complete breakdown:

---

## 1️⃣ PERSONAL PURCHASE FLOW

### When Rep Buys for Themselves (is_personal_purchase = true)

#### Database Tables Updated:

### **TABLE 1: `orders`** ✅
**New Record Created:**
```sql
INSERT INTO orders (
  distributor_id,           -- The rep making the purchase
  total_cents,              -- Amount paid (e.g., 9900 = $99.00)
  total_bv,                 -- BV amount (e.g., 50 BV)
  is_personal_purchase,     -- TRUE for personal purchase
  stripe_payment_intent_id, -- Stripe payment ID
  payment_method,           -- 'card'
  payment_status,           -- 'paid'
  paid_at,                  -- Current timestamp
  fulfillment_status,       -- 'fulfilled'
  fulfilled_at,             -- Current timestamp
  order_number              -- Auto-generated (e.g., "ORD-20260402-ABC123")
)
```

**Rep Back Office Shows:**
- ✅ New order appears in "My Orders" list
- ✅ Order number displayed
- ✅ Payment status: "Paid"
- ✅ Fulfillment status: "Fulfilled"

---

### **TABLE 2: `order_items`** ✅
**New Record Created:**
```sql
INSERT INTO order_items (
  order_id,            -- Links to order created above
  product_id,          -- The product purchased
  quantity,            -- Always 1 for single purchase
  unit_price_cents,    -- Price per unit
  total_price_cents,   -- Total price (price × quantity)
  bv_amount,           -- BV for this item
  product_name         -- Product name (e.g., "PulseMarket")
)
```

**Rep Back Office Shows:**
- ✅ Order details page shows product name
- ✅ Shows quantity purchased
- ✅ Shows BV earned from this item

---

### **TABLE 3: `subscriptions`** ✅ (If subscription)
**New Record Created (only if is_subscription = true):**
```sql
INSERT INTO subscriptions (
  distributor_id,          -- The rep
  product_id,              -- The product
  quantity,                -- 1
  current_price_cents,     -- Monthly price
  interval,                -- 'monthly'
  stripe_subscription_id,  -- Stripe sub ID
  status,                  -- 'active'
  started_at,              -- Current timestamp
  current_period_start,    -- Today
  current_period_end,      -- 30 days from now
  next_billing_date        -- 30 days from now
)
```

**Rep Back Office Shows:**
- ✅ "Active Subscriptions" section shows new subscription
- ✅ Shows next billing date
- ✅ Shows monthly price
- ✅ Option to cancel subscription

---

### **TABLE 4: `transactions`** ✅
**New Record Created:**
```sql
INSERT INTO transactions (
  distributor_id,            -- The rep
  amount_dollars,            -- Total paid (e.g., 99.00)
  transaction_type,          -- 'product_sale'
  product_slug,              -- Product identifier
  stripe_payment_intent_id,  -- Stripe payment ID
  metadata                   -- JSON with order details
)
```

**Metadata Contains:**
```json
{
  "order_id": "uuid-here",
  "order_number": "ORD-20260402-ABC123",
  "product_name": "PulseMarket",
  "bv_amount": 50,
  "is_subscription": true,
  "customer_email": "rep@example.com",
  "customer_name": "John Doe"
}
```

**Rep Back Office Shows:**
- ✅ Transaction history shows new transaction
- ✅ Shows amount paid
- ✅ Shows product purchased
- ✅ Shows date/time of purchase

---

### **TABLE 5: `members`** ✅ (Personal BV Update)
**Existing Record Updated:**
```sql
UPDATE members
SET personal_credits_monthly = personal_credits_monthly + 50  -- Adds BV
WHERE distributor_id = 'rep-uuid';
```

**⚠️ IMPORTANT:** Anti-frontloading rules apply:
- If rep already bought this product this month → 0 BV credited
- If rep exceeds monthly limit → Partial or 0 BV credited
- System logs reason for any BV reduction

**Rep Back Office Shows:**
- ✅ **"My BV This Month"** counter increases (e.g., 100 → 150)
- ✅ Dashboard shows updated PV (Personal Volume)
- ✅ Rank progress bar updates if approaching next rank

---

### **TABLE 6: `members`** ✅ (Group Volume Propagation)
**Multiple Records Updated (All Upline Members):**
```sql
-- For each upline member in sponsor tree:
UPDATE members
SET team_credits_monthly = team_credits_monthly + 50
WHERE member_id IN (sponsor, sponsor's sponsor, sponsor's sponsor's sponsor, ...)
```

**Example:**
```
Rep A (you) → Buys product (50 BV)
  ↓
Sponsor B → team_credits_monthly: 200 → 250 (+50)
  ↓
Sponsor C → team_credits_monthly: 1000 → 1050 (+50)
  ↓
Sponsor D → team_credits_monthly: 5000 → 5050 (+50)
```

**Sponsor Back Office Shows (For ALL Upline Reps):**
- ✅ **"Team BV This Month"** increases
- ✅ Dashboard shows updated GV (Group Volume)
- ✅ Team performance metrics update
- ✅ Rank qualification progress updates

---

### **TABLE 7: `estimated_earnings`** ✅ (Real-Time Earnings Preview)
**Multiple Records Created:**
```sql
-- For the SELLER (you):
INSERT INTO estimated_earnings (
  member_id,               -- Your member ID
  transaction_id,          -- The transaction
  earning_type,            -- 'seller_commission'
  amount_dollars,          -- Estimated commission (e.g., $25)
  status,                  -- 'pending_qualification'
  qualified,               -- FALSE (until 50 PV minimum met)
  estimated_payment_date   -- End of month
)

-- For L1 SPONSOR (your enroller):
INSERT INTO estimated_earnings (
  member_id,               -- Sponsor's member ID
  transaction_id,          -- The transaction
  earning_type,            -- 'l1_override'
  amount_dollars,          -- Estimated override (e.g., $7.50)
  status,                  -- 'pending_qualification'
  qualified,               -- FALSE (until sponsor has 50 PV)
  estimated_payment_date   -- End of month
)

-- For L2-L5 MATRIX PARENTS:
-- (Similar entries for each qualified upline based on rank)
```

**Rep Back Office Shows:**
- ✅ **"Estimated Earnings This Month"** section appears
- ✅ Shows pending commission amount
- ✅ Shows qualification status (e.g., "Need 50 PV to qualify")
- ✅ Shows breakdown: Seller commission, L1 override, L2-L5 overrides
- ✅ Shows "Estimated payout date: April 30"

**Sponsor Back Office Shows:**
- ✅ **"Estimated Team Earnings"** updates
- ✅ Shows pending override from your sale
- ✅ Shows qualification requirements

---

### **TABLE 8: `fulfillment_cards`** ✅ (For AI Products)
**New Record Created (for products requiring fulfillment):**
```sql
INSERT INTO fulfillment_cards (
  transaction_id,      -- Links to transaction
  distributor_id,      -- The rep
  product_slug,        -- Product identifier
  stage,               -- 'payment_made'
  status,              -- 'active'
  metadata             -- Product-specific data
)
```

**Rep Back Office Shows:**
- ✅ "Onboarding Status" appears
- ✅ Shows Kanban card in "Payment Made" column
- ✅ Shows next steps for product setup
- ✅ Cal.com booking modal appears for scheduling onboarding

---

### **TABLE 9: `admin_activity_log`** ✅
**New Record Created:**
```sql
INSERT INTO admin_activity_log (
  admin_id,             -- The rep's ID
  admin_email,          -- The rep's email
  admin_name,           -- The rep's name
  distributor_id,       -- The rep's ID
  distributor_name,     -- The rep's name
  action_type,          -- 'order_purchase_created' or 'order_subscription_created'
  action_description,   -- "Purchased PulseMarket for $99.00 (50 BV)"
  changes               -- JSON with full order details
)
```

**Admin Back Office Shows:**
- ✅ Activity log shows new purchase
- ✅ Shows who purchased what
- ✅ Shows amount and BV
- ✅ Timestamp of purchase

---

### **TABLE 10: Email Sent** ✅
**Order Receipt Email Sent via Resend:**
- **To:** Rep's email
- **Subject:** "Order Confirmation - PulseMarket"
- **Contains:**
  - Order number
  - Product purchased
  - Amount paid
  - BV earned
  - Order date
  - Subscription details (if applicable)

---

## 2️⃣ RETAIL SALE FLOW

### When Rep Sells to a Customer (is_personal_purchase = false)

**EVERYTHING above PLUS:**

### **TABLE 11: `customers`** ✅
**New Record Created:**
```sql
INSERT INTO customers (
  email,                      -- Customer's email
  full_name,                  -- Customer's name
  referred_by_distributor_id  -- The rep who made the sale
)
```

**Rep Back Office Shows:**
- ✅ **"My Customers"** list shows new customer
- ✅ Shows customer name and email
- ✅ Shows products they purchased
- ✅ Shows customer lifetime value

---

### **Key Differences for Retail Sales:**

#### 1. Order Record:
```sql
is_personal_purchase = FALSE  -- Not a personal purchase
customer_id = <customer_uuid> -- Links to customer
referred_by_distributor_id = <rep_uuid> -- Credit to rep
```

#### 2. BV Credited to SELLER, not buyer:
```sql
-- Rep who made the sale gets the BV:
UPDATE members
SET personal_credits_monthly = personal_credits_monthly + 50
WHERE distributor_id = <seller_rep_uuid>  -- The REP, not the customer
```

#### 3. Metadata Marked as Retail:
```json
{
  "is_retail": true,
  "customer_email": "customer@example.com",
  "customer_name": "Jane Smith"
}
```

---

## 📊 REP BACK OFFICE DASHBOARD UPDATES

### Real-Time Updates (Immediate):

**1. BV Counters:**
- ✅ **Personal BV This Month:** Shows updated total
- ✅ **Team BV This Month:** Shows updated team volume
- ✅ Progress bars update toward next rank

**2. Earnings Preview:**
- ✅ **Estimated Earnings This Month:** Shows pending commissions
- ✅ **Qualification Status:** Shows if rep meets 50 PV minimum
- ✅ **Retail Compliance:** Shows % of retail sales

**3. Activity Feed:**
- ✅ **"New sale!"** notification appears
- ✅ Shows product and amount
- ✅ Shows BV credited

**4. Orders Section:**
- ✅ **My Orders:** New order appears
- ✅ Shows order status: "Paid & Fulfilled"
- ✅ Click to view order details

**5. Customers Section (Retail Sales):**
- ✅ **My Customers:** New customer appears
- ✅ Shows customer contact info
- ✅ Shows purchase history

**6. Team Section (For Sponsors):**
- ✅ **Team Activity:** Shows downline made a sale
- ✅ **Team Volume:** Updates with new BV
- ✅ **Estimated Team Earnings:** Shows pending overrides

**7. Onboarding/Fulfillment (AI Products):**
- ✅ **Onboarding Status:** Shows Kanban card
- ✅ **Schedule Session:** Cal.com modal appears
- ✅ **Next Steps:** Shows what to do next

---

## ⏰ Monthly Commission Run Updates

**These happen at MONTH-END (automated job):**

### **TABLE 12: `earnings_ledger`** (Created during monthly run)
```sql
-- After month-end qualification checks:
INSERT INTO earnings_ledger (
  member_id,
  earning_type,      -- 'seller_commission', 'l1_override', etc.
  amount_dollars,    -- ACTUAL commission (not estimate)
  status,            -- 'approved' or 'denied'
  qualified,         -- TRUE/FALSE based on 50 PV + 70% retail
  payment_batch_id,  -- Links to payment batch
  payout_date        -- When commission will be paid
)
```

**Rep Back Office Shows:**
- ✅ **"Commission Statement"** generated
- ✅ Shows approved commissions
- ✅ Shows denied commissions with reason
- ✅ Shows payout date
- ✅ **Estimated Earnings** section updates to show "Approved"

---

## 🔄 Real-Time vs. Monthly Updates

### Real-Time (Webhook - Immediate):
1. ✅ Order created
2. ✅ Transaction logged
3. ✅ BV credited to member
4. ✅ GV propagated up sponsor tree
5. ✅ Estimated earnings created
6. ✅ Fulfillment card created
7. ✅ Activity logged
8. ✅ Email sent
9. ✅ **Dashboard updates immediately**

### Monthly (Commission Run - End of Month):
1. ⏸️ Check qualifications (50 PV minimum, 70% retail)
2. ⏸️ Calculate waterfall splits
3. ⏸️ Calculate overrides L1-L5
4. ⏸️ Apply compression
5. ⏸️ Create earnings_ledger entries
6. ⏸️ Generate payment batch
7. ⏸️ **Commission statement created**
8. ⏸️ **Actual payout processed**

---

## 📋 Summary: 11 Places Updated on Each Sale

| # | Table/Action | What Updates | Rep Sees |
|---|--------------|--------------|----------|
| 1 | `orders` | New order record | "My Orders" list |
| 2 | `order_items` | Order line items | Order details |
| 3 | `subscriptions` | Subscription created | "Active Subscriptions" |
| 4 | `transactions` | Transaction logged | Transaction history |
| 5 | `members` (seller) | Personal BV +50 | "My BV" counter |
| 6 | `members` (upline) | Team BV +50 | "Team BV" counters |
| 7 | `estimated_earnings` | Pending commissions | "Estimated Earnings" |
| 8 | `fulfillment_cards` | Onboarding tracking | Kanban board |
| 9 | `admin_activity_log` | Activity recorded | Activity feed |
| 10 | Email | Receipt sent | Inbox |
| 11 | `customers` (retail) | Customer record | "My Customers" |

---

## 🎯 Example: Complete Flow

**Scenario:** Rep sells PulseMarket ($99) to customer

```
1. Customer pays $99 → Stripe
2. Stripe webhook fires → /api/webhooks/stripe
3. System creates:
   ✅ Order (order #ORD-2026...)
   ✅ Order item (PulseMarket, $99, 50 BV)
   ✅ Subscription (if monthly)
   ✅ Transaction (logged)
   ✅ Customer record (Jane Smith)

4. System updates BV:
   ✅ Rep: personal_bv_monthly: 100 → 150
   ✅ Sponsor: team_bv_monthly: 500 → 550
   ✅ Sponsor's Sponsor: team_bv_monthly: 2000 → 2050

5. System creates estimates:
   ✅ Rep: Seller commission ~$25 (pending 50 PV)
   ✅ Sponsor: L1 override ~$7.50 (pending 50 PV)
   ✅ Matrix parents: L2-L5 overrides (if qualified)

6. Rep dashboard shows:
   ✅ "My BV: 150 (was 100)"
   ✅ "Estimated Earnings: $25.00 (pending)"
   ✅ "Qualification: Need 50 PV (have 150 ✅)"
   ✅ "New sale! PulseMarket - $99.00"
   ✅ "My Customers: +1 (Jane Smith)"

7. Email sent to rep:
   ✅ "Order Confirmation - PulseMarket"
   ✅ Order #ORD-2026...
   ✅ $99.00 paid
   ✅ 50 BV earned
```

---

**Status:** ✅ All updates happen in REAL-TIME via Stripe webhook
**Commission Payout:** ⏸️ Processed at month-end via automated job
