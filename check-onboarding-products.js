require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: products } = await supabase
    .from('products')
    .select('slug, name, requires_onboarding, onboarding_duration_minutes')
    .eq('is_active', true);

  console.log('Products with onboarding requirements:');
  console.log('=====================================\n');

  products.forEach(p => {
    console.log(`${p.name} (${p.slug})`);
    console.log(`  Requires Onboarding: ${p.requires_onboarding ? 'YES' : 'NO'}`);
    console.log(`  Duration: ${p.onboarding_duration_minutes || 30} minutes`);
    console.log('');
  });
})();
