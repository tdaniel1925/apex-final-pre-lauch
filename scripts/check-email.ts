import { createServiceClient } from '../src/lib/supabase/service';

async function checkEmail() {
  const email = 'johnathonbunch@gmail.com';
  const supabase = createServiceClient();

  console.log('🔍 Checking if email exists:', email);
  console.log('');

  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', email);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('❌ NOT FOUND');
    console.log('');
    console.log(`${email} is NOT in the database.`);
    console.log('This email is available for signup.');
  } else {
    console.log('✅ FOUND');
    console.log('');
    const dist = data[0];
    console.log('Name:', dist.first_name, dist.last_name);
    console.log('Slug:', dist.slug);
    console.log('Email:', dist.email);
    console.log('Status:', dist.status);
    console.log('Created:', dist.created_at);
    console.log('Phone:', dist.phone_number || 'N/A');
    console.log('AI Phone:', dist.ai_phone_number || 'N/A');

    // Also check auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email === email);
    if (authUser) {
      console.log('\nAuth Status:');
      console.log('  Auth ID:', authUser.id);
      console.log('  Email Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('  Last Sign In:', authUser.last_sign_in_at || 'Never');
    }
  }
}

checkEmail();
