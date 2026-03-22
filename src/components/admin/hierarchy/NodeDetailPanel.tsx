'use client';

// =============================================
// Node Detail Panel Component
// Slide-out panel showing detailed distributor info
// Based on exported UXMagic design
// =============================================

import { useEffect } from 'react';
import type { Distributor } from '@/lib/types';

interface NodeDetailPanelProps {
  distributor: Distributor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NodeDetailPanel({ distributor, isOpen, onClose }: NodeDetailPanelProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!distributor) return null;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const initials = `${distributor.first_name.charAt(0)}${distributor.last_name.charAt(0)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-30' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: '3px solid #e2e8f0',
                }}
              >
                {distributor.profile_image ? (
                  <img
                    src={distributor.profile_image}
                    alt={`${distributor.first_name} ${distributor.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{initials}</span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {distributor.first_name} {distributor.last_name}
                </h2>
                <p className="text-sm text-slate-600">@{distributor.slug}</p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                distributor.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {distributor.status || 'Active'}
            </span>
          </div>

          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="space-y-3">
              <InfoRow label="Rep Number" value={`#${distributor.rep_number || 'N/A'}`} />
              <InfoRow label="Email" value={distributor.email} />
              <InfoRow label="Phone" value={distributor.phone || 'N/A'} />
              <InfoRow label="Company" value={distributor.company_name || 'N/A'} />
              <InfoRow
                label="Joined"
                value={new Date(distributor.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </div>
          </div>

          {/* Matrix Position Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Matrix Position
            </h3>
            <div className="space-y-3">
              <InfoRow label="Depth Level" value={`Level ${distributor.matrix_depth || 0}`} />
              <InfoRow label="Position" value={`#${distributor.matrix_position || 'N/A'}`} />
            </div>
          </div>

          {/* Business Volume Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Business Volume (Monthly)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">Personal BV</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(distributor.personal_bv_monthly)}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">Group BV</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(distributor.group_bv_monthly)}
                </p>
              </div>
            </div>
          </div>

          {/* Genealogy Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
              Genealogy
            </h3>
            <div className="space-y-2">
              {distributor.sponsor_id && (
                <a
                  href={`/admin/distributors/${distributor.sponsor_id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-sm text-slate-700">View Sponsor</span>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}

              {distributor.matrix_parent_id && (
                <a
                  href={`/admin/distributors/${distributor.matrix_parent_id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-sm text-slate-700">View Matrix Parent</span>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 flex gap-3">
          <a
            href={`/admin/distributors/${distributor.id}`}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center transition-colors"
          >
            View Full Profile
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[200px] truncate">
        {value}
      </span>
    </div>
  );
}
