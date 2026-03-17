// =============================================
// Verify All Distributors Still Exist
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyDistributors() {
  console.log('🔍 Checking distributors database...\n');

  // Count total distributors
  const { count: totalDist } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  console.log(`Total distributors: ${totalDist}`);

  // Get recent distributors with details
  const { data: recentDist } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, slug, rep_number, enroller_id, sponsor_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n📋 Recent 10 distributors:');
  recentDist?.forEach(d => {
    console.log(`  - ${d.first_name} ${d.last_name} (${d.email})`);
    console.log(`    Rep #: ${d.rep_number || 'N/A'}`);
    console.log(`    Slug: /${d.slug}`);
    console.log(`    Enroller: ${d.enroller_id ? 'Yes' : 'None'}`);
    console.log(`    Created: ${d.created_at}\n`);
  });

  // Check member records match
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  console.log(`Total member records: ${totalMembers}`);
  console.log(`Match: ${totalDist === totalMembers ? '✅ YES - Every distributor has a member record' : '❌ NO - Mismatch'}`);

  // Check specific users
  const checkEmails = ['tdaniel@botmakers.ai', 'sellag.sb@gmail.com', 'phil@valorfs.com'];
  console.log('\n🔍 Checking specific users:');

  for (const email of checkEmails) {
    const { data: dist } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, rep_number')
      .eq('email', email)
      .single();

    if (dist) {
      console.log(`  ✅ ${dist.first_name} ${dist.last_name} (${email})`);
      console.log(`     Rep #${dist.rep_number || 'N/A'} | @${dist.slug}`);

      // Check member record
      const { data: member } = await supabase
        .from('members')
        .select('member_id, tech_rank, personal_credits_monthly')
        .eq('distributor_id', dist.id)
        .single();

      if (member) {
        console.log(`     Member record: ✅ Rank: ${member.tech_rank}, Credits: ${member.personal_credits_monthly}`);
      } else {
        console.log('     Member record: ❌ MISSING');
      }
    } else {
      console.log(`  ❌ Not found: ${email}`);
    }
    console.log('');
  }

  console.log('\n✅ Verification complete!');
}

verifyDistributors().catch(console.error);
