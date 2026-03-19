'use client';

// =============================================
// Tech Rank Editor Component
// Configure Tech Ladder rank requirements and bonuses
// Now with REAL API integration!
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TechRank {
  id: string;
  name: string;
  order: number;
  personalCreditsRequired: number;
  groupCreditsRequired: number;
  downlineRequirements: string[];
  rankBonus: number;
}

export default function TechRankEditor() {
  const [ranks, setRanks] = useState<TechRank[]>([
    {
      id: '1',
      name: 'Starter',
      order: 1,
      personalCreditsRequired: 1,
      groupCreditsRequired: 0,
      downlineRequirements: [],
      rankBonus: 0,
    },
    {
      id: '2',
      name: 'Builder',
      order: 2,
      personalCreditsRequired: 3,
      groupCreditsRequired: 10,
      downlineRequirements: ['2 Starters'],
      rankBonus: 100,
    },
    {
      id: '3',
      name: 'Producer',
      order: 3,
      personalCreditsRequired: 5,
      groupCreditsRequired: 25,
      downlineRequirements: ['3 Builders'],
      rankBonus: 250,
    },
    {
      id: '4',
      name: 'Leader',
      order: 4,
      personalCreditsRequired: 10,
      groupCreditsRequired: 75,
      downlineRequirements: ['2 Producers'],
      rankBonus: 500,
    },
    {
      id: '5',
      name: 'Manager',
      order: 5,
      personalCreditsRequired: 15,
      groupCreditsRequired: 150,
      downlineRequirements: ['3 Leaders'],
      rankBonus: 1000,
    },
    {
      id: '6',
      name: 'Director',
      order: 6,
      personalCreditsRequired: 20,
      groupCreditsRequired: 300,
      downlineRequirements: ['2 Managers'],
      rankBonus: 2000,
    },
    {
      id: '7',
      name: 'Executive',
      order: 7,
      personalCreditsRequired: 25,
      groupCreditsRequired: 600,
      downlineRequirements: ['3 Directors'],
      rankBonus: 5000,
    },
    {
      id: '8',
      name: 'Premier',
      order: 8,
      personalCreditsRequired: 30,
      groupCreditsRequired: 1200,
      downlineRequirements: ['2 Executives'],
      rankBonus: 10000,
    },
    {
      id: '9',
      name: 'Elite',
      order: 9,
      personalCreditsRequired: 40,
      groupCreditsRequired: 2500,
      downlineRequirements: ['3 Premiers'],
      rankBonus: 25000,
    },
  ]);

  const [isDirty, setIsDirty] = useState(false);
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch tech ranks from API on mount
  useEffect(() => {
    async function fetchRanks() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/compensation/config');
        const data = await res.json();

        if (data.success && data.data && data.data.techRanks) {
          // Convert from database format to component format
          const fetchedRanks = data.data.techRanks.map((r: any, index: number) => ({
            id: r.id || String(index + 1),
            name: r.rank_name,
            order: r.rank_order,
            personalCreditsRequired: r.personal_credits_required,
            groupCreditsRequired: r.group_credits_required,
            downlineRequirements: r.downline_requirements ?
              (typeof r.downline_requirements === 'string' ?
                JSON.parse(r.downline_requirements) :
                Object.entries(r.downline_requirements).map(([rank, count]) => `${count} ${rank}`)) : [],
            rankBonus: r.rank_bonus_cents / 100, // Convert cents to dollars
          }));
          setRanks(fetchedRanks);
        } else {
          setError(data.error || 'Failed to load tech ranks');
        }
      } catch (err) {
        console.error('Error fetching tech ranks:', err);
        setError('Network error while loading tech ranks');
      } finally {
        setLoading(false);
      }
    }

    fetchRanks();
  }, []);

  const handleUpdateRank = (rankId: string, field: keyof TechRank, value: any) => {
    setRanks(prev =>
      prev.map(rank =>
        rank.id === rankId ? { ...rank, [field]: value } : rank
      )
    );
    setIsDirty(true);
  };

  const handleAddDownlineRequirement = (rankId: string, requirement: string) => {
    setRanks(prev =>
      prev.map(rank =>
        rank.id === rankId
          ? { ...rank, downlineRequirements: [...rank.downlineRequirements, requirement] }
          : rank
      )
    );
    setIsDirty(true);
  };

  const handleRemoveDownlineRequirement = (rankId: string, index: number) => {
    setRanks(prev =>
      prev.map(rank =>
        rank.id === rankId
          ? { ...rank, downlineRequirements: rank.downlineRequirements.filter((_, i) => i !== index) }
          : rank
      )
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save each rank individually
      for (const rank of ranks) {
        const res = await fetch('/api/admin/compensation/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineType: 'saas',
            key: `rank_${rank.name.toLowerCase()}`,
            value: {
              personal_credits_required: rank.personalCreditsRequired,
              group_credits_required: rank.groupCreditsRequired,
              downline_requirements: rank.downlineRequirements,
              rank_bonus_cents: rank.rankBonus * 100, // Convert dollars to cents
            }
          })
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || `Failed to save ${rank.name} rank`);
        }
      }

      setIsDirty(false);
      setEditingRank(null);
      alert('✅ Tech ranks saved successfully!');
    } catch (err: any) {
      console.error('Error saving tech ranks:', err);
      setError(err.message || 'Failed to save tech ranks');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload from API
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading tech ranks configuration...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tech Ranks</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Tech Ladder Ranks</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure rank requirements and advancement bonuses for the Tech Ladder
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {ranks.map((rank, index) => (
            <div key={rank.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {rank.order}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={rank.name}
                      onChange={(e) => handleUpdateRank(rank.id, 'name', e.target.value)}
                      className="text-lg font-bold text-gray-900 border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rank {rank.order} of {ranks.length}</p>
                  </div>
                </div>
                <Button
                  variant={editingRank === rank.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditingRank(editingRank === rank.id ? null : rank.id)}
                >
                  {editingRank === rank.id ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Personal Credits */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Personal Credits
                  </label>
                  <input
                    type="number"
                    value={rank.personalCreditsRequired}
                    onChange={(e) => handleUpdateRank(rank.id, 'personalCreditsRequired', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                {/* Group Credits */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Group Credits
                  </label>
                  <input
                    type="number"
                    value={rank.groupCreditsRequired}
                    onChange={(e) => handleUpdateRank(rank.id, 'groupCreditsRequired', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                {/* Rank Bonus */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Rank Bonus ($)
                  </label>
                  <input
                    type="number"
                    value={rank.rankBonus}
                    onChange={(e) => handleUpdateRank(rank.id, 'rankBonus', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="100"
                  />
                </div>

                {/* Downline Requirements Count */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Downline Reqs
                  </label>
                  <div className="flex items-center h-10 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                    <span className="font-semibold text-gray-900">
                      {rank.downlineRequirements.length}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {rank.downlineRequirements.length === 1 ? 'requirement' : 'requirements'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded View */}
              {editingRank === rank.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Downline Requirements
                  </h4>
                  <div className="space-y-2">
                    {rank.downlineRequirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...rank.downlineRequirements];
                            newReqs[reqIndex] = e.target.value;
                            handleUpdateRank(rank.id, 'downlineRequirements', newReqs);
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 2 Builders"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDownlineRequirement(rank.id, reqIndex)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddDownlineRequirement(rank.id, '')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Requirement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {isDirty && (
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Button onClick={handleCancel} variant="outline" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
