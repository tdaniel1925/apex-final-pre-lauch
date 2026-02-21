// =============================================
// Admin Payouts Page
// Manage commission payout batches
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { PayoutBatchesTable } from '@/components/admin/PayoutBatchesTable';
import { TriggerCommissionRunButton } from '@/components/admin/TriggerCommissionRunButton';

export const metadata = {
  title: 'Payouts — Apex Admin',
};

async function getPayoutBatches() {
  const supabase = createServiceClient();

  const { data: batches, error } = await supabase
    .from('payout_batches')
    .select(`
      *,
      approved_by_admin:admins!payout_batches_approved_by_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching payout batches:', error);
    return [];
  }

  return batches || [];
}

async function getPayoutStats() {
  const supabase = createServiceClient();

  // Get total pending payouts
  const { data: pendingBatches } = await supabase
    .from('payout_batches')
    .select('total_amount_cents')
    .in('status', ['draft', 'pending_review']);

  const totalPending = pendingBatches?.reduce((sum, b) => sum + (b.total_amount_cents || 0), 0) || 0;

  // Get this month's completed payouts
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data: completedBatches } = await supabase
    .from('payout_batches')
    .select('total_amount_cents')
    .eq('status', 'completed')
    .eq('month_year', currentMonth);

  const totalCompleted = completedBatches?.reduce((sum, b) => sum + (b.total_amount_cents || 0), 0) || 0;

  return {
    totalPending,
    totalCompleted,
  };
}

export default async function PayoutsPage() {
  await requireAdmin();

  const batches = await getPayoutBatches();
  const stats = await getPayoutStats();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Batches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage monthly commission payouts and ACH batches
          </p>
        </div>
        <TriggerCommissionRunButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(stats.totalPending)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Paid This Month</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(stats.totalCompleted)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Batches</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{batches.length}</p>
        </div>
      </div>

      {/* Batches Table */}
      <PayoutBatchesTable batches={batches} />
    </div>
  );
}
