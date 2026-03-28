const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

const BRIAN_MEMBER_ID = '2ca889e6-0015-4100-ae08-043903926ee4';
const CHRIS_MEMBER_ID = 'b967e23e-6029-471c-b1b5-0d5f515b862f';

async function fixChrisKennedy() {
  console.log('=== FIXING CHRIS KENNEDY\'S ENROLLER ===\n');

  console.log(`Chris Kennedy member_id: ${CHRIS_MEMBER_ID}`);
  console.log(`Setting enroller_id to: ${BRIAN_MEMBER_ID} (Brian Rawlston)\n`);

  const { data, error } = await supabase
    .from('members')
    .update({ enroller_id: BRIAN_MEMBER_ID })
    .eq('member_id', CHRIS_MEMBER_ID)
    .select();

  if (error) {
    console.error('❌ ERROR:', error.message);
    return;
  }

  console.log('✅ SUCCESS - Chris Kennedy updated\n');

  // Verify
  console.log('=== VERIFICATION ===\n');
  const { data: brianEnrollees } = await supabase
    .from('members')
    .select('member_id, full_name')
    .eq('enroller_id', BRIAN_MEMBER_ID)
    .order('full_name');

  console.log(`Brian Rawlston now has ${brianEnrollees?.length || 0} enrollees:\n`);
  if (brianEnrollees) {
    brianEnrollees.forEach((person, idx) => {
      console.log(`  ${idx + 1}. ${person.full_name}`);
    });
  }

  // Check total for Charles
  console.log('\n=== CHARLES POTTER TOTAL ORGANIZATION ===\n');

  async function countDownline(memberId, level = 1, maxLevel = 7) {
    if (level > maxLevel) return 0;

    const { data: enrollees } = await supabase
      .from('members')
      .select('member_id')
      .eq('enroller_id', memberId);

    if (!enrollees || enrollees.length === 0) return 0;

    let total = enrollees.length;
    for (const enrollee of enrollees) {
      total += await countDownline(enrollee.member_id, level + 1, maxLevel);
    }

    return total;
  }

  const charlesMemberId = 'ff41307d-2641-45bb-84c7-ee5022a7b869';
  const totalOrg = await countDownline(charlesMemberId);

  console.log(`Charles Potter's total organization: ${totalOrg} people`);
  console.log('\n✅ All fixes complete!');
}

fixChrisKennedy().catch(console.error);
