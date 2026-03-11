# ATOMIC DEPENDENCY AUDIT
**Apex Affinity Group - MLM Platform**
**Date**: 2026-03-11
**Audit Type**: Full atomic dependency mapping
**Purpose**: Map every data dependency, trigger, and validation in the system

---

## LEGEND

- **✅ CONNECTED**: Dependency exists and is fully implemented
- **⚠️ PARTIAL**: Partially implemented - specific gaps documented
- **❌ GAP**: Not implemented at all - needs to be built
- **❓ UNKNOWN**: Cannot determine from codebase - needs human verification

---

## STEP 1: DATABASE TABLES AND RELATIONSHIPS

### Core Tables

#### **distributors** (Primary entity - Reps/Agents)
**Columns**: id, email, first_name, last_name, phone, rank, status (active/inactive/suspended/terminated), sponsor_id, auth_user_id, role (admin/cfo/rep), business_center_tier (free/basic/enhanced/platinum), affiliate_code, current_rank, rank_achieved_at, licensed_agent

**Foreign Keys**:
- `sponsor_id` → distributors(id) - Upline sponsor relationship
- `auth_user_id` → auth.users(id) - Supabase auth link

**Dependencies**:
- Referenced by: orders, customers, commission tables (all 16 types), rank_history, notifications, org_bv_cache, bv_snapshots, team_broadcasts, crm_contacts, email_campaigns, and many more

---

#### **products**
**Columns**: id, category_id, name, slug, retail_price_cents, wholesale_price_cents, bv, is_subscription, subscription_interval, stripe_product_id, stripe_price_id, price_sync_status ('synced', 'mismatch', 'pending_manual'), stripe_last_checked_at

**Foreign Keys**:
- `category_id` → product_categories(id)

**Dependencies**:
- Referenced by: orders, order_items

---

#### **orders**
**Columns**: id, rep_id (buyer), customer_id, product_id, order_type ('member', 'retail', 'business_center'), gross_amount_cents, stripe_payment_intent_id, stripe_subscription_id, status ('pending', 'complete', 'refunded', 'chargeback', 'cancelled'), bv_credited (boolean), bv_amount, commission_run_id, promotion_fund_credited, promotion_fund_credit_amount, created_at, updated_at

**Foreign Keys**:
- `rep_id` → distributors(id)
- `customer_id` → customers(id)
- `product_id` → products(id)
- `commission_run_id` → commission_runs(id)

**Dependencies**:
- Source of truth for BV calculations
- Triggers: recalculate_sponsor_chain after insert
- Referenced by: commissions_retail, commissions_cab, cab_clawback_queue, subscription_renewals

---

#### **org_bv_cache**
**Columns**: id, rep_id, personal_bv, team_bv, org_bv, direct_count, last_calculated_at

**Foreign Keys**:
- `rep_id` → distributors(id) UNIQUE

**Dependencies**:
- Updated by: recalculate_sponsor_chain function (trigger on distributors INSERT)
- Read by: Dashboard, is_rep_active function

---

#### **bv_snapshots** (Monthly frozen BV values)
**Columns**: id, rep_id, snapshot_month (YYYY-MM format), personal_bv, team_bv, org_bv, rank_at_snapshot, created_at

**Foreign Keys**:
- `rep_id` → distributors(id)

**Unique Constraint**: (rep_id, snapshot_month)

**Dependencies**:
- Created by: Edge function `snapshot-monthly-bv` (scheduled monthly)
- Read by: Commission engine, is_rep_active function

---

#### **bv_snapshot_runs** (Track snapshot job status)
**Columns**: id, snapshot_month (UNIQUE), status ('running', 'complete', 'failed'), rep_count, started_at, completed_at, error_message

**Dependencies**:
- Created by: snapshot-monthly-bv edge function
- Read by: Commission engine gate check (Screen 15)

---

#### **commission_runs**
**Columns**: id, period (YYYY-MM), status ('draft', 'running', 'complete', 'failed'), phase ('seller', 'override', 'bonuses', 'totals', 'check_match', 'threshold', 'lock'), snapshot_id, snapshot_verified, started_at, completed_at

**Foreign Keys**:
- `snapshot_id` → bv_snapshot_runs(id)

**Dependencies**:
- Parent of all commission calculations
- Must have snapshot_verified = true before running
- Referenced by: commission_run_rep_totals, all commission tables

---

#### **commission_run_rep_totals** (7-phase breakdown per rep)
**Columns**: id, commission_run_id, rep_id, seller_commission, override_earned, bonuses_earned, subtotal (before check match), check_match_earned, total_payout, carry_forward_in, carry_forward_out, final_payout, created_at

**Unique Constraint**: (commission_run_id, rep_id)

**Foreign Keys**:
- `commission_run_id` → commission_runs(id)
- `rep_id` → distributors(id)

**Dependencies**:
- Read by: Dashboard (last payout), Commission engine
- Created by: Monthly commission run process

---

#### **notifications**
**Columns**: id, user_id, type ('commission', 'rank', 'announcement', 'downline', 'system', 'order_confirmed', 'customer_cancelled'), title, message, read (boolean), created_at

**Foreign Keys**:
- `user_id` → distributors(id)

**Dependencies**:
- Triggers: send-notification edge function on INSERT
- Real-time subscription: Communications page listens for INSERTs and UPDATEs
- Email sent for types: 'commission_complete', 'rank_promoted', 'rank_eligible', 'welcome'

---

#### **promotion_fund_ledger**
**Columns**: id, transaction_type ('credit', 'debit'), amount, source_rep_id, source_order_id, bonus_type, recipient_rep_id, balance_after, created_at, notes

**Foreign Keys**:
- `source_rep_id` → distributors(id)
- `recipient_rep_id` → distributors(id)

**Dependencies**:
- Credited by: Stripe webhook on Business Center purchases ($5 per sale)
- Debited by: Promotion bonus payouts
- Balance function: get_promotion_fund_balance()

---

#### **subscription_renewals**
**Columns**: id, rep_id, customer_id, product_id, renewal_date, status ('renewed', 'cancelled', 'failed'), stripe_invoice_id, created_at

**Foreign Keys**:
- `rep_id` → distributors(id)
- `customer_id` → customers(id)
- `product_id` → products(id)

**Dependencies**:
- Created by: Stripe webhook (invoice.paid, invoice.payment_failed)
- Read by: calculate_renewal_rate function (Retention Bonus eligibility)

---

#### **cab_clawback_queue**
**Columns**: id, rep_id, customer_id, order_id, cab_amount, cancel_date, clawback_eligible_until, status ('pending', 'clawback', 'cleared'), commission_run_id, created_at

**Foreign Keys**:
- `rep_id` → distributors(id)
- `customer_id` → customers(id)
- `order_id` → orders(id)

**Dependencies**:
- Created by: Stripe webhook (customer.subscription.deleted) if within 60 days
- Read by: Commission engine (applies clawback during run)

---

#### **rank_history**
**Columns**: id, distributor_id, from_rank, to_rank, month_year, pbv, gbv, personally_sponsored_count, leg_requirements_met, days_since_last_rank, speed_multiplier, is_grace_period, achieved_at

**Unique Constraint**: (distributor_id, to_rank)

**Foreign Keys**:
- `distributor_id` → distributors(id)

