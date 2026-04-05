// =============================================
// Send Welcome Email API Route (for n8n)
// POST /api/email/send-welcome
// Called by n8n workflow after distributor signup
// Uses EXISTING enrollInCampaign function
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { enrollInCampaign } from '@/lib/email/campaign-service';
import type { Distributor } from '@/lib/types';

/**
 * POST /api/email/send-welcome
 * Enrolls distributor in email campaign and sends welcome email
 * Uses the EXISTING enrollInCampaign function - NO custom logic
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

    // Call EXISTING enrollInCampaign function (same as signup route uses)
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
