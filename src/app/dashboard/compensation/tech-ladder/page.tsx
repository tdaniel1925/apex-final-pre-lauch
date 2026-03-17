'use client';

// =============================================
// Technology Ladder - 9 Ranks
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md Section 4
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const techRanks = [
  {
    rank: 'Starter',
    level: 1,
    personalCredits: 0,
    groupCredits: 0,
    downlineReq: 'None',
    rankBonus: 0,
    overrideLevels: 'L1 only',
    description: 'Everyone starts here. Begin earning commissions immediately.',
  },
  {
    rank: 'Bronze',
    level: 2,
    personalCredits: 150,
    groupCredits: 300,
    downlineReq: 'None',
    rankBonus: 250,
    overrideLevels: 'L1-L2',
    description: 'First rank achievement. Unlock L2 overrides.',
  },
  {
    rank: 'Silver',
    level: 3,
    personalCredits: 500,
    groupCredits: 1500,
    downlineReq: 'None',
    rankBonus: 1000,
    overrideLevels: 'L1-L3',
    description: 'Solid foundation. L3 overrides unlocked.',
  },
  {
    rank: 'Gold',
    level: 4,
    personalCredits: 1200,
    groupCredits: 5000,
    downlineReq: '1 Bronze (sponsored)',
    rankBonus: 3000,
    overrideLevels: 'L1-L4',
    description: 'Leadership begins. First downline requirement.',
  },
  {
    rank: 'Platinum',
    level: 5,
    personalCredits: 2500,
    groupCredits: 15000,
    downlineReq: '2 Silvers (sponsored)',
    rankBonus: 7500,
    overrideLevels: 'L1-L5',
    description: 'Advanced leadership. Full override depth unlocked.',
  },
  {
    rank: 'Ruby',
    level: 6,
    personalCredits: 4000,
    groupCredits: 30000,
    downlineReq: '2 Golds (sponsored)',
    rankBonus: 12000,
    overrideLevels: 'L1-L5',
    description: 'Elite status. Building Gold leaders.',
  },
  {
    rank: 'Diamond',
    level: 7,
    personalCredits: 5000,
    groupCredits: 50000,
    downlineReq: '3 Golds OR 2 Platinums (sponsored)',
    rankBonus: 18000,
    overrideLevels: 'L1-L5',
    description: 'Top tier. Multiple pathways to qualify.',
  },
  {
    rank: 'Crown',
    level: 8,
    personalCredits: 6000,
    groupCredits: 75000,
    downlineReq: '2 Platinums + 1 Gold (sponsored)',
    rankBonus: 22000,
    overrideLevels: 'L1-L5',
    description: 'Near pinnacle. Building Platinum leaders.',
  },
  {
    rank: 'Elite',
    level: 9,
    personalCredits: 8000,
    groupCredits: 120000,
    downlineReq: '3 Platinums OR 2 Diamonds (sponsored)',
    rankBonus: 30000,
    overrideLevels: 'L1-L5 + Leadership Pool',
    description: 'Highest rank. Leadership pool access.',
  },
];

export default function TechLadderPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

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

  const totalBonuses = techRanks.reduce((sum, rank) => sum + rank.rankBonus, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-4">
            <Link
              href="/dashboard/compensation"
              className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Compensation Plan
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Technology Ladder</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Build your income through technology product sales and team development. Advance through 9 ranks based on personal and group production credits.
          </p>
        </div>
      </div>

      {/* Key Points */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">9 Ranks</div>
              <div className="text-sm text-slate-600">Starter to Elite</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">${totalBonuses.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Rank Bonuses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">Credit-Based</div>
              <div className="text-sm text-slate-600">No Account Quotas</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Rank Advancement Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Personal Credits:</strong> Monthly production from your own sales</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Group Credits:</strong> Total organization production including you</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Downline Leaders:</strong> Personally sponsored reps at specified ranks (Gold+)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Important Rules</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Promotions take effect the 1st of the following month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>2-month grace period before demotion for missing requirements</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>New reps: 6-month rank lock on first achieved rank</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Rank bonuses paid once per lifetime (no repeat on re-qualification)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Override Qualification</h3>
            <p className="text-slate-700">
              To earn override bonuses and incentive programs, you must generate at least <strong>50 personal credits per month</strong>.
              Direct commissions are always paid regardless of credit volume.
            </p>
          </div>
        </div>
      </div>

      {/* Rank Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Rank Requirements & Bonuses</h2>

        <div className="space-y-4">
          {techRanks.map((rank) => (
            <div
              key={rank.level}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-slate-300 transition-all"
            >
              <button
                onClick={() => setExpandedRank(expandedRank === rank.level ? null : rank.level)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-lg font-bold text-lg">
                    {rank.level}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{rank.rank}</h3>
                    <p className="text-sm text-slate-600 mt-1">{rank.description}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-slate-900">
                      {rank.rankBonus > 0 ? `$${rank.rankBonus.toLocaleString()}` : 'No Bonus'}
                    </div>
                    <div className="text-xs text-slate-600">Rank Bonus</div>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 ml-4 transition-transform ${
                    expandedRank === rank.level ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedRank === rank.level && (
                <div className="px-6 pb-6 border-t border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Monthly Requirements</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Personal Credits</span>
                          <span className="font-semibold text-slate-900">
                            {rank.personalCredits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Group Credits</span>
                          <span className="font-semibold text-slate-900">
                            {rank.groupCredits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Downline Leaders</span>
                          <span className="font-semibold text-slate-900">{rank.downlineReq}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Benefits</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Override Levels</span>
                          <span className="font-semibold text-slate-900">{rank.overrideLevels}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">One-Time Bonus</span>
                          <span className="font-semibold text-slate-900">
                            {rank.rankBonus > 0 ? `$${rank.rankBonus.toLocaleString()}` : 'None'}
                          </span>
                        </div>
                        {rank.level >= 5 && (
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Car Bonus Eligible</span>
                            <span className="font-semibold text-green-600">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Building Your Tech Ladder Income</h2>
          <p className="text-xl text-slate-200 mb-8">
            Every rep starts at Starter rank and begins earning commissions immediately. As you grow your sales and team, advance through the ranks to unlock higher override levels and bonuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/products"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              View Products & Credits
            </Link>
            <Link
              href="/dashboard/compensation/overrides"
              className="bg-slate-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              Learn About Overrides
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
