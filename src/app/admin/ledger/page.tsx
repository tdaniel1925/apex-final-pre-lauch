'use client';

/**
 * Admin Transaction Ledger
 * Comprehensive view of all transactions with compensation plan metrics
 *
 * Shows:
 * - BV (Business Volume) - Production credits
 * - PV (Personal Volume) - personal_credits_monthly
 * - GV (Group Volume) - team_credits_monthly
 * - Breakage - Pending commissions not yet qualified
 * - Paid Commissions - Approved/paid from earnings_ledger
 * - Seller and Sponsor information
 */

import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface LedgerRow {
  // Transaction details
  transactionId: string;
  createdAt: string;
  amount: number;
  transactionType: string;
  productSlug: string | null;
  stripePaymentIntentId: string | null;

  // Seller info
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerRepNumber: string;

  // Sponsor info
  sponsorId: string | null;
  sponsorName: string;
  sponsorRepNumber: string | null;

  // BV Metrics
  bv: number;
  pv: number;
  gv: number;

  // Rank
  techRank: string;
  insuranceRank: string;

  // Purchase type
  isPersonalPurchase: boolean | null;
  customerName?: string;
  customerEmail?: string;

  // Commission metrics
  breakage: number;
  disqualified: number;
  paidCommissions: number;

  // Metadata
  metadata: any;
}

interface LedgerResponse {
  ledgerData: LedgerRow[];
  totalCount: number;
  page: number;
  limit: number;
  summary: {
    totalBV: number;
    totalBreakage: number;
    totalPaid: number;
    totalSales: number;
    transactionCount: number;
  };
}

interface FilterState {
  dateRange: '7' | '30' | '90' | 'all';
  productSlug: string;
  transactionType: string;
  search: string;
}

export default function AdminLedgerPage() {
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState({
    totalBV: 0,
    totalBreakage: 0,
    totalPaid: 0,
    totalSales: 0,
    transactionCount: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30',
    productSlug: '',
    transactionType: '',
    search: '',
  });

  const ITEMS_PER_PAGE = 50;

  // Fetch ledger data
  const fetchLedgerData = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        dateRange: filters.dateRange,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (filters.productSlug) params.append('productSlug', filters.productSlug);
      if (filters.transactionType) params.append('transactionType', filters.transactionType);

      const response = await fetch(`/api/admin/ledger?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ledger data');
      }

      const data: LedgerResponse = await response.json();

      // Client-side search filter (for seller name/email)
      let filteredData = data.ledgerData;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = data.ledgerData.filter((row) => {
          const sellerName = row.sellerName.toLowerCase();
          const sellerEmail = row.sellerEmail?.toLowerCase() || '';
          const sponsorName = row.sponsorName.toLowerCase();
          return (
            sellerName.includes(searchLower) ||
            sellerEmail.includes(searchLower) ||
            sponsorName.includes(searchLower)
          );
        });
      }

      setLedgerData(filteredData);
      setTotalCount(data.totalCount);
      setSummary(data.summary);
    } catch (error) {
      // Error fetching ledger data - set empty state
      setLedgerData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchLedgerData();
  }, [currentPage, filters.dateRange, filters.productSlug, filters.transactionType]);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (filters.search !== '') {
        fetchLedgerData();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Date',
      'Seller Name',
      'Seller Rep #',
      'Sponsor Name',
      'Sponsor Rep #',
      'Product',
      'Sale Amount',
      'BV',
      'PV',
      'GV',
      'Tech Rank',
      'Breakage (Pending)',
      'Disqualified',
      'Paid Commissions',
      'Purchase Type',
      'Customer',
      'Transaction Type',
    ];

    const rows = ledgerData.map((row) => [
      new Date(row.createdAt).toLocaleString(),
      row.sellerName,
      row.sellerRepNumber,
      row.sponsorName,
      row.sponsorRepNumber || 'N/A',
      row.productSlug || 'N/A',
      `$${row.amount.toFixed(2)}`,
      row.bv,
      row.pv,
      row.gv,
      row.techRank,
      `$${row.breakage.toFixed(2)}`,
      `$${row.disqualified.toFixed(2)}`,
      `$${row.paidCommissions.toFixed(2)}`,
      row.isPersonalPurchase === true ? 'Personal' : row.isPersonalPurchase === false ? 'Retail' : 'N/A',
      row.customerName || 'N/A',
      row.transactionType,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Ledger</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive view of all transactions with compensation plan metrics
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${summary.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{summary.transactionCount} transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total BV</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">{summary.totalBV.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Production credits</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Breakage (Pending)</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              ${summary.totalBreakage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Estimated commissions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Paid Commissions</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ${summary.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Approved & paid</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Commission %</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {summary.totalSales > 0
                ? ((summary.totalPaid / summary.totalSales) * 100).toFixed(1)
                : '0.0'}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">Paid / sales</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                value={filters.productSlug}
                onChange={(e) => setFilters({ ...filters, productSlug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All products</option>
                <option value="pulseguard">PulseGuard</option>
                <option value="pulseflow">PulseFlow</option>
                <option value="pulsedrive">PulseDrive</option>
                <option value="pulsecommand">PulseCommand</option>
                <option value="business-center">Business Center</option>
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All types</option>
                <option value="product_sale">Product Sale</option>
                <option value="subscription_payment">Subscription Payment</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Seller or sponsor name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={fetchLedgerData}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sponsor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sale $
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    BV
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    PV
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    GV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Breakage
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      Loading ledger data...
                    </td>
                  </tr>
                ) : ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  ledgerData.map((row) => (
                    <tr key={row.transactionId} className="hover:bg-gray-50">
                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(row.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </td>

                      {/* Seller */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{row.sellerName}</div>
                        <div className="text-xs text-gray-500">#{row.sellerRepNumber}</div>
                      </td>

                      {/* Sponsor */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{row.sponsorName}</div>
                        <div className="text-xs text-gray-500">
                          {row.sponsorRepNumber ? `#${row.sponsorRepNumber}` : 'None'}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{row.productSlug || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {row.isPersonalPurchase === true
                            ? 'Personal'
                            : row.isPersonalPurchase === false
                            ? 'Retail'
                            : '—'}
                        </div>
                      </td>

                      {/* Sale Amount */}
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${row.amount.toFixed(2)}
                      </td>

                      {/* BV */}
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600">
                        {row.bv}
                      </td>

                      {/* PV */}
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {row.pv}
                      </td>

                      {/* GV */}
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {row.gv.toLocaleString()}
                      </td>

                      {/* Rank */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="text-gray-900 capitalize">{row.techRank.replace('_', ' ')}</div>
                        </div>
                      </td>

                      {/* Breakage (Pending) */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {row.breakage > 0 ? (
                          <span className="text-sm font-medium text-yellow-600">
                            ${row.breakage.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Paid Commissions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {row.paidCommissions > 0 ? (
                          <span className="text-sm font-medium text-green-600">
                            ${row.paidCommissions.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
