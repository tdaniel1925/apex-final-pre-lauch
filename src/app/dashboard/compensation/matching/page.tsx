// =============================================
// Matching Bonuses Detail Page
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Matching Bonuses - Compensation Plan',
  description: 'Match what your personal enrollments earn',
};

export default async function MatchingBonusesPage() {
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
  let recordCount = 0;

  if (distributor) {
    const { data: commissions } = await serviceClient
      .from('commissions_matching')
      .select('total_commission_cents')
      .eq('distributor_id', distributor.id);

    if (commissions) {
      totalEarned = commissions.reduce((sum, c) => sum + c.total_commission_cents, 0) / 100;
      recordCount = commissions.length;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/compensation"
            className="inline-flex items-center text-green-200 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">🎯</div>
            <div>
              <h1 className="text-4xl font-bold">Matching Bonuses</h1>
              <p className="text-xl text-green-100 mt-2">Earn when your leaders earn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-green-500">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Your Matching Bonuses
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">
                ${totalEarned.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2B4C7E]">{recordCount}</div>
              <div className="text-sm text-gray-600">Monthly Calculations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is It?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Matching bonuses reward you for <strong>developing leaders</strong>. When someone you personally
            enrolled earns commissions, you get a percentage of their earnings as a "match." It's like getting
            paid for being a good teacher!
          </p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
            <p className="text-gray-700">
              <strong>Think of it like this:</strong> When your student succeeds, you win too! The better you train
              your team, the more they earn, and the more you earn from matching.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          <div className="bg-gradient-to-br from-green-50 to-blue-100 rounded-lg p-8 mb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl mb-3 mx-auto">
                  👤
                </div>
                <div className="font-bold text-gray-900 mb-1">Sarah (Your Personal Enrollee)</div>
                <div className="text-sm text-gray-600 mb-2">Earns in commissions:</div>
                <div className="text-3xl font-bold text-blue-600">$1,000</div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">×</div>
                  <div className="text-2xl font-bold text-green-600">10%</div>
                  <div className="text-sm text-gray-600">Match Rate</div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-3 mx-auto">
                  💰
                </div>
                <div className="font-bold text-gray-900 mb-1">You Earn</div>
                <div className="text-sm text-gray-600 mb-2">Matching Bonus:</div>
                <div className="text-3xl font-bold text-green-600">$100</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">Match Rates by Rank:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Generation 1 (People you enrolled)</span>
                <span className="font-bold text-green-600">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Generation 2 (Your leaders' leaders)</span>
                <span className="font-bold text-green-600">5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Generation 3 (Next level leaders)</span>
                <span className="font-bold text-green-600">3%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Life Example</h2>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="font-bold text-gray-900 mb-3">📖 Jennifer's Matching Story</h3>
            <p className="text-gray-700 mb-4">
              Jennifer personally enrolled 3 people who became strong leaders. Here's her matching bonus this month:
            </p>
            <div className="bg-white rounded p-4 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Sarah (Gen 1)</span>
                  <span className="text-sm text-gray-600">earned $800 → 10% match</span>
                </div>
                <div className="text-right font-bold text-green-600">$80.00</div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Mike (Gen 1)</span>
                  <span className="text-sm text-gray-600">earned $1,200 → 10% match</span>
                </div>
                <div className="text-right font-bold text-green-600">$120.00</div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Lisa (Gen 1)</span>
                  <span className="text-sm text-gray-600">earned $600 → 10% match</span>
                </div>
                <div className="text-right font-bold text-green-600">$60.00</div>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-semibold">Total Matching Bonus:</span>
                <span className="font-bold text-green-600">$260.00 💰</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 italic">
              The more successful Jennifer's team becomes, the more she earns in matching bonuses!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Qualify</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">1. Be Active</div>
                  <p className="text-gray-700 text-sm">You need 50 BV in personal purchases that month</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">2. Achieve Rank</div>
                  <p className="text-gray-700 text-sm">Gen 1 matching starts at Silver rank and above</p>
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
                Do I match ALL their commissions?
              </summary>
              <p className="text-gray-700 mt-2">
                You match their Matrix, Override, and Infinity commissions. You don't match retail, fast start,
                or rank advancement bonuses.
              </p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What are "generations"?
              </summary>
              <p className="text-gray-700 mt-2">
                Gen 1 = people you personally enrolled who reach a qualifying rank (Silver+). Gen 2 = when THEY
                personally enroll someone who reaches a qualifying rank. Gen 3 = the next level of leaders.
              </p>
            </details>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Earn Matching Bonuses?</h2>
          <p className="mb-6 text-blue-200">
            Focus on training your personal enrollments to become leaders!
          </p>
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
