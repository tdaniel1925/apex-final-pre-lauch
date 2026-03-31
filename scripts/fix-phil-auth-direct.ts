/**
 * Fix Phil Resch Auth Link - Direct Method
 *
 * Use direct SQL query to find and link Phil's auth account
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPhilAuthDirect() {
  console.log('🔧 Fixing Phil Resch Auth Link (Direct Method)...\n');

  const philEmail = 'phil@valorfs.com';

  // Step 1: Query auth.users directly via RPC
  console.log('Step 1: Querying auth.users table directly...');

  // Use SQL to find the user
  const { data: authUsers, error: queryError } = await supabase.rpc('get_user_by_email', {
    p_email: philEmail.toLowerCase(),
  });

  if (queryError) {
    console.log('⚠️  RPC function not available, trying alternative method...');

    // Alternative: Use admin API with pagination
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

      foundUser = users.find((u) => u.email?.toLowerCase() === philEmail.toLowerCase());

      if (foundUser) {
        console.log(`✅ Found Phil's auth account on page ${page}:`, foundUser.id);
        break;
      }

      console.log(`   Searched page ${page} (${users.length} users)...`);
      page++;
    }

    if (!foundUser) {
      console.log('❌ Could not find auth account in first 10,000 users');
      console.log('\n💡 Attempting password reset via Supabase Auth...');

      // Try sending reset email directly
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        philEmail,
        {
          redirectTo: 'https://reachtheapex.net/reset-password',
        }
      );

      if (resetError) {
        console.error('❌ Error:', resetError);
      } else {
        console.log('✅ Password reset email sent!');
        console.log('   Phil should check:', philEmail);
      }

      return;
    }

    // Link the found user
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('email', philEmail.toLowerCase())
      .single();

    if (distributor) {
      const { error: updateError } = await supabase
        .from('distributors')
        .update({ auth_user_id: foundUser.id })
        .eq('id', distributor.id);

      if (updateError) {
        console.error('❌ Error linking:', updateError);
      } else {
        console.log('✅ Linked auth_user_id:', foundUser.id);
      }
    }

    // Send reset email
    console.log('\n📧 Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      philEmail,
      {
        redirectTo: 'https://reachtheapex.net/reset-password',
      }
    );

    if (resetError) {
      console.error('❌ Error:', resetError);
    } else {
      console.log('✅ Password reset email sent to:', philEmail);
    }

  }

  console.log('\n✅ Done!');
}

fixPhilAuthDirect().catch(console.error);
