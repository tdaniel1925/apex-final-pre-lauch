// Check SmartOffice tables in production (Supabase remote)
// This connects directly to production to see what's there

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load production environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSmartOfficeTables() {
  console.log('🔍 Checking SmartOffice Integration in Production...\n');
  console.log(`📡 Connected to: ${supabaseUrl}\n`);

  // Check each table
  const tables = [
    'smartoffice_sync_config',
    'smartoffice_agents',
    'smartoffice_policies',
    'smartoffice_commissions',
    'smartoffice_sync_logs',
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
        if (error.code === '42P01') {
          console.log(`   → Table does not exist in database\n`);
        } else {
          console.log(`   → ${error.details || 'Unknown error'}\n`);
        }
      } else {
        console.log(`✅ ${table}: EXISTS`);
        console.log(`   → Records: ${count || 0}`);
        if (data && data.length > 0) {
          console.log(`   → Sample data:`, JSON.stringify(data[0], null, 2));
        }
        console.log('');
      }
    } catch (err: any) {
      console.log(`❌ ${table}: EXCEPTION - ${err.message}\n`);
    }
  }

  // Special check for config table
  console.log('🔧 Checking SmartOffice Configuration...\n');

  const { data: config, error: configError } = await supabase
    .from('smartoffice_sync_config')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (configError) {
    console.log('❌ Configuration Check Failed:', configError.message);
  } else if (!config) {
    console.log('⚠️  No active configuration found');
    console.log('   → Need to insert SmartOffice credentials\n');

    // Check if ANY config exists (even inactive)
    const { data: anyConfig } = await supabase
      .from('smartoffice_sync_config')
      .select('*')
      .maybeSingle();

    if (anyConfig) {
      console.log('   → Found inactive config:', {
        is_active: anyConfig.is_active,
        sitename: anyConfig.sitename,
        username: anyConfig.username,
      });
    } else {
      console.log('   → No config records exist at all');
    }
  } else {
    console.log('✅ Active Configuration Found:');
    console.log('   → API URL:', config.api_url);
    console.log('   → Sitename:', config.sitename);
    console.log('   → Username:', config.username);
    console.log('   → Sync Frequency:', config.sync_frequency_hours, 'hours');
    console.log('   → Is Active:', config.is_active);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary\n');

  // Get counts for all tables
  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      return {
        table,
        count: error ? 'ERROR' : count || 0,
        exists: !error,
      };
    })
  );

  counts.forEach(({ table, count, exists }) => {
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${table.padEnd(30)} ${count} records`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Next Steps\n');

  const allExist = counts.every((c) => c.exists);

  if (!allExist) {
    console.log('❌ Some tables are missing!');
    console.log('   → Run migration: npx supabase db push');
    console.log('   → Or apply manually in Supabase dashboard\n');
  } else if (!config) {
    console.log('⚠️  Tables exist but no configuration!');
    console.log('   → Need to insert SmartOffice credentials');
    console.log('   → Check migration file for INSERT statement\n');
  } else {
    console.log('✅ SmartOffice is fully configured!');
    console.log('   → Ready to sync data');
    console.log('   → Click "Run Full Sync" button in admin\n');
  }
}

checkSmartOfficeTables().catch(console.error);
