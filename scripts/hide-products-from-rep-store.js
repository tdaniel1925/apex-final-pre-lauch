// =====================================================
// Hide Products from Rep Store
// Deactivate all products except Business Center
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

async function hideProducts() {
  console.log('🔒 Hiding products from rep store...\n');

  try {
    // Deactivate all products except Business Center
    const { data: deactivated, error: deactivateError } = await supabase
      .from('products')
      .update({ is_active: false })
      .neq('slug', 'business-center')
      .eq('is_active', true)
      .select('name');

    if (deactivateError) {
      console.error('❌ Error deactivating products:', deactivateError);
      process.exit(1);
    }

    console.log(`✅ Deactivated ${deactivated?.length || 0} products`);

    if (deactivated && deactivated.length > 0) {
      console.log('\n📦 Hidden Products:');
      deactivated.forEach(p => console.log(`   - ${p.name}`));
    }

    // Verify Business Center is still active
    const { data: businessCenter, error: bcError } = await supabase
      .from('products')
      .select('name, is_active')
      .eq('slug', 'business-center')
      .single();

    if (bcError) {
      console.error('❌ Error checking Business Center:', bcError);
    } else {
      console.log(`\n✅ Business Center is ${businessCenter.is_active ? 'ACTIVE' : 'INACTIVE'}`);
      console.log('   Only Business Center will show on /dashboard/store');
    }

    console.log('\n🎯 Other products are still available for sale elsewhere (not on rep site)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

hideProducts();
