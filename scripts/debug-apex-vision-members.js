require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugApexVisionMembers() {
  console.log('='.repeat(70));
  console.log('DEBUG: APEX VISION MEMBERS TABLE');
  console.log('='.repeat(70));
  console.log();

  // 1. Find Apex Vision distributor
  console.log('1. Finding Apex Vision distributor...');
  const { data: apexDist } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, is_master')
    .eq('is_master', true)
    .single();

  if (!apexDist) {
    console.log('❌ Apex Vision distributor NOT FOUND');
    return;
  }

  console.log('✅ Apex Vision distributor found:');
  console.log('   ID:', apexDist.id);
  console.log('   Name:', apexDist.first_name, apexDist.last_name);
  console.log('   Email:', apexDist.email);
  console.log('   Slug:', apexDist.slug);
  console.log('   Rep #:', apexDist.rep_number);
  console.log();

  // 2. Check if Apex Vision has a member record
  console.log('2. Checking if Apex Vision has a member record...');
  const { data: apexMember } = await supabase
    .from('members')
    .select('*')
    .eq('distributor_id', apexDist.id)
    .single();

  if (!apexMember) {
    console.log('❌ Apex Vision has NO member record!');
    console.log('   This is the problem - Apex Vision needs a member record');
    console.log();
  } else {
    console.log('✅ Apex Vision member record found:');
    console.log('   Member ID:', apexMember.member_id);
    console.log('   Full Name:', apexMember.full_name);
    console.log('   Enroller ID:', apexMember.enroller_id || 'None (root)');
    console.log();

    // 3. Check who is enrolled under Apex Vision
    console.log('3. Checking who is enrolled under Apex Vision...');
    const { data: enrollees } = await supabase
      .from('members')
      .select('member_id, full_name, distributor_id, enroller_id, created_at')
      .eq('enroller_id', apexMember.member_id)
      .order('created_at', { ascending: true });

    if (!enrollees || enrollees.length === 0) {
      console.log('⚠️  NO ONE enrolled under Apex Vision in members table');
      console.log('   Checking distributors.sponsor_id instead...');
      console.log();

      // Check distributors.sponsor_id
      const { data: sponsors } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug, rep_number')
        .eq('sponsor_id', apexDist.id)
        .order('rep_number', { ascending: true });

      if (sponsors && sponsors.length > 0) {
        console.log(`✅ Found ${sponsors.length} distributors with Apex Vision as sponsor:`);
        sponsors.slice(0, 10).forEach((s, idx) => {
          console.log(`   ${idx + 1}. ${s.first_name} ${s.last_name} (${s.slug}) - Rep #${s.rep_number}`);
        });
        if (sponsors.length > 10) {
          console.log(`   ... and ${sponsors.length - 10} more`);
        }
        console.log();
        console.log('⚠️  DATA MISMATCH FOUND:');
        console.log('   - distributors.sponsor_id points to Apex Vision');
        console.log('   - BUT members.enroller_id does NOT');
        console.log('   - This is why the Matrix page shows 0 team members');
      }
    } else {
      console.log(`✅ Found ${enrollees.length} members enrolled under Apex Vision:`);
      enrollees.slice(0, 10).forEach((e, idx) => {
        console.log(`   ${idx + 1}. ${e.full_name} - Member ID: ${e.member_id}`);
      });
      if (enrollees.length > 10) {
        console.log(`   ... and ${enrollees.length - 10} more`);
      }
    }
  }

  console.log();
  console.log('='.repeat(70));
  console.log('4. Checking ALL members and their enroller_id...');
  const { data: allMembers } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id')
    .order('created_at', { ascending: true })
    .limit(20);

  if (allMembers) {
    console.log(`First 20 members:`);
    allMembers.forEach((m, idx) => {
      console.log(`   ${idx + 1}. ${m.full_name} - Enroller ID: ${m.enroller_id || 'NULL'}`);
    });
  }

  console.log();
  console.log('='.repeat(70));
  console.log('DIAGNOSIS:');
  console.log('='.repeat(70));

  if (!apexMember) {
    console.log('❌ PROBLEM: Apex Vision has no member record');
    console.log('   SOLUTION: Create member record for Apex Vision');
  } else {
    const { data: enrollees } = await supabase
      .from('members')
      .select('member_id')
      .eq('enroller_id', apexMember.member_id);

    if (!enrollees || enrollees.length === 0) {
      console.log('❌ PROBLEM: No members have enroller_id pointing to Apex Vision');
      console.log('   BUT distributors.sponsor_id points to Apex Vision');
      console.log('   SOLUTION: Sync members.enroller_id with distributors.sponsor_id');
    } else {
      console.log('✅ Everything looks correct');
      console.log(`   ${enrollees.length} members enrolled under Apex Vision`);
    }
  }

  console.log('='.repeat(70));
}

debugApexVisionMembers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
