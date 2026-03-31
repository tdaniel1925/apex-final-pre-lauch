'use client';

import { useState, useEffect } from 'react';
import {
  calculateTechLadder,
  formatCurrency,
  formatPercentage,
  type TechCalculatorInput,
  type TechCalculatorOutput,
} from '@/lib/calculators/tech-ladder-calculator';
import { TECH_RANK_DISPLAY_NAMES, type TechRank } from '@/lib/compensation/config';

export default function TechCalculatorPage() {
  const [input, setInput] = useState<TechCalculatorInput>({
    personalQV: 500,
    teamQV: 1500,
    personalEnrollees: 2,
  });

  const [output, setOutput] = useState<TechCalculatorOutput | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Recalculate whenever input changes
  useEffect(() => {
    try {
      const result = calculateTechLadder(input);
      setOutput(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [input]);

  const handleInputChange = (field: keyof TechCalculatorInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInput((prev) => ({ ...prev, [field]: Math.max(0, numValue) }));
  };

  if (!output) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading calculator...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Tech Ladder Calculator</h1>
          <p className="mt-2 text-slate-600">
            Project your earnings potential based on personal sales and team growth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Numbers</h2>

              {/* Personal QV */}
              <div className="mb-6">
                <label htmlFor="personalQV" className="block text-sm font-semibold text-slate-700 mb-2">
                  Personal QV (Monthly)
                  <span
                    className="ml-2 text-slate-500 cursor-help"
                    title="Qualifying Volume from your personal sales each month"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  id="personalQV"
                  value={input.personalQV}
                  onChange={(e) => handleInputChange('personalQV', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="50"
                />
              </div>

              {/* Team QV */}
              <div className="mb-6">
                <label htmlFor="teamQV" className="block text-sm font-semibold text-slate-700 mb-2">
                  Team QV (Monthly)
                  <span
                    className="ml-2 text-slate-500 cursor-help"
                    title="Total QV from your entire team (including your personal QV)"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  id="teamQV"
                  value={input.teamQV}
                  onChange={(e) => handleInputChange('teamQV', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="100"
                />
              </div>

              {/* Personal Enrollees */}
              <div className="mb-6">
                <label htmlFor="personalEnrollees" className="block text-sm font-semibold text-slate-700 mb-2">
                  Personally Enrolled Distributors
                  <span
                    className="ml-2 text-slate-500 cursor-help"
                    title="Number of people you personally sponsored (not spillover)"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  id="personalEnrollees"
                  value={input.personalEnrollees}
                  onChange={(e) => handleInputChange('personalEnrollees', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1"
                />
              </div>

              {/* Comparison Mode Toggle */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    Show Rank Comparison
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Rank Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-100 mb-1">Your Qualified Rank</div>
                  <div className="text-4xl font-bold">
                    {TECH_RANK_DISPLAY_NAMES[output.currentRankQualification.rank]}
                  </div>
                  <div className="mt-2 text-blue-100">
                    Override Depth: L1-L{output.overrideDepth}
                  </div>
                </div>
                {output.rankBonus > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-100">Rank Bonus</div>
                    <div className="text-3xl font-bold">{formatCurrency(output.rankBonus)}</div>
                    <div className="text-xs text-blue-200 mt-1">One-time bonus</div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Income Projection */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Monthly Income Projection
              </h2>
              <div className="space-y-4">
                {/* Personal Commission */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">Personal Commission</div>
                    <div className="text-sm text-slate-600">60% of your personal BV</div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(output.monthlyIncomeProjection.personalCommission)}
                  </div>
                </div>

                {/* Override Income */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">Override Income</div>
                    <div className="text-sm text-slate-600">L1-L{output.overrideDepth} team commissions</div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(output.monthlyIncomeProjection.overrideIncome)}
                  </div>
                </div>

                {/* Bonus Pool */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">Bonus Pool Share</div>
                    <div className="text-sm text-slate-600">3.5% company pool</div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(output.monthlyIncomeProjection.bonusPoolShare)}
                  </div>
                </div>

                {/* Leadership Pool */}
                {output.monthlyIncomeProjection.leadershipPoolShare > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Leadership Pool</div>
                      <div className="text-sm text-slate-600">Diamond Ambassador only</div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(output.monthlyIncomeProjection.leadershipPoolShare)}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 bg-slate-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-slate-900">Total Monthly Income</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {formatCurrency(output.monthlyIncomeProjection.totalMonthly)}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Rank Requirements */}
            {output.nextRankRequirements && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Next Rank: {TECH_RANK_DISPLAY_NAMES[output.nextRankRequirements.nextRank!]}
                </h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                    <span>Progress</span>
                    <span>{formatPercentage(output.nextRankRequirements.progressPercentage)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${output.nextRankRequirements.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Missing Requirements */}
                <div className="space-y-3">
                  {output.nextRankRequirements.missingPersonalQV > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Personal QV Needed</span>
                      <span className="text-lg font-bold text-orange-600">
                        +{output.nextRankRequirements.missingPersonalQV}
                      </span>
                    </div>
                  )}
                  {output.nextRankRequirements.missingTeamQV > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Team QV Needed</span>
                      <span className="text-lg font-bold text-orange-600">
                        +{output.nextRankRequirements.missingTeamQV}
                      </span>
                    </div>
                  )}
                  {output.nextRankRequirements.missingDownline && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-slate-700 mb-1">Downline Requirement</div>
                      <div className="text-sm text-blue-700">
                        {output.nextRankRequirements.missingDownline}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rank Comparison Mode */}
            {comparisonMode && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">All Ranks Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Rank</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Personal QV</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Team QV</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {output.allRankQualifications.map((rq) => (
                        <tr
                          key={rq.rank}
                          className={`border-b border-slate-100 ${
                            rq.rank === output.currentRankQualification.rank
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {TECH_RANK_DISPLAY_NAMES[rq.rank]}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600">
                            {rq.requirements.personalQV.required}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600">
                            {rq.requirements.teamQV.required}
                          </td>
                          <td className="text-center py-3 px-4">
                            {rq.qualified ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                ✓ Qualified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                {formatPercentage(rq.progress)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-900">
                  <strong>Projection Tool:</strong> This calculator provides estimates based on your input.
                  Actual commissions are calculated by the official commission engine and may vary based on
                  team structure, product mix, and company policies.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
