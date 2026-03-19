// Check for ALL unconfirmed users (any time period)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('========================================');
    console.log('CHECKING ALL UNCONFIRMED USERS');
    console.log('========================================\n');

    // Get all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    console.log('Total auth users:', users.length);

    // Find unconfirmed users
    const unconfirmed = users.filter(u => !u.email_confirmed_at);

    console.log('Unconfirmed users:', unconfirmed.length);
    console.log('');

    if (unconfirmed.length === 0) {
      console.log('✅ NO ISSUES FOUND - All users have confirmed their emails!');
    } else {
      console.log('⚠️  FOUND UNCONFIRMED USERS:\n');

      unconfirmed.forEach((user, index) => {
        const daysSinceSignup = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));

        console.log(`${index + 1}. ${user.email}`);
        console.log('   Created:', user.created_at);
        console.log('   Days ago:', daysSinceSignup);
        console.log('   Confirmation sent:', user.confirmation_sent_at || 'Unknown');
        console.log('   Last sign in attempt:', user.last_sign_in_at || 'Never');
        console.log('');
      });

      console.log('========================================');
      console.log('POTENTIAL ISSUES:');
      console.log('========================================');
      console.log('1. Emails may be going to spam/junk folder');
      console.log('2. Email delivery from Supabase may be blocked');
      console.log('3. Users may need to check their spam folder');
      console.log('4. Consider implementing manual verification option');
    }

    // Check Supabase project settings
    console.log('\n========================================');
    console.log('SUPABASE AUTH CONFIGURATION');
    console.log('========================================');
    console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Email redirect URL:', process.env.NEXT_PUBLIC_SITE_URL + '/auth/confirm');
    console.log('');
    console.log('⚠️  IMPORTANT: Check Supabase Dashboard:');
    console.log('   1. Go to: Authentication → Email Templates');
    console.log('   2. Verify "Confirm signup" template is enabled');
    console.log('   3. Check if emails are rate limited');
    console.log('   4. Consider enabling SMTP settings for better deliverability');

  } catch (err) {
    console.error('Script error:', err);
  }
})();
