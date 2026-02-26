// Send welcome emails to all distributors who signed up today
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function sendTodaysWelcomeEmails() {
  const supabase = createServiceClient();

  console.log('🔍 Finding all distributors who signed up today...\n');

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all distributors created today
  const { data: todaysSignups, error } = await supabase
    .from('distributors')
    .select('*')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching distributors:', error);
    return;
  }

  console.log(`📊 Found ${todaysSignups?.length || 0} distributors who signed up today\n`);

  if (!todaysSignups || todaysSignups.length === 0) {
    console.log('No signups today.');
    return;
  }

  // Check which ones already have campaigns
  const results = {
    alreadySent: [] as string[],
    sent: [] as string[],
    failed: [] as Array<{ name: string; error: string }>,
  };

  for (const dist of todaysSignups) {
    const fullName = `${dist.first_name} ${dist.last_name}`;
    console.log(`\n📧 Processing: ${fullName} (${dist.email})`);

    // Check if campaign already exists
    const { data: existingCampaign } = await supabase
      .from('email_campaigns')
      .select('id')
      .eq('distributor_id', dist.id)
      .single();

    if (existingCampaign) {
      console.log('   ⏭️  Already has campaign - skipping');
      results.alreadySent.push(fullName);
      continue;
    }

    // Enroll in campaign (this will send welcome email)
    console.log('   📤 Sending welcome email...');
    const result = await enrollInCampaign(dist as Distributor);

    if (result.success) {
      console.log('   ✅ Email sent successfully!');
      results.sent.push(fullName);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      results.failed.push({ name: fullName, error: result.error || 'Unknown error' });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  if (results.alreadySent.length > 0) {
    console.log(`\n✅ Already received welcome email (${results.alreadySent.length}):`);
    results.alreadySent.forEach((name) => console.log(`   - ${name}`));
  }

  if (results.sent.length > 0) {
    console.log(`\n📧 Welcome emails sent today (${results.sent.length}):`);
    results.sent.forEach((name) => console.log(`   - ${name}`));
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed to send (${results.failed.length}):`);
    results.failed.forEach((item) => console.log(`   - ${item.name}: ${item.error}`));
  }

  console.log(`\n✅ Total processed: ${todaysSignups.length}`);
}

sendTodaysWelcomeEmails().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
