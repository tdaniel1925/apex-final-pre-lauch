import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login with test.distributor@apex.com...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test.distributor@apex.com',
    password: 'TestPassword123!',
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    console.error('Error code:', error.status);
    process.exit(1);
  }

  console.log('✅ Login successful!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('\n🎉 Test user credentials are working!\n');
}

testLogin();
