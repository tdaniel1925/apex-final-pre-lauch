// =============================================
// Admin API: Change Distributor Email
// Updates email in both Supabase Auth and database
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id: distributorId } = await params;
    const body = await request.json();
    const { newEmail } = body;

    // Validate input
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json(
        { error: 'New email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get distributor to verify they exist
    const { data: distributor, error: distributorError } = await serviceClient
      .from('distributors')
      .select('auth_user_id, email')
      .eq('id', distributorId)
      .single();

    if (distributorError || !distributor) {
      console.error('Distributor not found:', distributorError);
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Validate auth_user_id exists and is a valid UUID
    if (!distributor.auth_user_id) {
      console.error('Distributor has no auth_user_id:', distributorId);
      return NextResponse.json(
        { error: 'Distributor is not linked to an authentication account' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(distributor.auth_user_id)) {
      console.error('Invalid auth_user_id format:', distributor.auth_user_id);
      return NextResponse.json(
        { error: 'Invalid authentication account ID format' },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const { data: existingUser } = await serviceClient.auth.admin.listUsers();
    const emailExists = existingUser?.users.some(
      (user) => user.email?.toLowerCase() === newEmail.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'This email address is already in use' },
        { status: 400 }
      );
    }

    // Update email in Supabase Auth (immediate, no verification needed)
    console.log('Updating auth email for user:', distributor.auth_user_id);
    const { error: authError } = await serviceClient.auth.admin.updateUserById(
      distributor.auth_user_id,
      {
        email: newEmail,
        email_confirm: true, // Email is immediately confirmed since admin is making the change
      }
    );

    if (authError) {
      console.error('Error updating auth email:', authError);
      return NextResponse.json(
        { error: `Failed to update email in authentication system: ${authError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Update email in distributors table
    const { error: dbError } = await serviceClient
      .from('distributors')
      .update({ email: newEmail })
      .eq('id', distributorId);

    if (dbError) {
      console.error('Error updating distributor email:', dbError);
      // Try to rollback auth change
      await serviceClient.auth.admin.updateUserById(distributor.auth_user_id, {
        email: distributor.email,
      });
      return NextResponse.json(
        { error: 'Failed to update email in database' },
        { status: 500 }
      );
    }

    // Log the email change in activity log
    await serviceClient.from('distributor_activity_log').insert({
      distributor_id: distributorId,
      action: 'email_changed',
      details: {
        old_email: distributor.email,
        new_email: newEmail,
        changed_by_admin: true,
      },
    });

    // Send notification email to the new address
    try {
      await resend.emails.send({
        from: 'Apex Affinity Group <theapex@theapexway.net>',
        to: [newEmail],
        subject: 'Your Apex Email Address Has Been Updated',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F0F2F8;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F2F8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#FFFFFF" style="padding: 30px 24px; background-color: #FFFFFF;">
              <img src="https://reachtheapex.net/apex-logo.png" alt="Apex Affinity Group" width="320" style="display: block; max-width: 320px; height: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; color: #4A5068; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.7;">
              <h1 style="font-family: Georgia, serif; font-size: 28px; line-height: 1.2; color: #2B4C7E; margin: 0 0 20px 0;">
                Email Address Updated
              </h1>

              <p style="margin: 0 0 16px 0;">Hello,</p>

              <p style="margin: 0 0 16px 0;">Your Apex Affinity Group email address has been updated by an administrator.</p>

              <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #F0F2F8; border-left: 4px solid #2B4C7E; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8098;">Previous Email:</p>
                    <p style="margin: 0 0 16px 0; font-weight: 600; color: #4A5068;">${distributor.email}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8098;">New Email:</p>
                    <p style="margin: 0; font-weight: 600; color: #2B4C7E; font-size: 16px;">${newEmail}</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0;">You can now log in to your Apex dashboard using your new email address.</p>

              <p style="margin: 24px 0; text-align: center;">
                <a href="https://reachtheapex.net/login" style="display: inline-block; padding: 14px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Log In to Apex
                </a>
              </p>

              <table width="100%" cellpadding="16" cellspacing="0" border="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td>
                    <p style="margin: 0;"><strong>🔒 Security Notice:</strong> If you did not request this change or have concerns, please contact support immediately at <a href="mailto:support@reachtheapex.net" style="color: #2B4C7E;">support@reachtheapex.net</a> or call <span style="color: #C7181F; font-weight: 700;">1 (832) 909-1715</span>.</p>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #E4E7F0;"><strong>Best regards,</strong></p>
              <p style="margin: 0;">The Apex Affinity Group Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#0A1A3F" style="padding: 32px 24px; background-color: #0A1A3F; background-image: repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px); border-top: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #ffffff;">Apex Affinity Group</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">Changing the insurance industry. One agent at a time.</p>
              <p style="margin: 16px 0 0 0; font-size: 13px;">
                <a href="https://reachtheapex.net" style="color: #FF4C52; text-decoration: none;">reachtheapex.net</a>
              </p>
              <p style="margin: 20px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6;">
                Apex Affinity Group<br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478<br>
                United States
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });
      console.log('Email notification sent to:', newEmail);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully. Notification sent to the new email address.',
      newEmail,
    });
  } catch (error: any) {
    console.error('Error in change-email endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
