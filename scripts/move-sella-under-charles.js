// =============================================
// MOVE SELLA DANIEL UNDER CHARLES POTTER
// Run this to update Sella's sponsor relationship
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SELLA_ID = '0b72d952-b556-4a09-8f86-7eae0299cfa4';
const CHARLES_SLUG = 'cpotter';

async function moveSellaUnderCharles() {
  console.log('='.repeat(60));
  console.log('MOVE SELLA DANIEL UNDER CHARLES POTTER');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Verify Charles exists
    console.log('Step 1: Verifying Charles Potter exists...');
    const { data: charles, error: charlesError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, matrix_depth, matrix_position')
      .eq('slug', CHARLES_SLUG)
      .single();

    if (charlesError || !charles) {
      console.log('❌ Charles Potter NOT FOUND');
      console.log('   Error:', charlesError?.message);
      return;
    }

    console.log('   ✅ Charles Potter found:');
    console.log('      ID:', charles.id);
    console.log('      Name:', charles.first_name, charles.last_name);
    console.log('      Slug:', charles.slug);
    console.log('      Matrix: Level', charles.matrix_depth, ', Position', charles.matrix_position);
    console.log();

    // Step 2: Verify Sella exists
    console.log('Step 2: Verifying Sella Daniel exists...');
    const { data: sella, error: sellaError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, sponsor_id, matrix_depth, matrix_position, rep_number')
      .eq('id', SELLA_ID)
      .single();

    if (sellaError || !sella) {
      console.log('❌ Sella Daniel NOT FOUND');
      console.log('   Error:', sellaError?.message);
      return;
    }

    console.log('   ✅ Sella Daniel found:');
    console.log('      ID:', sella.id);
    console.log('      Name:', sella.first_name, sella.last_name);
    console.log('      Email:', sella.email);
    console.log('      Slug:', sella.slug);
    console.log('      Rep #:', sella.rep_number);
    console.log('      Current Sponsor ID:', sella.sponsor_id || 'None');
    console.log('      Matrix: Level', sella.matrix_depth, ', Position', sella.matrix_position);
    console.log();

    // Check if already under Charles
    if (sella.sponsor_id === charles.id) {
      console.log('✅ Sella is ALREADY under Charles as sponsor');
      console.log('   No changes needed');
      return;
    }

    // Step 3: Get Sella's downline count
    console.log('Step 3: Checking Sella\'s downline...');
    const { data: downline, error: downlineError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, rep_number')
      .eq('sponsor_id', SELLA_ID);

    if (downlineError) {
      console.log('   ⚠️  Error fetching downline:', downlineError.message);
    } else {
      console.log('   ✅ Sella has', downline.length, 'people under her:');
      downline.forEach((person, idx) => {
        console.log(`      ${idx + 1}. ${person.first_name} ${person.last_name} (${person.slug}) - Rep #${person.rep_number}`);
      });
      console.log('   → These will remain under Sella (no changes to their sponsor)');
    }
    console.log();

    // Step 4: Get current sponsor name for logging
    let currentSponsorName = 'None (Master)';
    if (sella.sponsor_id) {
      const { data: currentSponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('id', sella.sponsor_id)
        .single();
      if (currentSponsor) {
        currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name}`;
      }
    }

    console.log('Step 4: Updating Sella\'s sponsor...');
    console.log('   Current Sponsor:', currentSponsorName);
    console.log('   New Sponsor: Charles Potter');
    console.log();

    // Step 5: Update sponsor_id
    const { error: updateError } = await supabase
      .from('distributors')
      .update({ sponsor_id: charles.id })
      .eq('id', SELLA_ID);

    if (updateError) {
      console.error('❌ Failed to update sponsor:', updateError);
      return;
    }

    console.log('   ✅ Successfully updated Sella\'s sponsor to Charles!');
    console.log();

    // Step 6: Verify the change
    console.log('Step 5: Verifying update...');
    const { data: updated } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, sponsor_id')
      .eq('id', SELLA_ID)
      .single();

    if (updated && updated.sponsor_id === charles.id) {
      console.log('   ✅ VERIFIED: Sella is now under Charles as sponsor');
    } else {
      console.log('   ⚠️  Verification failed - please check manually');
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✅ UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('SUMMARY:');
    console.log('- Sella Daniel (Rep #' + sella.rep_number + ') sponsor changed');
    console.log('- Old Sponsor:', currentSponsorName);
    console.log('- New Sponsor: Charles Potter');
    console.log('- Matrix Position: UNCHANGED (still Level', sella.matrix_depth + ', Position', sella.matrix_position + ')');
    console.log();
    console.log('COMMISSION FLOW (for Sella\'s downline):');
    console.log('  Downline member → Sella Daniel → Charles Potter → Up the line');
    console.log();
    console.log('NOTE: Sella\'s matrix position was NOT changed.');
    console.log('      Only her sponsor relationship for commission purposes.');
    console.log('      Her 5 downline members remain under her.');
    console.log();

  } catch (error) {
    console.error('❌ Error during update:', error);
    process.exit(1);
  }
}

moveSellaUnderCharles()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
