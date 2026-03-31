'use client';

// =============================================
// Commission Detail View Component
// Shows comprehensive commission breakdown
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  Eye,
  User,
  ArrowRight
} from 'lucide-react';
import type { Distributor } from '@/lib/types';
import OverrideChainModal from './OverrideChainModal';
import CommissionBreakdownChart from './CommissionBreakdownChart';

interface CommissionDetailViewProps {
  distributor: Distributor & {
    member?: {
      personal_credits_monthly: number;
      team_credits_monthly: number;
      tech_rank: string | null;
      insurance_rank: string | null;
    };
  };
  currentAdminRole: string;
}

interface Commission {
  id: string;
  distributor_id: string;
  seller_id: string;
  transaction_id: string;
  commission_type: string;
  override_level: number | null;
  amount: number;
  bv_amount: number | null;
  paid: boolean;
  paid_at: string | null;
  payment_method: string | null;
  commission_run_id: string | null;
  commission_month: string | null;
  notes: string | null;
  created_at: string;
  seller?: {
    first_name: string;
    last_name: string;
    email: string;
    slug: string;
  };
  transaction?: {
    id: string;
    product_slug: string;
    amount: number;
  };
}

interface CommissionSummary {
  totalAllTime: number;
  totalThisMonth: number;
  totalPending: number;
  lastPaymentDate: string | null;
}

interface CommissionBreakdown {
  [key: string]: number;
}

const commissionTypeNames: Record<string, string> = {
  seller_commission: 'Seller Commission',
  L1_enrollment: 'Level 1 Enrollment Override',
  L2_matrix: 'Level 2 Matrix Override',
  L3_matrix: 'Level 3 Matrix Override',
  L4_matrix: 'Level 4 Matrix Override',
  L5_matrix: 'Level 5 Matrix Override',
  L6_matrix: 'Level 6 Matrix Override',
  L7_matrix: 'Level 7 Matrix Override',
  rank_bonus: 'Rank Advancement Bonus',
  bonus_pool: 'Bonus Pool Share',
  leadership_pool: 'Leadership Pool Share',
};

export default function CommissionDetailView({
  distributor,
  currentAdminRole,
}: CommissionDetailViewProps) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    totalAllTime: 0,
    totalThisMonth: 0,
    totalPending: 0,
    lastPaymentDate: null,
  });
  const [breakdown, setBreakdown] = useState<CommissionBreakdown>({});
  const [loading, setLoading] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showOverrideChain, setShowOverrideChain] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState<string>('all');
  const [commissionType, setCommissionType] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [commissionMonth, setCommissionMonth] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchCommissions();
  }, [page, dateRange, commissionType, paymentStatus, commissionMonth]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        distributor_id: distributor.id,
        page: page.toString(),
        page_size: pageSize.toString(),
        date_range: dateRange,
        commission_type: commissionType,
        payment_status: paymentStatus,
        commission_month: commissionMonth,
      });

      const res = await fetch(`/api/admin/commissions?${params}`);
      const data = await res.json();

      if (data.success) {
        setCommissions(data.commissions);
        setSummary(data.summary);
        setBreakdown(data.breakdown);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        distributor_id: distributor.id,
        date_range: dateRange,
        commission_type: commissionType,
        payment_status: paymentStatus,
        commission_month: commissionMonth,
        export: 'csv',
      });

      const res = await fetch(`/api/admin/commissions?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commissions-${distributor.slug}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleViewOverrideChain = (commission: Commission) => {
    setSelectedCommission(commission);
    setShowOverrideChain(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/distributors/${distributor.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commission Details</h1>
            <p className="text-sm text-gray-600">
              {distributor.first_name} {distributor.last_name} (@{distributor.slug})
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalThisMonth)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned All Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalAllTime)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Commissions</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Payment Date</p>
              <p className="text-lg font-bold text-gray-900">
                {summary.lastPaymentDate
                  ? formatDate(summary.lastPaymentDate)
                  : 'No payments yet'}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Commission Breakdown Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commission Breakdown</h2>
        <CommissionBreakdownChart breakdown={breakdown} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Type
            </label>
            <select
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="seller_commission">Seller Commission</option>
              <option value="L1_enrollment">L1 Enrollment</option>
              <option value="L2_matrix">L2 Matrix</option>
              <option value="L3_matrix">L3 Matrix</option>
              <option value="L4_matrix">L4 Matrix</option>
              <option value="L5_matrix">L5 Matrix</option>
              <option value="L6_matrix">L6 Matrix</option>
              <option value="L7_matrix">L7 Matrix</option>
              <option value="rank_bonus">Rank Bonus</option>
              <option value="bonus_pool">Bonus Pool</option>
              <option value="leadership_pool">Leadership Pool</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Month
            </label>
            <select
              value={commissionMonth}
              onChange={(e) => setCommissionMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Months</option>
              {/* Dynamic months will be populated from data */}
            </select>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  From (Seller)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  BV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading commissions...
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No commissions found
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(commission.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {commissionTypeNames[commission.commission_type]}
                        </span>
                        {commission.override_level && (
                          <span className="text-xs text-gray-500">
                            Level {commission.override_level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.seller ? (
                        <Link
                          href={`/admin/distributors/${commission.seller_id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <User className="w-4 h-4" />
                          {commission.seller.first_name} {commission.seller.last_name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {commission.bv_amount ? formatCurrency(commission.bv_amount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {commission.paid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {commission.commission_month || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewOverrideChain(commission)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        View Chain
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} commissions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= totalCount}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Override Chain Modal */}
      {selectedCommission && (
        <OverrideChainModal
          isOpen={showOverrideChain}
          onClose={() => setShowOverrideChain(false)}
          commission={selectedCommission}
        />
      )}
    </div>
  );
}
