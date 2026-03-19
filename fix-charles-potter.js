const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCharlesPotter() {
  console.log('=== Fixing Charles Potter Records ===\n');

  // Step 1: Update Rep #4 with correct email
  const rep4Id = '181df3cc-c9c9-4461-b002-1a24a1ddcea3';
  const rep476Id = '5d1cca49-8aac-49d8-a193-0628008f7fa3';

  console.log('Step 1: Updating Rep #4 email to fyifromcharles@gmail.com...');
  const { data: updatedRep, error: updateError } = await supabase
    .from('distributors')
    .update({
      email: 'fyifromcharles@gmail.com',
      phone: '7136323942',
      updated_at: new Date().toISOString()
    })
    .eq('id', rep4Id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating Rep #4:', updateError);
    return;
  }

  console.log('✅ Rep #4 updated successfully');
  console.log(`   Email: ${updatedRep.email}`);
  console.log(`   Phone: ${updatedRep.phone}`);

  // Step 2: Delete Rep #476
  console.log('\nStep 2: Deleting Rep #476...');
  const { error: deleteError } = await supabase
    .from('distributors')
    .delete()
    .eq('id', rep476Id);

  if (deleteError) {
    console.error('❌ Error deleting Rep #476:', deleteError);
    return;
  }

  console.log('✅ Rep #476 deleted successfully');

  // Step 3: Verify final state
  console.log('\nStep 3: Verifying final state...');
  const { data: finalCheck, error: checkError } = await supabase
    .from('distributors')
    .select('*')
    .or('first_name.ilike.%charles%,last_name.ilike.%potter%');

  if (checkError) {
    console.error('❌ Error verifying:', checkError);
    return;
  }

  console.log('\n=== Final Charles Potter Records ===');
  finalCheck.forEach((dist) => {
    console.log(`\nRep #${dist.rep_number}: ${dist.first_name} ${dist.last_name}`);
    console.log(`  ID: ${dist.id}`);
    console.log(`  Email: ${dist.email}`);
    console.log(`  Phone: ${dist.phone}`);
    console.log(`  Status: ${dist.status}`);
  });

  console.log('\n✅ All operations completed successfully!');
  console.log(`Total Charles Potter records remaining: ${finalCheck.length}`);
}

fixCharlesPotter();
