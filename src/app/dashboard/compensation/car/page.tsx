// =============================================
// Car Bonus Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Car Bonus - Compensation Plan',
};

const carBonuses = [
  { rank: 'Platinum', bonus: 500, requirement: '25,000 GBV for 3 months' },
  { rank: 'Diamond', bonus: 1000, requirement: '50,000 GBV for 3 months' },
  { rank: 'Crown Diamond', bonus: 1500, requirement: '100,000 GBV for 3 months' },
];

export default async function CarBonusPage() {
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
      .from('commissions_car')
      .select('bonus_cents')
      .eq('distributor_id', distributor.id);
    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.bonus_cents, 0) / 100;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-cyan-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-cyan-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🚗</div>
            <div>
              <h1 className="text-4xl font-bold">Car Bonus</h1>
              <p className="text-xl text-cyan-100 mt-2">$500-$1,500/month towards your dream car!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-cyan-500">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Car Bonuses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E] capitalize">
                {distributor?.current_rank?.replace('_', ' ') || 'Affiliate'}
              </div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The Car Bonus is a <strong>monthly lifestyle reward</strong> for top performers. Hit Platinum or higher
            and maintain it for 3 consecutive months, and you'll receive <strong>$500-$1,500 every month</strong> to
            put towards your dream car!
          </p>
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Imagine this:</strong> A $1,000/month car bonus = $12,000 per year. That's a nice luxury
              car lease, or the down payment on your dream vehicle!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Bonus Tiers</h2>
          <div className="space-y-4">
            {carBonuses.map((tier) => (
              <div key={tier.rank} className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border-2 border-cyan-300">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-2xl font-bold text-gray-900">{tier.rank}</div>
                  <div className="text-3xl font-bold text-cyan-600">${tier.bonus}/mo</div>
                </div>
                <div className="text-sm text-gray-600">{tier.requirement}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real Example</h2>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded p-6 border-l-4 border-cyan-500">
            <h3 className="font-bold text-gray-900 mb-3">🚗 Amanda's New Car</h3>
            <p className="text-gray-700 mb-4">
              Amanda reached Diamond in January and maintained it through March. Starting in April, she qualified
              for the $1,000/month car bonus. She used it to lease a brand new Mercedes!
            </p>
            <div className="bg-white rounded p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Monthly Car Bonus:</span>
                <span className="font-bold">$1,000</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Her Car Payment:</span>
                <span className="font-bold">$850</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Left Over:</span>
                <span className="font-bold text-green-600">$150 for gas & insurance!</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="space-y-3">
            <div className="bg-blue-50 border-2 border-blue-300 rounded p-4">
              <div className="font-bold mb-1">1. Achieve Platinum Rank or Higher</div>
              <p className="text-sm text-gray-600">And maintain it for 3 consecutive months</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded p-4">
              <div className="font-bold mb-1">2. Stay Active</div>
              <p className="text-sm text-gray-600">50 BV minimum every month</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded p-4">
              <div className="font-bold mb-1">3. Bonus Continues Monthly</div>
              <p className="text-sm text-gray-600">As long as you maintain rank qualification</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Drive Your Dream Car?</h2>
          <p className="mb-6 text-white">Build your team to Platinum and claim your car bonus!</p>
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
