// =============================================
// Admin Resend Welcome Email API
// POST /api/admin/distributors/[id]/resend-welcome
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { sendCampaignEmail } from '@/lib/email/campaign-service';
import { emailRateLimit, checkRateLimit } from '@/lib/rate-limit';
import type { Distributor } from '@/lib/types';
import type { EmailTemplate } from '@/lib/types/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminContext = await getAdminUser();
  if (!adminContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 emails per hour per admin (prevents spam/abuse)
  const rateLimitResponse = await checkRateLimit(emailRateLimit, adminContext.admin.id);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id } = await params;
    const serviceClient = createServiceClient();

    // Get distributor
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    const dist = distributor as Distributor;

    // Get welcome email template
    const { data: template, error: templateError } = await serviceClient
      .from('email_templates')
      .select('*')
      .eq('licensing_status', dist.licensing_status)
      .eq('sequence_order', 0)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Welcome email template not found' },
        { status: 404 }
      );
    }

    // Get or create campaign
    let { data: campaign } = await serviceClient
      .from('email_campaigns')
      .select('id')
      .eq('distributor_id', dist.id)
      .single();

    if (!campaign) {
      const { data: newCampaign } = await serviceClient
        .from('email_campaigns')
        .insert({
          distributor_id: dist.id,
          licensing_status: dist.licensing_status,
          current_step: 0,
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      campaign = newCampaign;
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Could not create email campaign' },
        { status: 500 }
      );
    }

    // Send welcome email
    const sendResult = await sendCampaignEmail(
      dist,
      template as EmailTemplate,
      campaign.id
    );

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Welcome email sent to ${dist.email}`,
      emailSendId: sendResult.emailSendId,
    });
  } catch (error: any) {
    console.error('Admin resend welcome email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
