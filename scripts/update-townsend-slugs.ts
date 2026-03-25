import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTownsendSlugs() {
  console.log('🔄 Updating Townsend slugs...\n');

  // Update Hannah Townsend's slug
  const { data: hannah, error: hannahError } = await supabase
    .from('distributors')
    .update({ slug: 'hannah', updated_at: new Date().toISOString() })
    .ilike('first_name', 'hannah')
    .ilike('last_name', 'townsend')
    .select('id, first_name, last_name, slug, email');

  if (hannahError) {
    console.error('❌ Error updating Hannah:', hannahError);
  } else if (hannah && hannah.length > 0) {
    console.log('✅ Updated Hannah Townsend:');
    console.log(`   Name: ${hannah[0].first_name} ${hannah[0].last_name}`);
    console.log(`   New slug: ${hannah[0].slug}`);
    console.log(`   Email: ${hannah[0].email}`);
    console.log(`   ID: ${hannah[0].id}\n`);
  } else {
    console.log('⚠️  Hannah Townsend not found\n');
  }

  // Update David Townsend's slug
  const { data: david, error: davidError } = await supabase
    .from('distributors')
    .update({ slug: 'david', updated_at: new Date().toISOString() })
    .ilike('first_name', 'david')
    .ilike('last_name', 'townsend')
    .select('id, first_name, last_name, slug, email');

  if (davidError) {
    console.error('❌ Error updating David:', davidError);
  } else if (david && david.length > 0) {
    console.log('✅ Updated David Townsend:');
    console.log(`   Name: ${david[0].first_name} ${david[0].last_name}`);
    console.log(`   New slug: ${david[0].slug}`);
    console.log(`   Email: ${david[0].email}`);
    console.log(`   ID: ${david[0].id}\n`);
  } else {
    console.log('⚠️  David Townsend not found\n');
  }

  console.log('✅ Slug updates complete!\n');
  console.log('New URLs:');
  console.log(`   Hannah: https://reachtheapex.net/hannah`);
  console.log(`   David: https://reachtheapex.net/david`);
}

updateTownsendSlugs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
