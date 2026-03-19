const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const fs = require('fs');

// Supabase client
const supabase = createClient(
  'https://brejvdvzwshroxkkhmzy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk'
);

// Resend client (need API key from env)
const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

async function sendPhoneRequestEmails() {
  console.log('📧 SENDING PHONE NUMBER REQUEST EMAILS\n');
  console.log('═'.repeat(60));

  // Get distributors without phone numbers
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, phone')
    .or('phone.is.null,phone.eq.')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching distributors:', error);
    return;
  }

  console.log(`\n📊 Found ${distributors.length} distributors without phone numbers\n`);

  // Load email template
  const emailTemplate = fs.readFileSync('sms-feature-announcement-email.html', 'utf8');

  let successCount = 0;
  let errorCount = 0;

  for (const rep of distributors) {
    try {
      console.log(`Sending to: ${rep.first_name} ${rep.last_name} (${rep.email})...`);

      // Send email via Resend
      const result = await resend.emails.send({
        from: 'Apex Affinity Group <notifications@reachtheapex.net>',
        to: rep.email,
        subject: '🚀 New AI Feature: Real-Time SMS Notifications - Update Your Phone Number',
        html: emailTemplate,
      });

      console.log(`✅ Sent! Message ID: ${result.id}\n`);
      successCount++;

      // Wait 500ms between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      console.error(`❌ Error sending to ${rep.email}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   ✅ Successfully sent: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📧 Total recipients: ${distributors.length}`);
  console.log('');
}

sendPhoneRequestEmails().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
