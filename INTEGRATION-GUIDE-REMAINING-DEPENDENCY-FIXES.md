# Integration Guide: 10 Remaining Dependency Connection Fixes

This document outlines how to integrate the remaining 10 missing dependency connections into the Apex platform screens.

---

## ✅ COMPLETED

1. **Supabase Migration**: `supabase/migrations/20260311000004_remaining_dependency_connections.sql`
   - New tables: `orders`, `cab_clawback_queue`, `subscription_renewals`, `commission_run_rep_totals`, `bv_snapshot_runs`
   - New columns on `commission_runs` and `distributors`
   - Database functions: `calculate_renewal_rate()`, `is_rep_active()`, `get_carry_forward()`, `handle_termination()`
   - Updated status enum for rep termination

2. **Edge Function**: `supabase/functions/stripe-webhook/index.ts`
   - Handles all Stripe webhook events
   - Creates orders from payment_intent.succeeded
   - Manages subscriptions (created, cancelled)
   - Tracks renewals (paid, failed)
   - Handles disputes/chargebacks
   - Credits promotion fund for Business Center purchases

3. **Edge Function**: `supabase/functions/send-notification/index.ts`
   - Sends emails via Resend
   - Branded email templates (Navy/Red Apex theme)
   - Types: commission_complete, rank_promoted, rank_eligible, welcome
   - In-app notifications via Supabase real-time

---

## 🔧 SCREEN INTEGRATIONS NEEDED

### FIX 6: Stripe Webhook → Order Recording

**No UI changes required** — this is backend only.

**Stripe Payment Intent Metadata** (when creating payment):
```tsx
// Example: Creating a payment intent from checkout
const paymentIntent = await stripe.paymentIntents.create({
  amount: priceInCents,
  currency: 'usd',
  metadata: {
    rep_id: currentUser.id,
    product_id: selectedProduct.id,
    order_type: isBusinessCenter ? 'business_center' : 'member',
    bv_amount: selectedProduct.bv.toString(),
  },
});
```

**Webhook Configuration**:
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://[your-supabase-url]/functions/v1/stripe-webhook`
- Select events: `payment_intent.succeeded`, `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `charge.dispute.created`
- Copy webhook signing secret to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

**Testing**:
```bash
# Test webhook locally
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test payment
stripe trigger payment_intent.succeeded
```

---

### FIX 7: CAB Clawback Mechanism

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// Phase 3: Process CAB bonuses with clawback deduction
async function processCabBonuses(commissionRunId: string, month: string) {
  // Get all reps eligible for CAB this month
  const { data: cabEligible } = await supabase
    .from('orders')
    .select('rep_id, bv_amount')
    .eq('order_type', 'retail')
    .eq('status', 'complete')
    .gte('created_at', `${month}-01`)
    .lt('created_at', getNextMonth(month));

  for (const entry of cabEligible || []) {
    let cabAmount = 50.00; // Standard CAB

    // Check for pending clawbacks
    const { data: clawbacks } = await supabase
      .from('cab_clawback_queue')
      .select('cab_amount')
      .eq('rep_id', entry.rep_id)
      .eq('status', 'pending');

    const totalClawback = clawbacks?.reduce((sum, c) => sum + c.cab_amount, 0) || 0;

    // Deduct clawback from current CAB
    const netCab = Math.max(0, cabAmount - totalClawback);

    // Record commission
    await supabase.from('commissions').insert({
      commission_run_id: commissionRunId,
      rep_id: entry.rep_id,
      type: 'cab',
      amount: netCab,
      details: {
        gross_cab: cabAmount,
        clawback_deducted: totalClawback,
        net_cab: netCab,
      },
    });

    // Mark clawbacks as processed
    if (totalClawback > 0) {
      await supabase
        .from('cab_clawback_queue')
        .update({ status: 'clawback', commission_run_id: commissionRunId })
        .eq('rep_id', entry.rep_id)
        .eq('status', 'pending');
    }
  }
}
```

