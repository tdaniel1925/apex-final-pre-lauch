// =============================================
// Email Campaign Service
// Enroll users and send campaign emails
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from './resend';
import { renderEmailTemplate } from './template-variables';
import type { Distributor } from '@/lib/types';
import type { EmailTemplate } from '@/lib/types/email';

/**
 * Enroll distributor in email campaign
 * Called when a user signs up
 */
export async function enrollInCampaign(distributor: Distributor): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    // Create campaign record
    const { data: campaign, error: campaignError } = await serviceClient
      .from('email_campaigns')
      .insert({
        distributor_id: distributor.id,
        licensing_status: distributor.licensing_status,
        current_step: 0,
        is_active: true,
        started_at: new Date().toISOString(),
        next_email_scheduled_for: null, // Will be set after welcome email
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Failed to create email campaign:', campaignError);
      return { success: false, error: 'Failed to enroll in campaign' };
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
      return { success: false, error: 'Welcome email template not found' };
    }

    // Send welcome email
    const sendResult = await sendCampaignEmail(distributor, template, campaign.id);

    if (!sendResult.success) {
      return sendResult;
    }

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
          completed_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Campaign enrollment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a specific campaign email to a distributor
 */
export async function sendCampaignEmail(
  distributor: Distributor,
  template: EmailTemplate,
  campaignId: string
): Promise<{
  success: boolean;
  error?: string;
  emailSendId?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    // Render email with distributor variables
    const rendered = renderEmailTemplate(
      {
        subject: template.subject,
        body: template.body,
      },
      distributor
    );

    // Send email via Resend
    const sendResult = await sendEmail({
      to: distributor.email,
      subject: rendered.subject,
      html: rendered.body,
    });

    // Log email send
    const { data: emailSend, error: logError } = await serviceClient
      .from('email_sends')
      .insert({
        distributor_id: distributor.id,
        template_id: template.id,
        campaign_id: campaignId,
        email_address: distributor.email,
        subject: rendered.subject,
        body: rendered.body,
        sequence_step: template.sequence_order,
        status: sendResult.success ? 'sent' : 'failed',
        sent_at: sendResult.success ? new Date().toISOString() : null,
        failed_reason: sendResult.error || null,
        external_id: sendResult.id || null,
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log email send:', logError);
    }

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error,
      };
    }

    return {
      success: true,
      emailSendId: emailSend?.id,
    };
  } catch (error) {
    console.error('Send campaign email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pause email campaign for a distributor
 */
export async function pauseCampaign(distributorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('email_campaigns')
      .update({
        is_active: false,
        paused_at: new Date().toISOString(),
      })
      .eq('distributor_id', distributorId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Resume email campaign for a distributor
 */
export async function resumeCampaign(distributorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from('email_campaigns')
      .update({
        is_active: true,
        paused_at: null,
      })
      .eq('distributor_id', distributorId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
