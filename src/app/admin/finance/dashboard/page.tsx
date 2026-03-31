// =============================================
// Admin Financial Dashboard
// Real-time transaction monitoring and preliminary commission payouts
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import FinanceDashboardClient from './FinanceDashboardClient';

export const metadata = {
  title: 'Financial Dashboard — Apex Admin',
  description: 'Real-time transaction monitoring and commission payouts',
};

interface TransactionData {
  id: string;
  order_number: string;
  order_type: 'member' | 'retail' | 'business_center';
  gross_amount_cents: number;
  bv_amount: number;
  status: string;
  rep_id: string;
  created_at: string;
  distributor?: {
    first_name: string;
    last_name: string;
    slug: string;
  };
}

interface CommissionRun {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  total_sales_cents: number;
  total_commissions_cents: number;
  breakage_pool_cents: number;
  created_at: string;
}

interface DistributorPayout {
  distributor_id: string;
  first_name: string;
  last_name: string;
  tech_rank: string;
  personal_bv_monthly: number;
  team_bv_monthly: number;
  estimated_commission: number;
  override_qualified: boolean;
}

export default async function FinanceDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch recent transactions (last 100)
  const { data: rawTransactions } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_type,
      gross_amount_cents,
      bv_amount,
      status,
      rep_id,
      created_at,
      distributor:distributors!orders_rep_id_fkey (
        first_name,
        last_name,
        slug
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Transform transactions to proper type (distributor is an array from Supabase join)
  const transactions = (rawTransactions || []).map(t => ({
    ...t,
    distributor: Array.isArray(t.distributor) ? t.distributor[0] : t.distributor,
  }));

  // Fetch commission runs history
  const { data: commissionRuns } = await supabase
    .from('commission_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('gross_amount_cents, bv_amount')
    .gte('created_at', today)
    .eq('status', 'complete');

  const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.gross_amount_cents || 0), 0) || 0;
  const todayBV = todayOrders?.reduce((sum, o) => sum + (o.bv_amount || 0), 0) || 0;

  // Calculate week stats (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('gross_amount_cents, bv_amount')
    .gte('created_at', weekAgo.toISOString())
    .eq('status', 'complete');

  const weekRevenue = weekOrders?.reduce((sum, o) => sum + (o.gross_amount_cents || 0), 0) || 0;
  const weekBV = weekOrders?.reduce((sum, o) => sum + (o.bv_amount || 0), 0) || 0;

  // Calculate month stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('gross_amount_cents, bv_amount')
    .gte('created_at', monthStart.toISOString())
    .eq('status', 'complete');

  const monthRevenue = monthOrders?.reduce((sum, o) => sum + (o.gross_amount_cents || 0), 0) || 0;
  const monthBV = monthOrders?.reduce((sum, o) => sum + (o.bv_amount || 0), 0) || 0;

  // Count active distributors (at least one order this month)
  const { data: activeDistributors } = await supabase
    .from('orders')
    .select('rep_id')
    .gte('created_at', monthStart.toISOString())
    .eq('status', 'complete');

  const uniqueDistributors = new Set(activeDistributors?.map(o => o.rep_id) || []).size;

  // Get distributors with BV data for preliminary commission calculations
  const { data: distributorsWithBV } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      member:members!members_distributor_id_fkey (
        tech_rank,
        personal_bv_monthly,
        team_bv_monthly,
        personal_qv_monthly,
        override_qualified
      )
    `)
    .not('member', 'is', null)
    .order('member(personal_bv_monthly)', { ascending: false })
    .limit(50);

  // Calculate preliminary commissions for top distributors
  const distributorPayouts: DistributorPayout[] = (distributorsWithBV || [])
    .map(d => {
      const member = Array.isArray(d.member) ? d.member[0] : d.member;
      if (!member) return null;

      // Estimate commission: 60% of personal BV (seller commission)
      // This is preliminary - actual calculation is more complex
      const personalBV = member.personal_bv_monthly || 0;
      const estimatedCommission = personalBV * 0.6;

      return {
        distributor_id: d.id,
        first_name: d.first_name,
        last_name: d.last_name,
        tech_rank: member.tech_rank || 'starter',
        personal_bv_monthly: personalBV,
        team_bv_monthly: member.team_bv_monthly || 0,
        estimated_commission: estimatedCommission,
        override_qualified: member.override_qualified || false,
      };
    })
    .filter((d): d is DistributorPayout => d !== null && d.personal_bv_monthly > 0);

  const stats = {
    today: {
      revenue: todayRevenue,
      bv: todayBV,
      count: todayOrders?.length || 0,
    },
    week: {
      revenue: weekRevenue,
      bv: weekBV,
      count: weekOrders?.length || 0,
    },
    month: {
      revenue: monthRevenue,
      bv: monthBV,
      count: monthOrders?.length || 0,
    },
    activeDistributors: uniqueDistributors,
  };

  return (
    <FinanceDashboardClient
      initialTransactions={transactions as TransactionData[]}
      initialStats={stats}
      commissionRuns={(commissionRuns || []) as CommissionRun[]}
      distributorPayouts={distributorPayouts}
    />
  );
}
