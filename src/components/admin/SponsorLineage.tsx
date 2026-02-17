'use client';

// =============================================
// Sponsor Lineage Component
// Shows sponsor path from master to current distributor
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';

interface SponsorLineageProps {
  distributorId: string;
  distributorName: string;
}

interface SponsorPathData {
  sponsorPath: Distributor[];
  directSponsor: Distributor | null;
  totalLevels: number;
}

export default function SponsorLineage({ distributorId, distributorName }: SponsorLineageProps) {
  const router = useRouter();
  const [data, setData] = useState<SponsorPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSponsorPath() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/distributors/${distributorId}/sponsors`);

        if (!response.ok) {
          throw new Error('Failed to fetch sponsor path');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsorPath();
  }, [distributorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Sponsor Lineage</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Sponsor Lineage</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data || data.sponsorPath.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Sponsor Lineage</h2>
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Master Account</p>
              <p className="text-xs text-blue-700">This is a top-level master distributor with no sponsor</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { sponsorPath, directSponsor, totalLevels } = data;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Sponsor Lineage</h2>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          {totalLevels} level{totalLevels !== 1 ? 's' : ''} up
        </span>
      </div>

      {/* Breadcrumb Path */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1.5">Sponsor Path:</p>
        <div className="flex items-center gap-1 flex-wrap">
          {sponsorPath.map((sponsor, index) => (
            <div key={sponsor.id} className="flex items-center gap-1">
              <button
                onClick={() => router.push(`/admin/distributors/${sponsor.id}`)}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-xs font-medium text-blue-700 transition-colors"
              >
                {sponsor.first_name} {sponsor.last_name}
                {sponsor.is_master && (
                  <span className="ml-1 text-[10px] bg-blue-600 text-white px-1 rounded">MASTER</span>
                )}
              </button>
              {index < sponsorPath.length - 1 && (
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-semibold text-green-700">
              {distributorName}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Sponsor Card */}
      {directSponsor && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-600 mb-1.5">Direct Sponsor:</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {directSponsor.first_name.charAt(0)}
                {directSponsor.last_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {directSponsor.first_name} {directSponsor.last_name}
                  </p>
                  {directSponsor.is_master && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">
                      MASTER
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">@{directSponsor.slug}</p>
                {directSponsor.company_name && (
                  <p className="text-xs text-gray-500 truncate">{directSponsor.company_name}</p>
                )}
              </div>
              <button
                onClick={() => router.push(`/admin/distributors/${directSponsor.id}`)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium flex-shrink-0"
              >
                View Profile
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-200">
              <div>
                <p className="text-[10px] text-gray-600">Email</p>
                <p className="text-xs text-gray-900 truncate">{directSponsor.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600">Matrix Position</p>
                <p className="text-xs font-semibold text-blue-600">
                  #{directSponsor.matrix_position || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
