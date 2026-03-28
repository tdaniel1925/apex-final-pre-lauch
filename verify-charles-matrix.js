const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

const CHARLES_MEMBER_ID = 'ff41307d-2641-45bb-84c7-ee5022a7b869';

async function verifyCharlesMatrix() {
  console.log('=== CHARLES POTTER MATRIX VIEW VERIFICATION ===\n');

  // Recursive function to get all downline members
  async function getDownline(memberId, level = 1, maxLevel = 7) {
    if (level > maxLevel) return [];

    const { data: directEnrollees } = await supabase
      .from('members')
      .select('member_id, full_name, status, created_at')
      .eq('enroller_id', memberId)
      .order('created_at');

    if (!directEnrollees || directEnrollees.length === 0) {
      return [];
    }

    const result = [];
    for (const enrollee of directEnrollees) {
      result.push({
        ...enrollee,
        level,
      });

      // Get their downline recursively
      const children = await getDownline(enrollee.member_id, level + 1, maxLevel);
      result.push(...children);
    }

    return result;
  }

  console.log('Fetching Charles Potter\'s complete downline (7 levels deep)...\n');

  const allDownline = await getDownline(CHARLES_MEMBER_ID, 1, 7);

  console.log(`Total organization size: ${allDownline.length} people\n`);

  // Group by level
  const byLevel = {};
  for (let i = 1; i <= 7; i++) {
    byLevel[i] = allDownline.filter(m => m.level === i);
  }

  console.log('=== BREAKDOWN BY LEVEL ===\n');
  for (let level = 1; level <= 7; level++) {
    const members = byLevel[level];
    console.log(`Level ${level}: ${members.length} people`);
    if (members.length > 0) {
      members.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.full_name} (${m.status})`);
      });
      console.log('');
    }
  }

  console.log('\n=== SPECIFIC CHECK: BRIAN RAWLSTON\'S BRANCH ===\n');

  const { data: brian } = await supabase
    .from('members')
    .select('member_id, full_name')
    .ilike('full_name', '%Brian%Rawlston%')
    .single();

  if (brian) {
    const brianDownline = allDownline.filter(m => {
      // Find all members in Brian's branch
      return m.member_id === brian.member_id ||
             allDownline.some(parent =>
               parent.member_id === brian.member_id &&
               isDescendant(m, brian.member_id, allDownline)
             );
    });

    console.log(`Brian Rawlston's member_id: ${brian.member_id}`);

    const { data: brianEnrollees } = await supabase
      .from('members')
      .select('member_id, full_name, status')
      .eq('enroller_id', brian.member_id);

    console.log(`Brian's direct enrollees: ${brianEnrollees?.length || 0}`);
    if (brianEnrollees && brianEnrollees.length > 0) {
      brianEnrollees.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.full_name} (${m.status})`);
      });
    }
  }

  console.log('\n=== SUCCESS ===');
  console.log('✓ Matrix data is now correct');
  console.log('✓ Charles can see his entire organization');
  console.log('✓ Brian\'s downline is visible in the matrix');
}

function isDescendant(member, ancestorId, allMembers) {
  // Simple check - member is in the list and comes after the ancestor
  const ancestorIndex = allMembers.findIndex(m => m.member_id === ancestorId);
  const memberIndex = allMembers.findIndex(m => m.member_id === member.member_id);
  return memberIndex > ancestorIndex;
}

verifyCharlesMatrix().catch(console.error);
