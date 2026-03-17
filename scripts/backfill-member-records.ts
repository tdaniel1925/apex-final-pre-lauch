// =============================================
// Backfill Member Records
// Creates member record for each distributor
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function backfillMembers() {
  console.log('🚀 Backfilling member records...\n');

  // Get all distributors
  const { data: distributors, error: distError } = await supabase
    .from('distributors')
    .select('*')
    .order('created_at', { ascending: true });

  if (distError || !distributors) {
    console.error('❌ Error fetching distributors:', distError);
    return;
  }

  console.log(`Found ${distributors.length} distributors\n`);

  // Create member records
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const dist of distributors) {
    // Check if member already exists
    const { data: existing } = await supabase
      .from('members')
      .select('member_id')
      .eq('distributor_id', dist.id)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Find enroller's member_id (if they have one)
    let enrollerMemberId = null;
    if (dist.enroller_id) {
      const { data: enrollerMember } = await supabase
        .from('members')
        .select('member_id')
        .eq('distributor_id', dist.enroller_id)
        .single();

      if (enrollerMember) {
        enrollerMemberId = enrollerMember.member_id;
      }
    }

    // Find sponsor's member_id (if they have one)
    let sponsorMemberId = null;
    if (dist.sponsor_id) {
      const { data: sponsorMember } = await supabase
        .from('members')
        .select('member_id')
        .eq('distributor_id', dist.sponsor_id)
        .single();

      if (sponsorMember) {
        sponsorMemberId = sponsorMember.member_id;
      }
    }

    // Create member record
    const { error: insertError } = await supabase
      .from('members')
      .insert({
        distributor_id: dist.id,
        email: dist.email,
        full_name: `${dist.first_name} ${dist.last_name}`,
        enroller_id: enrollerMemberId,
        sponsor_id: sponsorMemberId,
        status: 'active',
        enrollment_date: dist.created_at,
        tech_rank: 'starter',
        highest_tech_rank: 'starter',
        insurance_rank: 'inactive',
        highest_insurance_rank: 'inactive',
        personal_credits_monthly: 0,
        team_credits_monthly: 0,
        tech_personal_credits_monthly: 0,
        tech_team_credits_monthly: 0,
        insurance_personal_credits_monthly: 0,
        insurance_team_credits_monthly: 0,
        override_qualified: false,
      });

    if (insertError) {
      console.error(`❌ Failed to create member for ${dist.email}:`, insertError.message);
      failed++;
    } else {
      console.log(`✅ Created member for ${dist.email}`);
      created++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);

  // Update enroller/sponsor references (second pass)
  console.log(`\n🔗 Updating enroller/sponsor references...`);

  const { data: allMembers } = await supabase
    .from('members')
    .select('member_id, distributor_id');

  if (allMembers) {
    const memberMap = new Map(allMembers.map(m => [m.distributor_id, m.member_id]));

    for (const dist of distributors) {
      const memberId = memberMap.get(dist.id);
      if (!memberId) continue;

      const enrollerMemberId = dist.enroller_id ? memberMap.get(dist.enroller_id) : null;
      const sponsorMemberId = dist.sponsor_id ? memberMap.get(dist.sponsor_id) : null;

      if (enrollerMemberId || sponsorMemberId) {
        await supabase
          .from('members')
          .update({
            enroller_id: enrollerMemberId,
            sponsor_id: sponsorMemberId,
          })
          .eq('member_id', memberId);
      }
    }

    console.log('✅ Updated enroller/sponsor references');
  }

  console.log('\n✅ Done!');
}

backfillMembers().catch(console.error);
