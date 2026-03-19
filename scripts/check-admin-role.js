const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminRole() {
  console.log('Checking admin role for tdaniel@botmakers.ai...\n');

  // Check distributors table
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, email, is_admin, admin_role, auth_user_id')
    .eq('email', 'tdaniel@botmakers.ai')
    .single();

  if (distributor) {
    console.log('Distributor record:');
    console.log('- Email:', distributor.email);
    console.log('- Is Admin:', distributor.is_admin);
    console.log('- Admin Role:', distributor.admin_role || 'NOT SET');
  }

  // Check admins table
  const { data: admin } = await supabase
    .from('admins')
    .select('id, auth_user_id, role, created_at')
    .eq('auth_user_id', distributor.auth_user_id)
    .single();

  if (admin) {
    console.log('\nAdmins table record:');
    console.log('- Role:', admin.role);
    console.log('- Created:', admin.created_at);
  } else {
    console.log('\n❌ No record in admins table');
    console.log('Creating admin record...');

    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert({
        auth_user_id: distributor.auth_user_id,
        role: 'super_admin'
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating admin:', error.message);
    } else {
      console.log('✅ Admin record created with super_admin role');
    }
  }

  // Update distributor admin_role if needed
  if (distributor.admin_role !== 'super_admin') {
    console.log('\nUpdating distributor admin_role to super_admin...');
    const { error } = await supabase
      .from('distributors')
      .update({ admin_role: 'super_admin' })
      .eq('id', distributor.id);

    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('✅ Distributor admin_role updated to super_admin');
    }
  }
}

checkAdminRole();