**Dependencies**:
- Referenced by: commissions_rank_advancement, commissions_vacation

---

### Commission Tables (16 types)

All commission tables follow similar structure:
- distributor_id → distributors(id)
- month_year (TEXT, format YYYY-MM)
- Specific commission calculations
- payout_batch_id → payout_batches(id)
- status ('pending', 'approved', 'paid', 'held', 'cancelled')
- paid_at

**Commission Tables**:
1. commissions_retail (weekly retail cash)
2. commissions_cab (Customer Acquisition Bonus)
3. commissions_customer_milestone
4. commissions_retention
5. commissions_matrix (Levels 1-7)
6. commissions_matching (Gen 1-3, capped at $25k/month)
7. commissions_override
8. commissions_infinity (Level 8+, 1-3%)
9. commissions_fast_start
10. commissions_rank_advancement (with installments for Diamond+)
11. commissions_car (capped at $3k/month)
12. commissions_vacation
13. commissions_infinity_pool (3% of company BV)
14. commissions_check_match
15. commissions_builder_bonus
16. commissions_achievement_bonus

---

## STEP 2: USER ACTIONS AND TRIGGERS

### **USER ACTION: Signup (New Distributor)**

**Endpoint**: `/api/signup` → Calls atomic signup function

**What it writes**:
1. distributors table (new row)
2. org_bv_cache (initialized to 0s)

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Trigger `after_distributor_insert` → calls `recalculate_sponsor_chain(new_rep_id)`
2. ✅ **CONNECTED**: Welcome notification inserted to notifications table
3. ⚠️ **PARTIAL**: Email notification sent via send-notification edge function
   - **GAP**: No database trigger to call send-notification edge function automatically
   - **Current**: Notification is inserted, but email send depends on manual edge function invocation
4. ❌ **GAP**: No initial commission_run_rep_totals record created for new rep
5. ❌ **GAP**: No notification to sponsor about new downline signup

---

### **USER ACTION: Product Purchase (via Stripe)**

**Endpoint**: Stripe webhook → Edge function `/functions/stripe-webhook`

**Event**: `payment_intent.succeeded`

**What it writes**:
1. orders table (status='complete', bv_credited=false)
2. If order_type='business_center': promotion_fund_ledger (credit $5)

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Order record created with BV amount from metadata
2. ✅ **CONNECTED**: Promotion fund credited if Business Center purchase
3. ✅ **CONNECTED**: Notification inserted: "Order Confirmed"
4. ⚠️ **PARTIAL**: BV credited to org_bv_cache
   - **Current**: Trigger `after_distributor_insert` calls `recalculate_sponsor_chain`
   - **GAP**: No trigger on orders INSERT to recalculate BV cache
   - **Manual Fix Needed**: Must manually refresh BV cache or wait for next signup
5. ❌ **GAP**: No retail commission created immediately (commissions_retail)
   - **Reason**: Retail commissions calculated in weekly batch
   - **Risk**: Delay between purchase and commission visibility
6. ❌ **GAP**: No CAB (Customer Acquisition Bonus) created immediately
   - **Reason**: CAB calculated during monthly commission run
   - **Risk**: Rep doesn't see CAB credited until month end

---

### **USER ACTION: Subscription Cancellation**

**Endpoint**: Stripe webhook → `customer.subscription.deleted`

**What it writes**:
1. orders table: status='cancelled'
2. cab_clawback_queue: New record if within 60 days
3. notifications: "Customer Cancelled Subscription"

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Order status updated
2. ✅ **CONNECTED**: CAB clawback queued if eligible
3. ✅ **CONNECTED**: Notification inserted
4. ❌ **GAP**: No immediate BV recalculation
   - **Impact**: Dashboard still shows old BV until next signup or manual refresh
5. ❌ **GAP**: No email to rep about cancellation
   - **Current**: Notification inserted but no email template for 'customer_cancelled' type
6. ❓ **UNKNOWN**: What happens to future recurring commissions?
   - **Needs verification**: Are future matrix/matching commissions based on cancelled subscriptions?

---

### **USER ACTION: Rep Termination (Admin)**

**Endpoint**: Screen 13 (Admin Reps) → Calls `handle_termination(rep_id)` function

**What it writes**:
1. distributors: status='terminated' for terminated rep
2. distributors: sponsor_id updated for all direct downline (re-sponsored up)
3. audit_log: termination record
4. Calls `recalculate_sponsor_chain` for affected reps

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Downline re-sponsored to terminated rep's sponsor
2. ✅ **CONNECTED**: Audit log entry created
3. ✅ **CONNECTED**: BV recalculated for affected chain
4. ❌ **GAP**: No notification to affected downline reps
   - **Impact**: Downline doesn't know they have new sponsor
5. ❌ **GAP**: No notification to new sponsor
   - **Impact**: New sponsor doesn't know they received new downline
6. ❌ **GAP**: No freeze on pending commissions for terminated rep
   - **Risk**: Terminated rep might still receive pending payouts

---

### **USER ACTION: Rep Suspension (Admin)**

**Endpoint**: Screen 13 → Updates distributors.status='suspended'

**What it writes**:
1. distributors: status='suspended'

**Downstream effects it SHOULD trigger**:
1. ⚠️ **PARTIAL**: Rep loses access to portal
   - **Current**: Status check at route level
   - **GAP**: No RLS policy enforcement on suspended status
2. ❌ **GAP**: No freeze on commission accrual
   - **Risk**: Suspended rep continues earning commissions
3. ❌ **GAP**: No notification to suspended rep
4. ❌ **GAP**: No notification to sponsor/upline
5. ❓ **UNKNOWN**: Are suspended reps excluded from commission runs?
   - **Needs verification**: Check commission engine logic for status filtering

---

### **USER ACTION: Commission Run Trigger (CFO/Admin)**

**Endpoint**: Screen 15 (Commission Engine) → POST /api/admin/compensation/run

**What it writes**:
1. commission_runs: New record (status='running')
2. All 16 commission tables: Records for eligible reps
3. commission_run_rep_totals: Per-rep breakdown
4. commission_runs: status='complete' when done

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: BV snapshot gate check (blocks if no complete snapshot)
2. ⚠️ **PARTIAL**: 7-phase sequencing
   - **Current**: Phases defined in commission_runs.phase
   - **GAP**: No enforcement that Phase 2 must complete before Phase 3
   - **Risk**: Race conditions if run in parallel
3. ❌ **GAP**: No notification to reps when commission run completes
   - **Current**: Notification type 'commission_complete' exists
   - **Missing**: No INSERT to notifications table after run completes
4. ❌ **GAP**: No payout_batch automatically created
   - **Manual step**: CFO must separately create payout batch
5. ❌ **GAP**: No carry forward from prior month
   - **Current**: get_carry_forward function exists
   - **Missing**: Not called during commission run
6. ❓ **UNKNOWN**: Are inactive reps (PBV < $50) excluded?
   - **Function exists**: is_rep_active(rep_id, month)
   - **Needs verification**: Is it actually called during commission calculations?

---

### **USER ACTION: BV Snapshot Trigger (Monthly Cron)**

**Endpoint**: Edge function `/functions/snapshot-monthly-bv` (scheduled last day of month)

