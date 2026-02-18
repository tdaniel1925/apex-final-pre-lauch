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
              onClick={handleSkip}
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
    </div>
  );
}
