import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function grantSellaFreeAccess() {
  console.log('========================================');
  console.log('Granting Sella Daniel Free Business Center Access');
  console.log('========================================\n');

  // Find Sella
  const { data: sella } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .ilike('first_name', 'sella')
    .ilike('last_name', 'daniel')
    .single();

  console.log('Found Sella Daniel:');
  console.log(`  Email: ${sella.email}`);
  console.log(`  Distributor ID: ${sella.id}`);
  console.log('');

  // Get Business Center product
  const { data: bcProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', 'businesscenter')
    .single();

  console.log('Updating access record...');

  // Update the existing record to set access_type = 'free'
  const { data: updateResult, error: updateError } = await supabase
    .from('service_access')
    .update({
      access_type: 'free',
      status: 'active',
      expires_at: null
    })
    .eq('distributor_id', sella.id)
    .eq('product_id', bcProduct.id)
    .select();

  if (updateError) {
    console.error('❌ Error updating access:', updateError);
    return;
  }

  console.log('✅ Successfully updated access record!');
  console.log('');

  // Verify
  const { data: verification } = await supabase
    .from('service_access')
    .select('access_type, status, granted_at, expires_at')
    .eq('distributor_id', sella.id)
    .eq('product_id', bcProduct.id)
    .single();

  console.log('========================================');
  console.log('VERIFICATION:');
  console.log('========================================');
  console.log(`Access Type: ${verification.access_type}`);
  console.log(`Status: ${verification.status}`);
  console.log(`Granted At: ${verification.granted_at}`);
  console.log(`Expires At: ${verification.expires_at || 'Never (permanent)'}`);
  console.log('');

  if (verification.access_type === 'free') {
    console.log('✅ SUCCESS: Sella Daniel now has FREE Business Center access!');
    console.log('   - No $39 monthly fee');
    console.log('   - Full access to all Business Center features');
    console.log('   - No blocker screens');
  } else {
    console.log('❌ FAILED: Access type was not set correctly');
  }
  console.log('========================================');
}

grantSellaFreeAccess();
