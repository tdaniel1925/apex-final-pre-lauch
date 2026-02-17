'use client';

// =============================================
// Sponsor Lineage User Component
// Shows sponsor path from master to current user
// =============================================

import type { Distributor } from '@/lib/types';

interface SponsorLineageUserProps {
  sponsorPath: Distributor[];
  currentUser: {
    first_name: string;
    last_name: string;
    slug: string;
  };
}

export default function SponsorLineageUser({ sponsorPath, currentUser }: SponsorLineageUserProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Your Sponsor Lineage</h2>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          {sponsorPath.length} {sponsorPath.length === 1 ? 'Level' : 'Levels'}
        </span>
      </div>

      {/* Breadcrumb Path */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2 mb-2">
        <div className="flex items-center flex-wrap gap-1">
          {sponsorPath.map((sponsor, index) => (
            <div key={sponsor.id} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-3 h-3 text-gray-400 mx-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div className="inline-flex items-center gap-1 bg-white/60 rounded px-1.5 py-0.5">
                <div className="w-4 h-4 bg-gradient-to-br from-[#2B4C7E] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-white">
                    {sponsor.first_name.charAt(0)}
                    {sponsor.last_name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900">
                  {sponsor.is_master ? 'Master' : `${sponsor.first_name} ${sponsor.last_name}`}
                </span>
              </div>
            </div>
          ))}

          {/* Arrow to Current User */}
          <svg
            className="w-3 h-3 text-gray-400 mx-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>

          {/* Current User (You) */}
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-200 border border-green-300 rounded px-1.5 py-0.5">
            <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-bold text-white">
                {currentUser.first_name.charAt(0)}
                {currentUser.last_name.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-semibold text-green-900">
              You ({currentUser.first_name})
            </span>
          </div>
        </div>
      </div>

      {/* Direct Sponsor Card */}
      {sponsorPath.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-2">
          <p className="text-[10px] text-indigo-600 font-semibold mb-1">Your Direct Sponsor</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">
                {sponsorPath[sponsorPath.length - 1].first_name.charAt(0)}
                {sponsorPath[sponsorPath.length - 1].last_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {sponsorPath[sponsorPath.length - 1].is_master
                  ? 'Master Account'
                  : `${sponsorPath[sponsorPath.length - 1].first_name} ${sponsorPath[sponsorPath.length - 1].last_name}`
                }
              </p>
              <p className="text-[10px] text-gray-600">@{sponsorPath[sponsorPath.length - 1].slug}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
