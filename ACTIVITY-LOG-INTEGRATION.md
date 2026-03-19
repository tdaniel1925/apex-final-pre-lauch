# Activity Log Integration - Orders Now Tracked ✅

**Date:** 2026-03-15
**Status:** Complete
**Feature:** All product purchases are now logged in the admin activity log

---

## ✅ Orders Are Now Logged!

Every product purchase is automatically logged to the `admin_activity_log` table, creating an immutable audit trail visible to admins.

---

## 📊 What Gets Logged

### When a Purchase Completes

**Action Type:**
- `order_purchase_created` - One-time purchase
- `order_subscription_created` - Subscription purchase

**Action Description:**
```
Purchased PulseGuard for $59.00 (59 BV)
Purchased PulseGuard for $59.00 (59 BV) - Subscription
```

**Logged Data:**
```json
{
  "order_id": "uuid",
  "order_number": "APEX-000123",
  "product_id": "uuid",
  "product_name": "PulseGuard",
  "amount_paid": 59.00,
  "bv_earned": 59,
  "payment_method": "stripe",
  "is_subscription": true
}
```

**Who:**
- `admin_id` = Distributor ID (who made the purchase)
- `admin_email` = Distributor email
- `admin_name` = Distributor full name
- `distributor_id` = Same as admin_id (tracking their own purchase)
- `distributor_name` = Same as admin_name

---

## 🔄 Activity Log Flow

```
Stripe Payment Completes
  ↓
Webhook: checkout.session.completed
  ↓
1. Create order in orders table
2. Create order_item
3. Create subscription (if applicable)
  ↓
4. Log to admin_activity_log via RPC
   - Action: order_purchase_created
   - Description: "Purchased [Product] for $X (X BV)"
   - Changes: Full order details JSON
  ↓
5. Send email receipt
  ↓
Activity appears in admin dashboards
```

---

## 📍 Where Activity Appears

### 1. Admin Dashboard - Recent Activity Feed
**Location:** `/admin` (homepage)

**Query:**
```sql
SELECT * FROM admin_recent_activity
ORDER BY created_at DESC
LIMIT 50;
```

**Display:**
```
🛒 John Smith purchased PulseGuard for $59.00 (59 BV)
   2 minutes ago

🔄 Sarah Johnson purchased PulseGuard for $59.00 (59 BV) - Subscription
   5 minutes ago
```

### 2. Distributor Detail Page - Activity Tab
**Location:** `/admin/distributors/[id]` → Activity tab

**Query:**
```sql
SELECT * FROM admin_activity_log
WHERE distributor_id = '[id]'
ORDER BY created_at DESC;
```

**Display:**
```
Order Created - 2 minutes ago
Purchased PulseGuard for $59.00 (59 BV)
Order #APEX-000123
```

### 3. Admin Activity Report
**Location:** Future admin reports page

**Query:**
```sql
SELECT * FROM admin_activity_log
WHERE action_type IN ('order_purchase_created', 'order_subscription_created')
AND created_at >= '[date_range]'
ORDER BY created_at DESC;
```

---

## 🎯 Activity Log Schema

### Table: `admin_activity_log`

```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY,

  -- Who did it
  admin_id UUID,
  admin_email TEXT,
  admin_name TEXT,

  -- Who it affects
  distributor_id UUID,
  distributor_name TEXT,

  -- What happened
  action_type TEXT,          -- 'order_purchase_created'
  action_description TEXT,   -- 'Purchased PulseGuard for $59.00 (59 BV)'
  changes JSONB,             -- Full order details

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- When
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_activity_log_distributor` - Fast lookup by distributor
- `idx_activity_log_action` - Filter by action type
- `idx_activity_log_created` - Sort by date
- `idx_activity_log_changes` - Search JSON data (GIN index)

---

## 🔍 Querying Activity Logs

### Get All Orders for a Distributor
```typescript
const { data } = await supabase
  .from('admin_activity_log')
  .select('*')
  .eq('distributor_id', distributorId)
  .in('action_type', ['order_purchase_created', 'order_subscription_created'])
  .order('created_at', { ascending: false });
```

### Get Recent Sales Across All Reps
```typescript
const { data } = await supabase
  .from('admin_activity_log')
  .select('*')
  .in('action_type', ['order_purchase_created', 'order_subscription_created'])
  .gte('created_at', thirtyDaysAgo)
  .order('created_at', { ascending: false });
```

