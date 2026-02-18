// =============================================
// Photo Warning Alert API
// Sends email to admin when user accepts photo with warnings
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId, distributorName, distributorEmail, issues, photoUrl } = body;

    if (!distributorId || !distributorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send alert email to admin
    const emailResult = await resend.emails.send({
      from: 'Apex Alerts <alerts@theapexway.net>',
      to: 'tdaniel@btotmakers.ai',
      subject: `⚠️ Photo Warning Alert - ${distributorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">⚠️ Photo Quality Warning Bypassed</h2>

          <p>A distributor has uploaded and accepted a profile photo that failed quality checks.</p>

          <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">Distributor Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${distributorName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${distributorEmail}</p>
            <p style="margin: 5px 0;"><strong>ID:</strong> ${distributorId}</p>
          </div>

          ${issues && issues.length > 0 ? `
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">Quality Issues Detected:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${issues.map((issue: string) => `<li style="margin: 5px 0;">${issue}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${photoUrl ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #1f2937;">Photo Preview:</h3>
              <img src="${photoUrl}" alt="Profile Photo" style="max-width: 200px; border-radius: 100%; border: 3px solid #d97706;" />
            </div>
          ` : ''}

          <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Action Required</h3>
            <p style="margin: 0;">Please review this photo manually and contact the distributor if changes are needed.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated alert from the Apex Affinity Group onboarding system.</p>
          </div>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error('Error sending alert email:', emailResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send alert email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alert sent successfully',
      emailId: emailResult.data?.id,
    });
  } catch (error: any) {
    console.error('Photo warning alert error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
