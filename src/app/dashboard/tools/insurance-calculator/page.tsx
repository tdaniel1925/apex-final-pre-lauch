'use client';

import { useState, useEffect } from 'react';
import {
  calculateInsuranceLadder,
  formatCurrency,
  formatPercentage,
  INSURANCE_RANK_DISPLAY_NAMES,
  WEEKLY_PRODUCTION_BONUSES,
  type InsuranceCalculatorInput,
  type InsuranceCalculatorOutput,
} from '@/lib/calculators/insurance-ladder-calculator';

export default function InsuranceCalculatorPage() {
  const [input, setInput] = useState<InsuranceCalculatorInput>({
    monthlyPremiumVolume: 30000,
    licensedRecruits: 3,
  });

  const [output, setOutput] = useState<InsuranceCalculatorOutput | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Recalculate whenever input changes
  useEffect(() => {
    try {
      const result = calculateInsuranceLadder(input);
      setOutput(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [input]);

  const handleInputChange = (field: keyof InsuranceCalculatorInput, value: string) => {
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

  const weeklyPremium = input.monthlyPremiumVolume / 4;
  const qualifiesForWeeklyBonus = WEEKLY_PRODUCTION_BONUSES.find(
    (tier) => weeklyPremium >= tier.threshold
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Insurance Ladder Calculator</h1>
          <p className="mt-2 text-slate-600">
            Project your insurance earnings based on premium volume and team growth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Numbers</h2>

              {/* Monthly Premium Volume */}
              <div className="mb-6">
                <label
                  htmlFor="monthlyPremiumVolume"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Monthly Premium Volume
                  <span
                    className="ml-2 text-slate-500 cursor-help"
                    title="Total monthly premium from policies you sell"
                  >
                    ℹ️
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    id="monthlyPremiumVolume"
                    value={input.monthlyPremiumVolume}
                    onChange={(e) => handleInputChange('monthlyPremiumVolume', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* Licensed Recruits */}
              <div className="mb-6">
                <label
                  htmlFor="licensedRecruits"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Licensed Recruits
                  <span
                    className="ml-2 text-slate-500 cursor-help"
                    title="Number of licensed agents you've recruited"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="number"
                  id="licensedRecruits"
                  value={input.licensedRecruits}
                  onChange={(e) => handleInputChange('licensedRecruits', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1"
                />
              </div>

              {/* 90-Day Volume Display */}
              <div className="p-4 bg-slate-50 rounded-lg mb-6">
                <div className="text-sm font-semibold text-slate-700 mb-1">90-Day Volume</div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(input.monthlyPremiumVolume * 3)}
                </div>
                <div className="text-xs text-slate-600 mt-1">Used for rank qualification</div>
              </div>

              {/* Weekly Production Bonus Indicator */}
              {qualifiesForWeeklyBonus && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-sm font-bold text-green-800">Weekly Bonus Qualified!</span>
                  </div>
                  <div className="text-xs text-green-700">
                    ${formatCurrency(weeklyPremium)} weekly premium qualifies for $
                    {qualifiesForWeeklyBonus.bonus}/week bonus
                  </div>
                </div>
              )}

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
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-100 mb-1">Your Insurance Rank</div>
                  <div className="text-4xl font-bold">
                    {INSURANCE_RANK_DISPLAY_NAMES[output.currentRankQualification.rank]}
                  </div>
                  <div className="mt-2 text-emerald-100">
                    Direct Commission: {formatPercentage(output.commissionRate * 100)}
                  </div>
                  {output.generationalDepth > 0 && (
                    <div className="text-emerald-100">
                      Generational Depth: {output.generationalDepth} levels
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Income Projection */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Monthly Income Projection
              </h2>
              <div className="space-y-4">
                {/* Direct Commission */}
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">Direct Commission</div>
                    <div className="text-sm text-slate-600">
                      {formatPercentage(output.commissionRate * 100)} on ${formatCurrency(input.monthlyPremiumVolume)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(output.monthlyIncomeProjection.directCommission)}
                  </div>
                </div>

                {/* Generational Overrides */}
                {output.generationalDepth > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Generational Overrides</div>
                      <div className="text-sm text-slate-600">
                        {output.generationalDepth} levels from team production
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(output.monthlyIncomeProjection.generationalOverrides)}
                    </div>
                  </div>
                )}

                {/* Weekly Bonuses */}
                {output.monthlyIncomeProjection.weeklyBonuses > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-900">Weekly Production Bonuses</div>
                      <div className="text-sm text-slate-600">4 weeks × bonus tier</div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(output.monthlyIncomeProjection.weeklyBonuses)}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 bg-slate-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-slate-900">Total Monthly Income</div>
                  <div className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(output.monthlyIncomeProjection.totalMonthly)}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Bonus Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Weekly Production Bonuses</h2>
              <div className="space-y-3">
                {WEEKLY_PRODUCTION_BONUSES.map((tier) => {
                  const isQualified = weeklyPremium >= tier.threshold;
                  return (
                    <div
                      key={tier.threshold}
                      className={`p-4 rounded-lg border-2 ${
                        isQualified
                          ? 'bg-green-50 border-green-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(tier.threshold)} Weekly Premium
                          </div>
                          <div className="text-sm text-slate-600">
                            ${tier.bonus} bonus per week ({formatCurrency(tier.bonus * 4)}/month)
                          </div>
                        </div>
                        {isQualified ? (
                          <span className="text-2xl">✅</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Rank Requirements */}
            {output.nextRankRequirements && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Next Rank: {INSURANCE_RANK_DISPLAY_NAMES[output.nextRankRequirements.nextRank!]}
                </h2>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                    <span>Progress</span>
                    <span>{formatPercentage(output.nextRankRequirements.progressPercentage)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${output.nextRankRequirements.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Missing Requirements */}
                <div className="space-y-3">
                  {output.nextRankRequirements.missingPremiumVolume > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        90-Day Premium Needed
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        +{formatCurrency(output.nextRankRequirements.missingPremiumVolume)}
                      </span>
                    </div>
                  )}
                  {output.nextRankRequirements.missingLicensedRecruits > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Licensed Recruits Needed
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        +{output.nextRankRequirements.missingLicensedRecruits}
                      </span>
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
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">
                          90-Day Volume
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">
                          Recruits
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {output.allRankQualifications.map((rq) => (
                        <tr
                          key={rq.rank}
                          className={`border-b border-slate-100 ${
                            rq.rank === output.currentRankQualification.rank
                              ? 'bg-emerald-50'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {INSURANCE_RANK_DISPLAY_NAMES[rq.rank]}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600">
                            {formatCurrency(rq.requirements.premiumVolume.required)}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-600">
                            {rq.requirements.licensedRecruits?.required || '—'}
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
                  Actual insurance commissions depend on carrier contracts, policy types, persistency rates,
                  and state regulations. Consult your agency for specific commission details.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
