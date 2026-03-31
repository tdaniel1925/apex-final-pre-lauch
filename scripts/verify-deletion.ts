import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDeletion() {
  const emailToCheck = 'tdaniel@dasdsad.com';

  console.log(`\n🔍 Verifying deletion of: ${emailToCheck}\n`);

  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', emailToCheck)
    .single();

  if (error && error.code === 'PGRST116') {
    console.log(`✅ CONFIRMED: ${emailToCheck} has been completely deleted\n`);
    console.log(`   The account no longer exists in the system.\n`);
  } else if (data) {
    console.log(`❌ WARNING: Account still exists!\n`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.first_name} ${data.last_name}\n`);
  } else {
    console.log(`⚠️  Query error: ${error?.message}\n`);
  }

  // Check total count
  const { count } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total distributors in system: ${count}\n`);
}

verifyDeletion();
