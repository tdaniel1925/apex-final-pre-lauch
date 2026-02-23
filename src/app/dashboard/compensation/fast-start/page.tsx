// =============================================
// Fast Start Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Fast Start Bonuses - Compensation Plan',
  description: 'Earn $100 when you enroll someone in your first 30 days',
};

export default async function FastStartPage() {
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
    .select('id, created_at')
    .eq('auth_user_id', user.id)
    .single();

  let totalEarned = 0;
  let bonusCount = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_fast_start')
      .select('total_bonus_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.total_bonus_cents, 0) / 100;
      bonusCount = commissions.length;
    }
  }

  // Check if still in first 30 days
  const joinDate = distributor ? new Date(distributor.created_at) : new Date();
  const daysSinceJoined = distributor ? Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysRemaining = Math.max(0, 30 - daysSinceJoined);
  const isEligible = daysRemaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-600 text-white text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-orange-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">⚡</div>
            <div>
              <h1 className="text-4xl font-bold">Fast Start Bonuses</h1>
              <p className="text-xl text-orange-100 mt-2">Quick $100 for new distributors!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-orange-500">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">${totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{bonusCount}</div>
              <div className="text-sm text-gray-600">Bonuses Received</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{daysRemaining}</div>
              <div className="text-sm text-gray-600">Days Remaining</div>
            </div>
          </div>
          {isEligible && (
            <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-3 text-center">
              <span className="text-green-700 font-semibold">✅ You're still eligible for Fast Start bonuses!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Fast Start is a <strong>quick-win bonus</strong> designed to help new distributors get paid fast!
            When you enroll someone within your <strong>first 30 days</strong> as a distributor, you earn
            <strong> $100 immediately</strong>.
          </p>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> It's a "welcome gift" for taking action fast! The company wants
              to reward you for hitting the ground running and building momentum.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works (Super Simple!)</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br blue-50 rounded-lg p-6 text-center border-2 border-blue-300">
              <div className="text-4xl mb-3">1️⃣</div>
              <div className="font-bold text-gray-900 mb-2">You Join</div>
              <div className="text-sm text-gray-700">Become a distributor</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center border-2 border-green-300">
              <div className="text-4xl mb-3">2️⃣</div>
              <div className="font-bold text-gray-900 mb-2">Enroll Someone</div>
              <div className="text-sm text-gray-700">Within 30 days</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center border-2 border-yellow-400">
              <div className="text-4xl mb-3">3️⃣</div>
              <div className="font-bold text-gray-900 mb-2">Get $100!</div>
              <div className="text-sm text-gray-700">Instant bonus</div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border-2 border-green-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">Enroll 5 people = $500 Fast Start Bonus!</div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Life Example</h2>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border-l-4 border-orange-500">
            <h3 className="font-bold text-gray-900 mb-3">📖 Marcus's Fast Start Story</h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Day 1:</span>
                  <span className="text-sm text-gray-600">Marcus joins Apex</span>
                </div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Day 5:</span>
                  <span className="text-sm text-gray-600">Enrolls his friend Sarah</span>
                </div>
                <div className="text-right font-bold text-green-600">+$100 💰</div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Day 12:</span>
                  <span className="text-sm text-gray-600">Enrolls his brother Mike</span>
                </div>
                <div className="text-right font-bold text-green-600">+$100 💰</div>
              </div>
              <div className="bg-white rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Day 28:</span>
                  <span className="text-sm text-gray-600">Enrolls coworker Lisa</span>
                </div>
                <div className="text-right font-bold text-green-600">+$100 💰</div>
              </div>
              <div className="border-t-2 pt-3 flex justify-between text-lg">
                <span className="font-semibold">Total Fast Start Bonuses:</span>
                <span className="font-bold text-green-600">$300 in 28 days! 🎉</span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>💡 Pro Tip:</strong> Many successful distributors use their Fast Start bonuses to buy more
              products to share with prospects, creating momentum that continues long after the 30 days!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Enroll someone within 30 days of joining</div>
                  <div className="text-sm text-gray-600">They must sign up as a distributor</div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⏰</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Clock starts from YOUR join date</div>
                  <div className="text-sm text-gray-600">You have exactly 30 days to earn Fast Start bonuses</div>
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
                What happens after 30 days?
              </summary>
              <p className="text-gray-700 mt-2">
                After 30 days, you no longer qualify for Fast Start bonuses. But don't worry - you'll still earn
                all the other commission types when you enroll people!
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do I need to be active to earn Fast Start?
              </summary>
              <p className="text-gray-700 mt-2">
                No! Fast Start bonuses are paid even if you haven't hit 50 BV yet. It's designed to help brand
                new distributors get their first commission check quickly.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Is there a limit to how many I can earn?
              </summary>
              <p className="text-gray-700 mt-2">
                No limit! Enroll 10 people in 30 days = $1,000 in Fast Start bonuses. The more you enroll,
                the more you earn!
              </p>
            </details>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {isEligible ? 'You Still Have Time!' : 'Help Others Earn Fast Start!'}
          </h2>
          <p className="mb-6 text-blue-200">
            {isEligible
              ? `You have ${daysRemaining} days left to earn Fast Start bonuses. Start sharing your link!`
              : 'Even though your Fast Start period is over, you can help your new team members earn theirs!'}
          </p>
          <Link
            href="/dashboard"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Get My Referral Link
          </Link>
        </section>
      </div>
    </div>
  );
}
