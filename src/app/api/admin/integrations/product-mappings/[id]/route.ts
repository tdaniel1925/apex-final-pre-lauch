// =============================================
// Product Mapping API - Single Resource
// GET: Get single product mapping
// PUT: Update product mapping
// DELETE: Delete product mapping
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';

/**
 * GET /api/admin/integrations/product-mappings/[id]
 * Gets a single product mapping by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const serviceClient = createServiceClient();
    const { data: mapping, error } = await serviceClient
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
      .eq('id', id)
      .single();

    if (error || !mapping) {
      return NextResponse.json(
        { error: 'Product mapping not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mapping }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/integrations/product-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/integrations/product-mappings/[id]
 * Updates an existing product mapping
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
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

    // Build update payload
    const updatePayload = {
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
      updated_at: new Date().toISOString(),
    };

    const serviceClient = createServiceClient();

    // Update the mapping
    const { data: mapping, error } = await serviceClient
      .from('integration_product_mappings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !mapping) {
      console.error('Error updating product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to update product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json({ mapping }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PUT /api/admin/integrations/product-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/integrations/product-mappings/[id]
 * Deletes a product mapping (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const adminContext = await getAdminUser();
    if (!adminContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const serviceClient = createServiceClient();

    // Check if mapping exists
    const { data: existing } = await serviceClient
      .from('integration_product_mappings')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Product mapping not found' },
        { status: 404 }
      );
    }

    // Delete the mapping
    const { error } = await serviceClient
      .from('integration_product_mappings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product mapping:', error);
      return NextResponse.json(
        { error: 'Failed to delete product mapping' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Product mapping deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/integrations/product-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
