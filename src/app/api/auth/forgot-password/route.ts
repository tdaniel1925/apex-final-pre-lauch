// =============================================
// Forgot Password API Route
// Custom password reset with Apex-branded emails
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if user exists
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, auth_user_id')
      .eq('email', email.toLowerCase())
      .single();

    // For security, always return success even if user doesn't exist
    if (!distributor || !distributor.auth_user_id) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent'
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: distributor.auth_user_id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('Error creating reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    // Build reset link with our token
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send Apex-branded email
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <img src="https://reachtheapex.net/apex-logo-email.png" alt="Apex Affinity Group" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                Reset Your Password
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Hi ${distributor.first_name},
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We received a request to reset your password for your Apex Affinity Group account.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">
                Click the button below to reset your password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                This link will expire in 1 hour for security reasons.
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Thanks,<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
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

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: [email],
      subject: 'Reset Your Password - Apex Affinity Group',
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
