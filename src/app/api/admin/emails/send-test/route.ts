import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { sendTrackedEmail } from '@/lib/services/resend-tracked';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, htmlContent, testEmails, adminId } = body;

    // Validation
    if (!subject || !htmlContent || !testEmails) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse comma-separated emails
    const emailAddresses = testEmails
      .split(',')
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0 && email.includes('@'));

    if (emailAddresses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    // Send test emails
    const results = [];
    const errors = [];

    for (const email of emailAddresses) {
      try {
        // Use generic greeting for test emails (no personalization)
        const result = await sendTrackedEmail({
          from: 'Apex Affinity Group <notifications@theapexway.net>',
          to: email,
          subject: `[TEST] ${subject}`,
          html: htmlContent,
          skipTemplateWrap: true, // Email already has full template
          triggeredBy: 'admin',
          adminId,
          feature: 'admin_test_email',
        });

        results.push({
          email,
          success: true,
          messageId: result.data?.id || '',
        });
      } catch (error) {
        console.error(`Error sending test email to ${email}:`, error);
        errors.push({
          email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: results.length,
      failedCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending test emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test emails' },
      { status: 500 }
    );
  }
}