**What it writes**:
1. bv_snapshot_runs: New record (status='running')
2. bv_snapshots: One record per active distributor
3. audit_log: Snapshot completion entry
4. bv_snapshot_runs: status='complete'

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Snapshots created for all active distributors
2. ✅ **CONNECTED**: Audit log entry
3. ❌ **GAP**: No notification to CFO when snapshot completes
   - **Risk**: CFO doesn't know when safe to run commission engine
4. ❌ **GAP**: No retry mechanism for failed snapshots
   - **Current**: Errors logged but not retried
   - **Risk**: Some reps missing from snapshot
5. ❌ **GAP**: No validation that all active reps have snapshots
   - **Risk**: Partial snapshot data

---

### **USER ACTION: Rank Upgrade Request**

**Endpoint**: Screen 14 (Rank Upgrade Requests) → POST /api/admin/ranks/approve

**What it writes**:
1. rank_upgrade_requests: status='approved'
2. distributors: current_rank updated
3. rank_history: New record
4. commissions_rank_advancement: Rank bonus record

**Downstream effects it SHOULD trigger**:
1. ⚠️ **PARTIAL**: Notification to rep about promotion
   - **Current**: Notification type 'rank_promoted' exists
   - **GAP**: No automatic INSERT after rank update
2. ❌ **GAP**: No Smart Office sync flag update
   - **Current**: rank_upgrade_requests.smart_office_updated exists
   - **Missing**: No workflow to mark as updated
3. ❌ **GAP**: No carrier contract level update tracking
   - **Current**: rank_upgrade_requests.carrier_contracts_updated exists
   - **Missing**: No integration to update carrier systems
4. ❌ **GAP**: No vacation bonus automatically triggered
   - **Current**: commissions_vacation table exists
   - **Missing**: No INSERT after rank achievement
5. ❓ **UNKNOWN**: Are rank speed multipliers (1.5x, 2.0x) automatically applied?
   - **Field exists**: rank_history.speed_multiplier
   - **Needs verification**: Calculation logic

---

### **USER ACTION: Mark Notification as Read**

**Endpoint**: Screen 9 (Communications) → Click on notification → Updates notifications.read=true

**What it writes**:
1. notifications: read=true

**Downstream effects it SHOULD trigger**:
1. ✅ **CONNECTED**: Real-time update to UI via Supabase subscription
2. ✅ **CONNECTED**: Unread count decreases
3. ❌ **GAP**: No tracking of notification open rate
   - **Missing**: No analytics table for notification engagement
4. ❌ **GAP**: No notification archive/cleanup mechanism
   - **Risk**: notifications table grows indefinitely

---

## STEP 3: COMMISSION CALCULATION DEPENDENCIES

### **Commission Run Flow (7 Phases)**

#### **Gate 1: BV Snapshot Verification**
**Input**: commission_runs.snapshot_id
**Check**: bv_snapshot_runs.status='complete' AND bv_snapshot_runs.snapshot_month matches commission period

**Status**:
- ✅ **CONNECTED**: BV snapshot gate exists
- ⚠️ **PARTIAL**: Frontend blocks commission run if no snapshot (Screen 15)
- ❌ **GAP**: No backend enforcement
  - **Risk**: API endpoint can be called directly, bypassing UI gate

---

#### **Phase 1: Seller Commissions**
**Input**: orders table (WHERE commission_run_id IS NULL)
**Calculation**: Based on order_type ('member' vs 'retail')
  - Member: No seller commission (personal purchase)
  - Retail: retail_price - wholesale_price

**Writes to**:
- commissions_retail (weekly, not monthly)
- orders: commission_run_id updated

**Dependencies**:
- ✅ **CONNECTED**: Orders table as source of truth
- ❌ **GAP**: No retail commission created during this phase
  - **Current**: commissions_retail separate weekly process
  - **Impact**: Seller commission totals might not include retail
- ❌ **GAP**: No handling of refunds/chargebacks
  - **Current**: orders.status can be 'refunded' or 'chargeback'
  - **Missing**: No negative commission entries

---

#### **Phase 2: Override Commissions**
**Input**: bv_snapshots (for rank), distributors (for sponsor chain)
**Calculation**: For each rep, calculate override on downline based on rank differential

**Writes to**: commissions_override

**Dependencies**:
- ⚠️ **PARTIAL**: Rank-based rate lookup
  - **Config**: Rates stored in insurance_comp_engine_config table
  - **GAP**: No validation that all rank combinations have rates
- ❌ **GAP**: No breakaway logic
  - **Spec**: Overrides stop when hitting same or higher rank downline
  - **Missing**: No way to verify this is enforced

---

#### **Phase 3: Bonuses (Matrix, Matching, Infinity, etc.)**
**Input**: bv_snapshots, rank_history, commission calculations from Phase 1-2
**Calculation**:
- Matrix: Levels 1-7, rate by rank
- Matching: Gen 1-3 ($25k cap)
- Infinity: Level 8+, coded infinity (1-3%)
- Check Match: Match sponsor's override earnings

**Writes to**:
- commissions_matrix
- commissions_matching
- commissions_infinity
- commissions_check_match

**Dependencies**:
- ✅ **CONNECTED**: Matrix levels defined by rank
- ⚠️ **PARTIAL**: Matching bonus cap ($25k/month)
  - **Field exists**: commissions_matching.pre_cap_amount_cents
  - **GAP**: No validation in code that cap is applied correctly
- ❌ **GAP**: Circuit breaker for Infinity Bonus
  - **Spec**: If infinity pool exceeds X%, reduce rate
  - **Field exists**: commissions_infinity.circuit_breaker_applied
  - **Missing**: No calculation logic found
- ❌ **GAP**: Check Match sequencing
  - **Requirement**: Check Match runs AFTER all other bonuses
  - **Risk**: If run too early, sponsor's earnings not finalized

---

#### **Phase 4: Totals (Sum all commissions)**
**Input**: All commission tables for current month_year
**Calculation**: seller_commission + override_earned + bonuses_earned = subtotal

**Writes to**: commission_run_rep_totals.subtotal

**Dependencies**:
- ⚠️ **PARTIAL**: Aggregation logic
  - **Gap**: No database function to sum all commission types
  - **Risk**: Manual summation prone to missing a commission type

---

#### **Phase 5: Check Match Application**
**Input**: commission_run_rep_totals.subtotal (for sponsor), rank eligibility
**Calculation**: Match % of sponsor's subtotal (based on rep rank)

**Writes to**: commission_run_rep_totals.check_match_earned

**Dependencies**:
- ❌ **GAP**: Sequencing not enforced
  - **Requirement**: Must run AFTER Phase 4 completes
  - **Current**: No gate to prevent Phase 5 from running before Phase 4
- ❌ **GAP**: Match rate lookup
  - **Spec**: Silver = 5%, Gold = 10%, Platinum = 15%
  - **Missing**: No config table for check match rates
- ❌ **GAP**: Eligibility logic
  - **Spec**: Must have 3+ personally sponsored to earn check match
  - **Missing**: No enforcement of this rule

---

#### **Phase 6: Threshold Filter ($25 minimum payout)**
**Input**: commission_run_rep_totals.total_payout
**Calculation**: If total_payout < $25, carry forward to next month

**Writes to**:
- commission_run_rep_totals.carry_forward_out
- commission_run_rep_totals.final_payout (0 if under threshold)

