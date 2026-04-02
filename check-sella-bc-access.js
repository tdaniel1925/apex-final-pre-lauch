import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSellaAccess() {
  console.log('\n=== CHECKING SELLA DANIEL BUSINESS CENTER ACCESS ===\n');

  const { data: sella, error: sellaError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('email', 'sellag.sb@gmail.com')
    .single();

  if (sellaError) {
    console.error('Error finding Sella:', sellaError);
    return;
  }

  console.log('Found Sella:', sella.id, sella.email);

  const { data: bcProduct, error: bcError } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('slug', 'businesscenter')
    .single();

  if (bcError) {
    console.error('Error finding BC product:', bcError);
    return;
  }

  console.log('BC Product:', bcProduct.id, bcProduct.name);

  const { data: access, error: accessError } = await supabase
    .from('service_access')
    .select('*')
    .eq('distributor_id', sella.id)
    .eq('product_id', bcProduct.id);

  if (accessError) {
    console.error('Error checking access:', accessError);
    return;
  }

  console.log('\nAccess records:', JSON.stringify(access, null, 2));

  const { data: allAccess } = await supabase
    .from('service_access')
    .select('*, product:products(name, slug)')
    .eq('distributor_id', sella.id);

  console.log('\nAll access records:', JSON.stringify(allAccess, null, 2));
}

checkSellaAccess().catch(console.error);
