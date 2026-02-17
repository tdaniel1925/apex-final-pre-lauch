// =============================================
// Reset Password Script
// Updates password for a user
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create service client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function resetPassword(email: string, newPassword: string) {
  console.log(`\n🔄 Resetting password for: ${email}`);

  try {
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ Found user: ${user.id}`);

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }

    console.log(`✅ Password updated successfully for ${email}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
const email = 'tdaniel@bundlefly.com';
const newPassword = '4Xkilla1@';

resetPassword(email, newPassword).then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
});
