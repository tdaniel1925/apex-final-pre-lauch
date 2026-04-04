/**
 * Cron Job: Send Scheduled Business Center Nurture Emails
 *
 * This endpoint runs every hour and sends scheduled nurture emails.
 * IMPORTANT: Each email is sent INDIVIDUALLY to protect recipient privacy.
 * NEVER sends to multiple recipients in one email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getNurtureEmailTemplate } from '@/lib/email/nurture/business-center-templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all emails scheduled to be sent now or earlier
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('business_center_nurture_emails')
      .select(`
        *,
        distributor:distributors!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50); // Process max 50 emails per run

    if (fetchError) {
      console.error('Error fetching scheduled emails:', fetchError);
      return NextResponse.json({ error: 'Database error', details: fetchError.message }, { status: 500 });
    }

    if (!scheduledEmails || scheduledEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails to send',
        sent: 0
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Send each email INDIVIDUALLY (never as mass email)
    for (const emailRecord of scheduledEmails) {
      try {
        const distributor = emailRecord.distributor as any;
        const { first_name, last_name, email } = distributor;

        // Get email template for this day
        const template = getNurtureEmailTemplate(emailRecord.email_day, first_name);

        if (!template) {
          throw new Error(`No template found for day ${emailRecord.email_day}`);
        }

        // Send email to THIS ONE RECIPIENT ONLY
        // NEVER include multiple recipients in TO field
        const result = await resend.emails.send({
          from: 'Apex Affinity Group <theapex@theapexway.net>',
          to: email, // SINGLE recipient only
          subject: template.subject,
          html: template.html
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Mark as sent
        await supabase
          .from('business_center_nurture_emails')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_id: result.data?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id);

        results.sent++;
        console.log(`✅ Sent Day ${emailRecord.email_day} email to ${email}`);

      } catch (error: any) {
        // Mark as failed
        await supabase
          .from('business_center_nurture_emails')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id);

        results.failed++;
        results.errors.push(`Failed for ${emailRecord.distributor.email}: ${error.message}`);
        console.error(`❌ Failed Day ${emailRecord.email_day} for ${emailRecord.distributor.email}:`, error.message);
      }

      // Rate limiting: Wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined
    });

  } catch (error: any) {
    console.error('Nurture email cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Export as POST as well for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