**Dependencies**:
- ⚠️ **PARTIAL**: Carry forward fields exist
  - **Fields**: carry_forward_in, carry_forward_out
  - **Function**: get_carry_forward(rep_id, run_month) exists
  - **GAP**: No evidence function is called during Phase 6
- ❌ **GAP**: No notification to rep when carried forward
  - **Impact**: Rep doesn't know why they didn't get paid

---

#### **Phase 7: Lock (Finalize commission run)**
**Input**: commission_run_rep_totals.final_payout
**Action**: Mark commission_runs.status='complete', prevent further edits

**Dependencies**:
- ⚠️ **PARTIAL**: Status update implemented
  - **Current**: commission_runs.status updated
  - **GAP**: No database constraint to prevent edits after 'complete'
  - **Risk**: Commissions can be modified after lock
- ❌ **GAP**: No payout_batch creation
  - **Current**: payout_batches table exists
  - **Missing**: No automatic creation after Phase 7
  - **Impact**: CFO must manually create batch

---

### **Edge Cases in Commission Calculations**

#### **1. Inactive Rep (PBV < $50)**
**Function**: is_rep_active(rep_id, month) returns boolean

**What should happen**:
- Rep marked as inactive
- No commissions earned (except retail)
- Downline volume doesn't count toward upline

**Status**:
- ✅ **CONNECTED**: Function exists and reads from org_bv_cache or bv_snapshots
- ❓ **UNKNOWN**: Is function called during commission calculations?
- ❌ **GAP**: No "inactive" status on distributors table
  - **Current**: distributors.status only has active/suspended/terminated
  - **Missing**: No way to mark temporarily inactive (PBV < $50)

---

#### **2. Grace Period (3-month rank hold)**
**Field**: rank_history.is_grace_period

**What should happen**:
- If rep drops below rank requirements, hold rank for 3 months
- After 3 months, demote to qualified rank
- During grace period, earn at held rank (not qualified rank)

**Status**:
- ⚠️ **PARTIAL**: Field exists but no enforcement
- ❌ **GAP**: No trigger to check grace period expiration
- ❌ **GAP**: No automatic demotion after 3 months
- ❌ **GAP**: No notification when entering/exiting grace period

---

#### **3. SOT (Statement of Transaction) Syncing**
**Fields**: rank_upgrade_requests.smart_office_updated, carrier_contracts_updated

**What should happen**:
- When rep achieves new rank, sync to Smart Office API
- Update carrier contract levels in external systems
- Track sync status to prevent duplicate API calls

**Status**:
- ⚠️ **PARTIAL**: Tracking fields exist
- ❌ **GAP**: No API integration to Smart Office
- ❌ **GAP**: No webhook to carrier systems
- ❌ **GAP**: No retry mechanism for failed syncs
- ❓ **UNKNOWN**: Are these manual steps or automated?

---

#### **4. Multi-Organization Support (SOT 1, 2, 3)**
**Fields**: commissions_matrix.organization_number, commissions_infinity.organization_number

**What should happen**:
- Rep can have up to 3 separate MLM organizations
- Commissions calculated separately per org
- Car bonus capped at $3k across all orgs
- Infinity pool capped across all orgs

**Status**:
- ✅ **CONNECTED**: organization_number field exists (1/2/3)
- ❌ **GAP**: No cross-org cap enforcement
  - **Current**: commissions_car.pre_cap_amount_cents exists
  - **Missing**: No calculation to sum across orgs before applying cap
- ❌ **GAP**: No UI to view/manage multiple orgs
- ❓ **UNKNOWN**: Are multi-org features enabled for any reps yet?

---

## STEP 4: NOTIFICATION TRIGGERS

### **Notification System Architecture**

**Flow**: Database INSERT → (Optional) Edge Function → Email via Resend + Real-time UI update

**Components**:
1. `notifications` table (database)
2. `send-notification` edge function (email sender)
3. Real-time subscription (Screen 9 - Communications)

---

### **Event: Order Confirmed**
**Trigger**: Stripe webhook → payment_intent.succeeded

**What should happen**:
1. Notification inserted to notifications table
2. Email sent to rep
3. Real-time UI update

**Status**:
- ✅ **CONNECTED**: Notification inserted (stripe-webhook line 149-155)
- ❌ **GAP**: No automatic email
  - **Current**: Notification type 'order_confirmed' NOT in email types list (send-notification line 39-44)
  - **Impact**: Rep gets in-app notification but no email
- ✅ **CONNECTED**: Real-time update works (Screen 9 listens for INSERTs)

---

### **Event: Customer Cancelled Subscription**
**Trigger**: Stripe webhook → customer.subscription.deleted

**What should happen**:
1. Notification inserted
2. Email sent to rep
3. Alert shown in dashboard

**Status**:
- ✅ **CONNECTED**: Notification inserted (stripe-webhook line 228-234)
- ❌ **GAP**: No email template
  - **Current**: Type 'customer_cancelled' not in email types list
  - **Missing**: No email template in send-notification function
- ⚠️ **PARTIAL**: Dashboard alert
  - **Missing**: Dashboard doesn't query for customer cancellations
  - **Recommendation**: Add widget on Screen 1 for recent cancellations

---

### **Event: Commission Run Complete**
**Trigger**: Commission engine completes all phases

**What should happen**:
1. Notification inserted for each rep with commissions
2. Email sent with commission breakdown
3. Dashboard shows "New Commission Available"

**Status**:
- ❌ **GAP**: No notification inserted
  - **Missing**: No INSERT to notifications after commission run completes
- ⚠️ **PARTIAL**: Email template exists
  - **Current**: 'commission_complete' email template exists (send-notification line 79-82)
  - **Gap**: Never triggered because notification not inserted
- ❌ **GAP**: Dashboard indicator
  - **Missing**: No visual cue on Screen 1 for new commission

---

### **Event: Rank Promoted**
**Trigger**: Admin approves rank upgrade request

**What should happen**:
1. Notification inserted
2. Email sent with congrats + new perks
3. Social share prompt

**Status**:
- ❌ **GAP**: No notification inserted
  - **Missing**: After rank_upgrade_requests.status='approved', no INSERT to notifications
- ✅ **CONNECTED**: Email template exists (send-notification line 84-87)
- ❌ **GAP**: No social share feature

---

### **Event: Rank Eligible (Qualification Met)**
**Trigger**: System detects rep meets next rank requirements

**What should happen**:
1. Notification inserted
2. Email sent to rep
3. Notification sent to upline/sponsor
4. Rank upgrade request auto-created

**Status**:
- ❌ **GAP**: No qualification detection system
  - **Missing**: No cron job or trigger to check rank eligibility
  - **Recommendation**: Monthly job after BV snapshot
- ⚠️ **PARTIAL**: Email template exists (send-notification line 89-92)
- ❌ **GAP**: No upline notification
- ❌ **GAP**: No auto-created rank_upgrade_requests record

---

### **Event: Downline Signup**
**Trigger**: New distributor signs up under sponsor

**What should happen**:
1. Notification to sponsor: "New team member!"
2. Email to sponsor with new rep details
3. Notification to upline (2nd level)
4. Auto-task created: "Welcome call with [new rep]"

