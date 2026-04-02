import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDistributorsWithoutSponsor() {
  console.log('Finding distributors without a personal sponsor...\n');

  // Query distributors where sponsor_id is null
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, created_at, sponsor_id')
    .is('sponsor_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error querying distributors:', error);
    return;
  }

  console.log(`Found ${distributors.length} distributors without a personal sponsor:\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  distributors.forEach((dist, index) => {
    console.log(`${index + 1}. ${dist.first_name} ${dist.last_name}`);
    console.log(`   Email: ${dist.email}`);
    console.log(`   Slug: ${dist.slug}`);
    console.log(`   Rep #: ${dist.rep_number || 'N/A'}`);
    console.log(`   Created: ${new Date(dist.created_at).toLocaleDateString()}`);
    console.log(`   Distributor ID: ${dist.id}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`\nTotal: ${distributors.length} distributors without a sponsor`);
}

findDistributorsWithoutSponsor();
