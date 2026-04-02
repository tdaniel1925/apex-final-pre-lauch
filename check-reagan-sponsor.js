import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReaganSponsor() {
  console.log('Looking up Reagan Wolfe...\n');

  const { data: reagan, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, sponsor_id')
    .ilike('first_name', 'reagan')
    .ilike('last_name', 'wolfe')
    .single();

  if (error || !reagan) {
    console.error('Reagan Wolfe not found:', error);
    return;
  }

  console.log('Reagan Wolfe:');
  console.log(`  Email: ${reagan.email}`);
  console.log(`  Slug: ${reagan.slug}`);
  console.log(`  Rep #: ${reagan.rep_number}`);
  console.log(`  Distributor ID: ${reagan.id}`);
  console.log(`  Sponsor ID: ${reagan.sponsor_id || 'NULL (no sponsor)'}`);

  if (reagan.sponsor_id) {
    console.log('\nLooking up sponsor...\n');
    
    const { data: sponsor, error: sponsorError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, rep_number')
      .eq('id', reagan.sponsor_id)
      .single();

    if (sponsor) {
      console.log('Sponsored by:');
      console.log(`  Name: ${sponsor.first_name} ${sponsor.last_name}`);
      console.log(`  Email: ${sponsor.email}`);
      console.log(`  Slug: ${sponsor.slug}`);
      console.log(`  Rep #: ${sponsor.rep_number}`);
      console.log(`  Distributor ID: ${sponsor.id}`);
    } else {
      console.log('Sponsor record not found (orphaned sponsor_id)');
    }
  } else {
    console.log('\n❌ Reagan Wolfe has NO sponsor assigned');
  }
}

checkReaganSponsor();
