// Supabase Edge Function: snapshot-monthly-bv
// Purpose: Create monthly BV snapshots for all active reps at month end
// Trigger: Last day of month at 11:59 PM CT (scheduled via cron)
// Author: Claude Code

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Distributor {
  id: string;
  email: string;
  rank: string;
  sponsor_id: string | null;
}

interface BVCalculation {
  personal_bv: number;
  team_bv: number;
  org_bv: number;
}

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get snapshot month (format: YYYY-MM)
    const now = new Date();
    const snapshotMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Starting BV snapshot for month: ${snapshotMonth}`);

    // Get all active distributors
    const { data: distributors, error: distError } = await supabase
      .from('distributors')
      .select('id, email, rank, sponsor_id')
      .eq('status', 'active');

    if (distError) {
      throw new Error(`Failed to fetch distributors: ${distError.message}`);
    }

    if (!distributors || distributors.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active distributors to snapshot' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${distributors.length} active distributors`);

    const snapshots = [];
    const errors = [];

    // Calculate BV for each distributor
    for (const dist of distributors as Distributor[]) {
      try {
        const bv = await calculateBV(supabase, dist.id, snapshotMonth);

        snapshots.push({
          rep_id: dist.id,
          snapshot_month: snapshotMonth,
          personal_bv: bv.personal_bv,
          team_bv: bv.team_bv,
          org_bv: bv.org_bv,
          rank_at_snapshot: dist.rank || 'Associate',
        });
      } catch (err) {
        console.error(`Error calculating BV for ${dist.email}:`, err);
        errors.push({ rep_id: dist.id, email: dist.email, error: String(err) });
      }
    }

    // Bulk insert snapshots
    if (snapshots.length > 0) {
      const { error: insertError } = await supabase
        .from('bv_snapshots')
        .upsert(snapshots, { onConflict: 'rep_id,snapshot_month' });

      if (insertError) {
        throw new Error(`Failed to insert snapshots: ${insertError.message}`);
      }
    }

    // Log to audit_log
    await supabase.from('audit_log').insert({
      action: 'bv_snapshot_completed',
      actor_id: null,
      actor_type: 'system',
      details: {
        snapshot_month: snapshotMonth,
        total_distributors: distributors.length,
        successful_snapshots: snapshots.length,
        errors: errors.length,
      },
    });

    const responseData = {
      success: true,
      snapshot_month: snapshotMonth,
      total_distributors: distributors.length,
      successful_snapshots: snapshots.length,
      failed_snapshots: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('BV snapshot completed:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate BV for a single distributor
async function calculateBV(
  supabase: any,
  repId: string,
  snapshotMonth: string
): Promise<BVCalculation> {
  const [year, month] = snapshotMonth.split('-').map(Number);

  // Calculate personal BV (sum of this rep's completed orders in snapshot month)
  const { data: personalOrders, error: personalError } = await supabase
    .from('orders')
    .select('bv')
    .eq('buyer_id', repId)
    .eq('status', 'completed')
    .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt(
      'created_at',
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`
    );

  if (personalError) {
    throw new Error(`Personal BV calculation failed: ${personalError.message}`);
  }

  const personalBV =
    personalOrders?.reduce((sum: number, order: any) => sum + (order.bv || 0), 0) || 0;

  // Get direct downline
  const { data: directDownline, error: downlineError } = await supabase
    .from('distributors')
    .select('id')
    .eq('sponsor_id', repId);

  if (downlineError) {
    throw new Error(`Downline fetch failed: ${downlineError.message}`);
  }

  const directIds = directDownline?.map((d: any) => d.id) || [];

  // Calculate team BV (direct downline sales)
  let teamBV = 0;
  if (directIds.length > 0) {
    const { data: teamOrders, error: teamError } = await supabase
      .from('orders')
      .select('bv')
      .in('buyer_id', directIds)
      .eq('status', 'completed')
      .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt(
        'created_at',
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, '0')}-01`
      );

    if (teamError) {
      throw new Error(`Team BV calculation failed: ${teamError.message}`);
    }

    teamBV = teamOrders?.reduce((sum: number, order: any) => sum + (order.bv || 0), 0) || 0;
  }

  // Calculate org BV (all downline sales - recursive)
  const allDownlineIds = await getAllDownlineIds(supabase, repId);

  let orgBV = 0;
  if (allDownlineIds.length > 0) {
    const { data: orgOrders, error: orgError } = await supabase
      .from('orders')
      .select('bv')
      .in('buyer_id', allDownlineIds)
      .eq('status', 'completed')
      .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt(
        'created_at',
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, '0')}-01`
      );

    if (orgError) {
      throw new Error(`Org BV calculation failed: ${orgError.message}`);
    }

    orgBV = orgOrders?.reduce((sum: number, order: any) => sum + (order.bv || 0), 0) || 0;
  }

  return {
    personal_bv: Math.round(personalBV * 100) / 100,
    team_bv: Math.round(teamBV * 100) / 100,
    org_bv: Math.round(orgBV * 100) / 100,
  };
}

// Recursively get all downline IDs
async function getAllDownlineIds(supabase: any, repId: string): Promise<string[]> {
  const allIds: string[] = [];
  const queue: string[] = [repId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const { data: children } = await supabase
      .from('distributors')
      .select('id')
      .eq('sponsor_id', currentId);

    if (children && children.length > 0) {
      for (const child of children) {
        allIds.push(child.id);
        queue.push(child.id);
      }
    }
  }

  return allIds;
}
