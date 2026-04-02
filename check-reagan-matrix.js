import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReaganMatrix() {
  const { data: reagan } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, sponsor_id, matrix_parent_id, matrix_position, matrix_depth')
    .ilike('first_name', 'reagan')
    .ilike('last_name', 'wolfe')
    .single();

  console.log('Reagan Wolfe Matrix Info:');
  console.log('  Sponsor ID:', reagan.sponsor_id);
  console.log('  Matrix Parent ID:', reagan.matrix_parent_id || 'NULL');
  console.log('  Matrix Position:', reagan.matrix_position || 'NULL');
  console.log('  Matrix Depth:', reagan.matrix_depth || 'NULL');

  if (reagan.sponsor_id) {
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug')
      .eq('id', reagan.sponsor_id)
      .single();
    console.log('\nSponsor:', sponsor ? `${sponsor.first_name} ${sponsor.last_name}` : 'Not found');
  }

  if (reagan.matrix_parent_id) {
    const { data: matrixParent } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug')
      .eq('id', reagan.matrix_parent_id)
      .single();
    console.log('Matrix Parent:', matrixParent ? `${matrixParent.first_name} ${matrixParent.last_name}` : 'Not found');
  } else {
    console.log('\n❌ Reagan is NOT in the matrix tree (matrix_parent_id is NULL)');
  }
}

checkReaganMatrix();
