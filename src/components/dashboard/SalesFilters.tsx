'use client';

// =============================================
// Sales Filters Component
// Client component for filtering sales and commissions data
// =============================================

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface SalesFiltersProps {
  dateRange: string;
  productType: string;
  status: string;
  filterType?: 'sales' | 'commissions';
}

export default function SalesFilters({
  dateRange,
  productType,
  status,
  filterType = 'sales',
}: SalesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [selectedProductType, setSelectedProductType] = useState(productType);
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [showFilters, setShowFilters] = useState(false);

  // Update state when props change
  useEffect(() => {
    setSelectedDateRange(dateRange);
    setSelectedProductType(productType);
    setSelectedStatus(status);
  }, [dateRange, productType, status]);

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedDateRange !== 'all') {
      params.set('dateRange', selectedDateRange);
    } else {
      params.delete('dateRange');
    }

    if (selectedProductType !== 'all') {
      params.set(filterType === 'sales' ? 'product' : 'type', selectedProductType);
    } else {
      params.delete(filterType === 'sales' ? 'product' : 'type');
    }

    if (selectedStatus !== 'all') {
      params.set('status', selectedStatus);
    } else {
      params.delete('status');
    }

    // Reset to page 1
    params.delete('page');

    router.push(`?${params.toString()}`);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedDateRange('all');
    setSelectedProductType('all');
    setSelectedStatus('all');

    router.push(window.location.pathname);
    setShowFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedDateRange !== 'all' || selectedProductType !== 'all' || selectedStatus !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 space-y-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Product/Commission Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {filterType === 'sales' ? 'Product Type' : 'Commission Type'}
            </label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {filterType === 'sales' ? (
                <>
                  <option value="pulsemarket">PulseMarket</option>
                  <option value="pulseflow">PulseFlow</option>
                  <option value="pulsedrive">PulseDrive</option>
                  <option value="pulsecommand">PulseCommand</option>
                </>
              ) : (
                <>
                  <option value="retail">Retail Commission</option>
                  <option value="matrix_l1">Level 1 Matrix</option>
                  <option value="matrix_l2">Level 2 Matrix</option>
                  <option value="matrix_l3">Level 3 Matrix</option>
                  <option value="matrix_l4">Level 4 Matrix</option>
                  <option value="matrix_l5">Level 5 Matrix</option>
                  <option value="matrix_l6">Level 6 Matrix</option>
                  <option value="matrix_l7">Level 7 Matrix</option>
                  <option value="matching">Matching Bonus</option>
                  <option value="rank_advancement">Rank Bonus</option>
                  <option value="infinity_pool">Infinity Pool</option>
                </>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {filterType === 'sales' ? (
                <>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </>
              ) : (
                <>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="held">Held</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-white text-slate-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
