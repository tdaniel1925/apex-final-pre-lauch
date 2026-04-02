'use client';

// =============================================
// Direct Commissions - 27.9% Effective Rate
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md Section 1 & 2
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const commissions = [
  { product: 'PulseGuard', memberPrice: 59, memberEarns: 16.46, retailPrice: 79, retailEarns: 22.04 },
  { product: 'PulseFlow', memberPrice: 129, memberEarns: 35.99, retailPrice: 149, retailEarns: 41.57 },
  { product: 'PulseDrive', memberPrice: 219, memberEarns: 61.10, retailPrice: 299, retailEarns: 83.42 },
  { product: 'PulseCommand', memberPrice: 349, memberEarns: 97.37, retailPrice: 499, retailEarns: 139.22 },
  { product: 'SmartLook', memberPrice: 99, memberEarns: 27.62, retailPrice: 99, retailEarns: 27.62 },
  { product: 'Business Center', memberPrice: 39, memberEarns: 10.00, retailPrice: null, retailEarns: null },
];

export default function CommissionsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-4">
            <Link
              href="/dashboard/compensation"
              className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Compensation Plan
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Direct Commissions</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Earn immediate commissions on every sale. All reps earn the same percentage regardless of rank. Start earning from day one.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">27.9%</div>
              <div className="text-sm text-slate-600">Effective Commission Rate</div>
              <div className="text-xs text-slate-500 mt-1">(All products except BC)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">100%</div>
              <div className="text-sm text-slate-600">Rep Equality</div>
              <div className="text-xs text-slate-500 mt-1">Same rate for all ranks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">Day 1</div>
              <div className="text-sm text-slate-600">Start Earning</div>
              <div className="text-xs text-slate-500 mt-1">No waiting period</div>
            </div>
          </div>
        </div>
      </div>

      {/* How Commissions Work */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Direct Commissions Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Standard Products (27.9%)</h3>
              <p className="text-slate-700 mb-4">
                For all standard products (PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook), you earn
                approximately 27.9% of the sale price as direct commission.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">What You Earn</h4>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold">Your Direct Commission Rate:</span>
                    <span className="text-2xl font-bold text-green-700">27.9%</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-slate-600 leading-relaxed">
                      You earn 27.9% on every sale, paid immediately. This rate is the same for all reps regardless of rank. The remaining value goes to upline overrides and company programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Center ($10 Fixed)</h3>
              <p className="text-slate-700 mb-4">
                Business Center operates on a fixed pricing structure, not the standard waterfall. You always earn
                exactly $10 when you sell a Business Center.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Fixed Commission Structure</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Customer Pays</span>
                    <span className="font-mono">$39.00</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold border-t border-slate-300 pt-2 mt-2">
                    <span>Your Commission</span>
                    <span className="font-mono">$10.00</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-semibold">
                    <span>Sponsor Receives</span>
                    <span className="font-mono">$8.00</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Note: Business Center has a simplified fixed payout structure
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">No Rank Requirements</h3>
                <p className="text-green-800 text-sm">
                  Direct commissions are paid to ALL reps regardless of rank. A brand new Starter earns the same
                  27.9% as an Elite ranked leader. This ensures everyone can earn from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Commission Breakdown by Product</h2>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Member Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">You Earn</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Retail Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">You Earn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {commissions.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.product}</td>
                    <td className="px-6 py-4 text-right text-slate-700">${item.memberPrice}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-green-700">${item.memberEarns.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">
                        {item.product === 'Business Center' ? '25.6%' : '27.9%'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700">
                      {item.retailPrice ? `$${item.retailPrice}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.retailEarns ? (
                        <>
                          <div className="font-bold text-green-700">${item.retailEarns.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">27.9%</div>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Example Earnings Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-2">10 Sales/Month</div>
              <div className="text-lg font-bold text-slate-900 mb-1">$164.60</div>
              <div className="text-xs text-slate-500">10 × PulseGuard (member)</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">20 Sales/Month</div>
              <div className="text-lg font-bold text-slate-900 mb-1">$719.80</div>
              <div className="text-xs text-slate-500">20 × PulseFlow (member)</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">5 Premium Sales</div>
              <div className="text-lg font-bold text-slate-900 mb-1">$696.10</div>
              <div className="text-xs text-slate-500">5 × PulseCommand (retail)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">When You Get Paid</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Commissions are calculated at the end of each pay period</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Payments issued on the 15th of the following month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Direct deposit or check (your choice)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Refund Policy</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>30-day money-back guarantee for all products</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Commission clawback if customer refunds within 30 days</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Clawback deducted from your next commission payment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Earning Commissions Today</h2>
          <p className="text-xl text-slate-200 mb-8">
            Direct commissions are paid on every sale, from day one, at the same rate for everyone. Combine with
            override bonuses and team building to maximize your income potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/overrides"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              Learn About Overrides
            </Link>
            <Link
              href="/dashboard/compensation/products"
              className="bg-slate-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              View Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
