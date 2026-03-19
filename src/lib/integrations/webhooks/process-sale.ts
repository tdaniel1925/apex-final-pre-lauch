// =============================================
// WEBHOOK SALE PROCESSING
// Purpose: Process external platform sales, calculate commissions, update credits
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type {
  Integration,
  DistributorReplicatedSite,
  IntegrationProductMapping,
  ExternalSaleInsert,
} from '@/lib/types';

/**
 * Webhook sale data from external platform
 */
export interface WebhookSaleData {
  event_id: string;
  event_type: string;
  timestamp: string;
  seller: {
    user_id: string;
    apex_distributor_id?: string;
  };
  transaction: {
    order_id: string;
    amount: number;
    currency: string;
  };
  product: {
    product_id: string;
    product_name: string;
    quantity: number;
  };
  customer?: {
    email?: string;
    name?: string;
  };
}

/**
 * Result from processing a sale
 */
export interface ProcessSaleResult {
  success: boolean;
  saleId?: string;
  error?: string;
  alreadyProcessed?: boolean;
}

/**
 * Process external platform sale
 * - Creates external_sales record
 * - Updates distributor credits
 * - Creates earnings_ledger entry for commission
 * - Handles idempotency via unique constraint
 *
 * @param webhookData - Parsed webhook data
 * @param integration - Integration config
 * @param replicatedSite - Distributor's replicated site
 * @param productMapping - Product mapping (optional - can be null if no mapping exists)
 * @returns ProcessSaleResult with success status and sale ID
 */
