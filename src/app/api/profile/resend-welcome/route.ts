// =============================================
// Resend Welcome Email API
// POST /api/profile/resend-welcome
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendCampaignEmail } from '@/lib/email/campaign-service';
import type { ApiResponse, Distributor } from '@/lib/types';
import type { EmailTemplate } from '@/lib/types/email';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Get distributor data
    const serviceClient = createServiceClient();
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor not found',
          message: 'Could not find your distributor profile',
        } as ApiResponse,
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
        {
          success: false,
          error: 'Template not found',
          message: 'Welcome email template not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Get campaign ID (or create one if doesn't exist)
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
        {
          success: false,
          error: 'Campaign creation failed',
          message: 'Could not create email campaign',
        } as ApiResponse,
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
        {
          success: false,
          error: 'Email send failed',
          message: sendResult.error || 'Failed to send welcome email',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome email sent successfully!',
        data: {
          emailSendId: sendResult.emailSendId,
        },
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend welcome email error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
