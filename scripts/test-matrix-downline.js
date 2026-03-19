// Test script to verify Matrix query issue
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMatrixQuery() {
  console.log('\n=== MATRIX DOWNLINE QUERY TEST ===\n');

  // 1. Find Charles Potter
  console.log('1. Looking for Charles Potter...');
  const { data: charles, error: charlesError } = await supabase
    .from('members')
    .select('member_id, full_name, email')
    .ilike('full_name', '%charles%potter%')
    .single();

  if (charlesError || !charles) {
    console.error('Error finding Charles Potter:', charlesError);
    return;
  }

  console.log(`   Found: ${charles.full_name} (${charles.member_id})`);

  // 2. Query ALL members (current broken approach)
  console.log('\n2. Testing BROKEN query (get all members)...');
  const { data: allMembers, error: allError } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id')
    .eq('status', 'active');

  if (allError) {
    console.error('Error getting all members:', allError);
  } else {
    console.log(`   Retrieved ${allMembers.length} total members`);

    // Filter client-side to find Charles's downline
    const charlesDownline = allMembers.filter(m => m.enroller_id === charles.member_id);
    console.log(`   Charles's direct enrollees (client-side filter): ${charlesDownline.length}`);
    charlesDownline.forEach(m => console.log(`      - ${m.full_name}`));
  }

  // 3. Query direct enrollees only (correct approach)
  console.log('\n3. Testing FIXED query (filter server-side)...');
  const { data: directEnrollees, error: directError } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id, tech_rank, personal_credits_monthly')
    .eq('enroller_id', charles.member_id);

  if (directError) {
    console.error('Error getting direct enrollees:', directError);
  } else {
    console.log(`   Charles's direct enrollees (server-side filter): ${directEnrollees.length}`);
    directEnrollees.forEach(m => {
      console.log(`      - ${m.full_name} (Rank: ${m.tech_rank}, Credits: ${m.personal_credits_monthly})`);
    });
  }

  // 4. Verify Brian specifically
  console.log('\n4. Looking for Brian specifically...');
  const { data: brian, error: brianError } = await supabase
    .from('members')
    .select('member_id, full_name, enroller_id, tech_rank, personal_credits_monthly')
    .ilike('full_name', '%brian%')
    .single();

  if (brianError || !brian) {
    console.error('Error finding Brian:', brianError);
  } else {
    console.log(`   Found: ${brian.full_name}`);
    console.log(`   Enroller ID: ${brian.enroller_id}`);
    console.log(`   Charles ID: ${charles.member_id}`);
    console.log(`   Match: ${brian.enroller_id === charles.member_id ? '✅ YES' : '❌ NO'}`);
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

testMatrixQuery().catch(console.error);
