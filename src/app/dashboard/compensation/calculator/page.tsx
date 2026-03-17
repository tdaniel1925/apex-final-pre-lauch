'use client';

// =============================================
// Earnings Calculator - Dual Ladder System
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Product data with credits
const products = [
  { name: 'PulseGuard', memberPrice: 59, retailPrice: 79, memberCredits: 18, retailCredits: 24, memberCommission: 16.48, retailCommission: 22.06 },
  { name: 'PulseFlow', memberPrice: 129, retailPrice: 149, memberCredits: 65, retailCredits: 75, memberCommission: 36.03, retailCommission: 41.62 },
  { name: 'PulseDrive', memberPrice: 219, retailPrice: 299, memberCredits: 110, retailCredits: 150, memberCommission: 61.17, retailCommission: 83.51 },
  { name: 'PulseCommand', memberPrice: 349, retailPrice: 499, memberCredits: 175, retailCredits: 250, memberCommission: 97.48, retailCommission: 139.37 },
  { name: 'SmartLook', memberPrice: 99, retailPrice: 99, memberCredits: 50, retailCredits: 50, memberCommission: 27.65, retailCommission: 27.65 },
  { name: 'Business Center', memberPrice: 39, retailPrice: null, memberCredits: 39, retailCredits: null, memberCommission: 10.00, retailCommission: null },
];

// Tech rank data
const techRanks = [
  { name: 'Starter', personalCredits: 0, groupCredits: 0, bonus: 0, l1: 30, l2: 0, l3: 0, l4: 0, l5: 0 },
  { name: 'Bronze', personalCredits: 150, groupCredits: 300, bonus: 250, l1: 30, l2: 5, l3: 0, l4: 0, l5: 0 },
  { name: 'Silver', personalCredits: 500, groupCredits: 1500, bonus: 1000, l1: 30, l2: 10, l3: 5, l4: 0, l5: 0 },
  { name: 'Gold', personalCredits: 1200, groupCredits: 5000, bonus: 3000, l1: 30, l2: 15, l3: 10, l4: 5, l5: 0 },
  { name: 'Platinum', personalCredits: 2500, groupCredits: 15000, bonus: 7500, l1: 30, l2: 18, l3: 12, l4: 8, l5: 3 },
  { name: 'Ruby', personalCredits: 4000, groupCredits: 30000, bonus: 12000, l1: 30, l2: 20, l3: 15, l4: 10, l5: 5 },
  { name: 'Diamond', personalCredits: 5000, groupCredits: 50000, bonus: 18000, l1: 30, l2: 22, l3: 18, l4: 12, l5: 8 },
  { name: 'Crown', personalCredits: 6000, groupCredits: 75000, bonus: 22000, l1: 30, l2: 25, l3: 20, l4: 15, l5: 10 },
  { name: 'Elite', personalCredits: 8000, groupCredits: 120000, bonus: 30000, l1: 30, l2: 25, l3: 20, l4: 15, l5: 10 },
];

