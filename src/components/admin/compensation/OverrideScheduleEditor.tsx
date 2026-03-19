'use client';

// =============================================
// Override Schedule Editor Component
// Configure override percentages matrix (9 ranks × 5 levels)
// Now with REAL API integration!
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type OverrideSchedule = {
  [rankName: string]: [number, number, number, number, number]; // 5 levels
};

const RANK_NAMES = [
  'Starter',
  'Builder',
  'Producer',
  'Leader',
  'Manager',
  'Director',
  'Executive',
  'Premier',
  'Elite',
];

export default function OverrideScheduleEditor() {
  const [schedule, setSchedule] = useState<OverrideSchedule>({
    'Starter': [0, 0, 0, 0, 0],
    'Builder': [5, 0, 0, 0, 0],
    'Producer': [10, 5, 0, 0, 0],
    'Leader': [15, 10, 5, 0, 0],
    'Manager': [20, 15, 10, 5, 0],
    'Director': [25, 20, 15, 10, 5],
    'Executive': [30, 25, 20, 15, 10],
    'Premier': [35, 30, 25, 20, 15],
    'Elite': [40, 35, 30, 25, 20],
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch override schedules from API on mount
  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/compensation/config');
        const data = await res.json();

        if (data.success && data.data && data.data.techRanks) {
          // Extract override_schedule arrays from each rank
          const fetchedSchedule: OverrideSchedule = {};

          data.data.techRanks.forEach((rank: any) => {
            const rankName = rank.rank_name.charAt(0).toUpperCase() + rank.rank_name.slice(1);
            // Convert from decimal to percentage: [0.30, 0.05, ...] → [30, 5, ...]
            fetchedSchedule[rankName] = rank.override_schedule.map((val: number) => val * 100) as [number, number, number, number, number];
          });

          setSchedule(fetchedSchedule);
        } else {
          setError(data.error || 'Failed to load override schedules');
        }
      } catch (err) {
        console.error('Error fetching override schedules:', err);
        setError('Network error while loading override schedules');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  const handleCellChange = (rankName: string, level: number, value: number) => {
    setSchedule(prev => ({
      ...prev,
      [rankName]: prev[rankName].map((v, i) => i === level ? value : v) as [number, number, number, number, number],
    }));
    setIsDirty(true);
  };

  const applyPreset = (preset: 'conservative' | 'balanced' | 'aggressive') => {
    const presets: { [key: string]: OverrideSchedule } = {
      conservative: {
        'Starter': [0, 0, 0, 0, 0],
        'Builder': [3, 0, 0, 0, 0],
        'Producer': [6, 3, 0, 0, 0],
        'Leader': [10, 6, 3, 0, 0],
        'Manager': [15, 10, 6, 3, 0],
        'Director': [20, 15, 10, 6, 3],
        'Executive': [25, 20, 15, 10, 6],
        'Premier': [30, 25, 20, 15, 10],
        'Elite': [35, 30, 25, 20, 15],
      },
      balanced: {
        'Starter': [0, 0, 0, 0, 0],
        'Builder': [5, 0, 0, 0, 0],
        'Producer': [10, 5, 0, 0, 0],
        'Leader': [15, 10, 5, 0, 0],
        'Manager': [20, 15, 10, 5, 0],
        'Director': [25, 20, 15, 10, 5],
        'Executive': [30, 25, 20, 15, 10],
        'Premier': [35, 30, 25, 20, 15],
        'Elite': [40, 35, 30, 25, 20],
      },
      aggressive: {
        'Starter': [0, 0, 0, 0, 0],
        'Builder': [8, 0, 0, 0, 0],
        'Producer': [15, 8, 0, 0, 0],
        'Leader': [20, 15, 8, 0, 0],
        'Manager': [25, 20, 15, 8, 0],
        'Director': [30, 25, 20, 15, 8],
        'Executive': [35, 30, 25, 20, 15],
        'Premier': [40, 35, 30, 25, 20],
        'Elite': [45, 40, 35, 30, 25],
      },
    };

    setSchedule(presets[preset]);
    setIsDirty(true);
  };

  const copyFromRank = (sourceRank: string, targetRank: string) => {
    setSchedule(prev => ({
      ...prev,
      [targetRank]: [...prev[sourceRank]] as [number, number, number, number, number],
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save the entire override schedule matrix
      const res = await fetch('/api/admin/compensation/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineType: 'saas',
          key: 'override_schedules',
          value: Object.entries(schedule).reduce((acc, [rankName, percentages]) => {
            acc[rankName] = percentages.map(p => p / 100); // Convert percentages to decimals
            return acc;
          }, {} as Record<string, number[]>)
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save override schedules');
      }

      setIsDirty(false);
      alert('✅ Override schedules saved successfully!');
    } catch (err: any) {
      console.error('Error saving override schedules:', err);
      setError(err.message || 'Failed to save override schedules');
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
        <p className="mt-4 text-gray-600">Loading override schedules...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Override Schedules</h3>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Override Schedule Matrix</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure override percentages for each rank and level (L1-L5)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('conservative')}>
                Conservative
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('balanced')}>
                Balanced
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('aggressive')}>
                Aggressive
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Rank
                </th>
                {[1, 2, 3, 4, 5].map(level => (
                  <th key={level} className="border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Level {level}
                  </th>
                ))}
                <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Total
                </th>
                <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {RANK_NAMES.map((rankName, rankIndex) => {
                const rowTotal = schedule[rankName].reduce((sum, val) => sum + val, 0);

                return (
                  <tr key={rankName} className={rankIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {rankIndex + 1}
                        </div>
                        {rankName}
                      </div>
                    </td>
                    {[0, 1, 2, 3, 4].map(level => {
                      const value = schedule[rankName][level];
                      const isDisabled = level > 0 && schedule[rankName][level - 1] === 0;

                      return (
                        <td key={level} className="border border-gray-300 px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleCellChange(rankName, level, parseFloat(e.target.value) || 0)}
                              disabled={isDisabled}
                              className={`w-16 px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300'
                              }`}
                              min="0"
                              max="100"
                              step="1"
                            />
                            <span className="text-xs text-gray-600">%</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-900">
                      {rowTotal}%
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {rankIndex > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyFromRank(RANK_NAMES[rankIndex - 1], rankName)}
                          title={`Copy from ${RANK_NAMES[rankIndex - 1]}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info Panel */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Override Rules</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Each cell represents the override percentage for that rank at that level</li>
              <li>• Level 1 is the direct seller, Level 2 is their sponsor, etc.</li>
              <li>• Percentages should generally decrease as levels increase (L1 ≥ L2 ≥ L3...)</li>
              <li>• Use presets to quickly apply common patterns</li>
              <li>• Copy from previous rank to maintain consistency</li>
            </ul>
          </div>
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