**Screen 5** (`/app/earnings/page.tsx`):
```tsx
// Show CAB with clawback warning
const { data: pendingClawbacks } = await supabase
  .from('cab_clawback_queue')
  .select('cab_amount, cancel_date')
  .eq('rep_id', currentUser.id)
  .eq('status', 'pending');

const totalClawback = pendingClawbacks?.reduce((sum, c) => sum + c.cab_amount, 0) || 0;

{totalClawback > 0 && (
  <div className="bg-amber-50 border border-amber-200 p-3 rounded">
    <p className="text-xs font-semibold text-amber-800">⚠️ CAB Clawback Pending</p>
    <p className="text-xs text-amber-700 mt-1">
      ${totalClawback.toFixed(2)} will be deducted from your next CAB bonus due to customer cancellations within 60 days.
    </p>
    <p className="text-[10px] text-amber-600 mt-1">
      Clawback clears after 60 days if customer does not re-activate.
    </p>
  </div>
)}
```

---

### FIX 8: Renewal Rate Tracking

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// Phase 3: Process Retention Bonus (80%+ renewal rate required)
async function processRetentionBonus(commissionRunId: string, month: string) {
  const { data: reps } = await supabase
    .from('distributors')
    .select('id, rank')
    .eq('status', 'active')
    .in('rank', ['Gold', 'Platinum']);

  for (const rep of reps || []) {
    // Calculate renewal rate
    const { data: renewalRate } = await supabase.rpc('calculate_renewal_rate', {
      p_rep_id: rep.id,
      p_month: month,
    });

    if (renewalRate && renewalRate >= 80) {
      // Award Retention Bonus: 2% of team BV
      const { data: teamBV } = await supabase
        .from('bv_snapshots')
        .select('team_bv')
        .eq('rep_id', rep.id)
        .eq('snapshot_month', month)
        .single();

      const bonusAmount = (teamBV?.team_bv || 0) * 0.02;

      await supabase.from('commissions').insert({
        commission_run_id: commissionRunId,
        rep_id: rep.id,
        type: 'retention_bonus',
        amount: bonusAmount,
        details: {
          renewal_rate: renewalRate,
          team_bv: teamBV?.team_bv,
          rate: 0.02,
        },
      });
    }
  }
}
```

**Screen 5** (`/app/earnings/page.tsx`):
```tsx
// Show renewal rate in earnings breakdown
const { data: renewalRate } = await supabase.rpc('calculate_renewal_rate', {
  p_rep_id: currentUser.id,
  p_month: currentMonth,
});

<div className="bg-white rounded-lg border border-neutral-200 p-4">
  <p className="text-xs text-gray-500 mb-1">Renewal Rate (This Month)</p>
  <p className="text-2xl font-bold text-[#0F2045]">{renewalRate?.toFixed(1) || '0.0'}%</p>
  {renewalRate && renewalRate >= 80 ? (
    <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
      Retention Bonus Qualified ✓
    </span>
  ) : (
    <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
      Need 80%+ for Retention Bonus
    </span>
  )}
</div>
```

---

### FIX 9: Active Rep Definition Enforcement

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// Phase 2: Override Compression — skip inactive reps
async function processOverrideCompression(commissionRunId: string, month: string) {
  const { data: reps } = await supabase
    .from('distributors')
    .select('id, sponsor_id, rank')
    .eq('status', 'active');

  for (const rep of reps || []) {
    // Check if rep is active ($50+ personal BV)
    const { data: isActive } = await supabase.rpc('is_rep_active', {
      p_rep_id: rep.id,
      p_month: month,
    });

    if (!isActive) {
      console.log(`Rep ${rep.id} inactive — compressing overrides to sponsor`);
      // Skip this rep, overrides flow to next active upline
      continue;
    }

    // Process overrides for active rep
    // ...
  }
}

// Phase 3: Team Pulse Bonuses — require active status
async function processTeamPulseBonuses(commissionRunId: string, month: string) {
  const { data: reps } = await supabase
    .from('distributors')
    .select('id, rank')
    .eq('status', 'active')
    .in('rank', ['Silver', 'Gold', 'Platinum']);

  for (const rep of reps || []) {
    // Check if rep is active
    const { data: isActive } = await supabase.rpc('is_rep_active', {
      p_rep_id: rep.id,
      p_month: month,
    });

    if (!isActive) {
      console.log(`Rep ${rep.id} not active — skipping Team Pulse`);
      continue;
    }

    // Award Team Pulse bonus
    // ...
  }
}
```

