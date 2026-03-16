# Apex Affinity Group - Complete Dependency & Integration Map
**Last Updated:** 2026-03-15
**Status:** Current codebase analysis

---

## 🚨 CRITICAL ISSUES FOUND

### 1. **Products System - FIXED** 🟢
- **Admin Products Page:** Now reads from database and writes via modal ✅
- **Rep Shop Page:** Reads from `products` table correctly ✅
- **Database Schema:** Uses `retail_price_cents`, `wholesale_price_cents` (integers) ✅
- **Code Uses:** Proper cents ↔ dollars conversion ✅
- **Field Names:** Corrected to use `is_active` ✅
- **Status:** Admin can create/view/toggle products, changes sync to rep shop ✅

### 2. **Training System - TABLES MISSING** 🔴
- **Database:** Migration `20260312000005_create_training_system.sql` exists
- **Tables Created:** `training_content`, `training_episodes`, `training_progress`, `training_completions`
- **API Routes:** Exist at `/api/training/*`
- **Status:** Should be functional - need to verify

### 3. **Customer Management - NO ADMIN UI** 🟡
- **Database:** `customers` table exists
- **Rep Side:** Customer list page works
- **Admin Side:** No UI to view/manage customers
- **Status:** Customers created but can't be managed

### 4. **Commission Engine - COMPLEX BUT FUNCTIONAL** 🟢
- **Tables:** All 16+ commission tables exist
- **Functions:** Complex waterfall logic implemented
- **Status:** Appears functional but untested

---

## 📊 DATABASE SCHEMA (58 Tables Total)

### Core User & Auth
```
auth.users (Supabase managed)
  ↓
distributors (id, email, sponsor_id, matrix_parent_id, rank, etc.)
  ↓ sponsor relationship
  ├─→ distributors (recursive sponsor tree)
  └─→ distributors (recursive matrix tree via matrix_parent_id)
```

### Products & Orders
```
product_categories
  ↓
products (id, name, retail_price_cents, wholesale_price_cents, bv, active)
  ↓
order_items
  ↑
orders (id, rep_id, customer_id, stripe_payment_intent_id, status)
  ↓
customers (id, distributor_id, name, email, phone)
  ↓
subscriptions (stripe_subscription_id, status, next_billing_date)
```

### Commission System (16 Tables)
```
bv_snapshots (rep_id, period, personal_bv, team_bv, org_bv)
  ↓
commission_runs (period, status, started_at, completed_at)
  ↓
commission_run_rep_totals (commission_run_id, rep_id, final_payout)
  ↓
payout_batches (commission_run_id, status, stripe_transfer_id)
  ↓
payout_records (payout_batch_id, rep_id, amount, status)

Supporting tables:
- rank_snapshots (historical rank tracking)
- carry_forward_balances (sub-$25 balances)
- cab_queue (customer acquisition bonuses)
- commissions_retail, commissions_override, etc. (16 types)
```

### Training System
```
training_content (id, title, category, type, duration, required)
  ↓
training_episodes (content_id, episode_number, title, video_url)
  ↓
training_completions (distributor_id, content_id, completed_at)
  ↓
training_progress (distributor_id, episode_id, progress_seconds)
```

### Email Marketing
```
email_campaigns (name, type, status, scheduled_for)
  ↓
email_templates (campaign_id, subject, html_body)
  ↓
email_sends (template_id, recipient_email, sent_at, opened_at)
```

### Business Center (Paywall)
```
business_center_subscriptions (distributor_id, plan, status)
  ↓ enables access to:
  ├─→ crm_contacts
  ├─→ lead_capture_forms
  ├─→ calendar_integrations
  └─→ api_keys
```

---

## 🔌 DATA FLOW MAPS

### 1. Signup Flow
```
User submits /signup
  ↓
POST /api/signup
  ↓
create_distributor_atomic(sponsor_code, matrix_placement)
  ↓
├─→ Validate sponsor exists
├─→ find_matrix_placement() - BFS with advisory lock
├─→ Insert distributors row
├─→ Create auth.users entry
├─→ Send welcome email
└─→ Notify sponsor

Result: distributor record with sponsor_id and matrix_parent_id
```

