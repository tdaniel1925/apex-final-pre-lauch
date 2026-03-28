const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBrianDownline() {
  console.log('=== Verifying Brian Rawlston\'s Expected Downline ===\n');

  const expectedDownline = [
    'Derrick Simmons',
    'Corlette Cross',
    'Trinity Rawlston',
    'Chris Kennedy',
    'Sharon Kennedy'
  ];

  // Get Brian's member_id
  const { data: brian } = await supabase
    .from('members')
    .select('member_id, full_name')
    .ilike('full_name', '%Brian%Rawlston%')
    .single();

  if (!brian) {
    console.error('Brian Rawlston not found!');
    return;
  }

  console.log(`Brian Rawlston member_id: ${brian.member_id}\n`);
  console.log('Checking each person:\n');

  const results = [];

  for (const name of expectedDownline) {
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    const { data: members } = await supabase
      .from('members')
      .select('member_id, full_name, email, enroller_id, status, created_at')
      .or(`full_name.ilike.%${firstName}%,full_name.ilike.%${lastName}%`);

    if (members && members.length > 0) {
      const member = members[0];
      const hasCorrectEnroller = member.enroller_id === brian.member_id;

      results.push({
        name: member.full_name,
        member_id: member.member_id,
        enroller_id: member.enroller_id,
        correct: hasCorrectEnroller,
        status: member.status,
        created_at: member.created_at
      });

      console.log(`✓ Found: ${member.full_name}`);
      console.log(`  Member ID: ${member.member_id}`);
      console.log(`  Enroller ID: ${member.enroller_id || 'NULL'}`);
      console.log(`  Should be: ${brian.member_id}`);
      console.log(`  Match: ${hasCorrectEnroller ? '✅ CORRECT' : '❌ WRONG/MISSING'}`);
      console.log(`  Status: ${member.status}`);
      console.log(`  Created: ${member.created_at}`);
      console.log('');
    } else {
      results.push({
        name: name,
        found: false
      });
      console.log(`✗ NOT FOUND: ${name}\n`);
    }
  }

  console.log('\n=== SUMMARY ===\n');
  console.log(`Expected downline: ${expectedDownline.length} people`);

  const found = results.filter(r => r.found !== false);
  const correct = results.filter(r => r.correct === true);
  const wrong = results.filter(r => r.found !== false && r.correct === false);
  const missing = results.filter(r => r.found === false);

  console.log(`Found in database: ${found.length}`);
  console.log(`Correctly assigned to Brian: ${correct.length} ✅`);
  console.log(`Wrong/Missing enroller_id: ${wrong.length} ❌`);
  console.log(`Not found in database: ${missing.length} ⚠️`);

  if (wrong.length > 0) {
    console.log('\n=== PEOPLE NEEDING ENROLLER_ID FIX ===\n');
    wrong.forEach(person => {
      console.log(`UPDATE members SET enroller_id = '${brian.member_id}' WHERE member_id = '${person.member_id}'; -- ${person.name}`);
    });
  }
}

verifyBrianDownline().catch(console.error);
