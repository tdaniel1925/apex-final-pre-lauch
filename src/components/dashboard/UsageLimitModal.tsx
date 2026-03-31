'use client';

// =============================================
// Usage Limit Modal
// Shown when free tier user hits daily/monthly limits
// Prompts upgrade to Business Center
// =============================================

import { X, Sparkles, Phone, Zap } from 'lucide-react';
import Link from 'next/link';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'chatbot' | 'voice';
  current: number;
  limit: number;
}

export default function UsageLimitModal({
  isOpen,
  onClose,
  type,
  current,
  limit,
}: UsageLimitModalProps) {
  if (!isOpen) return null;

  const isChatbot = type === 'chatbot';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            {isChatbot ? (
              <Sparkles className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
            <h2 className="text-2xl font-bold">
              {isChatbot ? 'Daily Limit Reached' : 'Monthly Limit Reached'}
            </h2>
          </div>
          <p className="text-purple-100">
            You've used {current} of {limit} {isChatbot ? 'messages today' : 'voice minutes this month'}.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-700 mb-6">
            {isChatbot
              ? "You've reached your free tier limit of 20 AI chatbot messages per day."
              : "You've reached your free tier limit of 50 AI voice minutes per month."}
          </p>

          {/* Upgrade Benefits */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Upgrade to Business Center
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>
                  <strong>Unlimited AI Chatbot</strong> messages - ask as many questions as you need
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>
                  <strong>Unlimited AI Voice</strong> minutes - no monthly cap
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>
                  <strong>Daily AI Team Insights</strong> - strategic recommendations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>
                  <strong>Interactive Genealogy</strong> - visual team tree & analytics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>
                  <strong>Priority Support</strong> - faster response times
                </span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 mb-2">Only</p>
            <p className="text-4xl font-bold text-slate-900 mb-1">$39<span className="text-xl text-slate-600">/mo</span></p>
            <p className="text-sm text-slate-600">Includes $39 BV + $10 commission monthly</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Maybe Later
            </button>
            <Link
              href="/dashboard/business-center"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-center transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