**Screen 1** (`/app/dashboard/page.tsx`):
```tsx
// Show active status badge
const { data: isActive } = await supabase.rpc('is_rep_active', {
  p_rep_id: currentUser.id,
  p_month: TO_CHAR(NOW(), 'YYYY-MM'),
});

<div className="bg-white rounded-lg border border-neutral-200 p-4">
  <div className="flex items-center justify-between mb-2">
    <p className="text-xs text-gray-500">Active Status (This Month)</p>
    {isActive ? (
      <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
        Active ✓
      </span>
    ) : (
      <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
        Inactive
      </span>
    )}
  </div>
  <p className="text-xs text-gray-600">
    {isActive
      ? 'You have $50+ personal BV this month.'
      : 'Need $50+ personal BV to be active and qualify for bonuses.'}
  </p>
</div>
```

---

### FIX 10: Check Match Sequencing

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// 7-Phase Commission Run Implementation
async function runCommissionCalculation(month: string) {
  // Create commission run record
  const { data: run } = await supabase
    .from('commission_runs')
    .insert({
      period: month,
      status: 'running',
      phase: 'phase_1_seller',
    })
    .select()
    .single();

  try {
    // PHASE 1: Seller Commissions
    await supabase.from('commission_runs').update({ phase: 'phase_1_seller' }).eq('id', run.id);
    await processSellerCommissions(run.id, month);

    // PHASE 2: Override Commissions
    await supabase.from('commission_runs').update({ phase: 'phase_2_override' }).eq('id', run.id);
    await processOverrideCommissions(run.id, month);

    // PHASE 3: Bonuses
    await supabase.from('commission_runs').update({ phase: 'phase_3_bonuses' }).eq('id', run.id);
    await processBonuses(run.id, month);

    // PHASE 4: Calculate Per-Rep Totals (BEFORE Check Match)
    await supabase.from('commission_runs').update({ phase: 'phase_4_totals' }).eq('id', run.id);
    await calculateRepTotals(run.id, month);

    // PHASE 5: Check Match (based on subtotals from Phase 4)
    await supabase.from('commission_runs').update({ phase: 'phase_5_check_match' }).eq('id', run.id);
    await processCheckMatch(run.id, month);

    // PHASE 6: Apply $25 Threshold & Carry Forward
    await supabase.from('commission_runs').update({ phase: 'phase_6_threshold' }).eq('id', run.id);
    await applyThresholdAndCarryForward(run.id, month);

    // PHASE 7: Lock & Finalize
    await supabase.from('commission_runs').update({ phase: 'phase_7_lock', status: 'complete' }).eq('id', run.id);

    return { success: true, run_id: run.id };
  } catch (error) {
    await supabase.from('commission_runs').update({ status: 'failed', error_message: String(error) }).eq('id', run.id);
    throw error;
  }
}

// Phase 4: Calculate subtotals for each rep
async function calculateRepTotals(commissionRunId: string, month: string) {
  const { data: reps } = await supabase
    .from('distributors')
    .select('id')
    .eq('status', 'active');

  for (const rep of reps || []) {
    // Sum all commissions for this rep
    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount')
      .eq('commission_run_id', commissionRunId)
      .eq('rep_id', rep.id);

    const seller = commissions?.filter(c => c.type === 'seller').reduce((sum, c) => sum + c.amount, 0) || 0;
    const override = commissions?.filter(c => c.type === 'override').reduce((sum, c) => sum + c.amount, 0) || 0;
    const bonuses = commissions?.filter(c => !['seller', 'override', 'check_match'].includes(c.type)).reduce((sum, c) => sum + c.amount, 0) || 0;

    const subtotal = seller + override + bonuses;

    // Get carry forward from prior run
    const { data: carryForward } = await supabase.rpc('get_carry_forward', {
      p_rep_id: rep.id,
      p_run_month: month,
    });

    // Insert rep totals (WITHOUT check match yet)
    await supabase.from('commission_run_rep_totals').insert({
      commission_run_id: commissionRunId,
      rep_id: rep.id,
      seller_commission: seller,
      override_earned: override,
      bonuses_earned: bonuses,
      subtotal,
      check_match_earned: 0, // Will be calculated in Phase 5
      total_payout: subtotal,
      carry_forward_in: carryForward || 0,
      carry_forward_out: 0, // Will be calculated in Phase 6
      final_payout: subtotal + (carryForward || 0),
    });
  }
}

