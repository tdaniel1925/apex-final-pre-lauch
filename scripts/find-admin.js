const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findAdmins() {
  console.log('Looking for admin users...\n');

  // Get distributors with admin_level >= 3
  const { data: admins, error } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, auth_user_id, admin_level, status')
    .gte('admin_level', 3)
    .order('admin_level', { ascending: false });

  if (error) {
    console.log('Error:', error.message);
    console.log('\nTrying to get all distributors...');
    const { data: all, error: err2 } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name')
      .limit(10);

    if (err2) {
      console.log('Error:', err2.message);
    } else {
      console.log('First 10 distributors:');
      all?.forEach(d => console.log('  -', d.email, '|', d.first_name, d.last_name));
    }
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('No admin users found');
    return;
  }

  console.log('Found', admins.length, 'admin(s):\n');
  for (const admin of admins) {
    console.log('Email:', admin.email);
    console.log('  Name:', admin.first_name, admin.last_name);
    console.log('  Admin Level:', admin.admin_level);
    console.log('  Status:', admin.status);
    console.log('  Auth User ID:', admin.auth_user_id || 'NONE');

    if (admin.auth_user_id) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(admin.auth_user_id);
      if (!authError && authUser) {
        console.log('  Auth Email:', authUser.user.email);
        console.log('  Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No');
        console.log('  Last Sign In:', authUser.user.last_sign_in_at || 'Never');
      }
    }
    console.log('');
  }
}

findAdmins().catch(console.error);
