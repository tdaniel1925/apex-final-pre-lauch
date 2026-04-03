import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  { slug: 'pulsemarket', price_id: 'price_1TIClI0s7Jg0EdCp8kq6nbox' },
  { slug: 'pulseflow', price_id: 'price_1TIClI0s7Jg0EdCpLwhhiZuz' },
  { slug: 'pulsedrive', price_id: 'price_1TIClJ0s7Jg0EdCpWY9OpdFh' },
  { slug: 'pulsecommand', price_id: 'price_1TIClK0s7Jg0EdCpbAoW8JXA' },
  { slug: 'smartlock', price_id: 'price_1TIClL0s7Jg0EdCp58wU2LyJ' },
  { slug: 'businesscenter', price_id: 'price_1TIClL0s7Jg0EdCpywREFLha' },
];

async function updateDatabase() {
  console.log('\n🔄 Updating database with Stripe LIVE price IDs...\n');

  for (const { slug, price_id } of updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ stripe_price_id: price_id })
        .eq('slug', slug)
        .select();

      if (error) {
        console.error(`❌ Error updating ${slug}:`, error.message);
      } else {
        console.log(`✅ Updated ${slug}: ${price_id}`);
      }
    } catch (err) {
      console.error(`❌ Failed to update ${slug}:`, err.message);
    }
  }

  console.log('\n📊 Verifying updates...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('slug, name, stripe_price_id')
    .order('slug');

  if (error) {
    console.error('❌ Error fetching products:', error.message);
  } else {
    console.table(products);
    console.log('\n✅ All products updated successfully!\n');
  }
}

updateDatabase().catch(console.error);
