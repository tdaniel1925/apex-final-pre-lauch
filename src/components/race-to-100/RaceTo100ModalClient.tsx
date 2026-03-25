'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RaceTo100Modal from './RaceTo100Modal';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Distributor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface JourneyProgress {
  id: string;
  distributor_id: string;
  current_step: number;
  total_points: number;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface JourneyStep {
  id: string;
  distributor_id: string;
  step_number: number;
  step_name: string;
  points_earned: number;
  completed_at: string | null;
  is_completed: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface RaceTo100ModalClientProps {
  distributor: Distributor;
  journeyProgress: JourneyProgress | null;
  journeySteps: JourneyStep[];
}

export default function RaceTo100ModalClient({
  distributor,
  journeyProgress,
  journeySteps,
}: RaceTo100ModalClientProps) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  return (
    <ErrorBoundary
      fallbackTitle="Race to 100 Error"
      fallbackMessage="Something went wrong with the Race to 100 feature. Please try again or return home."
      showHomeButton={true}
    >
      <RaceTo100Modal
        isOpen={isOpen}
        onClose={handleClose}
        distributor={distributor}
        journeyProgress={journeyProgress}
        journeySteps={journeySteps}
      />
    </ErrorBoundary>
  );
}
