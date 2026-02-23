// =============================================
// PulseInsight Teaser Page
// SmartOffice Intelligence module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'PulseInsight - SmartOffice Intelligence | AgentPulse',
  description: 'Turn ugly SmartOffice spreadsheets into beautiful dashboards with AI chat',
};

export default async function PulseInsightPage() {
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
                <h1 className="text-3xl font-bold text-gray-900">📊 PulseInsight</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600">SmartOffice Intelligence — Turn ugly spreadsheets into beautiful dashboards with AI chat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">Your SmartOffice Reports Are Unreadable</h2>
          <p className="text-center text-gray-700">
            You get messy Excel files with 47 columns and 1,300 rows. Finding insights = impossible.
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">PulseInsight transforms them into this: ↓</h3>
        </div>
      </div>

      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Beautiful Dashboards + AI Insights</h2>

          <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300 mb-12">
            <div className="text-sm text-gray-600 mb-4">Preview: Your Weekly Contract Report</div>
            <div className="bg-white rounded-lg p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Your Weekly Contract Summary</h3>
                  <p className="text-sm text-gray-600">March 1-7, 2025</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">1,313</div>
                  <div className="text-xs text-gray-600">Active Contracts</div>
                </div>
              </div>

              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                <h4 className="font-bold text-gray-900 mb-3">🤖 AI Key Takeaways</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>You have 1,313 active contracts across 57 carriers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span className="font-semibold text-red-700">12 contracts expire in the next 30 days (action needed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>American General is your top carrier (237 contracts)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>3 advisors were onboarded this week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span className="text-green-700 font-semibold">Commission trend: Up 12% vs last month 📈</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">57</div>
                  <div className="text-xs text-gray-700">Carriers</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">+3</div>
                  <div className="text-xs text-gray-700">New This Week</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">12%</div>
                  <div className="text-xs text-gray-700">Growth Rate</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                  📊 View Full Dashboard
                </button>
                <button className="flex-1 px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50">
                  💬 Ask AI a Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12">Three simple steps to beautiful insights</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Get Your Unique Email</h3>
              <p className="text-sm text-gray-700 mb-3">yourname@reports.agentpulse.io</p>
              <div className="bg-white rounded-lg shadow-md p-4 text-sm text-gray-700">
                PulseInsight gives you a personal email address just for reports
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Forward SmartOffice Reports</h3>
              <p className="text-sm text-gray-700 mb-3">Set SmartOffice to auto-email</p>
              <div className="bg-white rounded-lg shadow-md p-4 text-sm text-gray-700">
                Daily, weekly, or monthly — your choice
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Get Beautiful Dashboards</h3>
              <p className="text-sm text-gray-700 mb-3">Within 5 minutes</p>
              <div className="bg-white rounded-lg shadow-md p-4 text-sm text-gray-700">
                Branded PDF + interactive web dashboard + AI insights
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Ask Your Data Anything</h2>

          <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
            <div className="bg-white rounded-lg p-6 space-y-6">
              <h3 className="font-bold text-gray-900 mb-4">💬 AI Chat Interface</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    You
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800">"Which advisors have the most contracts?"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 bg-white border-2 border-indigo-200 rounded-lg p-4">
                    <p className="text-gray-800 mb-3">Here are your top 5 advisors by contract count:</p>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-700">1. Sarah Martinez</span>
                        <span className="font-bold text-gray-900">47 contracts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">2. Mike Johnson</span>
                        <span className="font-bold text-gray-900">41 contracts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">3. Jennifer Lee</span>
                        <span className="font-bold text-gray-900">38 contracts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    You
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800">"Show me policies expiring in the next 60 days"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 bg-white border-2 border-indigo-200 rounded-lg p-4">
                    <p className="text-gray-800 mb-2">You have 23 policies expiring in the next 60 days:</p>
                    <div className="text-xs text-gray-600">[Table with client names, policy types, expiration dates]</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    You
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800">"Compare my contract volume this year vs last year"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="flex-1 bg-white border-2 border-indigo-200 rounded-lg p-4">
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                      <p className="text-lg font-bold text-green-700">📈 You're up 34% year-over-year!</p>
                    </div>
                    <p className="text-xs text-gray-600">[Line graph showing growth trend]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Supported Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-bold text-gray-900 mb-2">Contract Reports</h3>
              <p className="text-sm text-gray-700">Track all active contracts, carriers, and contract counts</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-bold text-gray-900 mb-2">Agent Bio Reports</h3>
              <p className="text-sm text-gray-700">Monitor advisor onboarding and demographics</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-bold text-gray-900 mb-2">Policy Reports</h3>
              <p className="text-sm text-gray-700">View policy details, expirations, and renewals</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Commission Reports</h3>
              <p className="text-sm text-gray-700">Track commission earnings and trends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Real Results</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-indigo-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              LB
            </div>
            <div>
              <p className="text-lg text-gray-800 italic mb-4">
                "I used to spend 2 hours every Monday analyzing my SmartOffice reports. Now I get AI insights in my inbox and can ask questions in seconds. 'Which advisors were onboarded last month?' — instant answer with a chart. Saved me 8 hours/month."
              </p>
              <div className="font-semibold text-gray-900">Laura Bennett</div>
              <div className="text-sm text-gray-600">Agency Owner, FL</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pricing" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">PulseInsight Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 text-center">
              <h3 className="font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">$49</div>
              <p className="text-sm text-gray-600 mb-4">per month</p>
              <ul className="text-sm text-gray-700 space-y-2 text-left">
                <li>✓ 1 report type</li>
                <li>✓ Basic beautification</li>
                <li className="text-gray-400">✗ AI chat</li>
              </ul>
            </div>
            <div className="bg-indigo-600 text-white text-white rounded-lg p-6 -m-2">
              <div className="inline-block px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded mb-2">
                RECOMMENDED
              </div>
              <h3 className="font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">$99</div>
              <p className="text-sm text-indigo-100 mb-4">per month</p>
              <ul className="text-sm space-y-2 text-left">
                <li>✓ All report types</li>
                <li>✓ AI chat interface</li>
                <li>✓ 1 year history</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 text-center">
              <h3 className="font-bold text-gray-900 mb-2">Elite</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">$199</div>
              <p className="text-sm text-gray-600 mb-4">per month</p>
              <ul className="text-sm text-gray-700 space-y-2 text-left">
                <li>✓ All Pro features</li>
                <li>✓ White-label PDFs</li>
                <li>✓ Priority processing</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <h4 className="font-bold text-gray-900 mb-2">Also Available Standalone</h4>
            <div className="flex gap-4 justify-center text-sm">
              <div>
                <span className="font-semibold">PulseInsight Basic:</span> $29/mo
              </div>
              <div>
                <span className="font-semibold">PulseInsight Pro:</span> $69/mo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Transform Your SmartOffice Data</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join the waitlist for PulseInsight and get 50% off your first month.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
