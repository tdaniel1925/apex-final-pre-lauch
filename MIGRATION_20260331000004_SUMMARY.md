# Migration 20260331000004 - Business Center System

## Summary

This migration creates 7 new tables needed for the Business Center system, including transaction tracking, commission ledger, client onboarding, fulfillment pipeline, AI recommendations, usage tracking, and commission runs.

## Tables Created

### 1. **transactions**
- Purpose: Log all financial transactions (product sales, subscriptions, commission payments, refunds)
- Columns: 11
- Indexes: 6
- RLS Policies: 2 (distributor view + admin full access)

**Key Features:**
- Transaction types: product_sale, subscription_payment, commission_payment, refund
- Stripe integration (payment_intent_id, subscription_id)
- Status tracking: pending, completed, failed, refunded
- Flexible metadata field (JSONB)

### 2. **commission_ledger**
- Purpose: Track all commission calculations and payments
- Columns: 15
- Indexes: 7
- RLS Policies: 2 (distributor view + admin full access)

**Key Features:**
- Commission types: seller_commission, L1_enrollment, L2-L7_matrix, rank_bonus, bonus_pool, leadership_pool
- Override levels (1-7 for matrix commissions)
- Payment tracking (paid, paid_at, payment_method)
- Commission run tracking (run_id, commission_month)

### 3. **client_onboarding**
- Purpose: Track customer onboarding appointments
- Columns: 14
- Indexes: 6
- RLS Policies: 3 (distributor view + distributor update + admin full access)

**Key Features:**
- Client information (email, name, phone)
- Onboarding scheduling (date, duration)
- Google Calendar integration
- Completion and no-show tracking
- Rescheduling support

### 4. **fulfillment_kanban**
- Purpose: Track client fulfillment through 8-stage pipeline
- Columns: 12
- Indexes: 5
- RLS Policies: 2 (distributor view + admin full access)

**Key Features:**
- 8 stages: service_payment_made, onboarding_date_set, onboarding_complete, pages_being_built, social_media_proofs, content_approved, campaigns_launched, service_completed
- Stage history tracking (JSONB)
- Auto-transition support
- Admin move tracking

### 5. **ai_genealogy_recommendations**
- Purpose: Store daily AI-generated team insights and recommendations
- Columns: 12
- Indexes: 5
- RLS Policies: 3 (distributor view + distributor update + admin full access)

**Key Features:**
- Recommendation types: rank_progress, inactive_reps, sales_opportunity, team_growth, commission_optimization, training_needed
- Priority levels: low, medium, high, urgent
- Action items (JSONB array)
- Dismissal and completion tracking
- Related distributor tracking (UUID array)

### 6. **usage_tracking**
- Purpose: Track AI chatbot messages and voice minutes for usage limits
- Columns: 6
- Indexes: 5
- RLS Policies: 2 (distributor view + admin full access)

**Key Features:**
- Usage types: ai_chatbot_message, ai_voice_minute, api_call
- Amount tracking (decimal for minutes)
- Flexible metadata (JSONB)
- Daily and monthly aggregation indexes

### 7. **commission_runs**
- Purpose: Track monthly commission calculation runs
- Columns: 14
- Indexes: 3
- RLS Policies: 2 (all authenticated view + admin full access)

**Key Features:**
- Monthly tracking (commission_month: YYYY-MM format)
- Status tracking: pending, running, completed, failed, cancelled
- Summary statistics (total sales, BV, commissions, paid amounts)
- Error logging
- Run timing and admin tracking

## Statistics

- **Total Tables Created:** 7
- **Total Indexes Created:** 37
- **Total RLS Policies Created:** 16
- **Total Triggers Created:** 7 (updated_at triggers)

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

1. **Distributors** can view their own data (SELECT)
2. **Distributors** can update their own data for certain tables (UPDATE)
3. **Admins** have full access to all tables (ALL)
4. **Authenticated users** can view commission_runs (SELECT)

## Indexes

All tables have comprehensive indexes for:
- Foreign key lookups
- Status filtering
- Date range queries
- Composite indexes for common query patterns
- Partial indexes for specific conditions (e.g., unpaid commissions, pending onboardings)

## Updated_at Triggers

All tables with `updated_at` columns have automatic triggers that update the timestamp on row changes.

## Migration Testing

To test this migration:

```bash
# If Docker is running:
supabase db reset

# Or push to remote:
supabase db push

# Verify tables exist:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
#   'transactions',
#   'commission_ledger',
#   'client_onboarding',
#   'fulfillment_kanban',
#   'ai_genealogy_recommendations',
#   'usage_tracking',
#   'commission_runs'
# );
```

## Next Steps

This migration BLOCKS Waves 3-8. Once applied, the following can proceed:

- **Wave 3:** Client Onboarding System API
- **Wave 4:** Fulfillment Kanban API
- **Wave 5:** AI Genealogy Recommendations Engine
- **Wave 6:** Usage Tracking System
- **Wave 7:** Commission Runs API
- **Wave 8:** Business Center Dashboard UI

## File Location

`C:\dev\1 - Apex Pre-Launch Site\supabase\migrations\20260331000004_business_center_system.sql`

## Status

✅ Migration file created
✅ All 7 tables defined
✅ All 37 indexes created
✅ All 16 RLS policies implemented
✅ All 7 triggers added
✅ SQL syntax validated
⚠️ Local testing pending (Docker not running)

## Notes

- All tables use UUID primary keys with `gen_random_uuid()`
- All foreign keys have appropriate ON DELETE actions (CASCADE or SET NULL)
- All CHECK constraints use appropriate values
- All JSONB fields have default empty objects/arrays
- All timestamps use TIMESTAMPTZ for timezone support
- Comments added to all tables and important columns
