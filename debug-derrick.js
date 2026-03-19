const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateDerrick() {
  console.log('=== STEP 1: Find Derrick Simmons in MEMBERS table ===');
  const { data: derrickMembers, error: error1 } = await supabase
    .from('members')
    .select('member_id, full_name, email, enroller_id, status')
    .or('full_name.ilike.%Derrick%,email.ilike.%derrick%,full_name.ilike.%Simmons%');

  if (error1) {
    console.error('Error:', error1);
    return;
  }
  console.log('Derrick in MEMBERS:', JSON.stringify(derrickMembers, null, 2));

  if (!derrickMembers || derrickMembers.length === 0) {
    console.log('No Derrick found!');
    return;
  }

  const derrickMemberId = derrickMembers[0].member_id;
  console.log('\nDerrick member_id:', derrickMemberId);
  console.log('Derrick enroller_id:', derrickMembers[0].enroller_id);
  console.log('Derrick status:', derrickMembers[0].status);

  console.log('\n=== STEP 2: Find who enrolled Derrick ===');
  if (derrickMembers[0].enroller_id) {
    const { data: enroller, error: error2 } = await supabase
      .from('members')
      .select('member_id, full_name, email')
      .eq('member_id', derrickMembers[0].enroller_id);

    if (!error2 && enroller && enroller.length > 0) {
      console.log(`Derrick was enrolled by: ${enroller[0].full_name}`);
    }
  }

  console.log('\n=== STEP 3: Check if Derrick has enrollees in MEMBERS ===');
  const { data: derrickEnrollees, error: error3 } = await supabase
    .from('members')
    .select('member_id, full_name, email, status')
    .eq('enroller_id', derrickMemberId);

  if (error3) {
    console.error('Error:', error3);
  } else {
    console.log(`Derrick has ${derrickEnrollees.length} enrollees in MEMBERS table:`);
    if (derrickEnrollees.length > 0) {
      console.log(JSON.stringify(derrickEnrollees, null, 2));

      // Check each of Derrick's enrollees for their downlines
      console.log('\n=== STEP 4: Check Derrick\'s enrollees for THEIR downlines ===');
      for (const enrollee of derrickEnrollees) {
        const { data: level3, error: error4 } = await supabase
          .from('members')
          .select('member_id, full_name, status')
          .eq('enroller_id', enrollee.member_id);

        if (!error4) {
          console.log(`  ${enrollee.full_name} has ${level3?.length || 0} enrollees`);
          if (level3 && level3.length > 0) {
            level3.forEach(person => {
              console.log(`    - ${person.full_name} (${person.status})`);
            });
          }
        }
      }
    }
  }

  console.log('\n=== STEP 5: Check relationship to Charles Potter ===');
  const { data: charles } = await supabase
    .from('members')
    .select('member_id, full_name')
    .or('full_name.ilike.%Charles Potter%,email.ilike.%charlespotter%');

  if (charles && charles.length > 0) {
    const charlesMemberId = charles[0].member_id;
    console.log('Charles member_id:', charlesMemberId);

    // Check if Derrick is in Charles's downline (direct or indirect)
    console.log('\nTracing upline from Derrick to find if Charles is in the chain...');
    let currentId = derrickMembers[0].enroller_id;
    let level = 1;
    let foundCharles = false;

    while (currentId && level <= 10) {
      if (currentId === charlesMemberId) {
        console.log(`✓ YES! Derrick is Level ${level} under Charles`);
        foundCharles = true;
        break;
      }

      const { data: upline } = await supabase
        .from('members')
        .select('member_id, full_name, enroller_id')
        .eq('member_id', currentId);

      if (upline && upline.length > 0) {
        console.log(`  Level ${level}: ${upline[0].full_name}`);
        currentId = upline[0].enroller_id;
        level++;
      } else {
        break;
      }
    }

    if (!foundCharles) {
      console.log('✗ Derrick is NOT in Charles\'s downline');
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Derrick Simmons: ${derrickMembers[0].full_name}`);
  console.log(`Status: ${derrickMembers[0].status}`);
  console.log(`Direct Enrollees: ${derrickEnrollees?.length || 0} people`);
}

investigateDerrick().catch(console.error);
