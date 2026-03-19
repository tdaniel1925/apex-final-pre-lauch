// Quick script to check products table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsSchema() {
  // Get products with credit columns
  const { data: products, error: queryError } = await supabase
    .from('products')
    .select('name, slug, wholesale_price_cents, retail_price_cents, credit_pct, member_credits, retail_credits')
    .in('slug', ['pulseguard', 'pulseflow', 'pulsedrive', 'pulsecommand', 'smartlook', 'custom-business-center'])
    .order('name');

  if (queryError) {
    console.error('Query error:', queryError);
  } else {
    console.log('\n✅ Products with credit system:');
    console.log('='.repeat(80));
    console.table(products.map(p => ({
      Name: p.name,
      Wholesale: `$${(p.wholesale_price_cents / 100).toFixed(2)}`,
      Retail: `$${(p.retail_price_cents / 100).toFixed(2)}`,
      'Credit %': `${(p.credit_pct * 100).toFixed(0)}%`,
      'Member Credits': p.member_credits,
      'Retail Credits': p.retail_credits
    })));
  }
}

checkProductsSchema();
