/**
 * Check and Fix Sella Daniel's Auth Link
 *
 * Same fix as Phil - check if auth_user_id is linked and send password reset
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSellaAuth() {
  console.log('🔍 Checking Sella Daniel\'s Account...\n');

  const sellaEmail = 'sellag.sb@gmail.com';

  // Step 1: Get Sella's distributor record
  console.log('Step 1: Getting distributor record...');
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id, slug')
    .eq('email', sellaEmail.toLowerCase())
    .single();

  if (distError || !distributor) {
    console.error('❌ Could not find Sella in distributors table');
    return;
  }

  console.log('✅ Found Sella:');
  console.log('   Name:', `${distributor.first_name} ${distributor.last_name}`);
  console.log('   Email:', distributor.email);
  console.log('   Slug:', distributor.slug);
  console.log('   Distributor ID:', distributor.id);
  console.log('   Auth User ID:', distributor.auth_user_id || '❌ MISSING!');

  if (!distributor.auth_user_id) {
    console.log('\n⚠️  Auth user ID is missing, searching for auth account...');

    // Find auth account
    let page = 1;
    let foundUser = null;

    while (page <= 10 && !foundUser) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: 1000,
      });

      if (error) {
        console.error('❌ Error listing users:', error);
        break;
      }

      foundUser = users.find((u) => u.email?.toLowerCase() === sellaEmail.toLowerCase());

      if (foundUser) {
        console.log(`✅ Found Sella's auth account on page ${page}:`, foundUser.id);
        break;
      }

      console.log(`   Searched page ${page} (${users.length} users)...`);
      page++;
    }

    if (foundUser) {
      // Link the auth account
      console.log('\n🔧 Linking auth account to distributor...');
      const { error: updateError } = await supabase
        .from('distributors')
        .update({ auth_user_id: foundUser.id })
        .eq('id', distributor.id);

      if (updateError) {
        console.error('❌ Error linking:', updateError);
        return;
      }

      console.log('✅ Successfully linked auth_user_id:', foundUser.id);
    } else {
      console.log('❌ No existing auth account found');
      console.log('💡 Sella will need to use "Sign Up" to create a new account');
      return;
    }
  } else {
    console.log('✅ Auth account already linked');
  }

  // Step 2: Send password reset email
  console.log('\n📧 Sending password reset email...');
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    sellaEmail,
    {
      redirectTo: 'https://reachtheapex.net/reset-password',
    }
  );

  if (resetError) {
    console.error('❌ Error sending reset email:', resetError);
    return;
  }

  console.log('✅ Password reset email sent to:', sellaEmail);

  // Step 3: Verify with test
  console.log('\n🧪 Running verification test...');

  const { data: verifyDist } = await supabase
    .from('distributors')
    .select('auth_user_id')
    .eq('id', distributor.id)
    .single();

  if (verifyDist?.auth_user_id) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
      verifyDist.auth_user_id
    );

    if (authError) {
      console.error('❌ Verification failed:', authError);
    } else {
      console.log('✅ Verification passed:');
      console.log('   Auth ID:', authUser.user.id);
      console.log('   Email:', authUser.user.email);
      console.log('   Email Confirmed:', authUser.user.email_confirmed_at ? '✅' : '❌');
    }
  }

  console.log('\n✅ All done!');
  console.log('\n💡 Sella should:');
  console.log('   1. Check email:', sellaEmail);
  console.log('   2. Look in spam/junk folder if not in inbox');
  console.log('   3. Click the password reset link');
  console.log('   4. Set a new password');
}

fixSellaAuth().catch(console.error);
