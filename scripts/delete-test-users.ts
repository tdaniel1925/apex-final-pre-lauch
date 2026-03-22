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

const DRY_RUN = process.env.DRY_RUN === 'true';

async function deleteTestUsers() {
  console.log('\n=== DELETE TEST USERS ===\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Find test users by email patterns
  const { data: testUsers, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status')
    .eq('status', 'active')
    .or(
      'email.ilike.%test%,' +
      'email.ilike.%@example.com%,' +
      'email.ilike.%@apextest.com%,' +
      'email.ilike.rep-rep%,' +
      'email.ilike.team%@test.apex.com'
    );

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!testUsers || testUsers.length === 0) {
    console.log('✅ No test users found to delete.');
    return;
  }

  console.log(`Found ${testUsers.length} test users to delete:\n`);

  testUsers.forEach((u, i) => {
    console.log(`${i + 1}. ${u.first_name} ${u.last_name} (${u.email})`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  if (DRY_RUN) {
    console.log('ℹ️  This was a DRY RUN. To actually delete, run:');
    console.log('   npx tsx scripts/delete-test-users.ts\n');
    return;
  }

  // Actually delete (set status to 'deleted')
  let successCount = 0;
  let failCount = 0;

  for (const user of testUsers) {
    const { error: deleteError } = await supabase
      .from('distributors')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (deleteError) {
      console.log(`❌ Failed to delete ${user.first_name} ${user.last_name}: ${deleteError.message}`);
      failCount++;
    } else {
      console.log(`✅ Deleted ${user.first_name} ${user.last_name}`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Successfully deleted: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total processed: ${testUsers.length}\n`);
}

deleteTestUsers();
