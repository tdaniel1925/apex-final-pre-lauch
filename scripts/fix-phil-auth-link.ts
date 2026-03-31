/**
 * Fix Phil Resch Auth Link
 *
 * Phil's distributor record is missing the auth_user_id link.
 * This script:
 * 1. Finds Phil's auth account by email
 * 2. Links it to his distributor record
 * 3. Tests password reset
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function fixPhilAuthLink() {
  console.log('🔧 Fixing Phil Resch Auth Link...\n');

  const philEmail = 'phil@valorfs.com';

  // Step 1: Get Phil's distributor record
  console.log('Step 1: Getting distributor record...');
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id')
    .eq('email', philEmail.toLowerCase())
    .single();

  if (distError || !distributor) {
    console.error('❌ Could not find Phil in distributors table');
    return;
  }

  console.log('✅ Found Phil:');
  console.log('   Distributor ID:', distributor.id);
  console.log('   Current auth_user_id:', distributor.auth_user_id || 'NULL');

  // Step 2: Find auth user by email
  console.log('\nStep 2: Searching for auth account...');

  // List all users and find Phil
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  const philAuthUser = users.find(
    (user) => user.email?.toLowerCase() === philEmail.toLowerCase()
  );

  if (!philAuthUser) {
    console.log('❌ No auth account found for', philEmail);
    console.log('\n🔧 Creating new auth account...');

    // Create auth account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: philEmail.toLowerCase(),
      email_confirm: true,
      user_metadata: {
        first_name: distributor.first_name,
        last_name: distributor.last_name,
      },
    });

    if (createError) {
      console.error('❌ Error creating auth account:', createError);
      return;
    }

    console.log('✅ Created new auth account:', newUser.user.id);

    // Link to distributor record
    const { error: updateError } = await supabase
      .from('distributors')
      .update({ auth_user_id: newUser.user.id })
      .eq('id', distributor.id);

    if (updateError) {
      console.error('❌ Error linking auth account:', updateError);
      return;
    }

    console.log('✅ Linked auth account to distributor record');

    // Send password reset email
    console.log('\n📧 Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      philEmail,
      {
        redirectTo: 'https://reachtheapex.net/reset-password',
      }
    );

    if (resetError) {
      console.error('❌ Error sending reset email:', resetError);
      return;
    }

    console.log('✅ Password reset email sent!');
    console.log('\n✅ Phil can now reset his password via:', philEmail);

  } else {
    console.log('✅ Found existing auth account:', philAuthUser.id);
    console.log('   Email:', philAuthUser.email);
    console.log('   Created:', philAuthUser.created_at);

    // Link auth account to distributor if not already linked
    if (distributor.auth_user_id !== philAuthUser.id) {
      console.log('\n🔧 Linking auth account to distributor...');

      const { error: updateError } = await supabase
        .from('distributors')
        .update({ auth_user_id: philAuthUser.id })
        .eq('id', distributor.id);

      if (updateError) {
        console.error('❌ Error linking auth account:', updateError);
        return;
      }

      console.log('✅ Successfully linked auth_user_id');
    } else {
      console.log('✅ Already linked correctly');
    }

    // Send password reset email
    console.log('\n📧 Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      philEmail,
      {
        redirectTo: 'https://reachtheapex.net/reset-password',
      }
    );

    if (resetError) {
      console.error('❌ Error sending reset email:', resetError);
      return;
    }

    console.log('✅ Password reset email sent to:', philEmail);
  }

  console.log('\n✅ Fix complete!');
  console.log('\n💡 Phil should:');
  console.log('   1. Check his inbox at', philEmail);
  console.log('   2. Check spam/junk folder');
  console.log('   3. Click the reset link');
  console.log('   4. Set a new password');
}

fixPhilAuthLink().catch(console.error);
