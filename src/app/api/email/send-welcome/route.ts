// =============================================
// Send Welcome Email API Route (for n8n)
// POST /api/email/send-welcome
// Called by n8n workflow after distributor signup
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';
import { renderEmailTemplate } from '@/lib/email/template-variables';
import type { Distributor } from '@/lib/types';

/**
 * POST /api/email/send-welcome
 *
 * Sends welcome email to new distributor
 * Called by n8n "New Distributor Onboarding" workflow
 *
 * Body:
 *   - distributorId: string (UUID)
 *   - email: string
 *   - firstName: string
 *   - lastName: string
 *   - licensingStatus: 'licensed' | 'non_licensed'
 *
 * Response:
 *   - success: boolean
 *   - message: string
 *   - emailId?: string (Resend email ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId, email, firstName, lastName, licensingStatus } = body;

    // Validate required fields
    if (!distributorId || !email || !firstName || !lastName || !licensingStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: distributorId, email, firstName, lastName, licensingStatus',
        },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get full distributor data
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

    // Create email campaign record
    const { data: campaign, error: campaignError } = await serviceClient
      .from('email_campaigns')
      .insert({
        distributor_id: distributor.id,
        licensing_status: distributor.licensing_status,
        current_step: 0,
        is_active: true,
        started_at: new Date().toISOString(),
        next_email_scheduled_for: null,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Failed to create email campaign:', campaignError);
      return NextResponse.json(
        { success: false, error: 'Failed to create email campaign' },
        { status: 500 }
      );
    }

    // Get welcome email template (sequence_order = 0)
    const { data: template, error: templateError } = await serviceClient
      .from('email_templates')
      .select('*')
      .eq('licensing_status', distributor.licensing_status)
      .eq('sequence_order', 0)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Welcome email template not found:', templateError);
      return NextResponse.json(
        { success: false, error: 'Welcome email template not found' },
        { status: 404 }
      );
    }

    // Render email template with distributor data
    const rendered = renderEmailTemplate(
      { subject: template.subject, body: template.body_html },
      distributor as Distributor
    );

    // Send email via Resend
    const result = await sendEmail({
      to: distributor.email,
      subject: rendered.subject,
      html: rendered.body,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (result.error) {
      console.error('Failed to send welcome email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log email sent
    await serviceClient.from('email_logs').insert({
      distributor_id: distributor.id,
      template_id: template.id,
      campaign_id: campaign.id,
      resend_email_id: result.data?.id || null,
      sent_at: new Date().toISOString(),
      status: 'sent',
      recipient_email: distributor.email,
    });

    // Calculate next email date (if there is a step 1)
    const { data: nextTemplate } = await serviceClient
      .from('email_templates')
      .select('delay_days')
      .eq('licensing_status', distributor.licensing_status)
      .eq('sequence_order', 1)
      .eq('is_active', true)
      .single();

    if (nextTemplate) {
      const nextEmailDate = new Date();
      nextEmailDate.setDate(nextEmailDate.getDate() + nextTemplate.delay_days);

      // Update campaign with next email date
      await serviceClient
        .from('email_campaigns')
        .update({
          current_step: 1,
          next_email_scheduled_for: nextEmailDate.toISOString(),
          last_email_sent_at: new Date().toISOString(),
          total_emails_sent: 1,
        })
        .eq('id', campaign.id);
    } else {
      // No more emails in sequence
      await serviceClient
        .from('email_campaigns')
        .update({
          last_email_sent_at: new Date().toISOString(),
          total_emails_sent: 1,
        })
        .eq('id', campaign.id);
    }

    console.log(`✅ Welcome email sent to ${distributor.email} (${result.data?.id})`);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.data?.id,
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
