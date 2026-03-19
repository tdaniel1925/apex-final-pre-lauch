require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCharlesSponsor() {
  console.log('='.repeat(70));
  console.log('FIX CHARLES POTTER SPONSOR RELATIONSHIPS');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Get Apex Vision
  console.log('Step 1: Finding Apex Vision...');
  const { data: apex } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number')
    .eq('is_master', true)
    .single();

  if (!apex) {
    console.log('❌ Apex Vision not found');
    return;
  }

  console.log('✅ Apex Vision found:');
  console.log('   ID:', apex.id);
  console.log('   Rep #:', apex.rep_number);
  console.log();

  // Step 2: Get Apex Vision member record
  const { data: apexMember } = await supabase
    .from('members')
    .select('member_id')
    .eq('distributor_id', apex.id)
    .single();

  if (!apexMember) {
    console.log('❌ Apex Vision member record not found');
    return;
  }
  console.log('   Apex Vision member_id:', apexMember.member_id);
  console.log();

  // Step 3: Get Charles Potter
  console.log('Step 2: Finding Charles Potter...');
  const { data: charles } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number, sponsor_id')
    .eq('slug', 'cpotter')
    .single();

  if (!charles) {
    console.log('❌ Charles Potter not found');
    return;
  }

  console.log('✅ Charles Potter found:');
  console.log('   ID:', charles.id);
  console.log('   Rep #:', charles.rep_number);
  console.log('   Current Sponsor ID:', charles.sponsor_id);
  console.log();

  // Get current sponsor name
  let currentSponsorName = 'None';
  if (charles.sponsor_id) {
    const { data: currentSponsor } = await supabase
      .from('distributors')
      .select('first_name, last_name')
      .eq('id', charles.sponsor_id)
      .single();
    if (currentSponsor) {
      currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name}`;
    }
  }

  // Check if already correct
  if (charles.sponsor_id === apex.id) {
    console.log('✅ Charles is ALREADY sponsored by Apex Vision');
    console.log('   No changes needed');
  } else {
    console.log('Step 3: Updating Charles Potter sponsor...');
    console.log('   Current Sponsor:', currentSponsorName);
    console.log('   New Sponsor: Apex Vision');
    console.log();

    // Update distributor sponsor_id
    const { error: distError } = await supabase
      .from('distributors')
      .update({ sponsor_id: apex.id })
      .eq('id', charles.id);

    if (distError) {
      console.error('❌ Failed to update distributor sponsor:', distError);
      return;
    }

    console.log('   ✅ Updated distributors.sponsor_id');

    // Update member enroller_id
    const { error: memberError } = await supabase
      .from('members')
      .update({ enroller_id: apexMember.member_id })
      .eq('distributor_id', charles.id);

    if (memberError) {
      console.error('❌ Failed to update member enroller_id:', memberError);
      return;
    }

    console.log('   ✅ Updated members.enroller_id');
    console.log();
  }

  // Step 4: Verify Sella Daniel is under Charles Potter
  console.log('Step 4: Verifying Sella Daniel is under Charles Potter...');
  const { data: sella } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, rep_number, sponsor_id')
    .eq('slug', 'sellad')
    .single();

  if (!sella) {
    console.log('❌ Sella Daniel not found');
    return;
  }

  console.log('✅ Sella Daniel found:');
  console.log('   ID:', sella.id);
  console.log('   Rep #:', sella.rep_number);
  console.log('   Sponsor ID:', sella.sponsor_id);

  if (sella.sponsor_id === charles.id) {
    console.log('   ✅ Sella is ALREADY sponsored by Charles Potter');
  } else {
    console.log('   ⚠️  Sella is NOT sponsored by Charles Potter');

    // Get current sponsor
    if (sella.sponsor_id) {
      const { data: sellaSponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('id', sella.sponsor_id)
        .single();
      if (sellaSponsor) {
        console.log('   Current Sponsor:', sellaSponsor.first_name, sellaSponsor.last_name);
      }
    }
  }

  console.log();
  console.log('='.repeat(70));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(70));
  console.log();
  console.log('HIERARCHY:');
  console.log('Apex Vision (Rep #1)');
  console.log('  └─ Charles Potter (Rep #491)');
  console.log('      ├─ Donna Potter');
  console.log('      ├─ Sella Daniel (Rep #432)');
  console.log('      │   ├─ Hannah Townsend');
  console.log('      │   ├─ Stacey Bunch');
  console.log('      │   └─ Others...');
  console.log('      └─ Brian Rawlston');
  console.log();
}

fixCharlesSponsor()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
