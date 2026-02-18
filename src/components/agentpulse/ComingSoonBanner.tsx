'use client';

// =============================================
// Coming Soon Banner Component
// Top banner for dashboard announcing AgentPulse
// =============================================

import Link from 'next/link';
import { useState } from 'react';

export default function ComingSoonBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#2B4C7E] to-[#1e3555] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">🚀</div>
            <div>
              <div className="font-bold text-sm sm:text-base">
                NEW: AgentPulse Marketing Suite — Coming February 28th
              </div>
              <div className="text-xs sm:text-sm text-blue-100 mt-0.5">
                6 AI-Powered Insurance Marketing Tools • Use for YOUR business • Earn 20% monthly
                residuals
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/agentpulse"
              className="px-4 py-2 bg-white text-[#2B4C7E] font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
            >
              Preview Features
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200 p-1"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