// Phase 5: Check Match (based on Phase 4 subtotals)
async function processCheckMatch(commissionRunId: string, month: string) {
  const { data: reps } = await supabase
    .from('distributors')
    .select('id, rank')
    .eq('status', 'active')
    .in('rank', ['Gold', 'Platinum']);

  for (const rep of reps || []) {
    // Get sponsor's subtotal from Phase 4
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('sponsor_id')
      .eq('id', rep.id)
      .single();

    if (!sponsor?.sponsor_id) continue;

    const { data: sponsorTotals } = await supabase
      .from('commission_run_rep_totals')
      .select('subtotal')
      .eq('commission_run_id', commissionRunId)
      .eq('rep_id', sponsor.sponsor_id)
      .single();

    const matchRate = rep.rank === 'Platinum' ? 0.05 : 0.03; // 5% for Platinum, 3% for Gold
    const checkMatchAmount = (sponsorTotals?.subtotal || 0) * matchRate;

    // Record check match commission
    await supabase.from('commissions').insert({
      commission_run_id: commissionRunId,
      rep_id: rep.id,
      type: 'check_match',
      amount: checkMatchAmount,
      details: {
        sponsor_id: sponsor.sponsor_id,
        sponsor_subtotal: sponsorTotals?.subtotal,
        match_rate: matchRate,
      },
    });

    // Update rep totals with check match
    await supabase
      .from('commission_run_rep_totals')
      .update({
        check_match_earned: checkMatchAmount,
        total_payout: supabase.raw('subtotal + ?', [checkMatchAmount]),
      })
      .eq('commission_run_id', commissionRunId)
      .eq('rep_id', rep.id);
  }
}
```

---

### FIX 11: Notification Delivery

**Setup Real-time Subscription** (in root layout or dashboard):

```tsx
// src/app/layout.tsx or src/app/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'system' ? 'default' : 'success',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      {/* Notification bell with badge */}
      <NotificationBell notifications={notifications} />
      {children}
    </div>
  );
}
```

**Screen 9** (`/app/notifications/page.tsx`):
```tsx
// Mark as read when notification is clicked
async function handleMarkAsRead(notificationId: string) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  setNotifications((prev) =>
    prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  );
}
```

**Email Configuration**:
- Set `RESEND_API_KEY` in Supabase secrets
- Verify sender email domain in Resend dashboard: `notifications@apexaffinitygroup.com`
- Deploy edge function: `supabase functions deploy send-notification`
- Create database trigger to call edge function on notification INSERT

---

### FIX 12: BV Snapshot → Commission Run Sequencing Gate

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
const [snapshotStatus, setSnapshotStatus] = useState<'available' | 'missing' | 'running' | 'checking'>('checking');
const [snapshotRunId, setSnapshotRunId] = useState<string | null>(null);

// Check for BV snapshot before allowing commission run
async function checkBVSnapshot(month: string) {
  setSnapshotStatus('checking');

  const { data: snapshotRun } = await supabase
    .from('bv_snapshot_runs')
    .select('id, status, rep_count')
    .eq('snapshot_month', month)
    .single();

  if (!snapshotRun) {
    setSnapshotStatus('missing');
    return;
  }

  if (snapshotRun.status === 'running') {
    setSnapshotStatus('running');
    setSnapshotRunId(snapshotRun.id);
    return;
  }

  if (snapshotRun.status === 'complete') {
    setSnapshotStatus('available');
    setSnapshotRunId(snapshotRun.id);
    return;
  }

  setSnapshotStatus('missing');
}

// Manual trigger for BV snapshot
async function handleRunBVSnapshot() {
  setSnapshotStatus('running');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/snapshot-monthly-bv`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    }
  );

  const result = await response.json();

  if (result.success) {
    toast({
      title: 'BV Snapshot Complete',
      description: `${result.successful_snapshots} reps snapshotted successfully.`,
    });
    setSnapshotStatus('available');
  } else {
    toast({
      title: 'Snapshot Failed',
      description: result.error,
      variant: 'destructive',
    });
    setSnapshotStatus('missing');
  }
}

