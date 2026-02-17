'use client';

// =============================================
// Onboarding Step 1: Welcome
// =============================================

import type { Distributor } from '@/lib/types';

interface Step1Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep1Welcome({ distributor, onNext }: Step1Props) {
  return (
    <div className="max-w-4xl mx-auto text-center w-full">
      {/* Welcome Message */}
      <h1 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-3">
        Welcome to Apex Affinity Group, {distributor.first_name}!
      </h1>

      <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
        You've just joined the premier insurance marketing organization. Let's get your account
        set up so you can start building your business right away.
      </p>

      {/* Key Benefits - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-[#2B4E7E]/5 to-[#DC2626]/5 border border-[#2B4E7E]/20 rounded-lg p-4">
          <div className="text-3xl mb-2">🌐</div>
          <h3 className="text-[#2B4E7E] font-semibold text-sm mb-1">Your Website</h3>
          <p className="text-gray-600 text-xs">
            Personalized replicated website
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#2B4E7E]/5 to-[#DC2626]/5 border border-[#2B4E7E]/20 rounded-lg p-4">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-[#2B4E7E] font-semibold text-sm mb-1">Build Your Team</h3>
          <p className="text-gray-600 text-xs">
            Grow your network and earn
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#2B4E7E]/5 to-[#DC2626]/5 border border-[#2B4E7E]/20 rounded-lg p-4">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-[#2B4E7E] font-semibold text-sm mb-1">Unlimited Earnings</h3>
          <p className="text-gray-600 text-xs">
            Multiple income streams
          </p>
        </div>
      </div>

      {/* Time Estimate & CTA */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 inline-block">
          <p className="text-gray-700 text-sm">
            ⏱️ This setup takes about <span className="font-semibold text-[#2B4E7E]">3 minutes</span>
          </p>
        </div>

        {/* CTA Button - Apex Colors */}
        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#2B4E7E] text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-shadow"
        >
          Let's Get Started →
        </button>
      </div>
    </div>
  );
}
