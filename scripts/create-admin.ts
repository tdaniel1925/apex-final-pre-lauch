// =============================================
// Create Admin User Script
// Creates a super admin who can login anywhere
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

async function createAdmin() {
  const email = 'tdaniel@botmakers.ai';
  const password = '4Xkilla1@';
  const slug = 'superadmin';

  console.log(`\n🔄 Creating super admin user: ${email}`);

  try {
    // Step 1: Create auth user
    console.log('📝 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return;
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Step 2: Create distributor record
    console.log('📝 Creating distributor record...');
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: authData.user.id,
        first_name: 'Super',
        last_name: 'Admin',
        email: email,
        slug: slug,
        is_master: true, // Mark as master/admin
        profile_complete: true,
        // No matrix placement - admins are outside the matrix
        matrix_parent_id: null,
        matrix_position: null,
        matrix_depth: null,
        sponsor_id: null,
      })
      .select()
      .single();

    if (distError) {
      console.error('❌ Distributor error:', distError);
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log(`✅ Distributor created: ${distributor.id}`);
    console.log(`\n✅ Super admin created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Login at: https://apex-final-pre-lauch.vercel.app/login`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
createAdmin().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
});
