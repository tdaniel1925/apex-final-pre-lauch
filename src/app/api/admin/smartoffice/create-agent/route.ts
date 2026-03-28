/**
 * SmartOffice Create Agent API
 * POST /api/admin/smartoffice/create-agent
 * Creates a SmartOffice Contact + Agent for an Apex distributor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmartOfficeAgentCreator } from '@/lib/smartoffice/create-agent-service';
import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();
    const { distributorId } = body;

    if (!distributorId) {
      return NextResponse.json({ success: false, error: 'distributorId is required' }, { status: 400 });
    }

    console.log('[SmartOffice Create Agent] Creating agent for distributor:', distributorId);

    // Fetch distributor data from database
    const supabase = createServiceClient();
    const { data: distributor, error: fetchError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, phone, tax_id')
      .eq('id', distributorId)
      .single();

    if (fetchError || !distributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor not found',
        },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!distributor.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor must have an email address',
        },
        { status: 400 }
      );
    }

    if (!distributor.first_name || !distributor.last_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor must have first and last name',
        },
        { status: 400 }
      );
    }

    // Create SmartOffice agent
    const creator = getSmartOfficeAgentCreator();
    const result = await creator.createAgent({
      firstName: distributor.first_name,
      lastName: distributor.last_name,
      email: distributor.email,
      phone: distributor.phone || undefined,
      taxId: distributor.tax_id || undefined,
      apexDistributorId: distributor.id,
    });

    if (!result.success) {
      console.error('[SmartOffice Create Agent] Failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create SmartOffice agent',
          details: result.details,
        },
        { status: 500 }
      );
    }

    console.log('[SmartOffice Create Agent] ✅ Success:', result);

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      agentId: result.agentId,
      details: result.details,
      message: `Successfully created SmartOffice agent for ${distributor.first_name} ${distributor.last_name}`,
    });
  } catch (error) {
    console.error('[SmartOffice Create Agent] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create agent',
      },
      { status: 500 }
    );
  }
}
