import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  console.log('🧪 Creating test distributor user...\n');

  const testEmail = 'test.distributor@apex.com';
  const testPassword = 'TestPassword123!';

  try {
    // 1. Create auth user
    console.log('1️⃣ Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Distributor',
      },
    });

    if (authError) {
      if (authError.message.includes('already') || authError.code === 'email_exists') {
        console.log('⚠️  Auth user already exists, continuing...\n');

        // Get existing user
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === testEmail);

        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }

        console.log(`✅ Found existing auth user: ${existingUser.id}\n`);

        // Check if distributor record exists
        const { data: existingDist } = await supabase
          .from('distributors')
          .select('*')
          .eq('auth_user_id', existingUser.id)
          .single();

        if (existingDist) {
          console.log('✅ Test distributor already fully set up!');
          console.log(`   Distributor ID: ${existingDist.id}`);
          console.log('\n📧 Test User Credentials:');
          console.log('   Email:', testEmail);
          console.log('   Password:', testPassword);
          console.log('\n🎉 Ready to run tests!\n');
          return;
        }

        console.log('📝 Distributor record missing, creating it now...\n');

        // Create distributor record for existing auth user
        await createDistributorRecord(existingUser.id);
        return;
      }
      throw authError;
    }

    console.log(`✅ Auth user created: ${authData.user.id}\n`);

    // 2. Create distributor record
    await createDistributorRecord(authData.user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

async function createDistributorRecord(userId: string) {
  console.log('2️⃣ Creating distributor record...');

  const { error: distError } = await supabase.from('distributors').insert({
    auth_user_id: userId,
    email: 'test.distributor@apex.com',
    first_name: 'Test',
    last_name: 'Distributor',
    slug: 'test-distributor',
    affiliate_code: 'TEST123',
    phone: '+1-555-0100',
    profile_complete: true,
    is_master: false,
  });

  if (distError) {
    console.error('❌ Error creating distributor record:', distError);
    process.exit(1);
  }

  console.log('✅ Distributor record created\n');

  // 3. Create autopilot tier record
  console.log('3️⃣ Creating autopilot tier record...');

  const { error: tierError } = await supabase.from('autopilot_tiers').insert({
    distributor_id: userId,
    tier_name: 'pro',
    invitations_remaining: 100,
    invitations_sent_this_month: 0,
    subscription_status: 'active',
    subscription_start_date: new Date().toISOString(),
  });

  if (tierError) {
    console.error('❌ Error creating autopilot tier:', tierError);
    // Don't exit, this is optional
  } else {
    console.log('✅ Autopilot tier created\n');
  }

  console.log('✅ Test user setup complete!\n');
  console.log('📧 Test User Credentials:');
  console.log('   Email: test.distributor@apex.com');
  console.log('   Password: TestPassword123!');
  console.log('\n🎉 Ready to run tests!\n');
}

createTestUser();
