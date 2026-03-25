'use client';

import { useState } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProgressTracker from './ProgressTracker';
import StepChecklist from './StepChecklist';
import CoachChat from './CoachChat';

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

interface RaceTo100ClientProps {
  distributor: Distributor;
  journeyProgress: JourneyProgress | null;
  journeySteps: JourneyStep[];
}

export default function RaceTo100Client({
  distributor,
  journeyProgress: initialProgress,
  journeySteps: initialSteps,
}: RaceTo100ClientProps) {
  const [journeyProgress, setJourneyProgress] = useState(initialProgress);
  const [journeySteps, setJourneySteps] = useState(initialSteps);

  // Refresh progress from server
  const refreshProgress = async () => {
    try {
      const response = await fetch(`/api/journey/progress?distributorId=${distributor.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.progress) {
          setJourneyProgress(data.progress);

          // Fetch updated steps
          const stepsResponse = await fetch(`/api/journey/steps?distributorId=${distributor.id}`, {
            credentials: 'include',
          });

          if (stepsResponse.ok) {
            const stepsData = await stepsResponse.json();
            if (stepsData.success && stepsData.steps) {
              setJourneySteps(stepsData.steps);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  };

  const handleStepComplete = async () => {
    await refreshProgress();
  };

  const totalPoints = journeyProgress?.total_points || 0;
  const currentStep = journeyProgress?.current_step || 1;
  const isCompleted = journeyProgress?.is_completed || false;

  return (
    <div className="flex flex-col h-screen min-h-[600px] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className="text-xs text-slate-600 hover:text-slate-900 no-underline"
          >
            <ArrowLeft className="inline w-3 h-3 mr-1" />
            back to dashboard
          </Link>
          <div className="flex items-center gap-2 text-xl font-medium text-slate-900">
            <Trophy className="w-[18px] h-[18px]" />
            Race to 100
          </div>
        </div>
        <div className="text-right">
          <div className="text-[32px] font-medium text-slate-900 leading-none">
            {totalPoints}/100
          </div>
          <div className="text-xs text-slate-600 mt-0.5">points</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 py-4 border-b border-slate-200 flex-shrink-0">
        <ProgressTracker
          totalPoints={totalPoints}
          currentStep={currentStep}
          isCompleted={isCompleted}
        />
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[260px] min-w-[260px] border-r border-slate-200 flex flex-col overflow-hidden bg-white">
          <StepChecklist
            steps={journeySteps}
            currentStep={currentStep}
          />
        </div>

        {/* Chat Panel - Takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CoachChat
            distributorId={distributor.id}
            distributorName={distributor.first_name}
            journeyProgress={journeyProgress}
            journeySteps={journeySteps}
            onStepComplete={handleStepComplete}
          />
        </div>
      </div>
    </div>
  );
}
