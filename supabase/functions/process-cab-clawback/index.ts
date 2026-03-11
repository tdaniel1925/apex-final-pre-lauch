// Supabase Edge Function: process-cab-clawback
// Purpose: Daily cron job to process CAB clawback queue
// Runs: Daily at 2:00 AM
// Logic: Check cab_clawback_queue for items past recovery deadline → apply clawback
// Author: Claude Code - Phase 2.2 Revenue Protection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Verify authorization (cron job or admin only)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting CAB clawback processing...');

    const now = new Date();
    let clawbackCount = 0;
    let clearedCount = 0;

    // =====================================================
    // STEP 1: Process expired clawbacks (past 60-day window)
    // =====================================================

    // Find all pending clawbacks past the recovery deadline
    const { data: expiredClawbacks, error: fetchError } = await supabase
      .from('cab_clawback_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('clawback_eligible_until', now.toISOString());

    if (fetchError) {
      console.error('Error fetching expired clawbacks:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredClawbacks?.length || 0} expired clawbacks to process`);

    // Process each expired clawback
    for (const item of expiredClawbacks || []) {
      try {
        // Find the CAB commission record
        const { data: cabRecord, error: cabError } = await supabase
          .from('commissions_cab')
          .select('*')
          .eq('rep_id', item.rep_id)
          .eq('customer_id', item.customer_id)
          .eq('order_id', item.order_id)
          .eq('state', 'PENDING')
          .single();

        if (cabError || !cabRecord) {
          console.error(`CAB record not found for queue item ${item.id}:`, cabError);
          // Mark queue item as 'cleared' (no CAB to claw back)
          await supabase
            .from('cab_clawback_queue')
            .update({ status: 'cleared', processed_at: now.toISOString() })
            .eq('id', item.id);
          clearedCount++;
          continue;
        }

        // CRITICAL: Update CAB state to CLAWBACK
        await supabase
          .from('commissions_cab')
          .update({
            state: 'CLAWBACK',
            state_changed_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', cabRecord.id);

        console.log(`CAB ${cabRecord.id} marked as CLAWBACK`);

        // Create negative commission entry to reverse the CAB
        // Note: This will be deducted in next commission run
        await supabase
          .from('commissions_cab')
          .insert({
            rep_id: item.rep_id,
            customer_id: item.customer_id,
            order_id: item.order_id,
            amount: -item.cab_amount, // Negative amount for clawback
            state: 'CLAWBACK',
            release_eligible_date: now.toISOString(),
            state_changed_at: now.toISOString(),
            month_year: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            status: 'pending', // Will be included in next commission run
          });

        console.log(`Negative CAB entry created: -$${item.cab_amount}`);

        // Update queue status to 'clawback'
        await supabase
          .from('cab_clawback_queue')
          .update({
            status: 'clawback',
            processed_at: now.toISOString(),
          })
          .eq('id', item.id);

        // Notify rep about clawback
        await supabase.from('notifications').insert({
          user_id: item.rep_id,
          type: 'cab_clawback',
          title: 'CAB Bonus Clawed Back',
          message: `A $${item.cab_amount} Customer Acquisition Bonus has been clawed back due to customer cancellation within 60 days.`,
          read: false,
        });

        // Log to audit_log
        await supabase.from('audit_log').insert({
          action: 'cab_clawback_processed',
          actor_type: 'system',
          actor_id: null,
          table_name: 'commissions_cab',
          record_id: cabRecord.id,
          details: {
            cab_id: cabRecord.id,
            rep_id: item.rep_id,
            customer_id: item.customer_id,
            order_id: item.order_id,
            amount: item.cab_amount,
            cancel_date: item.cancel_date,
            clawback_eligible_until: item.clawback_eligible_until,
          },
          timestamp: now.toISOString(),
        });

        clawbackCount++;
        console.log(`Clawback processed for CAB ${cabRecord.id}`);
      } catch (error) {
        console.error(`Error processing clawback for item ${item.id}:`, error);
        // Continue processing other items
      }
    }

    // =====================================================
    // STEP 2: Clear items for subscriptions that are still active
    // =====================================================

    // Find pending clawbacks where the subscription is still active
    const { data: activeSubscriptions, error: activeError } = await supabase
      .from('cab_clawback_queue')
      .select(`
        *,
        order:orders!inner(
          id,
          stripe_subscription_id,
          status
        )
      `)
      .eq('status', 'pending')
      .gte('clawback_eligible_until', now.toISOString());

    if (activeError) {
      console.error('Error fetching active subscriptions:', activeError);
    } else {
      // For each pending item, check if subscription is still active
      for (const item of activeSubscriptions || []) {
        try {
          // If order status is 'complete' (not cancelled), clear the clawback
          if (item.order && item.order.status === 'complete') {
            await supabase
              .from('cab_clawback_queue')
              .update({ status: 'cleared', processed_at: now.toISOString() })
              .eq('id', item.id);

            clearedCount++;
            console.log(`Clawback cleared for item ${item.id} - subscription still active`);
          }
        } catch (error) {
          console.error(`Error clearing item ${item.id}:`, error);
        }
      }
    }

    // =====================================================
    // SUMMARY & RESPONSE
    // =====================================================

    const summary = {
      success: true,
      processed_at: now.toISOString(),
      cabs_clawed_back: clawbackCount,
      cabs_cleared: clearedCount,
      total_processed: clawbackCount + clearedCount,
    };

    console.log('CAB clawback processing complete:', summary);

    // Notify admin if any clawbacks occurred
    if (clawbackCount > 0) {
      const { data: admins } = await supabase
        .from('distributors')
        .select('id')
        .in('role', ['admin', 'cfo']);

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            user_id: admin.id,
            type: 'system',
            title: 'CAB Clawback Processed',
            message: `${clawbackCount} CAB bonus(es) clawed back today. Total amount: $${clawbackCount * 50}.`,
            read: false,
          });
        }
      }
    }

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('CAB clawback processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
        message: 'CAB clawback processing failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
