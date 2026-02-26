// =============================================
// Place Prospects - Convert to Distributors
// Converts event prospects to distributors with matrix placement
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Store generated passwords for manual email sending
const credentials: Array<{ name: string; email: string; username: string; password: string }> = [];

function generatePassword(): string {
  // Generate secure random password
  return crypto.randomBytes(8).toString('base64').slice(0, 12);
}

async function deleteProspects() {
  console.log('\n📋 Step 1: Cleaning up prospect entries...\n');

  // Delete Anh Doan duplicate
  const { data: anhProspect } = await supabase
    .from('prospects')
    .select('id, first_name, last_name, email')
    .ilike('email', 'anh@doanfs.com')
    .single();

  if (anhProspect) {
    await supabase.from('prospects').delete().eq('id', anhProspect.id);
    console.log(`✅ Deleted Anh Doan prospect (duplicate of L1-2 distributor)`);
  }

  // Delete Trent Daniel test entries
  const { data: trentProspects } = await supabase
    .from('prospects')
    .select('id, first_name, last_name, email')
    .or('email.eq.tdaniel@botmakers.ai,email.eq.sellag.sb@gmail.com');

  if (trentProspects && trentProspects.length > 0) {
    for (const prospect of trentProspects) {
      await supabase.from('prospects').delete().eq('id', prospect.id);
      console.log(`✅ Deleted test entry: ${prospect.first_name} ${prospect.last_name} (${prospect.email})`);
    }
  }

  console.log('\n✅ Cleanup complete!\n');
}

async function convertProspect(
  firstName: string,
  lastName: string,
  email: string,
  slug: string,
  sponsorSlug: string
): Promise<void> {
  console.log(`\n🔄 Converting: ${firstName} ${lastName} → ${slug}`);
  console.log(`   Sponsor: ${sponsorSlug}`);

  // Get sponsor ID
  const { data: sponsor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('slug', sponsorSlug)
    .single();

  if (!sponsor) {
    throw new Error(`Sponsor not found: ${sponsorSlug}`);
  }

  console.log(`   ✓ Found sponsor: ${sponsor.first_name} ${sponsor.last_name}`);

  // Generate password
  const password = generatePassword();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }

  console.log(`   ✓ Created auth user`);

  // Create distributor using atomic function
  const { data: distributorData, error: distributorError } = await supabase.rpc(
    'create_distributor_atomic',
    {
      p_auth_user_id: authData.user.id,
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_slug: slug,
      p_company_name: null,
      p_phone: null,
      p_sponsor_id: sponsor.id,
      p_licensing_status: 'licensed',
      p_licensing_status_set_at: new Date().toISOString(),
    }
  );

  if (distributorError) {
    // Rollback: Delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Failed to create distributor: ${distributorError.message}`);
  }

  const distributor = Array.isArray(distributorData) ? distributorData[0] : distributorData;

  console.log(`   ✓ Created distributor #${distributor.rep_number}`);
  console.log(`   ✓ Matrix: Depth ${distributor.matrix_depth}, Position ${distributor.matrix_position}`);
  console.log(`   ✓ Replicated site: reachtheapex.net/${slug}`);

  // Store credentials
  credentials.push({
    name: `${firstName} ${lastName}`,
    email: email,
    username: slug,
    password: password,
  });

  // Update prospect status
  await supabase
    .from('prospects')
    .update({
      status: 'converted',
      converted_to_distributor_id: distributor.id
    })
    .eq('email', email);

  console.log(`   ✅ Conversion complete!`);
}

async function placeProspects() {
  try {
    // Step 1: Clean up
    await deleteProspects();

    console.log('📋 Step 2: Converting prospects to distributors...\n');
    console.log('═════════════════════════════════════════════════\n');

    // Step 2: Convert under Phil Resch (6 people - 5 direct + 1 spillover)
    console.log('👤 PHIL RESCH\'S TEAM (6 people):\n');

    await convertProspect('Grayson', 'Millard', 'grayson@3markslc.com', 'grayson-millard', 'phil-resch');
    await convertProspect('Justin', 'Christensen', 'justin@3markslc.com', 'justin-christensen', 'phil-resch');
    await convertProspect('Hannah', 'Townsend', 'hannah@bedrockfinancialplanning.com', 'hannah-townsend', 'phil-resch');
    await convertProspect('David', 'Townsend', 'david@financialfreedom-inc.net', 'david-townsend', 'phil-resch');
    await convertProspect('Mark', 'Hughes', 'marhughes@gmail.com', 'mark-hughes', 'phil-resch');

    console.log('\n⚠️  Next person will SPILLOVER (Phil has 5 direct):\n');
    await convertProspect('Hafeez', 'Rangwala', 'hafeez@pifgonline.com', 'hafeez-rangwala', 'phil-resch');

    // Step 3: Convert under Anh Doan (2 people)
    console.log('\n\n👤 ANH DOAN\'S TEAM (2 people):\n');

    await convertProspect('John', 'Jacob', 'johnjacob67@gmail.com', 'john-jacob', 'anh-doan');
    await convertProspect('Eric', 'Wullschleger', 'wullschleger.eric@gmail.com', 'eric-wullschleger', 'anh-doan');

    // Print credentials
    console.log('\n\n═════════════════════════════════════════════════');
    console.log('✅ ALL CONVERSIONS COMPLETE!');
    console.log('═════════════════════════════════════════════════\n');

    console.log('📧 CREDENTIALS FOR MANUAL EMAIL SENDING:\n');
    console.log('Copy these to send in welcome emails:\n');

    credentials.forEach((cred, i) => {
      console.log(`${i + 1}. ${cred.name}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Username: ${cred.username}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   Login: https://reachtheapex.net/login`);
      console.log(`   Replicated Site: https://reachtheapex.net/${cred.username}\n`);
    });

    console.log('═════════════════════════════════════════════════\n');
    console.log('🎯 NEXT STEPS:\n');
    console.log('1. Review welcome email template');
    console.log('2. Test replicated websites');
    console.log('3. Manually send welcome emails with credentials above');
    console.log('4. Monitor admin dashboard for any issues\n');

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nConversions may be incomplete. Check admin panel.');
    process.exit(1);
  }
}

placeProspects().catch(console.error);
