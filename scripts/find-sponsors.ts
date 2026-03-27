// Quick script to find sponsors
import { createServiceClient } from '@/lib/supabase/service';

async function findSponsors() {
  const supabase = createServiceClient();

  // Find Dominick Nguyen and Tuan Phan
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, sponsor_id')
    .or('first_name.ilike.%dominick%,first_name.ilike.%tuan%');

  if (error) {
    console.error('Error fetching distributors:', error);
    return;
  }

  // Fetch sponsor info for each
  for (const dist of distributors || []) {
    if (dist.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email')
        .eq('id', dist.sponsor_id)
        .single();

      (dist as any).sponsor = sponsor;
    }
  }

  console.log('\n📋 Sponsor Information:\n');

  for (const dist of distributors || []) {
    console.log(`👤 ${dist.first_name} ${dist.last_name} (${dist.email})`);
    if (dist.sponsor) {
      console.log(`   └─ Sponsored by: ${dist.sponsor.first_name} ${dist.sponsor.last_name} (${dist.sponsor.email})`);
    } else {
      console.log(`   └─ Sponsored by: NONE (Root distributor)`);
    }
    console.log('');
  }
}

findSponsors().catch(console.error);
