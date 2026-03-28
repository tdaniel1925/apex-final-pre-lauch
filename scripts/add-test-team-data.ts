import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function addTestTeamData() {
  console.log('🧪 Adding sample team data for test user...\n');

  try {
    // 1. Find the test distributor's member_id
    const { data: testDistributor, error: distError } = await supabase
      .from('distributors')
      .select('id, member:members!members_distributor_id_fkey(member_id)')
      .eq('email', 'test.distributor@apex.com')
      .single();

    if (distError || !testDistributor) {
      console.error('❌ Could not find test distributor:', distError);
      process.exit(1);
    }

    const testMemberArray = testDistributor.member as unknown as Array<{ member_id: string }>;
    const testMember = Array.isArray(testMemberArray) ? testMemberArray[0] : (testDistributor.member as { member_id: string });

    if (!testMember?.member_id) {
      console.error('❌ Test distributor has no member record');
      process.exit(1);
    }

    const testMemberId = testMember.member_id;
    console.log('✅ Found test member ID:', testMemberId);

    // 2. Check if test team members already exist
    const { data: existing } = await supabase
      .from('distributors')
      .select('id, email')
      .like('email', 'team%@test.apex.com');

    if (existing && existing.length > 0) {
      console.log(`⚠️  Found ${existing.length} existing test team members`);
      console.log('   Skipping creation to avoid duplicates.\n');
      console.log('✅ Test team data already exists!');
      return;
    }

    // 3. Create sample team members (5 distributors)
    const teamMembers = [
      {
        email: 'team1@test.apex.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        slug: 'sarah-johnson-test',
        affiliate_code: 'TEAM001',
        phone: '+1-555-0201',
        tech_rank: 'bronze',
        personal_credits: 250,
      },
      {
        email: 'team2@test.apex.com',
        first_name: 'Michael',
        last_name: 'Chen',
        slug: 'michael-chen-test',
        affiliate_code: 'TEAM002',
        phone: '+1-555-0202',
        tech_rank: 'silver',
        personal_credits: 650,
      },
      {
        email: 'team3@test.apex.com',
        first_name: 'Jennifer',
        last_name: 'Martinez',
        slug: 'jennifer-martinez-test',
        affiliate_code: 'TEAM003',
        phone: '+1-555-0203',
        tech_rank: 'bronze',
        personal_credits: 180,
      },
      {
        email: 'team4@test.apex.com',
        first_name: 'David',
        last_name: 'Williams',
        slug: 'david-williams-test',
        affiliate_code: 'TEAM004',
        phone: '+1-555-0204',
        tech_rank: 'gold',
        personal_credits: 1500,
      },
      {
        email: 'team5@test.apex.com',
        first_name: 'Lisa',
        last_name: 'Anderson',
        slug: 'lisa-anderson-test',
        affiliate_code: 'TEAM005',
        phone: '+1-555-0205',
        tech_rank: 'starter',
        personal_credits: 75,
      },
    ];

    console.log('\n📝 Creating team members...\n');

    for (const member of teamMembers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: member.email,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: member.first_name,
          last_name: member.last_name,
        },
      });

      if (authError) {
        console.error(`❌ Error creating auth user for ${member.email}:`, authError.message);
        continue;
      }

      console.log(`   ✅ Created auth user: ${member.email}`);

      // Create distributor record
      const { data: distData, error: distError } = await supabase
        .from('distributors')
        .insert({
          auth_user_id: authData.user.id,
          email: member.email,
          first_name: member.first_name,
          last_name: member.last_name,
          slug: member.slug,
          affiliate_code: member.affiliate_code,
          phone: member.phone,
          profile_complete: true,
          is_master: false,
        })
        .select()
        .single();

      if (distError) {
        console.error(`❌ Error creating distributor for ${member.email}:`, distError.message);
        continue;
      }

      console.log(`   ✅ Created distributor record: ${member.slug}`);

      // Create member record (linked to test user as enroller)
      const { error: memberError } = await supabase.from('members').insert({
        distributor_id: distData.id,
        full_name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        enroller_id: testMemberId, // Link to test user as sponsor
        tech_rank: member.tech_rank,
        personal_credits_monthly: member.personal_credits,
        team_credits_monthly: member.personal_credits * 2, // Simulate some team volume
        status: 'active',
        enrollment_date: new Date().toISOString(),
        override_qualified: member.personal_credits >= 150,
      });

      if (memberError) {
        console.error(`❌ Error creating member for ${member.email}:`, memberError.message);
        continue;
      }

      console.log(`   ✅ Created member record with rank: ${member.tech_rank}\n`);
    }

    console.log('🎉 Successfully created 5 team members for test user!\n');
    console.log('Test team hierarchy:');
    console.log('  test.distributor@apex.com (You)');
    console.log('  ├── Sarah Johnson (Bronze, 250 credits)');
    console.log('  ├── Michael Chen (Silver, 650 credits)');
    console.log('  ├── Jennifer Martinez (Bronze, 180 credits)');
    console.log('  ├── David Williams (Gold, 1500 credits)');
    console.log('  └── Lisa Anderson (Starter, 75 credits)\n');

  } catch (error) {
    console.error('❌ Error adding test team data:', error);
    process.exit(1);
  }
}

addTestTeamData();
