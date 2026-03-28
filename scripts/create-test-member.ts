import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestMemberRecord() {
  console.log('🧪 Creating member record for test distributor...\\n');

  try {
    // 1. Find the test distributor
    const { data: testDistributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email')
      .eq('email', 'test.distributor@apex.com')
      .single();

    if (distError || !testDistributor) {
      console.error('❌ Could not find test distributor:', distError);
      process.exit(1);
    }

    console.log('✅ Found test distributor:', testDistributor.email);

    // 2. Check if member record already exists
    const { data: existingMember } = await supabase
      .from('members')
      .select('member_id')
      .eq('distributor_id', testDistributor.id)
      .single();

    if (existingMember) {
      console.log('⚠️  Member record already exists:', existingMember.member_id);
      console.log('✅ Nothing to do!');
      return;
    }

    // 3. Create member record (no enroller_id - this will be a root/top-level member)
    const { data: newMember, error: memberError } = await supabase
      .from('members')
      .insert({
        distributor_id: testDistributor.id,
        full_name: `${testDistributor.first_name} ${testDistributor.last_name}`,
        email: testDistributor.email,
        enroller_id: null, // Root member - no sponsor
        tech_rank: 'silver', // Give test user a decent starting rank
        personal_credits_monthly: 500,
        team_credits_monthly: 0, // Will increase as team is added
        status: 'active',
        enrollment_date: new Date().toISOString(),
        override_qualified: true, // Qualified for overrides
      })
      .select()
      .single();

    if (memberError) {
      console.error('❌ Error creating member record:', memberError.message);
      process.exit(1);
    }

    console.log('\\n✅ Successfully created member record!');
    console.log('   Member ID:', newMember.member_id);
    console.log('   Rank:', newMember.tech_rank);
    console.log('   Status:', newMember.status);
    console.log('\\n🎉 Test user is now ready for team data!');
  } catch (error) {
    console.error('❌ Error creating member record:', error);
    process.exit(1);
  }
}

createTestMemberRecord();
