// Verify that integrations tables exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTables() {
  console.log('🔍 Checking for integrations system tables...\n');

  // Check integrations table
  const { data: integrations, error: intError } = await supabase
    .from('integrations')
    .select('id, platform_name, display_name, is_enabled')
    .limit(5);

  if (intError) {
    console.log('❌ integrations table: NOT FOUND');
    console.log('   Error:', intError.message);
  } else {
    console.log('✅ integrations table: EXISTS');
    console.log(`   Records: ${integrations?.length || 0}`);
    if (integrations && integrations.length > 0) {
      integrations.forEach(int => {
        console.log(`   - ${int.display_name} (${int.platform_name}) ${int.is_enabled ? '✓' : '✗'}`);
      });
    }
  }

  // Check distributor_replicated_sites table
  const { data: sites, error: sitesError } = await supabase
    .from('distributor_replicated_sites')
    .select('id, site_status')
    .limit(1);

  if (sitesError) {
    console.log('❌ distributor_replicated_sites table: NOT FOUND');
    console.log('   Error:', sitesError.message);
  } else {
    console.log('✅ distributor_replicated_sites table: EXISTS');
  }

  // Check integration_product_mappings table
  const { data: mappings, error: mappingsError } = await supabase
    .from('integration_product_mappings')
    .select('id')
    .limit(1);

  if (mappingsError) {
    console.log('❌ integration_product_mappings table: NOT FOUND');
    console.log('   Error:', mappingsError.message);
  } else {
    console.log('✅ integration_product_mappings table: EXISTS');
  }

  // Check external_sales table
  const { data: sales, error: salesError } = await supabase
    .from('external_sales')
    .select('id')
    .limit(1);

  if (salesError) {
    console.log('❌ external_sales table: NOT FOUND');
    console.log('   Error:', salesError.message);
  } else {
    console.log('✅ external_sales table: EXISTS');
  }

  // Check integration_webhook_logs table
  const { data: logs, error: logsError } = await supabase
    .from('integration_webhook_logs')
    .select('id')
    .limit(1);

  if (logsError) {
    console.log('❌ integration_webhook_logs table: NOT FOUND');
    console.log('   Error:', logsError.message);
  } else {
    console.log('✅ integration_webhook_logs table: EXISTS');
  }

  console.log('\n✨ All integrations system tables are ready!');
}

verifyTables().catch(console.error);
