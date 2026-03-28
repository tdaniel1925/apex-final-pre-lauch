const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateDonna() {
  console.log('=== STEP 1: Find Donna Potter in MEMBERS table ===');
  const { data: donnaMembers, error: error1 } = await supabase
    .from('members')
    .select('member_id, full_name, email, enroller_id, status')
    .or('full_name.ilike.%Donna%,email.ilike.%donna%');

  if (error1) {
    console.error('Error:', error1);
    return;
  }
  console.log('Donna in MEMBERS:', JSON.stringify(donnaMembers, null, 2));

  if (!donnaMembers || donnaMembers.length === 0) {
    console.log('No Donna found!');
    return;
  }

  const donnaMemberId = donnaMembers[0].member_id;
  console.log('\nDonna member_id:', donnaMemberId);
  console.log('Donna enroller_id:', donnaMembers[0].enroller_id);
  console.log('Donna status:', donnaMembers[0].status);

  console.log('\n=== STEP 2: Check if Donna has enrollees in MEMBERS ===');
  const { data: donnaEnrollees, error: error2 } = await supabase
    .from('members')
    .select('member_id, full_name, email, status')
    .eq('enroller_id', donnaMemberId);

  if (error2) {
    console.error('Error:', error2);
  } else {
    console.log(`Donna has ${donnaEnrollees.length} enrollees in MEMBERS table:`);
    console.log(JSON.stringify(donnaEnrollees, null, 2));
  }

  console.log('\n=== STEP 3: Verify Charles Potter is the enroller ===');
  const { data: charles, error: error3 } = await supabase
    .from('members')
    .select('member_id, full_name, email')
    .or('full_name.ilike.%Charles Potter%,email.ilike.%charles%');

  if (!error3 && charles && charles.length > 0) {
    console.log('Charles member_id:', charles[0].member_id);
    console.log('Does Donna\'s enroller_id match Charles?',
      donnaMembers[0].enroller_id === charles[0].member_id ? 'YES ✓' : 'NO ✗');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Donna Potter: ${donnaMembers[0].full_name}`);
  console.log(`Status: ${donnaMembers[0].status}`);
  console.log(`Enrollees: ${donnaEnrollees?.length || 0} people`);

  if (donnaEnrollees && donnaEnrollees.length > 0) {
    console.log('\nDonna\'s downline:');
    donnaEnrollees.forEach((person, idx) => {
      console.log(`  ${idx + 1}. ${person.full_name} (${person.status})`);
    });
  }
}

investigateDonna().catch(console.error);
