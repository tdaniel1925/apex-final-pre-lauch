'use client';

import { useState } from 'react';

/**
 * Terminology Legend - Quick reference for user types
 *
 * Add this to admin dashboard for clarity on terminology
 */
export default function TerminologyLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>User Types</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Legend Card */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              User Type Definitions
            </h3>

            {/* Enrollee */}
            <div className="mb-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Enrollee
                </span>
                <span className="text-xs text-slate-500">In Comp Plan</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Participates in compensation plan, has back office access, can recruit others and earn commissions.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <strong>Database:</strong> Has distributor_id (not NULL)
              </p>
            </div>

            {/* Customer */}
            <div className="mb-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Customer
                </span>
                <span className="text-xs text-slate-500">Product Only</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Product subscriber only. No back office, no recruiting, no commissions. Can upgrade to enrollee.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <strong>Database:</strong> No distributor_id (NULL)
              </p>
            </div>

            {/* Admin */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Admin
                </span>
                <span className="text-xs text-slate-500">System Access</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                System administrator with full admin panel access. Can manage all users and system settings.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <strong>Database:</strong> role = 'admin'
              </p>
            </div>

            {/* Quick Stats Example */}
            <div className="bg-slate-50 rounded-lg p-3 mt-3">
              <p className="text-xs font-semibold text-slate-700 mb-2">Example Breakdown:</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Total Enrollees:</span>
                  <span className="font-semibold text-blue-600">250</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Total Customers:</span>
                  <span className="font-semibold text-green-600">75</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-1">
                  <span className="text-slate-700 font-medium">Total Users:</span>
                  <span className="font-bold text-slate-900">325</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
              <strong>Note:</strong> All enrollees are also customers (they have product access). Not all customers are enrollees.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
