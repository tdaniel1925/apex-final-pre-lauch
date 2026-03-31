// =============================================
// Usage Stats Component
// Displays current usage vs limits for free tier users
// =============================================

'use client';

import { MessageSquare, Phone } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface UsageStatsProps {
  chatbotUsedToday: number;
  chatbotLimitDaily: number;
  voiceUsedMonth: number;
  voiceLimitMonth: number;
}

export default function UsageStats({
  chatbotUsedToday,
  chatbotLimitDaily,
  voiceUsedMonth,
  voiceLimitMonth,
}: UsageStatsProps) {
  const chatbotAtLimit = chatbotUsedToday >= chatbotLimitDaily;
  const voiceAtLimit = voiceUsedMonth >= voiceLimitMonth;
  const anyLimitReached = chatbotAtLimit || voiceAtLimit;

  return (
    <section className="max-w-6xl mx-auto py-12 px-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-slate-900">
        Your Current Usage
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* AI Chatbot Usage */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">AI Chatbot Messages</h3>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 text-slate-700">
              <span>
                Today: {chatbotUsedToday} / {chatbotLimitDaily}
              </span>
              <span
                className={
                  chatbotAtLimit ? 'text-red-600 font-semibold' : 'text-slate-600'
                }
              >
                {chatbotAtLimit
                  ? 'LIMIT REACHED'
                  : `${chatbotLimitDaily - chatbotUsedToday} remaining`}
              </span>
            </div>
            <ProgressBar
              value={chatbotUsedToday}
              max={chatbotLimitDaily}
              color={chatbotAtLimit ? 'red' : 'blue'}
            />
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Free tier: 20 messages per day • Resets at midnight Central
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Unlimited Plan: ∞ Messages
            </p>
            <p className="text-xs text-blue-700">
              Never worry about limits again
            </p>
          </div>
        </div>

        {/* AI Voice Usage */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              AI Voice Agent Minutes
            </h3>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 text-slate-700">
              <span>
                This Month: {voiceUsedMonth} / {voiceLimitMonth}
              </span>
              <span
                className={
                  voiceAtLimit ? 'text-red-600 font-semibold' : 'text-slate-600'
                }
              >
                {voiceAtLimit
                  ? 'LIMIT REACHED'
                  : `${voiceLimitMonth - voiceUsedMonth} remaining`}
              </span>
            </div>
            <ProgressBar
              value={voiceUsedMonth}
              max={voiceLimitMonth}
              color={voiceAtLimit ? 'red' : 'blue'}
            />
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Free tier: 50 minutes per month • Resets 1st of month
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Unlimited Plan: ∞ Minutes
            </p>
            <p className="text-xs text-blue-700">
              Practice calls as much as you need
            </p>
          </div>
        </div>
      </div>

      {/* Limit Reached Alert */}
      {anyLimitReached && (
        <div className="mt-8 bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-red-900 mb-2">
            You've Hit Your Limit!
          </h3>
          <p className="text-red-700 mb-4">
            Upgrade now to continue using the AI tools and close more sales.
          </p>
          <a
            href="/dashboard/store"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Upgrade Now - $39/month
          </a>
        </div>
      )}
    </section>
  );
}
