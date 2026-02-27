// =============================================
// Send Email with White PNG Logo and Visible Grid
// =============================================

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWhiteLogoTest() {
  console.log('📧 Sending Email with White PNG Logo and Visible Grid...\n');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F0F2F8;">
  <!-- Wrapper Table -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F2F8; padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">

          <!-- HEADER - Navy Blue with LIGHT VISIBLE Grid Pattern -->
          <tr>
            <td align="center" bgcolor="#0A1A3F" style="padding: 60px 24px; background-color: #0A1A3F; background-image: repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px);">
              <!-- White PNG Logo -->
              <img src="https://reachtheapex.net/apex-logo-white.png" alt="Apex Affinity Group" width="320" style="display: block; max-width: 320px; height: auto;" />
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 40px 32px; color: #4A5068; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7;">

              <h1 style="font-family: Georgia, serif; font-size: 28px; line-height: 1.2; color: #0F2354; margin: 0 0 20px 0;">
                Thank You for Being Part of Our <span style="font-style: italic; color: #C7181F;">Pre-Launch Journey!</span>
              </h1>

              <p style="margin: 0 0 16px 0;">Dear [First Name],</p>

              <p style="margin: 0 0 16px 0;"><strong style="color: #0F2354;">Thank you for being a valued member of the Apex Affinity Group family!</strong></p>

              <p style="margin: 0 0 16px 0;">We want to take a moment to express our sincere gratitude for joining us during this exciting pre-launch phase. You weren't randomly chosen – you were <strong>hand-selected</strong> to be part of our exclusive beta testing team, and we couldn't be more grateful for your participation.</p>

              <h2 style="font-family: Georgia, serif; font-size: 22px; line-height: 1.3; color: #0F2354; margin: 32px 0 12px 0;">Why You Were Chosen</h2>

              <p style="margin: 0 0 16px 0;">As one of our founding members, your feedback and experience during these early stages are invaluable. You're helping us build something truly special, and your insights will shape the future of Apex for thousands of distributors to come.</p>

              <h2 style="font-family: Georgia, serif; font-size: 22px; line-height: 1.3; color: #0F2354; margin: 32px 0 12px 0;">What to Expect During Pre-Launch</h2>

              <p style="margin: 0 0 16px 0;">During this beta testing phase, you may occasionally experience:</p>
              <ul style="margin: 16px 0; padding-left: 24px;">
                <li style="margin-bottom: 8px;">Minor technical glitches</li>
                <li style="margin-bottom: 8px;">System updates and improvements</li>
                <li style="margin-bottom: 8px;">Feature refinements based on your feedback</li>
                <li style="margin-bottom: 8px;">Brief periods of maintenance</li>
              </ul>

              <p style="margin: 0 0 16px 0;"><span style="background-color: #fff3cd; padding: 2px 6px; border-radius: 3px; font-weight: 600;">This is completely normal and expected</span> – it's why we have a pre-launch phase! Every issue you encounter and report helps us create a better, more reliable platform for everyone.</p>

              <h2 style="font-family: Georgia, serif; font-size: 22px; line-height: 1.3; color: #0F2354; margin: 32px 0 12px 0;">We're Here to Support You 24/7</h2>

              <p style="margin: 0 0 16px 0;">Your success is our priority. If you encounter any issues, have questions, or need assistance, we've made it easy to reach us:</p>

              <!-- Support Info Box -->
              <table width="100%" cellpadding="24" cellspacing="0" border="0" style="background-color: #F0F2F8; border-left: 4px solid #1B3A7D; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <h3 style="font-size: 16px; font-weight: 700; color: #0F2354; margin: 0 0 10px 0;">📞 24/7 AI Hotline</h3>
                    <p style="margin: 0 0 12px 0;">Call anytime, day or night: <span style="color: #C7181F; font-size: 18px; font-weight: 700;">1 (832) 909-1715</span></p>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #7A8098;">Our intelligent support system is available around the clock to help you.</p>

                    <h3 style="font-size: 16px; font-weight: 700; color: #0F2354; margin: 20px 0 10px 0;">📧 Email Support</h3>
                    <p style="margin: 0 0 12px 0;"><a href="mailto:support@reachtheapex.net" style="color: #1B3A7D; font-weight: 700; font-size: 16px; text-decoration: none;">support@reachtheapex.net</a></p>
                    <p style="margin: 0; font-size: 13px; color: #7A8098;">Send detailed reports, screenshots, or questions. We review every message and respond promptly.</p>
                  </td>
                </tr>
              </table>

              <!-- Tip Box -->
              <table width="100%" cellpadding="20" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="margin: 0;"><strong>💡 Pro Tip:</strong> When reporting an issue, screenshots are incredibly helpful! They allow us to see exactly what you're experiencing and resolve problems faster.</p>
                  </td>
                </tr>
              </table>

              <h2 style="font-family: Georgia, serif; font-size: 22px; line-height: 1.3; color: #0F2354; margin: 32px 0 12px 0;">Moving Forward Together</h2>

              <p style="margin: 0 0 16px 0;">Over the coming weeks, you'll see continuous improvements to the platform as we refine features and fix any issues you help us identify. Your patience and partnership during this phase are truly appreciated.</p>

              <p style="margin: 0 0 16px 0;">Remember: <strong>Every challenge we overcome together now means a smoother, more powerful experience for our entire community.</strong></p>

              <h2 style="font-family: Georgia, serif; font-size: 22px; line-height: 1.3; color: #0F2354; margin: 32px 0 12px 0;">Questions?</h2>

              <p style="margin: 0 0 16px 0;">Don't hesitate to reach out using either of the support channels above. There's no such thing as a "silly question" – if you're wondering about it, chances are others are too!</p>

              <p style="margin: 0 0 16px 0;">Thank you again for your trust, your patience, and your commitment to excellence. We're honored to have you as part of the Apex family.</p>

              <p style="margin: 40px 0 0 0; padding-top: 24px; border-top: 1px solid #E4E7F0;"><strong>To your success,</strong></p>
              <p style="margin: 0 0 16px 0;">The Apex Affinity Group Leadership Team</p>

              <p style="margin: 32px 0 0 0; padding-top: 24px; border-top: 1px dashed #E4E7F0; font-style: italic; color: #7A8098;"><strong>P.S.</strong> Keep an eye on your inbox – we'll be sharing exciting updates and new features as we progress through the pre-launch phase!</p>

            </td>
          </tr>

          <!-- FOOTER - Navy Blue with LIGHT VISIBLE Grid Pattern -->
          <tr>
            <td align="center" bgcolor="#0A1A3F" style="padding: 32px 24px; background-color: #0A1A3F; background-image: repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px); border-top: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Apex Affinity Group</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Changing the insurance industry. One agent at a time.</p>
              <p style="margin: 16px 0 0 0; font-size: 13px;">
                <a href="https://reachtheapex.net" style="color: #FF4C52; text-decoration: none;">reachtheapex.net</a>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.3);">
                © 2024 Apex Affinity Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: ['tdaniel@botmakers.ai'],
      subject: '🎯 White PNG Logo + Visible Grid - Pre-Launch Thank You!',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('✅ Email with White PNG Logo and Visible Grid sent!');
    console.log('\nThis version has:');
    console.log('   ✅ White PNG logo from "Apex Affinity Grop Logo - All White PNG.png"');
    console.log('   ✅ BRIGHTER grid pattern (15% opacity instead of 8%)');
    console.log('   ✅ Grid in BOTH header AND footer');
    console.log('   ✅ Navy blue backgrounds (#0A1A3F)');
    console.log('   ✅ Logo size: 320px width');
    console.log('   ✅ NO badge pill');
    console.log('\n   Email ID:', data?.id);
    console.log('\n📧 CHECK YOUR INBOX - Subject: "🎯 White PNG Logo + Visible Grid"');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

sendWhiteLogoTest();
