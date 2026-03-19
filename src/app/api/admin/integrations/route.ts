// =============================================
// Admin Integrations API
// GET: List all integrations
// POST: Create new integration
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { encrypt } from '@/lib/integrations/encryption';
import { randomBytes } from 'crypto';

// GET /api/admin/integrations - List all integrations
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Fetch all integrations
    const { data: integrations, error } = await serviceClient
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Remove encrypted credentials from response
    const sanitizedIntegrations = integrations?.map((integration) => ({
      ...integration,
      api_key_encrypted: integration.api_key_encrypted ? '••••••••' : null,
      webhook_secret: integration.webhook_secret ? '••••••••' : null,
    }));

    return NextResponse.json({ integrations: sanitizedIntegrations });
  } catch (error) {
    console.error('Error in GET /api/admin/integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/integrations - Create new integration
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.platform_name || !body.display_name || !body.api_endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: platform_name, display_name, api_endpoint' },
        { status: 400 }
      );
    }

    // Validate platform_name format (lowercase, no spaces)
    if (!/^[a-z0-9_]+$/.test(body.platform_name)) {
      return NextResponse.json(
        { error: 'platform_name must be lowercase with no spaces' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Check if platform_name already exists
    const { data: existing } = await serviceClient
      .from('integrations')
      .select('id')
      .eq('platform_name', body.platform_name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An integration with this platform name already exists' },
        { status: 409 }
      );
    }

    // Encrypt API key if provided
    let apiKeyEncrypted = null;
    if (body.api_key) {
      try {
        apiKeyEncrypted = encrypt(body.api_key);
      } catch (error) {
        console.error('Error encrypting API key:', error);
        return NextResponse.json(
          { error: 'Failed to encrypt API key' },
          { status: 500 }
        );
      }
    }

    // Generate webhook secret if not provided
    let webhookSecret = body.webhook_secret;
    if (!webhookSecret) {
      webhookSecret = randomBytes(32).toString('hex');
    }

    // Insert integration
    const { data: integration, error } = await serviceClient
      .from('integrations')
      .insert({
        platform_name: body.platform_name,
        display_name: body.display_name,
        api_endpoint: body.api_endpoint,
        api_key_encrypted: apiKeyEncrypted,
        webhook_secret: webhookSecret,
        is_enabled: body.is_enabled ?? false,
        supports_replicated_sites: body.supports_replicated_sites ?? false,
        supports_sales_webhooks: body.supports_sales_webhooks ?? false,
        supports_commission_tracking: body.supports_commission_tracking ?? false,
        auto_create_site_on_signup: body.auto_create_site_on_signup ?? false,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      return NextResponse.json(
        { error: 'Failed to create integration' },
        { status: 500 }
      );
    }

    // Remove encrypted credentials from response
    const sanitizedIntegration = {
      ...integration,
      api_key_encrypted: integration.api_key_encrypted ? '••••••••' : null,
    };

    return NextResponse.json(
      { integration: sanitizedIntegration, message: 'Integration created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
