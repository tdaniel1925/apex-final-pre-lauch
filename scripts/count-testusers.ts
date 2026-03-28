// =============================================
// Count Test Users Script
// Counts distributors with "testuser" in name
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countTestUsers() {
  console.log('🔍 Counting test users...\n');

  try {
    // Count distributors with 'testuser' in any name field
    const { count, error } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .or('first_name.ilike.%testuser%,last_name.ilike.%testuser%,email.ilike.%testuser%,full_name.ilike.%testuser%')
      .neq('status', 'deleted');

    if (error) {
      console.error('❌ Error counting test users:', error);
      process.exit(1);
    }

    console.log(`✅ Found ${count} reps with "testuser" in their name\n`);

    // Also get details
    const { data: testUsers, error: fetchError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, status, created_at')
      .or('first_name.ilike.%testuser%,last_name.ilike.%testuser%,email.ilike.%testuser%,full_name.ilike.%testuser%')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching test users:', fetchError);
      process.exit(1);
    }

    if (testUsers && testUsers.length > 0) {
      console.log('📋 Test users found:');
      testUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.first_name} ${user.last_name} (${user.email}) - Status: ${user.status}`);
      });
      console.log('');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Exception:', err);
    process.exit(1);
  }
}

countTestUsers();