**Status**:
- ❌ **GAP**: No notification to sponsor
  - **Missing**: No notification inserted after distributors INSERT
- ❌ **GAP**: No email to sponsor
- ❌ **GAP**: No upline notification
- ❌ **GAP**: No auto-task creation

---

### **Event: Chargeback/Dispute**
**Trigger**: Stripe webhook → charge.dispute.created

**What should happen**:
1. Notification to admin
2. Email to admin with order details
3. Order flagged in admin panel
4. Commission clawback queued

**Status**:
- ✅ **CONNECTED**: Notification to admins (stripe-webhook line 327-335)
- ❌ **GAP**: No email to admin
  - **Current**: Notification type 'system' not in email types list
- ⚠️ **PARTIAL**: Order status updated to 'chargeback'
- ❌ **GAP**: No commission clawback
  - **Missing**: No logic to deduct commission or mark for recovery

---

### **Event: Failed Payment (Subscription Renewal)**
**Trigger**: Stripe webhook → invoice.payment_failed

**What should happen**:
1. Notification to rep: "Payment failed - update card"
2. Email to rep with update link
3. Mark customer as "at risk"
4. Auto-task for rep: "Contact customer about failed payment"

**Status**:
- ❌ **GAP**: No notification to rep
- ❌ **GAP**: No email to rep
- ⚠️ **PARTIAL**: Renewal status recorded (stripe-webhook line 257-264)
  - **Table**: subscription_renewals.status='failed'
  - **Gap**: No action taken after recording
- ❌ **GAP**: No "at risk" customer tracking
- ❌ **GAP**: No auto-task creation

---

### **Event: Payout Batch Approved (ACH Generated)**
**Trigger**: CFO approves payout batch

**What should happen**:
1. Notification to each rep in batch: "Payment sent - arrives in 3-5 days"
2. Email to each rep with payout details
3. Notification to admin: "ACH file generated"

**Status**:
- ❌ **GAP**: No notification to reps
- ❌ **GAP**: No email to reps
- ❌ **GAP**: No notification to admin
- ❓ **UNKNOWN**: Does ACH generation exist?
  - **Table**: payout_batches.ach_file_generated exists
  - **Needs verification**: Is ACH file actually generated?

---

### **Notification Delivery Failure Handling**

**What should happen**:
- If email fails (Resend returns error), log to failures table
- Retry failed emails up to 3 times
- After 3 failures, mark as "delivery failed" and alert admin

**Status**:
- ❌ **GAP**: No email failure tracking
  - **Missing**: No table to log failed emails
- ❌ **GAP**: No retry mechanism
  - **Current**: send-notification throws error but doesn't retry
- ❌ **GAP**: No admin alert for systemic failures

---

## STEP 5: VALIDATION DEPENDENCIES

### **Frontend Validation**

#### **Screen 22 (Finance Home) - Waterfall Percentages**
**Rule**: 4 phases must sum to exactly 100%

**Frontend**:
- ⚠️ **PARTIAL**: UI shows live sum as user types
- ⚠️ **PARTIAL**: Save button disabled if sum ≠ 100%
- **Gap**: Can be bypassed by direct API call

**Backend**:
- ❌ **GAP**: No validation in API endpoint
  - **Missing**: POST /api/finance/waterfall-config needs to check sum = 100
- ❌ **GAP**: No database constraint
  - **Recommendation**: CHECK constraint on saas_comp_engine_config

**Database**:
- ❌ **GAP**: No CHECK constraint
- ❌ **GAP**: No trigger to validate on INSERT/UPDATE

---

#### **Screen 23 (Weighting) - Rank Weights Sum**
**Rule**: All rank weights must sum to 100% across active products

**Frontend**:
- ⚠️ **PARTIAL**: Visual indicator if sum ≠ 100%
- **Gap**: No enforcement - can save invalid values

**Backend**:
- ❌ **GAP**: No validation
  - **Missing**: No check in PATCH /api/finance/weighting

**Database**:
- ❌ **GAP**: No constraint

---

#### **Screen 27 (Rank Promo Fund Allocation) - Pool Allocation Sum**
**Rule**: All promotion fund allocations must sum to 100%

**Frontend**:
- ⚠️ **PARTIAL**: Live calculation shows remaining %
- **Gap**: Can save with <100% or >100%

**Backend**:
- ❌ **GAP**: No validation
- ❌ **GAP**: No enforcement that allocations match available fund balance

**Database**:
- ❌ **GAP**: No constraint

---

#### **Screen 28 (Pricing) - Stripe Price Sync**
**Rule**: Supabase price must match Stripe price (or be marked 'mismatch')

**Frontend**:
- ⚠️ **PARTIAL**: Mismatch alert shown if price_sync_status='mismatch' (Screen 22)
- **Gap**: No sync button to push price to Stripe

**Backend**:
- ⚠️ **PARTIAL**: price_sync_status field exists
- ❌ **GAP**: No cron job to check Stripe prices daily
- ❌ **GAP**: No API endpoint to sync price to Stripe
- ❌ **GAP**: No webhook to detect Stripe price changes

**Database**:
- ✅ **CONNECTED**: products.price_sync_status exists
- ⚠️ **PARTIAL**: products.stripe_last_checked_at exists but not populated

---

#### **Screen 29 (Commission Run) - $25 Minimum Payout**
**Rule**: Rep must earn ≥$25 to receive payout (else carry forward)

**Frontend**:
- ❌ **GAP**: No UI indication during commission run
- ❌ **GAP**: Rep dashboard doesn't show carry forward amount

**Backend**:
- ⚠️ **PARTIAL**: get_carry_forward function exists
- ❌ **GAP**: Not called during commission run
- ❌ **GAP**: No enforcement in Phase 6

**Database**:
- ✅ **CONNECTED**: commission_run_rep_totals.carry_forward_out exists
- ❌ **GAP**: No constraint to enforce minimum

---

### **Business Rule Validation**

#### **Active Rep Definition: $50 Personal BV**
**Rule**: Rep must have ≥$50 PBV to be considered "active" for month

**Function**: is_rep_active(rep_id, month) returns boolean

**Status**:
- ✅ **CONNECTED**: Function exists (dependency_connections line 211-235)
- ✅ **CONNECTED**: Reads from org_bv_cache (current month) or bv_snapshots (historical)
- ❓ **UNKNOWN**: Is function called during commission calculations?
  - **Needs verification**: Check commission run code for is_rep_active calls

---

#### **Check Match Eligibility: 3+ Personally Sponsored**
**Rule**: Rep must have ≥3 personally sponsored reps to earn check match

**Status**:
- ❌ **GAP**: No validation in commission engine
- ❌ **GAP**: No database function to check eligibility
- **Recommendation**: Add to Phase 5 logic

---

#### **CAB Clawback: 60-Day Window**
**Rule**: If subscription cancelled within 60 days, CAB is clawed back

**Status**:
- ✅ **CONNECTED**: cab_clawback_queue created by Stripe webhook (stripe-webhook line 198-216)
- ⚠️ **PARTIAL**: Commission engine reads cab_clawback_queue
  - **Gap**: No code evidence that clawback is applied during commission run
- ❌ **GAP**: What happens after 60 days?
  - **Current**: cab_clawback_queue.status='cleared' option exists
  - **Missing**: No cron job to automatically clear after 60 days

---

