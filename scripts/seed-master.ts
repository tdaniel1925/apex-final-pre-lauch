// =============================================
// Master Distributor Seeding Script
// Seeds the root distributor (Apex Vision)
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedMasterDistributor() {
  console.log('🌱 Seeding master distributor...\n');
  console.log('📡 Connecting to Supabase...');
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  try {
    // Check if master already exists
    const { data: existing, error: checkError } = await supabase
      .from('distributors')
      .select('id, slug, first_name, last_name, email')
      .eq('is_master', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected if master doesn't exist
      console.error('❌ Error checking for existing master:', checkError.message);
      console.error('   Error code:', checkError.code);
      console.error('   Full error:', JSON.stringify(checkError, null, 2));
      process.exit(1);
    }

    if (existing) {
      console.log('✅ Master distributor already exists:');
      console.log(`   Name: ${existing.first_name} ${existing.last_name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Slug: ${existing.slug}`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Landing Page: https://reachtheapex.net/${existing.slug}`);
      console.log('\n✨ Seeding skipped (master already exists)');
      process.exit(0);
    }

    // Create master distributor
    console.log('📝 Creating master distributor...');
    const { data, error } = await supabase
      .from('distributors')
      .insert({
        first_name: 'Apex',
        last_name: 'Vision',
        company_name: 'The Apex Vision',
        email: 'tdaniel@bundlefly.com',
        slug: 'apex-vision',
        sponsor_id: null, // Master has no sponsor
        matrix_parent_id: null, // Master has no parent
        matrix_position: null, // Master has no position
        matrix_depth: 0, // Root of the tree
        is_master: true,
        profile_complete: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error seeding master distributor:', error.message);
      process.exit(1);
    }

    console.log('✅ Master distributor seeded successfully!\n');
    console.log('📋 Details:');
    console.log(`   Name: ${data.first_name} ${data.last_name}`);
    console.log(`   Company: ${data.company_name}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Slug: ${data.slug}`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Matrix Depth: ${data.matrix_depth} (root)`);
    console.log(`   Is Master: ${data.is_master}`);
    console.log(`   Landing Page: https://reachtheapex.net/${data.slug}`);
    console.log(`   Created: ${data.created_at}`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMasterDistributor()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
