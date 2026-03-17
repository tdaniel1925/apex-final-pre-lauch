// =============================================
// Webhook Helper Functions
// Shared utilities for external webhook processing
// =============================================

import * as crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

// =============================================
// TYPES
// =============================================

export interface VerifyWebhookSignatureParams {
  body: string;
  signature: string;
  secret: string;
  algorithm?: 'sha256' | 'sha512';
}

export interface LogWebhookEventParams {
  platformId: string;
  eventType: string;
  eventId?: string;
  requestMethod?: string;
  requestHeaders?: Record<string, string>;
  requestBody: string;
  requestIp?: string;
  signatureHeader?: string;
  signatureVerified: boolean;
  status: 'received' | 'processed' | 'failed' | 'rejected';
  processingDurationMs?: number;
  errorMessage?: string;
  externalSaleId?: string;
}

export interface ProcessExternalSaleParams {
  platformId: string;
  externalOrderId: string;
  externalUserId: string; // Platform's user ID
  externalProductId?: string;
  externalProductName: string;
  saleAmountCents: number;
  quantity?: number;
  currency?: string;
  saleDate: Date;
  customerEmail?: string;
  customerName?: string;
  webhookPayload?: any;
}

export interface ProcessExternalSaleResult {
  success: boolean;
  externalSaleId?: string;
  earningId?: string;
  error?: string;
  errorCode?: 'DUPLICATE' | 'NO_DISTRIBUTOR' | 'NO_PRODUCT_MAPPING' | 'DB_ERROR' | 'UNKNOWN';
}

// =============================================
// WEBHOOK SIGNATURE VERIFICATION
// =============================================

/**
 * Verify HMAC webhook signature
 * Supports both SHA256 (most common) and SHA512
 */
