// =============================================
// PolicyPing Teaser Page
// Renewal & Cross-Sell Radar module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'PolicyPing - Renewal & Cross-Sell Radar | AgentPulse',
  description: 'Never lose a renewal. Never miss a cross-sell opportunity.',
};

export default async function PolicyPingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const launchDate = new Date('2025-02-28T00:00:00');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link href="/dashboard/agentpulse" className="inline-flex items-center text-sm text-gray-600 hover:text-[#2B4C7E]">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Modules
          </Link>
        </div>
      </div>

      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">🔔 PolicyPing</h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600">Renewal & Cross-Sell Radar — Never lose a renewal or miss a cross-sell</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Revenue Killer */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-8 text-center mb-12">
          <h2 className="text-3xl font-bold text-red-700 mb-4">The Revenue Killer</h2>
          <p className="text-xl text-gray-800 mb-4">
            78% of insurance agents lose 20-30% of their book to non-renewals every year.
          </p>
          <p className="text-lg text-gray-700">
            Why? <span className="font-bold">They simply forgot to reach out in time.</span>
          </p>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">PolicyPing fixes this forever.</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">📅</div>
              <h4 className="font-bold text-gray-900 mb-2">Renewal Calendar</h4>
              <p className="text-sm text-gray-700">Visual calendar with color-coded urgency. See every expiration at a glance.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">⏰</div>
              <h4 className="font-bold text-gray-900 mb-2">Automated Alerts</h4>
              <p className="text-sm text-gray-700">Auto-alerts at 90, 60, 30, and 14 days before expiration with ready-to-send templates.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-gray-900 mb-2">Cross-Sell Radar</h4>
              <p className="text-sm text-gray-700">AI detects coverage gaps and recommends products your clients are missing.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">Commission Tracking</h4>
              <p className="text-sm text-gray-700">Track renewal revenue and cross-sell opportunities by policy type.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Calendar Preview */}
      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Renewal Calendar</h2>

          <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300 mb-12">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">March 2025 — Policy Expirations</h3>
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-700">This Month (Urgent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">60 Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">90+ Days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Sarah Johnson — Home Insurance</h4>
                      <p className="text-sm text-gray-700">Expires: March 15, 2025 (28 days)</p>
                      <p className="text-xs text-red-600 font-semibold mt-1">🚨 URGENT — Contact immediately</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">$1,240</div>
                      <div className="text-xs text-gray-600">Annual premium</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">💡 Cross-Sell Opportunity:</span> Also has Auto, no Umbrella
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                        📧 Send Renewal + Umbrella Bundle
                      </button>
                      <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Michael Torres — Life Insurance</h4>
                      <p className="text-sm text-gray-700">Expires: April 22, 2025 (60 days)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">$2,840</div>
                      <div className="text-xs text-gray-600">Annual premium</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">💡 Cross-Sell Opportunity:</span> No Disability Insurance
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                        📧 Send Renewal Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Sell Rules */}
      <div className="bg-green-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Built-In Cross-Sell Rules</h2>
          <p className="text-center text-gray-600 mb-12">PolicyPing automatically detects coverage gaps</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🚗→☂️</div>
              <h3 className="font-bold text-gray-900 mb-2">Auto → Umbrella</h3>
              <p className="text-sm text-gray-700">Suggests umbrella policy for liability protection</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🏠→☂️</div>
              <h3 className="font-bold text-gray-900 mb-2">Home → Umbrella</h3>
              <p className="text-sm text-gray-700">Recommends umbrella for homeowners</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🚗→🏠</div>
              <h3 className="font-bold text-gray-900 mb-2">Auto, No Home → Home</h3>
              <p className="text-sm text-gray-700">Bundle opportunity for auto-only clients</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">❤️→🦽</div>
              <h3 className="font-bold text-gray-900 mb-2">Life → Disability</h3>
              <p className="text-sm text-gray-700">Suggests disability insurance for life clients</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🏥→❤️</div>
              <h3 className="font-bold text-gray-900 mb-2">Health, No Life → Life</h3>
              <p className="text-sm text-gray-700">Recommends life insurance for health clients</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">👴→📋</div>
              <h3 className="font-bold text-gray-900 mb-2">Medicare → Supplement</h3>
              <p className="text-sm text-gray-700">Suggests Part D or Medigap coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Results */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Real Results</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              JP
            </div>
            <div>
              <p className="text-lg text-gray-800 italic mb-4">
                "PolicyPing saved me $47,000 in renewals I would have lost. The cross-sell radar added $23,000 in new premiums in 90 days. It pays for itself 100x over."
              </p>
              <div className="font-semibold text-gray-900">Jennifer Park</div>
              <div className="text-sm text-gray-600">P&C Agent, CA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">PolicyPing Pricing</h2>
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$49</div>
                <p className="text-sm text-gray-600 mb-4">per month</p>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  <li>✓ 250 policies tracked</li>
                  <li>✓ Renewal alerts</li>
                  <li className="text-gray-400">✗ Cross-sell radar</li>
                </ul>
              </div>
              <div className="bg-green-600 text-white text-white rounded-lg p-6 -m-2">
                <div className="inline-block px-3 py-1 bg-white text-green-600 text-xs font-bold rounded mb-2">
                  RECOMMENDED
                </div>
                <h3 className="font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">$99</div>
                <p className="text-sm text-green-100 mb-4">per month</p>
                <ul className="text-sm space-y-2 text-left">
                  <li>✓ 1,000 policies</li>
                  <li>✓ Renewal alerts</li>
                  <li>✓ Cross-sell radar</li>
                  <li>✓ Commission tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Elite</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$199</div>
                <p className="text-sm text-gray-600 mb-4">per month</p>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  <li>✓ Unlimited policies</li>
                  <li>✓ All Pro features</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 text-white text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Lose a Renewal Again</h2>
          <p className="text-lg text-green-100 mb-8">
            Join the waitlist for PolicyPing and get 50% off your first month.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
