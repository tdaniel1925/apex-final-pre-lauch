import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { sendTrackedEmail } from '@/lib/services/resend-tracked';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, htmlContent, recipientIds, adminId } = body;

    // Validation
    if (!subject || !htmlContent || !recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields or invalid recipient list' },
        { status: 400 }
      );
    }

    // Fetch recipient emails from database
    const supabase = await createClient();

    const { data: recipients, error: fetchError } = await supabase
      .from('user_profiles')
      .select('user_id, email, first_name, last_name')
      .in('user_id', recipientIds);

    if (fetchError || !recipients) {
      console.error('Error fetching recipients:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch recipient emails' },
        { status: 500 }
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid recipients found' },
        { status: 400 }
      );
    }

    // Send emails to all recipients
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await sendTrackedEmail({
          from: 'Apex Affinity Group <notifications@theapexway.net>',
          to: recipient.email,
          subject,
          html: htmlContent,
          skipTemplateWrap: true, // Email already has full template
          triggeredBy: 'admin',
          userId: recipient.user_id,
          adminId,
          feature: 'admin_broadcast',
        });

        results.push({
          email: recipient.email,
          success: true,
          messageId: result.data?.id || '',
        });
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        errors.push({
          email: recipient.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log the email send event to database
    try {
      await supabase.from('email_broadcasts').insert({
        admin_id: adminId,
        subject,
        recipient_count: recipients.length,
        successful_count: results.length,
        failed_count: errors.length,
        sent_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Error logging broadcast:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      sentCount: results.length,
      failedCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
