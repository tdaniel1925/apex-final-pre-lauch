require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findAllTestUsers() {
  console.log('='.repeat(70));
  console.log('FINDING ALL TEST AND PLACEHOLDER USERS');
  console.log('='.repeat(70));
  console.log();

  // Get all distributors
  const { data: allDistributors } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, auth_user_id, is_master')
    .order('rep_number', { ascending: true });

  if (!allDistributors) {
    console.log('❌ Could not fetch distributors');
    return;
  }

  console.log(`Total distributors in system: ${allDistributors.length}`);
  console.log();

  // Filter test/placeholder users
  const testUsers = allDistributors.filter(d => {
    if (d.is_master) return false; // Don't include Apex Vision

    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    const email = (d.email || '').toLowerCase();
    const slug = (d.slug || '').toLowerCase();

    // Check for test patterns
    const isTest =
      fullName.includes('test') ||
      email.includes('test') ||
      slug.includes('test') ||
      fullName.includes('placeholder') ||
      fullName.includes('doe') ||
      fullName.includes('johnny be goode') ||
      email.includes('example.com') ||
      email.includes('tester') ||
      slug.includes('placeholder');

    return isTest;
  });

  console.log('='.repeat(70));
  console.log(`FOUND ${testUsers.length} TEST/PLACEHOLDER USERS:`);
  console.log('='.repeat(70));
  console.log();

  testUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.first_name} ${user.last_name} (Rep #${user.rep_number})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Slug: ${user.slug}`);
    console.log(`   ID: ${user.id}`);
    console.log();
  });

  // Also list REAL users for comparison
  const realUsers = allDistributors.filter(d => {
    if (d.is_master) return false;
    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    const email = (d.email || '').toLowerCase();
    const slug = (d.slug || '').toLowerCase();

    const isTest =
      fullName.includes('test') ||
      email.includes('test') ||
      slug.includes('test') ||
      fullName.includes('placeholder') ||
      fullName.includes('doe') ||
      fullName.includes('johnny be goode') ||
      email.includes('example.com') ||
      email.includes('tester') ||
      slug.includes('placeholder');

    return !isTest;
  });

  console.log('='.repeat(70));
  console.log(`REAL USERS (${realUsers.length}):`);
  console.log('='.repeat(70));
  console.log();

  realUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.first_name} ${user.last_name} (Rep #${user.rep_number})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Slug: ${user.slug}`);
    console.log();
  });

  console.log('='.repeat(70));
  console.log('SUMMARY:');
  console.log(`Total: ${allDistributors.length}`);
  console.log(`Test/Placeholder: ${testUsers.length}`);
  console.log(`Real Users: ${realUsers.length}`);
  console.log(`Apex Vision: 1 (master)`);
  console.log('='.repeat(70));
}

findAllTestUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