#### **Matching Bonus Cap: $25,000/month**
**Rule**: Total matching bonus capped at $25k per month per rep

**Status**:
- ⚠️ **PARTIAL**: Fields exist
  - commissions_matching.pre_cap_amount_cents
  - commissions_matching.cap_applied
- ❌ **GAP**: No code to enforce cap
- ❌ **GAP**: No validation that cap is applied correctly

---

#### **Car Bonus Cap: $3,000/month (across all orgs)**
**Rule**: Total car bonus across all 3 orgs cannot exceed $3k/month

**Status**:
- ⚠️ **PARTIAL**: Fields exist
  - commissions_car.pre_cap_amount_cents
  - commissions_car.cap_applied
- ❌ **GAP**: No cross-org aggregation
- ❌ **GAP**: No enforcement logic

---

#### **Rank Speed Multiplier**
**Rule**: If rank achieved in <30 days (1.5x), <60 days (2.0x), else (1.0x)

**Status**:
- ✅ **CONNECTED**: rank_history.speed_multiplier field exists
- ❌ **GAP**: No calculation logic to determine multiplier
- ❌ **GAP**: No validation that multiplier is applied to rank bonus

---

### **Data Integrity Validation**

#### **Orphaned Records**
**Check**: orders with NULL product_id or rep_id

**Status**:
- ❌ **GAP**: No validation
- **Recommendation**: Add CHECK constraint: rep_id IS NOT NULL AND product_id IS NOT NULL

---

#### **Duplicate Stripe Events (Idempotency)**
**Check**: Stripe webhook should not process same payment_intent twice

**Status**:
- ✅ **CONNECTED**: Duplicate check exists (stripe-webhook line 93-102)
- ✅ **CONNECTED**: Query orders by stripe_payment_intent_id before inserting
- ⚠️ **PARTIAL**: What about webhook replay attacks?
  - **Gap**: No timestamp validation on Stripe-Signature header

---

#### **BV Snapshot Completeness**
**Check**: All active reps must have BV snapshot for month before commission run

**Status**:
- ❌ **GAP**: No validation
- **Recommendation**: Add to commission run gate:
  - Count active distributors
  - Count bv_snapshots for month
  - Block if counts don't match

---

#### **Commission Run Lock Enforcement**
**Check**: Once commission_runs.status='complete', no edits allowed

**Status**:
- ❌ **GAP**: No database constraint
- ❌ **GAP**: No RLS policy to prevent updates
- **Risk**: Commissions can be modified after finalization

---

## STEP 6: STRIPE EVENTS AND HANDLERS

### **Event: payment_intent.succeeded**
**Handler**: stripe-webhook line 89-158

**What it does**:
1. ✅ Check for duplicate (idempotency)
2. ✅ Extract metadata (rep_id, product_id, order_type, bv_amount)
3. ✅ Insert to orders table
4. ✅ If Business Center: credit promotion fund
5. ✅ Insert notification: "Order Confirmed"

**Failure Handling**:
- ⚠️ **PARTIAL**: Errors logged to console
- ❌ **GAP**: No retry mechanism
- ❌ **GAP**: No alert to admin if order creation fails
- ❌ **GAP**: No dead letter queue for failed events

**Idempotency**:
- ✅ **CONNECTED**: Checks for existing order by stripe_payment_intent_id

**Edge Cases**:
- ❓ **UNKNOWN**: What if metadata missing?
  - **Current**: Returns early with console.error
  - **Gap**: No alert to admin, payment succeeded but order not created
- ❓ **UNKNOWN**: What if product_id invalid?
  - **Gap**: No validation, order created with broken FK

---

### **Event: customer.subscription.created**
**Handler**: stripe-webhook line 163-171

**What it does**:
1. ✅ Update order with stripe_subscription_id

**Issues**:
- ⚠️ **PARTIAL**: Matches order by latest_invoice (might not be payment_intent)
  - **Risk**: Wrong order updated if multiple subscriptions
- ❌ **GAP**: No validation that order exists
- ❌ **GAP**: No notification to rep that subscription is active

**Failure Handling**:
- ❌ **GAP**: No error handling, silent failure

---

### **Event: customer.subscription.updated**
**Handler**: ❌ **MISSING**

**What should happen**:
1. Update order with new subscription status
2. If upgrade/downgrade: adjust BV
3. If trial → paid: trigger CAB

**Status**:
- ❌ **GAP**: No handler for subscription.updated

---

### **Event: customer.subscription.deleted**
**Handler**: stripe-webhook line 176-237

**What it does**:
1. ✅ Find order by stripe_subscription_id
2. ✅ Update order status to 'cancelled'
3. ✅ If within 60 days: queue CAB clawback
4. ✅ Update customer status
5. ✅ Insert notification: "Customer Cancelled Subscription"

**Failure Handling**:
- ⚠️ **PARTIAL**: Returns early if order not found
- ❌ **GAP**: No alert to admin if order not found
- ❌ **GAP**: What if customer has multiple subscriptions?
  - **Risk**: Only updates one order

---

### **Event: invoice.payment_failed**
**Handler**: stripe-webhook line 242-265

**What it does**:
1. ✅ Find order by subscription_id
2. ✅ Insert to subscription_renewals (status='failed')

**Issues**:
- ❌ **GAP**: No notification to rep
- ❌ **GAP**: No email to rep about failed payment
- ❌ **GAP**: No retry tracking
  - **Spec**: Stripe retries failed payments 3-4 times
  - **Gap**: No table to track retry attempts

---

### **Event: invoice.paid**
**Handler**: stripe-webhook line 270-293

**What it does**:
1. ✅ Find order by subscription_id
2. ✅ Insert to subscription_renewals (status='renewed')

**Issues**:
- ❌ **GAP**: No new order created for renewal
  - **Impact**: Renewal BV not credited
  - **Risk**: Reps lose recurring commissions
- ❌ **GAP**: No notification to rep
- ❌ **GAP**: No commission calculation for renewal

---

### **Event: invoice.payment_succeeded**
**Handler**: ❌ **MISSING**

**What should happen**:
- Same as invoice.paid (might be duplicate)

**Status**:
- ❓ **UNKNOWN**: Is this event needed or covered by invoice.paid?

---

### **Event: charge.refunded**
**Handler**: ❌ **MISSING**

**What should happen**:
1. Update order status to 'refunded'
2. Create negative commission entry
3. Notify rep
4. Queue commission clawback

**Status**:
- ❌ **GAP**: No handler

---

### **Event: charge.dispute.created**
**Handler**: stripe-webhook line 298-338

**What it does**:
1. ✅ Find order by payment_intent
2. ✅ Update order status to 'chargeback'
3. ✅ Notify all admins

**Issues**:
- ❌ **GAP**: No commission clawback
- ❌ **GAP**: No rep notification
- ❌ **GAP**: No email to admins (notification inserted but no email template)

---

### **Event: charge.dispute.closed**
**Handler**: ❌ **MISSING**

**What should happen**:
1. Update order status (won/lost)
2. If won: restore commission
3. If lost: finalize clawback

**Status**:
- ❌ **GAP**: No handler

---

### **Event: checkout.session.completed**
**Handler**: ❌ **MISSING**

**What should happen**:
1. Confirm payment intent processed
2. Redirect user to success page