### Calculate Total BV from Activity Log
```typescript
const { data } = await supabase
  .from('admin_activity_log')
  .select('changes')
  .in('action_type', ['order_purchase_created', 'order_subscription_created'])
  .gte('created_at', monthStart);

const totalBV = data.reduce((sum, activity) => {
  return sum + (activity.changes?.bv_earned || 0);
}, 0);
```

---

## 📊 New Action Types Added

| Action Type | When It Fires | Description Format |
|-------------|---------------|-------------------|
| `order_purchase_created` | One-time product purchase | "Purchased [Product] for $X (X BV)" |
| `order_subscription_created` | Subscription started | "Purchased [Product] for $X (X BV) - Subscription" |
| `order_refunded` | Order refunded (future) | "Refunded order #APEX-XXXXX ($X)" |
| `subscription_updated` | Subscription modified (future) | "Updated subscription for [Product]" |
| `subscription_canceled` | Subscription canceled (future) | "Canceled subscription for [Product]" |

---

## 🎨 Activity Feed Display Examples

### Purchase Activity
```
┌─────────────────────────────────────────────┐
│ 🛒 Order Created                            │
│ John Smith                                  │
│ 2 minutes ago                               │
│                                             │
│ Purchased PulseGuard for $59.00 (59 BV)    │
│ Order #APEX-000123                          │
│                                             │
│ [View Order] [View Rep Profile]            │
└─────────────────────────────────────────────┘
```

### Subscription Activity
```
┌─────────────────────────────────────────────┐
│ 🔄 Subscription Started                     │
│ Sarah Johnson                               │
│ 5 minutes ago                               │
│                                             │
│ Purchased PulseGuard for $59.00 (59 BV)    │
│ Recurring: Monthly                          │
│ Order #APEX-000124                          │
│                                             │
│ [View Subscription] [View Rep Profile]     │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security & RLS

### Row-Level Security
```sql
-- Admins can view all activity
CREATE POLICY activity_log_select_policy ON admin_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM distributors
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only system can insert (via service role)
CREATE POLICY activity_log_insert_policy ON admin_activity_log
  FOR INSERT
  WITH CHECK (false); -- Only service role can insert
```

### Why Service Role?
The webhook uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and insert activity logs. This ensures:
- Immutable audit trail
- Users can't modify their own activity
- Only system processes can log activity

---

## 📈 Benefits

### 1. Complete Audit Trail
Every purchase is permanently logged with:
- Who made it
- What they bought
- How much they paid
- How much BV they earned
- When it happened

### 2. Sales Analytics
Query activity log to calculate:
- Total sales by distributor
- Total BV earned in time period
- Most popular products
- Subscription vs one-time purchases

### 3. Compliance
Immutable record for:
- Financial audits
- Dispute resolution
- Performance tracking
- Commission verification

### 4. Admin Visibility
Admins can see at a glance:
- Recent sales activity
- Who's actively purchasing
- Subscription trends
- Revenue by product

---

## 🎯 Future Enhancements

### Planned Activity Types
- ✅ `order_purchase_created`
- ✅ `order_subscription_created`
- ⏸️ `order_refunded`
- ⏸️ `order_shipped`
- ⏸️ `subscription_updated`
- ⏸️ `subscription_canceled`
- ⏸️ `subscription_paused`
- ⏸️ `subscription_resumed`

### Real-Time Notifications
```typescript
// Subscribe to new order activity
supabase
  .channel('order-activity')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'admin_activity_log',
    filter: 'action_type=in.(order_purchase_created,order_subscription_created)'
  }, (payload) => {
    // Show toast notification to admins
    showNotification(`New sale: ${payload.new.action_description}`);
  })
  .subscribe();
```

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `src/app/api/webhooks/stripe/route.ts` | Added activity logging after order creation |
| `src/lib/admin/activity-logger.ts` | Added new order action types to enum |

---

## ✅ Result

**Every product purchase is now tracked in the activity log!**

Admins can:
- ✅ See all recent sales in real-time
- ✅ View purchase history for any distributor
- ✅ Track BV earnings from purchases
- ✅ Verify order details and payment amounts
- ✅ Distinguish between one-time and subscription purchases
- ✅ Generate sales reports from activity data

**The activity log provides complete visibility into all product sales!**
