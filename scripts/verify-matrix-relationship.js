// =============================================
// Quick Matrix Relationship Verification Script
// =============================================
// Purpose: Verify Charles Potter → Brian Rawlston relationship
// Usage: node scripts/verify-matrix-relationship.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure .env.local has:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMatrixRelationship() {
  console.log('\n========================================');
  console.log('🔍 Matrix Relationship Verification');
  console.log('========================================\n');

  // Step 1: Find Charles
  console.log('STEP 1: Finding Charles Potter...');
  const { data: charlesMember, error: charlesError } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id, tech_rank, status')
    .ilike('full_name', '%charles%potter%')
    .single();

  if (charlesError || !charlesMember) {
    console.log('❌ Charles Potter not found in members table');
    console.log('   Error:', charlesError?.message);
    process.exit(1);
  }

  console.log('✅ Charles Potter found:');
  console.log('   Member ID:', charlesMember.member_id);
  console.log('   Full Name:', charlesMember.full_name);
  console.log('   Tech Rank:', charlesMember.tech_rank);
  console.log('   Status:', charlesMember.status);

  // Step 2: Find Brian
  console.log('\nSTEP 2: Finding Brian Rawlston...');
  const { data: brianMember, error: brianError } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id, tech_rank, status')
    .ilike('full_name', '%brian%rawlston%')
    .single();

  if (brianError || !brianMember) {
    console.log('❌ Brian Rawlston not found in members table');
    console.log('   Error:', brianError?.message);
    process.exit(1);
  }

  console.log('✅ Brian Rawlston found:');
  console.log('   Member ID:', brianMember.member_id);
  console.log('   Full Name:', brianMember.full_name);
  console.log('   Enroller ID:', brianMember.enroller_id);
  console.log('   Tech Rank:', brianMember.tech_rank);
  console.log('   Status:', brianMember.status);

  // Step 3: Verify Relationship
  console.log('\nSTEP 3: Verifying enrollment relationship...');
  const relationshipValid = brianMember.enroller_id === charlesMember.member_id;

  if (relationshipValid) {
    console.log('✅ RELATIONSHIP CONFIRMED!');
    console.log('   Brian.enroller_id === Charles.member_id');
    console.log('   Brian IS enrolled by Charles');
  } else {
    console.log('❌ RELATIONSHIP NOT FOUND');
    console.log('   Expected enroller_id:', charlesMember.member_id);
    console.log('   Actual enroller_id:', brianMember.enroller_id);

    // Try to find who Brian is enrolled by
    if (brianMember.enroller_id) {
      const { data: actualEnroller } = await supabase
        .from('members')
        .select('full_name')
        .eq('member_id', brianMember.enroller_id)
        .single();

      if (actualEnroller) {
        console.log('   Brian is enrolled by:', actualEnroller.full_name);
      }
    }
  }

  // Step 4: Get all of Charles's enrollees
  console.log('\nSTEP 4: Finding all Charles\'s direct enrollees (Level 1)...');
  const { data: enrollees, error: enrolleesError } = await supabase
    .from('members')
    .select('member_id, full_name, tech_rank, personal_credits_monthly, status')
    .eq('enroller_id', charlesMember.member_id);

  if (enrolleesError) {
    console.log('❌ Error fetching enrollees:', enrolleesError.message);
  } else {
    console.log(`✅ Charles has ${enrollees?.length || 0} direct enrollees:`);
    enrollees?.forEach((e, i) => {
      const isBrian = e.full_name.toLowerCase().includes('brian');
      const marker = isBrian ? '👉 ' : '   ';
      console.log(`${marker}${i + 1}. ${e.full_name} (${e.tech_rank}, ${e.personal_credits_monthly} credits)`);
    });

    // Check if Brian is in the list
    const brianInList = enrollees?.some(e => e.member_id === brianMember.member_id);
    if (brianInList) {
      console.log('\n✅ Brian is in the list of Charles\'s enrollees');
    } else {
      console.log('\n❌ Brian is NOT in the list of Charles\'s enrollees');
    }
  }

  // Step 5: Check distributor records
  console.log('\nSTEP 5: Checking distributor records...');
  const { data: charlesDistributor } = await supabase
    .from('distributors')
    .select('id, email, rep_number')
    .eq('email', 'fyifromcharles@gmail.com')
    .single();

  const { data: brianDistributor } = await supabase
    .from('distributors')
    .select('id, email, rep_number, sponsor_id')
    .eq('email', 'bclaybornr@gmail.com')
    .single();

  if (charlesDistributor) {
    console.log('✅ Charles distributor record:');
    console.log('   Email:', charlesDistributor.email);
    console.log('   Rep #:', charlesDistributor.rep_number);
  }

  if (brianDistributor) {
    console.log('✅ Brian distributor record:');
    console.log('   Email:', brianDistributor.email);
    console.log('   Rep #:', brianDistributor.rep_number);
    console.log('   Sponsor ID:', brianDistributor.sponsor_id);

    if (brianDistributor.sponsor_id === charlesDistributor?.id) {
      console.log('   ✅ Brian.sponsor_id === Charles.id (distributor level)');
    } else {
      console.log('   ⚠️ sponsor_id does not match Charles (this is OK - members table is source of truth)');
    }
  }

  // Final Summary
  console.log('\n========================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('========================================');
  console.log(`Charles Member ID: ${charlesMember.member_id}`);
  console.log(`Brian Member ID: ${brianMember.member_id}`);
  console.log(`Brian Enroller ID: ${brianMember.enroller_id}`);
  console.log(`Relationship Valid: ${relationshipValid ? '✅ YES' : '❌ NO'}`);
  console.log(`Total Enrollees: ${enrollees?.length || 0}`);
  console.log('========================================\n');

  if (relationshipValid) {
    console.log('🎉 SUCCESS! Brian is enrolled by Charles.');
    console.log('   If Brian doesn\'t appear in Matrix view, it\'s a rendering issue.');
    console.log('   Run: npm run test:e2e -- tests/e2e/matrix-debug-charles-brian.spec.ts');
    process.exit(0);
  } else {
    console.log('⚠️ WARNING! Relationship not found in database.');
    console.log('   This needs to be investigated.');
    process.exit(1);
  }
}

verifyMatrixRelationship().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