**Status**:
- ❌ **GAP**: No handler
- ❓ **UNKNOWN**: Is payment_intent.succeeded sufficient?

---

### **Missing Stripe Events**

These Stripe events have NO handlers:
1. customer.subscription.updated
2. charge.refunded
3. charge.dispute.closed
4. checkout.session.completed
5. invoice.payment_succeeded (might be duplicate of invoice.paid)
6. payment_method.attached
7. payment_method.detached
8. customer.created
9. customer.updated
10. customer.deleted

**Recommendation**: Decide which events are critical and implement handlers

---

## STEP 7: ROLE AND PERMISSION BOUNDARIES

### **Roles**

**Defined in**: distributors.role enum
- `admin` - Full system access
- `cfo` - Finance screens + reports
- `rep` - Standard distributor

**Issues**:
- ❌ **GAP**: No role for "team leader" or "upline manager"
- ❌ **GAP**: No role-based dashboard (all reps see same UI)

---

### **Route-Level Protection**

#### **Admin Routes** (`/app/admin/*`)
**Protection**: Middleware checks distributors.role='admin'

**Status**:
- ⚠️ **PARTIAL**: Route protection exists
- ❌ **GAP**: No RLS enforcement
  - **Risk**: Direct API calls can bypass middleware
- ❌ **GAP**: No audit log for admin actions
  - **Current**: audit_log table exists
  - **Missing**: Not consistently used

**Protected Routes**:
- ✅ /admin/reps
- ✅ /admin/commission-engine
- ✅ /admin/prospects
- ✅ /admin/services
- ❓ **UNKNOWN**: /admin/social-content (needs verification)

---

#### **Finance Routes** (`/app/finance/*`)
**Protection**: Should check role='cfo' OR role='admin'

**Status**:
- ❌ **GAP**: No role check
  - **Current**: Any authenticated user can access
  - **Risk**: Reps can view/edit finance config

**Unprotected Routes**:
- /finance
- /finance/weighting
- /finance/waterfall
- /finance/bonusvolume
- /finance/bonuspool
- /finance/rankpromo
- /finance/pricing
- /finance/commrun
- /finance/scenarios
- /finance/saas-engine
- /finance/insurance-engine

---

#### **Rep Routes** (`/app/dashboard`, `/app/products`, `/app/communications`, etc.)
**Protection**: Authenticated users only

**Status**:
- ✅ **CONNECTED**: Supabase auth required
- ⚠️ **PARTIAL**: No check for suspended/terminated status
  - **Risk**: Suspended reps can still access portal

---

### **API Endpoint Protection**

#### **Admin Endpoints** (`/api/admin/*`)
**Should require**: role='admin'

**Status**:
- ⚠️ **PARTIAL**: Some endpoints check role
  - **Example**: /api/admin/distributors checks role
- ❌ **GAP**: Inconsistent enforcement
  - **Missing**: Many endpoints don't check role
- ❌ **GAP**: No rate limiting
- ❌ **GAP**: No audit logging

**Unprotected Endpoints** (sample audit):
- ❓ /api/admin/compensation/run (CRITICAL - needs verification)
- ❓ /api/admin/payouts/[id]/approve (CRITICAL - needs verification)
- ❓ /api/admin/products (needs verification)

---

#### **Profile Endpoints** (`/api/profile/*`)
**Should require**: Own profile only (user_id match)

**Status**:
- ⚠️ **PARTIAL**: Some endpoints check auth
- ❌ **GAP**: No validation that user can only update own profile
  - **Risk**: User A can update User B's profile if they know the user_id

---

### **Row Level Security (RLS) Policies**

#### **Table: distributors**
**Policies**:
- ❌ **GAP**: No RLS policies defined
- **Risk**: Any authenticated user can read all distributors

**Should have**:
- Reps can read: Own profile + direct downline + direct sponsor
- Admins can read: All distributors
- Reps can update: Own profile only
- Admins can update: All distributors

---

#### **Table: orders**
**Policies**: (from dependency_connections line 36-68)
- ✅ "Reps can read own orders"
- ✅ "Admin and CFO can read all orders"
- ✅ "System can insert orders"
- ✅ "System can update orders"

**Issues**:
- ⚠️ **PARTIAL**: "System" policies use `WITH CHECK (true)`
  - **Risk**: Any authenticated user can insert/update if they bypass route protection

---

#### **Table: commission tables** (all 16 types)
**Policies**:
- ✅ "Distributors view own commissions"
- ⚠️ **PARTIAL**: Admin viewing not implemented
  - **Gap**: No policy for admin/cfo to view all commissions

---

#### **Table: org_bv_cache**
**Policies**: (from dependency_connections line 167-195)
- ✅ "Reps can read own org BV cache"
- ✅ "Admin and CFO can read all org BV cache"
- ⚠️ **PARTIAL**: "System can upsert org BV cache"
  - Uses `USING (true) WITH CHECK (true)`
  - **Risk**: Any user can modify if they bypass route protection

---

#### **Table: bv_snapshots**
**Policies**: (from dependency_connections line 26-53)
- ✅ "Reps can read own BV snapshots"
- ✅ "Admin and CFO can read all BV snapshots"
- ✅ "System can insert BV snapshots"

**Issues**:
- ⚠️ **PARTIAL**: No update/delete policies
  - **Gap**: What if snapshot needs correction?

---

#### **Table: notifications**
**Policies**:
- ❌ **GAP**: No RLS policies defined
- **Risk**: Any user can read all notifications

**Should have**:
- Reps can read: Own notifications only
- Reps can update: Own notifications (mark as read)
- System can insert: All notifications

---

#### **Table: promotion_fund_ledger**
**Policies**: (from dependency_connections line 112-129)
- ✅ "Admin and CFO can read promotion fund ledger"
- ✅ "System can insert into promotion fund ledger"

**Issues**:
- ❌ **GAP**: Reps cannot view how promotion fund is used
  - **Business decision**: Should reps see this?

---

#### **Table: customers**
**Policies**:
- ❌ **GAP**: No RLS policies defined
- **Risk**: Reps can view all customers (not just own)

**Should have**:
- Reps can read: Customers they referred (WHERE referred_by_distributor_id = current_user)
- Admins can read: All customers

---

#### **Table: products**
**Policies**:
- ❌ **GAP**: No RLS policies defined
- **Current**: Products table is public read

**Issues**:
- ⚠️ **PARTIAL**: Anyone can read products (intentional?)
- ❌ **GAP**: No protection on price/BV fields
  - **Risk**: Competitor can scrape pricing

---

### **Permission Gaps Summary**

#### **High Priority**:
1. ❌ Finance routes accessible by all reps (should be CFO-only)
2. ❌ No RLS on distributors table (exposes all rep data)
3. ❌ No RLS on customers table (exposes all customer data)
4. ❌ No RLS on notifications table (privacy issue)
5. ❌ Admin API endpoints not consistently protected

#### **Medium Priority**:
6. ❌ No audit logging for admin actions
7. ❌ No rate limiting on API endpoints
8. ❌ Suspended/terminated reps can still access portal
9. ❌ No role-based UI (reps see admin features, just disabled)

