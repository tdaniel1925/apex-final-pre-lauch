/**
 * Ensure transactions table exists
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function main() {
  console.log('📦 Checking transactions table...\n');

  try {
    // Check if table exists
    const { data: testData, error: testError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);

    if (!testError) {
      console.log('✅ transactions table already exists!');
      console.log(`   Found ${testData?.length || 0} test records.\n`);
      return;
    }

    if (!testError.message.includes('does not exist') && !testError.message.includes('not found')) {
      throw testError;
    }

    console.log('❌ Table does not exist.');
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
    console.log('    File: supabase/migrations/20260331000004_business_center_system.sql');
    console.log('\n   Or run this SQL:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'product_sale',
    'subscription_payment',
    'commission_payment',
    'refund'
  )),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  product_slug TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_distributor_id ON transactions(distributor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
