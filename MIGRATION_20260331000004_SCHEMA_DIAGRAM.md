# Database Schema Diagram - Business Center System

## Table Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUSINESS CENTER SYSTEM                              │
│                         Migration: 20260331000004                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   distributors   │ (existing table)
│  - id (PK)       │
│  - auth_user_id  │
│  - first_name    │
│  - last_name     │
│  - email         │
│  - rep_number    │
└────────┬─────────┘
         │
         │ (FK)
         ├───────────────────────────────────────────────────────────┐
         │                                                           │
         │                                                           │
         ▼                                                           ▼
┌──────────────────┐                                      ┌──────────────────┐
│  transactions    │                                      │ commission_runs  │
│  - id (PK)       │                                      │  - id (PK)       │
│  - distributor_id│◄──────┐                             │  - commission_   │
│  - trans_type    │       │ (FK)                        │    month (UQ)    │
│  - amount        │       │                             │  - status        │
│  - stripe_pi_id  │       │                             │  - total_sales   │
│  - stripe_sub_id │       │                             │  - total_bv      │
│  - product_slug  │       │                             │  - total_comm    │
│  - status        │       │                             │  - run_by        │
└────────┬─────────┘       │                             └──────────────────┘
         │                 │
         │ (FK)            │
         ▼                 │
┌──────────────────┐       │
│ commission_ledger│       │
│  - id (PK)       │       │
│  - distributor_id├───────┤
│  - seller_id     │◄──────┤ (FK)
│  - transaction_id│◄──────┘
│  - comm_type     │
│  - override_lvl  │
│  - amount        │
│  - bv_amount     │
│  - paid          │
│  - paid_at       │
│  - comm_run_id   │
│  - comm_month    │
└──────────────────┘

         │ (FK)
         ▼
┌──────────────────┐
│ client_onboarding│
│  - id (PK)       │
│  - distributor_id├───────┐
│  - transaction_id│       │ (FK)
│  - client_email  │       │
│  - client_name   │       │
│  - product_slug  │       │
│  - onboarding_dt │       │
│  - gcal_event_id │       │
│  - meeting_link  │       │
│  - completed     │       │
│  - no_show       │       │
│  - rescheduled_  │       │
│    from (self FK)│       │
└────────┬─────────┘       │
         │                 │
         │ (FK)            │
         ▼                 │
┌──────────────────┐       │
│fulfillment_kanban│       │
│  - id (PK)       │       │
│  - client_onb_id │       │
│  - distributor_id├───────┤
│  - client_name   │       │
│  - client_email  │       │
│  - product_slug  │       │
│  - stage (8)     │       │
│  - moved_to_at   │       │
│  - moved_by      │       │
│  - auto_trans    │       │
│  - stage_history │       │
└──────────────────┘       │
                           │
┌──────────────────────┐   │
│ai_genealogy_         │   │
│  recommendations     │   │
│  - id (PK)           │   │
│  - distributor_id    ├───┤
│  - recommendation_   │   │
│    text              │   │
│  - rec_type (6)      │   │
│  - priority (4)      │   │
│  - action_items      │   │
│  - related_dist_ids  │   │
│  - dismissed         │   │
│  - completed         │   │
│  - ai_model          │   │
└──────────────────────┘   │
                           │
┌──────────────────┐       │
│ usage_tracking   │       │
│  - id (PK)       │       │
│  - distributor_id├───────┘
│  - usage_type    │
│  - amount        │
│  - metadata      │
└──────────────────┘

┌──────────────┐
│   admins     │ (existing table)
│  - id (PK)   │
│  - auth_user │
│    _id       │
└──────┬───────┘
       │
       │ (FK)
       ▼
┌──────────────────┐
│fulfillment_kanban│
│  - moved_by      │
└──────────────────┘
       │
       │ (FK)
       ▼
