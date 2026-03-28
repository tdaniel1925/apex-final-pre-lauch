// =============================================
// Reusable Stat Card Component
// For displaying key metrics in admin portal
// =============================================

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray' | 'teal';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
  teal: 'bg-teal-100 text-teal-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 truncate">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
            <div className="w-4 h-4 sm:w-5 sm:h-5">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
