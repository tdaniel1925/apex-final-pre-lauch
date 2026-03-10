'use client';

// =============================================
// Dashboard Client Wrapper
// Handles onboarding modal display
// =============================================

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Distributor } from '@/lib/types';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

interface DashboardClientProps {
  distributor: Distributor;
  children: React.ReactNode;
}

export default function DashboardClient({ distributor, children }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show onboarding on admin pages
    const isAdminPage = pathname?.startsWith('/admin');

    // Show onboarding if:
    // 1. Not completed
    // 2. Not permanently skipped by user
    // 3. Not on admin page
    if (
      !distributor.onboarding_completed &&
      !distributor.onboarding_permanently_skipped &&
      !isAdminPage
    ) {
      setShowOnboarding(true);
    }
  }, [distributor.onboarding_completed, distributor.onboarding_permanently_skipped, pathname]);

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
