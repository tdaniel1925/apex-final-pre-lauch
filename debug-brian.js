const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateBrian() {
  console.log('=== STEP 1: Find Brian in MEMBERS table ===');
  const { data: brianMembers, error: error1 } = await supabase
    .from('members')
    .select('member_id, full_name, email, enroller_id, status')
    .or('full_name.ilike.%Brian%,email.ilike.%brian%');

  if (error1) {
    console.error('Error:', error1);
    return;
  }
  console.log('Brian in MEMBERS:', JSON.stringify(brianMembers, null, 2));

  if (!brianMembers || brianMembers.length === 0) {
    console.log('No Brian found!');
    return;
  }

  const brianMemberId = brianMembers[0].member_id;
  console.log('\nBrian member_id:', brianMemberId);

  console.log('\n=== STEP 2: Check if Brian has enrollees in MEMBERS ===');
  const { data: brianEnrollees, error: error2 } = await supabase
    .from('members')
    .select('member_id, full_name, email, status')
    .eq('enroller_id', brianMemberId);

  if (error2) {
    console.error('Error:', error2);
  } else {
    console.log(`Brian has ${brianEnrollees.length} enrollees in MEMBERS table:`);
    console.log(JSON.stringify(brianEnrollees, null, 2));
  }

  console.log('\n=== STEP 3: Find Brian in DISTRIBUTORS table ===');
  const { data: brianDist, error: error3 } = await supabase
    .from('distributors')
    .select('id, member_id, matrix_parent_id, matrix_position, matrix_depth')
    .eq('member_id', brianMemberId);

  if (error3) {
    console.error('Error:', error3);
  } else {
    console.log('Brian in DISTRIBUTORS:', JSON.stringify(brianDist, null, 2));

    if (brianDist && brianDist.length > 0) {
      const brianDistId = brianDist[0].id;

      console.log('\n=== STEP 4: Check matrix children in DISTRIBUTORS ===');
      const { data: matrixChildren, error: error4 } = await supabase
        .from('distributors')
        .select('id, member_id, matrix_parent_id, matrix_position, matrix_depth')
        .eq('matrix_parent_id', brianDistId);

      if (error4) {
        console.error('Error:', error4);
      } else {
        console.log(`Brian has ${matrixChildren.length} children in DISTRIBUTORS matrix:`);
        console.log(JSON.stringify(matrixChildren, null, 2));
      }
    }
  }

  console.log('\n=== STEP 5: Compare Sella Hall for reference ===');
  const { data: sellaMembers, error: error5 } = await supabase
    .from('members')
    .select('member_id, full_name, email')
    .ilike('full_name', '%Sella%');

  if (!error5 && sellaMembers && sellaMembers.length > 0) {
    const sellaMemberId = sellaMembers[0].member_id;
    console.log('Sella member_id:', sellaMemberId);

    const { data: sellaEnrollees } = await supabase
      .from('members')
      .select('member_id, full_name')
      .eq('enroller_id', sellaMemberId);

    console.log(`Sella has ${sellaEnrollees?.length || 0} enrollees in MEMBERS`);

    const { data: sellaDist } = await supabase
      .from('distributors')
      .select('id, member_id')
      .eq('member_id', sellaMemberId);

    if (sellaDist && sellaDist.length > 0) {
      const { data: sellaMatrixChildren } = await supabase
        .from('distributors')
        .select('id, member_id')
        .eq('matrix_parent_id', sellaDist[0].id);

      console.log(`Sella has ${sellaMatrixChildren?.length || 0} children in DISTRIBUTORS matrix`);
    }
  }
}

investigateBrian().catch(console.error);
