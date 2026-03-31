import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestDistributors() {
  console.log('\n🔍 Identifying test distributors...\n');

  // Get all distributors
  const { data: all, error } = await supabase
    .from('distributors')
    .select('id, auth_user_id, first_name, last_name, email, slug')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching distributors:', error);
    return;
  }

  // Identify test accounts (same logic as count script)
  const testAccounts = all?.filter(d => {
    const email = (d.email || '').toLowerCase();
    const firstName = (d.first_name || '').toLowerCase();
    const lastName = (d.last_name || '').toLowerCase();
    const slug = (d.slug || '').toLowerCase();

    return (
      email.includes('test') ||
      email.includes('@example.com') ||
      email.includes('@apextest.local') ||
      email.includes('@apextest.com') ||
      email.includes('autopilot-test') ||
      email.includes('flyer-test') ||
      email.includes('crm-test') ||
      firstName.includes('test') ||
      lastName.includes('test') ||
      slug.includes('test-') ||
      slug.startsWith('test') ||
      slug.includes('rep-') ||
      slug.includes('sponsor-')
    );
  }) || [];

  console.log(`📊 Found ${testAccounts.length} test accounts to delete:\n`);
  testAccounts.forEach((d, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${d.first_name} ${d.last_name} (${d.email})`);
  });

  console.log(`\n⚠️  Deleting ${testAccounts.length} test distributors...\n`);

  // Delete each test distributor
  let deletedCount = 0;
  let failedCount = 0;

  for (const account of testAccounts) {
    const { error: deleteError } = await supabase
      .from('distributors')
      .delete()
      .eq('id', account.id);

    if (deleteError) {
      console.error(`❌ Failed to delete ${account.email}:`, deleteError.message);
      failedCount++;
    } else {
      console.log(`✅ Deleted: ${account.first_name} ${account.last_name} (${account.email})`);
      deletedCount++;
    }

    // Also delete auth user if exists
    if (account.auth_user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(
        account.auth_user_id
      );

      if (authError && !authError.message.includes('not found')) {
        console.log(`   ⚠️  Could not delete auth user: ${authError.message}`);
      }
    }
  }

  console.log(`\n📊 DELETION SUMMARY:`);
  console.log(`✅ Successfully deleted: ${deletedCount}`);
  console.log(`❌ Failed to delete: ${failedCount}`);
  console.log(`\n✨ Done!\n`);

  // Verify deletion
  const { count: remainingCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Remaining distributors in system: ${remainingCount}\n`);
}

deleteTestDistributors();
