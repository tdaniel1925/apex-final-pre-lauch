/**
 * Verify BV Migration Success
 *
 * Checks if all BV tracking fields were added successfully
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('');
  console.log('🔍 Verifying BV Migration...');
  console.log('');

  let allChecksPass = true;

  // Check 1: Verify members table has BV columns
  console.log('1️⃣  Checking members table columns...');

  const { data: membersColumns, error: membersError } = await supabase
    .rpc('get_table_columns', { table_name: 'members' })
    .then(async () => {
      // Fallback: Try to select the columns
      const { data, error } = await supabase
        .from('members')
        .select('member_id, personal_bv_monthly, group_bv_monthly')
        .limit(1);

      return { data, error };
    });

  if (membersError) {
    console.log('   ❌ Error checking members table:', membersError.message);
    allChecksPass = false;
  } else {
    console.log('   ✅ Members table has BV columns');
  }

  // Check 2: Verify calculate_bv_for_product function exists
  console.log('2️⃣  Checking calculate_bv_for_product() function...');

  const { data: funcData, error: funcError } = await supabase
    .rpc('calculate_bv_for_product', {
      p_product_name: 'PulseGuard',
      p_price_paid: 59
    });

  if (funcError) {
    console.log('   ❌ Function not found:', funcError.message);
    allChecksPass = false;
  } else {
    console.log('   ✅ Function exists and returns:', funcData);
    if (funcData === 27) {
      console.log('   ✅ BV calculation correct! (59 × 0.4606 ≈ 27)');
    } else {
      console.log('   ⚠️  Expected BV: 27, Got:', funcData);
    }
  }

  // Check 3: Test Business Center exception
  console.log('3️⃣  Testing Business Center BV (should be 39)...');

  const { data: bcBV, error: bcError } = await supabase
    .rpc('calculate_bv_for_product', {
      p_product_name: 'Business Center',
      p_price_paid: 39
    });

  if (bcError) {
    console.log('   ❌ Error:', bcError.message);
    allChecksPass = false;
  } else if (bcBV === 39) {
    console.log('   ✅ Business Center BV correct! (39)');
  } else {
    console.log('   ❌ Expected: 39, Got:', bcBV);
    allChecksPass = false;
  }

  // Check 4: Count unplaced members
  console.log('4️⃣  Counting unplaced members...');

  const { count: unplacedCount, error: countError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .is('matrix_parent_id', null)
    .eq('status', 'active');

  if (countError) {
    console.log('   ❌ Error:', countError.message);
  } else {
    console.log(`   ℹ️  Found ${unplacedCount} unplaced members`);
    if (unplacedCount && unplacedCount > 0) {
      console.log(`   📋 Ready to run: npx ts-node scripts/migrate-unplaced-distributors.ts`);
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (allChecksPass) {
    console.log('✅ MIGRATION SUCCESSFUL!');
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Run migration script (dry-run first):');
    console.log('     DRY_RUN=true npx ts-node scripts/migrate-unplaced-distributors.ts');
    console.log('');
    console.log('  2. If dry-run looks good, apply:');
    console.log('     npx ts-node scripts/migrate-unplaced-distributors.ts');
  } else {
    console.log('❌ MIGRATION INCOMPLETE');
    console.log('');
    console.log('Some checks failed. Please review errors above.');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

verifyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
