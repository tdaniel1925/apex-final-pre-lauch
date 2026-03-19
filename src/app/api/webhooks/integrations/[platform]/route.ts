// =============================================
// GENERIC EXTERNAL PLATFORM WEBHOOK HANDLER
// Purpose: Receive and process sales webhooks from external platforms
// Platforms: jordyn.app, agentpulse.cloud, future integrations
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyWebhookSignature } from '@/lib/integrations/webhooks/verify-signature';
import {
  processSale,
  findReplicatedSite,
  findProductMapping,
  type WebhookSaleData,
} from '@/lib/integrations/webhooks/process-sale';
import type { Integration, IntegrationWebhookLog } from '@/lib/types';

// Force dynamic rendering - prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    platform: string;
  }>;
}

/**
 * POST /api/webhooks/integrations/[platform]
 *
 * Generic webhook handler for external platforms
 *
 * Expected webhook payload format:
 * ```json
 * {
 *   "event": "sale.created",
 *   "event_id": "evt_123",
 *   "timestamp": "2026-03-17T12:00:00Z",
 *   "seller": {
 *     "user_id": "external_user_123",
 *     "apex_distributor_id": "optional_uuid"
 *   },
 *   "transaction": {
 *     "order_id": "order_456",
 *     "amount": 99.00,
 *     "currency": "USD"
 *   },
 *   "product": {
 *     "product_id": "prod_789",
 *     "product_name": "Business Starter Pack",
 *     "quantity": 1
 *   },
 *   "customer": {
 *     "email": "customer@example.com",
 *     "name": "Jane Smith"
 *   }
 * }
 * ```
 *
 * Security:
 * - Verifies HMAC-SHA256 signature in x-webhook-signature header
 * - Logs all webhook attempts to integration_webhook_logs
 * - Uses idempotency via unique constraint on (integration_id, external_sale_id)
 *
 * Response Codes:
 * - 200: Success (or already processed)
 * - 400: Invalid request (missing fields, bad JSON)
 * - 401: Invalid signature
 * - 404: Platform not found, distributor not found
 * - 500: Internal error
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = createServiceClient();
  const { platform } = await params;

  // Track webhook log
  let webhookLogId: string | undefined;
  let integrationId: string | undefined;

  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

    // Parse JSON payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body) as Record<string, unknown>;
    } catch (parseError) {
      // Failed to parse JSON
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Type guard: Check if payload has required structure
    const hasRequiredFields = (
      p: Record<string, unknown>
    ): p is Record<string, unknown> & {
      event: string;
      transaction: { order_id: string };
      seller: { user_id: string };
    } => {
      return (
        typeof p.event === 'string' &&
        typeof p.transaction === 'object' &&
        p.transaction !== null &&
        'order_id' in p.transaction &&
        typeof p.seller === 'object' &&
        p.seller !== null &&
        'user_id' in p.seller
      );
    };

    if (!hasRequiredFields(payload)) {
      return NextResponse.json(
        { error: 'Missing required fields (event, transaction.order_id, seller.user_id)' },
        { status: 400 }
      );
    }

    // Fetch integration config by platform name
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('platform_name', platform)
      .eq('is_enabled', true)
      .single();

    if (integrationError || !integration) {
      // Integration not found or disabled
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    integrationId = integration.id;

    // Create webhook log entry (start tracking)
    const { data: logEntry } = await supabase
      .from('integration_webhook_logs')
      .insert({
        integration_id: integration.id,
        webhook_event_type: payload.event as string,
        webhook_source_ip: sourceIp,
        webhook_signature: signature,
        signature_verified: false,
        http_method: 'POST',
        headers: Object.fromEntries(request.headers.entries()),
        payload: payload as Record<string, unknown>,
        processing_status: 'pending',
        received_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (logEntry) {
      webhookLogId = logEntry.id;
    }

    // Verify webhook signature
    if (!integration.webhook_secret) {
      await updateWebhookLog(webhookLogId, {
        processing_status: 'error',
        error_message: 'Webhook secret not configured for this integration',
        response_code: 500,
      });

      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const isValidSignature = verifyWebhookSignature(
      body,
      signature,
      integration.webhook_secret
    );

    if (!isValidSignature) {
      await updateWebhookLog(webhookLogId, {
        signature_verified: false,
        processing_status: 'error',
        error_message: 'Invalid webhook signature',
        response_code: 401,
      });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Update log: signature verified
    await updateWebhookLog(webhookLogId, {
      signature_verified: true,
      processing_status: 'processing',
      processing_started_at: new Date().toISOString(),
    });

    // Only process sale.created events
    if (payload.event !== 'sale.created') {
      await updateWebhookLog(webhookLogId, {
        processing_status: 'ignored',
        processing_completed_at: new Date().toISOString(),
        error_message: `Event type ${payload.event} is not handled`,
        response_code: 200,
      });

      return NextResponse.json({
        received: true,
        message: `Event type ${payload.event} is not handled`,
      });
    }

    // Transform payload to WebhookSaleData format
    // Safe type casting after validation
    const event_id = (payload.event_id as string) || (payload.id as string) || 'unknown';
    const timestamp = (payload.timestamp as string) || new Date().toISOString();
    const seller = payload.seller as Record<string, unknown>;
    const transaction = payload.transaction as Record<string, unknown>;
    const product = (payload.product as Record<string, unknown>) || {};
    const customer = (payload.customer as Record<string, unknown>) || {};

    const webhookData: WebhookSaleData = {
      event_id,
      event_type: payload.event,
      timestamp,
      seller: {
        user_id: seller.user_id as string,
        apex_distributor_id: seller.apex_distributor_id as string | undefined,
      },
      transaction: {
        order_id: transaction.order_id as string,
        amount: Number(transaction.amount),
        currency: (transaction.currency as string) || 'USD',
      },
      product: {
        product_id: (product.product_id as string) || '',
        product_name: (product.product_name as string) || 'Unknown Product',
        quantity: Number(product.quantity) || 1,
      },
      customer: {
        email: customer.email as string | undefined,
        name: customer.name as string | undefined,
      },
    };

    // Find distributor's replicated site
    const replicatedSite = await findReplicatedSite(
      integration as Integration,
      webhookData.seller.user_id,
      webhookData.seller.apex_distributor_id
    );

    if (!replicatedSite) {
      await updateWebhookLog(webhookLogId, {
        processing_status: 'error',
        processing_completed_at: new Date().toISOString(),
        error_message: `No active replicated site found for user_id: ${webhookData.seller.user_id}`,
        response_code: 404,
      });

      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Find product mapping (optional - sale can proceed without mapping)
    const productMapping = await findProductMapping(
      integration.id,
      webhookData.product.product_id
    );

    // Product mapping is optional - sale can proceed without it

    // Process the sale
    const result = await processSale(
      webhookData,
      integration as Integration,
      replicatedSite,
      productMapping
    );

    if (!result.success) {
      // Check if already processed (idempotency)
      if (result.alreadyProcessed) {
        await updateWebhookLog(webhookLogId, {
          processing_status: 'success',
          processing_completed_at: new Date().toISOString(),
          error_message: 'Sale already processed (idempotency)',
          response_code: 200,
        });

        return NextResponse.json({
          received: true,
          message: 'Already processed',
        });
      }

      // Processing failed
      await updateWebhookLog(webhookLogId, {
        processing_status: 'error',
        processing_completed_at: new Date().toISOString(),
        error_message: result.error || 'Unknown error processing sale',
        error_details: { error: result.error, success: result.success } as any,
        response_code: 500,
      });

      return NextResponse.json(
        { error: 'Failed to process sale' },
        { status: 500 }
      );
    }

    // Success - update log
    await updateWebhookLog(webhookLogId, {
      processing_status: 'success',
      processing_completed_at: new Date().toISOString(),
      external_sale_id: result.saleId,
      response_code: 200,
    });

    return NextResponse.json({
      received: true,
      sale_id: result.saleId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Update webhook log with error
    if (webhookLogId) {
      await updateWebhookLog(webhookLogId, {
        processing_status: 'error',
        processing_completed_at: new Date().toISOString(),
        error_message: errorMessage,
        error_details: { stack: errorStack } as Record<string, unknown>,
        response_code: 500,
      });
    }

    // Never expose internal errors to external platforms
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to update webhook log entry
 */
async function updateWebhookLog(
  logId: string | undefined,
  updates: Partial<IntegrationWebhookLog>
): Promise<void> {
  if (!logId) return;

  const supabase = createServiceClient();
  await supabase
    .from('integration_webhook_logs')
    .update(updates as any)
    .eq('id', logId);
}
