'use client';

// =============================================
// Leadership Pool - Exclusive Early Leader Program
// Professional layout based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const vestingSchedules = [
  { period: 'Pre-Launch (Founders)', months: 24, description: 'First leaders who join before official launch' },
  { period: 'Launch Phase (Months 1-6)', months: 18, description: 'Early adopters during company launch' },
  { period: 'Growth Phase (Months 7-12)', months: 12, description: 'Leaders who join during first year' },
];

export default function LeadershipPoolPage() {
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

            <h1 className="text-4xl font-bold mb-4">Leadership Pool</h1>
            <p className="text-xl text-slate-200 leading-relaxed">
              Exclusive opportunity for early leaders. 1,000 total shares allocated to pre-launch and Year 1 builders.
              Share in 1.5% of company revenue with vesting schedules and rank requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">1.5%</div>
            <div className="text-sm text-slate-600 font-medium">of Company Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">1,000</div>
            <div className="text-sm text-slate-600 font-medium">Total Shares Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">Gold+</div>
            <div className="text-sm text-slate-600 font-medium">Rank Required for Payouts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">Monthly</div>
            <div className="text-sm text-slate-600 font-medium">Payments w/ Commissions</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* What is the Leadership Pool */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What is the Leadership Pool?</h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Share in Company Growth</h3>
                <p className="text-blue-800 leading-relaxed">
                  The Leadership Pool is an exclusive program that allocates <span className="font-bold">1.5% of total
                  company revenue</span> (after BotMakers 30% and Apex 30%) to early leaders who help build the foundation
                  of the company. This is distributed as <span className="font-bold">shares</span>, not percentages.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <span className="text-slate-400 mr-2">1.</span>
                  <span>1,000 total shares are allocated during pre-launch through Year 1</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-400 mr-2">2.</span>
                  <span>Early leaders receive shares based on contribution and timing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-400 mr-2">3.</span>
                  <span>Shares vest over 12-24 months depending on when you joined</span>
                </li>
                <li className="flex items-start">
                  <span className="text-slate-400 mr-2">4.</span>
                  <span>Vested shares pay monthly as a percentage of the 1.5% pool</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Share Calculation Example
              </h3>
              <div className="space-y-3 text-slate-700 text-sm">
                <p><span className="font-semibold">Scenario:</span> You have 50 vested shares</p>
                <p><span className="font-semibold">Company Revenue:</span> $1,000,000 this month</p>
                <div className="bg-white border border-slate-300 rounded p-3 space-y-1">
                  <p>Pool Size (1.5% of $1M): <span className="font-bold">$15,000</span></p>
                  <p>Your Share (50/1000): <span className="font-bold">5%</span></p>
                  <p className="text-green-700 font-bold pt-2 border-t border-slate-200">Your Payment: $750</p>
                </div>
                <p className="text-xs text-slate-500">As company revenue grows, so does your monthly payment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vesting Schedules */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Vesting Schedules</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Shares vest over time to reward long-term commitment. The vesting period depends on when you joined the company.
            Diamond rank achievement accelerates vesting to 100% immediately.
          </p>

          <div className="space-y-6">
            {vestingSchedules.map((schedule, idx) => (
              <div key={idx} className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6 hover:border-slate-500 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{schedule.period}</h3>
                    <p className="text-sm text-slate-600">{schedule.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-700">{schedule.months}</div>
                    <div className="text-sm text-slate-600">month vesting</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-slate-300 rounded-full" />
                      <span className="text-slate-600">Month 1</span>
                    </div>
                    <div className="flex-1 mx-4 border-t-2 border-dashed border-slate-300" />
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600">Month {schedule.months}</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 text-center">
                    Shares vest gradually each month. Example: {schedule.months === 24 ? '4.17%' : schedule.months === 18 ? '5.56%' : '8.33%'} per month
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Diamond Vest Acceleration</h3>
                <p className="text-purple-800 leading-relaxed">
                  Achieve <span className="font-bold">Diamond rank</span> and your remaining unvested shares immediately
                  vest to <span className="font-bold">100%</span>. This is a powerful incentive for early leaders to build
                  their organizations to Diamond level.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Qualification & Requirements */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Qualification & Requirements</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 mb-3">To Receive Shares</h3>
                  <ul className="space-y-2 text-green-800">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Join during pre-launch through Year 1</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Demonstrate leadership and contribution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Shares are allocated by company leadership</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Limited to 1,000 total shares company-wide</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">To Receive Payouts</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Maintain <span className="font-bold">Gold rank or higher</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Generate at least 50 personal credits/month</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Shares must be vested (not in vesting period)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Active and compliant distributor status</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
            <h3 className="font-semibold text-amber-900 mb-2">What Happens If You Don't Qualify?</h3>
            <p className="text-amber-800 leading-relaxed">
              If you drop below Gold rank or fail to generate 50 personal credits/month, your <span className="font-bold">vested
              shares are paused</span> for that month (you don't lose them, but you don't receive payment). Once you
              re-qualify, payouts resume for vested shares.
            </p>
          </div>
        </section>

        {/* Share Rules */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Share Rules & Protections</h2>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Non-Transferable & Non-Sellable
              </h3>
              <p className="text-slate-700">
                Leadership Pool shares <span className="font-bold">cannot be sold, transferred, or gifted</span> to anyone.
                They are tied to your personal distributor account and your active participation in building the business.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Unvested Shares Forfeit on Departure
              </h3>
              <p className="text-slate-700">
                If you leave the company or terminate your distributor agreement before your shares fully vest,{' '}
                <span className="font-bold">unvested shares are forfeited</span>. Vested shares continue to pay for 6
                months after departure, then stop permanently.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vested Shares Paid for 6 Months Post-Departure
              </h3>
              <p className="text-slate-700">
                If you leave the company with <span className="font-bold">fully vested shares</span>, you'll continue
                receiving your share of the Leadership Pool for <span className="font-bold">6 months</span> after departure
                (as long as you remain Gold+ during that period). After 6 months, payments stop permanently.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Paid Monthly with Commissions
              </h3>
              <p className="text-slate-700">
                Leadership Pool payments are calculated monthly based on company revenue and distributed with your regular
                commission payouts. You'll see a separate line item on your earnings statement showing your Leadership
                Pool payment.
              </p>
            </div>
          </div>
        </section>

        {/* Example Scenarios */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Example Scenarios</h2>

          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scenario 1: Diamond Acceleration
              </h3>
              <div className="text-green-800 space-y-2">
                <p><span className="font-semibold">Background:</span> Pre-launch leader with 100 shares, 24-month vesting</p>
                <p><span className="font-semibold">Month 6:</span> 25% vested (25 shares), earning monthly payments on 25 shares</p>
                <p><span className="font-semibold">Month 10:</span> Achieves Diamond rank</p>
                <p className="font-bold text-green-700 pt-2 border-t border-green-200">
                  Result: Remaining 75 shares immediately vest to 100%. Now earning on all 100 shares.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scenario 2: Growth Phase Leader
              </h3>
              <div className="text-blue-800 space-y-2">
                <p><span className="font-semibold">Background:</span> Joined Month 9 with 50 shares, 12-month vesting</p>
                <p><span className="font-semibold">Month 15:</span> 50% vested (25 shares), Platinum rank</p>
                <p><span className="font-semibold">Company revenue:</span> $2M/month → Leadership Pool = $30,000</p>
                <p className="font-bold text-blue-700 pt-2 border-t border-blue-200">
                  Result: 25 shares / 1,000 total = 2.5% of pool = $750/month (grows as revenue grows)
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Scenario 3: Early Departure
              </h3>
              <div className="text-amber-800 space-y-2">
                <p><span className="font-semibold">Background:</span> Launch leader with 75 shares, 18-month vesting</p>
                <p><span className="font-semibold">Month 12:</span> 66% vested (50 shares), decides to leave company</p>
                <p><span className="font-semibold">Unvested:</span> 25 shares (33%) are forfeited immediately</p>
                <p className="font-bold text-amber-700 pt-2 border-t border-amber-200">
                  Result: Receives 6 months of payments on 50 vested shares (if maintains Gold+), then payments stop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Building Long-Term Wealth</h2>
          <p className="text-slate-200 mb-6 leading-relaxed">
            The Leadership Pool rewards early commitment and long-term vision. As the company grows, your share of the
            1.5% pool grows with it. Combined with direct commissions, overrides, and bonuses, the Leadership Pool creates
            a powerful passive income stream for early leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/compensation/tech-ladder"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Build to Diamond Rank
            </Link>
            <Link
              href="/dashboard/compensation"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              View Full Compensation Plan
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
