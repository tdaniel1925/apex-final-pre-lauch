// =============================================
// Check Member Records Status
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRecords() {
  console.log('📊 Checking member records status...\n');

  // Count total distributors
  const { count: distCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  console.log(`Total distributors: ${distCount}`);

  // Count total members
  const { count: memberCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  console.log(`Total members: ${memberCount}`);

  // Find distributors WITHOUT member records
  const { data: distributors } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (distributors) {
    const missing = [];
    for (const dist of distributors) {
      const { data: member } = await supabase
        .from('members')
        .select('member_id')
        .eq('distributor_id', dist.id)
        .single();

      if (!member) {
        missing.push(dist);
      }
    }

    console.log(`\nDistributors without member records: ${missing.length}`);

    if (missing.length > 0) {
      console.log('\nMissing member records for:');
      missing.forEach(d => {
        console.log(`  - ${d.email} (${d.first_name} ${d.last_name}) - created ${d.created_at}`);
      });
    }
  }

  console.log('\n✅ Done!');
}

checkRecords().catch(console.error);
