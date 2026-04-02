// =============================================
// Mass Email with BCC (Privacy Protected)
// TEMPLATE: Use this for all future mass emails
// Run with: node send-mass-email-bcc-example.js
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!RESEND_API_KEY) {
  console.error('❌ Missing RESEND_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fetch all non-test distributor emails
 */
async function getAllDistributorEmails() {
  console.log('📋 Fetching all non-test distributor emails...\n');

  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('email, first_name, last_name')
    .not('email', 'like', '%test%')
    .not('email', 'like', '%demo%')
    .not('email', 'like', '%dummy%')
    .not('first_name', 'ilike', '%test%')
    .not('last_name', 'ilike', '%test%')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching distributors:', error);
    process.exit(1);
  }

  return distributors;
}

/**
 * Send mass email using BCC to protect privacy
 * IMPORTANT: All recipients are in BCC field - they won't see each other's emails
 */
async function sendMassEmailBCC(recipients, subject, html) {
  console.log(`📧 Sending mass email to ${recipients.length} recipients via BCC...\n`);

  const emails = recipients.map(r => r.email);

  try {
    // Send with all recipients in BCC field
    // TO field is set to sender to avoid exposing recipient emails
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: 'theapex@theapexway.net', // Send to sender (won't expose in email)
        bcc: emails, // ALL RECIPIENTS IN BCC (PRIVATE)
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Mass email sent successfully!');
      console.log(`📧 Email ID: ${data.id}`);
      console.log(`📬 Recipients: ${emails.length} (all in BCC - privacy protected)`);
      return { success: true, emailId: data.id };
    } else {
      console.error('❌ Failed to send email:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  // Example email HTML (replace with your actual content)
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Mass Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #212529;">Example Mass Email</h1>
        <p style="color: #495057; line-height: 1.6;">
            This is an example of a mass email sent via BCC to protect recipient privacy.
        </p>
        <p style="color: #495057; line-height: 1.6;">
            Replace this content with your actual email message.
        </p>
    </div>
</body>
</html>
  `;

  // Fetch distributors
  const distributors = await getAllDistributorEmails();

  console.log(`📋 Found ${distributors.length} non-test distributors\n`);

  if (distributors.length === 0) {
    console.log('⚠️  No distributors found to send to');
    return;
  }

  // Show preview of first 5
  console.log('📝 First 5 recipients:');
  distributors.slice(0, 5).forEach(d => {
    console.log(`   - ${d.first_name} ${d.last_name} <${d.email}>`);
  });
  console.log('');

  // Confirm before sending
  console.log('⚠️  READY TO SEND VIA BCC (PRIVACY PROTECTED)');
  console.log('   Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Send mass email via BCC
  const result = await sendMassEmailBCC(
    distributors,
    'Example Mass Email Subject',
    emailHtml
  );

  if (result.success) {
    console.log('\n✅ Mass email sent successfully!');
    console.log('🔒 Privacy protected: All recipients in BCC field');
  } else {
    console.log('\n❌ Failed to send mass email');
    process.exit(1);
  }
}

main();
