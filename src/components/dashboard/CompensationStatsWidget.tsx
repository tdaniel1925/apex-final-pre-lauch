// =============================================
// Compensation Stats Widget
// Displays member's compensation metrics from dual-ladder system
// =============================================
// DATA SOURCES:
// - members table: personal_credits_monthly, team_credits_monthly, tech_rank
// - earnings_ledger: monthly earnings (status='approved')
// =============================================

import { DollarSign, TrendingUp, Award, Target } from 'lucide-react';

interface CompensationStatsWidgetProps {
  personalCredits: number;
  teamCredits: number;
  currentRank: string;
  monthlyEarnings: number;
}

// Format rank name for display (capitalize first letter)
function formatRankName(rank: string): string {
  if (!rank) return 'Starter';
  return rank.charAt(0).toUpperCase() + rank.slice(1);
}

export default function CompensationStatsWidget({
  personalCredits,
  teamCredits,
  currentRank,
  monthlyEarnings,
}: CompensationStatsWidgetProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Personal Credits This Month */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">Personal Credits</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {personalCredits.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">This Month</p>
        </div>
      </div>

      {/* Group Credits This Month */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">Group Credits</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {teamCredits.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">This Month</p>
        </div>
      </div>

      {/* Current Rank */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">Current Rank</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            {formatRankName(currentRank)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tech Ladder</p>
        </div>
      </div>

      {/* Monthly Earnings Estimate */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">Monthly Earnings</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
            ${monthlyEarnings.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Approved This Month</p>
        </div>
      </div>
    </div>
  );
}
