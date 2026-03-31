'use client';

// =============================================
// Commission Breakdown Chart
// Simple bar chart showing commission types
// =============================================

interface CommissionBreakdownChartProps {
  breakdown: Record<string, number>;
}

const commissionTypeNames: Record<string, string> = {
  seller_commission: 'Seller Commission',
  L1_enrollment: 'L1 Enrollment',
  L2_matrix: 'L2 Matrix',
  L3_matrix: 'L3 Matrix',
  L4_matrix: 'L4 Matrix',
  L5_matrix: 'L5 Matrix',
  L6_matrix: 'L6 Matrix',
  L7_matrix: 'L7 Matrix',
  rank_bonus: 'Rank Bonus',
  bonus_pool: 'Bonus Pool',
  leadership_pool: 'Leadership Pool',
};

const commissionTypeColors: Record<string, string> = {
  seller_commission: 'bg-green-500',
  L1_enrollment: 'bg-blue-500',
  L2_matrix: 'bg-purple-500',
  L3_matrix: 'bg-indigo-500',
  L4_matrix: 'bg-pink-500',
  L5_matrix: 'bg-yellow-500',
  L6_matrix: 'bg-orange-500',
  L7_matrix: 'bg-red-500',
  rank_bonus: 'bg-teal-500',
  bonus_pool: 'bg-cyan-500',
  leadership_pool: 'bg-emerald-500',
};

export default function CommissionBreakdownChart({
  breakdown,
}: CommissionBreakdownChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Sort by amount descending
  const sortedBreakdown = Object.entries(breakdown).sort(([, a], [, b]) => b - a);

  if (sortedBreakdown.length === 0 || total === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No commission data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <p className="text-lg font-semibold text-gray-900">Total Commissions</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {sortedBreakdown.map(([type, amount]) => {
          const percentage = (amount / total) * 100;
          const displayName = commissionTypeNames[type] || type;
          const colorClass = commissionTypeColors[type] || 'bg-gray-500';

          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{displayName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                  <span className="font-semibold text-gray-900 w-24 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedBreakdown.map(([type]) => {
            const displayName = commissionTypeNames[type] || type;
            const colorClass = commissionTypeColors[type] || 'bg-gray-500';

            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                <span className="text-xs text-gray-600">{displayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
