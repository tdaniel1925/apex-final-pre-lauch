const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSellaAuth() {
  console.log('=== Fixing Sella Daniel Auth Mismatch ===\n');

  const distributorId = '0b72d952-b556-4a09-8f86-7eae0299cfa4';
  const correctAuthUserId = '435a4b2c-e818-4e88-84ca-759a8a1e5786';

  console.log('Updating distributor auth_user_id...');
  console.log('  Distributor ID:', distributorId);
  console.log('  Correct Auth User ID:', correctAuthUserId);

  const { data, error } = await supabase
    .from('distributors')
    .update({
      auth_user_id: correctAuthUserId,
      updated_at: new Date().toISOString()
    })
    .eq('id', distributorId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating auth_user_id:', error);
    return;
  }

  console.log('\n✅ Auth user ID updated successfully!');
  console.log('\nUpdated Record:');
  console.log('  Name:', data.first_name, data.last_name);
  console.log('  Email:', data.email);
  console.log('  Slug:', data.slug);
  console.log('  Auth User ID:', data.auth_user_id);

  console.log('\n✅ Sella Daniel can now login with:');
  console.log('  Email: sellag.sb@gmail.com');
  console.log('  Password: 4Xkkilla1@');
  console.log('  OR Username: sellad');
}

fixSellaAuth();
