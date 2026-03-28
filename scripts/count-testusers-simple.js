const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countTestUsers() {
  try {
    // Count distributors with 'testuser' in any name field
    const { count, error } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .or('first_name.ilike.%testuser%,last_name.ilike.%testuser%,email.ilike.%testuser%,full_name.ilike.%testuser%')
      .neq('status', 'deleted');

    if (error) {
      console.error('Error counting test users:', error);
      process.exit(1);
    }

    console.log(`\n✅ Found ${count} reps with "testuser" in their name\n`);

    // Also get details
    const { data: testUsers } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, status')
      .or('first_name.ilike.%testuser%,last_name.ilike.%testuser%,email.ilike.%testuser%,full_name.ilike.%testuser%')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (testUsers && testUsers.length > 0) {
      console.log('Test users found:');
      testUsers.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.status}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

countTestUsers();
