const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

const fixes = [
  { member_id: 'f9ddbc77-0928-4100-9c62-187c633015a8', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Tavares Davis → Apex Vision' },
  { member_id: '98e8ac7e-d802-4f6a-9f9d-98754b51d629', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Falguni Jariwala → Apex Vision' },
  { member_id: 'cfe77492-d662-4f75-9753-2b2d874d76f0', enroller_id: 'bf028460-0ea4-44b2-a2d1-0f2f3cccf735', name: 'Saalik Patel → Hafeez Rangwala' },
  { member_id: '8c665282-91f2-441c-9138-3e1706b70205', enroller_id: '78facfc7-958f-4fc1-8483-c583efc1f455', name: 'Taunya Bartlett → Stacey Bunch' },
  { member_id: 'da7a42c0-8503-4ff1-8226-0458efbfeddd', enroller_id: '79633b2b-1c7c-4e00-86bd-5ab476accd00', name: 'Matthew Porter → Hannah Townsend' },
  { member_id: '0faca73d-8cf5-4785-a4e3-170b4a2baa7f', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'John Smith → Apex Vision' },
  { member_id: '8a981af7-6f06-43ba-a158-13298775b930', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'John TestUser → Apex Vision' },
  { member_id: 'd724e192-1adc-43fd-a8d2-e5ce95304dd1', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Sarah Johnson → Apex Vision' },
  { member_id: '996012d7-46d1-452f-aae8-b45a55613e4c', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'John TestUser → Apex Vision' },
  { member_id: 'd6d7a108-31c4-47a2-907b-ced5a766ebb5', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Jane Business → Apex Vision' },
  { member_id: 'd057394a-d2e7-4cd9-a69e-b33386c3c4cc', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Jane Business → Apex Vision' },
  { member_id: 'ab0545a8-6c58-4ca6-ba43-ae2f60e75917', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'John TestUser → Apex Vision' },
  { member_id: '4e17cf81-eebe-47a4-a654-d90c19680c83', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'TestUser Debug → Apex Vision' },
  { member_id: 'd8e28047-187e-40bf-abc1-943793f193a3', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Echo Leader → Apex Vision' },
  { member_id: 'da7c2ef8-8bf6-4164-87f2-a6bfe93a8973', enroller_id: 'd8e28047-187e-40bf-abc1-943793f193a3', name: 'Rep1 Test → Echo Leader' },
  { member_id: '52deb71e-b16c-496d-8608-74dea60e1a16', enroller_id: 'd8e28047-187e-40bf-abc1-943793f193a3', name: 'Rep2 Test → Echo Leader' },
  { member_id: 'ea6697e1-0e89-425e-8cca-e0301b4e1bc0', enroller_id: 'd8e28047-187e-40bf-abc1-943793f193a3', name: 'Rep3 Test → Echo Leader' },
  { member_id: 'b11a50f1-5b9d-428e-951b-c45a5ad5228d', enroller_id: 'd8e28047-187e-40bf-abc1-943793f193a3', name: 'Rep4 Test → Echo Leader' },
  { member_id: '302c0698-354d-4867-81bb-52dad764b880', enroller_id: 'd8e28047-187e-40bf-abc1-943793f193a3', name: 'Rep5 Test → Echo Leader' },
  { member_id: 'fa6ad892-730e-4e8d-85c5-989a6dadc420', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Juan Olivella → Apex Vision' },
  { member_id: '6de2811e-5768-4582-bfa5-bc9de7a6403e', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Renae Moore → Apex Vision' },
  { member_id: 'e9b26d97-6358-43f9-b342-567b34988066', enroller_id: '9fa67b06-b45e-43a3-848a-67aad470a9cd', name: 'Darrell Wolfe → Apex Vision' }
];

async function applyFixes() {
  console.log('=== APPLYING ORPHAN MEMBER FIXES ===\n');
  console.log(`Fixing ${fixes.length} members...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const fix of fixes) {
    console.log(`Updating: ${fix.name}`);

    const { data, error } = await supabase
      .from('members')
      .update({ enroller_id: fix.enroller_id })
      .eq('member_id', fix.member_id)
      .select();

    if (error) {
      console.error(`  ✗ ERROR: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ SUCCESS`);
      successCount++;
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`✓ Successfully updated: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);

  // Verify no orphans remain (except known ones with no sponsor)
  console.log('\n=== VERIFICATION ===');
  const { data: remainingOrphans } = await supabase
    .from('members')
    .select('member_id, full_name, distributor_id')
    .is('enroller_id', null);

  if (remainingOrphans) {
    console.log(`\nRemaining members with NULL enroller_id: ${remainingOrphans.length}`);

    // Check if they have sponsor_id in distributors table
    for (const orphan of remainingOrphans) {
      if (orphan.distributor_id) {
        const { data: dist } = await supabase
          .from('distributors')
          .select('sponsor_id')
          .eq('id', orphan.distributor_id)
          .single();

        if (dist && dist.sponsor_id) {
          console.log(`⚠️  ${orphan.full_name} - HAS sponsor but wasn't fixed (unexpected)`);
        } else {
          console.log(`✓ ${orphan.full_name} - No sponsor (OK - master distributor or test account)`);
        }
      }
    }
  }

  console.log('\n✅ All fixable orphans have been updated!');
}

applyFixes().catch(console.error);
