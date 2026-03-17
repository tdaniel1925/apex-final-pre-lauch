'use client';

// =============================================
// Override Bonuses - Dual Ladder System
// Professional layout based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const overrideSchedule = [
  { rank: 'Starter', l1: '30%', l2: '—', l3: '—', l4: '—', l5: '—' },
  { rank: 'Bronze', l1: '30%', l2: '5%', l3: '—', l4: '—', l5: '—' },
  { rank: 'Silver', l1: '30%', l2: '10%', l3: '5%', l4: '—', l5: '—' },
  { rank: 'Gold', l1: '30%', l2: '15%', l3: '10%', l4: '5%', l5: '—' },
  { rank: 'Platinum', l1: '30%', l2: '18%', l3: '12%', l4: '8%', l5: '3%' },
  { rank: 'Ruby', l1: '30%', l2: '20%', l3: '15%', l4: '10%', l5: '5%' },
  { rank: 'Diamond', l1: '30%', l2: '22%', l3: '18%', l4: '12%', l5: '8%' },
  { rank: 'Crown', l1: '30%', l2: '25%', l3: '20%', l4: '15%', l5: '10%' },
  { rank: 'Elite', l1: '30%', l2: '25%', l3: '20%', l4: '15%', l5: '10%' },
];

const exampleProduct = {
  name: 'PulseCommand',
  retailPrice: 499,
  overridePool: 92.91,
  levels: [
    { level: 'L1', percent: '30%', amount: 27.87, description: 'Personal enrollees always get this rate' },
    { level: 'L2', percent: '25%', amount: 23.23, description: 'Crown/Elite only' },
    { level: 'L3', percent: '20%', amount: 18.58, description: 'Crown/Elite only' },
    { level: 'L4', percent: '15%', amount: 13.94, description: 'Crown/Elite only' },
    { level: 'L5', percent: '10%', amount: 9.29, description: 'Crown/Elite only' },
  ],
};

