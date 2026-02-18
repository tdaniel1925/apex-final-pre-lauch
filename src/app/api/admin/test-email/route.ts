// =============================================
// Test Email API
// Send a test email via Resend
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Check if user is admin
    const serviceClient = createServiceClient();
    const { data: admin } = await serviceClient
      .from('admins')
      .select('id, email, first_name')
      .eq('auth_user_id', user.id)
      .single();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Get recipient email from request body (optional, defaults to admin's email)
    const body = await request.json();
    const recipientEmail = body.to || admin.email;

    // Send test email
    const result = await sendEmail({
      to: recipientEmail,
      subject: 'Test Email from Apex Affinity Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2B4C7E;">Test Email Success!</h2>

          <p>Hi ${admin.first_name},</p>

          <p>This is a test email from your Apex Affinity Group email system. If you're reading this, it means:</p>

          <ul>
            <li>✅ Resend API is configured correctly</li>
            <li>✅ Email sending is working</li>
            <li>✅ Your email templates will send successfully</li>
          </ul>

          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Test Details:</strong></p>
            <p style="margin: 5px 0;">Sent to: ${recipientEmail}</p>
            <p style="margin: 5px 0;">Sent at: ${new Date().toLocaleString()}</p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated test email from Apex Affinity Group.
          </p>
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Failed to send test email',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          email_id: result.id,
          sent_to: recipientEmail,
        },
        message: `Test email sent successfully to ${recipientEmail}`,
      } as ApiResponse
    );
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send test email',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
