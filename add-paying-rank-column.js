/**
 * Add paying_rank column to members table
 * Simple approach using Supabase service client
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
  console.log('📦 Adding paying_rank column to members table...\n');

  try {
    // Check if column already exists
    console.log('1. Checking if paying_rank column exists...');
    const { data: testData, error: testError } = await supabase
      .from('members')
      .select('paying_rank')
      .limit(1);

    if (!testError) {
      console.log('✅ paying_rank column already exists!');
      console.log('\nColumn is ready for use.');
      return;
    }

    if (!testError.message.includes('does not exist')) {
      throw testError;
    }

    console.log('❌ Column does not exist. Adding it now...\n');

    // Add the column using ALTER TABLE
    console.log('2. Running ALTER TABLE to add paying_rank column...');

    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        -- Add paying_rank column
        ALTER TABLE members
        ADD COLUMN IF NOT EXISTS paying_rank TEXT DEFAULT 'starter';

        -- Add constraint
        ALTER TABLE members
        DROP CONSTRAINT IF EXISTS members_paying_rank_check;

        ALTER TABLE members
        ADD CONSTRAINT members_paying_rank_check
          CHECK (paying_rank IN (
            'starter', 'bronze', 'silver', 'gold', 'platinum',
            'ruby', 'diamond', 'crown', 'elite'
          ));

        -- Initialize paying_rank = tech_rank for existing members
        UPDATE members
        SET paying_rank = tech_rank
        WHERE paying_rank IS NULL OR paying_rank = 'starter';

        -- Create index
        CREATE INDEX IF NOT EXISTS idx_members_paying_rank ON members(paying_rank);
      `
    });

    if (alterError) {
      console.error('❌ Failed to add column via RPC:', alterError.message);
      console.log('\n⚠️  Manual SQL execution required.');
      console.log('\nPlease run this SQL in Supabase SQL Editor:');
      console.log(`
-- Add paying_rank column
ALTER TABLE members
ADD COLUMN IF NOT EXISTS paying_rank TEXT DEFAULT 'starter';

-- Add constraint
ALTER TABLE members
ADD CONSTRAINT members_paying_rank_check
  CHECK (paying_rank IN (
    'starter', 'bronze', 'silver', 'gold', 'platinum',
    'ruby', 'diamond', 'crown', 'elite'
  ));

-- Initialize paying_rank = tech_rank
UPDATE members
SET paying_rank = tech_rank
WHERE paying_rank IS NULL OR paying_rank = 'starter';

-- Create index
CREATE INDEX IF NOT EXISTS idx_members_paying_rank ON members(paying_rank);
      `);
      process.exit(1);
    }

    console.log('✅ Column added successfully!\n');

    // Verify
    console.log('3. Verifying column...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('members')
      .select('paying_rank')
      .limit(1);

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    console.log('✅ paying_rank column verified and ready!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
