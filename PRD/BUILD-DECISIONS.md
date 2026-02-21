# BUILD DECISIONS - Business Center & Compensation Engine
**Session Date**: February 21, 2026
**Status**: Active Development

---

## 🎯 CRITICAL DECISIONS MADE

### 1. E-Commerce Strategy
**Decision**: Build our own e-commerce system (not using Shopify, WooCommerce, etc.)

**Rationale**:
- Need tight integration with commission calculations
- BV tracking must be real-time
- Custom business logic (matrix placement, rank calculations) requires control
- Subscription management needs to trigger commission events

**Implementation**:
- Custom `products` table with BV assignments
- Custom `orders` table with commission tracking
- Custom `subscriptions` table for recurring billing
- Stripe for payment processing, but we own the order flow

---

### 2. Business Center Model
**Decision**: Business Center subscription is **OPTIONAL** and **SEPARATE** from product purchases

**Pricing**: $39/month (non-commissionable, 0 BV)

**What reps get WITHOUT Business Center** (FREE tier):
- ✅ Back office dashboard access
- ✅ Affiliate link for recruiting
- ✅ Basic genealogy view
- ✅ Commission tracking
- ❌ NO replicated sites
- ❌ NO CRM
- ❌ NO email campaigns
- ❌ NO lead capture forms
- ❌ NO custom branding

**What Business Center unlocks** (Basic/Enhanced/Platinum tiers):
- ✅ Replicated marketing sites
- ✅ CRM with contacts + kanban
- ✅ Email campaigns & automation
- ✅ Lead capture forms
- ✅ Calendar integration (Enhanced+)
- ✅ API access (Platinum)
- ✅ White-label branding (Platinum)

**Billing**:
- Separate Stripe subscription from product purchases
- Charged monthly, independent of product orders
- Can be upgraded/downgraded at any time
- Does NOT generate BV or commissions

---

### 3. Commission Payouts
**Decision**: ACH batch processing (not Stripe Connect)

**Rationale**:
- Simpler compliance (no need to onboard distributors to Stripe)
- Lower fees (ACH is cheaper than Stripe transfers)
- Manual review capability before payouts
- Standard MLM industry practice

**Implementation**:
- `payout_batches` table (monthly batches)
- `payout_items` table (individual distributor payouts within batch)
- Admin approves batch → generates ACH file → uploads to bank
- Track status: pending → approved → processing → completed/failed

**ACH File Format**: NACHA format (industry standard)

---

### 4. Product Seeding Strategy
**Decision**: Build interface for adding products NOW, seed data LATER

**Rationale**:
- Product details may change before launch
- Easier to bulk import from CSV/spreadsheet later
- Focus on getting commission engine working with test data first

**Implementation**:
- Create complete `products` table schema now
- Create admin UI for CRUD operations
- Add 2-3 test products manually for development
- Import all 33 products from CSV before launch

---

### 5. Migration Strategy
**Decision**: Multi-phase approach, each phase fully tested before next

**Phase 1**: Business Center System ✅ (READY TO APPLY)
- File: `20260221000002_business_center_system.sql`
- Tables: 17 tables for CRM, email campaigns, branding, API keys
- Action: Apply this migration first

**Phase 2**: Products & Orders System (NEXT)
- Tables: `products`, `product_categories`, `orders`, `order_items`, `subscriptions`, `customers`
- Purpose: E-commerce foundation, BV tracking
- Estimated: ~300 lines SQL

**Phase 3**: Commission Engine Core (AFTER PHASE 2)
- Tables: All 16 commission types + payout system
- Purpose: Track every commission earned
- Estimated: ~500 lines SQL

**Phase 4**: Commission Calculation Functions (FINAL)
- Functions: Monthly commission run, rank evaluation, compression logic
- Purpose: The actual calculation engine
- Estimated: ~800 lines SQL + PostgreSQL functions

---

## 📊 DATABASE ARCHITECTURE DECISIONS

### Customer vs Distributor Model
**Decision**: Separate `customers` and `distributors` tables

**Customers Table**:
- Retail customers who buy products
- No matrix position
- No commission eligibility
- Can be "upgraded" to distributor later

**Distributors Table** (already exists):
- Independent reps
- Matrix position assigned
- Earn commissions
- Can also buy products for personal use (counts as PBV)

**Relationship**: One-to-one optional (customer can become distributor, keeps purchase history)

---

### Order Architecture
**Decision**: Orders support BOTH one-time and recurring products

