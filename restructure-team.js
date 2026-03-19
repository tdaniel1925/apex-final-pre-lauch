const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restructureTeam() {
  console.log('=== Team Restructure Starting ===\n');

  // IDs
  const charlesPotterId = '181df3cc-c9c9-4461-b002-1a24a1ddcea3'; // Rep #4
  const joanneId = '0b72d952-b556-4a09-8f86-7eae0299cfa4'; // Rep #432 (will become Sella)
  const staceyId = '969a598b-f8c5-4734-bbb3-a4328761c217'; // Rep #474
  const hannahId = '11af4ee3-bceb-48a0-8a23-51650ad023ab'; // Rep #426
  const corindalId = 'e0467457-e32d-4557-8a28-b7783465b02f'; // Rep #467 (to delete)

  // STEP 1: Update Joanne Melton to Sella Daniel
  console.log('Step 1: Updating Joanne Melton to Sella Daniel...');
  const { data: sella, error: sellaError } = await supabase
    .from('distributors')
    .update({
      first_name: 'Sella',
      last_name: 'Daniel',
      email: 'sellag.sb@gmail.com',
      slug: 'sellad',
      phone: '9366417130',
      updated_at: new Date().toISOString()
    })
    .eq('id', joanneId)
    .select()
    .single();

  if (sellaError) {
    console.error('❌ Error updating to Sella Daniel:', sellaError);
    return;
  }
  console.log('✅ Updated to Sella Daniel');
  console.log(`   Name: ${sella.first_name} ${sella.last_name}`);
  console.log(`   Email: ${sella.email}`);
  console.log(`   Slug: ${sella.slug}`);

  // STEP 2: Update password for Sella Daniel's auth account
  console.log('\nStep 2: Updating password for Sella Daniel...');
  // Note: This requires admin auth access - will need to be done separately
  console.log('⚠️  Password update requires Supabase Auth Admin API');
  console.log('   Password to set: 4Xkkilla1@');
  console.log('   This must be done via Supabase dashboard or admin API');

  // STEP 3: Move Sella Daniel under Charles Potter
  console.log('\nStep 3: Moving Sella Daniel under Charles Potter...');
  const { error: moveSellaError } = await supabase
    .from('distributors')
    .update({
      sponsor_id: charlesPotterId,
      updated_at: new Date().toISOString()
    })
    .eq('id', joanneId);

  if (moveSellaError) {
    console.error('❌ Error moving Sella under Charles:', moveSellaError);
    return;
  }
  console.log('✅ Sella Daniel now sponsored by Charles Potter');

  // STEP 4: Move Stacey under Sella Daniel
  console.log('\nStep 4: Moving Stacey Bunch under Sella Daniel...');
  const { error: moveStaceyError } = await supabase
    .from('distributors')
    .update({
      sponsor_id: joanneId,
      updated_at: new Date().toISOString()
    })
    .eq('id', staceyId);

  if (moveStaceyError) {
    console.error('❌ Error moving Stacey:', moveStaceyError);
    return;
  }
  console.log('✅ Stacey Bunch now sponsored by Sella Daniel');

  // STEP 5: Move Hannah under Sella Daniel
  console.log('\nStep 5: Moving Hannah Townsend under Sella Daniel...');
  const { error: moveHannahError } = await supabase
    .from('distributors')
    .update({
      sponsor_id: joanneId,
      updated_at: new Date().toISOString()
    })
    .eq('id', hannahId);

  if (moveHannahError) {
    console.error('❌ Error moving Hannah:', moveHannahError);
    return;
  }
  console.log('✅ Hannah Townsend now sponsored by Sella Daniel');

  // STEP 6: Delete Corinda Melton
  console.log('\nStep 6: Deleting Corinda Melton (duplicate)...');
  const { error: deleteError } = await supabase
    .from('distributors')
    .delete()
    .eq('id', corindalId);

  if (deleteError) {
    console.error('❌ Error deleting Corinda:', deleteError);
    return;
  }
  console.log('✅ Corinda Melton deleted');

  // STEP 7: Verify final structure
  console.log('\n=== Final Structure Verification ===\n');

  const { data: charles } = await supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug')
    .eq('id', charlesPotterId)
    .single();

  const { data: sellaFinal } = await supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, sponsor_id')
    .eq('id', joanneId)
    .single();

  const { data: staceyFinal } = await supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, sponsor_id')
    .eq('id', staceyId)
    .single();

  const { data: hannahFinal } = await supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, sponsor_id')
    .eq('id', hannahId)
    .single();

  console.log('Charles Potter (Rep #' + charles.rep_number + ')');
  console.log('  Email:', charles.email);
  console.log('  Slug:', charles.slug);
  console.log('  Link: https://reachtheapex.net/' + charles.slug);
  console.log('');
  console.log('  └── Sella Daniel (Rep #' + sellaFinal.rep_number + ')');
  console.log('      Email:', sellaFinal.email);
  console.log('      Slug:', sellaFinal.slug);
  console.log('      Link: https://reachtheapex.net/' + sellaFinal.slug);
  console.log('      Sponsor ID:', sellaFinal.sponsor_id);
  console.log('');
  console.log('      ├── Stacey Bunch (Rep #' + staceyFinal.rep_number + ')');
  console.log('      │   Email:', staceyFinal.email);
  console.log('      │   Slug:', staceyFinal.slug);
  console.log('      │   Link: https://reachtheapex.net/' + staceyFinal.slug);
  console.log('      │   Sponsor ID:', staceyFinal.sponsor_id);
  console.log('      │');
  console.log('      └── Hannah Townsend (Rep #' + hannahFinal.rep_number + ')');
  console.log('          Email:', hannahFinal.email);
  console.log('          Slug:', hannahFinal.slug);
  console.log('          Link: https://reachtheapex.net/' + hannahFinal.slug);
  console.log('          Sponsor ID:', hannahFinal.sponsor_id);

  console.log('\n✅ All operations completed successfully!');
  console.log('\n⚠️  MANUAL ACTION REQUIRED:');
  console.log('   Update password for sellag.sb@gmail.com to: 4Xkkilla1@');
  console.log('   This must be done in Supabase Dashboard → Authentication → Users');
}

restructureTeam();
