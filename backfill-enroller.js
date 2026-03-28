const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

const BRIAN_MEMBER_ID = '2ca889e6-0015-4100-ae08-043903926ee4';

const peopleToFix = [
  { member_id: '258b972e-e6d2-46fe-8ae2-ab1f0eb9d4c3', name: 'Derrick Simmons' },
  { member_id: '1b5eecbb-34e4-4884-8e43-6389b9359fe7', name: 'Corlette Cross' },
  { member_id: '01934b0a-72c6-4ced-bfa2-b20a54f4c0f5', name: 'Trinity Rawlston' },
  { member_id: '4ee72fa8-ad76-4cf8-bc52-4f6681f50a2a', name: 'Sharon Kennedy' },
];

async function backfillEnrollers() {
  console.log('=== BACKFILLING ENROLLER_ID FOR BRIAN\'S DOWNLINE ===\n');
  console.log(`Setting enroller_id to: ${BRIAN_MEMBER_ID} (Brian Rawlston)\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const person of peopleToFix) {
    console.log(`Updating ${person.name}...`);

    const { data, error } = await supabase
      .from('members')
      .update({ enroller_id: BRIAN_MEMBER_ID })
      .eq('member_id', person.member_id)
      .select();

    if (error) {
      console.error(`  ✗ ERROR: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ SUCCESS`);
      successCount++;
    }
  }

  console.log('\n=== BACKFILL COMPLETE ===');
  console.log(`✓ Successfully updated: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);

  // Verify the changes
  console.log('\n=== VERIFICATION ===');
  const { data: brianEnrollees } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id')
    .eq('enroller_id', BRIAN_MEMBER_ID);

  console.log(`\nBrian Rawlston now has ${brianEnrollees?.length || 0} enrollees:`);
  if (brianEnrollees) {
    brianEnrollees.forEach((person, idx) => {
      console.log(`  ${idx + 1}. ${person.full_name}`);
    });
  }
}

backfillEnrollers().catch(console.error);
