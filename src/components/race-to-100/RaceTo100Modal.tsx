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
  const [showStepsSidebar, setShowStepsSidebar] = useState(false);
  const [showToolsSidebar, setShowToolsSidebar] = useState(false);

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
    setShowToolsSidebar(false); // Close sidebar on mobile after selection
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
      <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
        <div
          className="w-full max-w-7xl h-full md:h-[95vh] bg-white md:rounded-lg shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Race to 100</h2>
                <p className="text-[10px] sm:text-xs text-slate-600 truncate hidden sm:block">Your journey to your first sale</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
                  {totalPoints}/100
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5">points</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex-shrink-0">
            <ProgressTracker
              totalPoints={totalPoints}
              currentStep={currentStep}
              isCompleted={isCompleted}
            />
          </div>

          {/* Mobile Toggle Buttons */}
          <div className="flex lg:hidden border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              onClick={() => {
                setShowStepsSidebar(!showStepsSidebar);
                setShowToolsSidebar(false);
              }}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                showStepsSidebar
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              Steps ({journeySteps.filter(s => s.is_completed).length}/{journeySteps.length})
            </button>
            <button
              onClick={() => {
                setShowToolsSidebar(!showToolsSidebar);
                setShowStepsSidebar(false);
              }}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                showToolsSidebar
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              Tools & Help
            </button>
          </div>

          {/* Main Body */}
          <div className="flex flex-1 overflow-hidden relative min-h-0">
            {/* Left Sidebar - Steps (Desktop always visible, Mobile conditional) */}
            <div
              className={`
                absolute lg:relative inset-y-0 left-0 z-30
                w-[280px] sm:w-[300px] lg:w-[260px] lg:min-w-[260px]
                border-r border-slate-200 flex flex-col overflow-hidden bg-white
                transform transition-transform duration-300 ease-in-out
                ${showStepsSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              <StepChecklist
                steps={journeySteps}
                currentStep={currentStep}
              />
            </div>

            {/* Chat Panel - Always visible, adjusts for sidebars */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
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

            {/* Right Sidebar - Tools (Desktop always visible, Mobile conditional) */}
            <div
              className={`
                absolute lg:relative inset-y-0 right-0 z-30
                w-[280px] sm:w-[300px] lg:w-auto
                border-l border-slate-200 bg-white
                transform transition-transform duration-300 ease-in-out
                ${showToolsSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              `}
            >
              <RaceToolsAccordion onTopicClick={handleTopicClick} />
            </div>

            {/* Mobile Overlay for sidebars */}
            {(showStepsSidebar || showToolsSidebar) && (
              <div
                className="lg:hidden absolute inset-0 bg-black/30 z-20"
                onClick={() => {
                  setShowStepsSidebar(false);
                  setShowToolsSidebar(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
