// Verification script for Matrix view fix
// Tests that Charles Potter can see Brian Rawlston in Matrix view
import { createClient } from '@supabase/supabase-js';
import { calculateMatrixLevels } from '../src/lib/matrix/level-calculator.ts';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMatrixFix() {
  console.log('\n=== MATRIX VIEW FIX VERIFICATION ===\n');

  // 1. Find Charles Potter and get his member_id
  console.log('1. Finding Charles Potter...');
  const { data: charlesDistributor, error: charlesError } = await supabase
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        personal_credits_monthly
      )
    `)
    .eq('email', 'fyifromcharles@gmail.com')
    .single();

  if (charlesError || !charlesDistributor || !charlesDistributor.member) {
    console.error('Error finding Charles:', charlesError);
    return;
  }

  console.log(`   Found: ${charlesDistributor.first_name} ${charlesDistributor.last_name}`);
  console.log(`   Member ID: ${charlesDistributor.member.member_id}`);
  console.log(`   Rank: ${charlesDistributor.member.tech_rank}`);

  const currentMemberId = charlesDistributor.member.member_id;

  // 2. Simulate the OLD BROKEN query (get all members)
  console.log('\n2. Testing OLD BROKEN pattern...');
  const { data: allMembers } = await supabase
    .from('members')
    .select(`
      member_id,
      full_name,
      enroller_id,
      tech_rank,
      personal_credits_monthly,
      override_qualified
    `)
    .eq('status', 'active');

  console.log(`   Retrieved ${allMembers?.length || 0} total members`);

  // Use the calculator (this part is correct)
  const levelMapOld = calculateMatrixLevels(currentMemberId, allMembers || []);

  // OLD BROKEN STATS CALCULATION (client-side filtering)
  const totalTeamSizeOld = allMembers?.filter((m) =>
    m.enroller_id === currentMemberId ||
    levelMapOld[1]?.some((l1) => l1.member_id === m.member_id) ||
    levelMapOld[2]?.some((l2) => l2.member_id === m.member_id) ||
    levelMapOld[3]?.some((l3) => l3.member_id === m.member_id) ||
    levelMapOld[4]?.some((l4) => l4.member_id === m.member_id) ||
    levelMapOld[5]?.some((l5) => l5.member_id === m.member_id)
  ).length || 0;

  console.log(`   OLD METHOD Team Size: ${totalTeamSizeOld}`);
  console.log(`   OLD METHOD Level 1: ${levelMapOld[1]?.length || 0} members`);

  // 3. Test NEW FIXED pattern
  console.log('\n3. Testing NEW FIXED pattern...');

  const levelMapNew = calculateMatrixLevels(currentMemberId, allMembers || []);

  // NEW FIXED STATS CALCULATION (use levelMap directly)
  const allDownlineMembers = [
    ...(levelMapNew[1] || []),
    ...(levelMapNew[2] || []),
    ...(levelMapNew[3] || []),
    ...(levelMapNew[4] || []),
    ...(levelMapNew[5] || []),
  ];

  const totalTeamSizeNew = allDownlineMembers.length;
  const activeMembersNew = allDownlineMembers.filter(m => m.override_qualified).length;

  console.log(`   NEW METHOD Team Size: ${totalTeamSizeNew}`);
  console.log(`   NEW METHOD Level 1: ${levelMapNew[1]?.length || 0} members`);
  console.log(`   NEW METHOD Active Members: ${activeMembersNew}`);

  // 4. Display Level 1 members
  console.log('\n4. Charles\'s Level 1 Team Members:');
  if (levelMapNew[1] && levelMapNew[1].length > 0) {
    levelMapNew[1].forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.full_name}`);
      console.log(`      - Rank: ${member.tech_rank}`);
      console.log(`      - Credits: ${member.personal_credits_monthly}`);
      console.log(`      - Override Qualified: ${member.override_qualified ? 'Yes' : 'No'}`);
    });
  } else {
    console.log('   ⚠️ No Level 1 members found (this is the bug!)');
  }

  // 5. Verify Brian is included
  console.log('\n5. Verifying Brian Rawlston is in Level 1...');
  const brianInL1 = levelMapNew[1]?.some(m => m.full_name.toLowerCase().includes('brian'));
  if (brianInL1) {
    console.log('   ✅ SUCCESS: Brian found in Level 1!');
  } else {
    console.log('   ❌ FAIL: Brian NOT found in Level 1');
  }

  // 6. Compare with Team view query (direct enrollees)
  console.log('\n6. Cross-checking with Team view pattern...');
  const { data: directEnrollees } = await supabase
    .from('members')
    .select('member_id, full_name, tech_rank, personal_credits_monthly')
    .eq('enroller_id', currentMemberId);

  console.log(`   Team view (direct enrollees): ${directEnrollees?.length || 0}`);
  if (directEnrollees) {
    directEnrollees.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.full_name}`);
    });
  }

  // 7. Final verification
  console.log('\n=== VERIFICATION RESULTS ===');
  const teamViewCount = directEnrollees?.length || 0;
  const matrixL1Count = levelMapNew[1]?.length || 0;

  if (teamViewCount === matrixL1Count && matrixL1Count > 0) {
    console.log(`✅ PASS: Matrix L1 (${matrixL1Count}) matches Team view (${teamViewCount})`);
  } else {
    console.log(`❌ FAIL: Matrix L1 (${matrixL1Count}) does NOT match Team view (${teamViewCount})`);
  }

  if (brianInL1) {
    console.log('✅ PASS: Brian Rawlston visible in Matrix');
  } else {
    console.log('❌ FAIL: Brian Rawlston NOT visible in Matrix');
  }

  console.log('\n=== END VERIFICATION ===\n');
}

verifyMatrixFix().catch(console.error);
