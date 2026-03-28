// Send Training Announcement Test to tdaniel@botmakers.ai
import { Resend } from 'resend';
import { createServiceClient } from '../src/lib/supabase/service';
import * as fs from 'fs/promises';
import * as path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestAnnouncement() {
  console.log('📧 Sending test training announcement to tdaniel@botmakers.ai...\n');

  const supabase = createServiceClient();

  // Load base email template
  const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
  const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

  // Create email content
  const emailContent = `
    <div style="padding: 40px 0;">
      <h1 style="color: #1e293b; font-size: 28px; font-weight: bold; margin-bottom: 24px; text-align: center;">
        🚀 Tonight's Training: AI Assistant + Pulse Products
      </h1>

      <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #1e40af; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">
          📅 TONIGHT at 6:30 PM Central Time
        </h2>
        <p style="color: #475569; margin: 0;">
          Don't miss this important session!
        </p>
      </div>

      <p style="color: #334155; line-height: 1.6; margin-bottom: 24px;">
        We're excited to show you two powerful new tools that will help you grow your Apex business:
      </p>

      <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; font-size: 20px; font-weight: bold; margin: 0 0 16px 0;">
          1. Your New AI Assistant 🤖
        </h3>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 12px;">
          Your back office now includes a personal AI assistant that can help you:
        </p>
        <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 24px;">
          <li>Answer questions about your commissions and team</li>
          <li>Create meeting registrations instantly</li>
          <li>Generate promotional materials</li>
          <li>Track your progress toward your next rank</li>
          <li>And much more!</li>
        </ul>
        <p style="color: #1e40af; font-weight: 600; margin-top: 16px; margin-bottom: 0;">
          It's like having a personal business manager available 24/7.
        </p>
      </div>

      <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <h3 style="color: #1e293b; font-size: 20px; font-weight: bold; margin: 0 0 16px 0;">
          2. The Pulse Product Line 💼
        </h3>
        <p style="color: #475569; line-height: 1.6; margin-bottom: 16px;">
          Learn about our complete suite of AI-powered products:
        </p>
        <ul style="color: #475569; line-height: 1.8; margin: 0 0 16px 0; padding-left: 24px;">
          <li><strong>PulseMarket</strong> ($39/month) - Essential AI tools for everyday business</li>
          <li><strong>PulseGuard</strong> ($79/month) - Advanced protection and automation</li>
          <li><strong>PulseFlow</strong> ($149/month) - Complete business workflow automation</li>
          <li><strong>PulseDrive</strong> ($299/month) - Enterprise-level AI solutions</li>
          <li><strong>PulseCommand</strong> ($499/month) - Ultimate AI command center</li>
        </ul>
        <p style="color: #475569; line-height: 1.6; margin: 0;">
          Plus, we'll show you exactly how to position these products and close sales confidently.
        </p>
      </div>

      <div style="background: #1e40af; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <h3 style="color: white; font-size: 20px; font-weight: bold; margin: 0 0 16px 0;">
          🔗 Join the Training
        </h3>
        <p style="color: #e0e7ff; line-height: 1.6; margin-bottom: 20px;">
          <strong style="color: white;">Time:</strong> 6:30 PM Central Time<br/>
          <strong style="color: white;">Where:</strong> <a href="https://reachtheapex.net/live" style="color: #93c5fd; text-decoration: none;">reachtheapex.net/live</a>
        </p>
        <a href="https://reachtheapex.net/live" style="display: inline-block; background: white; color: #1e40af; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Join Training Now →
        </a>
      </div>

      <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
        <h4 style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">
          What to Bring:
        </h4>
        <ul style="color: #78350f; line-height: 1.8; margin: 0; padding-left: 24px;">
          <li>Your questions about the AI Assistant</li>
          <li>A notepad for the product positioning tips</li>
          <li>Your excitement to learn!</li>
        </ul>
      </div>

      <h3 style="color: #1e293b; font-size: 18px; font-weight: bold; margin-bottom: 12px;">
        This training will help you:
      </h3>
      <ul style="color: #475569; line-height: 1.8; margin-bottom: 32px; padding-left: 24px;">
        <li>✅ Use your AI Assistant to save hours each week</li>
        <li>✅ Understand which Pulse product fits which customer</li>
        <li>✅ Confidently explain the value of AI-powered solutions</li>
        <li>✅ Close more sales starting tomorrow</li>
      </ul>

      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
        <strong>Can't make it live?</strong> The recording will be available in your back office training library.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

      <p style="color: #334155; line-height: 1.6; margin-bottom: 8px;">
        See you tonight!
      </p>
      <p style="color: #1e40af; font-weight: 600; margin-bottom: 24px;">
        The Apex Team
      </p>

      <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin-top: 24px;">
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong>P.S.</strong> - Log into your back office before the training and try asking your AI Assistant a question. You'll be amazed at what it can do!
        </p>
      </div>
    </div>
  `;

  // Merge with base template
  const finalHtml = baseTemplate.replace('{{email_content}}', emailContent);

  try {
    // Send email
    const emailResult = await resend.emails.send({
      from: 'Apex Team <theapex@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: '🚀 Tonight\'s Training: Your New AI Assistant + Pulse Products (6:30 PM CT)',
      html: finalHtml,
    });

    if (emailResult.error) {
      console.error('❌ Email send failed:', emailResult.error);
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('   Email ID:', emailResult.data?.id);
    }

    // Log to database
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient_email: 'tdaniel@botmakers.ai',
        subject: '🚀 Tonight\'s Training: Your New AI Assistant + Pulse Products (6:30 PM CT)',
        status: emailResult.error ? 'failed' : 'sent',
        provider: 'resend',
        provider_message_id: emailResult.data?.id,
        error_message: emailResult.error?.message,
        template_used: 'training-announcement',
      });

    if (logError) {
      console.error('Warning: Failed to log email:', logError);
    }

  } catch (error) {
    console.error('❌ Error sending email:', error);
  }

  // Send SMS (simulated - would need Twilio integration)
  console.log('\n📱 SMS Message (would be sent via Twilio):');
  console.log('-------------------------------------------');
  console.log('To: tdaniel@botmakers.ai (test)');
  console.log('Message:');
  console.log(`
Apex Training TONIGHT 6:30 PM CT! 🚀

Learn about your NEW AI Assistant in the back office + how to sell Pulse Products confidently.

This will help you close more sales & save time!

Join: reachtheapex.net/live

Can't attend? Recording will be posted.

See you there!
- Apex Team
  `.trim());
  console.log('-------------------------------------------\n');

  console.log('✅ Test announcement sent!');
  console.log('\n📋 Next Steps:');
  console.log('1. Check tdaniel@botmakers.ai inbox for test email');
  console.log('2. Review and approve');
  console.log('3. Run send-to-all script after approval');
}

sendTestAnnouncement().catch(console.error);
