import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixEnrollmentDependencies() {
  console.log('\n=== FIXING ENROLLMENT DEPENDENCY ISSUES ===\n');

  const fixes: string[] = [];
  const errors: string[] = [];

  // Get all the distributor IDs we need
  const { data: charles } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', 'fyifromcharles@gmail.com')
    .single();

  const { data: donnaHarvey } = await supabase
    .from('distributors')
    .select('id')
    .eq('email', 'harveydk@sbcglobal.net')
    .single();

  if (!charles || !donnaHarvey) {
    console.log('❌ Could not find required distributors');
    return;
  }

  // FIX 1: Update Trent Daniel sponsor
  console.log('1️⃣ Fixing Trent Daniel sponsor...');
  const { error: trentError } = await supabase
    .from('distributors')
    .update({ sponsor_id: charles.id })
    .eq('email', 'shall@botmakers.ai');

  if (trentError) {
    errors.push(`Trent Daniel: ${trentError.message}`);
    console.log(`   ❌ ${trentError.message}`);
  } else {
    fixes.push('Trent Daniel sponsor updated to Charles Potter');
    console.log(`   ✅ Updated`);
  }

  // FIX 2: Update Dessiah Daniel sponsor
  console.log('2️⃣ Fixing Dessiah Daniel sponsor...');
  const { error: dessiahError } = await supabase
    .from('distributors')
    .update({ sponsor_id: charles.id })
    .eq('email', 'dessiah@m.botmakers.ai');

  if (dessiahError) {
    errors.push(`Dessiah Daniel: ${dessiahError.message}`);
    console.log(`   ❌ ${dessiahError.message}`);
  } else {
    fixes.push('Dessiah Daniel sponsor updated to Charles Potter');
    console.log(`   ✅ Updated`);
  }

  // FIX 3: Update Jennifer Fuchs sponsor
  console.log('3️⃣ Fixing Jennifer Fuchs sponsor...');
  const { error: jenniferError } = await supabase
    .from('distributors')
    .update({ sponsor_id: charles.id })
    .eq('email', 'jenfuchs0808@gmail.com');

  if (jenniferError) {
    errors.push(`Jennifer Fuchs: ${jenniferError.message}`);
    console.log(`   ❌ ${jenniferError.message}`);
  } else {
    fixes.push('Jennifer Fuchs sponsor updated to Charles Potter');
    console.log(`   ✅ Updated`);
  }

  // FIX 4: Update Lamyrle Ituah sponsor
  console.log('4️⃣ Fixing Lamyrle Ituah sponsor...');
  const { error: lamyrleError } = await supabase
    .from('distributors')
    .update({ sponsor_id: donnaHarvey.id })
    .eq('email', 'litua21@gmail.com');

  if (lamyrleError) {
    errors.push(`Lamyrle Ituah: ${lamyrleError.message}`);
    console.log(`   ❌ ${lamyrleError.message}`);
  } else {
    fixes.push('Lamyrle Ituah sponsor updated to Donna Harvey');
    console.log(`   ✅ Updated`);
  }

  // FIX 5: Rebuild enrollment_stats for Charles Potter
  console.log('\n5️⃣ Rebuilding enrollment_stats for Charles Potter...');

  // Count direct enrollees
  const { count: l1Count } = await supabase
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', charles.id)
    .eq('status', 'active');

  // Count total downline recursively
  async function countDownline(sponsorId: string): Promise<number> {
    const { data: directChildren } = await supabase
      .from('distributors')
      .select('id')
      .eq('sponsor_id', sponsorId)
      .eq('status', 'active');

    if (!directChildren || directChildren.length === 0) {
      return 0;
    }

    let total = directChildren.length;
    for (const child of directChildren) {
      total += await countDownline(child.id);
    }
    return total;
  }

  const totalDownline = await countDownline(charles.id);

  // Check if enrollment_stats record exists
  const { data: existingStats } = await supabase
    .from('enrollment_stats')
    .select('id')
    .eq('distributor_id', charles.id)
    .single();

  if (existingStats) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('enrollment_stats')
      .update({
        l1_direct: l1Count,
        total_downline: totalDownline,
        last_updated: new Date().toISOString(),
      })
      .eq('distributor_id', charles.id);

    if (updateError) {
      errors.push(`enrollment_stats update: ${updateError.message}`);
      console.log(`   ❌ ${updateError.message}`);
    } else {
      fixes.push(`enrollment_stats updated: l1_direct=${l1Count}, total_downline=${totalDownline}`);
      console.log(`   ✅ Updated: l1_direct=${l1Count}, total_downline=${totalDownline}`);
    }
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from('enrollment_stats')
      .insert({
        distributor_id: charles.id,
        l1_direct: l1Count,
        total_downline: totalDownline,
        last_updated: new Date().toISOString(),
      });

    if (insertError) {
      errors.push(`enrollment_stats insert: ${insertError.message}`);
      console.log(`   ❌ ${insertError.message}`);
    } else {
      fixes.push(`enrollment_stats created: l1_direct=${l1Count}, total_downline=${totalDownline}`);
      console.log(`   ✅ Created: l1_direct=${l1Count}, total_downline=${totalDownline}`);
    }
  }

  // SUMMARY
  console.log(`\n=== SUMMARY ===\n`);
  console.log(`✅ Successful fixes: ${fixes.length}`);
  fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));

  if (errors.length > 0) {
    console.log(`\n❌ Errors: ${errors.length}`);
    errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }

  console.log('\n=== VERIFICATION ===\n');

  // Verify Charles Potter's enrollment count
  const { data: charlesEnrollees, count: verifyCount } = await supabase
    .from('distributors')
    .select('first_name, last_name, email', { count: 'exact' })
    .eq('sponsor_id', charles.id)
    .eq('status', 'active');

  console.log(`Charles Potter L1 Direct Enrollees: ${verifyCount}`);
  charlesEnrollees?.forEach(e => console.log(`   • ${e.first_name} ${e.last_name} (${e.email})`));
}

fixEnrollmentDependencies();
