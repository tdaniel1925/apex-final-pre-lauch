# Migration Testing Guide - 20260331000004

## Pre-Migration Checklist

- [ ] Backup production database
- [ ] Review migration file for syntax errors
- [ ] Verify all table names match requirements
- [ ] Verify all column names match requirements
- [ ] Verify all indexes are created
- [ ] Verify all RLS policies are created

## Local Testing (Docker Required)

### Step 1: Reset Local Database

```bash
cd "C:\dev\1 - Apex Pre-Launch Site"
supabase db reset
```

**Expected Output:**
- No errors
- All migrations applied successfully
- Database schema updated

### Step 2: Verify Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY table_name;
```

**Expected Result:** 7 rows (all table names)

### Step 3: Verify Indexes Exist

```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY tablename, indexname;
```

**Expected Result:** 37+ rows (includes primary key indexes)

### Step 4: Verify RLS Enabled

```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY tablename;
```

**Expected Result:** 7 rows, all with `rowsecurity = true`

### Step 5: Verify RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban',
    'ai_genealogy_recommendations',
    'usage_tracking',
    'commission_runs'
  )
ORDER BY tablename, policyname;
```

**Expected Result:** 16 rows (2+ per table)

### Step 6: Verify Triggers

```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'transactions',
    'commission_ledger',
    'client_onboarding',
    'fulfillment_kanban'
  )
ORDER BY event_object_table, trigger_name;
```

**Expected Result:** 4+ rows (updated_at triggers)

## Functional Testing

### Test 1: Insert Transaction

```sql
-- Insert a test distributor first (if not exists)
INSERT INTO distributors (id, auth_user_id, first_name, last_name, email, rep_number)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Test',
  'Distributor',
  'test@example.com',
  'TEST001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert a test transaction
INSERT INTO transactions (
  distributor_id,
  transaction_type,
  amount,
  product_slug,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'product_sale',
  99.99,
  'test-product',
  'completed'
)
RETURNING id, created_at, updated_at;
```

**Expected Result:** 1 row inserted with valid UUID, created_at, and updated_at

### Test 2: Insert Commission Ledger Entry

```sql
-- Insert a commission ledger entry
INSERT INTO commission_ledger (
  distributor_id,
  seller_id,
  commission_type,
  amount,
  commission_month
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'seller_commission',
  29.99,
  '2026-03'
)
RETURNING id, paid, created_at;
```

**Expected Result:** 1 row inserted with paid = false

### Test 3: Insert Client Onboarding

```sql
-- Insert client onboarding
INSERT INTO client_onboarding (
  distributor_id,
  client_email,
  client_name,
  product_slug,
  onboarding_date
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'client@example.com',
  'Test Client',
  'test-product',
  NOW() + INTERVAL '7 days'
)
RETURNING id, completed, meeting_link;
```

**Expected Result:** 1 row inserted with completed = false, meeting_link = default DialPad link

### Test 4: Insert Fulfillment Kanban

```sql
-- Insert fulfillment kanban entry
INSERT INTO fulfillment_kanban (
  distributor_id,
  client_name,
  client_email,
  product_slug,
  stage
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Client',
  'client@example.com',
  'test-product',
  'service_payment_made'
)
RETURNING id, stage, moved_to_current_stage_at;
```

**Expected Result:** 1 row inserted with stage = 'service_payment_made'

### Test 5: Insert AI Recommendation

```sql
-- Insert AI recommendation
INSERT INTO ai_genealogy_recommendations (
  distributor_id,
  recommendation_text,
  recommendation_type,
  priority,
  action_items
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'You are close to Bronze rank! Focus on recruiting 1 more distributor.',
  'rank_progress',
  'high',
  '["Recruit 1 more distributor", "Increase personal BV by 25"]'::jsonb
)
RETURNING id, dismissed, completed;
```

**Expected Result:** 1 row inserted with dismissed = false, completed = false

### Test 6: Insert Usage Tracking

```sql
-- Insert usage tracking
INSERT INTO usage_tracking (
  distributor_id,
  usage_type,
  amount,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai_chatbot_message',
  1.0,
  '{"model": "claude-sonnet-4", "tokens": 150}'::jsonb
)
RETURNING id, created_at;
```

**Expected Result:** 1 row inserted with valid timestamp

### Test 7: Insert Commission Run

```sql
-- Insert commission run
INSERT INTO commission_runs (
  commission_month,
  status,
  total_sales_amount,
  total_commissions_amount
) VALUES (
  '2026-03',
  'pending',
  10000.00,
  3000.00
)
RETURNING id, status, created_at;
```

**Expected Result:** 1 row inserted with status = 'pending'

### Test 8: Test Updated_at Trigger

```sql
-- Update a transaction and verify updated_at changes
UPDATE transactions
SET status = 'refunded'
WHERE distributor_id = '00000000-0000-0000-0000-000000000001'
RETURNING id, created_at, updated_at;
```

**Expected Result:** updated_at > created_at

### Test 9: Test RLS Policies (as distributor)

```sql
-- This should work (viewing own data)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001"}';

SELECT COUNT(*) FROM transactions
WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
```

**Expected Result:** Count matches inserted rows

### Test 10: Test Foreign Key Constraints

```sql
-- This should fail (invalid distributor_id)
INSERT INTO transactions (
  distributor_id,
  transaction_type,
  amount,
  status
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  'product_sale',
  99.99,
  'completed'
);
```

**Expected Result:** ERROR - foreign key constraint violation

## Cleanup

```sql
-- Delete test data
DELETE FROM usage_tracking WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM ai_genealogy_recommendations WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM fulfillment_kanban WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM client_onboarding WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM commission_ledger WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM transactions WHERE distributor_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM commission_runs WHERE commission_month = '2026-03';
-- Note: Do NOT delete the test distributor if it's used elsewhere
```

## Production Deployment

### Pre-Deployment

1. Create full database backup
2. Test migration on staging environment first
3. Verify all dependent code is ready (Waves 3-8)
4. Schedule maintenance window if needed

### Deployment

```bash
# Push to production
supabase db push --project-ref <your-project-ref>

# Or use migration command
supabase migration up --project-ref <your-project-ref>
```

### Post-Deployment

1. Verify all tables exist
2. Verify all indexes exist
3. Verify RLS policies are active
4. Run functional tests
5. Monitor error logs
6. Test API endpoints (Waves 3-8)

## Rollback Plan

If issues arise, rollback by:

1. Create new migration that drops all tables:

```sql
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS ai_genealogy_recommendations CASCADE;
DROP TABLE IF EXISTS fulfillment_kanban CASCADE;
DROP TABLE IF EXISTS client_onboarding CASCADE;
DROP TABLE IF EXISTS commission_ledger CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS commission_runs CASCADE;
```

2. Push rollback migration
3. Restore from backup if data loss occurred

## Status Checklist

- [ ] Local testing completed
- [ ] All functional tests passed
- [ ] RLS policies tested
- [ ] Foreign key constraints tested
- [ ] Updated_at triggers tested
- [ ] Staging deployment successful
- [ ] Production backup created
- [ ] Production deployment successful
- [ ] Post-deployment verification completed
- [ ] Waves 3-8 ready to proceed
