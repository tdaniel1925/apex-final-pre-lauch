// =============================================
// PulseFollow Teaser Page
// Smart Drip Engine module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'PulseFollow - Smart Drip Engine | AgentPulse',
  description: 'Automatically nurture leads with personalized email and SMS sequences',
};

export default async function PulseFollowPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const launchDate = new Date('2025-02-28T00:00:00');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link
            href="/dashboard/agentpulse"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#2B4C7E]"
          >
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
                <h1 className="text-3xl font-bold text-gray-900">📧 PulseFollow</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600">Smart Drip Engine — Set it once. Nurture leads 24/7.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Without PulseFollow</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Manually tracking dozens or hundreds of leads in spreadsheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Forgetting to follow up = lost sales and wasted ad spend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Spending 10+ hours per week on admin and follow-up tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Generic copy-paste messages that don't convert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Missing important dates like birthdays and policy anniversaries</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">✅ With PulseFollow</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Automatic personalized sequences sent to every lead</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Never forget a birthday, renewal window, or check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Set it once, runs 24/7 while you sleep or sell</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Professional, branded messages that build trust</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Life event triggers automatically engage clients at perfect moments</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm mb-3">
                  Step 1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Choose a Pre-Built Template
                </h3>
                <p className="text-gray-700 mb-4">
                  Select from 6 proven nurture sequences ready to activate in 60 seconds:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    New Lead Warm-Up (5 emails over 14 days)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Renewal Reminder (3 touchpoints: SMS + email)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Post-Close Nurture (7 touchpoints over 90 days)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Re-Engagement (Stale lead reactivation)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Birthday Outreach (Automated annual wishes)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cross-Sell Introduction (Introduce new products)
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                  <div className="text-sm text-gray-600 mb-2">Preview: Template Library</div>
                  <div className="bg-white rounded p-4 text-sm space-y-2">
                    <div className="font-semibold text-gray-900">📧 New Lead Warm-Up</div>
                    <div className="text-xs text-gray-600">5 emails • 14 day sequence</div>
                    <div className="text-xs text-gray-700 mt-2">
                      Day 0: Welcome + Introduction<br />
                      Day 2: Value-add article<br />
                      Day 5: Check-in message<br />
                      Day 10: Quote offer<br />
                      Day 14: Final nudge
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm mb-3">
                  Step 2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Customize with Your Branding
                </h3>
                <p className="text-gray-700 mb-4">
                  Drag-and-drop editor makes it easy to personalize every message:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Add your logo and brand colors
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Insert merge tags: {`{first_name}, {agent_name}, {policy_type}`}
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Adjust timing between messages
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Edit message content to match your voice
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                  <div className="text-sm text-gray-600 mb-2">Preview: Message Editor</div>
                  <div className="bg-white rounded p-4 text-sm">
                    <div className="font-semibold text-gray-900 mb-2">Email #1: Welcome</div>
                    <div className="border border-gray-200 rounded p-3 text-xs space-y-2">
                      <div className="font-semibold">Subject: Welcome, {`{first_name}`}!</div>
                      <div className="text-gray-700 leading-relaxed">
                        Hi {`{first_name}`},<br /><br />
                        Thanks for requesting a quote! I'm {`{agent_name}`}, and I'm here to help you find the perfect coverage...<br /><br />
                        Over the next few days, I'll share some helpful resources...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm mb-3">
                  Step 3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Activate & Watch It Run
                </h3>
                <p className="text-gray-700 mb-4">
                  Once activated, PulseFollow handles everything automatically:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time tracking of opens, clicks, and replies
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-pause when lead replies, converts, or unsubscribes
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Notifications when leads engage or need your attention
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Performance analytics to optimize your sequences
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                  <div className="text-sm text-gray-600 mb-2">Preview: Active Sequences</div>
                  <div className="bg-white rounded p-4 text-xs space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-semibold text-gray-900">New Lead Warm-Up</div>
                        <div className="text-gray-600">127 leads enrolled</div>
                      </div>
                      <div className="text-green-600 font-semibold">Active</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold text-lg text-blue-600">43%</div>
                        <div className="text-gray-600">Open Rate</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-blue-600">12%</div>
                        <div className="text-gray-600">Click Rate</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-green-600">8</div>
                        <div className="text-gray-600">Converted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Results */}
      <div className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Real Agent Success Story
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                SM
              </div>
              <div>
                <p className="text-lg text-gray-800 italic mb-4">
                  "I was manually following up with leads in a spreadsheet. Half fell through
                  the cracks. With PulseFollow, my close rate went from 18% to 34% in 60 days.
                  It's like having a full-time marketing assistant for $49/month."
                </p>
                <div className="font-semibold text-gray-900">Sarah Martinez</div>
                <div className="text-sm text-gray-600">Independent Life Agent, FL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          PulseFollow Pricing
        </h2>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Starter<br />
                  <span className="text-2xl text-blue-600">$49</span>
                  <span className="text-gray-600 text-xs">/mo</span>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                  Pro<br />
                  <span className="text-2xl text-blue-600">$99</span>
                  <span className="text-gray-600 text-xs">/mo</span>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Elite<br />
                  <span className="text-2xl text-blue-600">$199</span>
                  <span className="text-gray-600 text-xs">/mo</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Email sequences</td>
                <td className="px-6 py-4 text-center text-sm">5 sequences</td>
                <td className="px-6 py-4 text-center text-sm bg-blue-50 font-semibold">
                  Unlimited
                </td>
                <td className="px-6 py-4 text-center text-sm font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">SMS sequences</td>
                <td className="px-6 py-4 text-center text-sm text-gray-400">—</td>
                <td className="px-6 py-4 text-center text-sm bg-blue-50">
                  <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Life event triggers</td>
                <td className="px-6 py-4 text-center text-sm text-gray-400">—</td>
                <td className="px-6 py-4 text-center text-sm bg-blue-50">
                  <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Custom branding</td>
                <td className="px-6 py-4 text-center text-sm">Basic</td>
                <td className="px-6 py-4 text-center text-sm bg-blue-50">Full</td>
                <td className="px-6 py-4 text-center text-sm">White-label</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Leads supported</td>
                <td className="px-6 py-4 text-center text-sm">500</td>
                <td className="px-6 py-4 text-center text-sm bg-blue-50">2,500</td>
                <td className="px-6 py-4 text-center text-sm">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-sm text-gray-600 mb-8">
          All tiers include other AgentPulse modules at varying feature levels.
          <br />
          <Link href="/dashboard/agentpulse" className="text-blue-600 hover:underline">
            See full pricing comparison →
          </Link>
        </p>
      </div>

      {/* Sell & Earn */}
      <div className="bg-gradient-to-br from-gray-900 to-[#2B4C7E] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sell PulseFollow & Earn</h2>
          <p className="text-lg text-white mb-8">
            Every AgentPulse subscription you sell flows through your 5x7 matrix with full
            overrides. Use it for your business AND earn monthly residuals.
          </p>
          <Link
            href="/dashboard/agentpulse#commission"
            className="inline-block px-6 py-3 bg-white text-[#2B4C7E] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Learn About Commissions
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Get Early Access
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Join the waitlist and get 50% off your first month when PulseFollow launches.
        </p>
        <WaitlistForm />
      </div>
    </div>
  );
}
