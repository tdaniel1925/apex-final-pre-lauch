#!/usr/bin/env node

/**
 * Verify Business Center Trial Setup
 *
 * Checks that the migration applied correctly and trials are working
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log('🔍 Verifying Business Center Trial Setup...\n');

  try {
    // 1. Check if Business Center product exists
    const { data: bcProduct, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, trial_days')
      .eq('slug', 'businesscenter')
      .single();

    if (productError || !bcProduct) {
      console.error('❌ Business Center product not found');
      process.exit(1);
    }

    console.log('✅ Business Center product found:');
    console.log(`   ID: ${bcProduct.id}`);
    console.log(`   Name: ${bcProduct.name}`);
    console.log(`   Trial Days: ${bcProduct.trial_days || 14}\n`);

    // 2. Check how many distributors have trial access
    const { count: trialCount, error: countError } = await supabase
      .from('service_access')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', bcProduct.id)
      .eq('is_trial', true);

    if (countError) {
      console.error('❌ Error counting trials:', countError.message);
    } else {
      console.log(`✅ ${trialCount || 0} distributors have trial access\n`);
    }

    // 3. Show sample trial records
    const { data: samples, error: samplesError } = await supabase
      .from('service_access')
      .select(`
        distributor_id,
        status,
        granted_at,
        trial_ends_at,
        distributors!inner(first_name, last_name, email, created_at)
      `)
      .eq('product_id', bcProduct.id)
      .eq('is_trial', true)
      .order('granted_at', { ascending: false })
      .limit(10);

    if (samplesError) {
      console.error('❌ Error fetching samples:', samplesError.message);
    } else if (samples && samples.length > 0) {
      console.log('📋 Sample Trial Records:\n');
      console.log('Name                Email                           Status    Days Remaining  Signup Date');
      console.log('─'.repeat(95));

      samples.forEach(record => {
        const dist = record.distributors;
        const trialEnd = new Date(record.trial_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        const signupDate = new Date(dist.created_at).toLocaleDateString();

        const name = `${dist.first_name} ${dist.last_name}`.padEnd(20);
        const email = dist.email.padEnd(32);
        const status = record.status.padEnd(10);
        const days = daysRemaining > 0 ? `${daysRemaining} days`.padEnd(16) : 'EXPIRED'.padEnd(16);

        console.log(`${name}${email}${status}${days}${signupDate}`);
      });

      console.log('\n');
    }

    // 4. Check for expired trials
    const { count: expiredCount } = await supabase
      .from('service_access')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', bcProduct.id)
      .eq('is_trial', true)
      .lt('trial_ends_at', new Date().toISOString());

    if (expiredCount && expiredCount > 0) {
      console.log(`⚠️  ${expiredCount} trials have expired (users will be blocked)\n`);
    }

    // 5. Check for active trials ending soon
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { count: endingSoonCount } = await supabase
      .from('service_access')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', bcProduct.id)
      .eq('is_trial', true)
      .eq('status', 'active')
      .gt('trial_ends_at', new Date().toISOString())
      .lt('trial_ends_at', threeDaysFromNow);

    if (endingSoonCount && endingSoonCount > 0) {
      console.log(`⏰ ${endingSoonCount} trials ending in next 3 days (will show soft reminder)\n`);
    }

    // 6. Summary
    console.log('📊 Summary:');
    console.log(`   Total trials granted: ${trialCount || 0}`);
    console.log(`   Active trials: ${(trialCount || 0) - (expiredCount || 0)}`);
    console.log(`   Expired trials: ${expiredCount || 0}`);
    console.log(`   Ending soon (3 days): ${endingSoonCount || 0}\n`);

    // 7. Next Steps
    console.log('✅ Migration verification complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Visit /dashboard/crm as a user with active trial → Should see content');
    console.log('   2. Visit /dashboard/crm as a user with expired trial → Should see blocking modal');
    console.log('   3. Create new distributor account → Should auto-get trial');
    console.log('   4. Monitor conversion rate over next 2 weeks\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verify();
