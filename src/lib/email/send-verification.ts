// =============================================
// Email Verification Service
// Send verification email and handle verification
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from './resend';
import crypto from 'crypto';

interface SendVerificationEmailParams {
  distributorId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface SendVerificationEmailResponse {
  success: boolean;
  error?: string;
}

/**
 * Send verification email to new distributor
 */
export async function sendVerificationEmail({
  distributorId,
  email,
  firstName,
  lastName,
}: SendVerificationEmailParams): Promise<SendVerificationEmailResponse> {
  try {
    const serviceClient = createServiceClient();

    // Generate unique verification token
    const verificationToken = crypto.randomUUID();

    // Save token to database
    const { error: updateError } = await serviceClient
      .from('distributors')
      .update({
        email_verification_token: verificationToken,
        email_verification_sent_at: new Date().toISOString(),
      })
      .eq('id', distributorId);

    if (updateError) {
      console.error('Failed to save verification token:', updateError);
      return {
        success: false,
        error: 'Failed to generate verification token',
      };
    }

    // Build verification URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    // Build email HTML
    const subject = 'Verify Your Email - Apex Affinity Group';
    const html = buildVerificationEmailHTML({
      firstName,
      lastName,
      verificationUrl,
    });

    // Send email
    const sendResult = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!sendResult.success) {
      console.error('Failed to send verification email:', sendResult.error);
      return {
        success: false,
        error: sendResult.error,
      };
    }

    // Log the email send
    await serviceClient
      .from('email_sends')
      .insert({
        distributor_id: distributorId,
        template_id: null,
        campaign_id: null,
        email_address: email,
        subject,
        body: html,
        sequence_step: null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: sendResult.id || null,
      });

    return { success: true };
  } catch (error) {
    console.error('Verification email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmailWithToken(token: string): Promise<{
  success: boolean;
  error?: string;
  distributorId?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    // Find distributor with this token
    const { data: distributor, error: findError } = await serviceClient
      .from('distributors')
      .select('id, email, email_verified, email_verification_sent_at')
      .eq('email_verification_token', token)
      .single();

    if (findError || !distributor) {
      return {
        success: false,
        error: 'Invalid or expired verification link',
      };
    }

    // Check if already verified
    if (distributor.email_verified) {
      return {
        success: true,
        distributorId: distributor.id,
      };
    }

    // Check if token is expired (48 hours)
    const sentAt = new Date(distributor.email_verification_sent_at);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSent > 48) {
      return {
        success: false,
        error: 'Verification link has expired. Please request a new one.',
      };
    }

    // Mark email as verified
    const { error: updateError } = await serviceClient
      .from('distributors')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        email_verification_token: null, // Clear token after use
      })
      .eq('id', distributor.id);

    if (updateError) {
      console.error('Failed to mark email as verified:', updateError);
      return {
        success: false,
        error: 'Failed to verify email. Please try again.',
      };
    }

    return {
      success: true,
      distributorId: distributor.id,
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build HTML email for email verification
 */
function buildVerificationEmailHTML({
  firstName,
  lastName,
  verificationUrl,
}: {
  firstName: string;
  lastName: string;
  verificationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B3A7D 0%, #0f172a 100%); padding: 40px 40px 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Welcome to Apex!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${firstName} ${lastName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Thank you for joining Apex Affinity Group! To complete your registration and access your dashboard, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #1B3A7D; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(27, 58, 125, 0.2);">
                      Verify My Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e40af;">
                      🔒 Security Notice
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">
                      This verification link will expire in 48 hours. If you didn't create an Apex account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; word-break: break-all; color: #3b82f6;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-align: center;">
                <strong>Apex Affinity Group</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                Building your success, one verified step at a time
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
