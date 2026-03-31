'use client';

// =============================================
// Sales Table Component
// Client component for displaying sales with sorting and details modal
// =============================================

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SaleItem {
  id: string;
  order_number: string;
  date: string;
  product: string;
  amount: number;
  customer_email: string;
  status: string;
  bv_amount: number;
  items?: any[];
}

interface SalesTableProps {
  sales: SaleItem[];
  currentPage: number;
  totalPages: number;
}

export default function SalesTable({ sales, currentPage, totalPages }: SalesTableProps) {
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);
  const [sortField, setSortField] = useState<keyof SaleItem>('date');
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
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partial_refund: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Sort function
  const handleSort = (field: keyof SaleItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort sales
  const sortedSales = [...sales].sort((a, b) => {
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
  if (sales.length === 0) {
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No sales yet</h3>
        <p className="text-slate-600 mb-4">
          Your sales transactions will appear here once you start making sales.
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
                onClick={() => handleSort('order_number')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Order #
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th
                onClick={() => handleSort('bv_amount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                BV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => setSelectedSale(sale)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {sale.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(sale.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {sale.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  {formatCurrency(sale.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {sale.customer_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {sale.bv_amount} BV
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sale.status)}</td>
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
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900">Sale Details</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Order Number</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedSale.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(selectedSale.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedSale.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Customer</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedSale.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedSale.items && selectedSale.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedSale.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(item.total_price_cents / 100)}
                          </p>
                          <p className="text-xs text-slate-600">{item.bv_amount} BV</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(selectedSale.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total BV</span>
                  <span className="text-lg font-bold text-slate-900">{selectedSale.bv_amount} BV</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
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
