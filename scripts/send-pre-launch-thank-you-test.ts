// =============================================
// Send Pre-Launch Thank You Email - Test
// Send to tdaniel@botmakers.ai for review
// =============================================

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  console.log('📧 Sending Pre-Launch Thank You Test Email...\n');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Being Part of Our Pre-Launch Journey!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo img {
      max-width: 200px;
      height: auto;
    }
    h1 {
      color: #2B4C7E;
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
    }
    h2 {
      color: #2B4C7E;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #2B4C7E;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
    }
    ul {
      margin-bottom: 15px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .support-box {
      background-color: #f8f9fa;
      border-left: 4px solid #2B4C7E;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .support-item {
      margin-bottom: 15px;
    }
    .support-item strong {
      color: #2B4C7E;
      display: block;
      margin-bottom: 5px;
    }
    .phone {
      font-size: 18px;
      color: #D4463C;
      font-weight: bold;
    }
    .email {
      font-size: 16px;
      color: #2B4C7E;
      font-weight: bold;
    }
    .tip {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
    .signature {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .ps {
      font-style: italic;
      color: #666;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px dashed #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://reachtheapex.net/apex-logo.png" alt="Apex Affinity Group" />
    </div>

    <h1>Thank You for Being Part of Our Pre-Launch Journey! 🌟</h1>

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

    <div class="support-box">
      <div class="support-item">
        <strong>📞 24/7 AI Hotline</strong>
        <div>Call anytime, day or night: <span class="phone">1 (832) 909-1715</span></div>
        <div style="font-size: 14px; color: #666; margin-top: 5px;">Our intelligent support system is available around the clock to help you.</div>
      </div>

      <div class="support-item">
        <strong>📧 Email Support</strong>
        <div><a href="mailto:support@reachtheapex.net" class="email">support@reachtheapex.net</a></div>
        <div style="font-size: 14px; color: #666; margin-top: 5px;">Send detailed reports, screenshots, or questions. We review every message and respond promptly.</div>
      </div>
    </div>

    <div class="tip">
      <strong>💡 Pro Tip:</strong> When reporting an issue, screenshots are incredibly helpful! They allow us to see exactly what you're experiencing and resolve problems faster.
    </div>

    <h2>Moving Forward Together</h2>

    <p>Over the coming weeks, you'll see continuous improvements to the platform as we refine features and fix any issues you help us identify. Your patience and partnership during this phase are truly appreciated.</p>

    <p>Remember: <strong>Every challenge we overcome together now means a smoother, more powerful experience for our entire community.</strong></p>

    <h2>Questions?</h2>

    <p>Don't hesitate to reach out using either of the support channels above. There's no such thing as a "silly question" – if you're wondering about it, chances are others are too!</p>

    <p>Thank you again for your trust, your patience, and your commitment to excellence. We're honored to have you as part of the Apex family.</p>

    <div class="signature">
      <p><strong>To your success,</strong></p>
      <p>The Apex Affinity Group Leadership Team</p>
    </div>

    <div class="ps">
      <p><strong>P.S.</strong> Keep an eye on your inbox – we'll be sharing exciting updates and new features as we progress through the pre-launch phase!</p>
    </div>

    <div class="footer">
      <p>© 2024 Apex Affinity Group. All rights reserved.</p>
      <p><a href="https://reachtheapex.net">reachtheapex.net</a></p>
    </div>
  </div>
</body>
</html>
  `;

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

    console.log('✅ Test email sent successfully!');
    console.log('\nEmail Details:');
    console.log('   To: tdaniel@botmakers.ai');
    console.log('   From: Apex Affinity Group <theapex@theapexway.net>');
    console.log('   Subject: Thank You for Being Part of Our Pre-Launch Journey! 🌟');
    console.log('\n   Support Phone: 1 (832) 909-1715');
    console.log('   Support Email: support@reachtheapex.net');

    if (data) {
      console.log('\n   Resend Email ID:', data.id);
    }

    console.log('\n📧 Check tdaniel@botmakers.ai inbox to review the email!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

sendTestEmail();
