import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTrentDaniel() {
  const emailToDelete = 'tdaniel@dasdsad.com';

  console.log(`\n🔍 Finding distributor with email: ${emailToDelete}\n`);

  // Find the distributor
  const { data: distributor, error: findError } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', emailToDelete)
    .single();

  if (findError || !distributor) {
    console.error('❌ Distributor not found:', findError?.message || 'No matching record');
    return;
  }

  console.log(`✅ Found distributor:\n`);
  console.log(`   ID:               ${distributor.id}`);
  console.log(`   Name:             ${distributor.first_name} ${distributor.last_name}`);
  console.log(`   Email:            ${distributor.email}`);
  console.log(`   Slug:             ${distributor.slug}`);
  console.log(`   Status:           ${distributor.status}`);
  console.log(`   Licensing Status: ${distributor.licensing_status}`);
  console.log(`   Auth User ID:     ${distributor.auth_user_id || 'N/A'}`);
  console.log(`   Created:          ${new Date(distributor.created_at).toLocaleString()}\n`);

  console.log(`⚠️  Deleting distributor and all associated data...\n`);

  // Delete the distributor (cascading deletes should handle related records)
  const { error: deleteError } = await supabase
    .from('distributors')
    .delete()
    .eq('id', distributor.id);

  if (deleteError) {
    console.error('❌ Failed to delete distributor:', deleteError.message);
    return;
  }

  console.log(`✅ Distributor record deleted from database\n`);

  // Delete auth user if exists
  if (distributor.auth_user_id) {
    const { error: authError } = await supabase.auth.admin.deleteUser(
      distributor.auth_user_id
    );

    if (authError && !authError.message.includes('not found')) {
      console.log(`⚠️  Could not delete auth user: ${authError.message}`);
    } else {
      console.log(`✅ Auth user deleted\n`);
    }
  }

  // Verify deletion
  const { data: check, error: checkError } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', emailToDelete)
    .single();

  if (checkError && checkError.code === 'PGRST116') {
    console.log(`✅ DELETION CONFIRMED: ${emailToDelete} no longer exists in system\n`);
  } else {
    console.log(`⚠️  Warning: Distributor may still exist in database\n`);
  }

  // Get new total count
  const { count } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total distributors remaining: ${count}\n`);
}

deleteTrentDaniel();
