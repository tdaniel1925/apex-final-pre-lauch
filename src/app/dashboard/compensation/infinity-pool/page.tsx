// =============================================
// Infinity Pool Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Infinity Pool - Compensation Plan',
};

export default async function InfinityPoolPage() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, current_rank')
    .eq('auth_user_id', user.id)
    .single();

  let totalEarned = 0;
  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_pool')
      .select('share_cents')
      .eq('distributor_id', distributor.id);
    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.share_cents, 0) / 100;
    }
  }

  const currentRank = distributor?.current_rank || 'affiliate';
  const isQualified = ['crown_diamond', 'royal_diamond'].includes(currentRank);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">💎</div>
            <div>
              <h1 className="text-4xl font-bold">Infinity Pool</h1>
              <p className="text-xl text-emerald-100 mt-2">Share in 2% of company revenue!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-emerald-500">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Pool Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E] capitalize">{currentRank.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${isQualified ? 'text-green-600' : 'text-gray-400'}`}>
                {isQualified ? '✅' : '🔒'}
              </div>
              <div className="text-sm text-gray-600">{isQualified ? 'Qualified!' : 'Crown Diamond+'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The Infinity Pool is the <strong>ultimate elite reward</strong>. The company sets aside <strong>2% of
            total monthly revenue</strong> and splits it among all Crown Diamond and Royal Diamond distributors
            based on their performance.
          </p>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> When the company wins, the top leaders win BIG. It's
              profit-sharing at the highest level!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="bg-white rounded p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🏢</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Company Monthly Revenue</div>
                    <div className="text-sm text-gray-600">Example: $10,000,000</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div className="bg-emerald-100 rounded p-4 border-2 border-emerald-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">💰</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">2% Goes to Infinity Pool</div>
                    <div className="text-2xl font-bold text-emerald-600">$200,000</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div className="bg-white rounded p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">👑</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Split Among Qualified Leaders</div>
                    <div className="text-sm text-gray-600">Based on GBV performance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
            <p className="text-sm text-gray-700">
              <strong>💡 Example:</strong> If there are 10 qualified leaders and you have 20% of the total GBV among them,
              you'd get $40,000 that month ($200,000 × 20%)!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why It Matters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-300 rounded p-4">
              <div className="font-bold text-gray-900 mb-2">🚀 Company Growth = Your Growth</div>
              <p className="text-sm text-gray-600">
                As the company expands globally, the pool gets bigger. You benefit from EVERYONE's success.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-300 rounded p-4">
              <div className="font-bold text-gray-900 mb-2">💰 Passive Income at Scale</div>
              <p className="text-sm text-gray-600">
                You earn a share even from sales in markets you've never touched. True leverage!
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="space-y-3">
            <div className="bg-purple-50 border-2 border-purple-300 rounded p-4">
              <div className="font-bold text-gray-900 mb-1">1. Achieve Crown Diamond or Royal Diamond</div>
              <p className="text-sm text-gray-600">100,000+ GBV required</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-300 rounded p-4">
              <div className="font-bold text-gray-900 mb-1">2. Maintain Rank</div>
              <p className="text-sm text-gray-600">Stay at Crown Diamond+ to keep participating</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-300 rounded p-4">
              <div className="font-bold text-gray-900 mb-1">3. Stay Active</div>
              <p className="text-sm text-gray-600">50 BV minimum monthly</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {isQualified ? 'Welcome to the Infinity Pool!' : 'Build to Crown Diamond and Join the Elite!'}
          </h2>
          <p className="mb-6 text-blue-100">
            {isQualified
              ? "You're sharing in company profits. Keep building and watch your share grow!"
              : "The Infinity Pool is the ultimate goal. Start building your empire today!"}
          </p>
          <Link
            href="/dashboard/team"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            View My Team
          </Link>
        </section>
      </div>
    </div>
  );
}
