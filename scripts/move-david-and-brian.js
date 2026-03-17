// =============================================
// MOVE DAVID TOWNSEND UNDER HANNAH TOWNSEND
// MOVE BRIAN RAWLSTON UNDER CHARLES POTTER
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DAVID_ID = '698483b5-d53c-42bc-8a26-5815cbd31436';
const HANNAH_ID = '11af4ee3-bceb-48a0-8a23-51650ad023ab';
const BRIAN_ID = '2cc55161-5519-41e1-975d-ea74a5909050';
const CHARLES_ID = '712a4dbf-7397-4fe6-8fcf-8a9a51172858';

async function moveDavidAndBrian() {
  console.log('='.repeat(60));
  console.log('MOVE DAVID TOWNSEND UNDER HANNAH TOWNSEND');
  console.log('MOVE BRIAN RAWLSTON UNDER CHARLES POTTER');
  console.log('='.repeat(60));
  console.log();

  try {
    // ========================================
    // PART 1: MOVE DAVID UNDER HANNAH
    // ========================================
    console.log('PART 1: Moving David Townsend under Hannah Townsend');
    console.log('-'.repeat(60));
    console.log();

    // Verify Hannah exists
    const { data: hannah, error: hannahError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, rep_number')
      .eq('id', HANNAH_ID)
      .single();

    if (hannahError || !hannah) {
      console.log('❌ Hannah Townsend NOT FOUND');
      console.log('   Error:', hannahError?.message);
    } else {
      console.log('✅ Hannah Townsend found:');
      console.log('   ID:', hannah.id);
      console.log('   Name:', hannah.first_name, hannah.last_name);
      console.log('   Rep #:', hannah.rep_number);
      console.log();

      // Verify David exists
      const { data: david, error: davidError } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email, slug, rep_number, sponsor_id')
        .eq('id', DAVID_ID)
        .single();

      if (davidError || !david) {
        console.log('❌ David Townsend NOT FOUND');
        console.log('   Error:', davidError?.message);
      } else {
        console.log('✅ David Townsend found:');
        console.log('   ID:', david.id);
        console.log('   Name:', david.first_name, david.last_name);
        console.log('   Rep #:', david.rep_number);
        console.log('   Current Sponsor ID:', david.sponsor_id);
        console.log();

        // Check if already under Hannah
        if (david.sponsor_id === hannah.id) {
          console.log('✅ David is ALREADY under Hannah as sponsor');
        } else {
          // Get current sponsor name
          let currentSponsorName = 'Unknown';
          if (david.sponsor_id) {
            const { data: currentSponsor } = await supabase
              .from('distributors')
              .select('first_name, last_name')
              .eq('id', david.sponsor_id)
              .single();
            if (currentSponsor) {
              currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name}`;
            }
          }

          console.log('   Current Sponsor:', currentSponsorName);
          console.log('   New Sponsor: Hannah Townsend');
          console.log();

          // Update David's sponsor
          const { error: updateDavidError } = await supabase
            .from('distributors')
            .update({ sponsor_id: hannah.id })
            .eq('id', DAVID_ID);

          if (updateDavidError) {
            console.error('❌ Failed to update David\'s sponsor:', updateDavidError);
          } else {
            console.log('✅ Successfully updated David\'s sponsor to Hannah!');
          }
        }
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log();

    // ========================================
    // PART 2: MOVE BRIAN UNDER CHARLES
    // ========================================
    console.log('PART 2: Moving Brian Rawlston under Charles Potter');
    console.log('-'.repeat(60));
    console.log();

    // Verify Charles exists
    const { data: charles, error: charlesError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, rep_number')
      .eq('id', CHARLES_ID)
      .single();

    if (charlesError || !charles) {
      console.log('❌ Charles Potter NOT FOUND');
      console.log('   Error:', charlesError?.message);
    } else {
      console.log('✅ Charles Potter found:');
      console.log('   ID:', charles.id);
      console.log('   Name:', charles.first_name, charles.last_name);
      console.log('   Rep #:', charles.rep_number);
      console.log();

      // Verify Brian exists
      const { data: brian, error: brianError } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email, slug, rep_number, sponsor_id')
        .eq('id', BRIAN_ID)
        .single();

      if (brianError || !brian) {
        console.log('❌ Brian Rawlston NOT FOUND');
        console.log('   Error:', brianError?.message);
      } else {
        console.log('✅ Brian Rawlston found:');
        console.log('   ID:', brian.id);
        console.log('   Name:', brian.first_name, brian.last_name);
        console.log('   Rep #:', brian.rep_number);
        console.log('   Current Sponsor ID:', brian.sponsor_id);
        console.log();

        // Check if already under Charles
        if (brian.sponsor_id === charles.id) {
          console.log('✅ Brian is ALREADY under Charles as sponsor');
        } else {
          // Get current sponsor name
          let currentSponsorName = 'Unknown';
          if (brian.sponsor_id) {
            const { data: currentSponsor } = await supabase
              .from('distributors')
              .select('first_name, last_name')
              .eq('id', brian.sponsor_id)
              .single();
            if (currentSponsor) {
              currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name}`;
            }
          }

          console.log('   Current Sponsor:', currentSponsorName);
          console.log('   New Sponsor: Charles Potter');
          console.log();

          // Update Brian's sponsor
          const { error: updateBrianError } = await supabase
            .from('distributors')
            .update({ sponsor_id: charles.id })
            .eq('id', BRIAN_ID);

          if (updateBrianError) {
            console.error('❌ Failed to update Brian\'s sponsor:', updateBrianError);
          } else {
            console.log('✅ Successfully updated Brian\'s sponsor to Charles!');
          }
        }
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✅ UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('SUMMARY:');
    console.log('1. David Townsend (Rep #427) → Sponsor: Hannah Townsend');
    console.log('2. Brian Rawlston (Rep #490) → Sponsor: Charles Potter');
    console.log();
    console.log('NOTE: Matrix positions were NOT changed.');
    console.log('      Only sponsor relationships for commission purposes.');
    console.log();

  } catch (error) {
    console.error('❌ Error during update:', error);
    process.exit(1);
  }
}

moveDavidAndBrian()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
