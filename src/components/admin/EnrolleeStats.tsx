'use client';

// =============================================
// Enrollee Statistics Component
// Shows personal and organization enrollee counts
// =============================================

import { useState, useEffect } from 'react';

interface EnrolleeStatsProps {
  distributorId: string;
}

interface EnrolleeData {
  stats: {
    personalEnrollees: number;
    organizationEnrollees: number;
  };
  distributor: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function EnrolleeStats({ distributorId }: EnrolleeStatsProps) {
  const [data, setData] = useState<EnrolleeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrolleeStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/distributors/${distributorId}/enrollees`);

        if (!response.ok) {
          throw new Error('Failed to fetch enrollee statistics');
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolleeStats();
  }, [distributorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Enrollee Statistics</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Enrollee Statistics</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats } = data;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Enrollee Statistics</h2>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
          Sponsor Tree
        </span>
      </div>

      {/* Enrollee Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Personal Enrollees */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-0.5">
            {stats.personalEnrollees}
          </p>
          <p className="text-xs font-medium text-green-700">Personal Enrollees</p>
          <p className="text-[10px] text-green-600 mt-1">Personally signed up</p>
        </div>

        {/* Organization Enrollees */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-teal-900 mb-0.5">
            {stats.organizationEnrollees}
          </p>
          <p className="text-xs font-medium text-teal-700">Organization Enrollees</p>
          <p className="text-[10px] text-teal-600 mt-1">All downline enrollees</p>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <p className="font-medium mb-0.5">ℹ️ What's the difference?</p>
        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
          <li><strong>Personal:</strong> People this distributor directly signed up</li>
          <li><strong>Organization:</strong> Everyone in their downline (all levels deep)</li>
        </ul>
      </div>
    </div>
  );
}