// Gate UI
{snapshotStatus === 'missing' && (
  <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-red-800">⚠️ BV Snapshot Missing</p>
        <p className="text-xs text-red-700 mt-1">
          No BV snapshot found for {selectedMonth}. Commission runs require a completed snapshot to ensure data integrity.
        </p>
      </div>
      <button
        onClick={handleRunBVSnapshot}
        className="px-3 py-1.5 bg-[#1B3A7D] text-white text-xs font-semibold rounded"
      >
        Run Snapshot Now
      </button>
    </div>
  </div>
)}

{snapshotStatus === 'running' && (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
    <p className="text-sm font-semibold text-blue-800">⏳ BV Snapshot Running...</p>
    <p className="text-xs text-blue-700 mt-1">
      Please wait while the snapshot completes. This may take a few minutes.
    </p>
  </div>
)}

{snapshotStatus === 'available' && (
  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded mb-4">
    <p className="text-sm font-semibold text-emerald-800">✓ BV Snapshot Available</p>
    <p className="text-xs text-emerald-700 mt-1">
      Ready to run commission calculation for {selectedMonth}.
    </p>
  </div>
)}

<button
  onClick={handleRunCommission}
  disabled={snapshotStatus !== 'available' || commissionRunning}
  className="px-4 py-2 bg-[#C7181F] text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
>
  {commissionRunning ? 'Running...' : 'Run Commission Calculation'}
</button>
```

---

### FIX 13: Carry Forward Automation

**Screen 15** (`/app/admin/commission-engine/page.tsx`):

```tsx
// Phase 6: Apply $25 Threshold & Carry Forward
async function applyThresholdAndCarryForward(commissionRunId: string, month: string) {
  const { data: repTotals } = await supabase
    .from('commission_run_rep_totals')
    .select('*')
    .eq('commission_run_id', commissionRunId);

  for (const totals of repTotals || []) {
    const totalWithCarryIn = totals.total_payout + totals.carry_forward_in;

    if (totalWithCarryIn < 25) {
      // Under threshold — carry forward to next month
      await supabase
        .from('commission_run_rep_totals')
        .update({
          carry_forward_out: totalWithCarryIn,
          final_payout: 0,
        })
        .eq('id', totals.id);

      console.log(`Rep ${totals.rep_id} total $${totalWithCarryIn} < $25 — carried forward`);
    } else {
      // Over threshold — pay out
      await supabase
        .from('commission_run_rep_totals')
        .update({
          carry_forward_out: 0,
          final_payout: totalWithCarryIn,
        })
        .eq('id', totals.id);
    }
  }
}
```

**Screen 5** (`/app/earnings/page.tsx`):
```tsx
// Show carry forward from prior month
const { data: carryForward } = await supabase.rpc('get_carry_forward', {
  p_rep_id: currentUser.id,
  p_run_month: currentMonth,
});

{carryForward && carryForward > 0 && (
  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
    <p className="text-xs font-semibold text-blue-800">💰 Carry Forward from Prior Month</p>
    <p className="text-lg font-bold text-blue-900 mt-1">${carryForward.toFixed(2)}</p>
    <p className="text-[10px] text-blue-600 mt-1">
      This amount will be added to your current month earnings.
    </p>
  </div>
)}
```

---

### FIX 14: Rep Termination → Downline Orphan Rules

**Screen 13** (`/app/admin/reps/page.tsx`):

```tsx
const [showTerminateModal, setShowTerminateModal] = useState(false);
const [selectedRep, setSelectedRep] = useState<Rep | null>(null);
const [terminationResult, setTerminationResult] = useState<any>(null);

async function handleTerminateRep(repId: string) {
  // Call termination function
  const { data: result, error } = await supabase.rpc('handle_termination', {
    p_rep_id: repId,
  });

  if (error) {
    toast({
      title: 'Termination Failed',
      description: error.message,
      variant: 'destructive',
    });
    return;
  }

  setTerminationResult(result);

  // Refresh rep list
  await fetchReps();

  toast({
    title: 'Rep Terminated',
    description: `${result.length} downline reps re-sponsored successfully.`,
  });
}

