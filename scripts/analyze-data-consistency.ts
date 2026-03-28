import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeConsistency() {
  console.log('\n=== DATA CONSISTENCY ANALYSIS ===\n');

  const issues: string[] = [];

  // 1. Check Charles Potter's enrollment count
  console.log('1️⃣ Checking Charles Potter L1 enrollment count...\n');

  const { data: charles } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('email', 'fyifromcharles@gmail.com')
    .single();

  if (!charles) {
    console.log('❌ Charles Potter not found');
    return;
  }

  // Count direct enrollees using sponsor_id
  const { data: directEnrollees, count: directCount } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, status', { count: 'exact' })
    .eq('sponsor_id', charles.id)
    .eq('status', 'active');

  console.log(`   Direct query count: ${directCount}`);
  console.log(`   Direct enrollees found:`);
  directEnrollees?.forEach(e => console.log(`      • ${e.first_name} ${e.last_name} (${e.email})`));

  // 2. Check if there's a cached/computed column
  const { data: charlesDetail } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', charles.id)
    .single();

  console.log(`\n   Checking for cached enrollment counts in distributors table:`);
  const columnsToCheck = [
    'l1_direct_enrollees',
    'direct_enrollees',
    'total_downline',
    'personal_enrollees',
    'team_size',
    'downline_count'
  ];

  columnsToCheck.forEach(col => {
    if (col in (charlesDetail || {})) {
      console.log(`      ${col}: ${(charlesDetail as any)[col]}`);
    }
  });

  // 3. Check enrollment_stats table
  console.log(`\n2️⃣ Checking enrollment_stats table...\n`);

  const { data: enrollmentStats } = await supabase
    .from('enrollment_stats')
    .select('*')
    .eq('distributor_id', charles.id)
    .single();

  if (enrollmentStats) {
    console.log(`   ✅ Found enrollment_stats record:`);
    const l1Direct = (enrollmentStats as any).l1_direct;
    const totalDownline = (enrollmentStats as any).total_downline;
    const lastUpdated = (enrollmentStats as any).last_updated;

    console.log(`      l1_direct: ${l1Direct || 'NULL'}`);
    console.log(`      total_downline: ${totalDownline || 'NULL'}`);
    console.log(`      last_updated: ${lastUpdated || 'NULL'}`);

    if (l1Direct !== directCount) {
      issues.push(`enrollment_stats.l1_direct (${l1Direct}) does not match actual count (${directCount})`);
    }
  } else {
    console.log(`   ⚠️  No enrollment_stats record found`);
    issues.push(`Missing enrollment_stats record for Charles Potter`);
  }

  // 4. Check distributor_stats table
  console.log(`\n3️⃣ Checking distributor_stats table...\n`);

  const { data: distributorStats } = await supabase
    .from('distributor_stats')
    .select('*')
    .eq('distributor_id', charles.id)
    .single();

  if (distributorStats) {
    console.log(`   ✅ Found distributor_stats record:`);
    Object.entries(distributorStats).forEach(([key, value]) => {
      if (key.includes('enroll') || key.includes('downline') || key.includes('team')) {
        console.log(`      ${key}: ${value}`);
      }
    });
  } else {
    console.log(`   ⚠️  No distributor_stats record found`);
  }

  // 5. Check for wrong sponsor assignments
  console.log(`\n4️⃣ Checking wrong sponsor assignments...\n`);

  const expectedEnrollees = [
    { name: 'Donna Potter', email: 'donnambpotter@gmail.com' },
    { name: 'Brian Rawlston', email: 'bclaybornr@gmail.com' },
    { name: 'Trent Daniel', email: 'shall@botmakers.ai' },
    { name: 'Dessiah Daniel', email: 'dessiah@m.botmakers.ai' },
    { name: 'Jennifer Fuchs', email: 'jenfuchs0808@gmail.com' },
  ];

  for (const person of expectedEnrollees) {
    const { data: user } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, sponsor_id, status')
      .eq('email', person.email)
      .single();

    if (user && user.sponsor_id !== charles.id) {
      const { data: currentSponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name')
        .eq('id', user.sponsor_id || '')
        .single();

      const sponsorName = currentSponsor ? `${currentSponsor.first_name} ${currentSponsor.last_name}` : 'NONE';
      console.log(`   ❌ ${person.name}: sponsor is "${sponsorName}" (should be Charles Potter)`);
      issues.push(`${person.name} has wrong sponsor: ${sponsorName} instead of Charles Potter`);
    } else if (user) {
      console.log(`   ✅ ${person.name}: correct sponsor`);
    }
  }

  // 6. Check Donna Harvey -> Lamyrle Ituah
  console.log(`\n5️⃣ Checking Donna Harvey -> Lamyrle Ituah chain...\n`);

  const { data: donnaHarvey } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', 'harveydk@sbcglobal.net')
    .single();

  const { data: lamyrle } = await supabase
    .from('distributors')
    .select('id, sponsor_id')
    .eq('email', 'litua21@gmail.com')
    .single();

  if (lamyrle && donnaHarvey && lamyrle.sponsor_id !== donnaHarvey.id) {
    console.log(`   ❌ Lamyrle Ituah: wrong sponsor (should be Donna Harvey)`);
    issues.push(`Lamyrle Ituah has wrong sponsor (should be Donna Harvey)`);
  } else {
    console.log(`   ✅ Lamyrle Ituah: correct sponsor`);
  }

  // Summary
  console.log(`\n=== SUMMARY ===\n`);
  console.log(`Total issues found: ${issues.length}\n`);
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));

  console.log(`\n=== ROOT CAUSES ===\n`);
  console.log(`1. enrollment_stats table is stale/missing (cached counts not updated)`);
  console.log(`2. Wrong sponsor_id assignments in distributors table`);
  console.log(`3. No trigger to auto-update enrollment_stats when sponsor_id changes`);
}

analyzeConsistency();
