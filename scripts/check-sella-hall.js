require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSellaHall() {
  console.log('='.repeat(70));
  console.log('SEARCHING FOR: Sella (any last name)');
  console.log('='.repeat(70));
  console.log();

  // Find anyone named Sella
  const { data: sellas, error: sellaError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, matrix_depth, matrix_position, sponsor_id, status')
    .ilike('first_name', '%sella%');

  if (sellaError) {
    console.log('❌ Error searching:', sellaError.message);
    return;
  }

  if (!sellas || sellas.length === 0) {
    console.log('❌ No one named Sella found');
    return;
  }

  console.log('✅ Found', sellas.length, 'person(s) named Sella:');
  sellas.forEach(s => {
    console.log(`   - ${s.first_name} ${s.last_name} (${s.slug})`);
  });
  console.log();

  // Use the first Sella found (or only one)
  const sella = sellas[0];

  console.log('✅ SELLA HALL FOUND:');
  console.log('   ID:', sella.id);
  console.log('   Name:', sella.first_name, sella.last_name);
  console.log('   Email:', sella.email);
  console.log('   Slug:', sella.slug);
  console.log('   Rep #:', sella.rep_number);
  console.log('   Status:', sella.status);
  console.log('   Matrix: Level', sella.matrix_depth, ', Position', sella.matrix_position);
  console.log('   Sponsor ID:', sella.sponsor_id);
  console.log();

  // Find people under Sella (sponsor_id = sella.id)
  console.log('='.repeat(70));
  console.log('PEOPLE UNDER SELLA HALL (sponsor relationship):');
  console.log('='.repeat(70));

  const { data: downline, error: downlineError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, matrix_depth, matrix_position, status')
    .eq('sponsor_id', sella.id)
    .order('created_at', { ascending: true });

  if (downlineError) {
    console.log('❌ Error fetching downline:', downlineError.message);
    return;
  }

  if (!downline || downline.length === 0) {
    console.log('⚠️  NO ONE under Sella Hall as sponsor');
  } else {
    console.log('✅ Found', downline.length, 'people under Sella Hall:');
    console.log();
    downline.forEach((person, idx) => {
      console.log(`   ${idx + 1}. ${person.first_name} ${person.last_name}`);
      console.log(`      Email: ${person.email}`);
      console.log(`      Slug: ${person.slug}`);
      console.log(`      Rep #: ${person.rep_number}`);
      console.log(`      Matrix: Level ${person.matrix_depth}, Position ${person.matrix_position}`);
      console.log(`      Status: ${person.status}`);
      console.log();
    });
  }

  // Specifically check for Hannah Townsend
  console.log('='.repeat(70));
  console.log('CHECKING: Hannah Townsend');
  const { data: hannah } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id, matrix_depth, matrix_position')
    .ilike('first_name', '%hannah%')
    .ilike('last_name', '%townsend%')
    .single();

  if (hannah) {
    console.log('✅ Hannah Townsend found');
    console.log('   Sponsor ID:', hannah.sponsor_id);
    console.log('   Under Sella?', hannah.sponsor_id === sella.id ? '✅ YES' : '❌ NO');
  } else {
    console.log('❌ Hannah Townsend NOT FOUND');
  }
  console.log();

  // Specifically check for Stacey Bunch
  console.log('CHECKING: Stacey Bunch');
  const { data: stacey } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id, matrix_depth, matrix_position')
    .ilike('first_name', '%stacey%')
    .ilike('last_name', '%bunch%')
    .single();

  if (stacey) {
    console.log('✅ Stacey Bunch found');
    console.log('   Sponsor ID:', stacey.sponsor_id);
    console.log('   Under Sella?', stacey.sponsor_id === sella.id ? '✅ YES' : '❌ NO');
  } else {
    console.log('❌ Stacey Bunch NOT FOUND');
  }
  console.log('='.repeat(70));
}

checkSellaHall()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
