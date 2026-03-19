// =============================================
// SMS Campaign API
// POST: Create and send SMS campaign to contacts
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';

const SMSCampaignSchema = z.object({
  campaign_name: z.string().min(1, 'Campaign name is required'),
  message_content: z.string().min(1, 'Message content is required').max(1600, 'Message too long'),
  recipient_list_type: z.enum(['all_contacts', 'filtered', 'custom_list', 'single']),
  recipient_filter: z.record(z.string(), z.any()).optional(), // JSON filter criteria
  recipient_contact_ids: z.array(z.string().uuid()).optional(),
  recipient_phone_numbers: z.array(z.string()).optional(),
  send_immediately: z.boolean().optional(),
  scheduled_for: z.string().optional(),
});

/**
 * POST /api/autopilot/crm/sms/campaign
 * Create SMS campaign and optionally send
 */
export async function POST(request: NextRequest) {
  try {
    const distributor = await getCurrentUser();
    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check tier access (Pro or Team only)
    const { data: subscription } = await supabase
      .from('autopilot_subscriptions')
      .select('tier')
      .eq('distributor_id', distributor.id)
      .single();

    if (!subscription || !['lead_autopilot_pro', 'team_edition'].includes(subscription.tier)) {
      return NextResponse.json(
        { error: 'SMS campaigns require Lead Autopilot Pro or Team Edition' },
        { status: 403 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = SMSCampaignSchema.parse(body);

    // Get usage limits
    const { data: usage } = await supabase
      .from('autopilot_usage_limits')
      .select('sms_sent_this_month, sms_limit')
      .eq('distributor_id', distributor.id)
      .single();

    // Collect recipient phone numbers based on list type
    let recipientPhones: string[] = [];
    let recipientContactIds: string[] = [];

    if (validatedData.recipient_list_type === 'all_contacts') {
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('id, phone')
        .eq('distributor_id', distributor.id)
        .eq('sms_opt_in', true)
        .not('phone', 'is', null);

      recipientPhones = (contacts || []).map((c) => c.phone!);
      recipientContactIds = (contacts || []).map((c) => c.id);
    } else if (validatedData.recipient_list_type === 'filtered') {
      // Build filtered query based on recipient_filter
      let query = supabase
        .from('crm_contacts')
        .select('id, phone')
        .eq('distributor_id', distributor.id)
        .eq('sms_opt_in', true)
        .not('phone', 'is', null);

      // Apply filters from recipient_filter if provided
      if (validatedData.recipient_filter) {
        const filter = validatedData.recipient_filter;
        if (filter.lead_status) {
          query = query.eq('lead_status', filter.lead_status);
        }
        if (filter.tags && Array.isArray(filter.tags)) {
          query = query.overlaps('tags', filter.tags);
        }
        if (filter.lead_score_min) {
          query = query.gte('lead_score', filter.lead_score_min);
        }
        if (filter.lead_score_max) {
          query = query.lte('lead_score', filter.lead_score_max);
        }
      }

      const { data: contacts } = await query;
      recipientPhones = (contacts || []).map((c) => c.phone!);
      recipientContactIds = (contacts || []).map((c) => c.id);
    } else if (validatedData.recipient_list_type === 'custom_list') {
      if (validatedData.recipient_contact_ids && validatedData.recipient_contact_ids.length > 0) {
        const { data: contacts } = await supabase
          .from('crm_contacts')
          .select('id, phone')
          .in('id', validatedData.recipient_contact_ids)
          .eq('distributor_id', distributor.id)
          .eq('sms_opt_in', true)
          .not('phone', 'is', null);

        recipientPhones = (contacts || []).map((c) => c.phone!);
        recipientContactIds = (contacts || []).map((c) => c.id);
      } else if (validatedData.recipient_phone_numbers) {
        recipientPhones = validatedData.recipient_phone_numbers;
      }
    } else if (validatedData.recipient_list_type === 'single') {
      if (validatedData.recipient_phone_numbers && validatedData.recipient_phone_numbers.length > 0) {
        recipientPhones = [validatedData.recipient_phone_numbers[0]];
      }
    }

    const totalRecipients = recipientPhones.length;

    if (totalRecipients === 0) {
      return NextResponse.json({ error: 'No valid recipients found' }, { status: 400 });
    }

    // Check SMS limit
    if (usage) {
      if (usage.sms_limit !== -1 && usage.sms_sent_this_month + totalRecipients > usage.sms_limit) {
        return NextResponse.json(
          {
            error: `SMS limit exceeded. You have ${usage.sms_limit - usage.sms_sent_this_month} SMS remaining this month.`,
          },
          { status: 403 }
        );
      }
    }

    // Estimate cost (assuming $0.0075 per SMS segment)
    const messageLength = validatedData.message_content.length;
    const segments = Math.ceil(messageLength / 160);
    const estimatedCost = totalRecipients * segments * 0.0075;

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .insert({
        distributor_id: distributor.id,
        campaign_name: validatedData.campaign_name,
        message_content: validatedData.message_content,
        recipient_list_type: validatedData.recipient_list_type,
        recipient_filter: validatedData.recipient_filter || null,
        recipient_contact_ids: recipientContactIds.length > 0 ? recipientContactIds : null,
        recipient_phone_numbers: recipientPhones,
        send_immediately: validatedData.send_immediately || false,
        scheduled_for: validatedData.scheduled_for || null,
        status: validatedData.send_immediately ? 'sending' : 'scheduled',
        total_recipients: totalRecipients,
        estimated_cost: estimatedCost,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    // Create individual SMS messages
    const smsMessages = recipientPhones.map((phone, index) => ({
      campaign_id: campaign.id,
      distributor_id: distributor.id,
      contact_id: recipientContactIds[index] || null,
      recipient_phone: phone,
      message_content: validatedData.message_content,
      status: 'pending',
    }));

    const { error: messagesError } = await supabase.from('sms_messages').insert(smsMessages);

    if (messagesError) {
      console.error('Error creating SMS messages:', messagesError);
      return NextResponse.json({ error: 'Failed to create SMS messages' }, { status: 500 });
    }

    // If send_immediately, increment SMS usage
    if (validatedData.send_immediately) {
      await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: distributor.id,
        p_limit_type: 'sms',
        p_increment: totalRecipients,
      });

      // Note: Actual SMS sending would be handled by a background job or webhook
      // For now, we just mark the campaign as "sending"
    }

    return NextResponse.json(
      {
        campaign,
        total_recipients: totalRecipients,
        estimated_cost: estimatedCost,
        message: validatedData.send_immediately
          ? 'Campaign created and sending'
          : 'Campaign scheduled successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    console.error('SMS campaign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