// Termination Confirmation Modal
{showTerminateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-bold text-[#0F2045] mb-2">⚠️ Terminate Rep</h3>
      <p className="text-sm text-gray-700 mb-4">
        You are about to terminate <strong>{selectedRep?.first_name} {selectedRep?.last_name}</strong>.
      </p>

      <div className="bg-amber-50 border border-amber-200 p-3 rounded mb-4">
        <p className="text-xs font-semibold text-amber-800 mb-2">This action will:</p>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>Set rep status to "Terminated"</li>
          <li>Re-sponsor all direct downline to this rep's sponsor</li>
          <li>Recalculate BV for entire upline chain</li>
          <li>Prevent rep from logging in</li>
        </ul>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        This action is <strong>irreversible</strong>. Terminated reps cannot be reactivated.
      </p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setShowTerminateModal(false)}
          className="px-4 py-2 border border-gray-300 rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => handleTerminateRep(selectedRep!.id)}
          className="px-4 py-2 bg-[#C7181F] text-white rounded text-sm font-semibold"
        >
          Terminate Rep
        </button>
      </div>
    </div>
  </div>
)}
```

**Screen 12** (`/app/admin/page.tsx`):
```tsx
// Show recent terminations in activity log
const { data: recentTerminations } = await supabase
  .from('audit_log')
  .select('*, distributors!inner(first_name, last_name)')
  .eq('action', 'rep_terminated')
  .order('created_at', { ascending: false })
  .limit(5);

<div className="bg-white rounded-lg border border-neutral-200 p-4">
  <h3 className="text-sm font-bold text-[#0F2045] mb-3">Recent Terminations</h3>
  <div className="space-y-2">
    {recentTerminations?.map((log) => (
      <div key={log.id} className="flex items-start gap-2 text-xs">
        <span className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleDateString()}</span>
        <span className="text-gray-700">
          {log.distributors.first_name} {log.distributors.last_name} terminated —{' '}
          {log.details.affected_count} downline re-sponsored
        </span>
      </div>
    ))}
  </div>
