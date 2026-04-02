import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTaunyaAccess() {
  console.log('🔍 Finding Taunya Bartlett...\n');

  // Find Taunya
  const { data: taunya, error: findError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .ilike('first_name', 'taun%')
    .single();

  if (findError || !taunya) {
    console.log('❌ Could not find Taunya Bartlett');
    console.log('Error:', findError?.message);
    return;
  }

  console.log(`✅ Found: ${taunya.first_name} ${taunya.last_name} (${taunya.email})`);
  console.log(`   Distributor ID: ${taunya.id}\n`);

  // Get Business Center product
  const { data: bcProduct } = await supabase
    .from('products')
    .select('id, name')
    .eq('slug', 'businesscenter')
    .single();

  if (!bcProduct) {
    console.log('❌ Could not find Business Center product');
    return;
  }

  console.log(`📦 Business Center Product ID: ${bcProduct.id}\n`);

  // Check if Taunya has BC access
  const { data: existingAccess } = await supabase
    .from('service_access')
    .select('*')
    .eq('distributor_id', taunya.id)
    .eq('product_id', bcProduct.id)
    .single();

  if (!existingAccess) {
    console.log('ℹ️  Taunya does not have Business Center access (nothing to remove)');
    return;
  }

  console.log('🗑️  Removing Business Center access...\n');

  // Delete the access record
  const { error: deleteError } = await supabase
    .from('service_access')
    .delete()
    .eq('distributor_id', taunya.id)
    .eq('product_id', bcProduct.id);

  if (deleteError) {
    console.log('❌ Error removing access:', deleteError.message);
    return;
  }

  console.log('✅ SUCCESS! Taunya Bartlett\'s free Business Center access has been removed.');
  console.log('   She will now need to pay $39/month to access Business Center.');
}

removeTaunyaAccess().then(() => {
  console.log('\n✅ Complete');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
