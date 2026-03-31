'use client';

// =============================================
// Finance Dashboard Client Component
// Real-time updates, filtering, and export functionality
// =============================================

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/format';

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

interface Stats {
  today: { revenue: number; bv: number; count: number };
  week: { revenue: number; bv: number; count: number };
  month: { revenue: number; bv: number; count: number };
  activeDistributors: number;
}

interface Props {
  initialTransactions: TransactionData[];
  initialStats: Stats;
  commissionRuns: CommissionRun[];
  distributorPayouts: DistributorPayout[];
}

export default function FinanceDashboardClient({
  initialTransactions,
  initialStats,
  commissionRuns,
  distributorPayouts,
}: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [stats, setStats] = useState(initialStats);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'bv'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Subscribe to real-time transaction updates
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('finance-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('New transaction:', payload);
          // Add new transaction to the list
          setTransactions((prev) => [payload.new as TransactionData, ...prev]);
          // Update stats
          if (payload.new.status === 'complete') {
            setStats((prev) => ({
              ...prev,
              today: {
                revenue: prev.today.revenue + (payload.new.gross_amount_cents || 0),
                bv: prev.today.bv + (payload.new.bv_amount || 0),
                count: prev.today.count + 1,
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.order_type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Search by order number or distributor name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.order_number.toLowerCase().includes(term) ||
          `${t.distributor?.first_name} ${t.distributor?.last_name}`.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.gross_amount_cents - b.gross_amount_cents;
      } else if (sortBy === 'bv') {
        comparison = a.bv_amount - b.bv_amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, filterStatus, searchTerm, sortBy, sortOrder]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order Number', 'Date', 'Type', 'Distributor', 'Amount', 'BV', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.order_number,
      new Date(t.created_at).toLocaleString(),
      t.order_type,
      `${t.distributor?.first_name || ''} ${t.distributor?.last_name || ''}`.trim(),
      formatCurrency(t.gross_amount_cents / 100),
      t.bv_amount.toFixed(2),
      t.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate waterfall breakdown for stats
  const calculateWaterfall = (revenue: number) => {
    // Based on 7-level spec waterfall
    const botmakersFee = revenue * 0.3;
    const adjustedGross = revenue - botmakersFee;
    const apexTake = adjustedGross * 0.3;
    const remainder = adjustedGross - apexTake;
    const bonusPool = remainder * 0.035;
    const leadershipPool = remainder * 0.015;
    const commissionPool = remainder - bonusPool - leadershipPool;
    const overridePool = commissionPool * 0.4;

    return {
      botmakersFee,
      apexTake,
      bonusPool,
      leadershipPool,
      commissionPool,
      overridePool,
    };
  };

  const monthWaterfall = calculateWaterfall(stats.month.revenue / 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Financial Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time transaction monitoring and commission tracking
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Today</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(stats.today.revenue / 100)}
            </div>
            <div className="text-xs text-slate-500">
              {stats.today.count} orders • {stats.today.bv.toFixed(0)} BV
            </div>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">This Week</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(stats.week.revenue / 100)}
            </div>
            <div className="text-xs text-slate-500">
              {stats.week.count} orders • {stats.week.bv.toFixed(0)} BV
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">This Month</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatCurrency(stats.month.revenue / 100)}
            </div>
            <div className="text-xs text-slate-500">
              {stats.month.count} orders • {stats.month.bv.toFixed(0)} BV
            </div>
          </div>

          {/* Active Distributors */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Active Distributors</h3>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {stats.activeDistributors}
            </div>
            <div className="text-xs text-slate-500">With sales this month</div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waterfall Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Revenue Breakdown (Month)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Revenue</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(stats.month.revenue / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">BotMakers Fee (30%)</span>
                <span className="text-sm font-semibold text-slate-700">
                  -{formatCurrency(monthWaterfall.botmakersFee)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Apex Take (30% of adj.)</span>
                <span className="text-sm font-semibold text-slate-700">
                  -{formatCurrency(monthWaterfall.apexTake)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Bonus Pool (3.5%)</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(monthWaterfall.bonusPool)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Leadership Pool (1.5%)</span>
                <span className="text-sm font-semibold text-purple-600">
                  {formatCurrency(monthWaterfall.leadershipPool)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 bg-slate-50 rounded-lg px-3">
                <span className="text-sm font-semibold text-slate-900">Commission Pool</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(monthWaterfall.commissionPool)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 pl-6">
                <span className="text-xs text-slate-500">Override Pool (40%)</span>
                <span className="text-xs text-slate-600">
                  {formatCurrency(monthWaterfall.overridePool)}
                </span>
              </div>
            </div>
          </div>

          {/* Commission Run Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Commission Run Status
            </h3>
            {commissionRuns.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Last Run</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      commissionRuns[0].status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      commissionRuns[0].status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {commissionRuns[0].status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    {new Date(commissionRuns[0].period_start).toLocaleDateString()} - {new Date(commissionRuns[0].period_end).toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Total Sales</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency((commissionRuns[0].total_sales_cents || 0) / 100)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Commissions</div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency((commissionRuns[0].total_commissions_cents || 0) / 100)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Runs</h4>
                  <div className="space-y-2">
                    {commissionRuns.slice(1, 4).map((run) => (
                      <div key={run.id} className="flex items-center justify-between py-2 text-xs">
                        <span className="text-slate-600">
                          {new Date(run.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency((run.total_commissions_cents || 0) / 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">No commission runs yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Preliminary Commission Payouts */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Preliminary Commission Payouts
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Month-to-date estimates (not finalized)
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Pending</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(
                    distributorPayouts.reduce((sum, d) => sum + d.estimated_commission, 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Personal BV
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Team BV
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Est. Commission
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Qualified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributorPayouts.slice(0, 20).map((payout) => (
                  <tr key={payout.distributor_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {payout.first_name} {payout.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                        {payout.tech_rank.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-mono">
                      ${payout.personal_bv_monthly.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                      ${payout.team_bv_monthly.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right font-mono font-semibold">
                      {formatCurrency(payout.estimated_commission)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payout.override_qualified ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-100 rounded-full">
                          <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Feed */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Real-Time Transaction Feed
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="member">Member</option>
                <option value="retail">Retail</option>
                <option value="business_center">Business Center</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'bv')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="bv">Sort by BV</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <div className="ml-auto text-sm text-slate-500">
                {filteredTransactions.length} transactions
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    BV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-mono">
                      {transaction.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(transaction.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        transaction.order_type === 'retail' ? 'bg-purple-100 text-purple-700' :
                        transaction.order_type === 'business_center' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.order_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {transaction.distributor ? (
                        `${transaction.distributor.first_name} ${transaction.distributor.last_name}`
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right font-mono">
                      {formatCurrency(transaction.gross_amount_cents / 100)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                      {transaction.bv_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        transaction.status === 'complete' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        transaction.status === 'refunded' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
