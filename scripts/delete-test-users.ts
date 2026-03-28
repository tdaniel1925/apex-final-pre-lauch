// =============================================
// Delete Test Users
// Remove test accounts from database
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const TEST_USERS_TO_DELETE = [
  'team5@test.apex.com',
  'team4@test.apex.com',
  'team3@test.apex.com',
  'team2@test.apex.com',
  'team1@test.apex.com',
  'test.distributor@apex.com',
  'test.personal.1773887814902@apextest.com',
  'rep-rep2b-1773878782063-3csyeo@example.com',
  'rep-rep1a-1773878778894-e18z5c@example.com',
  'rep-rep5-1773878725012-qkm1v9@example.com',
  'rep-rep4-1773878722114-2u3z1m@example.com',
  'rep-rep3-1773878719139-t00osr@example.com',
  'rep-rep2-1773878716406-2ov35a@example.com',
  'rep-rep1-1773878712617-gm9wj@example.com',
  'sponsor-echo-1773878708751-ixjukn@example.com',
  'test-1773878306756-ipq4vv@example.com',
  'test.personal.1773865190573@apextest.com',
  'test.personal.1773864050879@apextest.com',
  'sarah.johnson.test1773864046840@example.com',
  'test.personal.1773864031315@apextest.com',
  'john.smith.test1773864018033@example.com',
];

async function deleteTestUsers() {
  console.log('🗑️  Starting Test User Deletion...\n');
  console.log(`Total users to delete: ${TEST_USERS_TO_DELETE.length}\n`);

  const supabase = createServiceClient();
  let deleted = 0;
  let notFound = 0;
  let errors = 0;

  for (const email of TEST_USERS_TO_DELETE) {
    try {
      console.log(`Processing: ${email}`);

      // 1. Find the member record
      const { data: member, error: findError } = await supabase
        .from('members')
        .select('member_id, distributor_id, full_name')
        .eq('email', email)
        .single();

      if (findError || !member) {
        console.log(`  ⚠️  Not found in database`);
        notFound++;
        continue;
      }

      console.log(`  Found: ${member.full_name} (Member ID: ${member.member_id})`);

      // 2. Delete member (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('member_id', member.member_id);

      if (deleteError) {
        console.log(`  ❌ Delete failed: ${deleteError.message}`);
        errors++;
        continue;
      }

      // 3. Delete distributor record
      const { error: distError } = await supabase
        .from('distributors')
        .delete()
        .eq('id', member.distributor_id);

      if (distError) {
        console.log(`  ⚠️  Distributor delete warning: ${distError.message}`);
      }

      console.log(`  ✅ Deleted successfully`);
      deleted++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
      errors++;
    }

    console.log('');
  }

  console.log('='.repeat(60));
  console.log('📊 DELETION REPORT');
  console.log('='.repeat(60));
  console.log(`Total processed:     ${TEST_USERS_TO_DELETE.length}`);
  console.log(`✅ Deleted:          ${deleted}`);
  console.log(`⚠️  Not found:        ${notFound}`);
  console.log(`❌ Errors:           ${errors}`);
  console.log('='.repeat(60));
}

// Run script
deleteTestUsers().catch(console.error);
