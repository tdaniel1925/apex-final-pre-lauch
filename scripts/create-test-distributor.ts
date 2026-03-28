#!/usr/bin/env tsx

/**
 * Create Test Distributor
 *
 * Utility to quickly create test distributors for integration testing
 * Usage: npm run create-test-dist
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

interface TestDistributor {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

async function createTestDistributor(data: TestDistributor) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('\n🔐 Creating auth user...');

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName
    }
  });

  if (authError) {
    throw new Error(`Auth creation failed: ${authError.message}`);
  }

  console.log(`✅ Auth user created: ${authData.user.id}`);

  // Create distributor record
  console.log('👤 Creating distributor record...');

  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .insert({
      auth_user_id: authData.user.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || null,
      slug: `${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}-${Date.now()}`,
      status: 'active',
      onboarding_completed: true
    })
    .select()
    .single();

  if (distError) {
    throw new Error(`Distributor creation failed: ${distError.message}`);
  }

  console.log(`✅ Distributor created: ${distributor.id}`);

  // Create member record (for compensation)
  console.log('💰 Creating member record...');

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      distributor_id: distributor.id,
      tech_rank: 'starter',
      highest_tech_rank: 'starter',
      personal_credits_monthly: 0,
      team_credits_monthly: 0,
      override_qualified: false
    })
    .select()
    .single();

  if (memberError) {
    throw new Error(`Member creation failed: ${memberError.message}`);
  }

  console.log(`✅ Member created: ${member.member_id}`);

  return {
    auth_user_id: authData.user.id,
    distributor_id: distributor.id,
    member_id: member.member_id,
    email: data.email,
    password: data.password,
    login_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050'}/login`
  };
}

async function main() {
  console.log('\n🧪 === Test Distributor Creation ===\n');

  const useDefaults = await question('Use default test data? (y/n): ');

  let testData: TestDistributor;

  if (useDefaults.toLowerCase() === 'y') {
    const timestamp = Date.now();
    testData = {
      email: `test-rep-${timestamp}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: `Rep${timestamp}`,
      phone: '+15551234567'
    };

    console.log('\n📝 Using default data:');
    console.log(`  Email: ${testData.email}`);
    console.log(`  Password: ${testData.password}`);
    console.log(`  Name: ${testData.firstName} ${testData.lastName}`);
  } else {
    const email = await question('Email: ');
    const password = await question('Password: ');
    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const phone = await question('Phone (optional): ');

    testData = {
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined
    };
  }

  console.log('\n🚀 Creating test distributor...');

  try {
    const result = await createTestDistributor(testData);

    console.log('\n✨ === Test Distributor Created Successfully ===\n');
    console.log('📋 Details:');
    console.log(`  Email: ${result.email}`);
    console.log(`  Password: ${result.password}`);
    console.log(`  Auth User ID: ${result.auth_user_id}`);
    console.log(`  Distributor ID: ${result.distributor_id}`);
    console.log(`  Member ID: ${result.member_id}`);
    console.log(`  Login URL: ${result.login_url}`);

    console.log('\n🧪 Ready for Testing:');
    console.log(`  1. Login at: ${result.login_url}`);
    console.log(`  2. Use credentials above`);
    console.log(`  3. Run integration test scenarios\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
