'use client';

// =============================================
// Team Stats Header Component
// Displays 4 key team statistics cards
// =============================================

interface TeamStatsHeaderProps {
  totalPersonalEnrollees: number;
  activeThisMonth: number;
  totalTeamCredits: number;
  l1OverrideEarnings: number;
}

export default function TeamStatsHeader({
  totalPersonalEnrollees,
  activeThisMonth,
  totalTeamCredits,
  l1OverrideEarnings,
}: TeamStatsHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Personal Enrollees */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Total Personal Enrollees
        </p>
        <p className="text-3xl font-bold text-slate-900">{totalPersonalEnrollees}</p>
        <p className="text-xs text-slate-500 mt-1">Direct L1 team members</p>
      </div>

      {/* Active This Month */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Active This Month
        </p>
        <p className="text-3xl font-bold text-emerald-600">{activeThisMonth}</p>
        <p className="text-xs text-slate-500 mt-1">50+ credits monthly</p>
      </div>

      {/* Total Team Credits */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Total Team Credits
        </p>
        <p className="text-3xl font-bold text-blue-600">{totalTeamCredits.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">Combined monthly credits</p>
      </div>

      {/* L1 Override Earnings */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          L1 Override Earnings
        </p>
        <p className="text-3xl font-bold text-purple-600">
          ${(l1OverrideEarnings / 100).toFixed(2)}
        </p>
        <p className="text-xs text-slate-500 mt-1">This month (30%)</p>
      </div>
    </div>
  );
}