export function verifyWebhookSignature({
  body,
  signature,
  secret,
  algorithm = 'sha256',
}: VerifyWebhookSignatureParams): boolean {
  try {
    // Create HMAC with the secret
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(body, 'utf8');
    const digest = hmac.digest('hex');

    // Compare signatures (timing-safe comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify Stripe-style signature (sha256 with timestamp)
 * Format: t=timestamp,v1=signature
 */
export function verifyStripeStyleSignature(
  body: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300 // 5 minutes
): boolean {
  try {
    const signatures = signatureHeader.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = signatures.t;
    const signature = signatures.v1;

    if (!timestamp || !signature) {
      return false;
    }

    // Check timestamp tolerance (prevent replay attacks)
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (timestampAge > toleranceSeconds) {
      console.warn('Webhook signature timestamp too old:', timestampAge, 'seconds');
      return false;
    }

    // Create signed payload: timestamp.body
    const signedPayload = `${timestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Stripe-style signature verification error:', error);
    return false;
  }
}

// =============================================
// WEBHOOK EVENT LOGGING
// =============================================

/**
 * Log webhook event to integration_webhook_logs table
 * Creates immutable audit trail for debugging
 */
export async function logWebhookEvent(
  params: LogWebhookEventParams
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('integration_webhook_logs')
      .insert({
        platform_id: params.platformId,
        event_type: params.eventType,
        event_id: params.eventId || null,
        request_method: params.requestMethod || 'POST',
        request_headers: params.requestHeaders || null,
        request_body: params.requestBody,
        request_ip: params.requestIp || null,
        signature_header: params.signatureHeader || null,
        signature_verified: params.signatureVerified,
        status: params.status,
        processing_duration_ms: params.processingDurationMs || null,
        error_message: params.errorMessage || null,
        external_sale_id: params.externalSaleId || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log webhook event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data.id };
  } catch (error) {
    console.error('Webhook logging error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================
// EXTERNAL SALE PROCESSING
// =============================================

/**
 * Process external sale: create external_sales record, update credits, create earnings
 * This is the core business logic for external webhooks
 */
export async function processExternalSale(
  params: ProcessExternalSaleParams
): Promise<ProcessExternalSaleResult> {
  const supabase = createServiceClient();

  try {
    // STEP 1: Check for duplicate order (idempotency)
    const { data: existingSale, error: duplicateError } = await supabase
      .from('external_sales')
      .select('id, status')
      .eq('platform_id', params.platformId)
      .eq('external_order_id', params.externalOrderId)
      .maybeSingle();

    if (duplicateError) {
      console.error('Error checking for duplicates:', duplicateError);
    }

    if (existingSale) {
      console.log('Duplicate order detected:', params.externalOrderId);
      return {
        success: true,
        externalSaleId: existingSale.id,
        error: 'Duplicate order (already processed)',
        errorCode: 'DUPLICATE',
      };
    }

    // STEP 2: Find distributor via external_user_id
    const { data: replicatedSite, error: siteError } = await supabase
      .from('distributor_replicated_sites')
      .select('member_id, members!inner(full_name, distributor_id)')
      .eq('platform_id', params.platformId)
      .eq('external_user_id', params.externalUserId)
      .eq('status', 'active')
      .maybeSingle();

    if (siteError || !replicatedSite) {
      console.error('Distributor not found for external_user_id:', params.externalUserId, siteError);

      // Still create external_sales record with 'failed' status for audit trail
      await supabase.from('external_sales').insert({
        platform_id: params.platformId,
        member_id: '00000000-0000-0000-0000-000000000000', // Null UUID placeholder
        external_order_id: params.externalOrderId,
        external_product_id: params.externalProductId || null,
        external_product_name: params.externalProductName,
        sale_amount_cents: params.saleAmountCents,
        quantity: params.quantity || 1,
        currency: params.currency || 'USD',
        sale_date: params.saleDate.toISOString(),
        customer_email: params.customerEmail || null,
        customer_name: params.customerName || null,
        status: 'failed',
        processing_error: `Distributor not found for external_user_id: ${params.externalUserId}`,
        webhook_payload: params.webhookPayload || null,
      });

      return {
        success: false,
        error: `Distributor not found for external_user_id: ${params.externalUserId}`,
        errorCode: 'NO_DISTRIBUTOR',
      };
    }

    const memberId = replicatedSite.member_id;
    const memberName = (replicatedSite.members as any).full_name;

    // STEP 3: Get product mapping for credit calculation
    const { data: productMapping } = await supabase
      .from('external_product_mappings')
      .select('tech_credits, insurance_credits, commission_percentage, fixed_commission_cents')
      .eq('platform_id', params.platformId)
      .eq('external_product_id', params.externalProductId || '')
      .eq('active', true)
      .maybeSingle();

    const techCredits = productMapping?.tech_credits || 0;
    const insuranceCredits = productMapping?.insurance_credits || 0;
    const commissionPct = productMapping?.commission_percentage || 0;
    const fixedCommissionCents = productMapping?.fixed_commission_cents || 0;

    // Calculate commission
    const commissionCents = fixedCommissionCents > 0
      ? fixedCommissionCents
      : Math.round((params.saleAmountCents * commissionPct) / 100);

    // STEP 4: Create external_sales record
    const { data: externalSale, error: saleError } = await supabase
      .from('external_sales')
      .insert({
        platform_id: params.platformId,
        member_id: memberId,
        external_order_id: params.externalOrderId,
        external_product_id: params.externalProductId || null,
        external_product_name: params.externalProductName,
        sale_amount_cents: params.saleAmountCents,
        quantity: params.quantity || 1,
        currency: params.currency || 'USD',
        tech_credits_earned: techCredits,
        insurance_credits_earned: insuranceCredits,
        commission_amount_cents: commissionCents,
        commission_percentage: commissionPct,
        sale_date: params.saleDate.toISOString(),
        customer_email: params.customerEmail || null,
        customer_name: params.customerName || null,
        status: 'processed',
        processed_at: new Date().toISOString(),
        webhook_payload: params.webhookPayload || null,
      })
      .select('id')
      .single();

    if (saleError) {
      console.error('Failed to create external_sales record:', saleError);
      return {
        success: false,
        error: `Database error: ${saleError.message}`,
        errorCode: 'DB_ERROR',
      };
    }

    // STEP 5: Update member credits
    if (techCredits > 0 || insuranceCredits > 0) {
      const { error: creditsError } = await supabase.rpc('add_member_credits', {
        p_member_id: memberId,
        p_tech_credits: techCredits,
        p_insurance_credits: insuranceCredits,
        p_reason: `External sale from ${params.externalProductName}`,
      });

      if (creditsError) {
        console.error('Failed to update member credits:', creditsError);
        // Don't fail the whole operation - credits can be manually adjusted
      }
    }

    // STEP 6: Create earnings ledger entry (if commission > 0)
    let earningId: string | undefined;
    if (commissionCents > 0) {
      const { data: earning, error: earningError } = await supabase
        .from('earnings_ledger')
        .insert({
          run_id: crypto.randomUUID(), // Generate run ID for this external sale
          run_date: new Date().toISOString().split('T')[0],
          pay_period_start: new Date().toISOString().split('T')[0],
          pay_period_end: new Date().toISOString().split('T')[0],
          member_id: memberId,
          member_name: memberName,
          earning_type: 'override', // External sales treated as override commission
          source_member_id: memberId, // Self-generated sale
          source_member_name: memberName,
          source_product_name: params.externalProductName,
          base_amount_cents: commissionCents,
          adjustment_cents: 0,
          final_amount_cents: commissionCents,
          status: 'pending',
          notes: `External sale from ${params.externalProductName} (Order: ${params.externalOrderId})`,
        })
        .select('earning_id')
        .single();

      if (earningError) {
        console.error('Failed to create earnings record:', earningError);
        // Don't fail - earnings can be manually created
      } else {
        earningId = earning.earning_id;
      }
    }

    // STEP 7: Log admin activity
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: memberId,
        p_admin_email: params.customerEmail || 'external@system',
        p_admin_name: memberName,
        p_distributor_id: (replicatedSite.members as any).distributor_id,
        p_distributor_name: memberName,
        p_action_type: 'external_sale_received',
        p_action_description: `External sale: ${params.externalProductName} for $${(params.saleAmountCents / 100).toFixed(2)} (${techCredits} tech credits, ${insuranceCredits} insurance credits)`,
        p_changes: JSON.stringify({
          external_order_id: params.externalOrderId,
          external_sale_id: externalSale.id,
          product_name: params.externalProductName,
          amount: params.saleAmountCents / 100,
          tech_credits: techCredits,
          insurance_credits: insuranceCredits,
          commission: commissionCents / 100,
        }),
        p_ip_address: null,
        p_user_agent: null,
      });
    } catch (logError) {
      console.error('Failed to log admin activity:', logError);
      // Don't fail - activity log is for audit only
    }

    return {
      success: true,
      externalSaleId: externalSale.id,
      earningId,
    };
  } catch (error) {
    console.error('External sale processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'UNKNOWN',
    };
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get platform by name
 */
export async function getPlatformByName(
  platformName: string
): Promise<{ id: string; webhook_secret: string } | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('integration_platforms')
      .select('id, webhook_secret')
      .eq('platform_name', platformName)
      .eq('webhook_enabled', true)
      .single();

    if (error || !data) {
      console.error(`Platform not found: ${platformName}`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get platform error:', error);
    return null;
  }
}

/**
 * Extract headers as plain object (for logging)
 */
export function extractHeaders(headers: Headers): Record<string, string> {
  const headerObj: Record<string, string> = {};
  headers.forEach((value, key) => {
    headerObj[key] = value;
  });
  return headerObj;
}
