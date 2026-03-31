// =============================================
// Fulfillment Auto-Transition Functions
// Automatically move clients through Kanban stages
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { sendFulfillmentStageChangeEmail } from './notifications';

interface TransactionDetails {
  id: string;
  distributor_id: string;
  product_slug: string;
  metadata: {
    customer_email?: string;
    customer_name?: string;
  };
}

/**
 * Handle payment made - create initial fulfillment record
 * Called from Stripe webhook after successful checkout
 */
export async function handlePaymentMade(transactionId: string) {
  const supabase = createServiceClient();

  try {
    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, distributor_id, product_slug, metadata')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      return { success: false, error: 'Transaction not found' };
    }

    // Extract client info from metadata
    const clientEmail = transaction.metadata?.customer_email;
    const clientName = transaction.metadata?.customer_name || 'Customer';

    if (!clientEmail) {
      console.error('No customer email in transaction metadata');
      return { success: false, error: 'No customer email' };
    }

    // Check if fulfillment record already exists
    const { data: existing } = await supabase
      .from('fulfillment_kanban')
      .select('id')
      .eq('client_email', clientEmail)
      .eq('product_slug', transaction.product_slug)
      .single();

    if (existing) {
      console.log('Fulfillment record already exists:', existing.id);
      return { success: true, fulfillmentId: existing.id };
    }

    // Create initial stage history entry
    const initialHistory = [
      {
        stage: 'service_payment_made',
        moved_at: new Date().toISOString(),
        moved_by: null,
        auto: true,
        notes: 'Payment received via Stripe',
      },
    ];

    // Create fulfillment record
    const { data: fulfillment, error: insertError } = await supabase
      .from('fulfillment_kanban')
      .insert({
        distributor_id: transaction.distributor_id,
        client_name: clientName,
        client_email: clientEmail,
        product_slug: transaction.product_slug,
        stage: 'service_payment_made',
        moved_to_current_stage_at: new Date().toISOString(),
        auto_transitioned: true,
        stage_history: initialHistory,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create fulfillment record:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Fulfillment record created:', fulfillment.id);

    // Send notification to rep
    await sendFulfillmentStageChangeEmail({
      fulfillmentId: fulfillment.id,
      distributorId: transaction.distributor_id,
      clientName,
      productSlug: transaction.product_slug,
      newStage: 'service_payment_made',
      notes: 'Payment received via Stripe',
    });

    return { success: true, fulfillmentId: fulfillment.id };
  } catch (error) {
    console.error('Error in handlePaymentMade:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle onboarding scheduled - move to next stage
 * Called from onboarding booking API
 */
export async function handleOnboardingScheduled(bookingId: string) {
  const supabase = createServiceClient();

  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('client_onboarding')
      .select('id, distributor_id, client_email, client_name, product_slug, onboarding_date')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return { success: false, error: 'Booking not found' };
    }

    // Find fulfillment record by client email and product
    const { data: fulfillment, error: findError } = await supabase
      .from('fulfillment_kanban')
      .select('id, stage, stage_history')
      .eq('client_email', booking.client_email)
      .eq('product_slug', booking.product_slug)
      .single();

    if (findError || !fulfillment) {
      console.error('Fulfillment record not found:', findError);
      return { success: false, error: 'Fulfillment record not found' };
    }

    // Check if already at this stage or beyond
    const stageOrder = [
      'service_payment_made',
      'onboarding_date_set',
      'onboarding_complete',
      'pages_being_built',
      'social_media_proofs',
      'content_approved',
      'campaigns_launched',
      'service_completed',
    ];

    const currentStageIndex = stageOrder.indexOf(fulfillment.stage);
    const targetStageIndex = stageOrder.indexOf('onboarding_date_set');

    if (currentStageIndex >= targetStageIndex) {
      console.log('Already at or past onboarding_date_set stage');
      return { success: true, fulfillmentId: fulfillment.id };
    }

    // Add to stage history
    const newHistoryEntry = {
      stage: 'onboarding_date_set',
      moved_at: new Date().toISOString(),
      moved_by: null,
      auto: true,
      notes: `Onboarding scheduled for ${new Date(booking.onboarding_date).toLocaleString()}`,
    };

    const updatedHistory = [...(fulfillment.stage_history as any[]), newHistoryEntry];

    // Update stage
    const { error: updateError } = await supabase
      .from('fulfillment_kanban')
      .update({
        client_onboarding_id: booking.id,
        stage: 'onboarding_date_set',
        moved_to_current_stage_at: new Date().toISOString(),
        auto_transitioned: true,
        stage_history: updatedHistory,
      })
      .eq('id', fulfillment.id);

    if (updateError) {
      console.error('Failed to update fulfillment stage:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('Fulfillment stage updated to onboarding_date_set');

    // Send notification to rep
    await sendFulfillmentStageChangeEmail({
      fulfillmentId: fulfillment.id,
      distributorId: booking.distributor_id,
      clientName: booking.client_name,
      productSlug: booking.product_slug,
      newStage: 'onboarding_date_set',
      notes: `Onboarding scheduled for ${new Date(booking.onboarding_date).toLocaleString()}`,
    });

    return { success: true, fulfillmentId: fulfillment.id };
  } catch (error) {
    console.error('Error in handleOnboardingScheduled:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get fulfillment record by ID
 */
export async function getFulfillmentById(fulfillmentId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('fulfillment_kanban')
    .select(
      `
      *,
      distributor:distributors!fulfillment_kanban_distributor_id_fkey(
        id,
        first_name,
        last_name,
        email
      ),
      onboarding:client_onboarding(
        id,
        onboarding_date,
        meeting_link,
        completed,
        no_show
      )
    `
    )
    .eq('id', fulfillmentId)
    .single();

  if (error) {
    console.error('Error fetching fulfillment:', error);
    return null;
  }

  return data;
}

/**
 * Get all fulfillment records for a distributor
 */
export async function getFulfillmentByDistributor(distributorId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('fulfillment_kanban')
    .select(
      `
      *,
      onboarding:client_onboarding(
        id,
        onboarding_date,
        meeting_link,
        completed,
        no_show
      )
    `
    )
    .eq('distributor_id', distributorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fulfillment records:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all fulfillment records grouped by stage (for Kanban board)
 */
export async function getAllFulfillmentGroupedByStage() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('fulfillment_kanban')
    .select(
      `
      *,
      distributor:distributors!fulfillment_kanban_distributor_id_fkey(
        id,
        first_name,
        last_name,
        email
      ),
      onboarding:client_onboarding(
        id,
        onboarding_date,
        meeting_link,
        completed,
        no_show
      )
    `
    )
    .order('moved_to_current_stage_at', { ascending: false });

  if (error) {
    console.error('Error fetching all fulfillment records:', error);
    return {};
  }

  // Group by stage
  const grouped: Record<string, any[]> = {
    service_payment_made: [],
    onboarding_date_set: [],
    onboarding_complete: [],
    pages_being_built: [],
    social_media_proofs: [],
    content_approved: [],
    campaigns_launched: [],
    service_completed: [],
  };

  data?.forEach((record) => {
    if (grouped[record.stage]) {
      grouped[record.stage].push(record);
    }
  });

  return grouped;
}
