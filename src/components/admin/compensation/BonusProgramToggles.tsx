'use client';

// =============================================
// Bonus Program Toggles Component
// Configure bonus programs with on/off toggles and settings
// Now with REAL API integration!
// =============================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BonusProgram {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export default function BonusProgramToggles() {
  const [programs, setPrograms] = useState<BonusProgram[]>([
    {
      id: 'fast-start',
      name: 'Fast Start Bonus',
      description: 'One-time bonus for new distributors achieving first sale',
      enabled: true,
      config: {
        amount: 100,
        deadline: 30, // days
      },
    },
    {
      id: 'rank-advancement',
      name: 'Rank Advancement Bonus',
      description: 'One-time bonus when achieving each new rank',
      enabled: true,
      config: {
        bonusesByRank: {
          'Builder': 100,
          'Producer': 250,
          'Leader': 500,
          'Manager': 1000,
          'Director': 2000,
          'Executive': 5000,
          'Premier': 10000,
          'Elite': 25000,
        },
      },
    },
    {
      id: 'car-allowance',
      name: 'Car Allowance Program',
      description: 'Monthly car allowance for qualified ranks',
      enabled: false,
      config: {
        allowanceByRank: {
          'Director': 500,
          'Executive': 800,
          'Premier': 1200,
          'Elite': 2000,
        },
        qualificationPeriod: 3, // months
      },
    },
    {
      id: 'vacation-bonus',
      name: 'Vacation Bonus',
      description: 'Annual vacation incentive for top performers',
      enabled: false,
      config: {
        bonusesByRank: {
          'Executive': 2000,
          'Premier': 5000,
          'Elite': 10000,
        },
        requiresQualification: true,
      },
    },
    {
      id: 'customer-milestones',
      name: 'Customer Milestone Bonuses',
      description: 'Bonuses for reaching customer count milestones',
      enabled: true,
      config: {
        milestones: [
          { customers: 10, bonus: 50 },
          { customers: 25, bonus: 150 },
          { customers: 50, bonus: 300 },
          { customers: 100, bonus: 750 },
        ],
      },
    },
  ]);

  const [expandedProgram, setExpandedProgram] = useState<string | null>('fast-start');
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch bonus programs from API on mount
  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/compensation/config');
        const data = await res.json();

        if (data.success && data.data && data.data.bonusPrograms) {
          // Convert from database format to component format
          const fetchedPrograms = data.data.bonusPrograms.map((p: any) => ({
            id: p.id || p.program_name,
            name: p.program_name.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: p.config_json?.description || '',
            enabled: p.enabled,
            config: p.config_json || {},
          }));
          setPrograms(fetchedPrograms);
        } else {
          setError(data.error || 'Failed to load bonus programs');
        }
      } catch (err) {
        console.error('Error fetching bonus programs:', err);
        setError('Network error while loading bonus programs');
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const handleToggleEnabled = (programId: string) => {
    setPrograms(prev =>
      prev.map(p => (p.id === programId ? { ...p, enabled: !p.enabled } : p))
    );
    setIsDirty(true);
  };

  const handleUpdateConfig = (programId: string, newConfig: Record<string, unknown>) => {
    setPrograms(prev =>
      prev.map(p => (p.id === programId ? { ...p, config: newConfig } : p))
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save each bonus program individually
      for (const program of programs) {
        const res = await fetch('/api/admin/compensation/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineType: 'saas',
            key: `bonus_program_${program.id}`,
            value: {
              enabled: program.enabled,
              config: program.config,
            }
          })
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || `Failed to save ${program.name}`);
        }
      }

      setIsDirty(false);
      alert('✅ Bonus programs saved successfully!');
    } catch (err: any) {
      console.error('Error saving bonus programs:', err);
      setError(err.message || 'Failed to save bonus programs');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload from API
    window.location.reload();
  };

  const renderConfigPanel = (program: BonusProgram) => {
    switch (program.id) {
      case 'fast-start':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Bonus Amount ($)
              </label>
              <input
                type="number"
                value={(program.config.amount as number) ?? 0}
                onChange={(e) =>
                  handleUpdateConfig(program.id, {
                    ...program.config,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Qualification Deadline (days)
              </label>
              <input
                type="number"
                value={(program.config.deadline as number) ?? 0}
                onChange={(e) =>
                  handleUpdateConfig(program.id, {
                    ...program.config,
                    deadline: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        );

      case 'rank-advancement':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Bonus Amount by Rank
            </label>
            {Object.entries((program.config.bonusesByRank as Record<string, number>) ?? {}).map(([rank, amount]) => (
              <div key={rank} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-700">{rank}:</span>
                <input
                  type="number"
                  value={amount as number}
                  onChange={(e) =>
                    handleUpdateConfig(program.id, {
                      ...program.config,
                      bonusesByRank: {
                        ...(program.config.bonusesByRank as Record<string, number>),
                        [rank]: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-sm text-gray-600">$</span>
              </div>
            ))}
          </div>
        );

      case 'car-allowance':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Monthly Allowance by Rank
            </label>
            {Object.entries((program.config.allowanceByRank as Record<string, number>) ?? {}).map(([rank, amount]) => (
              <div key={rank} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-700">{rank}:</span>
                <input
                  type="number"
                  value={amount as number}
                  onChange={(e) =>
                    handleUpdateConfig(program.id, {
                      ...program.config,
                      allowanceByRank: {
                        ...(program.config.allowanceByRank as Record<string, number>),
                        [rank]: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-sm text-gray-600">$/month</span>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Qualification Period (months)
              </label>
              <input
                type="number"
                value={(program.config.qualificationPeriod as number) ?? 0}
                onChange={(e) =>
                  handleUpdateConfig(program.id, {
                    ...program.config,
                    qualificationPeriod: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        );

      case 'vacation-bonus':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Annual Bonus by Rank
            </label>
            {Object.entries((program.config.bonusesByRank as Record<string, number>) ?? {}).map(([rank, amount]) => (
              <div key={rank} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-700">{rank}:</span>
                <input
                  type="number"
                  value={amount as number}
                  onChange={(e) =>
                    handleUpdateConfig(program.id, {
                      ...program.config,
                      bonusesByRank: {
                        ...(program.config.bonusesByRank as Record<string, number>),
                        [rank]: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="text-sm text-gray-600">$</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(program.config.requiresQualification as boolean) ?? false}
                onChange={(e) =>
                  handleUpdateConfig(program.id, {
                    ...program.config,
                    requiresQualification: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Requires annual qualification
              </label>
            </div>
          </div>
        );

      case 'customer-milestones':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Customer Milestones
            </label>
            {((program.config.milestones as Array<{customers: number, bonus: number}>) ?? []).map((milestone: any, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="number"
                  value={milestone.customers}
                  onChange={(e) => {
                    const newMilestones = [...((program.config.milestones as Array<{customers: number, bonus: number}>) ?? [])];
                    newMilestones[index].customers = parseInt(e.target.value) || 0;
                    handleUpdateConfig(program.id, {
                      ...program.config,
                      milestones: newMilestones,
                    });
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  placeholder="Count"
                />
                <span className="text-sm text-gray-600">customers →</span>
                <input
                  type="number"
                  value={milestone.bonus}
                  onChange={(e) => {
                    const newMilestones = [...((program.config.milestones as Array<{customers: number, bonus: number}>) ?? [])];
                    newMilestones[index].bonus = parseInt(e.target.value) || 0;
                    handleUpdateConfig(program.id, {
                      ...program.config,
                      milestones: newMilestones,
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Bonus"
                />
                <span className="text-sm text-gray-600">$ bonus</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading bonus programs...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bonus Programs</h3>
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
          <h2 className="text-xl font-bold text-gray-900">Bonus Programs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enable and configure bonus programs for your compensation plan
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {programs.map((program) => (
            <div key={program.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={program.enabled}
                        onChange={() => handleToggleEnabled(program.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      program.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {program.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{program.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>

              {/* Expanded Configuration Panel */}
              {expandedProgram === program.id && program.enabled && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {renderConfigPanel(program)}
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
