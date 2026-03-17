'use client';

// =============================================
// Rank Advancement Bonuses - Tech Ladder
// Professional layout based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const rankBonuses = [
  {
    rank: 'Starter',
    level: 1,
    bonus: 0,
    personalCredits: 0,
    groupCredits: 0,
    downlineReq: 'None',
    cumulative: 0,
  },
  {
    rank: 'Bronze',
    level: 2,
    bonus: 250,
    personalCredits: 150,
    groupCredits: 300,
    downlineReq: 'None',
    cumulative: 250,
  },
  {
    rank: 'Silver',
    level: 3,
    bonus: 1000,
    personalCredits: 500,
    groupCredits: 1500,
    downlineReq: 'None',
    cumulative: 1250,
  },
  {
    rank: 'Gold',
    level: 4,
    bonus: 3000,
    personalCredits: 1200,
    groupCredits: 5000,
    downlineReq: '1 Bronze (sponsored)',
    cumulative: 4250,
  },
  {
    rank: 'Platinum',
    level: 5,
    bonus: 7500,
    personalCredits: 2500,
    groupCredits: 15000,
    downlineReq: '2 Silvers (sponsored)',
    cumulative: 11750,
  },
  {
    rank: 'Ruby',
    level: 6,
    bonus: 12000,
    personalCredits: 4000,
    groupCredits: 30000,
    downlineReq: '2 Golds (sponsored)',
    cumulative: 23750,
  },
  {
    rank: 'Diamond',
    level: 7,
    bonus: 18000,
    personalCredits: 5000,
    groupCredits: 50000,
    downlineReq: '3 Golds OR 2 Plat (sponsored)',
    cumulative: 41750,
  },
  {
    rank: 'Crown',
    level: 8,
    bonus: 22000,
    personalCredits: 6000,
    groupCredits: 75000,
    downlineReq: '2 Plat + 1 Gold (sponsored)',
    cumulative: 63750,
  },
  {
    rank: 'Elite',
    level: 9,
    bonus: 30000,
    personalCredits: 8000,
    groupCredits: 120000,
    downlineReq: '3 Plat OR 2 Diamond (sponsored)',
    cumulative: 93750,
  },
];

