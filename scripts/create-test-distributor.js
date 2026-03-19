const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createTestDistributor() {
  console.log('🔧 Creating Test Distributor for Autopilot Tests...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Test user credentials
  const testEmail = 'test-autopilot@apexaffinity.com';
  const testPassword = 'TestPassword123!';

  console.log('📧 Test Email:', testEmail);
  console.log('🔑 Test Password:', testPassword);
  console.log('');

  try {
    // Step 1: Check if test user already exists
    console.log('🔍 Checking for existing test user...');

    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const testUser = existingUser.users.find(u => u.email === testEmail);

    let authUserId;

    if (testUser) {
      console.log('✅ Test user already exists:', testUser.id);
      authUserId = testUser.id;
    } else {
      // Step 2: Create auth user
      console.log('📝 Creating auth user...');

      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Autopilot User',
        }
      });

      if (authError) {
        console.log('❌ Auth error:', authError.message);
        return;
      }

      authUserId = newUser.user.id;
      console.log('✅ Auth user created:', authUserId);
    }

    // Step 3: Check if distributor record exists
    console.log('\n🔍 Checking for distributor record...');

    const { data: existingDist } = await supabase
      .from('distributors')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    let distributorId;

    if (existingDist) {
      console.log('✅ Distributor already exists:', existingDist.id);
      distributorId = existingDist.id;
    } else {
      // Step 4: Use the atomic signup function
      console.log('📝 Creating distributor and member via atomic signup...');

      const { data: signupData, error: signupError } = await supabase.rpc('atomic_personal_signup', {
        p_auth_user_id: authUserId,
        p_email: testEmail,
        p_first_name: 'Test',
        p_last_name: 'Autopilot',
        p_phone: '+1234567890',
        p_sponsor_slug: 'apex-vision',
        p_affiliate_code: 'TEST-AUTO',
      });

      if (signupError) {
        console.log('❌ Signup error:', signupError.message);
        return;
      }

      distributorId = signupData.distributor_id;
      console.log('✅ Distributor and member created:', distributorId);
    }

    // Member is created automatically by atomic_personal_signup
    console.log('✅ Member created automatically via atomic signup');

    // Step 5: Check if autopilot subscription exists
    console.log('\n🔍 Checking for Autopilot subscription...');

    const { data: existingSub } = await supabase
      .from('autopilot_subscriptions')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    if (existingSub) {
      console.log('✅ Autopilot subscription already exists:', existingSub.tier);
    } else {
      // Step 8: Create FREE tier subscription
      console.log('📝 Creating FREE tier subscription...');

      const { data: newSub, error: subError } = await supabase
        .from('autopilot_subscriptions')
        .insert({
          distributor_id: distributorId,
          tier: 'free',
          status: 'active',
        })
        .select()
        .single();

      if (subError) {
        console.log('❌ Subscription error:', subError.message);
        return;
      }

      console.log('✅ Subscription created:', newSub.id);
    }

    // Step 9: Check if usage limits exist
    console.log('\n🔍 Checking for usage limits...');

    const { data: existingLimits } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    if (existingLimits) {
      console.log('✅ Usage limits already exist');
    } else {
      // Step 10: Create usage limits
      console.log('📝 Creating usage limits...');

      const { data: newLimits, error: limitsError } = await supabase
        .from('autopilot_usage_limits')
        .insert({
          distributor_id: distributorId,
          email_invites_used: 0,
          sms_messages_used: 0,
          social_posts_used: 0,
          event_flyers_used: 0,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (limitsError) {
        console.log('❌ Limits error:', limitsError.message);
        return;
      }

      console.log('✅ Usage limits created');
    }

    // Summary
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('✅ TEST DISTRIBUTOR SETUP COMPLETE');
    console.log('═══════════════════════════════════════════════\n');

    console.log('📋 Test Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Distributor ID: ${distributorId}`);
    console.log(`   Auth User ID: ${authUserId}`);

    console.log('\n📝 Add this to your test files:');
    console.log(`   const TEST_DISTRIBUTOR_ID = '${distributorId}';`);
    console.log(`   const TEST_EMAIL = '${testEmail}';`);
    console.log(`   const TEST_PASSWORD = '${testPassword}';`);

    console.log('\n🧪 You can now run the Autopilot tests:');
    console.log('   npm test -- tests/unit/autopilot');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

createTestDistributor().catch(console.error);