### 2. Product Purchase Flow (BROKEN - Admin Can't Manage)
```
Admin adds product (CURRENTLY HARDCODED)
  ↓
Rep views /products
  ↓
Reads from products table (expects member_price, retail_price)
  ↓
DATABASE HAS: retail_price_cents, wholesale_price_cents
  ↓
MISMATCH - needs conversion or schema update
```

### 3. Order → Commission Flow
```
Product purchased
  ↓
orders table (rep_id, total_cents, status)
  ↓
order_items (product_id, bv)
  ↓
BV assigned to rep
  ↓
bv_snapshots updated (personal_bv, team_bv, org_bv)
  ↓
Monthly commission run processes
  ↓
executeCommissionRun()
  ├─→ calculateWaterfall()
  ├─→ resolveAllOverrides()
  ├─→ processCabQueue()
  └─→ calculateBonuses()
  ↓
commission_run_rep_totals
  ↓
payout_batches created
  ↓
Stripe transfers initiated
```

### 4. Commission Calculation (Complex)
```
executeCommissionRun(period)
  ↓
1. Snapshot all BV (bv_snapshots)
2. Snapshot all ranks (rank_snapshots)
3. Load all active subscriptions
4. For each subscription:
   ├─→ Calculate seller commission (20-45% based on rank)
   ├─→ Calculate 7-level matrix (5% each level)
   ├─→ Calculate infinity bonus (2% L8+)
   ├─→ Calculate matching bonus (10-25% of downline)
   └─→ Calculate rank bonuses
5. Aggregate by rep
6. Process CAB queue (release after 6 months)
7. Apply $25 minimum (carry forward if under)
8. Create payout batch
9. Execute Stripe transfers
```

---

## 🎯 PAGE → DATABASE MAPPING

### Admin Pages
| Page | Tables Used | Status |
|------|-------------|--------|
| `/admin` | distributors, bv_snapshots, commission_runs | ✅ Working |
| `/admin/distributors` | distributors | ✅ Working |
| `/admin/distributors/[id]` | distributors, notes, orders | ✅ Working |
| `/admin/products` | products, product_categories | ✅ Working |
| `/admin/reps` | distributors | ✅ Working |
| `/admin/rank-approvals` | distributors, rank_snapshots | ✅ Working |
| `/admin/compliance` | distributors, orders | ✅ Working |
| `/admin/commission-engine` | commission config | ✅ Working |
| `/admin/payouts` | payout_batches, payout_records | ✅ Working |

### Rep Pages
| Page | Tables Used | Status |
|------|-------------|--------|
| `/dashboard` | distributors, bv_snapshots, notifications | ✅ Working |
| `/org-tree` | distributors (recursive) | ✅ Working |
| `/products` | products | ✅ Working |
| `/customers` | customers | ✅ Working |
| `/earnings` | commission_run_rep_totals, payout_records | ✅ Working |
| `/training` | training_content, training_completions | ✅ Working |
| `/email-marketing` | email_campaigns, email_templates | ✅ Working |

### API Routes
| Route | Tables Modified | Status |
|-------|----------------|--------|
| `/api/signup` | distributors, auth.users | ✅ Working |
| `/api/admin/distributors/[id]/notes` | distributor_notes | ✅ Working |
| `/api/profile/onboarding` | distributors | ✅ Working |
| `/api/training/*` | training tables | ✅ Working |
| `/api/email-marketing/*` | email_campaigns, email_templates | ✅ Working |
| `/api/checkout` | products, distributors, Stripe | ✅ Working |
| `/api/webhooks/stripe` | orders, order_items, subscriptions | ✅ Working |

---

## ⚠️ SCHEMA MISMATCHES

### Products Table Mismatch
**Database Schema:**
```sql
retail_price_cents INTEGER (e.g., 5900 = $59.00)
wholesale_price_cents INTEGER
bv INTEGER
active BOOLEAN
```

**Code Expects:**
```typescript
member_price: number  // decimal 59.00
retail_price: number  // decimal 79.00
commission_per_sale: number  // decimal
is_active: boolean  // vs 'active'
```

**Solution:** Either:
1. Update code to convert cents → dollars
2. Update schema to use decimal fields
3. Add computed columns

### Commission Engine Table References
Some commission lib files reference `reps` table but schema uses `distributors`.

---

## 🔧 COMPONENT DEPENDENCIES