**Tables**:
```
orders
├── order_items (multiple products per order)
├── customer_id OR distributor_id (polymorphic)
└── subscription_id (if recurring)

subscriptions
├── product_id (what product is subscribed)
├── next_billing_date
└── generates new order every cycle
```

**BV Calculation**:
- Stored on `order_items.bv_amount` (snapshot at purchase time)
- Aggregated to `orders.total_bv`
- Used for PBV and GBV calculations in commission runs

---

### Commission Tables Strategy
**Decision**: ONE table per major commission type (not a single polymorphic table)

**Rationale**:
- Easier to query specific commission types
- Different columns needed per type (e.g., Fast Start has 30-day window, Car Bonus has 3-month qualification)
- Simpler to audit
- Better performance (smaller indexes)

**Tables**:
- `commissions_retail` - Retail cash commissions
- `commissions_cab` - Customer Acquisition Bonuses
- `commissions_matrix` - Matrix commissions L1-7
- `commissions_matching` - Matching bonuses Gen 1-3
- `commissions_override` - Override bonuses
- `commissions_infinity` - Coded Infinity L8+
- `commissions_rank` - Rank advancement bonuses
- `commissions_fast_start` - Fast Start bonuses
- `commissions_car` - Car bonuses
- `commissions_vacation` - Vacation bonuses
- `commissions_pool` - Infinity Pool shares

**Shared Columns**:
- `distributor_id`, `month_year`, `amount_usd`, `status`, `paid_at`

**Payout Tracking**:
- All commissions linked to `payout_batches` via `payout_batch_id`
- Single source of truth for "has this been paid?"

---

## 🔄 MONTHLY COMMISSION RUN WORKFLOW

**Trigger**: Runs on 1st of each month for previous month's activity

**Steps**:
1. **Snapshot BV** - Lock all PBV/GBV totals for the month
2. **Evaluate Ranks** - Check qualifications, promote/demote with grace period
3. **Calculate Retail** - Already paid weekly, reconcile
4. **Calculate Matrix** - Loop through all 7 levels with compression
5. **Calculate Matching** - Based on matrix commission amounts
6. **Calculate Overrides** - Differential on lower ranks
7. **Calculate Infinity** - Level 8+ with circuit breaker
8. **Calculate Car/Vacation** - Qualify based on GBV + rank
9. **Calculate Pool** - Divide 3% of company BV by shares
10. **Create Payout Batch** - Aggregate all commissions per distributor
11. **Admin Approval** - Review batch, apply safeguards (55% cap)
12. **Generate ACH File** - Export NACHA format
13. **Mark Paid** - Update all commission records

**Safeguards Applied**:
- 55% payout ratio check (defer bonuses if exceeded)
- $25,000 matching cap per distributor
- $3,000 car bonus cap across all orgs
- Infinity circuit breaker (0.5% reduction if > 5% of BV)
- Retail customer ratio check (51% minimum)

---

## 🚀 IMPLEMENTATION ORDER

1. ✅ **Business Center Migration** (apply existing file)
2. ⏭️ **Products & Orders Migration** (build next)
3. ⏭️ **Commission Tables Migration** (after orders working)
4. ⏭️ **Calculation Functions** (after tables exist)
5. ⏭️ **Admin UIs** (parallel with functions)
6. ⏭️ **API Endpoints** (for frontend integration)
7. ⏭️ **Payout System** (ACH generation)
8. ⏭️ **Testing** (full monthly run with test data)

---

## 📝 NOTES FOR FUTURE

**Things to remember**:
- Business Center billing is Stripe subscription (separate from product purchases)
- Products can be one-time OR recurring (same products table, flag determines)
- Customers can upgrade to distributors (preserve order history)
- Commission calculations use COMPRESSED matrix (skip inactive reps)
- Sponsor ≠ Matrix Parent (sponsor enrolls, matrix parent is placement position)
- Speed multipliers on rank bonuses (2× if within 60 days)
- Diamond+ rank bonuses paid in 3 monthly installments
- SOT orgs are independent matrices (calculate separately, sum payouts)

**Data Flow**:
```
Order Created
  → BV assigned to order_items
  → If distributor order: add to PBV
  → Cascade up matrix: add to GBV
  → If subscription: schedule next billing
  → If new customer: trigger CAB

Monthly Run
  → Snapshot all BV totals
  → Evaluate ranks
  → Calculate 16 commission types
  → Create payout batch
  → Admin reviews
  → Generate ACH file
  → Mark all as paid
```

---

**Last Updated**: 2026-02-21
**Next Action**: Apply Business Center migration, then build Products & Orders system
