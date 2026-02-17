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
    <div className="max-w-2xl mx-auto text-center w-full">
      {/* Celebration Icon */}
      <div className="mb-6 sm:mb-8 animate-bounce">
        <div className="text-6xl sm:text-8xl">🎉</div>
      </div>

      {/* Welcome Message */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
        Welcome to Apex Affinity Group, {distributor.first_name}!
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 px-2">
        You've just joined the premier insurance marketing organization. Let's get your account
        set up so you can start building your business right away.
      </p>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-4xl mb-3">🌐</div>
          <h3 className="text-white font-semibold mb-2">Your Website</h3>
          <p className="text-white/70 text-sm">
            Get your personalized replicated website to share with prospects
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-white font-semibold mb-2">Build Your Team</h3>
          <p className="text-white/70 text-sm">
            Grow your network and earn from your team's success
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-white font-semibold mb-2">Unlimited Earnings</h3>
          <p className="text-white/70 text-sm">
            Multiple income streams through commissions and team bonuses
          </p>
        </div>
      </div>

      {/* Time Estimate */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8 inline-block">
        <p className="text-white/70 text-sm">
          ⏱️ This setup takes about <span className="font-semibold text-white">3 minutes</span>
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-xl"
      >
        Let's Get Started →
      </button>
    </div>
  );
}
