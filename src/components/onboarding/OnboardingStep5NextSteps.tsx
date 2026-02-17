'use client';

// =============================================
// Onboarding Step 5: Next Steps & Completion
// =============================================

import type { Distributor } from '@/lib/types';

interface Step5Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep5NextSteps({ distributor, onNext, onBack }: Step5Props) {
  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4 px-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-2">You're All Set!</h2>
        <p className="text-gray-700 text-base sm:text-lg">
          Ready to start building your business
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Success Message */}
        <div className="bg-[#2B4E7E] text-white rounded-lg p-4 mb-4">
          <h3 className="text-lg font-bold mb-1">
            🎉 Welcome to the Team, {distributor.first_name}!
          </h3>
          <p className="text-sm text-white/90">
            Your account is ready. Let's make this journey amazing!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            📋 Get Started:
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-lg">1️⃣</span>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Share Your Website</h4>
                <p className="text-xs text-blue-800">
                  Post your link on social media to start generating leads
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-lg">2️⃣</span>
              <div>
                <h4 className="font-semibold text-green-900 text-sm">Invite 3 People</h4>
                <p className="text-xs text-green-800">
                  Reach out to friends who might be interested
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-lg">3️⃣</span>
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">Explore Your Dashboard</h4>
                <p className="text-xs text-purple-800">
                  Familiarize yourself with the tools and features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">🔗 Quick Links:</h4>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/dashboard/profile"
              className="text-xs text-[#2B4E7E] hover:underline"
            >
              → Profile
            </a>
            <a
              href="/dashboard/team"
              className="text-xs text-[#2B4E7E] hover:underline"
            >
              → My Team
            </a>
            <a
              href="/dashboard/matrix"
              className="text-xs text-[#2B4E7E] hover:underline"
            >
              → Matrix
            </a>
            <a
              href="/dashboard/settings"
              className="text-xs text-[#2B4E7E] hover:underline"
            >
              → Settings
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Go to Dashboard! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
