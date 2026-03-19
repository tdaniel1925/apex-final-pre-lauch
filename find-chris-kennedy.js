const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

const BRIAN_MEMBER_ID = '2ca889e6-0015-4100-ae08-043903926ee4';

async function findChrisKennedy() {
  console.log('=== SEARCHING FOR CHRIS KENNEDY ===\n');

  // Search for Chris Kennedy
  const { data: chrisMembers, error } = await supabase
    .from('members')
    .select('member_id, full_name, email, enroller_id, status, created_at')
    .ilike('full_name', '%Kennedy%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${chrisMembers?.length || 0} people matching "Chris" or "Kennedy":\n`);

  if (chrisMembers && chrisMembers.length > 0) {
    chrisMembers.forEach((person, idx) => {
      console.log(`${idx + 1}. ${person.full_name}`);
      console.log(`   Email: ${person.email}`);
      console.log(`   Member ID: ${person.member_id}`);
      console.log(`   Enroller ID: ${person.enroller_id || 'NULL'}`);
      console.log(`   Status: ${person.status}`);
      console.log(`   Created: ${person.created_at}`);

      if (person.enroller_id === BRIAN_MEMBER_ID) {
        console.log(`   ✅ Already under Brian Rawlston`);
      } else if (person.enroller_id === null) {
        console.log(`   ❌ Missing enroller - NEEDS FIX`);
      } else {
        console.log(`   ⚠️ Under someone else - verify if this is correct`);
      }
      console.log('');
    });

    // Check if any Chris Kennedy needs to be fixed
    const chrisKennedy = chrisMembers.find(m =>
      m.full_name.toLowerCase().includes('chris') &&
      m.full_name.toLowerCase().includes('kennedy')
    );

    if (chrisKennedy) {
      if (chrisKennedy.enroller_id !== BRIAN_MEMBER_ID) {
        console.log('\n=== ACTION NEEDED ===');
        console.log(`Chris Kennedy needs to be assigned to Brian Rawlston\n`);
        console.log('SQL to fix:');
        console.log(`UPDATE members SET enroller_id = '${BRIAN_MEMBER_ID}' WHERE member_id = '${chrisKennedy.member_id}'; -- ${chrisKennedy.full_name}`);
      } else {
        console.log('\n✅ Chris Kennedy is already correctly assigned to Brian');
      }
    }
  } else {
    console.log('❌ No Chris Kennedy found in the database');
    console.log('\nPossible reasons:');
    console.log('1. Name is spelled differently (Christopher, Christian, etc.)');
    console.log('2. Account was not created yet');
    console.log('3. Account was deleted');
  }

  // Also search more broadly
  console.log('\n=== BROADER SEARCH: All Kennedys ===\n');
  const { data: kennedys } = await supabase
    .from('members')
    .select('member_id, full_name, email, enroller_id')
    .ilike('full_name', '%Kennedy%');

  if (kennedys && kennedys.length > 0) {
    kennedys.forEach(person => {
      console.log(`- ${person.full_name} (${person.email})`);
      console.log(`  Enroller: ${person.enroller_id || 'NULL'}\n`);
    });
  }
}

findChrisKennedy().catch(console.error);
