// Send Pulse Products & Business Center Launch Announcement
// Run with: node send-pulse-announcement.js

require('dotenv').config({ path: '.env.local' });

async function sendAnnouncementEmail() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pulse Products & Business Center Now Available!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <!-- Header with logo -->
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px 40px 30px 40px; text-align: center; border-bottom: 2px solid #2c5aa0;">
                            <img src="https://theapexway.net/apex-logo-full.png" alt="Apex Affinity Group" style="max-width: 280px; height: auto; margin: 0 auto; display: block;" />
                        </td>
                    </tr>

                    <!-- Content area -->
                    <tr>
                        <td style="padding: 40px 40px;">
                            <h1 style="color: #212529; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
                                🎁 We're Giving You a $500/Month CRM... FOR FREE!
                            </h1>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>First, a quick apology:</strong> Our Pulse products and Business Center were scheduled to launch yesterday, but we made a last-minute decision that's going to blow your mind.
                            </p>

                            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 24px; margin: 24px 0;">
                                <h2 style="color: #155724; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                                    💎 $500/Month Value - Yours COMPLETELY FREE
                                </h2>
                                <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;">
                                    We've built you a <strong>sleek, AI-powered CRM system</strong> that normally costs $500/month from other providers - and we're including it FREE with your Business Center membership!
                                </p>
                                <p style="color: #155724; font-size: 16px; line-height: 1.6; margin: 0;">
                                    You can literally run your <strong>entire Apex business AND any other business</strong> using this complete system. No more paying for expensive out-of-the-box CRMs!
                                </p>
                            </div>

                            <p style="color: #495057; font-size: 17px; line-height: 1.6; margin: 0 0 20px 0; font-weight: 600;">
                                This is the magic of AI and Apex Affinity Group in action:
                            </p>

                            <ul style="color: #495057; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 24px;">
                                <li><strong>Lead tracking & management</strong> - Know exactly where every prospect is</li>
                                <li><strong>Automated follow-ups</strong> - Never miss a touchpoint again</li>
                                <li><strong>AI-powered insights</strong> - Get smart recommendations on your pipeline</li>
                                <li><strong>Team collaboration</strong> - Perfect for growing your downline</li>
                                <li><strong>Works for ANY business</strong> - Real estate, insurance, consulting, you name it!</li>
                            </ul>

                            <p style="color: #2c5aa0; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 700; text-align: center;">
                                💡 We make business affordable! 💡
                            </p>

                            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; margin: 24px 0;">
                                <p style="color: #212529; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                                    ⏰ Everything Goes Live Before Tonight's Training
                                </p>
                                <p style="color: #495057; font-size: 15px; line-height: 1.6; margin: 0;">
                                    All Pulse products and the Business Center (with your FREE $500/month CRM) will be ready for purchase <strong>before tonight's training session</strong> at 6:30 PM.
                                </p>
                            </div>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Building this incredible tool took a little extra time, but we promise it's worth the wait. You're going to love it!
                            </p>

                            <h2 style="color: #212529; font-size: 22px; font-weight: 700; margin: 32px 0 16px 0;">
                                🔥 Tonight's Training: Sell 14 Subscriptions in 14 Days
                            </h2>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Join us tonight at <strong>6:30 PM</strong> as <strong>Trent Daniel</strong> reveals his proven system for selling 14 subscriptions in just 14 days.
                            </p>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                This is training you absolutely <strong>don't want to miss</strong>. Trent will walk you through the exact strategies, scripts, and follow-up sequences that will transform your business.
                            </p>

                            <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                <tr>
                                    <td style="background-color: #2c5aa0; border-radius: 6px; padding: 16px 32px; text-align: center;">
                                        <a href="https://reachtheapex.net/live" style="color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: block;">
                                            Join Tonight's Training at 6:30 PM →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0;">
                                See you tonight!
                            </p>

                            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 16px 0 0 0;">
                                <strong>The Apex Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #495057; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; font-weight: 600;">
                                Apex Affinity Group
                            </p>
                            <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
                                AI-Powered Lead Autopilot | theapexway.net
                            </p>
                            <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0;">
                                1600 Highway 6 Ste 400, Sugar Land, TX 77478
                            </p>
                        </td>
                    </tr>

                    <!-- Legal footer -->
                    <tr>
                        <td style="background-color: #e9ecef; padding: 20px 40px; text-align: center;">
                            <p style="color: #6c757d; font-size: 11px; line-height: 1.6; margin: 0 0 8px 0;">
                                You are receiving this email as a member of Apex Affinity Group.
                            </p>
                            <p style="color: #6c757d; font-size: 11px; line-height: 1.6; margin: 0;">
                                <a href="https://theapexway.net/privacy" style="color: #495057; text-decoration: underline;">Privacy Policy</a> |
                                <a href="https://theapexway.net/contact" style="color: #495057; text-decoration: underline;">Contact Us</a>
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

  console.log('📧 Sending Pulse Products announcement email...\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: ['tdaniel@botmakers.ai'],
        subject: '🎁 We\'re Giving You a $500/Month CRM for FREE + Tonight\'s Training at 6:30 PM',
        html: emailHtml
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', data.id);
      console.log('To:', 'tdaniel@botmakers.ai');
      console.log('\n📬 Email Preview:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Subject: 🎁 We\'re Giving You a $500/Month CRM for FREE + Tonight\'s Training at 6:30 PM');
      console.log('From: Apex Affinity Group <theapex@theapexway.net>');
      console.log('To: tdaniel@botmakers.ai');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📝 Key Points:');
      console.log('  💎 $500/month CRM value - COMPLETELY FREE');
      console.log('  ✓ AI-powered, sleek system for ANY business');
      console.log('  ✓ Saves money vs. expensive out-of-the-box CRMs');
      console.log('  ✓ "We make business affordable!"');
      console.log('  ✓ Available BEFORE tonight\'s training at 6:30 PM');
      console.log('  🔥 Training: "Sell 14 Subscriptions in 14 Days" with Trent Daniel');
      console.log('\n');
    } else {
      console.error('❌ Error sending email:');
      console.error(data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendAnnouncementEmail();