export default function EarningsCalculatorPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User inputs
  const [personalSales, setPersonalSales] = useState({ member: 5, retail: 10 });
  const [avgProduct, setAvgProduct] = useState('PulseFlow');
  const [teamSize, setTeamSize] = useState(50);
  const [avgTeamProductionPerPerson, setAvgTeamProductionPerPerson] = useState(100);
  const [selectedRank, setSelectedRank] = useState('Gold');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const calculateEarnings = () => {
    const product = products.find((p) => p.name === avgProduct);
    if (!product) return { directCommissions: 0, overrides: 0, total: 0, personalCredits: 0, groupCredits: 0 };

    // 1. Direct Commissions
    const memberCommissions = personalSales.member * product.memberCommission;
    const retailCommissions = personalSales.retail * (product.retailCommission || product.memberCommission);
    const directCommissions = memberCommissions + retailCommissions;

    // 2. Personal Credits
    const memberCredits = personalSales.member * product.memberCredits;
    const retailCredits = personalSales.retail * (product.retailCredits || product.memberCredits);
    const personalCredits = memberCredits + retailCredits;

    // 3. Group Credits (estimate based on team size and avg production)
    const groupCredits = teamSize * avgTeamProductionPerPerson;

    // 4. Current Rank
    const rank = techRanks.find((r) => r.name === selectedRank);
    if (!rank) return { directCommissions: 0, overrides: 0, total: 0, personalCredits: 0, groupCredits: 0 };

    // 5. Override Commissions (simplified estimate)
    // Assume override pool is ~17.6% of sales, distributed across levels based on rank
    const avgSalePrice = (product.memberPrice + (product.retailPrice || product.memberPrice)) / 2;
    const overridePool = avgSalePrice * 0.176;

    // Estimate: 20% of team is L1, 30% L2, 25% L3, 15% L4, 10% L5
    const levelDistribution = [0.20, 0.30, 0.25, 0.15, 0.10];
    let overrideEarnings = 0;

    levelDistribution.forEach((pct, idx) => {
      const levelPeople = Math.floor(teamSize * pct);
      const levelRate = [rank.l1, rank.l2, rank.l3, rank.l4, rank.l5][idx] / 100;
      overrideEarnings += levelPeople * overridePool * levelRate;
    });

    const total = directCommissions + overrideEarnings;

    return {
      directCommissions,
      overrides: overrideEarnings,
      total,
      personalCredits,
      groupCredits,
      qualifiesForRank: personalCredits >= rank.personalCredits && groupCredits >= rank.groupCredits,
    };
  };

  const earnings = calculateEarnings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="mb-6">
              <Link
                href="/dashboard/compensation"
                className="text-slate-300 hover:text-white transition-colors inline-flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Compensation Plan
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">Earnings Calculator</h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              Estimate your potential monthly earnings based on personal sales, team size, and rank.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Inputs */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Numbers</h2>

              {/* Personal Sales */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Personal Sales Per Month</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-2">Member Sales</label>
                    <input
                      type="number"
                      value={personalSales.member}
                      onChange={(e) => setPersonalSales({ ...personalSales, member: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-2">Retail Sales</label>
                    <input
                      type="number"
                      value={personalSales.retail}
                      onChange={(e) => setPersonalSales({ ...personalSales, retail: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Average Product */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Average Product Sold</label>
                <select
                  value={avgProduct}
                  onChange={(e) => setAvgProduct(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  {products.filter(p => p.name !== 'Business Center').map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} (Member: ${p.memberPrice}, Retail: ${p.retailPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Size */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Team Size (Total Organization)
                </label>
                <input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-2">Total number of distributors in your organization</p>
              </div>

              {/* Avg Team Production */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Avg Team Member Production (Credits/Month)
                </label>
                <input
                  type="number"
                  value={avgTeamProductionPerPerson}
                  onChange={(e) => setAvgTeamProductionPerPerson(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-2">Average monthly credits per team member</p>
              </div>

              {/* Current Rank */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Your Current Rank</label>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  {techRanks.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} ({r.personalCredits} personal, {r.groupCredits} group credits)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right - Results */}
          <div className="space-y-6">
            {/* Earnings Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Estimated Monthly Earnings</h2>

              <div className="space-y-4">
                {/* Direct Commissions */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Direct Commissions</div>
                    <div className="text-xs text-slate-600">
                      {personalSales.member} member + {personalSales.retail} retail sales
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    ${earnings.directCommissions.toFixed(2)}
                  </div>
                </div>

                {/* Override Bonuses */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Override Bonuses</div>
                    <div className="text-xs text-slate-600">
                      {selectedRank} rank on {teamSize} team members
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    ${earnings.overrides.toFixed(2)}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 bg-slate-50 -mx-8 px-8 py-4 rounded-lg">
                  <div className="font-bold text-slate-900 text-lg">Total Monthly Income</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${earnings.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Summary */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Production Credits</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Personal Credits</span>
                  <span className="font-bold text-slate-900">{earnings.personalCredits.toFixed(0)} credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Group Credits (estimate)</span>
                  <span className="font-bold text-slate-900">{earnings.groupCredits.toFixed(0)} credits</span>
                </div>
              </div>

              {/* Rank Qualification Status */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                {earnings.qualifiesForRank ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <div className="font-semibold text-green-900">Qualifies for {selectedRank} Rank</div>
                        <div className="text-sm text-green-700 mt-1">
                          You meet the credit requirements for this rank.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-amber-900">Below {selectedRank} Requirements</div>
                        <div className="text-sm text-amber-700 mt-1">
                          Need {techRanks.find(r => r.name === selectedRank)?.personalCredits} personal credits and{' '}
                          {techRanks.find(r => r.name === selectedRank)?.groupCredits} group credits.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>This is an estimate based on simplified assumptions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Actual earnings depend on team structure, product mix, and qualification</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You must generate 50+ personal credits/month to earn overrides</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Rank bonuses, bonus pool, and leadership pool not included</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
