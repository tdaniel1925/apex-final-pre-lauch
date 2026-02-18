// =============================================
// WarmLine Teaser Page
// AI Voice Agent module preview
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';

export const metadata = {
  title: 'WarmLine - AI Voice Agent | AgentPulse',
  description: 'AI makes 50 calls while you have coffee. You only talk to hot leads.',
};

export default async function WarmLinePage() {
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

      <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">📞</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">WarmLine — AI Voice Agent</h1>
          <p className="text-xl md:text-2xl text-pink-100 mb-4">
            Your AI assistant makes 50 calls while you have coffee.
          </p>
          <p className="text-lg text-pink-200 mb-8">
            You only talk to the hot leads.
          </p>
          <div className="mb-8">
            <p className="text-sm text-pink-200 mb-4">Coming in:</p>
            <CountdownTimer targetDate={launchDate} size="md" />
          </div>
          <div className="inline-block px-4 py-2 bg-pink-500 border-2 border-white rounded-lg font-semibold">
            Elite Tier Only — $199/mo
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">You Can't Call 50 Leads a Day.</h2>
          <h3 className="text-3xl font-bold text-pink-700">WarmLine Can.</h3>
        </div>

        <div className="space-y-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-3">The Problem:</h3>
            <p className="text-gray-700">
              You sent 40 quotes last week. Only 6 people responded. What about the other 34?
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <h3 className="font-bold text-gray-900 mb-3">Option A: You could manually call each one...</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Takes 3-5 hours of your time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>20-30 will go to voicemail</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>You spend your day leaving messages instead of closing deals</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-500">
            <h3 className="font-bold text-gray-900 mb-3">Option B: WarmLine does it in 1 hour while you focus on closing.</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Calls all 34 in under an hour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Identifies the 3-5 who are actually interested</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Books them on your calendar automatically</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div id="preview" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How WarmLine Works</h2>
          <p className="text-center text-gray-600 mb-12">Powered by VAPI AI voice technology — sounds natural, not robotic</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border-2 border-pink-200 text-center">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">Select Leads</h3>
              <p className="text-sm text-gray-700">"Quote sent, no response" → 34 leads</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border-2 border-pink-200 text-center">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">Choose Script</h3>
              <p className="text-sm text-gray-700">"Quote Follow-Up" template</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border-2 border-pink-200 text-center">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="font-bold text-gray-900 mb-2">Start Calling</h3>
              <p className="text-sm text-gray-700">WarmLine calls all 34 over the next hour</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-500 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-bold text-gray-900 mb-2">Review Results</h3>
              <p className="text-sm text-gray-700">3 interested → Auto-booked on your calendar</p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
            <h3 className="font-bold text-gray-900 mb-4">📞 Example AI Conversation:</h3>
            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 italic">
                    "Hi Sarah, this is Alex calling from Smith Insurance. I'm following up on the auto insurance quote we sent over last Thursday. Did you have a chance to review it?"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    "Oh yes, I did. I'm actually interested in bundling it with my home insurance. Can we talk more about that?"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 italic">
                    "Absolutely! That's a great way to save money. I'll have [Agent Name] give you a call to put together a bundle quote. What day works best for you this week?"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    "Thursday afternoon would be perfect."
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-green-800">
                  ✅ Result: Interested — Callback booked for Thursday 2pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Call Scripts Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-2">📋 Quote Follow-Up</h3>
              <p className="text-sm text-gray-700">Checks in on leads who received quotes but haven't responded</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-2">🔔 Renewal Reminder</h3>
              <p className="text-sm text-gray-700">Calls clients with upcoming policy expirations</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-2">💬 Policy Check-In</h3>
              <p className="text-sm text-gray-700">Follows up with recent clients to ensure satisfaction</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-2">✍️ Custom Scripts</h3>
              <p className="text-sm text-gray-700">Write your own scripts with your exact wording</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Every Call Includes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Full Transcript</h3>
            <p className="text-sm text-gray-700">Word-for-word record of the conversation</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-gray-900 mb-2">AI Summary</h3>
            <p className="text-sm text-gray-700">"Lead expressed interest in bundling auto + home"</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">💚</div>
            <h3 className="font-bold text-gray-900 mb-2">Sentiment Analysis</h3>
            <p className="text-sm text-gray-700">Detects interest level automatically</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 mb-2">Auto-Booking</h3>
            <p className="text-sm text-gray-700">Puts callbacks directly on your calendar</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Real Results</h2>
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-pink-600">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              DC
            </div>
            <div>
              <p className="text-lg text-gray-800 italic mb-4">
                "I used to dread calling 30 leads who ghosted me. WarmLine does it for me. Last month it booked 8 callbacks — I closed 5 of them. $9,800 in premium from an AI assistant. This is insane."
              </p>
              <div className="font-semibold text-gray-900">David Chen</div>
              <div className="text-sm text-gray-600">Independent Agent, NY</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pricing" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">WarmLine Pricing</h2>
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white rounded-lg p-8 text-center">
            <div className="inline-block px-4 py-2 bg-white text-pink-600 font-bold rounded-lg mb-4">
              ELITE TIER EXCLUSIVE
            </div>
            <h3 className="text-4xl font-bold mb-2">$199/month</h3>
            <p className="text-pink-100 mb-6">Includes all other AgentPulse modules</p>
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold mb-2">120 minutes</div>
              <p className="text-pink-100">of AI calling per month included</p>
              <p className="text-sm text-pink-200 mt-2">~60-80 calls depending on length</p>
            </div>
            <p className="text-sm text-pink-200">Additional minutes: $0.50/min</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-pink-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Elite Access to WarmLine</h2>
          <p className="text-lg text-pink-100 mb-8">
            Join the waitlist and get 50% off your first month of Elite tier.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