export default function RankBonusesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const totalBonuses = rankBonuses.reduce((sum, rank) => sum + rank.bonus, 0);

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

            <h1 className="text-4xl font-bold mb-4">Rank Advancement Bonuses</h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              Receive one-time cash bonuses when you achieve each new rank on the Technology Ladder.
              Total potential: <span className="font-bold">${totalBonuses.toLocaleString()}</span> from Starter to Elite.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">${totalBonuses.toLocaleString()}</div>
            <div className="text-sm text-slate-600 font-medium">Total Bonuses (Starter to Elite)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">$30K</div>
            <div className="text-sm text-slate-600 font-medium">Elite Rank Bonus</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">Once</div>
            <div className="text-sm text-slate-600 font-medium">Per Rank, Per Lifetime</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* How It Works */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Rank Bonuses Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">One-Time Payment</h3>
                  <p className="text-green-800 leading-relaxed">
                    Each rank bonus is paid <span className="font-bold">once per lifetime</span> when you first achieve
                    that rank. If you later drop below the rank requirements and re-qualify, you do NOT receive a second bonus.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Promotion Takes Effect Next Month</h3>
                  <p className="text-blue-800 leading-relaxed">
                    Rank evaluations happen at the end of each month. If you qualify for a promotion, it takes effect
                    on the <span className="font-bold">first day of the next month</span>, and the bonus is paid shortly after.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Qualification Required</h3>
                  <p className="text-amber-800 leading-relaxed">
                    You must meet <span className="font-bold">all requirements</span> for a rank (personal credits, group
                    credits, and sponsored downline ranks) and be generating at least <span className="font-bold">50 personal
                    credits/month</span> to receive the bonus.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Highest Rank Tracked</h3>
                  <p className="text-purple-800 leading-relaxed">
                    Your <span className="font-bold">highest achieved rank</span> is tracked separately from your current
                    rank. Bonuses are based on highest rank achieved, not current rank.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rank Bonus Table */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rank Bonus Schedule</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Here's the complete breakdown of rank advancement bonuses, requirements, and cumulative totals:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Rank</th>
                  <th className="px-6 py-4 text-right font-semibold">Bonus</th>
                  <th className="px-6 py-4 text-right font-semibold">Cumulative</th>
                  <th className="px-6 py-4 text-right font-semibold">Personal<br /><span className="text-xs font-normal text-slate-300">Credits/Mo</span></th>
                  <th className="px-6 py-4 text-right font-semibold">Group<br /><span className="text-xs font-normal text-slate-300">Credits/Mo</span></th>
                  <th className="px-6 py-4 text-left font-semibold">Sponsored Downline Requirement</th>
                </tr>
              </thead>
              <tbody>
                {rankBonuses.map((rank, idx) => (
                  <tr
                    key={rank.rank}
                    className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold text-sm mr-3">
                          {rank.level}
                        </div>
                        <span className="font-semibold text-slate-900">{rank.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${rank.bonus > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {rank.bonus > 0 ? `$${rank.bonus.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-slate-700">
                        {rank.cumulative > 0 ? `$${rank.cumulative.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700">
                      {rank.personalCredits > 0 ? rank.personalCredits.toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700">
                      {rank.groupCredits > 0 ? rank.groupCredits.toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{rank.downlineReq}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white font-bold">
                  <td className="px-6 py-4">TOTAL</td>
                  <td className="px-6 py-4 text-right text-xl">${totalBonuses.toLocaleString()}</td>
                  <td colSpan={4} className="px-6 py-4 text-right text-slate-300 text-sm">
                    Total potential from Starter to Elite
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-semibold">Cumulative</span> shows the total bonuses you've earned from Starter to that rank</span>
            </p>
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-semibold">Sponsored</span> means you personally enrolled them (not spillover or placement)</span>
            </p>
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-semibold">OR conditions</span> (Diamond, Elite) mean you can meet either requirement</span>
            </p>
          </div>
        </section>

        {/* Demotion & Re-Qualification */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Demotion & Re-Qualification</h2>

          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Grace Period
              </h3>
              <p className="text-slate-700 leading-relaxed">
                If you fall below the requirements for your current rank, you have a <span className="font-bold">2-month
                grace period</span> before demotion. This gives you time to rebuild your production and team without
                immediately losing your rank benefits.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                6-Month Rank Lock
              </h3>
              <p className="text-slate-700 leading-relaxed">
                New representatives who achieve a rank within their <span className="font-bold">first 6 months</span> are
                locked at that rank for 6 months (no demotion). This protects new team builders as they develop their skills
                and organization.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-Qualification
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can re-qualify for any rank at any time by meeting the requirements again. There is <span className="font-bold">no
                waiting period</span> for re-qualification. However, you do NOT receive the rank bonus a second time.
              </p>
              <div className="bg-white border border-slate-300 rounded p-4">
                <p className="text-sm text-slate-600 mb-2"><span className="font-semibold">Example:</span></p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Month 6: Achieve Gold rank, receive $3,000 bonus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Month 9: Drop to Silver (failed to maintain requirements for 2 months)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Month 11: Re-qualify for Gold rank</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-green-700 font-medium">Outcome: Gold rank restored, no additional bonus paid</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Minimum Floor: Starter Rank
              </h3>
              <p className="text-slate-700 leading-relaxed">
                You can never drop below <span className="font-bold">Starter rank</span>. Even if you have zero production,
                you'll remain at Starter rank and can always earn the <span className="font-bold">27.9% direct commission</span> on
                personal sales.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Timeline */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Timeline</h2>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                  1
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-slate-900 mb-1">Month End: Rank Evaluation</h3>
                  <p className="text-slate-600">
                    At the end of each month, the system evaluates all members for rank advancement based on the
                    month's production and team performance.
                  </p>
                </div>
              </div>

              <div className="ml-6 border-l-2 border-slate-300 h-6" />

              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                  2
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-slate-900 mb-1">Next Month: Promotion Takes Effect</h3>
                  <p className="text-slate-600">
                    If you qualified for a promotion, it takes effect on the first day of the next month. Your new
                    rank's override schedule and benefits are now active.
                  </p>
                </div>
              </div>

              <div className="ml-6 border-l-2 border-slate-300 h-6" />

              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                  3
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-slate-900 mb-1">Shortly After: Bonus Paid</h3>
                  <p className="text-slate-600">
                    The rank advancement bonus is paid shortly after your promotion takes effect, typically within
                    the first week of the new month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Building Toward Your Next Rank</h2>
          <p className="text-slate-200 mb-6 leading-relaxed">
            Rank advancement bonuses provide significant one-time payments as you build your business. Combined with
            direct commissions, override bonuses, and bonus pool programs, the Technology Ladder offers multiple income
            streams at every level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/compensation/tech-ladder"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Review Tech Ladder Requirements
            </Link>
            <Link
              href="/dashboard/compensation/calculator"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Your Path to Elite
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
