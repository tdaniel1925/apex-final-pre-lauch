'use client';

// =============================================
// Onboarding Modal - First-Time User Experience
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import OnboardingStep1Welcome from './OnboardingStep1Welcome';
import OnboardingStep2Profile from './OnboardingStep2Profile';
import OnboardingStep3Licensing from './OnboardingStep3Licensing';
import OnboardingStep4Website from './OnboardingStep4Website';
import OnboardingStep5Team from './OnboardingStep5Team';
import OnboardingStep6NextSteps from './OnboardingStep6NextSteps';

interface OnboardingModalProps {
  distributor: Distributor;
  onComplete: () => void;
}

export default function OnboardingModal({ distributor, onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(distributor.onboarding_step || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [distributorData, setDistributorData] = useState(distributor);

  const totalSteps = 6;

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

  const handleSkip = async () => {
    await saveProgress(currentStep);
    onComplete();
    router.refresh();
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
        return <OnboardingStep2Profile {...stepProps} />;
      case 3:
        return <OnboardingStep3Licensing {...stepProps} />;
      case 4:
        return <OnboardingStep4Website {...stepProps} />;
      case 5:
        return <OnboardingStep5Team {...stepProps} />;
      case 6:
        return <OnboardingStep6NextSteps {...stepProps} />;
      default:
        return <OnboardingStep1Welcome {...stepProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#2B4C7E] via-[#1a2c4e] to-gray-900">
      {/* Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Header Bar - Fixed at top */}
      <div className="fixed top-2 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Step Indicator */}
        <div className="text-white/70 text-xs sm:text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          disabled={isSaving}
          className="text-white/70 hover:text-white text-xs sm:text-sm font-medium transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="h-full w-full overflow-y-auto pt-16 pb-8 px-4">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
