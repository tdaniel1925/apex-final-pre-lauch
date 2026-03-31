'use client';

// =============================================
// Commissions Table Component
// Client component for displaying commissions with sorting and details modal
// =============================================

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Commission {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  month_year?: string;
  from?: string | null;
}

interface CommissionsTableProps {
  commissions: Commission[];
  currentPage: number;
  totalPages: number;
  typeNames: Record<string, string>;
}

export default function CommissionsTable({
  commissions,
  currentPage,
  totalPages,
  typeNames,
}: CommissionsTableProps) {
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [sortField, setSortField] = useState<keyof Commission>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      held: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  // Get commission type display name
  const getTypeName = (type: string) => {
    return typeNames[type] || type;
  };

  // Sort function
  const handleSort = (field: keyof Commission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort commissions
  const sortedCommissions = [...commissions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1; // null values go to the end
    if (bValue == null) return -1; // null values go to the end

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Empty state
  if (commissions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No commissions yet</h3>
        <p className="text-slate-600 mb-4">
          Your commission earnings will appear here once you start generating sales and building your team.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date
              </th>
              <th
                onClick={() => handleSort('type')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Type
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCommissions.map((commission) => (
              <tr
                key={commission.id}
                onClick={() => setSelectedCommission(commission)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(commission.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {getTypeName(commission.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {formatCurrency(commission.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {commission.from || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(commission.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {commission.month_year || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Link
              href={`?page=${currentPage - 1}`}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-300'
              }`}
              aria-disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href={`?page=${currentPage + 1}`}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-300'
              }`}
              aria-disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900">Commission Details</h2>
              <button
                onClick={() => setSelectedCommission(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Commission Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Commission Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {getTypeName(selectedCommission.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(selectedCommission.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedCommission.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Commission Month</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedCommission.month_year || 'N/A'}
                    </p>
                  </div>
                  {selectedCommission.from && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">From</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedCommission.from}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Commission Amount</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatCurrency(selectedCommission.amount)}
                  </span>
                </div>
              </div>

              {/* Description based on type */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">About This Commission</h4>
                <p className="text-sm text-slate-600">
                  {selectedCommission.type.includes('matrix') &&
                    `This commission was earned from your matrix organization at ${getTypeName(selectedCommission.type)}.`}
                  {selectedCommission.type === 'retail' &&
                    'This is a retail commission from a customer purchase.'}
                  {selectedCommission.type === 'rank_advancement' &&
                    `This is a rank advancement bonus for achieving ${selectedCommission.from} rank.`}
                  {selectedCommission.type === 'matching' &&
                    'This is a matching bonus from your personally sponsored team members.'}
                  {selectedCommission.type === 'infinity_pool' &&
                    'This is your share of the company-wide Infinity Pool (3% of total BV).'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedCommission(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
