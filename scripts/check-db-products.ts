import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabaseProducts() {
  console.log('🔍 Checking database for products...\n');

  try {
    // Check if products table exists and query it
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying products:', error.message);
      return;
    }

    console.log(`Found ${products?.length || 0} products in database:\n`);

    if (products && products.length > 0) {
      for (const product of products) {
        console.log(`📦 ${product.name}`);
        console.log(`   Slug: ${product.slug}`);
        console.log(`   Retail: $${(product.retail_price_cents / 100).toFixed(2)}`);
        console.log(`   Wholesale: $${(product.wholesale_price_cents / 100).toFixed(2)}`);
        console.log(`   BV: ${product.bv}`);
        console.log(`   Subscription: ${product.is_subscription ? 'Yes' : 'No'}`);
        console.log(`   Active: ${product.is_active ? '✅' : '❌'}`);
        console.log('');
      }
    } else {
      console.log('❌ No products found in database');
    }

    console.log('\n📋 Checking for Pulse products specifically:');
    const pulseProducts = ['pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand'];

    for (const slug of pulseProducts) {
      const found = products?.find(p => p.slug === slug);
      console.log(`${slug}: ${found ? '✅ Found' : '❌ Not Found'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseProducts();