### Shared Components
```
RepSidebar.tsx
  ├─→ Reads: distributors (name, rank, photo)
  └─→ Navigation links

AdminSidebar.tsx
  ├─→ Reads: distributors (role check)
  └─→ Navigation links

OptiveReplicatedSite.tsx
  ├─→ Reads: distributors (slug)
  └─→ Renders marketing site with rep's referral

ReplicatedSiteBanner.tsx
  ├─→ Shows replicated site link
  └─→ Copy to clipboard functionality
```

### Modals
```
AddProductModal.tsx (admin)
  └─→ Should write to products table (currently doesn't exist)

AddRepModal.tsx (admin)
  └─→ Links to /signup

OnboardingModal.tsx (rep)
  ├─→ Reads: distributors
  └─→ Updates: distributors (onboarding fields)

CreateEpisodeModal.tsx (admin)
  └─→ Writes: training_episodes
```

---

## 🔄 INTEGRATION POINTS

### Stripe Integration
**Current State:**
- Stripe publishable/secret keys configured
- Checkout links hardcoded in product cards
- **MISSING:** Webhook handler for completed payments
- **MISSING:** Subscription management

**Needed:**
```
/api/stripe-webhook
  ↓
Handle: checkout.session.completed
  ├─→ Create order record
  ├─→ Assign BV to rep
  └─→ Create subscription if recurring

Handle: customer.subscription.deleted
  └─→ Update subscription status
```

### Email System
**Two Separate Systems:**

1. **Transactional Emails** (`src/lib/email/`)
   - Signup confirmation
   - Password reset
   - Rank advancement
   - Commission notifications

2. **Marketing Campaigns** (`email_campaigns` table)
   - Prospect nurture sequences
   - AI-generated sequences
   - Scheduled sends

---

## 📋 MISSING FUNCTIONALITY

### High Priority
1. ✅ Product admin → database connection (COMPLETED)
2. ✅ Product creation modal (COMPLETED)
3. ✅ Stripe checkout integration (COMPLETED)
4. ✅ Stripe webhook handler (COMPLETED)
5. ❌ Product edit modal
6. ❌ Customer management admin UI
7. ❌ Subscription management UI
8. ❌ Order history page for reps

### Medium Priority
6. ❌ Commission breakdown view (detailed)
7. ❌ Real-time BV updates
8. ❌ Rank advancement approval workflow
9. ❌ Compliance document uploads

### Low Priority
10. ❌ Advanced reporting
11. ❌ Export functionality
12. ❌ Mobile app integration

---

## 🧪 TESTING STATUS

### Tested & Working
- ✅ Signup flow (atomic with matrix placement)
- ✅ Login/auth
- ✅ Distributor profile viewing
- ✅ Org tree visualization
- ✅ Training content display

### Untested
- ❌ Commission calculation engine
- ❌ Product purchases → orders → BV
- ❌ Payout processing
- ❌ CAB queue processing
- ❌ Email campaign sends

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Fix Critical Breaks (COMPLETED ✅)
1. ✅ Wire admin products page to database
2. ✅ Fix field name mismatches (cents vs dollars, is_active)
3. ✅ Add product creation modal
4. ✅ Test admin → rep shop flow
5. ⏸️ Add product edit modal (optional enhancement)

### Phase 2: Complete Purchase Flow (2-3 hours)
5. Create Stripe webhook handler
6. Test product purchase → order creation
7. Test BV assignment
8. Test subscription creation

### Phase 3: Admin Features (3-4 hours)
9. Add customer management UI
10. Add subscription management UI
11. Add commission breakdown view

### Phase 4: Testing & Polish (2-3 hours)
12. Test complete commission run
13. Test payout processing
14. Fix any edge cases found

---

## 📝 NOTES

- **Commission Engine:** Extremely complex with 16+ bonus types - needs thorough testing
- **BV Tracking:** Multiple tables (`bv_snapshots`, `org_bv_cache`) - clarify strategy
- **Matrix Placement:** Uses advisory locks for concurrency - good approach
- **RLS Policies:** Comprehensive security implemented
- **Carry Forward Logic:** Properly handles sub-$25 balances

---

**Next Steps:** Fix products system first (highest impact, easiest fix), then tackle Stripe integration.
