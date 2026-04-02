import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestData() {
  console.log('\n=== CLEARING ALL TEST VOLUME/CREDITS DATA ===\n');

  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('member_id, personal_credits_monthly, team_credits_monthly, tech_personal_credits_monthly, tech_team_credits_monthly, insurance_personal_credits_monthly, insurance_team_credits_monthly');

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return;
  }

  console.log(`Found ${members.length} members\n`);

  // Show current state
  console.log('BEFORE CLEANUP:');
  let totalPersonal = 0;
  let totalTeam = 0;
  members.forEach((m) => {
    const personal = m.personal_credits_monthly || 0;
    const team = m.team_credits_monthly || 0;
    if (personal > 0 || team > 0) {
      console.log(`  Member ${m.member_id}: Personal=${personal}, Team=${team}`);
      totalPersonal += personal;
      totalTeam += team;
    }
  });
  console.log(`  Total Personal Credits: ${totalPersonal}`);
  console.log(`  Total Team Credits: ${totalTeam}\n`);

  // Reset ALL volume/credits fields to 0
  console.log('Resetting all volume/credits fields to 0...\n');

  const { error: updateError } = await supabase
    .from('members')
    .update({
      personal_credits_monthly: 0,
      team_credits_monthly: 0,
      tech_personal_credits_monthly: 0,
      tech_team_credits_monthly: 0,
      insurance_personal_credits_monthly: 0,
      insurance_team_credits_monthly: 0,
      override_qualified: false,
    })
    .neq('member_id', '00000000-0000-0000-0000-000000000000'); // Update all rows

  if (updateError) {
    console.error('Error updating members:', updateError);
    return;
  }

  console.log('✅ All volume/credits fields reset to 0');

  // Verify
  const { data: verifyMembers } = await supabase
    .from('members')
    .select('member_id, personal_credits_monthly, team_credits_monthly');

  console.log('\nAFTER CLEANUP:');
  let verifyTotal = 0;
  verifyMembers?.forEach((m) => {
    const personal = m.personal_credits_monthly || 0;
    const team = m.team_credits_monthly || 0;
    verifyTotal += personal + team;
    if (personal > 0 || team > 0) {
      console.log(`  Member ${m.member_id}: Personal=${personal}, Team=${team}`);
    }
  });

  if (verifyTotal === 0) {
    console.log('  ✅ All members have 0 credits (correct!)');
  } else {
    console.log(`  ⚠️  Still have ${verifyTotal} total credits`);
  }

  console.log('\n=== CLEANUP COMPLETE ===\n');
}

clearTestData().catch(console.error);
