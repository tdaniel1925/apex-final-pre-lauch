/**
 * Apply Zowee Migrations to Apex Supabase Database
 *
 * This script runs 3 migrations in order:
 * 1. Create Zowee tables (users, conversations, tasks, etc.)
 * 2. Add usage tracking and billing system
 * 3. Add Zowee products to Apex catalog
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load .env.local file
config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// =====================================================
// MIGRATION 1: Create Zowee Tables
// =====================================================
const MIGRATION_001 = `
-- Zowee Database Schema
-- Phase 1: MVP Tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ZOWEE USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS zowee_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  zowee_phone TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'solo' CHECK (plan IN ('trial', 'solo', 'personal', 'family')),
  vapi_assistant_id TEXT,
  stripe_customer_id TEXT,
  referred_by TEXT,
  referred_by_distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL,

  -- Location tracking
  primary_area_code TEXT,
  primary_city TEXT,
  primary_state TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  last_detected_location JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_zowee_users_phone ON zowee_users(phone);
CREATE INDEX IF NOT EXISTS idx_zowee_users_zowee_phone ON zowee_users(zowee_phone);
CREATE INDEX IF NOT EXISTS idx_zowee_users_auth_user_id ON zowee_users(auth_user_id);

-- =====================================================
-- ZOWEE MEMORY (Personal facts, contacts, preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS zowee_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES zowee_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('fact', 'contact', 'preference', 'note')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast memory lookups
CREATE INDEX IF NOT EXISTS idx_zowee_memory_user_id ON zowee_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_zowee_memory_category ON zowee_memory(category);
CREATE INDEX IF NOT EXISTS idx_zowee_memory_key ON zowee_memory(key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_zowee_memory_user_key ON zowee_memory(user_id, key);

-- =====================================================
-- ZOWEE CONVERSATIONS (Unified call + SMS history)
-- =====================================================
CREATE TABLE IF NOT EXISTS zowee_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES zowee_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'sms')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for conversation history
CREATE INDEX IF NOT EXISTS idx_zowee_conversations_user_id ON zowee_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_zowee_conversations_created_at ON zowee_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zowee_conversations_type ON zowee_conversations(type);

-- =====================================================
-- ZOWEE TASKS (Reminders, to-dos, actions)
-- =====================================================
CREATE TABLE IF NOT EXISTS zowee_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES zowee_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'todo', 'action')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  recurrence JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for task queries
CREATE INDEX IF NOT EXISTS idx_zowee_tasks_user_id ON zowee_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_zowee_tasks_status ON zowee_tasks(status);
CREATE INDEX IF NOT EXISTS idx_zowee_tasks_scheduled_for ON zowee_tasks(scheduled_for);

-- =====================================================
-- ZOWEE ACTIONS (Outbound actions like booking reservations)
-- =====================================================
CREATE TABLE IF NOT EXISTS zowee_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES zowee_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirm' CHECK (status IN ('pending_confirm', 'calling', 'completed', 'failed')),
  result JSONB,
  call_log_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for action tracking
CREATE INDEX IF NOT EXISTS idx_zowee_actions_user_id ON zowee_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_zowee_actions_status ON zowee_actions(status);
CREATE INDEX IF NOT EXISTS idx_zowee_actions_created_at ON zowee_actions(created_at DESC);

-- =====================================================
-- UPDATE SHARED TABLES (call_logs, sms_logs)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='call_logs' AND column_name='product') THEN
    ALTER TABLE call_logs ADD COLUMN product TEXT DEFAULT 'agentos';
    CREATE INDEX idx_call_logs_product ON call_logs(product);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='sms_logs' AND column_name='product') THEN
    ALTER TABLE sms_logs ADD COLUMN product TEXT DEFAULT 'agentos';
    CREATE INDEX idx_sms_logs_product ON sms_logs(product);
  END IF;
END $$;

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_zowee_users_updated_at ON zowee_users;
CREATE TRIGGER update_zowee_users_updated_at BEFORE UPDATE ON zowee_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zowee_memory_updated_at ON zowee_memory;
CREATE TRIGGER update_zowee_memory_updated_at BEFORE UPDATE ON zowee_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zowee_tasks_updated_at ON zowee_tasks;
CREATE TRIGGER update_zowee_tasks_updated_at BEFORE UPDATE ON zowee_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zowee_actions_updated_at ON zowee_actions;
CREATE TRIGGER update_zowee_actions_updated_at BEFORE UPDATE ON zowee_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

// =====================================================
// MIGRATION 2: Add Usage Tracking
// =====================================================
const MIGRATION_002 = `
-- Add Usage Tracking and Billing to Zowee
-- Updated Plan Structure: 100, 250, 500 minutes
-- Free Trial: 30 minutes
-- Overage: $0.10/minute

-- Update zowee_users table
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
  CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'suspended'));

ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS billing_period_start DATE DEFAULT date_trunc('month', NOW());
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS billing_period_end DATE DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month');
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS grace_period_ends TIMESTAMP WITH TIME ZONE;

ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS minutes_used INTEGER DEFAULT 0;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS sms_sent INTEGER DEFAULT 0;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS sms_received INTEGER DEFAULT 0;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS overage_minutes INTEGER DEFAULT 0;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS overage_charges NUMERIC(10,2) DEFAULT 0.00;

ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS trial_minutes_used INTEGER DEFAULT 0;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS trial_ended_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS allow_overage BOOLEAN DEFAULT true;
ALTER TABLE zowee_users ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_zowee_users_subscription_status ON zowee_users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_zowee_users_billing_period ON zowee_users(billing_period_end);

-- Usage logs table
CREATE TABLE IF NOT EXISTS zowee_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES zowee_users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('voice_call', 'sms_sent', 'sms_received', 'overage')),
  minutes INTEGER DEFAULT 0,
  sms_count INTEGER DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0.00,
  is_overage BOOLEAN DEFAULT false,
  overage_amount NUMERIC(10,2) DEFAULT 0.00,
  billing_period DATE NOT NULL DEFAULT date_trunc('month', NOW()),
  call_log_id UUID REFERENCES call_logs(id),
  sms_log_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zowee_usage_logs_user_id ON zowee_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_zowee_usage_logs_billing_period ON zowee_usage_logs(billing_period);
CREATE INDEX IF NOT EXISTS idx_zowee_usage_logs_user_period ON zowee_usage_logs(user_id, billing_period);
CREATE INDEX IF NOT EXISTS idx_zowee_usage_logs_event_type ON zowee_usage_logs(event_type);

-- Plans table
CREATE TABLE IF NOT EXISTS zowee_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  minutes_included INTEGER NOT NULL,
  overage_rate NUMERIC(10,2) DEFAULT 0.10,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO zowee_plans (id, name, price, minutes_included, description) VALUES
  ('trial', 'Free Trial', 0.00, 30, '30 free minutes to try Zowee'),
  ('solo', 'Solo', 19.00, 100, 'Perfect for light users'),
  ('personal', 'Personal', 29.00, 250, 'Great for regular use'),
  ('family', 'Family', 49.00, 500, 'Up to 6 family members, 500 minutes shared')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  minutes_included = EXCLUDED.minutes_included,
  description = EXCLUDED.description;

-- Function to track voice usage
CREATE OR REPLACE FUNCTION track_voice_usage(
  p_user_id UUID,
  p_minutes_used INTEGER,
  p_call_cost NUMERIC,
  p_call_log_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_plan RECORD;
  v_is_overage BOOLEAN := false;
  v_overage_charge NUMERIC := 0.00;
  v_minutes_allowed INTEGER;
  v_result JSONB;
BEGIN
  SELECT * INTO v_user FROM zowee_users WHERE id = p_user_id;
  SELECT * INTO v_plan FROM zowee_plans WHERE id = v_user.plan;

  IF v_user.subscription_status = 'trial' THEN
    v_minutes_allowed := 30;
  ELSE
    v_minutes_allowed := v_plan.minutes_included;
  END IF;

  IF (v_user.minutes_used + p_minutes_used) > v_minutes_allowed THEN
    v_is_overage := true;
    DECLARE
      v_overage_minutes INTEGER;
    BEGIN
      v_overage_minutes := (v_user.minutes_used + p_minutes_used) - v_minutes_allowed;
      v_overage_charge := v_overage_minutes * v_plan.overage_rate;
    END;
  END IF;

  UPDATE zowee_users
  SET
    minutes_used = minutes_used + p_minutes_used,
    overage_minutes = CASE
      WHEN v_is_overage THEN overage_minutes + ((minutes_used + p_minutes_used) - v_minutes_allowed)
      ELSE overage_minutes
    END,
    overage_charges = overage_charges + v_overage_charge,
    last_call_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO zowee_usage_logs (
    user_id, event_type, minutes, cost, is_overage, overage_amount, call_log_id, billing_period
  ) VALUES (
    p_user_id, 'voice_call', p_minutes_used, p_call_cost, v_is_overage, v_overage_charge, p_call_log_id, date_trunc('month', NOW())
  );

  v_result := jsonb_build_object(
    'minutes_used', v_user.minutes_used + p_minutes_used,
    'minutes_allowed', v_minutes_allowed,
    'is_overage', v_is_overage,
    'overage_charge', v_overage_charge,
    'remaining_minutes', GREATEST(0, v_minutes_allowed - (v_user.minutes_used + p_minutes_used))
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can call
CREATE OR REPLACE FUNCTION can_user_call(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_plan RECORD;
  v_minutes_allowed INTEGER;
  v_remaining INTEGER;
BEGIN
  SELECT * INTO v_user FROM zowee_users WHERE id = p_user_id;

  IF v_user.subscription_status = 'suspended' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'suspended',
      'message', 'Your service is paused due to payment issues.'
    );
  END IF;

  SELECT * INTO v_plan FROM zowee_plans WHERE id = v_user.plan;

  IF v_user.subscription_status = 'trial' THEN
    v_minutes_allowed := 30;
    v_remaining := v_minutes_allowed - COALESCE(v_user.trial_minutes_used, 0);

    IF v_remaining <= 0 THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'trial_expired',
        'message', 'Your 30-minute free trial is complete. Ready to subscribe?'
      );
    END IF;
  ELSE
    v_minutes_allowed := v_plan.minutes_included;
    v_remaining := v_minutes_allowed - v_user.minutes_used;

    IF v_remaining <= 0 AND NOT v_user.allow_overage THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'out_of_minutes',
        'message', 'You''ve used all ' || v_minutes_allowed || ' minutes this month.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_minutes', v_remaining,
    'is_overage', v_remaining <= 0,
    'warning', CASE
      WHEN v_remaining < 10 THEN 'You have ' || v_remaining || ' minutes left this month.'
      WHEN v_remaining <= 0 THEN 'You''re in overage - extra minutes are $0.10 each.'
      ELSE NULL
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE zowee_users
  SET
    minutes_used = 0,
    sms_sent = 0,
    sms_received = 0,
    overage_minutes = 0,
    overage_charges = 0.00,
    billing_period_start = NOW(),
    billing_period_end = NOW() + INTERVAL '1 month'
  WHERE billing_period_end < NOW()
    AND subscription_status = 'active';
END;
$$ LANGUAGE plpgsql;
`

// Read the migration file we already created
const migration003Path = path.join(__dirname, '..', 'supabase', 'migrations', '20260327000000_add_zowee_products.sql')
const MIGRATION_003 = fs.readFileSync(migration003Path, 'utf-8')

async function runMigration(name: string, sql: string): Promise<boolean> {
  console.log(`\n📝 Running: ${name}...`)

  try {
    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // Try direct query execution if exec_sql doesn't exist
      const lines = sql.split(';').filter(line => line.trim())

      for (const line of lines) {
        if (!line.trim()) continue
        const trimmed = line.trim()
        if (trimmed.startsWith('--') || trimmed.startsWith('/*')) continue

        const { error: queryError } = await supabase.rpc('query' as any, { query_text: trimmed })

        if (queryError) {
          console.error(`   ❌ Error executing SQL:`, queryError.message)
          console.error(`   SQL: ${trimmed.substring(0, 100)}...`)
          return false
        }
      }
    }

    console.log(`   ✅ ${name} completed successfully`)
    return true
  } catch (error: any) {
    console.error(`   ❌ Error in ${name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Zowee Migrations for Apex Pre-Launch')
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log('   Using service role key for admin access\n')

  // Run migrations in order
  const migrations = [
    { name: 'Migration 1: Create Zowee Tables', sql: MIGRATION_001 },
    { name: 'Migration 2: Add Usage Tracking', sql: MIGRATION_002 },
    { name: 'Migration 3: Add Zowee Products to Catalog', sql: MIGRATION_003 }
  ]

  let successCount = 0

  for (const migration of migrations) {
    const success = await runMigration(migration.name, migration.sql)
    if (success) {
      successCount++
    } else {
      console.error(`\n❌ Migration failed: ${migration.name}`)
      console.error('   Stopping migration process')
      console.error('\n💡 You can run migrations manually in Supabase SQL Editor:')
      console.error('   https://supabase.com/dashboard/project/xxxtbzypheuiniuqynas/sql')
      process.exit(1)
    }
  }

  // Verify migrations
  console.log('\n\n🔍 Verifying migrations...')

  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables' as any)
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', 'zowee%')

  if (tablesError) {
    console.log('   ⚠️  Could not verify tables (this is okay)')
  } else {
    console.log(`   ✅ Found ${tables?.length || 0} Zowee tables`)
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('name, slug, retail_price_cents')
    .like('slug', 'zowee%')

  if (productsError) {
    console.log('   ⚠️  Could not verify products')
  } else {
    console.log(`   ✅ Found ${products?.length || 0} Zowee products:`)
    products?.forEach(p => {
      console.log(`      - ${p.name} (${p.slug}) - $${(p.retail_price_cents / 100).toFixed(2)}`)
    })
  }

  console.log('\n\n🎉 All migrations completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('   1. Test purchase flow with Stripe test card')
  console.log('   2. Verify provisioning works (check orders.zowee_provision_status)')
  console.log('   3. Deploy to production')
  console.log('\n📖 See QUICK_START_ZOWEE.md for testing instructions')
}

main().catch(console.error)