┌──────────────────┐
│ commission_runs  │
│  - run_by        │
└──────────────────┘
```

## Table Details

### 1. transactions
**Purpose:** Log all financial transactions
- **PK:** id (UUID)
- **FK:** distributor_id → distributors.id (CASCADE)
- **Indexes:** 6
- **RLS:** Distributors (view own), Admins (full access)

### 2. commission_ledger
**Purpose:** Track all commission calculations
- **PK:** id (UUID)
- **FK:**
  - distributor_id → distributors.id (CASCADE)
  - seller_id → distributors.id (CASCADE)
  - transaction_id → transactions.id (CASCADE)
- **Indexes:** 7
- **RLS:** Distributors (view own), Admins (full access)

### 3. client_onboarding
**Purpose:** Track customer onboarding appointments
- **PK:** id (UUID)
- **FK:**
  - distributor_id → distributors.id (CASCADE)
  - transaction_id → transactions.id (SET NULL)
  - rescheduled_from → client_onboarding.id (self-reference)
- **Indexes:** 6
- **RLS:** Distributors (view + update own), Admins (full access)

### 4. fulfillment_kanban
**Purpose:** Track client fulfillment pipeline (8 stages)
- **PK:** id (UUID)
- **FK:**
  - client_onboarding_id → client_onboarding.id (CASCADE)
  - distributor_id → distributors.id (CASCADE)
  - moved_by → admins.id
- **Indexes:** 5
- **RLS:** Distributors (view own), Admins (full access)

### 5. ai_genealogy_recommendations
**Purpose:** AI-generated team insights
- **PK:** id (UUID)
- **FK:** distributor_id → distributors.id (CASCADE)
- **Indexes:** 5
- **RLS:** Distributors (view + update own), Admins (full access)

### 6. usage_tracking
**Purpose:** Track AI usage for limits
- **PK:** id (UUID)
- **FK:** distributor_id → distributors.id (CASCADE)
- **Indexes:** 5
- **RLS:** Distributors (view own), Admins (full access)

### 7. commission_runs
**Purpose:** Track monthly commission runs
- **PK:** id (UUID)
- **FK:** run_by → admins.id
- **UQ:** commission_month
- **Indexes:** 3
- **RLS:** All authenticated (view), Admins (full access)

## Data Flow

### Transaction Flow
```
1. Product Sale Created
   └─> INSERT INTO transactions
       └─> Trigger: Create commission_ledger entries
           └─> Trigger: Create client_onboarding (if applicable)
               └─> Trigger: Create fulfillment_kanban entry
```

### Commission Calculation Flow
```
1. Monthly Commission Run Initiated
   └─> INSERT INTO commission_runs (status = 'pending')
       └─> Calculate commissions
           └─> INSERT INTO commission_ledger (multiple entries)
               └─> UPDATE commission_runs (status = 'completed')
```

### Client Onboarding Flow
```
1. Product Purchased
   └─> INSERT INTO transactions
       └─> INSERT INTO client_onboarding
           └─> INSERT INTO fulfillment_kanban (stage = 'service_payment_made')
               └─> User schedules onboarding
                   └─> UPDATE client_onboarding (onboarding_date set)
                       └─> UPDATE fulfillment_kanban (stage = 'onboarding_date_set')
```

### AI Recommendations Flow
```
1. Daily Cron Job Runs
   └─> Analyze distributor data
       └─> INSERT INTO ai_genealogy_recommendations
           └─> User views recommendations
               └─> User dismisses or completes
                   └─> UPDATE ai_genealogy_recommendations
```

### Usage Tracking Flow
```
1. User Uses AI Feature
   └─> INSERT INTO usage_tracking
       └─> Daily aggregation query
           └─> Check against limits
               └─> Block if limit exceeded
```

## Cascade Behavior

### ON DELETE CASCADE
- transactions → commission_ledger (commission entries deleted)
- distributors → transactions (all transactions deleted)
- distributors → commission_ledger (all commissions deleted)
- distributors → client_onboarding (all onboardings deleted)
- distributors → fulfillment_kanban (all kanban entries deleted)
- distributors → ai_genealogy_recommendations (all recommendations deleted)
- distributors → usage_tracking (all usage records deleted)
- client_onboarding → fulfillment_kanban (kanban entry deleted)

### ON DELETE SET NULL
- transactions → client_onboarding.transaction_id (kept but unlinked)

## Indexes Summary

### Performance Indexes
- All foreign keys indexed
- Status fields indexed
- Date fields indexed (created_at, onboarding_date)
- Composite indexes for common queries

### Partial Indexes
- Unpaid commissions: `WHERE paid = false`
- Pending onboardings: `WHERE completed = false`
- Active fulfillment: `WHERE stage != 'service_completed'`
- Active recommendations: `WHERE dismissed = false AND completed = false`
- Stripe references: `WHERE field IS NOT NULL`

### Aggregation Indexes
- Daily usage: `DATE(created_at)`
- Monthly usage: `DATE_TRUNC('month', created_at)`

## Future Enhancements

Potential additions (not in this migration):

1. **transaction_items** - Line items for transactions
2. **fulfillment_notes** - Notes on kanban stages
3. **onboarding_recordings** - Store call recordings
4. **recommendation_actions** - Track completed action items
5. **usage_limits** - Store usage limits per tier
6. **commission_adjustments** - Manual commission adjustments

## Dependencies

This migration depends on existing tables:
- `distributors` (must exist)
- `admins` (must exist)

This migration is required for:
- Wave 3: Client Onboarding System API
- Wave 4: Fulfillment Kanban API
- Wave 5: AI Genealogy Recommendations Engine
- Wave 6: Usage Tracking System
- Wave 7: Commission Runs API
- Wave 8: Business Center Dashboard UI
