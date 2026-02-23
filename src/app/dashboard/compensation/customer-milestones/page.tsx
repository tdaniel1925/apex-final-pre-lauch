// =============================================
// Customer Milestone Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Customer Milestones - Compensation Plan',
};

const milestones = [
  { milestone: 'First Purchase', bonus: 10, icon: '🎉' },
  { milestone: '$500 Lifetime', bonus: 25, icon: '🎯' },
  { milestone: '$1,000 Lifetime', bonus: 50, icon: '⭐' },
  { milestone: '$2,500 Lifetime', bonus: 100, icon: '🏆' },
];

export default async function CustomerMilestonesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-pink-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-pink-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🎁</div>
            <div>
              <h1 className="text-4xl font-bold">Customer Milestone Bonuses</h1>
              <p className="text-xl text-pink-100 mt-2">Get rewarded as your customers grow!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Customer Milestone Bonuses reward you for <strong>developing long-term customers</strong>. Every time
            one of your retail customers hits a spending milestone, you get a bonus!
          </p>
          <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> The more your customers love the products and keep buying,
              the more you get paid. It's a win-win!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Milestone Rewards</h2>
          <div className="space-y-3">
            {milestones.map((item) => (
              <div key={item.milestone} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border-2 border-pink-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900">{item.milestone}</div>
                      <div className="text-sm text-gray-600">Bonus when customer reaches this</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">${item.bonus}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real Example</h2>
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded p-6 border-l-4 border-pink-500">
            <h3 className="font-bold text-gray-900 mb-3">📖 Sarah's Customer Journey</h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-3">
                <div className="flex justify-between">
                  <span>Jessica's first order ($79)</span>
                  <span className="font-bold text-green-600">+$10</span>
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="flex justify-between">
                  <span>Jessica hits $500 lifetime</span>
                  <span className="font-bold text-green-600">+$25</span>
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="flex justify-between">
                  <span>Jessica hits $1,000 lifetime</span>
                  <span className="font-bold text-green-600">+$50</span>
                </div>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total Milestone Bonuses:</span>
                <span className="text-green-600">$85</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 italic">
              Plus Sarah earned 30% retail commission on every order Jessica placed!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-green-50 border-2 border-green-300 rounded p-6">
            <p className="text-gray-700">
              <strong>Automatic!</strong> There's no special qualification. Every retail customer you refer
              automatically tracks towards these milestones. You just focus on great customer service!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Build Long-Term Customer Relationships!</h2>
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
