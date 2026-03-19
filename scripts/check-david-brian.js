require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDavidAndBrian() {
  console.log('='.repeat(70));
  console.log('SEARCHING FOR: David Townsend and Brian');
  console.log('='.repeat(70));
  console.log();

  // Find David Townsend
  console.log('1. CHECKING: David Townsend');
  console.log('-'.repeat(70));
  const { data: davidResults } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, sponsor_id, matrix_depth, matrix_position, status, created_at')
    .ilike('first_name', '%david%')
    .ilike('last_name', '%townsend%');

  if (!davidResults || davidResults.length === 0) {
    console.log('❌ David Townsend NOT FOUND');
  } else {
    davidResults.forEach((david, idx) => {
      console.log(`✅ David Townsend #${idx + 1}:`);
      console.log('   ID:', david.id);
      console.log('   Name:', david.first_name, david.last_name);
      console.log('   Email:', david.email);
      console.log('   Slug:', david.slug);
      console.log('   Rep #:', david.rep_number);
      console.log('   Sponsor ID:', david.sponsor_id || 'None');
      console.log('   Matrix: Level', david.matrix_depth, ', Position', david.matrix_position);
      console.log('   Status:', david.status);
      console.log('   Created:', new Date(david.created_at).toLocaleString());
      console.log();
    });
  }

  // Find Hannah Townsend (potential sponsor)
  console.log('2. CHECKING: Hannah Townsend (potential sponsor for David)');
  console.log('-'.repeat(70));
  const { data: hannah } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number')
    .ilike('first_name', '%hannah%')
    .ilike('last_name', '%townsend%')
    .single();

  if (hannah) {
    console.log('✅ Hannah Townsend found:');
    console.log('   ID:', hannah.id);
    console.log('   Name:', hannah.first_name, hannah.last_name);
    console.log('   Slug:', hannah.slug);
    console.log('   Rep #:', hannah.rep_number);
  } else {
    console.log('❌ Hannah Townsend NOT FOUND');
  }
  console.log();

  // Find Brian (signed up last night)
  console.log('3. CHECKING: Brian (signed up recently)');
  console.log('-'.repeat(70));

  // Get all Brians
  const { data: brianResults } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, sponsor_id, matrix_depth, matrix_position, status, created_at')
    .ilike('first_name', '%brian%')
    .order('created_at', { ascending: false });

  if (!brianResults || brianResults.length === 0) {
    console.log('❌ No one named Brian found');
  } else {
    console.log(`✅ Found ${brianResults.length} person(s) named Brian:`);
    console.log();
    brianResults.forEach((brian, idx) => {
      console.log(`   Brian #${idx + 1}:`);
      console.log('      ID:', brian.id);
      console.log('      Name:', brian.first_name, brian.last_name);
      console.log('      Email:', brian.email);
      console.log('      Slug:', brian.slug);
      console.log('      Rep #:', brian.rep_number);
      console.log('      Sponsor ID:', brian.sponsor_id || 'None');
      console.log('      Matrix: Level', brian.matrix_depth, ', Position', brian.matrix_position);
      console.log('      Status:', brian.status);
      console.log('      Created:', new Date(brian.created_at).toLocaleString());
      console.log();
    });
  }

  // Find Charles Potter (potential sponsor for Brian)
  console.log('4. CHECKING: Charles Potter (potential sponsor for Brian)');
  console.log('-'.repeat(70));
  const { data: charles } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number')
    .eq('slug', 'cpotter')
    .single();

  if (charles) {
    console.log('✅ Charles Potter found:');
    console.log('   ID:', charles.id);
    console.log('   Name:', charles.first_name, charles.last_name);
    console.log('   Slug:', charles.slug);
    console.log('   Rep #:', charles.rep_number);
  } else {
    console.log('❌ Charles Potter NOT FOUND');
  }
  console.log();

  console.log('='.repeat(70));
}

checkDavidAndBrian()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
