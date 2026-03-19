// =============================================
// MOVE DONNA POTTER UNDER CHARLES POTTER
// Run this AFTER Charles completes signup
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DONNA_EMAIL = 'donnambpotter@gmail.com';
const CHARLES_EMAIL = 'fyifromcharles@gmail.com';
const DONNA_ID = '8b4ce148-e325-4fb9-a60c-9a861255effc';

async function moveDonnaUnderCharles() {
  console.log('='.repeat(60));
  console.log('MOVE DONNA POTTER UNDER CHARLES POTTER');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Verify Charles exists
    console.log('Step 1: Verifying Charles Potter exists...');
    const { data: charles, error: charlesError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, matrix_depth, matrix_position')
      .eq('email', CHARLES_EMAIL)
      .single();

    if (charlesError || !charles) {
      console.log('❌ Charles Potter NOT FOUND');
      console.log('   Email searched: ' + CHARLES_EMAIL);
      console.log('   Error:', charlesError?.message);
      console.log();
      console.log('⚠️  Charles must sign up first!');
      console.log('   Go to: https://reachtheapex.net/signup');
      return;
    }

    console.log('   ✅ Charles Potter found:');
    console.log('      ID:', charles.id);
    console.log('      Name:', charles.first_name, charles.last_name);
    console.log('      Slug:', charles.slug);
    console.log('      Matrix: Level', charles.matrix_depth, ', Position', charles.matrix_position);
    console.log();

    // Step 2: Verify Donna exists
    console.log('Step 2: Verifying Donna Potter exists...');
    const { data: donna, error: donnaError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, sponsor_id, matrix_parent_id, matrix_depth, matrix_position')
      .eq('id', DONNA_ID)
      .single();

    if (donnaError || !donna) {
      console.log('❌ Donna Potter NOT FOUND');
      console.log('   Error:', donnaError?.message);
      return;
    }

    console.log('   ✅ Donna Potter found:');
    console.log('      ID:', donna.id);
    console.log('      Name:', donna.first_name, donna.last_name);
    console.log('      Email:', donna.email);
    console.log('      Current Sponsor ID:', donna.sponsor_id);
    console.log('      Matrix: Level', donna.matrix_depth, ', Position', donna.matrix_position);
    console.log();

    // Check if already under Charles
    if (donna.sponsor_id === charles.id) {
      console.log('✅ Donna is ALREADY under Charles as sponsor');
      console.log('   No changes needed');
      return;
    }

    // Step 3: Get current sponsor name for logging
    let currentSponsorName = 'Unknown';
    if (donna.sponsor_id) {
      const { data: currentSponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('id', donna.sponsor_id)
        .single();
      if (currentSponsor) {
        currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name}`;
      }
    }

    console.log('Step 3: Updating Donna\'s sponsor...');
    console.log('   Current Sponsor:', currentSponsorName);
    console.log('   New Sponsor: Charles Potter');
    console.log();

    // Step 4: Update sponsor_id
    const { error: updateError } = await supabase
      .from('distributors')
      .update({ sponsor_id: charles.id })
      .eq('id', DONNA_ID);

    if (updateError) {
      console.error('❌ Failed to update sponsor:', updateError);
      return;
    }

    console.log('   ✅ Successfully updated Donna\'s sponsor to Charles!');
    console.log();

    // Step 5: Verify the change
    console.log('Step 4: Verifying update...');
    const { data: updated } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, sponsor_id')
      .eq('id', DONNA_ID)
      .single();

    if (updated && updated.sponsor_id === charles.id) {
      console.log('   ✅ VERIFIED: Donna is now under Charles as sponsor');
    } else {
      console.log('   ⚠️  Verification failed - please check manually');
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✅ UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('SUMMARY:');
    console.log('- Donna Potter (Rep #489) sponsor changed');
    console.log('- Old Sponsor:', currentSponsorName);
    console.log('- New Sponsor: Charles Potter');
    console.log('- Matrix Position: UNCHANGED (still Level', donna.matrix_depth + ', Position', donna.matrix_position + ')');
    console.log();
    console.log('NOTE: Donna\'s matrix position was NOT changed.');
    console.log('      Only her sponsor relationship for commission purposes.');
    console.log();

  } catch (error) {
    console.error('❌ Error during update:', error);
    process.exit(1);
  }
}

moveDonnaUnderCharles()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
