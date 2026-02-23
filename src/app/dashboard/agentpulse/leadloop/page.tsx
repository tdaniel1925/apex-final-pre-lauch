// =============================================
// LeadLoop Teaser Page
// Referral & Review Automation module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'LeadLoop - Referral & Review Automation | AgentPulse',
  description: 'Turn every client into a 5-star reviewer and referral source',
};

export default async function LeadLoopPage() {
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
                <h1 className="text-3xl font-bold text-gray-900">🔁 LeadLoop</h1>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600">Referral & Review Automation — Turn every client into a reviewer and referral source</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">The Best Leads Come From Referrals</h2>
          <p className="text-lg text-gray-800">
            But 94% of agents never systematically ask for them.
          </p>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">LeadLoop does it for you — every single time.</h3>
        </div>
      </div>

      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">The Post-Close Sequence</h2>
          <p className="text-center text-gray-600 mb-12">You close a policy → LeadLoop takes over</p>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  Day 0
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">✉️ Thank You Email</h3>
                  <p className="text-gray-700 italic">
                    "Thanks for trusting me with your coverage! I'm here if you have any questions..."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  Day 3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">⭐ Review Request</h3>
                  <p className="text-gray-700 mb-3">
                    "If you're happy with our service, would you mind leaving a quick Google review?"
                  </p>
                  <div className="flex gap-2">
                    <span className="inline-block px-3 py-1 bg-white border border-blue-300 rounded text-xs font-semibold text-blue-700">
                      Google Review Link
                    </span>
                    <span className="inline-block px-3 py-1 bg-white border border-blue-300 rounded text-xs font-semibold text-blue-700">
                      Facebook
                    </span>
                    <span className="inline-block px-3 py-1 bg-white border border-blue-300 rounded text-xs font-semibold text-blue-700">
                      Yelp
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  Day 14
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🔗 Referral Ask with Personal Link</h3>
                  <p className="text-gray-700 mb-3">
                    "Know anyone who could benefit from the same coverage? Here's a link to share:"
                  </p>
                  <div className="bg-white border-2 border-purple-300 rounded p-3 text-sm font-mono text-purple-700">
                    agentpulse.io/refer/yourname/client-mike-torres
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ✓ Unique tracking link • ✓ Click & conversion tracking
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  Day 30
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">💬 Check-In</h3>
                  <p className="text-gray-700 italic">
                    "How's everything going with your new policy? Any questions?"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  Day 90
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🔄 Re-Ask for Referrals</h3>
                  <p className="text-gray-700 italic">
                    "Reminder: if you know anyone looking for insurance, I'd love to help them too!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Tracking Dashboards</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-200">
              <h3 className="font-bold text-gray-900 mb-4">📊 Review Tracking</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Reviews Received</span>
                    <span className="text-2xl font-bold text-gray-900">47</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⭐⭐⭐⭐⭐</span>
                    <span className="text-lg font-semibold text-gray-900">4.9</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Reviews:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">John M. — Google</span>
                      <span className="text-gray-600">⭐⭐⭐⭐⭐ 2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Sarah K. — Facebook</span>
                      <span className="text-gray-600">⭐⭐⭐⭐⭐ 1 week ago</span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                  <span className="font-semibold text-yellow-800">Pending: 12 clients</span> haven't responded yet
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-4">🏆 Referral Leaderboard</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <div>
                    <div className="font-bold text-gray-900">1. Sarah Johnson</div>
                    <div className="text-xs text-gray-600">5 referrals sent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">2 closed</div>
                    <div className="text-xs text-gray-600">$3,400 premium</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                  <div>
                    <div className="font-bold text-gray-900">2. Mike Torres</div>
                    <div className="text-xs text-gray-600">3 referrals sent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">1 closed</div>
                    <div className="text-xs text-gray-600">$1,850 premium</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div>
                    <div className="font-bold text-gray-900">3. Jennifer Lee</div>
                    <div className="text-xs text-gray-600">2 referrals sent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-600">0 closed</div>
                    <div className="text-xs text-gray-600">(yet!)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Real Success Story</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              MT
            </div>
            <div>
              <p className="text-lg text-gray-800 italic mb-4">
                "I closed a life insurance policy for Mike Torres. LeadLoop sent him a thank-you email that afternoon. Three days later, it sent a friendly Google review request. Two weeks later, it sent: 'If you know anyone who could benefit from the same coverage, here's a link to share.' Mike forwarded it to two friends. I got two warm leads without making a single call."
              </p>
              <div className="font-semibold text-gray-900">Agent Success Story</div>
              <div className="text-sm text-gray-600">Real LeadLoop User</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pricing" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">LeadLoop Pricing</h2>
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$49</div>
                <p className="text-sm text-gray-600 mb-4">per month</p>
                <p className="text-sm text-gray-700">Review requests only</p>
              </div>
              <div className="bg-orange-600 text-white rounded-lg p-6 -m-2">
                <div className="inline-block px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded mb-2">
                  RECOMMENDED
                </div>
                <h3 className="font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">$99</div>
                <p className="text-sm text-orange-100 mb-4">per month</p>
                <p className="text-sm">Reviews + Referrals + Tracking</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Elite</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$199</div>
                <p className="text-sm text-gray-600 mb-4">per month</p>
                <p className="text-sm text-gray-700">All Pro + Priority</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Building Your Referral Engine</h2>
          <p className="text-lg text-orange-100 mb-8">
            Join the waitlist for LeadLoop and get 50% off your first month.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
