// =============================================
// Product Mappings Bulk Import API
// POST: Create multiple product mappings at once
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';

interface BulkMappingInput {
  external_product_id: string;
  external_product_name: string;
  external_product_sku?: string;
  tech_credits?: number;
  insurance_credits?: number;
  direct_commission_percentage?: number;
  override_commission_percentage?: number;
  fixed_commission_amount?: number;
  commission_type?: 'credits' | 'percentage' | 'fixed' | 'none';
  is_active?: boolean;
  notes?: string;
}

interface BulkImportRequest {
  integration_id: string;
  mappings: BulkMappingInput[];
  skip_duplicates?: boolean; // If true, skip existing mappings instead of failing
}

/**
 * POST /api/admin/integrations/product-mappings/bulk-import
 * Creates multiple product mappings at once
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

    const body: BulkImportRequest = await request.json();

    // Validate request structure
    if (!body.integration_id) {
      return NextResponse.json(
        { error: 'integration_id is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.mappings) || body.mappings.length === 0) {
      return NextResponse.json(
        { error: 'mappings array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (body.mappings.length > 100) {
      return NextResponse.json(
        { error: 'Cannot import more than 100 mappings at once' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Verify integration exists
    const { data: integration, error: integrationError } = await serviceClient
      .from('integrations')
      .select('id')
      .eq('id', body.integration_id)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Validate each mapping
    const validationErrors: Array<{ index: number; error: string }> = [];
    const validatedMappings: Array<{
      integration_id: string;
      external_product_id: string;
      external_product_name: string;
      external_product_sku: string | null;
      tech_credits: number;
      insurance_credits: number;
      direct_commission_percentage: number;
      override_commission_percentage: number;
      fixed_commission_amount: number | null;
      commission_type: 'credits' | 'percentage' | 'fixed' | 'none';
      is_active: boolean;
      notes: string | null;
    }> = [];

    body.mappings.forEach((mapping, index) => {
      // Required fields
      if (!mapping.external_product_id) {
        validationErrors.push({
          index,
          error: 'external_product_id is required',
        });
        return;
      }

      if (!mapping.external_product_name) {
        validationErrors.push({
          index,
          error: 'external_product_name is required',
        });
        return;
      }

      // Validate credits
      const techCredits = mapping.tech_credits !== undefined ? parseFloat(String(mapping.tech_credits)) : 0;
      const insuranceCredits = mapping.insurance_credits !== undefined ? parseFloat(String(mapping.insurance_credits)) : 0;

      if (isNaN(techCredits) || techCredits < 0) {
        validationErrors.push({
          index,
          error: 'tech_credits must be >= 0',
        });
        return;
      }

      if (isNaN(insuranceCredits) || insuranceCredits < 0) {
        validationErrors.push({
          index,
          error: 'insurance_credits must be >= 0',
        });
        return;
      }

      // Validate commission percentages
      const directCommission = mapping.direct_commission_percentage !== undefined
        ? parseFloat(String(mapping.direct_commission_percentage))
        : 0;
      const overrideCommission = mapping.override_commission_percentage !== undefined
        ? parseFloat(String(mapping.override_commission_percentage))
        : 0;

      if (
        isNaN(directCommission) ||
        directCommission < 0 ||
        directCommission > 100
      ) {
        validationErrors.push({
          index,
          error: 'direct_commission_percentage must be between 0 and 100',
        });
        return;
      }

      if (
        isNaN(overrideCommission) ||
        overrideCommission < 0 ||
        overrideCommission > 100
      ) {
        validationErrors.push({
          index,
          error: 'override_commission_percentage must be between 0 and 100',
        });
        return;
      }

      // Validate fixed commission
      const fixedCommissionAmount = mapping.fixed_commission_amount
        ? parseFloat(String(mapping.fixed_commission_amount))
        : null;

      if (fixedCommissionAmount !== null && (isNaN(fixedCommissionAmount) || fixedCommissionAmount < 0)) {
        validationErrors.push({
          index,
          error: 'fixed_commission_amount must be >= 0',
        });
        return;
      }

      // Build validated mapping
      validatedMappings.push({
        integration_id: body.integration_id,
        external_product_id: mapping.external_product_id.trim(),
        external_product_name: mapping.external_product_name.trim(),
        external_product_sku: mapping.external_product_sku?.trim() || null,
        tech_credits: techCredits,
        insurance_credits: insuranceCredits,
        direct_commission_percentage: directCommission,
        override_commission_percentage: overrideCommission,
        fixed_commission_amount: fixedCommissionAmount,
        commission_type: mapping.commission_type || 'credits',
        is_active: mapping.is_active !== undefined ? mapping.is_active : true,
        notes: mapping.notes?.trim() || null,
      });
    });

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          validation_errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Check for duplicates if skip_duplicates is false
    if (!body.skip_duplicates) {
      const externalProductIds = validatedMappings.map((m) => m.external_product_id);

      const { data: existingMappings } = await serviceClient
        .from('integration_product_mappings')
        .select('external_product_id')
        .eq('integration_id', body.integration_id)
        .in('external_product_id', externalProductIds);

      if (existingMappings && existingMappings.length > 0) {
        return NextResponse.json(
          {
            error: 'Duplicate mappings found',
            duplicates: existingMappings.map((m) => m.external_product_id),
            message: 'Set skip_duplicates=true to skip existing mappings',
          },
          { status: 409 }
        );
      }
    }

    // Filter out duplicates if skip_duplicates is true
    let mappingsToInsert = validatedMappings;

    if (body.skip_duplicates) {
      const externalProductIds = validatedMappings.map((m) => m.external_product_id);

      const { data: existingMappings } = await serviceClient
        .from('integration_product_mappings')
        .select('external_product_id')
        .eq('integration_id', body.integration_id)
        .in('external_product_id', externalProductIds);

      const existingIds = new Set(
        existingMappings?.map((m) => m.external_product_id) || []
      );

      mappingsToInsert = validatedMappings.filter(
        (m) => !existingIds.has(m.external_product_id)
      );
    }

    // Insert mappings
    if (mappingsToInsert.length === 0) {
      return NextResponse.json(
        {
          message: 'No new mappings to import',
          created: 0,
          skipped: validatedMappings.length,
        },
        { status: 200 }
      );
    }

    const { data: createdMappings, error } = await serviceClient
      .from('integration_product_mappings')
      .insert(mappingsToInsert)
      .select();

    if (error) {
      console.error('Error bulk importing product mappings:', error);
      return NextResponse.json(
        { error: 'Failed to import product mappings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Bulk import successful',
        created: createdMappings?.length || 0,
        skipped: validatedMappings.length - mappingsToInsert.length,
        mappings: createdMappings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/integrations/product-mappings/bulk-import:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
