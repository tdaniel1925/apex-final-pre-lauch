import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function countTestDistributors() {
  // Get all distributors
  const { data: all, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, status, licensing_status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Identify test accounts
  const testAccounts = all?.filter(d => {
    const email = (d.email || '').toLowerCase();
    const firstName = (d.first_name || '').toLowerCase();
    const lastName = (d.last_name || '').toLowerCase();
    const slug = (d.slug || '').toLowerCase();

    return (
      email.includes('test') ||
      email.includes('@example.com') ||
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

  const realAccounts = all?.filter(d => !testAccounts.includes(d)) || [];

  console.log(`\n📊 DISTRIBUTOR BREAKDOWN:\n`);
  console.log(`Total Distributors:     ${all?.length || 0}`);
  console.log(`Test Accounts:          ${testAccounts.length}`);
  console.log(`Real/Production Users:  ${realAccounts.length}\n`);

  console.log(`\n🧪 TEST ACCOUNTS (${testAccounts.length}):\n`);
  testAccounts.forEach((d, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${d.first_name} ${d.last_name} (${d.email}) - ${d.slug}`);
  });

  console.log(`\n\n✅ REAL USERS (${realAccounts.length}):\n`);
  realAccounts.forEach((d, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${d.first_name} ${d.last_name} (${d.email}) - ${d.slug}`);
  });
}

countTestDistributors();
