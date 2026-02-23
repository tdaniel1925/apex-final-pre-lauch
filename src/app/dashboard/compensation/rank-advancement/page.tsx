// =============================================
// Rank Advancement Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Rank Advancement Bonuses - Compensation Plan',
  description: 'Get rewarded when you advance to a new rank',
};

const rankBonuses = [
  { rank: 'Associate', bonus: 50, gbv: 1000, color: 'from-gray-400 to-gray-500' },
  { rank: 'Bronze', bonus: 100, gbv: 2500, color: 'from-orange-400 to-orange-500' },
  { rank: 'Silver', bonus: 250, gbv: 5000, color: 'from-gray-300 to-gray-400' },
  { rank: 'Gold', bonus: 500, gbv: 10000, color: 'from-yellow-400 to-yellow-500' },
  { rank: 'Platinum', bonus: 1000, gbv: 25000, color: 'from-blue-400 to-blue-500' },
  { rank: 'Diamond', bonus: 2500, gbv: 50000, color: 'from-purple-400 to-purple-500' },
  { rank: 'Crown Diamond', bonus: 5000, gbv: 100000, color: 'from-indigo-500 to-indigo-600' },
  { rank: 'Royal Diamond', bonus: 10000, gbv: 250000, color: 'from-pink-500 to-pink-600' },
];

export default async function RankAdvancementPage() {
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
  let bonusCount = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_rank_advancement')
      .select('final_bonus_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.final_bonus_cents, 0) / 100;
      bonusCount = commissions.length;
    }
  }

  const currentRank = distributor?.current_rank || 'affiliate';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-red-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">🏆</div>
            <div>
              <h1 className="text-4xl font-bold">Rank Advancement Bonuses</h1>
              <p className="text-xl text-red-100 mt-2">One-time cash rewards for hitting new ranks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-red-500">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Bonuses Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{bonusCount}</div>
              <div className="text-sm text-gray-600">Ranks Achieved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E] capitalize">{currentRank.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Rank Advancement Bonuses are <strong>one-time celebration bonuses</strong> that you earn the
            <strong> first time</strong> you achieve each rank. It's the company's way of saying "Congratulations!
            You did it!"
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> It's like getting a promotion bonus at a regular job.
              When you level up, you get rewarded immediately!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">The Bonus Ladder</h2>

          <div className="space-y-3">
            {rankBonuses.map((item, index) => (
              <div key={item.rank} className="relative">
                <div className={`bg-gradient-to-r ${item.color} text-white rounded-lg p-6 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-2xl font-bold mb-1">{item.rank}</div>
                      <div className="text-sm opacity-90">Requires: {item.gbv.toLocaleString()} GBV</div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">${item.bonus.toLocaleString()}</div>
                      <div className="text-sm opacity-90">One-time bonus</div>
                    </div>
                  </div>
                </div>
                {index < rankBonuses.length - 1 && (
                  <div className="flex justify-center py-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              Total Possible Bonuses: $19,400
            </div>
            <div className="text-gray-700">
              Achieve all 8 ranks and earn almost <strong>$20,000</strong> in advancement bonuses!
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Life Example</h2>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="font-bold text-gray-900 mb-4">📖 Rachel's Rank Journey</h3>

            <div className="space-y-4">
              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Month 2: Hit Associate</div>
                    <div className="text-sm text-gray-600">Built her team to 1,000 GBV</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+$50</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Month 4: Hit Bronze</div>
                    <div className="text-sm text-gray-600">Grew to 2,500 GBV</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+$100</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Month 7: Hit Silver</div>
                    <div className="text-sm text-gray-600">Reached 5,000 GBV</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+$250</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">Month 12: Hit Gold</div>
                    <div className="text-sm text-gray-600">Crossed 10,000 GBV</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+$500</div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 pt-4 flex justify-between text-lg">
                <span className="font-semibold">Rachel's First Year Bonuses:</span>
                <span className="font-bold text-green-600">$900 in rank bonuses! 🎉</span>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="text-sm text-gray-700">
                <strong>💡 Smart Move:</strong> Rachel reinvested her bonuses into marketing tools and product
                samples, which helped her hit Platinum the following year ($1,000 bonus)!
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Achieve the Required GBV</div>
                  <div className="text-sm text-gray-700">Build your team to hit the GBV requirement for each rank</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">One-Time Only</div>
                  <div className="text-sm text-gray-700">You only get the bonus the FIRST time you hit that rank</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">⏰</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Paid Immediately</div>
                  <div className="text-sm text-gray-700">Bonuses are typically paid within 24-48 hours of rank achievement</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What if I drop in rank? Do I lose the bonus?
              </summary>
              <p className="text-gray-700 mt-2">
                No! Once you earn a rank advancement bonus, it's yours to keep forever. Even if your GBV drops
                and you temporarily fall to a lower rank, you don't pay it back.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I get the bonus again if I re-qualify?
              </summary>
              <p className="text-gray-700 mt-2">
                No, rank advancement bonuses are one-time only per rank. However, you'll continue earning
                higher monthly commissions at your higher rank!
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do I need to be active to get the bonus?
              </summary>
              <p className="text-gray-700 mt-2">
                Yes, you must have at least 50 BV in personal purchases the month you qualify for the rank
                advancement bonus.
              </p>
            </details>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Advance Your Rank?</h2>
          <p className="mb-6 text-blue-100">
            Build your team, hit the next rank, and celebrate with a bonus check!
          </p>
          <Link
            href="/dashboard/team"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            View My Team Progress
          </Link>
        </section>
      </div>
    </div>
  );
}
