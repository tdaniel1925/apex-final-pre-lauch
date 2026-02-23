// =============================================
// Vacation Bonus Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Vacation Bonus - Compensation Plan',
};

const vacationTiers = [
  { rank: 'Silver', bonus: 1000, description: 'Weekend getaway' },
  { rank: 'Gold', bonus: 2500, description: 'Week-long vacation' },
  { rank: 'Platinum', bonus: 5000, description: 'Luxury cruise or resort' },
  { rank: 'Diamond+', bonus: 10000, description: 'Dream destination trip' },
];

export default async function VacationBonusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-violet-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-violet-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">✈️</div>
            <div>
              <h1 className="text-4xl font-bold">Vacation Bonus</h1>
              <p className="text-xl text-violet-100 mt-2">Annual rewards from $1,000 to $10,000!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            The Vacation Bonus is an <strong>annual reward</strong> for consistent high performers. Maintain your
            rank for a full year, and you'll receive a cash bonus specifically for taking your dream vacation!
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vacation Tiers</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {vacationTiers.map((tier) => (
              <div key={tier.rank} className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6 border-2 border-violet-300">
                <div className="text-2xl font-bold text-gray-900 mb-1">{tier.rank}</div>
                <div className="text-3xl font-bold text-violet-600 mb-2">${tier.bonus.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{tier.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-purple-50 border-2 border-purple-300 rounded p-6">
            <p className="text-gray-700 mb-3">
              <strong>1. Maintain Your Rank</strong> - Stay at Silver or higher for 12 consecutive months
            </p>
            <p className="text-gray-700">
              <strong>2. Stay Active</strong> - 50 BV minimum every month
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Planning Your Dream Vacation!</h2>
          <Link
            href="/dashboard/compensation"
            className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            View All Bonuses
          </Link>
        </section>
      </div>
    </div>
  );
}
