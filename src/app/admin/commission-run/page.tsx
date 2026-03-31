'use client';

/**
 * ADMIN COMMISSION RUN PAGE
 *
 * Admin interface for managing monthly commission runs.
 *
 * Features:
 * - View all past commission runs
 * - Manual trigger for commission calculation
 * - Run details and totals
 * - Export commission report as CSV
 * - Dry run mode for testing
 *
 * @module app/admin/commission-run
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// =============================================
// TYPES
// =============================================

interface CommissionRun {
  run_id: string;
  month: string;
  run_date: string;
  transactions_processed: number;
  total_sales_amount: number;
  total_commissions: number;
  breakage_amount: number;
  distributors_paid: number;
  status: 'pending' | 'completed' | 'failed';
}

// =============================================
// MAIN COMPONENT
// =============================================

export default function CommissionRunPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<CommissionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dryRun, setDryRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i - 1); // Previous month and before
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  useEffect(() => {
    // Set default month to previous month
    if (monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0]);
    }
  }, []);

  // Fetch commission runs (Note: This would need a GET endpoint)
  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        // TODO: Implement GET /api/admin/commission-run/list endpoint
        // For now, we'll use mock data
        setRuns([]);
      } catch (err) {
        console.error('Failed to fetch commission runs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, []);

  // Execute commission run
  const handleExecuteRun = async () => {
    if (!selectedMonth) {
      setError('Please select a month');
      return;
    }

    setExecuting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/commission-run/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: selectedMonth,
          dryRun,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute commission run');
      }

      setSuccess(
        dryRun
          ? `Dry run completed successfully! Would process ${data.totals.transactions_processed} transactions for ${data.totals.distributors_paid} distributors.`
          : `Commission run completed! Processed ${data.totals.transactions_processed} transactions for ${data.totals.distributors_paid} distributors.`
      );

      // Refresh runs list
      // TODO: Implement fetchRuns() again

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Runs</h1>
          <p className="mt-2 text-gray-600">
            Manage monthly commission calculations and payouts
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Execute Commission Run Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Run Commission Calculation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                disabled={executing}
              >
                <option value="">Select month...</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {new Date(`${month}-01`).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Dry Run Toggle */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={executing}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Dry Run (test mode, no database writes)
                </span>
              </label>
            </div>

            {/* Execute Button */}
            <div className="flex items-end">
              <button
                onClick={handleExecuteRun}
                disabled={executing || !selectedMonth}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {executing ? 'Running...' : dryRun ? 'Run Test' : 'Execute Run'}
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Running a commission calculation will process all
              transactions for the selected month and create commission entries. This action
              cannot be undone. Use dry run mode to test first.
            </p>
          </div>
        </div>

        {/* Commission Runs History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Commission Run History
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No commission runs yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Execute your first commission run above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Run Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Commissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distributors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runs.map((run) => (
                    <tr key={run.run_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(`${run.month}-01`).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(run.run_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.transactions_processed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${run.total_commissions.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {run.distributors_paid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            run.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : run.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => router.push(`/admin/commission-run/${run.run_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500">Total Runs</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{runs.length}</div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500">Latest Run</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {runs.length > 0 ? runs[0].month : '—'}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500">Total Paid (All Time)</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              ${runs.reduce((sum, run) => sum + run.total_commissions, 0).toFixed(2)}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500">Avg Per Run</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              $
              {runs.length > 0
                ? (runs.reduce((sum, run) => sum + run.total_commissions, 0) / runs.length).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
