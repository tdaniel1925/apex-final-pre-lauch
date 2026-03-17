// =============================================
// AgentPulse.cloud Webhook Handler
// Receives real-time sales data from agentpulse.cloud
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyStripeStyleSignature,
  logWebhookEvent,
  processExternalSale,
  getPlatformByName,
  extractHeaders,
} from '@/lib/integrations/webhooks/helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// =============================================
// AGENTPULSE WEBHOOK PAYLOAD TYPES
// =============================================

interface AgentPulseWebhookPayload {
  type: 'order.created' | 'order.completed' | 'order.refunded' | 'order.canceled';
  id: string; // Event ID
  created: number; // Unix timestamp
  livemode: boolean;
  data: {
    object: {
      id: string; // Order ID
      status: 'pending' | 'completed' | 'refunded' | 'canceled';
      amount_total: number; // In cents
      currency: string;
      metadata: {
        agent_id: string; // Distributor's agentpulse agent ID
        product_id: string;
        product_name: string;
        quantity: string; // String number
      };
      customer_details: {
        email: string;
        name: string;
      };
      created: number; // Unix timestamp
    };
  };
}

// =============================================
// POST HANDLER
// =============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // STEP 1: Get platform configuration
    const platform = await getPlatformByName('agentpulse');
    if (!platform) {
      console.error('AgentPulse platform not configured');
      return NextResponse.json(
        { error: 'Platform not configured' },
        { status: 500 }
      );
    }

    // STEP 2: Read raw body and signature
    const body = await request.text();
    const signatureHeader = request.headers.get('agentpulse-signature');

    if (!signatureHeader) {
      await logWebhookEvent({
        platformId: platform.id,
        eventType: 'unknown',
        requestBody: body,
        requestHeaders: extractHeaders(request.headers),
        signatureVerified: false,
        status: 'rejected',
        errorMessage: 'Missing signature header',
      });

      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // STEP 3: Verify signature (Stripe-style with timestamp)
    // Format: t=1234567890,v1=signature_hex
    const isValidSignature = verifyStripeStyleSignature(
      body,
      signatureHeader,
      platform.webhook_secret,
      300 // 5 minute tolerance
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature from AgentPulse');
      await logWebhookEvent({
        platformId: platform.id,
        eventType: 'unknown',
        requestBody: body,
        requestHeaders: extractHeaders(request.headers),
        signatureHeader,
        signatureVerified: false,
        status: 'rejected',
        errorMessage: 'Invalid signature',
      });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // STEP 4: Parse payload
    let payload: AgentPulseWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse AgentPulse webhook payload:', parseError);
      await logWebhookEvent({
        platformId: platform.id,
        eventType: 'parse_error',
        requestBody: body,
        requestHeaders: extractHeaders(request.headers),
        signatureHeader,
        signatureVerified: true,
        status: 'failed',
        errorMessage: 'Invalid JSON payload',
      });

      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // STEP 5: Handle event type
    switch (payload.type) {
      case 'order.completed':
        return await handleOrderCompleted(payload, platform, body, signatureHeader, startTime);

      case 'order.created':
        // Log but don't process (wait for 'completed' event)
        console.log('Order created event received:', payload.data.object.id);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.type,
          eventId: payload.id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Order created (waiting for completion)' });

      case 'order.refunded':
        // TODO: Implement refund handling
        console.log('Refund event received (not yet implemented):', payload.data.object.id);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.type,
          eventId: payload.id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Refund received (not yet implemented)' });

      case 'order.canceled':
        // TODO: Implement cancellation handling
        console.log('Cancellation event received (not yet implemented):', payload.data.object.id);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.type,
          eventId: payload.id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Cancellation received (not yet implemented)' });

      default:
        console.log('Unhandled AgentPulse event type:', payload.type);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.type || 'unknown',
          eventId: payload.id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Event received but not handled' });
    }
  } catch (error: any) {
    console.error('AgentPulse webhook error:', error);

    // Always return 200 to prevent webhook retries on processing errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal processing error',
        message: error.message,
      },
      { status: 200 }
    );
  }
}

// =============================================
// ORDER COMPLETED HANDLER
// =============================================

