'use client';

// =============================================
// Stat Card Component
// Shows metrics with trend indicators
// Example: "Personal BV: $1,450 (+$320 ↑ 28%)"
// =============================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    amount: string | number;
    percentage: number;
    direction: 'up' | 'down';
  };
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export default function StatCard({
  label,
  value,
  change,
  icon,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] border-[#2c5aa0]/20',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    error: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  };

  const textColors = {
    default: 'text-[#1a4075]',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
  };

  return (
    <div className={`rounded-xl p-4 border ${variantStyles[variant]} shadow-sm`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold ${textColors[variant]}`}>{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-xl">
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              change.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change.direction === 'up' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {change.amount}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            ({change.percentage}%)
          </span>
        </div>
      )}
    </div>
  );
}
