// =============================================
// Infinity Bonus Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Infinity Bonus - Compensation Plan',
};

export default async function InfinityBonusPage() {
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
      .from('commissions_infinity')
      .select('bonus_cents')
      .eq('distributor_id', distributor.id);
    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.bonus_cents, 0) / 100;
    }
  }

  const currentRank = distributor?.current_rank || 'affiliate';
  const isQualified = ['diamond', 'crown_diamond', 'royal_diamond'].includes(currentRank);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">♾️</div>
            <div>
              <h1 className="text-4xl font-bold">Infinity Bonus</h1>
              <p className="text-xl text-indigo-100 mt-2">Earn beyond Level 7 - unlimited depth!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-indigo-500">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E] capitalize">{currentRank.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${isQualified ? 'text-green-600' : 'text-gray-400'}`}>
                {isQualified ? '✅' : '🔒'}
              </div>
              <div className="text-sm text-gray-600">{isQualified ? 'Qualified' : 'Not Yet'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The Infinity Bonus breaks through the 7-level matrix ceiling! Once you reach <strong>Diamond rank</strong>,
            you can earn commissions on <strong>Level 8, 9, 10... and beyond</strong> - as deep as your organization grows.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> Matrix stops at Level 7. Infinity goes forever. This is where
              true passive income begins!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Breakdown</h2>
          <div className="space-y-4">
            <div className="bg-gray-100 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Levels 1-7 (Matrix)</span>
                <span className="text-green-600 font-bold">2%-10% commissions</span>
              </div>
            </div>
            <div className="text-center text-2xl">↓</div>
            <div className="bg-indigo-100 rounded p-4 border-2 border-indigo-500">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Level 8+ (Infinity)</span>
                <span className="text-indigo-600 font-bold">3% on everything!</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <p className="text-gray-700 mb-3">
              <strong>1. Achieve Diamond Rank or Higher</strong>
            </p>
            <p className="text-gray-700 mb-3">
              <strong>2. Maintain 50 BV monthly</strong> (stay active)
            </p>
            <p className="text-gray-700">
              <strong>3. Build depth!</strong> The deeper your organization, the more you earn.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {isQualified ? 'You Qualify for Infinity!' : 'Reach Diamond to Unlock Infinity'}
          </h2>
          <p className="mb-6 text-blue-200">
            {isQualified
              ? 'Keep building depth and watch your Infinity commissions grow!'
              : 'Focus on building your team to 50,000 GBV to unlock this powerful bonus.'}
          </p>
          <Link
            href="/dashboard/compensation"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            View All Commission Types
          </Link>
        </section>
      </div>
    </div>
  );
}
