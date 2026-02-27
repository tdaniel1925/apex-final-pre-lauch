// Send new welcome emails to all distributors
import { createServiceClient } from '../src/lib/supabase/service';
import { Resend } from 'resend';
import { renderEmailTemplate } from '../src/lib/email/template-variables';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmailsToAll() {
  const supabase = createServiceClient();

  console.log('📧 Sending updated welcome emails to all distributors...\n');

  // Get all distributors with auth accounts
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('*')
    .not('auth_user_id', 'is', null)
    .eq('licensing_status', 'licensed')
    .order('created_at', { ascending: true });

  if (error || !distributors) {
    console.error('❌ Error fetching distributors:', error);
    return;
  }

  console.log(`Found ${distributors.length} licensed distributors\n`);

  // Get the welcome template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'welcome-licensed')
    .single();

  if (templateError || !template) {
    console.error('❌ Error fetching template:', templateError);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const distributor of distributors) {
    try {
      // Render the template with distributor data
      const renderedEmail = renderEmailTemplate(template, distributor);

      // Send the email
      const { error: sendError } = await resend.emails.send({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: [distributor.email],
        subject: renderedEmail.subject,
        html: renderedEmail.body,
      });

      if (sendError) {
        console.error(`❌ Failed to send to ${distributor.email}:`, sendError);
        errorCount++;
      } else {
        console.log(`✅ Sent to ${distributor.first_name} ${distributor.last_name} (${distributor.email})`);
        successCount++;
      }

      // Delay to avoid rate limiting (2 per second = 500ms delay)
      await new Promise(resolve => setTimeout(resolve, 600));

    } catch (error) {
      console.error(`❌ Error sending to ${distributor.email}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully sent: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📧 Total: ${distributors.length}`);
}

sendWelcomeEmailsToAll().then(() => {
  console.log('\n✅ Bulk welcome email send complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
