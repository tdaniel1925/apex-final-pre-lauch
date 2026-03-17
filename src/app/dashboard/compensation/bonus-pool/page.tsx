'use client';

// =============================================
// Bonus Pool Programs - Incentive Programs
// Professional layout based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const bonusPrograms = [
  {
    id: 'trip',
    name: 'Trip Incentives',
    allocation: '25%',
    description: 'Achieve Gold rank within 90 days of joining and earn an all-expenses-paid trip',
    requirements: ['Achieve Gold rank (1,200 personal, 5,000 group credits)', 'Within 90 days of joining', '1 sponsored Bronze leader'],
    reward: 'All-expenses-paid destination trip',
  },
  {
    id: 'fast-start',
    name: 'Fast Start Bonuses',
    allocation: '20%',
    description: 'Three-tier bonuses for new representatives based on first 30 days performance',
    requirements: [
      'Tier 1: $250 bonus (150 personal credits in first 30 days)',
      'Tier 2: $500 bonus (500 personal credits in first 30 days)',
      'Tier 3: $1,000 bonus (1,200 personal credits in first 30 days)',
    ],
    reward: 'Cash bonuses paid after 30-day milestone',
  },
  {
    id: 'quarterly',
    name: 'Quarterly Contests',
    allocation: '15%',
    description: 'Top performers each quarter win cash prizes',
    requirements: [
      '1st Place: $5,000',
      '2nd Place: $3,000',
      '3rd Place: $2,000',
      'Additional prizes for top 10 performers',
    ],
    reward: 'Cash prizes distributed quarterly',
  },
  {
    id: 'car',
    name: 'Car Allowance',
    allocation: '15%',
    description: 'Monthly car allowances for Platinum rank and above',
    requirements: [
      'Platinum: $500/month',
      'Ruby: $750/month',
      'Diamond and above: $1,000/month',
    ],
    reward: 'Monthly payment for vehicle expenses',
  },
  {
    id: 'retreat',
    name: 'Leadership Retreat',
    allocation: '10%',
    description: 'Annual leadership retreat for Diamond rank and above',
    requirements: ['Diamond rank or higher', 'Active status (50+ credits/month)', 'Attend annual leadership event'],
    reward: 'All-expenses-paid leadership retreat',
  },
  {
    id: 'enhanced',
    name: 'Enhanced Rank Bonuses',
    allocation: '10%',
    description: '50% multiplier on rank bonuses if achieved within first 12 months',
    requirements: [
      'Achieve any rank within first 12 months',
      'Example: Gold bonus $3,000 → $4,500 with 50% multiplier',
    ],
    reward: '50% increase to standard rank bonuses',
  },
  {
    id: 'reserve',
    name: 'Reserve & Flex',
    allocation: '5%',
    description: 'Reserved for special promotions and company discretion',
    requirements: ['Varies by promotion', 'Announced periodically'],
    reward: 'Special one-time bonuses and promotions',
  },
];

