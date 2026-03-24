'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Trophy, Zap } from 'lucide-react';

interface RaceTo100BannerProps {
  distributorId: string;
}

interface JourneyProgress {
  totalPoints: number;
  currentStep: number;
  nextStepName: string;
  isCompleted: boolean;
}

export default function RaceTo100Banner({ distributorId }: RaceTo100BannerProps) {
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    // Refresh every 30 seconds
    const interval = setInterval(fetchProgress, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/journey/progress?distributorId=${distributorId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Journey progress fetch failed:', res.status, res.statusText);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setProgress(data.progress);
      } else {
        console.error('Journey progress error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch journey progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if loading, no progress, or already completed
  if (loading || !progress || progress.isCompleted) {
    return null;
  }

  const percentage = progress.totalPoints;
  const runnerPosition = `${Math.min(percentage, 95)}%`; // Cap at 95% for visual

  // Determine runner emoji based on progress
  const getRunnerEmoji = () => {
    if (percentage < 25) return '🚶‍♂️';
    if (percentage < 50) return '🏃‍♂️';
    if (percentage < 75) return '🏃‍♂️💨';
    return '🏃‍♂️⚡';
  };

  // Determine gradient colors based on progress
  const getGradient = () => {
    if (percentage < 25) return 'from-blue-600 via-indigo-600 to-purple-600';
    if (percentage < 50) return 'from-purple-600 via-pink-600 to-blue-600';
    if (percentage < 75) return 'from-orange-500 via-red-500 to-pink-500';
    return 'from-green-500 via-emerald-500 to-teal-500';
  };

  const handleClick = () => {
    // Navigate to Race to 100 page
    window.location.href = '/dashboard/race-to-100';
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-gradient-to-r ${getGradient()} rounded-lg p-6 mb-6 shadow-xl cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-2xl overflow-hidden`}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 right-12 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="absolute top-12 right-32 animate-pulse delay-100">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <div className="absolute top-8 right-64 animate-pulse delay-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white leading-tight flex items-center gap-2">
                🏁 Your Race to 100
                {percentage >= 75 && <Zap className="w-6 h-6 animate-pulse" />}
              </h3>
              <p className="text-white/90 text-sm font-medium">
                Next: {progress.nextStepName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white drop-shadow-lg">
              {progress.totalPoints}
              <span className="text-2xl text-white/80">/100</span>
            </div>
            <div className="text-white/90 text-sm font-medium">points</div>
          </div>
        </div>

        {/* Animated Progress Track */}
        <div className="relative w-full h-20 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/20 shadow-inner">
          {/* Progress Fill with Gradient */}
          <div
            className="absolute h-full bg-gradient-to-r from-white/40 to-white/60 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          {/* Milestone Markers */}
          <div className="absolute top-0 left-1/4 h-full w-1 bg-white/30" />
          <div className="absolute top-0 left-2/4 h-full w-1 bg-white/30" />
          <div className="absolute top-0 left-3/4 h-full w-1 bg-white/30" />

          {/* Milestone Labels */}
          <div className="absolute top-1 left-1/4 -translate-x-1/2">
            <div className="text-[10px] font-bold text-white/70">25</div>
          </div>
          <div className="absolute top-1 left-2/4 -translate-x-1/2">
            <div className="text-[10px] font-bold text-white/70">50</div>
          </div>
          <div className="absolute top-1 left-3/4 -translate-x-1/2">
            <div className="text-[10px] font-bold text-white/70">75</div>
          </div>

          {/* Animated Runner */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-20"
            style={{ left: runnerPosition }}
          >
            <div className="relative">
              <div className="text-4xl animate-bounce drop-shadow-lg">
                {getRunnerEmoji()}
              </div>
              {/* Dust trail effect */}
              {percentage > 0 && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-60">
                  <div className="text-xl">💨</div>
                </div>
              )}
            </div>
          </div>

          {/* Finish Line */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl">
            🏁
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-4 text-center">
          <p className="text-white font-semibold text-lg">
            {percentage < 25 && "🎯 Great start! Keep going!"}
            {percentage >= 25 && percentage < 50 && "🔥 You're building momentum!"}
            {percentage >= 50 && percentage < 75 && "⚡ Halfway there! Don't stop now!"}
            {percentage >= 75 && "🚀 Almost at the finish line! You've got this!"}
          </p>
          <p className="text-white/80 text-sm mt-1">
            Click here to continue your journey with your AI coach →
          </p>
        </div>
      </div>

      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse-slow" />
    </div>
  );
}
