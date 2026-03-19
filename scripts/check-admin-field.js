const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminField() {
  console.log('Checking admin field in distributors table...\n');

  // Get one record to see all fields
  const { data: sample, error } = await supabase
    .from('distributors')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  if (sample && sample.length > 0) {
    const fields = Object.keys(sample[0]);
    const adminFields = fields.filter(f => f.includes('admin') || f.includes('role'));

    console.log('Admin-related fields in distributors table:');
    adminFields.forEach(f => console.log('  -', f));

    console.log('\nNow checking for admin users...\n');

    // Check for is_admin = true
    const { data: adminUsers, error: adminError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name, is_admin, auth_user_id')
      .eq('is_admin', true);

    if (adminError) {
      console.log('Error checking is_admin:', adminError.message);
    } else if (adminUsers && adminUsers.length > 0) {
      console.log('Found', adminUsers.length, 'admin user(s):');
      adminUsers.forEach(u => {
        console.log('\nEmail:', u.email);
        console.log('  Name:', u.first_name, u.last_name);
        console.log('  is_admin:', u.is_admin);
        console.log('  Auth User ID:', u.auth_user_id || 'NONE ❌');
      });
    } else {
      console.log('No users with is_admin = true found');
    }
  }
}

checkAdminField().catch(console.error);
