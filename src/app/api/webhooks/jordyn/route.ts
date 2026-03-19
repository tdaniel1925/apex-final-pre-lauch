// =============================================
// Jordyn.app Webhook Handler
// Receives real-time sales data from jordyn.app
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  logWebhookEvent,
  processExternalSale,
  getPlatformByName,
  extractHeaders,
} from '@/lib/integrations/webhooks/helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// =============================================
// JORDYN WEBHOOK PAYLOAD TYPES
// =============================================

interface JordynWebhookPayload {
  event: 'sale.completed' | 'sale.refunded' | 'sale.canceled';
  event_id: string;
  timestamp: string; // ISO 8601
  data: {
    order_id: string;
    user_id: string; // Distributor's jordyn user ID
    product_id: string;
    product_name: string;
    amount: number; // In cents
    quantity: number;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    created_at: string; // ISO 8601
  };
}

// =============================================
// POST HANDLER
// =============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // STEP 1: Get platform configuration
    const platform = await getPlatformByName('jordyn');
    if (!platform) {
      console.error('Jordyn platform not configured');
      return NextResponse.json(
        { error: 'Platform not configured' },
        { status: 500 }
      );
    }

    // STEP 2: Read raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-jordyn-signature');

    if (!signature) {
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

    // STEP 3: Verify signature (HMAC SHA256)
    const isValidSignature = verifyWebhookSignature({
      body,
      signature,
      secret: platform.webhook_secret,
      algorithm: 'sha256',
    });

    if (!isValidSignature) {
      console.error('Invalid webhook signature from Jordyn');
      await logWebhookEvent({
        platformId: platform.id,
        eventType: 'unknown',
        requestBody: body,
        requestHeaders: extractHeaders(request.headers),
        signatureHeader: signature,
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
    let payload: JordynWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse Jordyn webhook payload:', parseError);
      await logWebhookEvent({
        platformId: platform.id,
        eventType: 'parse_error',
        requestBody: body,
        requestHeaders: extractHeaders(request.headers),
        signatureHeader: signature,
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
    switch (payload.event) {
      case 'sale.completed':
        return await handleSaleCompleted(payload, platform, body, signature, startTime);

      case 'sale.refunded':
        // TODO: Implement refund handling
        console.log('Refund event received (not yet implemented):', payload.data.order_id);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.event,
          eventId: payload.event_id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader: signature,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Refund received (not yet implemented)' });

      case 'sale.canceled':
        // TODO: Implement cancellation handling
        console.log('Cancellation event received (not yet implemented):', payload.data.order_id);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.event,
          eventId: payload.event_id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader: signature,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Cancellation received (not yet implemented)' });

      default:
        console.log('Unhandled Jordyn event type:', payload.event);
        await logWebhookEvent({
          platformId: platform.id,
          eventType: payload.event || 'unknown',
          eventId: payload.event_id,
          requestBody: body,
          requestHeaders: extractHeaders(request.headers),
          signatureHeader: signature,
          signatureVerified: true,
          status: 'received',
          processingDurationMs: Date.now() - startTime,
        });
        return NextResponse.json({ success: true, message: 'Event received but not handled' });
    }
  } catch (error: any) {
    console.error('Jordyn webhook error:', error);

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
// SALE COMPLETED HANDLER
// =============================================

async function handleSaleCompleted(
  payload: JordynWebhookPayload,
  platform: { id: string; webhook_secret: string },
  rawBody: string,
  signature: string,
  startTime: number
) {
  try {
    const { data } = payload;

    // Process the external sale
    const result = await processExternalSale({
      platformId: platform.id,
      externalOrderId: data.order_id,
      externalUserId: data.user_id,
      externalProductId: data.product_id,
      externalProductName: data.product_name,
      saleAmountCents: data.amount,
      quantity: data.quantity,
      currency: data.currency,
      saleDate: new Date(data.created_at),
      customerEmail: data.customer.email,
      customerName: data.customer.name,
      webhookPayload: payload,
    });

    const processingDuration = Date.now() - startTime;

    // Log the webhook event
    await logWebhookEvent({
      platformId: platform.id,
      eventType: payload.event,
      eventId: payload.event_id,
      requestBody: rawBody,
      signatureHeader: signature,
      signatureVerified: true,
      status: result.success ? 'processed' : 'failed',
      processingDurationMs: processingDuration,
      errorMessage: result.error || undefined,
      externalSaleId: result.externalSaleId,
    });

    if (!result.success) {
      // Handle specific error cases
      if (result.errorCode === 'DUPLICATE') {
        console.log('Duplicate Jordyn sale (already processed):', data.order_id);
        return NextResponse.json({
          success: true,
          message: 'Duplicate order (already processed)',
          order_id: data.order_id,
        });
      }

      if (result.errorCode === 'NO_DISTRIBUTOR') {
        console.error('Distributor not found for Jordyn user_id:', data.user_id);
        return NextResponse.json({
          success: false,
          error: 'Distributor not found',
          message: `No distributor found for user_id: ${data.user_id}`,
        }, { status: 200 }); // Still return 200 to prevent retries
      }

      // Other errors
      console.error('Failed to process Jordyn sale:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 200 }); // Return 200 to prevent retries
    }

    // Success!
    console.log('Jordyn sale processed successfully:', {
      order_id: data.order_id,
      external_sale_id: result.externalSaleId,
      earning_id: result.earningId,
      amount: data.amount / 100,
    });

    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      external_sale_id: result.externalSaleId,
      earning_id: result.earningId,
    });
  } catch (error: any) {
    console.error('Error handling Jordyn sale.completed:', error);

    // Log the error
    await logWebhookEvent({
      platformId: platform.id,
      eventType: payload.event,
      eventId: payload.event_id,
      requestBody: rawBody,
      signatureHeader: signature,
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
POST /api/webhooks/jordyn
Headers:
  x-jordyn-signature: <hmac-sha256-signature>

Body:
{
  "event": "sale.completed",
  "event_id": "evt_jordyn_123456789",
  "timestamp": "2026-03-17T12:34:56Z",
  "data": {
    "order_id": "ord_jordyn_abc123",
    "user_id": "user_jordyn_xyz789",
    "product_id": "prod_jordyn_tech1",
    "product_name": "PulseGuard Tech Package",
    "amount": 7900,
    "quantity": 1,
    "currency": "USD",
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe"
    },
    "created_at": "2026-03-17T12:34:56Z"
  }
}

Signature calculation:
HMAC-SHA256(webhook_secret, raw_body) = signature
*/