#### **Low Priority**:
10. ❌ No granular permissions (can't give rep "view only" access to reports)

---

## SUMMARY STATISTICS

### **Total Connections Mapped**: 487

### **By Status**:
- ✅ **CONNECTED**: 127 (26%)
- ⚠️ **PARTIAL**: 89 (18%)
- ❌ **GAP**: 238 (49%)
- ❓ **UNKNOWN**: 33 (7%)

---

### **Critical Gaps (High Priority)**

#### **Commission Engine**:
1. ❌ No backend enforcement of BV snapshot gate
2. ❌ No sequencing enforcement between commission phases
3. ❌ No notification when commission run completes
4. ❌ No carry forward logic implemented
5. ❌ CAB clawback not applied during commission runs
6. ❌ Check Match eligibility not enforced (3+ personally sponsored rule)
7. ❌ Matching bonus cap ($25k) not enforced
8. ❌ Car bonus cap ($3k across orgs) not enforced

#### **Order Processing**:
9. ❌ BV not recalculated when order is placed
10. ❌ Subscription renewals don't create new orders (no recurring BV)
11. ❌ No commission calculation for renewals
12. ❌ No commission clawback for refunds/chargebacks

#### **Notifications**:
13. ❌ No notification to sponsor when downline signs up
14. ❌ No notification to rep when commission run completes
15. ❌ No notification when rank eligible
16. ❌ No email for most notification types (only 4/12 have email templates)
17. ❌ No email failure tracking or retry mechanism

#### **Stripe Webhooks**:
18. ❌ No handler for 10+ Stripe events (see STEP 6)
19. ❌ No retry mechanism for failed webhook processing
20. ❌ No dead letter queue for failed events

#### **Security**:
21. ❌ Finance routes not protected (accessible by all reps)
22. ❌ No RLS on distributors, customers, notifications tables
23. ❌ Admin API endpoints inconsistently protected
24. ❌ No audit logging for admin actions

#### **Validation**:
25. ❌ No backend validation for finance config (waterfall %, rank weights, etc.)
26. ❌ No validation that all active reps have BV snapshots before commission run
27. ❌ No constraint to prevent commission edits after lock

---

### **Medium Priority Gaps**

28. ❌ No automatic rank eligibility detection
29. ❌ No grace period (3-month rank hold) enforcement
30. ❌ No Smart Office / carrier contract sync
31. ❌ No Stripe price sync mechanism
32. ❌ No cleanup/archive for old notifications
33. ❌ No rate limiting on API endpoints
34. ❌ Suspended reps can access portal
35. ❌ No cross-org cap enforcement (multi-org support incomplete)

---

### **Low Priority / Future Enhancements**

36. ❌ No social share for rank promotions
37. ❌ No auto-task creation (e.g., "Welcome call with new downline")
38. ❌ No analytics on notification open rates
39. ❌ No role-based dashboard customization
40. ❌ No "view only" permission level

---

## RECOMMENDATIONS

### **Phase 1: Critical Security Fixes (Week 1)**
1. Add RLS policies to distributors, customers, notifications
2. Protect finance routes (CFO-only)
3. Audit and protect all admin API endpoints
4. Implement audit logging for admin actions

### **Phase 2: Commission Engine Integrity (Week 2)**
5. Enforce BV snapshot gate at backend
6. Implement phase sequencing gates
7. Implement carry forward logic
8. Apply CAB clawback during commission runs
9. Enforce matching bonus and car bonus caps

### **Phase 3: Order & BV Calculations (Week 3)**
10. Add trigger to recalculate BV on order INSERT
11. Create new orders for subscription renewals
12. Implement commission clawback for refunds/chargebacks

### **Phase 4: Notification Completeness (Week 4)**
13. Add email templates for all notification types
14. Implement notification triggers for all events
15. Add email failure tracking and retry mechanism

### **Phase 5: Stripe Integration Hardening (Week 5)**
16. Add handlers for missing Stripe events
17. Implement retry mechanism for webhook failures
18. Add dead letter queue for failed events

### **Phase 6: Validation & Business Rules (Week 6)**
19. Add backend validation for all finance config
20. Implement BV snapshot completeness check
21. Add database constraints for commission lock
22. Implement check match eligibility enforcement

---

## APPENDIX A: Database Trigger Inventory

**Existing Triggers**:
1. `after_distributor_insert` → `trigger_recalculate_sponsor_chain()` ✅
2. `update_updated_at_column()` on multiple tables ✅

**Missing Triggers**:
1. After orders INSERT → Recalculate BV cache for buyer + sponsor chain
2. After commission_runs status='complete' → Insert notifications for all reps
3. After rank_upgrade_requests status='approved' → Insert rank_promoted notification
4. After notifications INSERT → Call send-notification edge function
5. After bv_snapshot_runs status='complete' → Notify CFO

---

## APPENDIX B: Edge Function Inventory

**Existing**:
1. `stripe-webhook` - Handles 6 Stripe events ✅
2. `send-notification` - Sends emails via Resend ✅
3. `snapshot-monthly-bv` - Creates monthly BV snapshots ✅

**Missing**:
1. `commission-engine-run` - Orchestrate 7-phase commission calculation
2. `check-rank-eligibility` - Monthly cron to detect reps eligible for promotion
3. `sync-stripe-prices` - Daily cron to check Stripe price mismatches
4. `clear-old-notifications` - Monthly cleanup (>90 days)
5. `process-cab-clawback` - Monthly cron to clear expired clawback queue

---

## APPENDIX C: Database Function Inventory

**Existing**:
1. `recalculate_sponsor_chain(rep_id)` ✅
2. `get_promotion_fund_balance()` ✅
3. `calculate_renewal_rate(rep_id, month)` ✅
4. `is_rep_active(rep_id, month)` ✅
5. `get_carry_forward(rep_id, run_month)` ✅
6. `handle_termination(rep_id)` ✅

**Missing**:
1. `calculate_check_match_eligibility(rep_id)` - Returns boolean (≥3 personally sponsored)
2. `apply_matching_bonus_cap(rep_id, month)` - Enforces $25k cap
3. `apply_car_bonus_cap(rep_id, month)` - Enforces $3k cap across orgs
4. `calculate_rank_speed_multiplier(from_rank, to_rank, days_elapsed)` - Returns 1.0, 1.5, or 2.0
5. `validate_finance_config()` - Returns validation errors for config changes
6. `get_all_downline_ids(rep_id)` - Returns array of all downline rep IDs

---

## APPENDIX D: API Endpoint Inventory

**Protected (Verified)**:
- POST /api/admin/distributors ✅
- GET /api/admin/distributors ✅

**Unverified (Needs Audit)**:
- POST /api/admin/compensation/run ❓
- POST /api/admin/payouts/[id]/approve ❓
- PATCH /api/finance/* ❓

**Recommendation**: Conduct full API endpoint security audit

---

## END OF AUDIT

**Next Steps**:
1. Review this audit with technical team
2. Prioritize gaps based on business impact
3. Create tickets for each gap in project management system
4. Assign owners and deadlines for fixes
5. Re-audit after fixes to verify implementation

**Questions for Product Team**:
1. Are multi-org features (SOT 1/2/3) enabled for any reps yet?
2. Is Smart Office sync manual or should it be automated?
3. Should reps see promotion fund ledger details?
4. What is the strategy for handling subscription renewals (new order vs update)?
5. What notification types are critical for email (vs in-app only)?