</div>
```

---

### FIX 15: Promotion Fund Integrity

**Cron Job** (for retrying failed promotion fund credits):

```tsx
// supabase/functions/retry-promotion-fund-credits/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find orders with promotion fund not yet credited
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('order_type', 'business_center')
    .eq('promotion_fund_credited', false)
    .eq('status', 'complete')
    .limit(100);

  let successCount = 0;
  let failCount = 0;

  for (const order of pendingOrders || []) {
    try {
      const currentBalance = await supabase.rpc('get_promotion_fund_balance');

      await supabase.from('promotion_fund_ledger').insert({
        transaction_type: 'credit',
        amount: 5.00,
        source_rep_id: order.rep_id,
        source_order_id: order.id,
        balance_after: (currentBalance.data || 0) + 5.00,
        notes: 'Business Center purchase contribution (retry)',
      });

      await supabase
        .from('orders')
        .update({ promotion_fund_credited: true })
        .eq('id', order.id);

      successCount++;
    } catch (error) {
      console.error(`Failed to credit order ${order.id}:`, error);
      failCount++;
    }
  }

  return new Response(
    JSON.stringify({ success: true, retried: pendingOrders?.length, successCount, failCount }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Schedule Cron** (Supabase Dashboard → Edge Functions → Cron Triggers):
- Function: `retry-promotion-fund-credits`
- Schedule: `0 */6 * * *` (every 6 hours)

**Screen 22** (`/app/finance/page.tsx`):
```tsx
// Show pending promotion fund credits
const { data: pendingCredits } = await supabase
  .from('orders')
  .select('id, gross_amount_cents')
  .eq('order_type', 'business_center')
  .eq('promotion_fund_credited', false)
  .eq('status', 'complete');

{pendingCredits && pendingCredits.length > 0 && (
  <div className="bg-amber-50 border border-amber-200 p-3 rounded">
    <p className="text-xs font-semibold text-amber-800">⚠️ Pending Promotion Fund Credits</p>
    <p className="text-xs text-amber-700 mt-1">
      {pendingCredits.length} Business Center orders have not yet credited $5 to the promotion fund.
    </p>
    <p className="text-[10px] text-amber-600 mt-1">
      Retry cron job runs every 6 hours to process pending credits.
    </p>
  </div>
)}
```

---

## 📝 TESTING CHECKLIST

- [ ] Apply migration: `supabase db reset`
- [ ] Deploy edge functions:
  - `supabase functions deploy stripe-webhook`
  - `supabase functions deploy send-notification`
  - `supabase functions deploy retry-promotion-fund-credits`
- [ ] Configure Stripe webhook endpoint and signing secret
- [ ] Test payment flow: Create test payment, verify order inserted
- [ ] Test subscription cancellation: Cancel subscription within 60 days, verify CAB clawback queued
- [ ] Test renewal tracking: Process invoice.paid event, verify renewal recorded
- [ ] Test active rep check: Rep with <$50 personal BV should be marked inactive
- [ ] Test 7-phase commission run: Run full calculation, verify Check Match in Phase 5
- [ ] Test notification delivery: Insert notification, verify email sent via Resend
- [ ] Test BV snapshot gate: Attempt commission run without snapshot, verify blocked
- [ ] Test carry forward: Rep earning <$25 should have amount carried to next month
- [ ] Test rep termination: Terminate rep with downline, verify downline re-sponsored
- [ ] Test promotion fund retry: Create BC order, fail credit, verify retry cron picks it up

---

## 🚀 DEPLOYMENT

1. Apply migration: `supabase db push`
2. Deploy edge functions:
   ```bash
   supabase functions deploy stripe-webhook
   supabase functions deploy send-notification
   supabase functions deploy retry-promotion-fund-credits
   ```
3. Set Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set RESEND_API_KEY=re_...
   ```
4. Configure Stripe webhook endpoint in Stripe Dashboard
5. Verify Resend sender domain: `notifications@apexaffinitygroup.com`
6. Set up cron trigger for `retry-promotion-fund-credits` (every 6 hours)
7. Update screens as outlined above
8. Test all 10 fixes in staging environment
9. Deploy to production

---

## 📊 MONITORING

**Key Metrics**:
- Orders created: Check `orders` table count per day
- CAB clawbacks: Monitor `cab_clawback_queue` status distribution
- Renewal rates: Track `subscription_renewals` success rate
- Active reps: Count reps with $50+ personal BV per month
- Commission runs: Track 7-phase completion time
- Notification delivery: Monitor Resend delivery rates
- BV snapshots: Check `bv_snapshot_runs` completion status
- Carry forward amounts: Track `commission_run_rep_totals.carry_forward_out`
- Terminations: Count terminated reps and affected downline
- Promotion fund: Monitor `promotion_fund_ledger` balance growth

**Alerts**:
- Stripe webhook failures (check Supabase logs)
- Order creation failures (missing metadata)
- CAB clawback not processed within 60-day window
- Renewal rate drops below 60% (Retention Bonus warning)
- Active rep count drops >10% month-over-month
- Commission run phase failures
- Email delivery failures (check Resend dashboard)
- BV snapshot failures (check audit_log)
- Carry forward amount >$100 per rep (unusually high)
- Termination function errors
- Promotion fund balance < $100 (insufficient for payouts)
- Retry cron job failures (>5 consecutive failures)

---

## 🔗 DEPENDENCIES

**This guide depends on**:
- `INTEGRATION-GUIDE-DEPENDENCY-FIXES.md` (FIX 1-5) must be completed first
- Migration `20260311000003_dependency_connections.sql` applied
- Edge function `snapshot-monthly-bv` deployed
- Tables: `bv_snapshots`, `promotion_fund_ledger`, `org_bv_cache` exist

**This guide provides**:
- Tables: `orders`, `cab_clawback_queue`, `subscription_renewals`, `commission_run_rep_totals`, `bv_snapshot_runs`
- Functions: `calculate_renewal_rate()`, `is_rep_active()`, `get_carry_forward()`, `handle_termination()`
- Edge functions: `stripe-webhook`, `send-notification`, `retry-promotion-fund-credits`
- Complete order-to-commission workflow
- Complete notification delivery system
- 7-phase commission run infrastructure
