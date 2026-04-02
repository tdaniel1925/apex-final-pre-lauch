/**
 * Fix earnings_ledger constraint via JavaScript
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
  console.log('🔧 Fixing earnings_ledger constraint...\n');

  try {
    // Step 1: Drop old constraint
    console.log('Step 1: Dropping old constraint...');
    const dropSQL = `
      ALTER TABLE earnings_ledger
      DROP CONSTRAINT IF EXISTS earnings_ledger_earning_type_check;
    `;

    await supabase.rpc('exec_sql', { sql: dropSQL }).then(({ error }) => {
      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
    });

    console.log('✅ Old constraint dropped\n');

    // Step 2: Add new constraint
    console.log('Step 2: Adding new constraint with seller_commission...');
    const addSQL = `
      ALTER TABLE earnings_ledger
      ADD CONSTRAINT earnings_ledger_earning_type_check
      CHECK (earning_type IN (
        'seller_commission',
        'override',
        'rank_bonus',
        'bonus_pool',
        'leadership_pool',
        'fast_start_bonus',
        'generation_bonus',
        'business_center'
      ));
    `;

    const { error: addError } = await supabase.rpc('exec_sql', { sql: addSQL });

    if (addError) {
      throw addError;
    }

    console.log('✅ New constraint added\n');

    console.log('🎉 Success! The earnings_ledger table now accepts seller_commission type.\n');
    console.log('You can now run the test: npx tsx test-commission-system-complete.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Could not fix via script. Please run this SQL manually in Supabase:\n');
    console.log('-- Step 1:');
    console.log('ALTER TABLE earnings_ledger DROP CONSTRAINT IF EXISTS earnings_ledger_earning_type_check;\n');
    console.log('-- Step 2:');
    console.log(`ALTER TABLE earnings_ledger ADD CONSTRAINT earnings_ledger_earning_type_check CHECK (earning_type IN ('seller_commission', 'override', 'rank_bonus', 'bonus_pool', 'leadership_pool', 'fast_start_bonus', 'generation_bonus', 'business_center'));\n`);
    process.exit(1);
  }
}

main();
