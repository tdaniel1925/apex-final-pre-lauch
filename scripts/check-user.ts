// =============================================
// Check User Script
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = 'tdaniel@botmakers.ai';

  console.log(`\n🔍 Checking user: ${email}`);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find((u) => u.email === email);

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('\n✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
  console.log('   Confirmed at:', user.email_confirmed_at || 'Not confirmed');
  console.log('   Created:', user.created_at);

  if (!user.email_confirmed_at) {
    console.log('\n⚠️  Email is NOT confirmed - this might prevent login!');
    console.log('   Confirming email now...');

    await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    console.log('✅ Email confirmed!');
  }
}

checkUser().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
});
