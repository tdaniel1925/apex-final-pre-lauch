'use client';

// =============================================
// Onboarding Modal - First-Time User Experience
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import OnboardingStep1Welcome from './OnboardingStep1Welcome';
import OnboardingStep2Photo from './OnboardingStep2Photo';
import OnboardingStep4Team from './OnboardingStep4Team';
import OnboardingStep5NextSteps from './OnboardingStep5NextSteps';

interface OnboardingModalProps {
  distributor: Distributor;
  onComplete: () => void;
}

export default function OnboardingModal({ distributor, onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(distributor.onboarding_step || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [distributorData, setDistributorData] = useState(distributor);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const totalSteps = 4;

  // Save progress to database
  const saveProgress = async (step: number, completed: boolean = false) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_step: step,
          onboarding_completed: completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setDistributorData(result.data);
      }
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress(nextStep);
    } else {
      // Complete onboarding
      await saveProgress(totalSteps, true);
      showCompletionAnimation();
      setTimeout(() => {
        onComplete();
        router.refresh();
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress(prevStep);
    }
  };

  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const handleSkipConfirm = async () => {
    setIsSaving(true);
    try {
      // Save current progress and permanent skip preference
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_step: currentStep,
          onboarding_permanently_skipped: dontShowAgain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save skip preference');
      }

      setShowSkipConfirm(false);
      onComplete();
      router.refresh();
    } catch (error) {
      console.error('Error saving skip preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipCancel = () => {
    setShowSkipConfirm(false);
    setDontShowAgain(false);
  };

  const showCompletionAnimation = () => {
    // Trigger confetti animation
    if (typeof window !== 'undefined') {
      // Simple confetti effect using CSS
      const confetti = document.createElement('div');
      confetti.className = 'confetti-container';
      confetti.innerHTML = '🎉'.repeat(50);
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const updateDistributor = (updates: Partial<Distributor>) => {
    setDistributorData({ ...distributorData, ...updates });
  };

  const renderStep = () => {
    const stepProps = {
      distributor: distributorData,
      onNext: handleNext,
      onBack: handleBack,
      updateDistributor,
    };

    switch (currentStep) {
      case 1:
        return <OnboardingStep1Welcome {...stepProps} />;
      case 2:
        return <OnboardingStep2Photo {...stepProps} />;
      case 3:
        return <OnboardingStep4Team {...stepProps} />;
      case 4:
        return <OnboardingStep5NextSteps {...stepProps} />;
      default:
        return <OnboardingStep1Welcome {...stepProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {/* Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
        <div
          className="h-full bg-[#2B4E7E] transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Header Bar - Fixed at top */}
      <div className="fixed top-1.5 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <img src="/apex-logo-full.png" alt="Apex Affinity Group" className="h-8 sm:h-10" />

          {/* Step Indicator & Skip */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-xs sm:text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={handleSkipClick}
              disabled={isSaving}
              className="text-gray-500 hover:text-[#2B4E7E] text-xs sm:text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable when needed */}
      <div className="h-full w-full pt-[72px] px-4 pb-4 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-4">
          {renderStep()}
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Skip Onboarding?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  You can always complete the onboarding later from your profile settings.
                </p>

                {/* Don't show again checkbox */}
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      Don&apos;t show this again
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      You won&apos;t see the onboarding wizard on future logins
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSkipCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipConfirm}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Skip Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
