// =============================================
// Customer Retention Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Customer Retention - Compensation Plan',
};

export default async function CustomerRetentionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/compensation" className="inline-flex items-center text-teal-200 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🔄</div>
            <div>
              <h1 className="text-4xl font-bold">Customer Retention Bonuses</h1>
              <p className="text-xl text-teal-100 mt-2">Recurring rewards for loyal customers!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Customer Retention Bonuses reward you for keeping customers <strong>happy and buying</strong> month
            after month. The longer a customer stays active, the more bonus you earn!
          </p>
          <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> A customer who buys once is good. A customer who buys
              every month for a year? That's amazing - and you get paid extra for it!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Retention Tiers</h2>
          <div className="space-y-3">
            <div className="bg-teal-50 rounded-lg p-5 border-2 border-teal-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">3 Consecutive Months</span>
                <span className="text-2xl font-bold text-teal-600">$15 bonus</span>
              </div>
              <p className="text-sm text-gray-600">Customer orders 3 months in a row</p>
            </div>

            <div className="bg-teal-100 rounded-lg p-5 border-2 border-teal-400">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">6 Consecutive Months</span>
                <span className="text-2xl font-bold text-teal-600">$35 bonus</span>
              </div>
              <p className="text-sm text-gray-600">Customer orders 6 months in a row</p>
            </div>

            <div className="bg-teal-200 rounded-lg p-5 border-2 border-teal-500">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">12 Consecutive Months</span>
                <span className="text-2xl font-bold text-teal-600">$100 bonus</span>
              </div>
              <p className="text-sm text-gray-600">Customer orders every month for a year!</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real Example</h2>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded p-6 border-l-4 border-teal-500">
            <h3 className="font-bold text-gray-900 mb-3">📖 Mike's Loyal Customers</h3>
            <p className="text-gray-700 mb-4">
              Mike has 10 customers who love the products. Here's what happens over a year:
            </p>
            <div className="bg-white rounded p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>5 customers hit 3 months (5 × $15)</span>
                <span className="font-bold text-green-600">$75</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>3 customers hit 6 months (3 × $35)</span>
                <span className="font-bold text-green-600">$105</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>2 customers hit 12 months (2 × $100)</span>
                <span className="font-bold text-green-600">$200</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total Retention Bonuses:</span>
                <span className="text-green-600">$380</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 italic">
              Plus Mike earned regular retail commissions on all those monthly orders!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-green-50 border-2 border-green-300 rounded p-6">
            <p className="text-gray-700 mb-3">
              <strong>Automatic tracking!</strong> The system tracks all your customers automatically.
            </p>
            <p className="text-gray-700">
              <strong>Your job:</strong> Provide great service, check in with customers, and help them reorder
              when they're running low!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Build a Base of Loyal Customers!</h2>
          <p className="mb-6 text-blue-100">
            Focus on customer service and watch retention bonuses add up!
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
