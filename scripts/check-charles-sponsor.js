require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCharlesSponsor() {
  console.log('='.repeat(60));
  console.log('CHECKING CHARLES POTTER SPONSOR');
  console.log('='.repeat(60));
  console.log();

  const { data: charles } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number, sponsor_id')
    .eq('slug', 'cpotter')
    .single();

  if (!charles) {
    console.log('❌ Charles Potter not found');
    return;
  }

  console.log('✅ Charles Potter:');
  console.log('   ID:', charles.id);
  console.log('   Name:', charles.first_name, charles.last_name);
  console.log('   Slug:', charles.slug);
  console.log('   Rep #:', charles.rep_number);
  console.log('   Sponsor ID:', charles.sponsor_id || 'None');
  console.log();

  if (charles.sponsor_id) {
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, rep_number, is_master')
      .eq('id', charles.sponsor_id)
      .single();

    if (sponsor) {
      console.log('✅ Sponsor:');
      console.log('   Name:', sponsor.first_name, sponsor.last_name);
      console.log('   Slug:', sponsor.slug);
      console.log('   Rep #:', sponsor.rep_number);
      console.log('   Is Master:', sponsor.is_master ? 'Yes (Apex Vision)' : 'No');
    }
  } else {
    console.log('⚠️  Charles has NO sponsor (NULL)');
  }

  console.log();
  console.log('='.repeat(60));
}

checkCharlesSponsor()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
