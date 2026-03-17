'use client';

// =============================================
// Tree Node Card Component
// Displays individual member in genealogy tree
// =============================================

import { useState } from 'react';

export interface MemberNode {
  member_id: string;
  full_name: string;
  email: string;
  tech_rank: string;
  personal_credits_monthly: number;
  team_credits_monthly: number;
  enrollment_date: string;
  status: string;
  distributor: {
    id: string;
    first_name: string;
    last_name: string;
    slug: string;
    rep_number: number | null;
    profile_photo_url: string | null;
  };
  children: MemberNode[];
  depth: number;
  hasChildren: boolean;
}

interface TreeNodeCardProps {
  node: MemberNode;
  isExpanded: boolean;
  onToggle: () => void;
  onMemberClick?: (memberId: string) => void;
}

const RANK_COLORS: Record<string, string> = {
  starter: 'border-slate-300',
  bronze: 'border-orange-600',
  silver: 'border-slate-400',
  gold: 'border-yellow-500',
  platinum: 'border-blue-400',
  ruby: 'border-red-600',
  diamond: 'border-cyan-400',
  crown: 'border-purple-500',
  elite: 'border-amber-400',
};

const RANK_BG: Record<string, string> = {
  starter: 'bg-slate-50',
  bronze: 'bg-orange-50',
  silver: 'bg-slate-50',
  gold: 'bg-yellow-50',
  platinum: 'bg-blue-50',
  ruby: 'bg-red-50',
  diamond: 'bg-cyan-50',
  crown: 'bg-purple-50',
  elite: 'bg-amber-50',
};

export default function TreeNodeCard({
  node,
  isExpanded,
  onToggle,
  onMemberClick,
}: TreeNodeCardProps) {
  const rankColor = RANK_COLORS[node.tech_rank] || 'border-slate-300';
  const rankBg = RANK_BG[node.tech_rank] || 'bg-slate-50';

  const enrollDate = new Date(node.enrollment_date);
  const formattedDate = enrollDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-start gap-2 group">
      {/* Expand/Collapse Button */}
      {node.hasChildren ? (
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-6 h-6 mt-2 rounded border border-slate-400 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className="text-slate-600 text-sm font-bold">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>
      ) : (
        <div className="w-6 flex-shrink-0" />
      )}

      {/* Member Card */}
      <div
        className={`flex-1 border-l-4 ${rankColor} ${rankBg} rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
          onMemberClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onMemberClick?.(node.member_id)}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {node.distributor.profile_photo_url ? (
                <img
                  src={node.distributor.profile_photo_url}
                  alt={node.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                  <span className="text-slate-600 font-semibold text-sm">
                    {node.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Rank */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 truncate text-sm">
                  {node.full_name}
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-200 rounded uppercase">
                  {node.tech_rank}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                @{node.distributor.slug}
              </p>
            </div>
          </div>

          {/* Right: Credits & Date */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold text-slate-900">
              {node.personal_credits_monthly} credits/mo
            </div>
            <div className="text-xs text-slate-500">Joined {formattedDate}</div>
          </div>
        </div>

        {/* Status Badge (if not active) */}
        {node.status !== 'active' && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded">
              {node.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
