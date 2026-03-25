/**
 * Check the most recent signup for AI provisioning issues
 */

import { createServiceClient } from '../src/lib/supabase/service';

const supabase = createServiceClient();

async function checkRecentSignup() {
  console.log('🔍 Checking most recent signup...\n');

  // Get the most recent distributor
  const { data: recent, error } = await supabase
    .from('distributors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !recent) {
    console.error('❌ No recent signups found:', error);
    return;
  }

  console.log('📋 Most Recent Signup:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Name: ${recent.first_name} ${recent.last_name}`);
  console.log(`Email: ${recent.email}`);
  console.log(`Slug: ${recent.slug}`);
  console.log(`ID: ${recent.id}`);
  console.log(`Status: ${recent.status}`);
  console.log(`Created: ${recent.created_at}`);
  console.log('');

  console.log('📞 AI Phone Provisioning:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`AI Phone Number: ${recent.ai_phone_number || '❌ NOT PROVISIONED'}`);
  console.log(`VAPI Assistant ID: ${recent.vapi_assistant_id || '❌ NOT CREATED'}`);
  console.log(`VAPI Phone ID: ${recent.vapi_phone_number_id || '❌ NOT CREATED'}`);
  console.log(`AI Minutes Balance: ${recent.ai_minutes_balance || 0}`);
  console.log(`AI Trial Expires: ${recent.ai_trial_expires_at || 'N/A'}`);
  console.log(`AI Provisioned At: ${recent.ai_provisioned_at || 'N/A'}`);
  console.log('');

  // Check if AI provisioning was attempted
  if (!recent.ai_phone_number && !recent.vapi_assistant_id) {
    console.log('⚠️  AI PROVISIONING ISSUE DETECTED');
    console.log('');
    console.log('Possible causes:');
    console.log('1. AI provisioning API endpoint not called during signup');
    console.log('2. VAPI API call failed (check VAPI_API_KEY in .env.local)');
    console.log('3. Signup route not triggering AI provisioning');
    console.log('4. Background job failed to provision');
    console.log('');
    console.log('💡 Solution: Check signup route at src/app/api/signup/route.ts');
    console.log('   Line ~230-250 should call provision-ai endpoint');
  } else if (recent.ai_phone_number) {
    console.log('✅ AI provisioning successful!');
  }

  // Check member record
  console.log('\n👤 Member Record:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('distributor_id', recent.id)
    .single();

  if (member) {
    console.log(`✅ Member record exists`);
    console.log(`   Member ID: ${member.member_id}`);
    console.log(`   Status: ${member.status}`);
    console.log(`   Tech Rank: ${member.tech_rank}`);
  } else {
    console.log('❌ Member record NOT found');
  }

  // Check auth user
  console.log('\n🔐 Auth User:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(u => u.email === recent.email);

  if (authUser) {
    console.log(`✅ Auth user exists`);
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Last Sign In: ${authUser.last_sign_in_at || 'Never'}`);
  } else {
    console.log('❌ Auth user NOT found');
  }
}

checkRecentSignup()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
