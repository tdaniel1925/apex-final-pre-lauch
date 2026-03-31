// =============================================
// Benefit Card Component
// Displays what's included in Business Center
// =============================================

'use client';

import { ReactNode } from 'react';

interface BenefitCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  free: string;
  unlimited: string;
}

export default function BenefitCard({
  icon,
  title,
  description,
  free,
  unlimited,
}: BenefitCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Icon */}
      <div className="mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>

      {/* Free vs Unlimited */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium">Free Tier:</span>
          <span className="text-slate-700 font-semibold">{free}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Unlimited:</span>
          <span className="text-blue-900 font-bold">{unlimited}</span>
        </div>
      </div>
    </div>
  );
}
