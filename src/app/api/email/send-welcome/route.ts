// =============================================
// Send Welcome Email API Route (for n8n)
// POST /api/email/send-welcome
// Called by n8n workflow after distributor signup
// SIMPLE: Just sends an email via Resend, no campaign tracking
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';

/**
 * POST /api/email/send-welcome
 * Sends a simple welcome email to new distributor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId } = body;

    if (!distributorId) {
      return NextResponse.json(
        { success: false, error: 'Missing distributorId' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get distributor data
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      console.error('Distributor not found:', distError);
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Simple welcome email
    const subject = `Welcome to Apex Affinity Group, ${distributor.first_name}!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c5aa0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .details { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Apex Affinity Group!</h1>
          <p>Hi ${distributor.first_name},</p>
          <p>Thank you for joining Apex Affinity Group. We're excited to have you on board!</p>

          <div class="details">
            <p><strong>Your Account Details:</strong></p>
            <ul>
              <li>Name: ${distributor.first_name} ${distributor.last_name}</li>
              <li>Email: ${distributor.email}</li>
              <li>Replicated Site: <a href="https://reachtheapex.net/${distributor.slug}">https://reachtheapex.net/${distributor.slug}</a></li>
            </ul>
          </div>

          <p>Get started by logging in to your dashboard:</p>
          <a href="https://reachtheapex.net/dashboard" class="button">Go to Dashboard</a>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Best regards,<br>The Apex Team</p>
        </div>
      </body>
      </html>
    `;

    // Send email
    const result = await sendEmail({
      to: distributor.email,
      subject,
      html,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (result.error) {
      console.error('Failed to send welcome email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`✅ Welcome email sent to ${distributor.email} (${result.id})`);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
