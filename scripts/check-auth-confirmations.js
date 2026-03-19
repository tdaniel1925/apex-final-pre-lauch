// Check auth user email confirmation status
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    // Get all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    // Filter to recent users (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentUsers = users.filter(u => new Date(u.created_at) > yesterday);

    console.log('========================================');
    console.log('EMAIL VERIFICATION STATUS CHECK');
    console.log('========================================\n');
    console.log('Recent Auth Users (last 24h):', recentUsers.length);
    console.log('');

    recentUsers.forEach(user => {
      console.log('---');
      console.log('Email:', user.email);
      console.log('Email Confirmed:', user.email_confirmed_at ? '✅ YES (' + user.email_confirmed_at + ')' : '❌ NO - WAITING FOR CONFIRMATION');
      console.log('Created:', user.created_at);
      console.log('Last Sign In:', user.last_sign_in_at || 'Never');
      console.log('');
    });

    // Count unconfirmed users
    const unconfirmed = recentUsers.filter(u => !u.email_confirmed_at);
    const confirmed = recentUsers.filter(u => u.email_confirmed_at);

    console.log('========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log('Total recent signups:', recentUsers.length);
    console.log('✅ Email confirmed:', confirmed.length);
    console.log('❌ Awaiting confirmation:', unconfirmed.length);
    console.log('');

    if (unconfirmed.length > 0) {
      console.log('⚠️  ISSUE DETECTED: Users not receiving verification emails');
      console.log('');
      console.log('Unconfirmed users:');
      unconfirmed.forEach(u => {
        console.log('  - ' + u.email);
      });
    }
  } catch (err) {
    console.error('Script error:', err);
  }
})();
