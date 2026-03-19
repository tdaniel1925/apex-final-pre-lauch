// =====================================================
// Seed Business Center Product
// One-time script to add Business Center to products table
// =====================================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedBusinessCenter() {
  console.log('🌱 Seeding Business Center product...\n');

  try {
    // Get AgentPulse Suite category
    const { data: category, error: categoryError } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', 'agentpulse')
      .single();

    if (categoryError || !category) {
      console.error('❌ AgentPulse Suite category not found');
      process.exit(1);
    }

    // Check if Business Center already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id, name')
      .eq('slug', 'business-center')
      .single();

    if (existing) {
      console.log('✅ Business Center already exists:', existing.name);
      console.log('   Product ID:', existing.id);
      process.exit(0);
    }

    // Insert Business Center product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        category_id: category.id,
        name: 'Business Center',
        slug: 'business-center',
        description: 'Essential business tools and resources for distributors. Includes marketing materials, training resources, replicated website, and lead management tools.',
        long_description: 'The Business Center is your complete back office solution. Get access to professional marketing materials, comprehensive training resources, your own replicated website, powerful lead management tools, and detailed commission tracking. Everything you need to build and manage your business in one place.',
        wholesale_price_cents: 3900, // $39.00
        retail_price_cents: 3901,    // $39.01 (needs to be higher due to DB constraint)
        bv: 39, // Fixed 39 credits
        is_active: true,
        is_subscription: true,
        subscription_interval: 'monthly',
        subscription_interval_count: 1,
        trial_days: 0,
        service_type: 'membership',
        access_url: '/dashboard',
        setup_instructions: 'Your Business Center access is activated immediately upon subscription. Simply log in to your dashboard to access all tools and resources.',
        display_order: 1,
        is_digital: true,
        stock_status: 'in_stock',
        is_featured: true,
        features: JSON.stringify([
          'Marketing materials and templates',
          'Training resources and videos',
          'Replicated website with custom branding',
          'Lead management and tracking tools',
          'Commission tracking and reporting',
          'Back office access',
          'Mobile-friendly dashboard',
          'Real-time notifications'
        ])
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting Business Center:', insertError);
      process.exit(1);
    }

    console.log('✅ Business Center product created successfully!');
    console.log('\n📦 Product Details:');
    console.log('   ID:', product.id);
    console.log('   Name:', product.name);
    console.log('   Price: $39.00/month');
    console.log('   Credits: 39 BV');
    console.log('   Category:', 'AgentPulse Suite');
    console.log('   Status: Active');
    console.log('\n✅ Reps can now purchase Business Center at /dashboard/store');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedBusinessCenter();
