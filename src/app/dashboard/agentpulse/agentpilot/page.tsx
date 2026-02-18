// =============================================
// AgentPilot Teaser Page
// AI Daily Action List module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'AgentPilot - AI Daily Action List | AgentPulse',
  description: 'AI tells you who to call, when, and writes the perfect message',
};

export default async function AgentPilotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const launchDate = new Date('2025-02-28T00:00:00');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
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

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">AgentPilot — AI Daily Action List</h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8">
            Your AI assistant tells you who to call, when, and writes the perfect message for you.
          </p>
          <div className="mb-8">
            <p className="text-sm text-purple-200 mb-4">Coming in:</p>
            <CountdownTimer targetDate={launchDate} size="md" />
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="#preview" className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
              See How It Works
            </Link>
            <Link href="#pricing" className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition-colors border-2 border-white">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* The Problem */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem Every Agent Faces</h2>
          <p className="text-xl text-gray-700">
            You have 200 leads in your pipeline. Who do you call first?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <div className="text-3xl mb-3">😰</div>
            <h3 className="font-bold text-gray-900 mb-2">No System = Random Guessing</h3>
            <p className="text-sm text-gray-700">You call whoever comes to mind first, missing hot leads buried in your CRM</p>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="font-bold text-gray-900 mb-2">Spreadsheet Tracking = Time-Consuming</h3>
            <p className="text-sm text-gray-700">Manually sorting through leads takes 1+ hour every morning</p>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Generic Reminders = You Still Write Everything</h3>
            <p className="text-sm text-gray-700">Even with reminders, you have to craft every message from scratch</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">AgentPilot solves this in 3 seconds every morning.</h3>
          <p className="text-purple-100">AI analyzes your entire pipeline and gives you a perfect action plan.</p>
        </div>
      </div>

      {/* How It Works */}
      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How AgentPilot Works</h2>
          <p className="text-center text-gray-600 mb-12">Every morning at 8am, AgentPilot analyzes your pipeline and creates your to-do list</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="font-bold text-gray-900 mb-4">🔍 AgentPilot analyzes:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>All your leads & their conversation history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Upcoming renewals & policy expirations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Birthdays, anniversaries, and life events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Stale leads needing re-engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Cross-sell opportunities</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="font-bold text-gray-900 mb-4">✅ Then creates:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Prioritized action list by urgency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>AI-written message for each action</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Context-aware call scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>One-click send buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Performance tracking dashboard</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Example Daily List */}
          <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
            <div className="text-sm text-gray-600 mb-4">Preview: Your Daily Action List</div>
            <div className="bg-white rounded-lg p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Your To-Do List for Today — 12 Actions</h3>
                  <p className="text-sm text-gray-600">Powered by Claude AI • Updated every morning at 8am</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {/* High Priority Action */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mb-2">
                      🔴 HIGH PRIORITY
                    </span>
                    <h4 className="font-bold text-gray-900">1. Call John Martinez</h4>
                    <p className="text-sm text-gray-700">His auto policy expires in 14 days</p>
                  </div>
                </div>
                <div className="bg-white rounded p-3 mt-3 text-sm">
                  <div className="font-semibold text-gray-900 mb-2">📞 AI-Generated Call Script:</div>
                  <p className="text-gray-700 italic">
                    "Hi John, this is [your name] checking in on your auto policy. I noticed it expires on March 15th and wanted to make sure you're still covered. Do you have 5 minutes to review your renewal options?"
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                    📧 Send Email
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                    📱 Send SMS
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    ⏭️ Skip
                  </button>
                </div>
              </div>

              {/* Medium Priority Action */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded mb-2">
                      🟡 MEDIUM PRIORITY
                    </span>
                    <h4 className="font-bold text-gray-900">2. Email Susan Chen</h4>
                    <p className="text-sm text-gray-700">Her birthday is Thursday — perfect time to check in</p>
                  </div>
                </div>
                <div className="bg-white rounded p-3 mt-3 text-sm">
                  <div className="font-semibold text-gray-900 mb-2">📧 AI-Generated Email:</div>
                  <div className="text-xs text-gray-600 mb-1">Subject: Happy Birthday, Susan! 🎉</div>
                  <p className="text-gray-700">
                    Hi Susan,<br/><br/>
                    Happy birthday! I hope you have a wonderful day celebrating. While I have you in mind, I wanted to check in on your coverage...
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                    ✉️ One-Click Send
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    ✏️ Edit First
                  </button>
                </div>
              </div>

              {/* Low Priority Action */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded mb-2">
                    🔵 LOW PRIORITY
                  </span>
                  <h4 className="font-bold text-gray-900">3. Request Google review from David Kim</h4>
                  <p className="text-sm text-gray-700">He closed 30 days ago — perfect timing for a review request</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700">
                    ⭐ Send Review Request
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 pt-4">
                + 9 more actions • All with AI-written messages ready to send
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gradient-to-br from-purple-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">AI-Powered Prioritization</h3>
              <p className="text-sm text-gray-700">Claude AI ranks your actions by urgency, opportunity value, and likelihood to convert</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-bold text-gray-900 mb-2">Pre-Written Messages</h3>
              <p className="text-sm text-gray-700">Every action includes a ready-to-send email, SMS, or call script — contextual, not generic</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">One-Click Execution</h3>
              <p className="text-sm text-gray-700">Review → Click Send → Move to next. Knock out 15 follow-ups before your first coffee</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-bold text-gray-900 mb-2">Smart Context Awareness</h3>
              <p className="text-sm text-gray-700">AI knows lead history, policy details, past conversations, and life events</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Performance Tracking</h3>
              <p className="text-sm text-gray-700">See your daily completion rate and follow-up consistency over time</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="font-bold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-sm text-gray-700">Get alerted when urgent actions appear or leads engage with your messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Results */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Real Results</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-purple-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              MJ
            </div>
            <div>
              <p className="text-lg text-gray-800 italic mb-4">
                "AgentPilot gave me my mornings back. I used to spend an hour figuring out who to call. Now I knock out 15 follow-ups before my first coffee. My close rate went up 22% in 60 days."
              </p>
              <div className="font-semibold text-gray-900">Marcus Johnson</div>
              <div className="text-sm text-gray-600">Health Insurance Specialist, TX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">AgentPilot Pricing</h2>
          <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Free / Starter</h3>
                <p className="text-sm text-gray-600 mb-3">Basic rule-based reminders</p>
                <div className="text-3xl font-bold text-gray-400">Limited</div>
              </div>
              <div className="bg-purple-600 text-white rounded-lg p-6 -m-2">
                <div className="inline-block px-3 py-1 bg-white text-purple-600 text-xs font-bold rounded mb-2">
                  RECOMMENDED
                </div>
                <h3 className="font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">$99</div>
                <p className="text-sm text-purple-100 mb-4">per month</p>
                <p className="text-sm">Full AI-powered AgentPilot with Claude AI</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Elite</h3>
                <p className="text-sm text-gray-600 mb-3">Everything in Pro + priority</p>
                <div className="text-3xl font-bold text-gray-900">$199</div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            AgentPilot is included in Pro and Elite tiers along with all other modules.
            <br />
            <Link href="/dashboard/agentpulse" className="text-purple-600 hover:underline">
              See full pricing comparison →
            </Link>
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-gray-900 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Early Access to AgentPilot</h2>
          <p className="text-lg text-purple-100 mb-8">
            Join the waitlist and get 50% off your first month when it launches.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
