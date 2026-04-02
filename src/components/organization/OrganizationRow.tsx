'use client';

// =============================================
// Organization Row Component
// Expandable table row showing member and their direct downline
// =============================================

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { OrganizationMember } from './OrganizationTable';

interface OrganizationRowProps {
  member: OrganizationMember;
  currentUserId: string;
  onMemberClick: (distributorId: string) => void;
}

const RANK_COLORS: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-700',
  bronze: 'bg-amber-100 text-amber-700',
  silver: 'bg-slate-200 text-slate-700',
  gold: 'bg-yellow-100 text-yellow-700',
  platinum: 'bg-blue-100 text-blue-700',
  ruby: 'bg-red-100 text-red-700',
  diamond: 'bg-cyan-100 text-cyan-700',
  crown: 'bg-purple-100 text-purple-700',
  elite: 'bg-indigo-100 text-indigo-700',
};

export default function OrganizationRow({
  member,
  currentUserId,
  onMemberClick,
}: OrganizationRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = member.children && member.children.length > 0;
  const isDirectRecruit = member.sponsor_id === currentUserId;
  const rankColor = RANK_COLORS[member.tech_rank.toLowerCase()] || 'bg-slate-100 text-slate-700';

  // Privacy: Only show contact info for direct recruits
  const displayEmail = isDirectRecruit ? member.email : '••••••@••••.com';
  const displayPhone = isDirectRecruit ? (member.phone || 'N/A') : '•••-•••-••••';

  // Get initials for avatar
  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Status badge
  const isActive = member.personal_credits_monthly >= 50;
  const statusColor = isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500';
  const statusText = isActive ? 'Active' : 'Inactive';

  return (
    <>
      {/* Main Row */}
      <tr className="hover:bg-slate-50 transition-colors border-b border-slate-200">
        {/* Expand Button */}
        <td className="px-4 py-3 w-12">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}
        </td>

        {/* Avatar & Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <button
                onClick={() => onMemberClick(member.distributor_id)}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
              >
                {member.full_name}
              </button>
              <p className="text-xs text-slate-500">@{member.slug}</p>
            </div>
          </div>
        </td>

        {/* Rep Number */}
        <td className="px-4 py-3 text-sm text-slate-900">
          {member.rep_number ? `#${member.rep_number}` : 'N/A'}
        </td>

        {/* Rank */}
        <td className="px-4 py-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${rankColor} uppercase`}>
            {member.tech_rank}
          </span>
        </td>

        {/* Personal BV */}
        <td className="px-4 py-3 text-sm font-medium text-slate-900">
          {member.personal_credits_monthly}
        </td>

        {/* Team BV */}
        <td className="px-4 py-3 text-sm font-medium text-slate-900">
          {member.team_credits_monthly}
        </td>

        {/* Join Date */}
        <td className="px-4 py-3 text-sm text-slate-600">
          {new Date(member.enrollment_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
            {statusText}
          </span>
        </td>

        {/* Direct Count */}
        <td className="px-4 py-3 text-sm text-slate-900 text-center">
          {hasChildren && member.children ? member.children.length : 0}
        </td>
      </tr>

      {/* Expanded Section: Direct Downline */}
      {isExpanded && hasChildren && member.children && (
        <tr>
          <td colSpan={9} className="bg-slate-50 px-4 py-4">
            <div className="ml-8">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Direct Recruits ({member.children.length})
              </h4>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Rep #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Rank
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Personal BV
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Team BV
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.children.map((child) => {
                      const childRankColor =
                        RANK_COLORS[child.tech_rank.toLowerCase()] ||
                        'bg-slate-100 text-slate-700';
                      const childIsActive = child.personal_credits_monthly >= 50;
                      const childStatusColor = childIsActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500';

                      return (
                        <tr
                          key={child.distributor_id}
                          className="border-b border-slate-200 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => onMemberClick(child.distributor_id)}
                              className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {child.full_name}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {child.rep_number ? `#${child.rep_number}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${childRankColor} uppercase`}
                            >
                              {child.tech_rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {child.personal_credits_monthly}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {child.team_credits_monthly}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${childStatusColor}`}
                            >
                              {childIsActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
