// =============================================
// Product Mappings API - List & Create
// GET: List all product mappings (with optional filter)
// POST: Create new product mapping
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';

/**
 * GET /api/admin/integrations/product-mappings
 * Lists all product mappings with optional integration_id filter
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');

    // Build query
    let query = serviceClient
      .from('integration_product_mappings')
      .select(`
        *,
        integration:integrations(
          id,
          platform_name,
          display_name,
          is_enabled
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filter if provided
    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data: mappings, error } = await query;

    if (error) {
      console.error('Error fetching product mappings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product mappings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ mappings }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/integrations/product-mappings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/integrations/product-mappings
 * Creates a new product mapping
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.integration_id) {
      return NextResponse.json(
        { error: 'integration_id is required' },
        { status: 400 }
      );
    }

    if (!body.external_product_id) {
      return NextResponse.json(
        { error: 'external_product_id is required' },
        { status: 400 }
      );
    }

    if (!body.external_product_name) {
      return NextResponse.json(
        { error: 'external_product_name is required' },
        { status: 400 }
      );
    }

    // Validate credits (must be >= 0)
    const techCredits = parseFloat(body.tech_credits) || 0;
    const insuranceCredits = parseFloat(body.insurance_credits) || 0;

    if (techCredits < 0 || insuranceCredits < 0) {
      return NextResponse.json(
        { error: 'Credits must be >= 0' },
        { status: 400 }
      );
    }

    // Validate commission percentages (must be 0-100)
    const directCommission = parseFloat(body.direct_commission_percentage) || 0;
    const overrideCommission = parseFloat(body.override_commission_percentage) || 0;

    if (
      directCommission < 0 ||
      directCommission > 100 ||
      overrideCommission < 0 ||
      overrideCommission > 100
    ) {
      return NextResponse.json(
        { error: 'Commission percentages must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate fixed commission amount
    const fixedCommissionAmount = body.fixed_commission_amount
      ? parseFloat(body.fixed_commission_amount)
      : null;

    if (fixedCommissionAmount !== null && fixedCommissionAmount < 0) {
      return NextResponse.json(
        { error: 'Fixed commission amount must be >= 0' },
        { status: 400 }
      );
    }

    // Build insert payload
    const insertPayload = {
      integration_id: body.integration_id,
      external_product_id: body.external_product_id.trim(),
      external_product_name: body.external_product_name.trim(),
      external_product_sku: body.external_product_sku?.trim() || null,
      tech_credits: techCredits,
      insurance_credits: insuranceCredits,
      direct_commission_percentage: directCommission,
      override_commission_percentage: overrideCommission,
      fixed_commission_amount: fixedCommissionAmount,
      commission_type: body.commission_type || 'credits',
      is_active: body.is_active !== undefined ? body.is_active : true,
      notes: body.notes?.trim() || null,
    };

    const serviceClient = createServiceClient();

    // Check for duplicate mapping
    const { data: existing } = await serviceClient
      .from('integration_product_mappings')
      .select('id')
      .eq('integration_id', insertPayload.integration_id)
      .eq('external_product_id', insertPayload.external_product_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A mapping for this product already exists for this integration' },
        { status: 409 }
      );
    }

    // Insert the mapping
    const { data: mapping, error } = await serviceClient
      .from('integration_product_mappings')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to create product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/integrations/product-mappings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
