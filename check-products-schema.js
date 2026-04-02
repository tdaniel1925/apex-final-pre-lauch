require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('\n🔍 Checking products table schema...\n');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Available columns:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n📦 Sample product:');
    console.log(JSON.stringify(data[0], null, 2));
  }

  // Now get all Pulse products
  const { data: pulseProducts } = await supabase
    .from('products')
    .select('*')
    .in('slug', ['pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand']);

  console.log('\n' + '='.repeat(80));
  console.log('📊 All Pulse Products:\n');
  
  pulseProducts?.forEach(p => {
    console.log(`${p.name} (${p.slug})`);
    console.log(`  ID: ${p.id}`);
    if (p.stripe_price_id) console.log(`  Stripe Price ID: ${p.stripe_price_id}`);
    if (p.stripe_product_id) console.log(`  Stripe Product ID: ${p.stripe_product_id}`);
    console.log('');
  });
})();
