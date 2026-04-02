import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function moveReaganToSella() {
  console.log('========================================');
  console.log('Moving Reagan Wolfe to Sella Daniel');
  console.log('========================================\n');

  // Step 1: Find Reagan Wolfe
  console.log('Step 1: Looking up Reagan Wolfe...');
  const { data: reagan, error: reaganError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, sponsor_id')
    .ilike('first_name', 'reagan')
    .ilike('last_name', 'wolfe')
    .single();

  if (reaganError || !reagan) {
    console.error('❌ Reagan Wolfe not found:', reaganError);
    return;
  }

  console.log('✅ Found Reagan Wolfe:');
  console.log(`   Email: ${reagan.email}`);
  console.log(`   Rep #: ${reagan.rep_number}`);
  console.log(`   Current Sponsor ID: ${reagan.sponsor_id}`);
  console.log('');

  // Step 2: Find Sella Daniel
  console.log('Step 2: Looking up Sella Daniel...');
  const { data: sella, error: sellaError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number')
    .ilike('first_name', 'sella')
    .ilike('last_name', 'daniel')
    .single();

  if (sellaError || !sella) {
    console.error('❌ Sella Daniel not found:', sellaError);
    return;
  }

  console.log('✅ Found Sella Daniel:');
  console.log(`   Email: ${sella.email}`);
  console.log(`   Rep #: ${sella.rep_number}`);
  console.log(`   Distributor ID: ${sella.id}`);
  console.log('');

  // Step 3: Check Reagan's downline
  console.log('Step 3: Checking Reagan\'s downline...');
  const { data: downline, error: downlineError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, rep_number')
    .eq('sponsor_id', reagan.id)
    .order('rep_number', { ascending: true });

  if (downlineError) {
    console.error('❌ Error checking downline:', downlineError);
    return;
  }

  console.log(`✅ Reagan has ${downline.length} direct enrollees:`);
  downline.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.first_name} ${member.last_name} (Rep #${member.rep_number}) - ${member.email}`);
  });
  console.log('');

  // Step 4: Confirm the move
  console.log('Step 4: Preparing to update sponsor...');
  console.log(`   Will change Reagan's sponsor from ${reagan.sponsor_id} to ${sella.id}`);
  console.log(`   Reagan's ${downline.length} enrollees will move with her\n`);

  // Step 5: Execute the update
  console.log('Step 5: Updating sponsor_id...');
  const { data: updateResult, error: updateError } = await supabase
    .from('distributors')
    .update({ sponsor_id: sella.id })
    .eq('id', reagan.id)
    .select();

  if (updateError) {
    console.error('❌ Failed to update sponsor:', updateError);
    return;
  }

  console.log('✅ Successfully updated Reagan\'s sponsor!');
  console.log('');

  // Step 6: Verify the change
  console.log('Step 6: Verifying the change...');
  const { data: verification, error: verifyError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id')
    .eq('id', reagan.id)
    .single();

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
    return;
  }

  if (verification.sponsor_id === sella.id) {
    console.log('✅ VERIFIED: Reagan Wolfe is now sponsored by Sella Daniel');
    console.log('');
    console.log('========================================');
    console.log('Summary:');
    console.log('========================================');
    console.log(`Reagan Wolfe (Rep #${reagan.rep_number})`);
    console.log(`  Old Sponsor: Apex Vision`);
    console.log(`  New Sponsor: Sella Daniel (Rep #${sella.rep_number})`);
    console.log(`  Downline: ${downline.length} enrollees moved with her`);
    console.log('========================================');
  } else {
    console.log('❌ VERIFICATION FAILED: Sponsor was not updated correctly');
  }
}

moveReaganToSella();
