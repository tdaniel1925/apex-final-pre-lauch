// =============================================
// Send Branded Pre-Launch Thank You Email - Test
// Using new Apex email template
// =============================================

import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { createApexEmailTemplate } from '../src/lib/email/apex-email-template';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBrandedTestEmail() {
  console.log('📧 Sending Branded Pre-Launch Thank You Test Email...\n');

  const emailContent = `
    <h1>Thank You for Being Part of Our <em>Pre-Launch Journey!</em></h1>

    <p>Dear [First Name],</p>

    <p><strong>Thank you for being a valued member of the Apex Affinity Group family!</strong></p>

    <p>We want to take a moment to express our sincere gratitude for joining us during this exciting pre-launch phase. You weren't randomly chosen – you were <strong>hand-selected</strong> to be part of our exclusive beta testing team, and we couldn't be more grateful for your participation.</p>

    <h2>Why You Were Chosen</h2>

    <p>As one of our founding members, your feedback and experience during these early stages are invaluable. You're helping us build something truly special, and your insights will shape the future of Apex for thousands of distributors to come.</p>

    <h2>What to Expect During Pre-Launch</h2>

    <p>During this beta testing phase, you may occasionally experience:</p>
    <ul>
      <li>Minor technical glitches</li>
      <li>System updates and improvements</li>
      <li>Feature refinements based on your feedback</li>
      <li>Brief periods of maintenance</li>
    </ul>

    <p><span class="highlight">This is completely normal and expected</span> – it's why we have a pre-launch phase! Every issue you encounter and report helps us create a better, more reliable platform for everyone.</p>

    <h2>We're Here to Support You 24/7</h2>

    <p>Your success is our priority. If you encounter any issues, have questions, or need assistance, we've made it easy to reach us:</p>

    <div class="info-box">
      <h3>📞 24/7 AI Hotline</h3>
      <p>Call anytime, day or night: <span class="phone">1 (832) 909-1715</span></p>
      <p style="font-size: 13px; color: #7A8098;">Our intelligent support system is available around the clock to help you.</p>

      <h3 style="margin-top: 20px;">📧 Email Support</h3>
      <p><a href="mailto:support@reachtheapex.net" class="contact-info">support@reachtheapex.net</a></p>
      <p style="font-size: 13px; color: #7A8098;">Send detailed reports, screenshots, or questions. We review every message and respond promptly.</p>
    </div>

    <div class="tip-box">
      <p><strong>💡 Pro Tip:</strong> When reporting an issue, screenshots are incredibly helpful! They allow us to see exactly what you're experiencing and resolve problems faster.</p>
    </div>

    <h2>Moving Forward Together</h2>

    <p>Over the coming weeks, you'll see continuous improvements to the platform as we refine features and fix any issues you help us identify. Your patience and partnership during this phase are truly appreciated.</p>

    <p>Remember: <strong>Every challenge we overcome together now means a smoother, more powerful experience for our entire community.</strong></p>

    <h2>Questions?</h2>

    <p>Don't hesitate to reach out using either of the support channels above. There's no such thing as a "silly question" – if you're wondering about it, chances are others are too!</p>

    <p>Thank you again for your trust, your patience, and your commitment to excellence. We're honored to have you as part of the Apex family.</p>

    <p style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E4E7F0;"><strong>To your success,</strong></p>
    <p>The Apex Affinity Group Leadership Team</p>

    <p style="margin-top: 32px; padding-top: 24px; border-top: 1px dashed #E4E7F0; font-style: italic; color: #7A8098;"><strong>P.S.</strong> Keep an eye on your inbox – we'll be sharing exciting updates and new features as we progress through the pre-launch phase!</p>
  `;

  const htmlContent = createApexEmailTemplate({
    preheader: 'Thank you for being hand-selected for our pre-launch beta testing team!',
    content: emailContent,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: ['tdaniel@botmakers.ai'],
      subject: 'Thank You for Being Part of Our Pre-Launch Journey! 🌟',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('✅ Branded test email sent successfully!');
    console.log('\nEmail Details:');
    console.log('   To: tdaniel@botmakers.ai');
    console.log('   From: Apex Affinity Group <theapex@theapexway.net>');
    console.log('   Subject: Thank You for Being Part of Our Pre-Launch Journey! 🌟');
    console.log('   Template: Apex Branded Email Template');
    console.log('\n   Support Phone: 1 (832) 909-1715');
    console.log('   Support Email: support@reachtheapex.net');

    if (data) {
      console.log('\n   Resend Email ID:', data.id);
    }

    console.log('\n📧 Check tdaniel@botmakers.ai inbox to review the branded email!');
    console.log('   ✨ This template can now be used for all future Apex emails');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

sendBrandedTestEmail();
