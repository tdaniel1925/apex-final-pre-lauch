const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('Reinstating 14-day Business Center trial...');

  const { data, error } = await supabase
    .from('products')
    .update({ trial_days: 14 })
    .eq('slug', 'businesscenter')
    .select();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ Success! Business Center now has 14-day trial');
  console.log('Updated product:', data);
}

applyMigration();
