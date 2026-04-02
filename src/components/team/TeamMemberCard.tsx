'use client';

// =============================================
// Team Member Card Component
// Displays individual team member information
// =============================================

import Link from 'next/link';

export interface TeamMemberData {
  memberId: string;
  distributorId: string;
  fullName: string;
  email: string;
  slug: string;
  repNumber: number | null;
  techRank: string;
  personalCreditsMonthly: number;
  personalEnrolleeCount: number;
  enrollmentDate: string;
  isActive: boolean;
}

interface TeamMemberCardProps {
  member: TeamMemberData;
  onMemberClick?: (distributorId: string) => void;
}

export default function TeamMemberCard({ member, onMemberClick }: TeamMemberCardProps) {
  const initials = member.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const rankColors: Record<string, string> = {
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

  const rankColor = rankColors[member.techRank?.toLowerCase() || 'starter'] || 'bg-slate-100 text-slate-700';

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${
        onMemberClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onMemberClick?.(member.distributorId)}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>

        {/* Name and Rank */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-lg truncate">{member.fullName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${rankColor}`}>
              {member.techRank || 'Starter'}
            </span>
            {member.repNumber && (
              <span className="text-xs text-slate-600">Rep #{member.repNumber}</span>
            )}
          </div>
        </div>

        {/* Active Status Indicator */}
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
          />
          <span className={`text-xs ${member.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-600 mb-1">Credits This Month</p>
          <p className="font-semibold text-slate-900">{member.personalCreditsMonthly}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Personal Enrollees</p>
          <p className="font-semibold text-slate-900">{member.personalEnrolleeCount}</p>
        </div>
      </div>

      {/* Join Date */}
      <div className="mb-4">
        <p className="text-xs text-slate-600 mb-1">Joined</p>
        <p className="text-sm text-slate-900">
          {new Date(member.enrollmentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/dashboard/team/${member.slug}`}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors text-center"
        >
          View Details
        </Link>
        <Link
          href={`mailto:${member.email}`}
          className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded transition-colors text-center"
        >
          Message
        </Link>
      </div>
    </div>
  );
}
