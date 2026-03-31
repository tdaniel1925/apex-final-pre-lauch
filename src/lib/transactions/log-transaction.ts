// =============================================
// Transaction Logging Utility Functions
// Helper functions for logging transactions from anywhere in the app
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

interface LogTransactionParams {
  distributorId: string;
  transactionType: 'product_sale' | 'subscription_payment' | 'commission_payment' | 'refund';
  amount: number;
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  productSlug?: string;
  metadata?: Record<string, any>;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

/**
 * Log a transaction to the transactions table
 *
 * @param params - Transaction parameters
 * @returns The created transaction record
 * @throws Error if transaction logging fails
 */
export async function logTransaction(params: LogTransactionParams) {
  try {
    const supabase = createServiceClient();

    // Check for duplicate transaction (idempotency)
    if (params.stripePaymentIntentId) {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('stripe_payment_intent_id', params.stripePaymentIntentId)
        .eq('transaction_type', params.transactionType)
        .maybeSingle();

      if (existing) {
        console.log('⚠️ Duplicate transaction detected - already logged:', existing.id);
        return existing;
      }
    }

    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        distributor_id: params.distributorId,
        transaction_type: params.transactionType,
        amount: params.amount,
        stripe_payment_intent_id: params.stripePaymentIntentId,
        stripe_subscription_id: params.stripeSubscriptionId,
        product_slug: params.productSlug,
        metadata: params.metadata || {},
        status: params.status || 'completed',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log transaction:', error);
      throw error;
    }

    console.log('✅ Transaction logged:', {
      id: data.id,
      type: data.transaction_type,
      amount: data.amount,
      distributor_id: data.distributor_id,
    });

    return data;
  } catch (error) {
    console.error('❌ Error logging transaction:', error);
    throw error;
  }
}

/**
 * Log a product sale transaction
 *
 * @param distributorId - Distributor who made the sale
 * @param amount - Sale amount in dollars
 * @param productSlug - Product identifier
 * @param stripePaymentIntentId - Stripe payment intent ID
 * @param metadata - Additional metadata
 */
export async function logProductSale(
  distributorId: string,
  amount: number,
  productSlug: string,
  stripePaymentIntentId?: string,
  metadata?: Record<string, any>
) {
  return logTransaction({
    distributorId,
    transactionType: 'product_sale',
    amount,
    productSlug,
    stripePaymentIntentId,
    metadata,
    status: 'completed',
  });
}

/**
 * Log a subscription payment transaction
 *
 * @param distributorId - Distributor who owns the subscription
 * @param amount - Payment amount in dollars
 * @param productSlug - Product identifier
 * @param stripePaymentIntentId - Stripe payment intent ID
 * @param stripeSubscriptionId - Stripe subscription ID
 * @param metadata - Additional metadata
 */
export async function logSubscriptionPayment(
  distributorId: string,
  amount: number,
  productSlug: string,
  stripePaymentIntentId?: string,
  stripeSubscriptionId?: string,
  metadata?: Record<string, any>
) {
  return logTransaction({
    distributorId,
    transactionType: 'subscription_payment',
    amount,
    productSlug,
    stripePaymentIntentId,
    stripeSubscriptionId,
    metadata,
    status: 'completed',
  });
}

/**
 * Log a commission payment transaction
 *
 * @param distributorId - Distributor receiving the commission
 * @param amount - Commission amount in dollars
 * @param metadata - Additional metadata (source order, commission type, etc.)
 */
export async function logCommissionPayment(
  distributorId: string,
  amount: number,
  metadata?: Record<string, any>
) {
  return logTransaction({
    distributorId,
    transactionType: 'commission_payment',
    amount,
    metadata,
    status: 'completed',
  });
}

/**
 * Log a refund transaction
 *
 * @param distributorId - Distributor who originally made the sale
 * @param amount - Refund amount in dollars (should be negative)
 * @param stripePaymentIntentId - Original Stripe payment intent ID
 * @param productSlug - Product identifier
 * @param metadata - Additional metadata (refund reason, original transaction, etc.)
 */
export async function logRefund(
  distributorId: string,
  amount: number,
  stripePaymentIntentId: string,
  productSlug?: string,
  metadata?: Record<string, any>
) {
  // Ensure refund amount is negative
  const refundAmount = amount > 0 ? -amount : amount;

  return logTransaction({
    distributorId,
    transactionType: 'refund',
    amount: refundAmount,
    stripePaymentIntentId,
    productSlug,
    metadata,
    status: 'completed',
  });
}

/**
 * Get all transactions for a distributor
 *
 * @param distributorId - Distributor ID
 * @param limit - Maximum number of transactions to return
 * @returns Array of transactions
 */
export async function getDistributorTransactions(
  distributorId: string,
  limit: number = 50
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('distributor_id', distributorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch transactions:', error);
    throw error;
  }

  return data;
}

/**
 * Get total sales for a distributor in the current month
 *
 * @param distributorId - Distributor ID
 * @returns Total sales amount
 */
export async function getMonthlyTotalSales(distributorId: string) {
  const supabase = createServiceClient();

  // Get first day of current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('distributor_id', distributorId)
    .in('transaction_type', ['product_sale', 'subscription_payment'])
    .eq('status', 'completed')
    .gte('created_at', firstDay.toISOString());

  if (error) {
    console.error('❌ Failed to fetch monthly sales:', error);
    throw error;
  }

  return data.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}
