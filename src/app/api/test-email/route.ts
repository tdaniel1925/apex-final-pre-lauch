// =============================================
// Test Email API - Send Test Welcome Email
// GET: Send a test email to verify template
// =============================================

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/test-email
// Send a test welcome email  (HTML version for compatibility)
export async function GET() {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Apex Affinity Group</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #2B4C7E 0%, #1e3557 100%); padding: 40px 30px; text-align: center;">
              <img src="https://reachtheapex.net/apex-logo-white.png" alt="Apex Affinity Group" style="height: 80px; width: auto; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to the Apex Family!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2B4C7E; font-size: 24px; margin: 0 0 20px 0;">Thank You for Registering!</h2>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear Trent Daniel,</p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">We're thrilled to have you join the Apex Affinity Group family. You've taken the first step toward building a successful career in the insurance industry with unlimited earning potential.</p>
              <div style="height: 1px; background-color: #e5e5e5; margin: 30px 0;"></div>
              <h3 style="color: #2B4C7E; font-size: 20px; margin: 0 0 15px 0;">What Happens Next?</h3>
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td style="vertical-align: top; padding-right: 15px; width: 40px;">
                    <div style="width: 40px; height: 40px; background-color: #2B4C7E; border-radius: 50%; color: #ffffff; font-weight: bold; font-size: 18px; text-align: center; line-height: 40px;">1</div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="color: #2B4C7E; font-size: 18px; margin: 0 0 8px 0;">Back Office Access (Within 48 Hours)</h4>
                    <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">You will receive an email with your <strong>username and password</strong> to access your Apex Affinity Group Back Office. This is your personal dashboard where you'll manage your business, track commissions, and access all your tools.</p>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td style="vertical-align: top; padding-right: 15px; width: 40px;">
                    <div style="width: 40px; height: 40px; background-color: #2B4C7E; border-radius: 50%; color: #ffffff; font-weight: bold; font-size: 18px; text-align: center; line-height: 40px;">2</div>
                  </td>
                  <td style="vertical-align: top;">
                    <h4 style="color: #2B4C7E; font-size: 18px; margin: 0 0 8px 0;">Next Week's Training</h4>
                    <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">Join us for a <strong>detailed breakdown and presentation of our compensation plan</strong>. You'll learn exactly how you earn money, how the 5x7 matrix works, and how to maximize your income potential. Training details will be sent to your email.</p>
                  </td>
                </tr>
              </table>
              <div style="height: 1px; background-color: #e5e5e5; margin: 30px 0;"></div>
              <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid #2B4C7E; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h4 style="color: #2B4C7E; font-size: 18px; margin: 0 0 10px 0;">💡 In the Meantime...</h4>
                    <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">Start thinking about your goals and who you'd like to share this opportunity with. Success in this business comes from helping others succeed!</p>
                  </td>
                </tr>
              </table>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">Have questions? We're here to help! Reply to this email or contact us at:</p>
              <p style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                <strong style="color: #2B4C7E;">📧 Email:</strong> <a href="mailto:support@reachtheapex.net" style="color: #2B4C7E; text-decoration: none;">support@reachtheapex.net</a><br>
                <strong style="color: #2B4C7E;">📞 Phone:</strong> <a href="tel:281-600-4000" style="color: #2B4C7E; text-decoration: none;">281-600-4000</a>
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">Welcome aboard!</p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0; font-weight: bold;">The Apex Affinity Group Team</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="color: #777777; font-size: 14px; margin: 0 0 10px 0;">You're receiving this email because you registered at Apex Affinity Group.</p>
              <p style="color: #777777; font-size: 14px; margin: 0 0 15px 0;">© 2026 Apex Affinity Group. All rights reserved.</p>
              <p style="margin: 0;">
                <a href="https://reachtheapex.net" style="color: #2B4C7E; text-decoration: none; font-size: 14px; margin: 0 10px;">Visit Website</a>
                <span style="color: #cccccc;">|</span>
                <a href="https://reachtheapex.net/apex-vision" style="color: #2B4C7E; text-decoration: none; font-size: 14px; margin: 0 10px;">Our Vision</a>
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

    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity Group <aag@theapexway.net>',
      to: ['tdaniel@botmakers.ai'],
      subject: 'Welcome to the Apex Family! (Test Email)',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending test email:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully to tdaniel@botmakers.ai',
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error('Error in test-email API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
