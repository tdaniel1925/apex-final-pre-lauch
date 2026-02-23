'use client';

// =============================================
// Earnings Calculator - Interactive Tool
// =============================================

import Link from 'next/link';
import { useState } from 'react';

export default function EarningsCalculatorPage() {
  // Calculator inputs
  const [personalEnrollments, setPersonalEnrollments] = useState(5);
  const [teamSize, setTeamSize] = useState(25);
  const [avgBV, setAvgBV] = useState(100);
  const [retailCustomers, setRetailCustomers] = useState(10);
  const [avgRetailOrder, setAvgRetailOrder] = useState(100);

  // Calculate earnings
  const calculateEarnings = () => {
    let breakdown = {
      retail: 0,
      matrix: 0,
      matching: 0,
      override: 0,
      fastStart: 0,
      total: 0,
    };

    // 1. Retail Commissions (30% profit)
    breakdown.retail = retailCustomers * avgRetailOrder * 0.30;

    // 2. Matrix Commissions (simplified - assumes even distribution across 7 levels)
    const matrixPercentages = [0.02, 0.03, 0.05, 0.06, 0.07, 0.08, 0.10];
    let matrixTotal = 0;

    // Simplified calculation: distribute team across levels
    const level1 = Math.min(personalEnrollments, 5);
    const level2 = Math.min(Math.floor((teamSize - level1) * 0.3), 25);
    const level3 = Math.min(Math.floor((teamSize - level1 - level2) * 0.4), 125);
    const remaining = teamSize - level1 - level2 - level3;

    const distribution = [level1, level2, level3, Math.floor(remaining * 0.3), Math.floor(remaining * 0.3), Math.floor(remaining * 0.2), Math.floor(remaining * 0.2)];

    distribution.forEach((count, index) => {
      matrixTotal += count * avgBV * matrixPercentages[index];
    });

    breakdown.matrix = matrixTotal;

    // 3. Matching Bonuses (10% of what your personal enrollments earn)
    // Assume each personal enrollment earns $200/month in commissions
    breakdown.matching = personalEnrollments * 200 * 0.10;

    // 4. Override Bonuses (simplified - assume 2% on half your team)
    breakdown.override = (teamSize / 2) * avgBV * 0.02;

    // 5. Fast Start Bonuses (one-time, show monthly average if enrolling)
    // Assume enrolling 1 person per month
    breakdown.fastStart = 100;

    breakdown.total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return breakdown;
  };

  const earnings = calculateEarnings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/compensation"
            className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">💰</div>
            <div>
              <h1 className="text-4xl font-bold">Earnings Calculator</h1>
              <p className="text-xl text-blue-200 mt-2">See your potential monthly income</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Numbers</h2>

              {/* Personal Enrollments */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">Personal Enrollments</label>
                  <span className="text-2xl font-bold text-[#2B4C7E]">{personalEnrollments}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={personalEnrollments}
                  onChange={(e) => setPersonalEnrollments(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4C7E]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>20</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">People YOU directly enrolled</p>
              </div>

              {/* Team Size */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">Total Team Size</label>
                  <span className="text-2xl font-bold text-[#2B4C7E]">{teamSize}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4C7E]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>500</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Everyone in your matrix (all 7 levels)</p>
              </div>

              {/* Average BV */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">Average BV per Person</label>
                  <span className="text-2xl font-bold text-[#2B4C7E]">{avgBV}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={avgBV}
                  onChange={(e) => setAvgBV(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4C7E]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span>300</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">How much BV each team member generates monthly</p>
              </div>

              {/* Retail Customers */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">Retail Customers</label>
                  <span className="text-2xl font-bold text-[#2B4C7E]">{retailCustomers}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={retailCustomers}
                  onChange={(e) => setRetailCustomers(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4C7E]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Non-distributor customers who buy products</p>
              </div>

              {/* Average Retail Order */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">Avg Retail Order</label>
                  <span className="text-2xl font-bold text-[#2B4C7E]">${avgRetailOrder}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={avgRetailOrder}
                  onChange={(e) => setAvgRetailOrder(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2B4C7E]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$50</span>
                  <span>$300</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Average order value from customers</p>
              </div>

              <button
                onClick={() => {
                  setPersonalEnrollments(5);
                  setTeamSize(25);
                  setAvgBV(100);
                  setRetailCustomers(10);
                  setAvgRetailOrder(100);
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Reset to Defaults
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> These are estimates based on average performance. Your actual earnings
                will vary based on your team's activity, product sales, and rank qualifications.
              </p>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-xl p-8 text-center">
              <div className="text-sm uppercase tracking-wide opacity-90 mb-2">Estimated Monthly Earnings</div>
              <div className="text-6xl font-bold mb-2">${earnings.total.toFixed(2)}</div>
              <div className="text-xl opacity-90">${(earnings.total * 12).toFixed(2)} per year</div>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Breakdown</h2>

              <div className="space-y-3">
                {/* Retail */}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">🛍️ Retail Commissions</div>
                    <div className="text-xs text-gray-600">{retailCustomers} customers × ${avgRetailOrder} × 30%</div>
                  </div>
                  <div className="text-xl font-bold text-[#2B4C7E]">${earnings.retail.toFixed(2)}</div>
                </div>

                {/* Matrix */}
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">📊 Matrix Commissions</div>
                    <div className="text-xs text-gray-600">{teamSize} people × {avgBV} BV × rates</div>
                  </div>
                  <div className="text-xl font-bold text-[#2B4C7E]">${earnings.matrix.toFixed(2)}</div>
                </div>

                {/* Matching */}
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">🎯 Matching Bonuses</div>
                    <div className="text-xs text-gray-600">{personalEnrollments} leaders × 10%</div>
                  </div>
                  <div className="text-xl font-bold text-[#2B4C7E]">${earnings.matching.toFixed(2)}</div>
                </div>

                {/* Override */}
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">👑 Override Bonuses</div>
                    <div className="text-xs text-gray-600">Leadership differentials</div>
                  </div>
                  <div className="text-xl font-bold text-[#2B4C7E]">${earnings.override.toFixed(2)}</div>
                </div>

                {/* Fast Start */}
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">⚡ Fast Start Bonus</div>
                    <div className="text-xs text-gray-600">$100 per new enrollment</div>
                  </div>
                  <div className="text-xl font-bold text-[#2B4C7E]">${earnings.fastStart.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Monthly Income:</span>
                  <span className="text-2xl text-green-600">${earnings.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Income Goals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What Could This Mean?</h2>

              <div className="space-y-3">
                {[
                  { goal: '$500/month', description: 'Cover car payment & groceries', achieved: earnings.total >= 500 },
                  { goal: '$1,000/month', description: 'Replace part-time job income', achieved: earnings.total >= 1000 },
                  { goal: '$2,500/month', description: 'Cover rent/mortgage', achieved: earnings.total >= 2500 },
                  { goal: '$5,000/month', description: 'Replace full-time income', achieved: earnings.total >= 5000 },
                  { goal: '$10,000/month', description: 'Financial freedom!', achieved: earnings.total >= 10000 },
                ].map((item) => (
                  <div
                    key={item.goal}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.achieved ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.achieved ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <div className={`font-semibold ${item.achieved ? 'text-green-900' : 'text-gray-700'}`}>
                          {item.goal}
                        </div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {item.achieved && <span className="text-2xl">🎉</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Make This Your Reality?</h3>
              <p className="text-blue-200 mb-4">
                Start building your team today and watch your income grow!
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get My Referral Link
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4 text-sm text-gray-600 text-center">
          <strong>Disclaimer:</strong> This calculator provides estimates only. Actual earnings will vary based on your effort,
          team performance, product sales, rank qualifications, and many other factors. Past performance and projected earnings
          are not a guarantee of future results.
        </div>
      </div>
    </div>
  );
}
