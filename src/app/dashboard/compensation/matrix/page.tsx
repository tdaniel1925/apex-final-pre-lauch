// =============================================
// Matrix Commissions Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Matrix Commissions - Compensation Plan',
  description: 'Earn on 7 levels deep in your team',
};

export default async function MatrixCommissionsPage() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor and their matrix earnings
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  let totalEarned = 0;
  let recordCount = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_matrix')
      .select('total_commission_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.total_commission_cents, 0) / 100;
      recordCount = commissions.length;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/compensation"
            className="inline-flex items-center text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">📊</div>
            <div>
              <h1 className="text-4xl font-bold">Matrix Commissions</h1>
              <p className="text-xl text-purple-100 mt-2">Build your team and earn on 7 levels deep</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Stats */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-purple-500">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Your Matrix Commissions
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">
                ${totalEarned.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{recordCount}</div>
              <div className="text-sm text-gray-600">Monthly Calculations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* What Is It? */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Matrix commissions are where the <strong>real leverage</strong> happens! You earn a percentage of the
            Business Volume (BV) from people in your team - <strong>7 levels deep</strong>. The deeper they are,
            the higher your percentage.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> You build a team once, and every month they order products,
              you earn commissions. It's recurring income that grows as your team grows!
            </p>
          </div>
        </section>

        {/* Visual: 7 Levels */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">The 7 Levels Explained</h2>

          <div className="space-y-3 mb-6">
            {[
              { level: 1, percent: '2%', people: 'People YOU enrolled', color: 'bg-red-100 border-red-300' },
              { level: 2, percent: '3%', people: 'People THEY enrolled', color: 'bg-orange-100 border-orange-300' },
              { level: 3, percent: '5%', people: 'Their enrollments', color: 'bg-yellow-100 border-yellow-300' },
              { level: 4, percent: '6%', people: 'Next generation', color: 'bg-green-100 border-green-300' },
              { level: 5, percent: '7%', people: 'Getting deeper', color: 'bg-blue-100 border-blue-300' },
              { level: 6, percent: '8%', people: 'Almost there', color: 'bg-indigo-100 border-indigo-300' },
              { level: 7, percent: '10%', people: 'Maximum depth', color: 'bg-purple-100 border-purple-300' },
            ].map((item) => (
              <div key={item.level} className={`flex items-center gap-4 p-4 rounded-lg border-2 ${item.color}`}>
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-2xl font-bold text-gray-900">L{item.level}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.people}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-purple-600">{item.percent}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
            <p className="text-gray-700">
              <strong>💡 Pro Tip:</strong> Notice how the percentages increase as you go deeper? That's because
              it's harder to build depth, so you're rewarded more for it!
            </p>
          </div>
        </section>

        {/* Visual Tree Diagram */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How the Matrix Builds</h2>

          <div className="bg-gray-50 rounded-lg p-8 overflow-x-auto">
            <div className="flex flex-col items-center space-y-4 min-w-max">
              {/* You */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  YOU
                </div>
                <div className="text-xs text-gray-600 mt-1">You're here</div>
              </div>

              {/* Level 1 - 5 people */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    L1
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">5 people on Level 1 (2% each)</div>

              {/* Level 2 - 25 people (represented) */}
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    L2
                  </div>
                ))}
                <div className="text-gray-500 font-bold">...</div>
              </div>
              <div className="text-sm text-gray-600">Up to 25 people on Level 2 (3% each)</div>

              {/* Levels 3-7 */}
              <div className="text-center space-y-2">
                <div className="flex items-center gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full"></div>
                  ))}
                  <div className="text-gray-500 font-bold">...</div>
                </div>
                <div className="text-sm text-gray-600">Levels 3-7 can have hundreds of people!</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-700">
              <strong>The Power of Duplication:</strong> If everyone enrolls just 5 people, by Level 7 you could have
              <strong> 78,125 people in your matrix</strong>! Even if only 10% are active, that's still 7,812 people
              generating commissions for you every month.
            </p>
          </div>
        </section>

        {/* Real Example */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Life Example</h2>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="font-bold text-gray-900 mb-3">📖 Mike's Matrix Story</h3>
            <p className="text-gray-700 mb-4">
              Mike has been building his team for 6 months. Here's what his matrix looks like this month:
            </p>
            <div className="bg-white rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Level 1: 5 people × 100 BV each × 2%</span>
                <span className="font-bold">$10.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 2: 12 people × 100 BV each × 3%</span>
                <span className="font-bold">$36.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 3: 23 people × 100 BV each × 5%</span>
                <span className="font-bold">$115.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 4: 31 people × 100 BV each × 6%</span>
                <span className="font-bold">$186.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 5: 18 people × 100 BV each × 7%</span>
                <span className="font-bold">$126.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 6: 9 people × 100 BV each × 8%</span>
                <span className="font-bold">$72.00</span>
              </div>
              <div className="flex justify-between">
                <span>Level 7: 4 people × 100 BV each × 10%</span>
                <span className="font-bold">$40.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="text-gray-900 font-semibold">Mike's Total Matrix Commission:</span>
                <span className="font-bold text-green-600">$585.00 💰</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 italic">
              And this happens <strong>every month</strong> as long as his team stays active!
            </p>
          </div>
        </section>

        {/* How to Qualify */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-bold text-gray-900 mb-2">You must be ACTIVE</div>
                <p className="text-gray-700">
                  To earn matrix commissions, you need at least <strong>50 BV in personal purchases</strong> that month.
                  If you're not active, you don't earn (but your team still builds underneath you).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What if I only enroll 3 people instead of 5?
              </summary>
              <p className="text-gray-700 mt-2">
                That's fine! You still earn on those 3. And with "spillover," when your upline's Level 1 fills up,
                their extra enrollments can spill down to you, helping fill your matrix.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do I earn on inactive people?
              </summary>
              <p className="text-gray-700 mt-2">
                No. You only earn commissions on people who have at least 50 BV that month. Inactive people don't
                generate commissions, but they still count in your structure.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                When do matrix commissions get paid?
              </summary>
              <p className="text-gray-700 mt-2">
                Matrix commissions are calculated monthly and paid on the 15th of the following month.
              </p>
            </details>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build Your Matrix?</h2>
          <p className="mb-6 text-blue-100">
            The best time to start building was yesterday. The second best time is right now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/team"
              className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View My Team
            </Link>
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-blue-800/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800/70 transition-colors border border-blue-400/30"
            >
              Calculate My Potential
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
