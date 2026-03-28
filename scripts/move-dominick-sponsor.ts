// Move Dominick Nguyen under Anh Doan as sponsor
import { createServiceClient } from '@/lib/supabase/service';

async function moveSponsor() {
  const supabase = createServiceClient();

  console.log('🔍 Finding Dominick Nguyen and Anh Doan...\n');

  // Find Dominick Nguyen
  const { data: dominick, error: dominickError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, sponsor_id')
    .eq('email', 'domng30@yahoo.com')
    .single();

  if (dominickError || !dominick) {
    console.error('❌ Could not find Dominick Nguyen');
    return;
  }

  // Find Anh Doan
  const { data: anh, error: anhError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('email', 'anh@doanfs.com')
    .single();

  if (anhError || !anh) {
    console.error('❌ Could not find Anh Doan');
    return;
  }

  // Get current sponsor
  let currentSponsorName = 'NONE';
  if (dominick.sponsor_id) {
    const { data: currentSponsor } = await supabase
      .from('distributors')
      .select('first_name, last_name, email')
      .eq('id', dominick.sponsor_id)
      .single();

    if (currentSponsor) {
      currentSponsorName = `${currentSponsor.first_name} ${currentSponsor.last_name} (${currentSponsor.email})`;
    }
  }

  console.log('📋 Current Status:');
  console.log(`   Distributor: ${dominick.first_name} ${dominick.last_name} (${dominick.email})`);
  console.log(`   Current Sponsor: ${currentSponsorName}`);
  console.log(`   New Sponsor: ${anh.first_name} ${anh.last_name} (${anh.email})\n`);

  // Update sponsor_id
  console.log('🔄 Updating sponsor relationship...\n');

  const { error: updateError } = await supabase
    .from('distributors')
    .update({ sponsor_id: anh.id })
    .eq('id', dominick.id);

  if (updateError) {
    console.error('❌ Error updating sponsor:', updateError);
    return;
  }

  console.log('✅ Successfully moved Dominick Nguyen under Anh Doan!');
  console.log('');
  console.log('📊 New Enrollment Tree:');
  console.log(`   Anh Doan (${anh.email})`);
  console.log(`   └─ Dominick Nguyen (${dominick.email})`);
  console.log('');

  // Note about matrix tree
  console.log('ℹ️  Note: This updated the ENROLLMENT TREE (sponsor_id).');
  console.log('   The MATRIX TREE (matrix_parent_id) remains unchanged.');
  console.log('   If you also need to update matrix placement, that requires');
  console.log('   a separate operation and should be done carefully.');
}

moveSponsor().catch(console.error);
