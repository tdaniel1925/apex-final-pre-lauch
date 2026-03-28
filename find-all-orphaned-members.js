const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findOrphanedMembers() {
  console.log('=== FINDING ALL ORPHANED MEMBERS ===\n');
  console.log('Searching for members with enroller_id = NULL...\n');

  // Step 1: Find all members with NULL enroller_id
  const { data: orphanedMembers, error } = await supabase
    .from('members')
    .select('member_id, distributor_id, full_name, email, status, created_at, enroller_id')
    .is('enroller_id', null)
    .order('created_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${orphanedMembers?.length || 0} members with NULL enroller_id\n`);

  if (!orphanedMembers || orphanedMembers.length === 0) {
    console.log('✅ No orphaned members found! All members are properly assigned.');
    return;
  }

  const fixes = [];
  const cannotFix = [];

  for (const member of orphanedMembers) {
    console.log(`\n--- ${member.full_name} ---`);
    console.log(`Email: ${member.email}`);
    console.log(`Member ID: ${member.member_id}`);
    console.log(`Created: ${member.created_at}`);
    console.log(`Status: ${member.status}`);

    // Step 2: Check if this member has a distributor record
    if (member.distributor_id) {
      const { data: distributor } = await supabase
        .from('distributors')
        .select('id, sponsor_id, slug, first_name, last_name')
        .eq('id', member.distributor_id)
        .single();

      if (distributor) {
        console.log(`Distributor: ${distributor.first_name} ${distributor.last_name} (@${distributor.slug})`);
        console.log(`Sponsor ID: ${distributor.sponsor_id || 'NULL'}`);

        // Step 3: If distributor has a sponsor_id, find the sponsor's member_id
        if (distributor.sponsor_id) {
          const { data: sponsorMember } = await supabase
            .from('members')
            .select('member_id, full_name')
            .eq('distributor_id', distributor.sponsor_id)
            .single();

          if (sponsorMember) {
            console.log(`✅ FOUND SPONSOR: ${sponsorMember.full_name}`);
            console.log(`   Should be enrolled under: ${sponsorMember.member_id}`);

            fixes.push({
              member_id: member.member_id,
              member_name: member.full_name,
              enroller_id: sponsorMember.member_id,
              enroller_name: sponsorMember.full_name,
              sponsor_id: distributor.sponsor_id
            });
          } else {
            console.log(`⚠️  Sponsor distributor ID ${distributor.sponsor_id} exists but no member record found`);
            cannotFix.push({
              member_id: member.member_id,
              member_name: member.full_name,
              reason: 'Sponsor has no member record',
              sponsor_distributor_id: distributor.sponsor_id
            });
          }
        } else {
          console.log(`⚠️  Distributor has NO sponsor_id - likely master distributor or orphan`);
          cannotFix.push({
            member_id: member.member_id,
            member_name: member.full_name,
            reason: 'No sponsor_id in distributor record'
          });
        }
      }
    } else {
      console.log(`⚠️  No distributor_id - cannot determine sponsor`);
      cannotFix.push({
        member_id: member.member_id,
        member_name: member.full_name,
        reason: 'No distributor_id'
      });
    }
  }

  // Summary
  console.log('\n\n=== SUMMARY ===\n');
  console.log(`Total orphaned members: ${orphanedMembers.length}`);
  console.log(`Can be fixed: ${fixes.length} ✅`);
  console.log(`Cannot be fixed: ${cannotFix.length} ⚠️`);

  if (fixes.length > 0) {
    console.log('\n=== MEMBERS THAT CAN BE FIXED ===\n');
    fixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. ${fix.member_name} → should be under ${fix.enroller_name}`);
    });

    console.log('\n=== SQL FIX SCRIPT ===\n');
    console.log('-- Run this to fix all orphaned members:\n');
    fixes.forEach(fix => {
      console.log(`UPDATE members SET enroller_id = '${fix.enroller_id}' WHERE member_id = '${fix.member_id}'; -- ${fix.member_name} → ${fix.enroller_name}`);
    });

    // Save to file
    const fs = require('fs');
    const fixScript = fixes.map(fix =>
      `UPDATE members SET enroller_id = '${fix.enroller_id}' WHERE member_id = '${fix.member_id}'; -- ${fix.member_name} → ${fix.enroller_name}`
    ).join('\n');

    fs.writeFileSync('fix-orphaned-members.sql', fixScript);
    console.log('\n✅ SQL script saved to: fix-orphaned-members.sql');
  }

  if (cannotFix.length > 0) {
    console.log('\n=== MEMBERS THAT CANNOT BE AUTO-FIXED ===\n');
    cannotFix.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.member_name}`);
      console.log(`   Reason: ${item.reason}`);
      if (item.sponsor_distributor_id) {
        console.log(`   Sponsor Distributor ID: ${item.sponsor_distributor_id}`);
      }
      console.log('');
    });
    console.log('These require manual investigation.');
  }

  return { fixes, cannotFix };
}

findOrphanedMembers().catch(console.error);
