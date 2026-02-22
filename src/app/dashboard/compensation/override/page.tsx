// =============================================
// Override Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient} from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Override Bonuses - Compensation Plan',
  description: 'Earn when you outrank your downline',
};

export default async function OverrideBonusesPage() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id, current_rank')
    .eq('auth_user_id', user.id)
    .single();

  let totalEarned = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_override')
      .select('total_commission_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.total_commission_cents, 0) / 100;
    }
  }

  const currentRank = distributor?.current_rank || 'affiliate';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-yellow-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">👑</div>
            <div>
              <h1 className="text-4xl font-bold">Override Bonuses</h1>
              <p className="text-xl text-yellow-100 mt-2">Leadership rewards when you outrank your team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-yellow-500">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E] capitalize">{currentRank.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Your Current Rank</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Override bonuses are <strong>leadership rewards</strong>. When you achieve a higher rank than someone
            in your downline, you earn the <strong>difference</strong> between your rank's percentage and theirs
            on their Group BV.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> You're the manager, they're the team member. You get paid
              extra for having more responsibility and higher performance!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Override Rates by Rank</h2>

          <div className="space-y-2">
            {[
              { rank: 'Bronze', rate: '2%', color: 'bg-orange-100 border-orange-300' },
              { rank: 'Silver', rate: '4%', color: 'bg-gray-200 border-gray-400' },
              { rank: 'Gold', rate: '6%', color: 'bg-yellow-100 border-yellow-400' },
              { rank: 'Platinum', rate: '8%', color: 'bg-blue-100 border-blue-400' },
              { rank: 'Diamond', rate: '10%', color: 'bg-purple-100 border-purple-400' },
              { rank: 'Crown Diamond', rate: '12%', color: 'bg-indigo-100 border-indigo-400' },
              { rank: 'Royal Diamond', rate: '15%', color: 'bg-pink-100 border-pink-400' },
            ].map((item) => (
              <div key={item.rank} className={`flex items-center justify-between p-4 rounded-lg border-2 ${item.color}`}>
                <span className="font-semibold text-gray-900">{item.rank}</span>
                <span className="text-2xl font-bold text-[#2B4C7E]">{item.rate}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-l-4 border-yellow-500 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Example Scenario:</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">👑</div>
                  <div>
                    <div className="font-bold">You are GOLD rank (6%)</div>
                    <div className="text-sm text-gray-600">Your override rate</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">👤</div>
                  <div>
                    <div className="font-bold">Sarah (in your downline) is SILVER (4%)</div>
                    <div className="text-sm text-gray-600">Her Group BV: 5,000</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div className="bg-green-100 rounded-lg p-4 border-2 border-green-400">
                <div className="text-sm text-gray-700 mb-2">Your Override:</div>
                <div className="font-mono text-lg mb-2">6% (your rank) - 4% (her rank) = 2%</div>
                <div className="font-mono text-lg mb-2">2% × 5,000 BV = 100 BV</div>
                <div className="text-2xl font-bold text-green-600">= $100 Override Bonus! 💰</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-bold text-gray-900 mb-1">The "Break" Rule</div>
                <p className="text-gray-700 text-sm">
                  When you reach someone in your downline with the SAME or HIGHER rank as you, the override "breaks" (stops).
                  This prevents you from earning overrides on their entire organization.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <p className="text-gray-700">
              Override bonuses start at <strong>Bronze rank</strong> and increase as you advance. The higher
              your rank, the bigger the override percentage difference, and the more you earn!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Earn Overrides?</h2>
          <p className="mb-6 text-blue-100">Advance your rank and outpace your team!</p>
          <Link
            href="/dashboard/compensation"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            View Other Commission Types
          </Link>
        </section>
      </div>
    </div>
  );
}
