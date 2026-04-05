// =============================================
// Send Welcome Email API Route (for n8n)
// POST /api/email/send-welcome
// Uses EXISTING enrollInCampaign function
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { enrollInCampaign } from '@/lib/email/campaign-service';
import type { Distributor } from '@/lib/types';

/**
 * POST /api/email/send-welcome
 * Enrolls distributor in email campaign and sends welcome email
 * Uses the existing email template system from database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributorId } = body;

    if (!distributorId) {
      return NextResponse.json(
        { success: false, error: 'Missing distributorId' },
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

    // Use EXISTING enrollInCampaign function - it does everything:
    // - Gets template from email_templates table
    // - Renders variables (first_name, slug, sponsor_name)
    // - Sends via Resend
    // - Logs to email_sends and email_campaigns tables
    const result = await enrollInCampaign(distributor as Distributor);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
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
