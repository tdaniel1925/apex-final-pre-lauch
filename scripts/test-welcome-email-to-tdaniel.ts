// Test welcome email (sends to tdaniel@botmakers.ai only)
import { createServiceClient } from '../src/lib/supabase/service';
import { Resend } from 'resend';
import { renderEmailTemplate } from '../src/lib/email/template-variables';

async function testWelcomeEmail() {
  const supabase = createServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log('📧 Testing welcome email to tdaniel@botmakers.ai...\n');

  // Get a real distributor for template testing (use any active distributor)
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('*')
    .eq('licensing_status', 'licensed')
    .limit(1)
    .single();

  if (distError || !distributor) {
    console.error('❌ Error fetching distributor:', distError);
    return;
  }

  console.log('✅ Using distributor data from:', distributor.first_name, distributor.last_name);

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

  console.log('✅ Got template:', template.template_name);

  // Render the template with distributor data
  const renderedEmail = renderEmailTemplate(template, distributor);

  console.log('\n📧 Rendered Email:');
  console.log('Subject:', renderedEmail.subject);

  // Check if variables were replaced correctly
  console.log('\n🔍 Checking variable replacement:');
  const hasUnreplacedVars = renderedEmail.body.match(/\{[a-z_]+\}/g);
  if (hasUnreplacedVars) {
    console.log('❌ Found unreplaced variables:', hasUnreplacedVars);
  } else {
    console.log('✅ All variables replaced successfully!');
  }

  // Send the email to tdaniel@botmakers.ai (override the distributor's email)
  console.log('\n📤 Sending test email to: tdaniel@botmakers.ai');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: ['tdaniel@botmakers.ai'],
      subject: renderedEmail.subject,
      html: renderedEmail.body,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', data?.id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWelcomeEmail().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
