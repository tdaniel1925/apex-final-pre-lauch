import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { sendTrackedEmail } from '@/lib/services/resend-tracked';
import crypto from 'crypto';

/**
 * Generate a secure random password
 * 16 characters with uppercase, lowercase, numbers, and symbols
 */
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can create new admins
    if (adminContext.admin.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        error: 'Only super admins can create new admin users'
      }, { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, role = 'admin' } = body;

    // Validation
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'support', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Check if email already exists in admins table
    const { data: existingAdmin } = await serviceClient
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Email already registered as admin' },
        { status: 400 }
      );
    }

    // Check if email already exists in distributors table
    const { data: existingDistributor } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('email', email)
      .single();

    if (existingDistributor) {
      return NextResponse.json(
        { success: false, error: 'Email already registered as distributor' },
        { status: 400 }
      );
    }

    // Generate secure password
    const generatedPassword = generateSecurePassword();

    // Create auth user with Supabase Admin API
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        is_admin: true,
      },
    });

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { success: false, error: `Failed to create auth user: ${authError?.message}` },
        { status: 500 }
      );
    }

    // Create admin record
    const { data: newAdmin, error: adminError } = await serviceClient
      .from('admins')
      .insert({
        auth_user_id: authUser.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin record:', adminError);

      // Rollback: Delete the auth user
      await serviceClient.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        { success: false, error: `Failed to create admin record: ${adminError.message}` },
        { status: 500 }
      );
    }

    // Send welcome email with login credentials
    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://reachtheapex.net'}/login`;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #2c5aa0;">
              <img src="https://theapexway.net/apex-logo-full.png" alt="Apex Affinity Group" style="max-width: 300px; height: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2c5aa0; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
                Welcome to the Apex Admin Team!
              </h2>

              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${firstName},
              </p>

              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your admin account has been created by ${adminContext.admin.first_name} ${adminContext.admin.last_name}. You now have ${role === 'super_admin' ? 'super admin' : role} access to the Apex back office.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #2c5aa0; padding: 20px; margin: 0 0 24px 0;">
                <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                  Your Login Credentials:
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 0 0 8px 0;">
                  <strong>Email:</strong> ${email}
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 0 0 16px 0;">
                  <strong>Password:</strong> <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #dc2626;">${generatedPassword}</code>
                </p>
                <p style="color: #dc2626; font-size: 13px; margin: 0;">
                  ⚠️ Please save this password securely. You can change it after logging in.
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Log In to Admin Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                As an admin, you can manage distributors, view analytics, send emails, and more.
              </p>

              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
                Welcome to the team!
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                <strong>The Apex Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                <strong>Apex Affinity Group</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                AI-Powered Lead Autopilot | theapexway.net
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      await sendTrackedEmail({
        from: 'Apex Affinity Group <notifications@theapexway.net>',
        to: email,
        subject: 'Welcome to Apex Admin Team - Your Login Credentials',
        html: emailHtml,
        skipTemplateWrap: true,
        triggeredBy: 'admin',
        adminId: adminContext.admin.id,
        feature: 'admin_user_created',
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the request if email fails - admin was created successfully
    }

    // Log the admin activity
    await serviceClient.from('admin_activity_log').insert({
      admin_id: adminContext.admin.id,
      admin_email: adminContext.admin.email,
      admin_name: `${adminContext.admin.first_name} ${adminContext.admin.last_name}`,
      action_type: 'admin_user_created',
      action_description: `Created new admin user: ${firstName} ${lastName} (${email}) with role: ${role}`,
      changes: {
        new_admin: {
          email,
          first_name: firstName,
          last_name: lastName,
          role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        role: newAdmin.role,
        is_active: newAdmin.is_active,
      },
      message: 'Admin user created successfully. Welcome email sent with login credentials.',
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
