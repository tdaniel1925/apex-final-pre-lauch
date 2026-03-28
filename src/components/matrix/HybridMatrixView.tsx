'use client';

// =============================================
// Hybrid Matrix View Component
// Top: Visual tree (levels 1-2)
// Bottom: Data table (levels 3+)
// =============================================

import { useState, useEffect } from 'react';
import { User, TrendingUp, Users, BarChart3, Search, Filter } from 'lucide-react';

interface MatrixMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  profile_image?: string | null;
  profile_photo_url?: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  sponsor_id: string | null;
  created_at: string;
  children?: MatrixMember[];
  childCount?: number;
  enrollment_level?: number; // Level in enrollment tree (1, 2, 3, 4)
  // Live member data (NOT cached)
  member?: {
    personal_credits_monthly: number | null;
    team_credits_monthly: number | null;
  } | null;
}

interface HybridMatrixData {
  root: MatrixMember;
  level1: MatrixMember[];
  level2: MatrixMember[];
  deepLevels: MatrixMember[];
  stats: {
    totalTeam: number;
    activeMembers: number;
    totalBV: number;
    maxDepth: number;
  };
}

interface HybridMatrixViewProps {
  distributorId: string;
}

export default function HybridMatrixView({ distributorId }: HybridMatrixViewProps) {
  const [data, setData] = useState<HybridMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  useEffect(() => {
    async function fetchMatrixData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL('/api/matrix/hybrid', window.location.origin);
        url.searchParams.set('distributorId', distributorId);

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error('Failed to fetch matrix data');
        }

        const result = await response.json();

        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.error || 'Failed to fetch matrix data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load matrix data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchMatrixData();
  }, [distributorId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-slate-300">Loading your matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Matrix</h3>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Matrix Data</h3>
          <p className="text-sm text-slate-300">You don't have any team members yet.</p>
        </div>
      </div>
    );
  }

  // Filter deep levels for table
  const filteredDeepLevels = data.deepLevels.filter((member) => {
    const matchesSearch =
      searchTerm === '' ||
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.rep_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === null || (member.enrollment_level || member.matrix_depth) === filterLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Stats Overview */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Your Matrix</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total Team</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{data.stats.totalTeam}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Active Members</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{data.stats.activeMembers}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total BV</span>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.stats.totalBV.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Max Depth</span>
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">{data.stats.maxDepth}</div>
          </div>
        </div>
      </div>

      {/* Visual Tree (Levels 1-2) */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Your Immediate Team (Levels 1-2)</h2>

        <div className="bg-slate-800 rounded-lg p-8 overflow-x-auto">
          {/* Root (You) */}
          <div className="flex flex-col items-center">
            <MemberCard member={data.root} isRoot />

            {/* Level 1 */}
            {data.level1.length > 0 && (
              <div className="mt-8">
                {/* Connection line */}
                <div className="h-8 w-0.5 bg-slate-600 mx-auto" />

                <div className="flex gap-6 items-start justify-center flex-wrap">
                  {data.level1.map((level1Member) => (
                    <div key={level1Member.id} className="flex flex-col items-center">
                      <MemberCard member={level1Member} />

                      {/* Level 2 children */}
                      {level1Member.children && level1Member.children.length > 0 && (
                        <div className="mt-4">
                          <div className="h-8 w-0.5 bg-slate-600 mx-auto" />
                          <div className="flex gap-3 items-start justify-center flex-wrap">
                            {level1Member.children.map((level2Member) => (
                              <MemberCard
                                key={level2Member.id}
                                member={level2Member}
                                compact
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table View (Levels 3+) */}
      {data.deepLevels.length > 0 && (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Deeper Levels (3+)</h2>
            <div className="text-sm text-slate-400">
              {filteredDeepLevels.length} members shown
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or rep number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterLevel?.toString() || ''}
              onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Levels</option>
              {Array.from({ length: data.stats.maxDepth - 2 }, (_, i) => i + 3).map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Rep #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredDeepLevels.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {member.rep_number || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {member.enrollment_level || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            member.status === 'active'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Member Card Component
function MemberCard({ member, isRoot, compact }: { member: MatrixMember; isRoot?: boolean; compact?: boolean }) {
  const cardSize = compact ? 'w-32' : 'w-48';
  const avatarSize = compact ? 'h-10 w-10' : 'h-16 w-16';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`${cardSize} bg-slate-900 rounded-lg border-2 ${
        isRoot ? 'border-blue-500' : 'border-slate-700'
      } p-3 transition-all hover:border-blue-400 hover:shadow-lg`}
    >
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className={`${avatarSize} rounded-full bg-slate-700 flex items-center justify-center mb-2 ${
          isRoot ? 'ring-2 ring-blue-500' : ''
        }`}>
          {member.profile_image || member.profile_photo_url ? (
            <img
              src={member.profile_image || member.profile_photo_url || ''}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {member.first_name[0]}{member.last_name[0]}
            </span>
          )}
        </div>

        {/* Name */}
        <div className={`${textSize} font-semibold text-white truncate w-full`}>
          {member.first_name} {member.last_name}
        </div>

        {/* Rep Number */}
        {member.rep_number && (
          <div className="text-xs text-slate-400">
            #{member.rep_number}
          </div>
        )}

        {/* Status Badge */}
        {!compact && (
          <div className="mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                member.status === 'active'
                  ? 'bg-green-900 text-green-300'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {member.status}
            </span>
          </div>
        )}

        {/* Child Count */}
        {member.childCount !== undefined && member.childCount > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            {member.childCount} {member.childCount === 1 ? 'member' : 'members'}
          </div>
        )}

        {isRoot && (
          <div className="mt-2 text-xs font-semibold text-blue-400">
            (You)
          </div>
        )}
      </div>
    </div>
  );
}
