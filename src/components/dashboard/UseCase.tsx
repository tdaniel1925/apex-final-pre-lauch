// =============================================
// Use Case Component
// Real-world scenarios showing why reps need Business Center
// =============================================

'use client';

import { ArrowRight } from 'lucide-react';

interface UseCaseProps {
  scenario: string;
  description: string;
  result: string;
}

export default function UseCase({ scenario, description, result }: UseCaseProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
      {/* Scenario Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-600 rounded-full" />
        <h3 className="text-lg font-bold text-slate-900">{scenario}</h3>
      </div>

      {/* Description */}
      <p className="text-slate-700 mb-4 leading-relaxed">{description}</p>

      {/* Result */}
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded p-3">
        <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-green-900">{result}</p>
      </div>
    </div>
  );
}
