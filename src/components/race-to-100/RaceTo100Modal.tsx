'use client';

import { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import StepChecklist from './StepChecklist';
import CoachChat from './CoachChat';
import RaceToolsAccordion from './RaceToolsAccordion';
import type { RaceTopic } from '@/lib/race-to-100/tools-reference';

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

interface RaceTo100ModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: Distributor;
  journeyProgress: JourneyProgress | null;
  journeySteps: JourneyStep[];
}

export default function RaceTo100Modal({
  isOpen,
  onClose,
  distributor,
  journeyProgress: initialProgress,
  journeySteps: initialSteps,
}: RaceTo100ModalProps) {
  const [journeyProgress, setJourneyProgress] = useState(initialProgress);
  const [journeySteps, setJourneySteps] = useState(initialSteps);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

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

  const handleTopicClick = (topic: RaceTopic) => {
    setPendingMessage(topic.prompt);
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPoints = journeyProgress?.total_points || 0;
  const currentStep = journeyProgress?.current_step || 1;
  const isCompleted = journeyProgress?.is_completed || false;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-7xl h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Race to 100</h2>
                <p className="text-xs text-slate-600">Your journey to your first sale</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 leading-none">
                  {totalPoints}/100
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">points</div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
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

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <CoachChat
                distributorId={distributor.id}
                distributorName={distributor.first_name}
                journeyProgress={journeyProgress}
                journeySteps={journeySteps}
                onStepComplete={handleStepComplete}
                pendingMessage={pendingMessage}
                onMessageSent={() => setPendingMessage(null)}
              />
            </div>

            {/* Help Topics Accordion (Right) */}
            <RaceToolsAccordion onTopicClick={handleTopicClick} />
          </div>
        </div>
      </div>
    </>
  );
}
