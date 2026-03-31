'use client';

// =============================================
// Admin Transaction Feed
// Real-time transaction monitoring dashboard
// =============================================

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Download } from 'lucide-react';

interface Transaction {
  id: string;
  distributor_id: string;
  transaction_type: 'product_sale' | 'subscription_payment' | 'commission_payment' | 'refund';
  amount: number;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  product_slug: string | null;
  metadata: Record<string, any>;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  distributor: {
    first_name: string;
    last_name: string;
    email: string;
    slug: string;
  } | null;
}

interface FilterState {
  dateRange: '7' | '30' | '90' | 'all';
  transactionType: 'all' | 'product_sale' | 'subscription_payment' | 'commission_payment' | 'refund';
  status: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  search: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30',
    transactionType: 'all',
    status: 'all',
    search: '',
  });

  // Summary stats
  const [todayStats, setTodayStats] = useState({ count: 0, total: 0 });
  const [monthStats, setMonthStats] = useState({ count: 0, total: 0 });

  const ITEMS_PER_PAGE = 50;

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('transactions')
        .select(
          `
          *,
          distributor:distributors(first_name, last_name, email, slug)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      // Apply date filter
      if (filters.dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      // Apply transaction type filter
      if (filters.transactionType !== 'all') {
        query = query.eq('transaction_type', filters.transactionType);
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply search filter (distributor name/email)
      if (filters.search) {
        // Note: This is a simple client-side filter. For production, use Postgres full-text search
        const allData = await query;
        const filtered = allData.data?.filter((t) => {
          const name = `${t.distributor?.first_name} ${t.distributor?.last_name}`.toLowerCase();
          const email = t.distributor?.email?.toLowerCase() || '';
          const searchLower = filters.search.toLowerCase();
          return name.includes(searchLower) || email.includes(searchLower);
        });
        setTransactions(filtered || []);
        setTotalCount(filtered?.length || 0);
        setLoading(false);
        return;
      }

      // Pagination
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
      setTotalCount(count || 0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary stats
  const fetchStats = async () => {
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    const todayCount = todayData?.length || 0;
    const todayTotal = todayData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setTodayStats({ count: todayCount, total: todayTotal });

    // Month's stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: monthData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString());

    const monthCount = monthData?.length || 0;
    const monthTotal = monthData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setMonthStats({ count: monthCount, total: monthTotal });
  };

  // Initial load
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [currentPage, filters]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          // Refresh data when new transaction added
          fetchTransactions();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, currentPage]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Date',
      'Distributor Name',
      'Distributor Email',
      'Type',
      'Amount',
      'Status',
      'Product',
      'Stripe Payment Intent',
      'Stripe Subscription',
    ];

    const rows = transactions.map((t) => [
      new Date(t.created_at).toLocaleString(),
      `${t.distributor?.first_name || ''} ${t.distributor?.last_name || ''}`,
      t.distributor?.email || '',
      t.transaction_type,
      t.amount,
      t.status,
      t.product_slug || '',
      t.stripe_payment_intent_id || '',
      t.stripe_subscription_id || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Feed</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of all financial transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Transactions Today</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{todayStats.count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${todayStats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Transactions This Month</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{monthStats.count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total This Month</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${monthStats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
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
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) =>
                  setFilters({ ...filters, transactionType: e.target.value as FilterState['transactionType'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All types</option>
                <option value="product_sale">Product Sale</option>
                <option value="subscription_payment">Subscription Payment</option>
                <option value="commission_payment">Commission Payment</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterState['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Distributor</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Stripe ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.distributor
                            ? `${transaction.distributor.first_name} ${transaction.distributor.last_name}`
                            : 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.distributor?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.transaction_type === 'product_sale'
                              ? 'bg-blue-100 text-blue-800'
                              : transaction.transaction_type === 'subscription_payment'
                              ? 'bg-purple-100 text-purple-800'
                              : transaction.transaction_type === 'commission_payment'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.transaction_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                          ${Math.abs(transaction.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.product_slug || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.stripe_payment_intent_id ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {transaction.stripe_payment_intent_id.slice(0, 20)}...
                          </code>
                        ) : (
                          'N/A'
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
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                    </span>{' '}
                    of <span className="font-medium">{totalCount}</span> results
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