export default function BonusPoolPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

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

  const toggleProgram = (id: string) => {
    setExpandedProgram(expandedProgram === id ? null : id);
  };

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
            {/* Breadcrumb */}
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

            <h1 className="text-4xl font-bold mb-4">Bonus Pool Programs</h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              Funded by 3.5% of company revenue, the Bonus Pool drives trip incentives, fast start bonuses, car
              allowances, quarterly contests, and enhanced rank bonuses.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">3.5%</div>
            <div className="text-sm text-slate-600 font-medium">of Company Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">7</div>
            <div className="text-sm text-slate-600 font-medium">Active Programs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">$1K</div>
            <div className="text-sm text-slate-600 font-medium">Monthly Car Allowance (Dia+)</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* How the Bonus Pool Works */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How the Bonus Pool Works</h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Funded by Revenue, Not Override Savings</h3>
                <p className="text-blue-800 leading-relaxed">
                  The Bonus Pool is funded by <span className="font-bold">3.5% of total company revenue</span> (after
                  company operations and product costs). This is a separate allocation from the commission pool
                  and override pool.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 text-lg">Revenue Allocation Breakdown</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="space-y-3 text-slate-700">
                <div className="flex justify-between items-center pb-2 border-b border-slate-300">
                  <span className="font-medium">Starting Point</span>
                  <span className="font-bold">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Company Operations</span>
                  <span className="text-red-600 font-semibold">-30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-700">Bonus Pool (3.5% of 49%)</span>
                  <span className="font-bold text-green-600">1.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Leadership Pool (1.5% of 49%)</span>
                  <span className="font-semibold">0.7%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-300">
                  <span>Commission Pool (95% of 49%)</span>
                  <span className="font-semibold">46.6%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Additional Funding Source</h3>
            <p className="text-amber-800 leading-relaxed">
              <span className="font-bold">50% of ranked override savings</span> also flows into the incentive budget.
              When lower-ranked reps don't use all 5 override levels, the saved override pool is split: 50% to Apex
              operations, 50% to additional incentive programs.
            </p>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Programs</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The Bonus Pool is allocated across seven programs designed to reward new reps, top performers, and leaders.
            Click any program to see full details.
          </p>

          <div className="space-y-4">
            {bonusPrograms.map((program) => (
              <div key={program.id} className="border-2 border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 transition-all">
                <button
                  onClick={() => toggleProgram(program.id)}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-16 h-16 bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                      {program.allocation}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{program.name}</h3>
                      <p className="text-sm text-slate-600">{program.description}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-slate-400 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedProgram === program.id && (
                  <div className="px-6 py-6 bg-white border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Requirements & Details</h4>
                        <ul className="space-y-2">
                          {program.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start text-slate-700">
                              <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Reward</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 font-medium">{program.reward}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Fast Start Details */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Fast Start Bonus Details</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            New representatives can earn immediate bonuses based on their first 30 days of performance. These bonuses
            stack with direct commissions and rank bonuses.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6 hover:border-slate-500 transition-all">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-slate-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tier 1</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">$250</div>
              </div>
              <div className="text-center text-sm text-slate-600">
                <p className="font-semibold mb-2">Requirement:</p>
                <p>150 personal credits in first 30 days</p>
                <p className="text-xs text-slate-500 mt-3">(Approx. 3-4 PulseFlow sales)</p>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-blue-400 rounded-lg p-6 hover:border-blue-600 transition-all">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tier 2</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">$500</div>
              </div>
              <div className="text-center text-sm text-slate-600">
                <p className="font-semibold mb-2">Requirement:</p>
                <p>500 personal credits in first 30 days</p>
                <p className="text-xs text-slate-500 mt-3">(Achieves Bronze rank requirements)</p>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-purple-400 rounded-lg p-6 hover:border-purple-600 transition-all">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tier 3</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">$1,000</div>
              </div>
              <div className="text-center text-sm text-slate-600">
                <p className="font-semibold mb-2">Requirement:</p>
                <p>1,200 personal credits in first 30 days</p>
                <p className="text-xs text-slate-500 mt-3">(Achieves Gold personal credit req)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h3 className="font-semibold text-green-900 mb-2">Example: New Rep First Month</h3>
            <div className="text-green-800 space-y-2">
              <p><span className="font-semibold">Scenario:</span> New rep generates 1,200 personal credits in first 30 days</p>
              <ul className="ml-4 space-y-1">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Direct commissions on sales: ~$1,000+</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Fast Start Tier 3 bonus: $1,000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Qualifies for Gold rank next month (if group credits met)</span>
                </li>
                <li className="flex items-start font-bold">
                  <span className="text-green-600 mr-2">→</span>
                  <span>Total first month earnings: $2,000+</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Car Allowance */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Car Allowance Program</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Platinum rank and above receive monthly car allowances to help cover vehicle expenses as you build your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Platinum</h3>
              <div className="text-4xl font-bold text-slate-700 mb-3">$500</div>
              <p className="text-sm text-slate-600">per month</p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ruby</h3>
              <div className="text-4xl font-bold text-red-700 mb-3">$750</div>
              <p className="text-sm text-slate-600">per month</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Diamond & Above</h3>
              <div className="text-4xl font-bold text-blue-700 mb-3">$1,000</div>
              <p className="text-sm text-slate-600">per month</p>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-300 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3">Qualification Requirements</h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-slate-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Maintain qualifying rank (Platinum, Ruby, Diamond, Crown, or Elite)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-slate-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Generate at least 50 personal credits/month (override qualification)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-slate-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Paid monthly with regular commission payouts</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Enhanced Rank Bonuses */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Enhanced Rank Bonuses</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            New representatives who achieve ranks within their first 12 months receive a <span className="font-bold">50%
            multiplier</span> on rank advancement bonuses.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Rank</th>
                  <th className="px-6 py-4 text-right font-semibold">Standard Bonus</th>
                  <th className="px-6 py-4 text-center font-semibold">Multiplier</th>
                  <th className="px-6 py-4 text-right font-semibold">Enhanced Bonus<br /><span className="text-xs font-normal text-slate-300">(First 12 Months)</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 bg-white">
                  <td className="px-6 py-3 font-semibold text-slate-900">Bronze</td>
                  <td className="px-6 py-3 text-right text-slate-700">$250</td>
                  <td className="px-6 py-3 text-center text-green-600 font-bold">×1.5</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">$375</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="px-6 py-3 font-semibold text-slate-900">Silver</td>
                  <td className="px-6 py-3 text-right text-slate-700">$1,000</td>
                  <td className="px-6 py-3 text-center text-green-600 font-bold">×1.5</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">$1,500</td>
                </tr>
                <tr className="border-b border-slate-200 bg-white">
                  <td className="px-6 py-3 font-semibold text-slate-900">Gold</td>
                  <td className="px-6 py-3 text-right text-slate-700">$3,000</td>
                  <td className="px-6 py-3 text-center text-green-600 font-bold">×1.5</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">$4,500</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="px-6 py-3 font-semibold text-slate-900">Platinum</td>
                  <td className="px-6 py-3 text-right text-slate-700">$7,500</td>
                  <td className="px-6 py-3 text-center text-green-600 font-bold">×1.5</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">$11,250</td>
                </tr>
                <tr className="border-b border-slate-200 bg-white">
                  <td className="px-6 py-3 font-semibold text-slate-900">Ruby</td>
                  <td className="px-6 py-3 text-right text-slate-700">$12,000</td>
                  <td className="px-6 py-3 text-center text-green-600 font-bold">×1.5</td>
                  <td className="px-6 py-3 text-right font-bold text-green-600">$18,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h3 className="font-semibold text-green-900 mb-2">Fast Builder Example</h3>
            <p className="text-green-800 leading-relaxed mb-3">
              A new rep who achieves Platinum within 9 months receives <span className="font-bold">$11,250</span> instead
              of the standard $7,500 rank bonus. Combined with Bronze ($375) + Silver ($1,500) + Gold ($4,500) bonuses
              along the way, they've earned <span className="font-bold">$17,625 in rank bonuses</span> in under a year.
            </p>
            <p className="text-green-800 font-semibold">
              Total enhanced bonuses (Starter to Platinum in first 12 months): $17,625 vs. standard $11,750
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Maximize Your Bonus Pool Earnings</h2>
          <p className="text-slate-200 mb-6 leading-relaxed">
            The Bonus Pool provides multiple opportunities to earn beyond direct commissions and overrides. Fast starters,
            consistent performers, and leaders all benefit from these incentive programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/compensation/rank-bonuses"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Rank Bonuses
            </Link>
            <Link
              href="/dashboard/compensation/calculator"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Total Potential
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