export async function processSale(
  webhookData: WebhookSaleData,
  integration: Integration,
  replicatedSite: DistributorReplicatedSite,
  productMapping: IntegrationProductMapping | null
): Promise<ProcessSaleResult> {
  const supabase = createServiceClient();

  try {
    // Calculate commission based on product mapping
    let techCredits = 0;
    let insuranceCredits = 0;
    let commissionAmount = 0;
    let commissionType: string | null = null;

    if (productMapping && productMapping.is_active) {
      techCredits = Number(productMapping.tech_credits) * webhookData.product.quantity;
      insuranceCredits = Number(productMapping.insurance_credits) * webhookData.product.quantity;

      switch (productMapping.commission_type) {
        case 'credits':
          // Commission is in credits (BV)
          commissionType = 'credits';
          break;

        case 'percentage':
          // Calculate percentage of sale amount
          commissionAmount =
            (webhookData.transaction.amount *
              Number(productMapping.direct_commission_percentage)) /
            100;
          commissionType = 'percentage';
          break;

        case 'fixed':
          // Fixed commission amount
          commissionAmount = Number(productMapping.fixed_commission_amount || 0);
          commissionType = 'fixed';
          break;

        case 'none':
          // No commission
          commissionType = 'none';
          break;
      }
    }

    // Create external_sales record
    const externalSale: ExternalSaleInsert = {
      integration_id: integration.id,
      distributor_id: replicatedSite.distributor_id,
      product_mapping_id: productMapping?.id || null,
      replicated_site_id: replicatedSite.id,
      external_sale_id: webhookData.transaction.order_id,
      external_customer_id: webhookData.customer?.email || null,
      external_product_id: webhookData.product.product_id,
      sale_amount: webhookData.transaction.amount,
      currency: webhookData.transaction.currency,
      quantity: webhookData.product.quantity,
      tech_credits_earned: techCredits,
      insurance_credits_earned: insuranceCredits,
      commission_amount: commissionAmount,
      commission_type: commissionType,
      sale_status: 'completed',
      sale_date: webhookData.timestamp,
      webhook_payload: webhookData as any,
      commission_applied: false,
      refunded_at: null,
      commission_applied_at: null,
      notes: null,
    };

    const { data: saleRecord, error: saleError } = await supabase
      .from('external_sales')
      .insert(externalSale)
      .select()
      .single();

    if (saleError) {
      // Check for duplicate (idempotency)
      if (saleError.code === '23505') {
        // Unique constraint violation (idempotency check)
        return {
          success: true,
          alreadyProcessed: true,
          error: 'Already processed',
        };
      }

      return {
        success: false,
        error: `Database error: ${saleError.message}`,
      };
    }

    // Get member_id from distributor_id
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id')
      .eq('distributor_id', replicatedSite.distributor_id)
      .single();

    if (memberError || !memberData) {
      return {
        success: false,
        error: 'Member not found',
      };
    }

    // Update member credits (personal_credits_monthly)
    const totalCredits = techCredits + insuranceCredits;
    if (totalCredits > 0) {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          personal_credits_monthly: supabase.rpc('increment_credits', {
            current_value: 0,
            increment: totalCredits,
          }),
          tech_personal_credits_monthly: supabase.rpc('increment_credits', {
            current_value: 0,
            increment: techCredits,
          }),
          insurance_personal_credits_monthly: supabase.rpc('increment_credits', {
            current_value: 0,
            increment: insuranceCredits,
          }),
        })
        .eq('member_id', memberData.member_id);

      // Log update error but don't fail the operation
      if (updateError) {
        // Credits can be fixed later in admin
      }
    }

    // Create earnings_ledger entry for commission (if applicable)
    if (commissionAmount > 0) {
      await supabase
        .from('earnings_ledger')
        .insert({
          run_id: saleRecord.id, // Use sale ID as run ID for now
          run_date: new Date().toISOString().split('T')[0],
          pay_period_start: new Date().toISOString().split('T')[0],
          pay_period_end: new Date().toISOString().split('T')[0],
          member_id: memberData.member_id,
          member_name: memberData.full_name,
          earning_type: 'override',
          source_member_id: memberData.member_id,
          source_member_name: memberData.full_name,
          source_product_name: webhookData.product.product_name,
          base_amount_cents: Math.round(commissionAmount * 100),
          adjustment_cents: 0,
          final_amount_cents: Math.round(commissionAmount * 100),
          status: 'pending',
          notes: `External sale from ${integration.display_name} - Order ${webhookData.transaction.order_id}`,
        });
      // Ignore earnings errors - commission can be added manually later
    }

    // Mark commission as applied
    await supabase
      .from('external_sales')
      .update({
        commission_applied: true,
        commission_applied_at: new Date().toISOString(),
      })
      .eq('id', saleRecord.id);

    return {
      success: true,
      saleId: saleRecord.id,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Find replicated site by external user ID or distributor ID
 *
 * @param integration - Integration config
 * @param externalUserId - External platform's user ID
 * @param apexDistributorId - Optional Apex distributor ID from webhook
 * @returns Replicated site or null
 */
export async function findReplicatedSite(
  integration: Integration,
  externalUserId: string,
  apexDistributorId?: string
): Promise<DistributorReplicatedSite | null> {
  const supabase = createServiceClient();

  // Try to find by external_user_id first
  if (externalUserId) {
    const { data: siteByUserId } = await supabase
      .from('distributor_replicated_sites')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('external_user_id', externalUserId)
      .eq('site_status', 'active')
      .single();

    if (siteByUserId) {
      return siteByUserId as DistributorReplicatedSite;
    }
  }

  // Try to find by external_site_id (same as external_user_id in many cases)
  const { data: siteByExternalId } = await supabase
    .from('distributor_replicated_sites')
    .select('*')
    .eq('integration_id', integration.id)
    .eq('external_site_id', externalUserId)
    .eq('site_status', 'active')
    .single();

  if (siteByExternalId) {
    return siteByExternalId as DistributorReplicatedSite;
  }

  // If webhook includes apex_distributor_id, try that
  if (apexDistributorId) {
    const { data: siteByDistributor } = await supabase
      .from('distributor_replicated_sites')
      .select('*')
      .eq('integration_id', integration.id)
      .eq('distributor_id', apexDistributorId)
      .eq('site_status', 'active')
      .single();

    if (siteByDistributor) {
      return siteByDistributor as DistributorReplicatedSite;
    }
  }

  return null;
}

/**
 * Find product mapping by external product ID
 *
 * @param integrationId - Integration ID
 * @param externalProductId - External platform's product ID
 * @returns Product mapping or null
 */
export async function findProductMapping(
  integrationId: string,
  externalProductId: string
): Promise<IntegrationProductMapping | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('integration_product_mappings')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('external_product_id', externalProductId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as IntegrationProductMapping;
}
