// =============================================
// Progress Bar Component
// Simple progress bar for usage stats
// =============================================

'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'red' | 'green';
}

export default function ProgressBar({
  value,
  max,
  color = 'blue',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
  };

  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