export default function OverrideCommissionsPage() {
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

            <h1 className="text-4xl font-bold mb-4">Override Bonuses</h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              Earn bonuses on your organization's sales. Higher ranks unlock more levels and higher
              percentages. The Enroller Override Rule ensures you always earn L1 rate on personal enrollees.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">30%</div>
            <div className="text-sm text-slate-600 font-medium">L1 Rate for All Ranks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">5</div>
            <div className="text-sm text-slate-600 font-medium">Levels Deep (Crown/Elite)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">50</div>
            <div className="text-sm text-slate-600 font-medium">Credits/Month Minimum</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* Override Qualification */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Override Qualification</h2>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Monthly Qualification Required</h3>
                <p className="text-amber-800 leading-relaxed">
                  You must generate at least <span className="font-bold">50 personal credits per month</span> to
                  earn override bonuses. If you fall below 50 credits, you still receive your direct commissions,
                  but override bonuses drop to $0 for that month.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Qualified (50+ Credits)
              </h3>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Earn direct commissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Earn override bonuses on team sales</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Eligible for rank advancement bonuses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Eligible for bonus pool programs</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Not Qualified (&lt;50 Credits)
              </h3>
              <ul className="space-y-2 text-red-800">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Still earn direct commissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>Override bonuses = $0</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>No rank advancement bonuses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">✗</span>
                  <span>No bonus pool participation</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Enroller Override Rule */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Enroller Override Rule</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Personal Enrollees Always Pay L1 Rate</h3>
                <p className="text-blue-800 leading-relaxed mb-4">
                  If you personally enrolled someone into the company, you <span className="font-bold">always</span> earn
                  the L1 rate (30% of override pool) on their sales, regardless of where they end up in your organization
                  or what rank you are. This is called the <span className="font-bold">Enroller Override Rule</span>.
                </p>
                <p className="text-blue-800 leading-relaxed">
                  The enroller ID is <span className="font-bold">immutable</span> (set at enrollment and never changes).
                  Override calculations check enroller ID BEFORE checking matrix position.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3">How It Works</h3>
              <ol className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <span className="font-bold text-slate-900 mr-3">1.</span>
                  <div>
                    <span className="font-medium">Check Enroller ID:</span> Is this person someone you personally enrolled?
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-slate-900 mr-3">2.</span>
                  <div>
                    <span className="font-medium">If YES:</span> You earn L1 rate (30%) regardless of matrix position or rank
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-slate-900 mr-3">3.</span>
                  <div>
                    <span className="font-medium">If NO:</span> Use your rank's override schedule based on matrix level
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">Example Scenario</h3>
              <p className="text-green-800 leading-relaxed">
                You're a <span className="font-bold">Silver rank</span> (L1=30%, L2=10%, L3=5%). You personally enrolled
                Sarah, who is now 7 levels deep in your organization. Normally, you wouldn't earn anything on level 7
                (Silver only goes to L3). But because you personally enrolled Sarah, the <span className="font-bold">Enroller
                Override Rule</span> kicks in and you earn <span className="font-bold">30%</span> of the override pool on
                all her sales.
              </p>
            </div>
          </div>
        </section>

        {/* Override Schedule */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Ranked Override Schedule</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            These percentages represent your share of the <span className="font-semibold">override pool</span>, not the
            retail or member price. The override pool is 17.6% of the customer's payment (40% of the 44% commission pool).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Tech Rank</th>
                  <th className="px-6 py-4 text-center font-semibold">L1<br /><span className="text-xs font-normal text-slate-300">(Enrollees)</span></th>
                  <th className="px-6 py-4 text-center font-semibold">L2</th>
                  <th className="px-6 py-4 text-center font-semibold">L3</th>
                  <th className="px-6 py-4 text-center font-semibold">L4</th>
                  <th className="px-6 py-4 text-center font-semibold">L5</th>
                </tr>
              </thead>
              <tbody>
                {overrideSchedule.map((rank, idx) => (
                  <tr
                    key={rank.rank}
                    className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">{rank.rank}</td>
                    <td className="px-6 py-4 text-center text-slate-900 font-medium bg-blue-50">{rank.l1}</td>
                    <td className="px-6 py-4 text-center text-slate-700">{rank.l2}</td>
                    <td className="px-6 py-4 text-center text-slate-700">{rank.l3}</td>
                    <td className="px-6 py-4 text-center text-slate-700">{rank.l4}</td>
                    <td className="px-6 py-4 text-center text-slate-700">{rank.l5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><span className="font-semibold">L1 is always 30%</span> for all ranks (Enroller Override Rule)</span>
            </p>
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Dashes (—) mean that level is not unlocked for that rank</span>
            </p>
            <p className="flex items-start">
              <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Higher ranks unlock more levels and higher percentages on L2-L5</span>
            </p>
          </div>
        </section>

        {/* Dollar Examples */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Dollar Examples</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Here's what override bonuses look like in actual dollars for <span className="font-semibold">{exampleProduct.name}</span> at{' '}
            <span className="font-semibold">${exampleProduct.retailPrice} retail</span>. The override pool for this sale is{' '}
            <span className="font-semibold">${exampleProduct.overridePool.toFixed(2)}</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleProduct.levels.map((level) => (
              <div key={level.level} className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 hover:border-slate-400 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{level.level}</h3>
                  <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-300">
                    {level.percent}
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  ${level.amount.toFixed(2)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {level.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Calculate Your Override</h3>
            <ol className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Find the override pool for the product (17.6% of customer payment)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Look up your override percentage based on your rank and level</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Multiply: Override Pool × Your %</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Example: $92.91 × 30% = $27.87</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Business Center Note */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Center Override</h2>
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-6">
            <p className="text-slate-700 leading-relaxed mb-4">
              Business Center ($39/month) operates differently than other products:
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="text-slate-900 font-bold mr-2">•</span>
                <span><span className="font-semibold">Direct sponsor</span> earns a flat <span className="font-bold">$8.00</span> if they personally enrolled the BC customer</span>
              </li>
              <li className="flex items-start">
                <span className="text-slate-900 font-bold mr-2">•</span>
                <span><span className="font-semibold">No override pool</span> for Business Center (no L2, L3, L4, L5 bonuses)</span>
              </li>
              <li className="flex items-start">
                <span className="text-slate-900 font-bold mr-2">•</span>
                <span>BC is designed for <span className="font-semibold">team building</span> and <span className="font-semibold">rank qualification</span> (39 credits toward rank advancement)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Understanding Override Bonuses</h2>
          <p className="text-slate-200 mb-6 leading-relaxed">
            Override bonuses are a powerful way to build residual income as your organization grows. The combination
            of the Enroller Override Rule and ranked matrix overrides ensures you're rewarded for both personal
            enrollments and team depth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/compensation/tech-ladder"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Tech Ladder Ranks
            </Link>
            <Link
              href="/dashboard/compensation/calculator"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Potential Earnings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
