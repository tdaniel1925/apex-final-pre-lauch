// =============================================
// Race to 100 Card Component
// Compact progress card with meter
// =============================================

'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface RaceTo100CardProps {
  distributorId: string;
}

interface JourneyProgress {
  totalPoints: number;
  currentStep: number;
  nextStepName: string;
  isCompleted: boolean;
}

export default function RaceTo100Card({ distributorId }: RaceTo100CardProps) {
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/journey/progress?distributorId=${distributorId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress || progress.isCompleted) {
    return null;
  }

  const percentage = progress.totalPoints;
  const runnerPosition = `${Math.min(percentage, 95)}%`;

  const getRunnerEmoji = () => {
    if (percentage < 25) return '🚶‍♂️';
    if (percentage < 50) return '🏃‍♂️';
    if (percentage < 75) return '🏃‍♂️💨';
    return '🏃‍♂️⚡';
  };

  const getGradient = () => {
    if (percentage < 25) return 'from-blue-600 to-indigo-600';
    if (percentage < 50) return 'from-purple-600 to-pink-600';
    if (percentage < 75) return 'from-orange-500 to-red-500';
    return 'from-green-500 to-emerald-500';
  };

  const handleClick = () => {
    window.location.href = '/dashboard/race-to-100';
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gradient-to-br ${getGradient()} rounded-lg shadow-md p-6 h-48 flex flex-col cursor-pointer transform transition-all hover:scale-105`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-white" />
          <h3 className="text-sm font-bold text-white">Race to 100</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {progress.totalPoints}
            <span className="text-sm text-white/80">/100</span>
          </div>
        </div>
      </div>

      {/* Progress Meter */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative w-full h-12 bg-white/10 rounded-full overflow-hidden border border-white/20 mb-2">
          {/* Progress Fill */}
          <div
            className="absolute h-full bg-white/40 transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />

          {/* Milestone Markers */}
          <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/30" />
          <div className="absolute top-0 left-2/4 h-full w-0.5 bg-white/30" />
          <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/30" />

          {/* Runner */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 z-20"
            style={{ left: runnerPosition }}
          >
            <div className="text-xl">
              {getRunnerEmoji()}
            </div>
          </div>

          {/* Finish Line */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-lg">
            🏁
          </div>
        </div>

        {/* Next Step */}
        <p className="text-xs text-white/90 text-center truncate">
          Next: {progress.nextStepName}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto text-center">
        <p className="text-xs text-white/80">
          Click to continue with AI coach →
        </p>
      </div>
    </div>
  );
}
