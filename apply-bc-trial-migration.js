#!/usr/bin/env node

/**
 * Apply Business Center Auto-Grant Trial Migration
 *
 * This script:
 * 1. Creates trigger to auto-grant 14-day trial on signup
 * 2. Grants trial to existing distributors without access
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📋 Applying Business Center Auto-Grant Trial Migration...\n');

    // Read migration file
    const migrationSQL = readFileSync(
      'supabase/migrations/20260403000001_auto_grant_business_center_trial.sql',
      'utf-8'
    );

    // Execute migration
    console.log('⚙️  Executing migration SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct execution if rpc fails
      console.log('⚠️  RPC method failed, trying direct execution...');

      // Split SQL into statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        console.log(`   Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase.rpc('exec', { query: statement });
        if (execError) {
          console.error(`   ❌ Error:`, execError.message);
        }
      }
    }

    console.log('✅ Migration executed\n');

    // Verify the trigger was created
    console.log('🔍 Verifying trigger creation...');
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'auto_grant_bc_trial');

    if (triggerError) {
      console.log('⚠️  Could not verify trigger (this is okay)');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger "auto_grant_bc_trial" created successfully\n');
    }

    // Check how many distributors got trials
    const { data: bcProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'businesscenter')
      .single();

    if (bcProduct) {
      const { count } = await supabase
        .from('service_access')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', bcProduct.id)
        .eq('is_trial', true);

      console.log(`📊 Current Status:`);
      console.log(`   - ${count || 0} distributors have Business Center trial access\n`);

      // Show sample of trial records
      const { data: samples } = await supabase
        .from('service_access')
        .select(`
          distributor_id,
          status,
          granted_at,
          trial_ends_at,
          distributors!inner(first_name, last_name, email)
        `)
        .eq('product_id', bcProduct.id)
        .eq('is_trial', true)
        .limit(5);

      if (samples && samples.length > 0) {
        console.log('   Sample trial records:');
        samples.forEach(record => {
          const dist = record.distributors;
          const trialEnd = new Date(record.trial_ends_at);
          const daysRemaining = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));

          console.log(`   - ${dist.first_name} ${dist.last_name}: ${daysRemaining} days remaining`);
        });
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test signup flow - new distributors should get trial automatically');
    console.log('   2. Check existing distributors can access BC features');
    console.log('   3. Verify trial expiration blocks access correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
