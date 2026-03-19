const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  // Check for sellag.sb@gmail.com in distributors
  const { data: distData, error: distError } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', 'sellag.sb@gmail.com');

  console.log('=== Distributors with sellag.sb@gmail.com ===');
  console.log('Count:', distData?.length || 0);
  if (distData) {
    distData.forEach((d, i) => {
      console.log(`\nRecord ${i + 1}:`);
      console.log('  ID:', d.id);
      console.log('  Rep #:', d.rep_number);
      console.log('  Name:', d.first_name, d.last_name);
      console.log('  Email:', d.email);
      console.log('  Slug:', d.slug);
      console.log('  Auth User ID:', d.auth_user_id);
      console.log('  Status:', d.status);
    });
  }

  // Check auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  console.log('\n=== Auth Users with sellag.sb@gmail.com ===');
  const matches = authData?.users?.filter(u => u.email === 'sellag.sb@gmail.com') || [];
  console.log('Count:', matches.length);
  matches.forEach((u, i) => {
    console.log(`\nAuth User ${i + 1}:`);
    console.log('  ID:', u.id);
    console.log('  Email:', u.email);
    console.log('  Email Confirmed:', u.email_confirmed_at ? 'YES' : 'NO');
    console.log('  Last Sign In:', u.last_sign_in_at || 'Never');
    console.log('  Created:', u.created_at);
  });
}

checkUser();
