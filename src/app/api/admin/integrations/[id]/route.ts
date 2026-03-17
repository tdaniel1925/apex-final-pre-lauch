// =============================================
// Single Integration API
// GET: Get integration details
// PUT: Update integration
// DELETE: Delete integration (soft delete)
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { encrypt, decrypt } from '@/lib/integrations/encryption';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/integrations/[id] - Get single integration
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const serviceClient = createServiceClient();

    // Fetch integration
    const { data: integration, error } = await serviceClient
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Decrypt API key for editing (but don't send it in plain text)
    // The form will need to call a separate endpoint or handle decryption client-side
    const sanitizedIntegration = {
      ...integration,
      api_key_encrypted: integration.api_key_encrypted ? '••••••••' : null,
    };

    return NextResponse.json({ integration: sanitizedIntegration });
  } catch (error) {
    console.error('Error in GET /api/admin/integrations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/integrations/[id] - Update integration
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.display_name || !body.api_endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: display_name, api_endpoint' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Fetch existing integration
    const { data: existing, error: fetchError } = await serviceClient
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      display_name: body.display_name,
      api_endpoint: body.api_endpoint,
      is_enabled: body.is_enabled ?? existing.is_enabled,
      supports_replicated_sites:
        body.supports_replicated_sites ?? existing.supports_replicated_sites,
      supports_sales_webhooks:
        body.supports_sales_webhooks ?? existing.supports_sales_webhooks,
      supports_commission_tracking:
        body.supports_commission_tracking ?? existing.supports_commission_tracking,
      auto_create_site_on_signup:
        body.auto_create_site_on_signup ?? existing.auto_create_site_on_signup,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    };

    // Update API key if provided and changed
    if (body.api_key && body.api_key !== '••••••••') {
      try {
        updateData.api_key_encrypted = encrypt(body.api_key);
      } catch (error) {
        console.error('Error encrypting API key:', error);
        return NextResponse.json(
          { error: 'Failed to encrypt API key' },
          { status: 500 }
        );
      }
    }

    // Update webhook secret if provided and changed
    if (body.webhook_secret && body.webhook_secret !== '••••••••') {
      updateData.webhook_secret = body.webhook_secret;
    }

    // Update integration
    const { data: integration, error } = await serviceClient
      .from('integrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration:', error);
      return NextResponse.json(
        { error: 'Failed to update integration' },
        { status: 500 }
      );
    }

    // Remove encrypted credentials from response
    const sanitizedIntegration = {
      ...integration,
      api_key_encrypted: integration.api_key_encrypted ? '••••••••' : null,
    };

    return NextResponse.json({
      integration: sanitizedIntegration,
      message: 'Integration updated successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/integrations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/integrations/[id] - Soft delete integration
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const serviceClient = createServiceClient();

    // Check if integration exists
    const { data: existing, error: fetchError } = await serviceClient
      .from('integrations')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Soft delete by disabling
    const { error } = await serviceClient
      .from('integrations')
      .update({ is_enabled: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting integration:', error);
      return NextResponse.json(
        { error: 'Failed to delete integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/integrations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
