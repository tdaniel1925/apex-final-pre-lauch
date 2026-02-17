'use client';

// =============================================
// Dashboard Client Wrapper
// Handles onboarding modal display
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

interface DashboardClientProps {
  distributor: Distributor;
  children: React.ReactNode;
}

export default function DashboardClient({ distributor, children }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if not completed
    if (!distributor.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [distributor.onboarding_completed]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingModal distributor={distributor} onComplete={handleOnboardingComplete} />
      )}
      {children}
    </>
  );
}
