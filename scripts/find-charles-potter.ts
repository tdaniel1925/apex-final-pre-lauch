import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findCharlesPotter() {
  console.log('\n=== SEARCHING FOR CHARLES POTTER ===\n');

  const { data: users, error } = await supabase
    .from('distributors')
    .select('*')
    .or('first_name.ilike.%charles%,last_name.ilike.%potter%,email.ilike.%potter%,email.ilike.%charles%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('❌ No users found matching "Charles Potter"');
    return;
  }

  for (const user of users) {
    console.log(`📋 ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Rep #: ${user.rep_number || 'None'}`);
    console.log(`   Slug: /${user.slug}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    
    if (user.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name, email, slug')
        .eq('id', user.sponsor_id)
        .single();
      
      if (sponsor) {
        console.log(`   👤 Sponsor: ${sponsor.first_name} ${sponsor.last_name} (/${sponsor.slug})`);
      }
    } else {
      console.log(`   ⚠️ No sponsor`);
    }

    if (user.matrix_parent_id) {
      const { data: parent } = await supabase
        .from('distributors')
        .select('first_name, last_name, email, slug')
        .eq('id', user.matrix_parent_id)
        .single();
      
      if (parent) {
        console.log(`   📍 Matrix Parent: ${parent.first_name} ${parent.last_name} (/${parent.slug})`);
        console.log(`   📍 Matrix Position: ${user.matrix_position} | Depth: ${user.matrix_depth}`);
      }
    } else {
      console.log(`   📍 Matrix: Not placed`);
    }

    console.log(`   ============================================================\n`);
  }

  console.log(`\n✅ Found ${users.length} result(s)\n`);
}

findCharlesPotter();
