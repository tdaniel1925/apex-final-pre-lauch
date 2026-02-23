// =============================================
// Retail Commissions Detail Page
// Visual explanation with real-time data
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Retail Commissions - Compensation Plan',
  description: 'Learn how to earn 30% profit on retail sales',
};

export default async function RetailCommissionsPage() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  // Get retail commission stats
  let totalEarned = 0;
  let orderCount = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_retail')
      .select('commission_amount_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.commission_amount_cents, 0) / 100;
      orderCount = commissions.length;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/compensation"
            className="inline-flex items-center text-white hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">🛍️</div>
            <div>
              <h1 className="text-4xl font-bold">Retail Commissions</h1>
              <p className="text-xl text-white mt-2">Earn 30% profit on every customer sale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Stats */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-blue-500">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Your Retail Commissions
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">
                ${totalEarned.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{orderCount}</div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* What Is It? */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Retail commissions are the simplest way to earn. When a <strong>customer</strong> (not a distributor)
            buys a product through your referral link, you earn the difference between the retail price and the
            wholesale price - typically around <strong>30% profit</strong>.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> You're like a store. You buy products at wholesale,
              customers buy at retail, you keep the difference!
            </p>
          </div>
        </section>

        {/* How It Works - Visual */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          {/* Visual Diagram */}
          <div className="bg-gradient-to-br blue-50 rounded-lg p-8 mb-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Customer */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl mb-2">
                  👤
                </div>
                <div className="font-semibold text-gray-900">Customer</div>
                <div className="text-sm text-gray-600">Pays</div>
                <div className="text-2xl font-bold text-red-600 mt-1">$100</div>
                <div className="text-xs text-gray-500">(Retail Price)</div>
              </div>

              {/* Arrow */}
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* You */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mb-2">
                  💰
                </div>
                <div className="font-semibold text-gray-900">You</div>
                <div className="text-sm text-gray-600">Your Cost</div>
                <div className="text-2xl font-bold text-gray-600 mt-1">$70</div>
                <div className="text-xs text-gray-500">(Wholesale)</div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <svg className="w-8 h-8 text-green-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
              </div>

              {/* Profit */}
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl mb-2">
                  ✨
                </div>
                <div className="font-semibold text-gray-900">Your Profit</div>
                <div className="text-sm text-gray-600">You Keep</div>
                <div className="text-3xl font-bold text-green-600 mt-1">$30</div>
                <div className="text-xs text-gray-500">(30% Commission)</div>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">Simple Formula:</div>
            <div className="text-xl font-mono font-bold text-[#2B4C7E]">
              Your Commission = Retail Price - Wholesale Price
            </div>
          </div>
        </section>

        {/* Real Example */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Life Example</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="font-bold text-gray-900 mb-3">📖 Sarah's Story</h3>
              <p className="text-gray-700 mb-4">
                Sarah shares her referral link on social media. Her friend Jessica clicks it and buys the
                <strong> Premium Wellness Package</strong> for <strong>$149</strong>.
              </p>
              <div className="bg-white rounded p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Retail Price (what Jessica paid):</span>
                  <span className="font-bold">$149.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wholesale Price (Sarah's cost):</span>
                  <span className="font-bold">$104.30</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="text-gray-900 font-semibold">Sarah's Commission:</span>
                  <span className="font-bold text-green-600">$44.70 💰</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4 italic">
                And Sarah didn't have to stock inventory, handle shipping, or process the payment. The company handles everything!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Best For</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Social media influencers</li>
                      <li>• People with large networks</li>
                      <li>• Anyone who loves the products</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Pro Tips</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Share product testimonials</li>
                      <li>• Use before/after stories</li>
                      <li>• Focus on benefits, not features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Qualify */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">No special requirements!</span>
            </div>
            <p className="text-gray-700">
              Anyone can earn retail commissions - even brand new distributors on day one.
              Just share your referral link and start earning!
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do I need to stock inventory?
              </summary>
              <p className="text-gray-700 mt-2">
                No! When a customer orders through your link, the company ships directly to them.
                You never handle products or shipping.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                When do I get paid?
              </summary>
              <p className="text-gray-700 mt-2">
                Retail commissions are paid weekly on Fridays for all qualifying sales from the previous week.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What if the customer returns the product?
              </summary>
              <p className="text-gray-700 mt-2">
                If a customer returns a product, the commission for that sale is reversed.
              </p>
            </details>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning Retail Commissions?</h2>
          <p className="mb-6 text-white">
            Share your referral link with friends, family, and on social media!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get My Referral Link
            </Link>
            <Link
              href="/dashboard/compensation"
              className="bg-blue-800/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800/70 transition-colors border border-blue-400/30"
            >
              View Other Commission Types
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