async function handleOrderCompleted(
  payload: AgentPulseWebhookPayload,
  platform: { id: string; webhook_secret: string },
  rawBody: string,
  signatureHeader: string,
  startTime: number
) {
  try {
    const order = payload.data.object;
    const metadata = order.metadata;

    // Validate required metadata
    if (!metadata?.agent_id || !metadata?.product_name) {
      const errorMsg = 'Missing required metadata (agent_id or product_name)';
      console.error(errorMsg, metadata);
      await logWebhookEvent({
        platformId: platform.id,
        eventType: payload.type,
        eventId: payload.id,
        requestBody: rawBody,
        signatureHeader,
        signatureVerified: true,
        status: 'failed',
        processingDurationMs: Date.now() - startTime,
        errorMessage: errorMsg,
      });

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 200 }
      );
    }

    // Process the external sale
    const result = await processExternalSale({
      platformId: platform.id,
      externalOrderId: order.id,
      externalUserId: metadata.agent_id,
      externalProductId: metadata.product_id || undefined,
      externalProductName: metadata.product_name,
      saleAmountCents: order.amount_total,
      quantity: parseInt(metadata.quantity || '1'),
      currency: order.currency.toUpperCase(),
      saleDate: new Date(order.created * 1000), // Unix timestamp to Date
      customerEmail: order.customer_details.email,
      customerName: order.customer_details.name,
      webhookPayload: payload,
    });

    const processingDuration = Date.now() - startTime;

    // Log the webhook event
    await logWebhookEvent({
      platformId: platform.id,
      eventType: payload.type,
      eventId: payload.id,
      requestBody: rawBody,
      signatureHeader,
      signatureVerified: true,
      status: result.success ? 'processed' : 'failed',
      processingDurationMs: processingDuration,
      errorMessage: result.error || undefined,
      externalSaleId: result.externalSaleId,
    });

    if (!result.success) {
      // Handle specific error cases
      if (result.errorCode === 'DUPLICATE') {
        console.log('Duplicate AgentPulse order (already processed):', order.id);
        return NextResponse.json({
          success: true,
          message: 'Duplicate order (already processed)',
          order_id: order.id,
        });
      }

      if (result.errorCode === 'NO_DISTRIBUTOR') {
        console.error('Distributor not found for AgentPulse agent_id:', metadata.agent_id);
        return NextResponse.json({
          success: false,
          error: 'Distributor not found',
          message: `No distributor found for agent_id: ${metadata.agent_id}`,
        }, { status: 200 }); // Still return 200 to prevent retries
      }

      // Other errors
      console.error('Failed to process AgentPulse order:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 200 }); // Return 200 to prevent retries
    }

    // Success!
    console.log('AgentPulse order processed successfully:', {
      order_id: order.id,
      external_sale_id: result.externalSaleId,
      earning_id: result.earningId,
      amount: order.amount_total / 100,
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      external_sale_id: result.externalSaleId,
      earning_id: result.earningId,
    });
  } catch (error: any) {
    console.error('Error handling AgentPulse order.completed:', error);

    // Log the error
    await logWebhookEvent({
      platformId: platform.id,
      eventType: payload.type,
      eventId: payload.id,
      requestBody: rawBody,
      signatureHeader,
      signatureVerified: true,
      status: 'failed',
      processingDurationMs: Date.now() - startTime,
      errorMessage: error.message || 'Unknown error',
    });

    // Return 200 to prevent retries
    return NextResponse.json(
      {
        success: false,
        error: 'Processing error',
        message: error.message,
      },
      { status: 200 }
    );
  }
}

// =============================================
// EXAMPLE WEBHOOK PAYLOAD (for testing)
// =============================================

/*
POST /api/webhooks/agentpulse
Headers:
  agentpulse-signature: t=1710684896,v1=<hmac-sha256-signature>

Body:
{
  "type": "order.completed",
  "id": "evt_agentpulse_123456789",
  "created": 1710684896,
  "livemode": true,
  "data": {
    "object": {
      "id": "ord_agentpulse_abc123",
      "status": "completed",
      "amount_total": 7900,
      "currency": "usd",
      "metadata": {
        "agent_id": "agent_xyz789",
        "product_id": "prod_insurance_basic",
        "product_name": "Insurance Package Basic",
        "quantity": "1"
      },
      "customer_details": {
        "email": "customer@example.com",
        "name": "Jane Smith"
      },
      "created": 1710684896
    }
  }
}

Signature calculation (Stripe-style):
1. Extract timestamp from header: t=1710684896
2. Create signed payload: "1710684896.{raw_body}"
3. HMAC-SHA256(webhook_secret, signed_payload) = signature
4. Header format: "t={timestamp},v1={signature}"
*/
