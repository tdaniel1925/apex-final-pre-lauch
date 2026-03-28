'use client';

// =============================================
// Matrix Node Component
// Individual distributor node in hierarchy tree
// Based on exported UXMagic design
// =============================================

import { useState } from 'react';

// Simplified distributor type for node display
interface DistributorNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status?: string;
  profile_image?: string | null;
  profile_photo_url?: string | null;

  // ⚠️ CACHED FIELDS - Display only, may be stale
  // For live BV data, JOIN with members table:
  // members.personal_credits_monthly, members.team_credits_monthly
  /** @deprecated Display only - cached/stale, use members.personal_credits_monthly for live data */
  personal_bv_monthly?: number | null;
  /** @deprecated Display only - cached/stale, use members.team_credits_monthly for live data */
  group_bv_monthly?: number | null;

  created_at: string;
}

interface MatrixNodeProps {
  distributor: DistributorNode;
  tier?: 'national' | 'regional' | 'district' | 'field';
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
  collapsedRepCount?: number;
}

export default function MatrixNode({
  distributor,
  tier = 'field',
  isSelected = false,
  isDimmed = false,
  onClick,
  collapsedRepCount = 0,
}: MatrixNodeProps) {
  // Tier colors matching the design
  const tierColors = {
    national: {
      border: '#fce7f3',
      badge: '#db2777',
      bg: '#fdf2f8',
    },
    regional: {
      border: '#3b82f6',
      badge: '#3b82f6',
      bg: '#eff6ff',
    },
    district: {
      border: '#93c5fd',
      badge: '#3b82f6',
      bg: '#f0f9ff',
    },
    field: {
      border: '#e2e8f0',
      badge: '#64748b',
      bg: '#f8fafc',
    },
  };

  const colors = tierColors[tier];

  // Get initials for avatar
  const initials = `${distributor.first_name.charAt(0)}${distributor.last_name.charAt(0)}`;

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div
      onClick={onClick}
      className={`node-card bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-blue-500 shadow-blue-200 shadow-md ring-2 ring-blue-200' : ''
      } ${isDimmed ? 'opacity-60' : ''}`}
      style={{
        borderColor: isSelected ? '#3b82f6' : colors.border,
      }}
    >
      <div className="px-3 py-2.5">
        {/* Header: Avatar + Name */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-shrink-0">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-white"
              style={{
                border: `2px solid ${colors.border}`,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              {(distributor.profile_image || distributor.profile_photo_url) ? (
                <img
                  src={(distributor.profile_image || distributor.profile_photo_url) as string}
                  alt={`${distributor.first_name} ${distributor.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs">{initials}</span>
              )}
            </div>

            {/* Online status dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ background: '#10b981' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-slate-900 font-semibold text-xs truncate">
              {distributor.first_name} {distributor.last_name}
            </div>
            <div
              className="font-mono text-xs truncate"
              style={{ color: colors.badge, fontSize: '0.6rem' }}
            >
              #{distributor.rep_number || distributor.slug}
            </div>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
            </div>
          )}
        </div>

        {/* Rank Badge */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: colors.badge, fontSize: '0.58rem' }}
          >
            {tier === 'national' && 'National Director'}
            {tier === 'regional' && 'Regional Manager'}
            {tier === 'district' && 'District Manager'}
            {tier === 'field' && 'Field Rep'}
          </span>

          {collapsedRepCount > 0 && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              {collapsedRepCount.toLocaleString()} reps
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1">
          <div
            style={{
              background: colors.bg,
              borderRadius: '4px',
              padding: '3px 6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="font-mono text-slate-800 font-bold" style={{ fontSize: '0.65rem' }}>
              {formatCurrency(distributor.personal_bv_monthly)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.55rem' }}>Personal BV</div>
          </div>

          <div
            style={{
              background: colors.bg,
              borderRadius: '4px',
              padding: '3px 6px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="font-mono text-slate-800 font-bold" style={{ fontSize: '0.65rem' }}>
              {formatCurrency(distributor.group_bv_monthly)}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.55rem' }}>Group BV</div>
          </div>
        </div>
      </div>
    </div>
  );
}
