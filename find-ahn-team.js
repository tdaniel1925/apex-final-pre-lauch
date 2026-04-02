import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAhnTeam() {
  console.log('========================================');
  console.log('Finding Ahn Doan\'s Team Members');
  console.log('========================================\n');

  // Step 1: Find Ahn Doan
  console.log('Step 1: Looking up Ahn Doan...\n');
  const { data: ahn, error: ahnError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number')
    .ilike('first_name', 'anh')
    .ilike('last_name', 'doan')
    .single();

  if (ahnError || !ahn) {
    console.error('❌ Ahn Doan not found:', ahnError);
    return;
  }

  console.log('✅ Found Ahn Doan:');
  console.log(`   Name: ${ahn.first_name} ${ahn.last_name}`);
  console.log(`   Email: ${ahn.email}`);
  console.log(`   Slug: ${ahn.slug}`);
  console.log(`   Rep #: ${ahn.rep_number}`);
  console.log(`   Distributor ID: ${ahn.id}`);
  console.log('');

  // Step 2: Find direct enrollees (sponsor_id = ahn.id)
  console.log('Step 2: Finding direct enrollees (personal recruits)...\n');
  const { data: directEnrollees, error: enrollError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, created_at')
    .eq('sponsor_id', ahn.id)
    .order('created_at', { ascending: true });

  if (enrollError) {
    console.error('❌ Error finding enrollees:', enrollError);
  } else if (!directEnrollees || directEnrollees.length === 0) {
    console.log('📋 Ahn has NO direct enrollees');
  } else {
    console.log(`📋 Ahn has ${directEnrollees.length} direct enrollees:\n`);
    directEnrollees.forEach((member, index) => {
      console.log(`${index + 1}. ${member.first_name} ${member.last_name}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Slug: ${member.slug}`);
      console.log(`   Rep #: ${member.rep_number}`);
      console.log(`   Enrolled: ${new Date(member.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════\n');

  // Step 3: Find matrix children (matrix_parent_id = ahn.id)
  console.log('Step 3: Finding matrix children (in Ahn\'s matrix)...\n');
  const { data: matrixChildren, error: matrixError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, matrix_position, matrix_depth')
    .eq('matrix_parent_id', ahn.id)
    .order('matrix_position', { ascending: true });

  if (matrixError) {
    console.error('❌ Error finding matrix children:', matrixError);
  } else if (!matrixChildren || matrixChildren.length === 0) {
    console.log('📋 Ahn has NO matrix children');
  } else {
    console.log(`📋 Ahn has ${matrixChildren.length} matrix children:\n`);
    matrixChildren.forEach((member, index) => {
      console.log(`${index + 1}. ${member.first_name} ${member.last_name} (Position ${member.matrix_position})`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Slug: ${member.slug}`);
      console.log(`   Rep #: ${member.rep_number}`);
      console.log(`   Matrix Depth: ${member.matrix_depth}`);
      console.log('');
    });
  }

  console.log('========================================');
  console.log('SUMMARY:');
  console.log('========================================');
  console.log(`Direct Enrollees (Sponsor Tree): ${directEnrollees?.length || 0}`);
  console.log(`Matrix Children (Matrix Tree): ${matrixChildren?.length || 0}`);
  console.log('========================================');
}

findAhnTeam();
