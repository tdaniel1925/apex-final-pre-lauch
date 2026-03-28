'use client';

import Image from 'next/image';

interface ProgressTrackerProps {
  totalPoints: number;
  currentStep: number;
  isCompleted: boolean;
}

export default function ProgressTracker({ totalPoints, currentStep, isCompleted }: ProgressTrackerProps) {
  const percentage = totalPoints;
  const runnerPosition = `${Math.min(percentage, 95)}%`;

  // Determine runner size/animation based on progress
  const getRunnerSize = () => {
    if (percentage < 25) return 18; // Walking
    if (percentage < 50) return 20; // Jogging
    if (percentage < 75) return 22; // Running
    return 24; // Sprinting
  };

  // Motivational message
  const getMessage = () => {
    if (isCompleted) return '🏆 Journey Complete!';
    if (percentage < 25) return "Let's get started!";
    if (percentage < 50) return "You're building momentum!";
    if (percentage < 75) return "Halfway there!";
    return "Almost at the finish line!";
  };

  return (
    <div>
      {/* Milestone Row */}
      <div className="flex justify-between mb-1.5 px-0.5">
        <span className="text-[11px] text-slate-500">0</span>
        <span className="text-[11px] text-slate-500">25</span>
        <span className="text-[11px] text-slate-500">50</span>
        <span className="text-[11px] text-slate-500">75</span>
        <span className="text-[11px] text-slate-500">100</span>
      </div>

      {/* Progress Track */}
      <div className="relative h-7 bg-slate-100 rounded-[14px] border border-slate-200">
        {/* Progress Fill */}
        <div
          className="h-full rounded-[14px] bg-gradient-to-r from-[#2B4C7E] to-[#1e3a5f] transition-all duration-[800ms] ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Milestone Ticks */}
        <div className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none" style={{ left: '25%' }} />
        <div className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none" style={{ left: '50%' }} />
        <div className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none" style={{ left: '75%' }} />

        {/* Runner - PNG Image */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-[800ms] ease-out pointer-events-none"
          style={{ left: runnerPosition }}
        >
          <Image
            src="/running-man.png"
            alt="Running man"
            width={getRunnerSize()}
            height={getRunnerSize()}
            className="drop-shadow-md"
          />
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-2 text-center text-[13px] font-medium text-slate-600">
        {getMessage()}
      </div>
    </div>
  );
}
