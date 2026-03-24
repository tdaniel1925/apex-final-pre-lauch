'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone, Video, User, MessageCircle, Users,
  Calendar, Share2, CheckCircle, Clock, Trophy,
  ChevronRight, Zap
} from 'lucide-react';

interface Distributor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Progress {
  steps_completed: number[];
  started_at?: string;
}

interface First48HoursClientProps {
  distributor: Distributor;
  progress: Progress;
  isWithin48Hours: boolean;
  hoursRemaining: number;
}

interface Step {
  id: number;
  title: string;
  description: string;
  timeEstimate: string;
  icon: any;
  actionText: string;
  actionUrl?: string;
  externalLink?: boolean;
  points: number;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Call Your AI Agent',
    description: 'Experience the power of your AI phone agent firsthand. Call it and see how it handles conversations!',
    timeEstimate: '5 min',
    icon: Phone,
    actionText: 'Get Phone Number',
    actionUrl: '/dashboard/home',
    points: 5,
  },
  {
    id: 2,
    title: 'Watch Welcome Video',
    description: 'Get the big picture of how Apex works and what makes our system unique.',
    timeEstimate: '15 min',
    icon: Video,
    actionText: 'Watch Now',
    actionUrl: '/dashboard/training',
    points: 10,
  },
  {
    id: 3,
    title: 'Complete Your Profile',
    description: 'Add your photo, bio, and contact info so your team can connect with you.',
    timeEstimate: '10 min',
    icon: User,
    actionText: 'Update Profile',
    actionUrl: '/dashboard/profile',
    points: 5,
  },
  {
    id: 4,
    title: 'Text 5 People',
    description: 'Send a quick text to 5 people: "Just joined something amazing, can I tell you about it?"',
    timeEstimate: '30 min',
    icon: MessageCircle,
    actionText: 'View Script',
    points: 15,
  },
  {
    id: 5,
    title: 'Join Team Chat',
    description: 'Connect with your sponsor and team members. Get support and ask questions!',
    timeEstimate: '5 min',
    icon: Users,
    actionText: 'Join Chat',
    externalLink: true,
    points: 5,
  },
  {
    id: 6,
    title: 'Book Sponsor Call',
    description: 'Schedule a 1-on-1 with your sponsor to create your personalized action plan.',
    timeEstimate: '5 min',
    icon: Calendar,
    actionText: 'Schedule Call',
    points: 5,
  },
  {
    id: 7,
    title: 'Share Your First Post',
    description: 'Post on social media about your new journey. We\'ll give you the perfect caption!',
    timeEstimate: '15 min',
    icon: Share2,
    actionText: 'Get Template',
    points: 10,
  },
];

export default function First48HoursClient({
  distributor,
  progress,
  isWithin48Hours,
  hoursRemaining,
}: First48HoursClientProps) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    progress.steps_completed || []
  );
  const [loading, setLoading] = useState(false);

  const totalPoints = completedSteps.reduce((sum, stepId) => {
    const step = STEPS.find(s => s.id === stepId);
    return sum + (step?.points || 0);
  }, 0);

  const progressPercentage = (completedSteps.length / STEPS.length) * 100;

  const handleToggleStep = async (stepId: number) => {
    setLoading(true);

    const isCompleted = completedSteps.includes(stepId);
    const newCompleted = isCompleted
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];

    setCompletedSteps(newCompleted);

    // Save to database
    try {
      await fetch('/api/first-48-hours/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          distributorId: distributor.id,
          stepsCompleted: newCompleted,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = (step: Step) => {
    if (step.actionUrl) {
      if (step.externalLink) {
        window.open(step.actionUrl, '_blank');
      } else {
        router.push(step.actionUrl);
      }
    }
  };

  const isAllComplete = completedSteps.length === STEPS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border-2 border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">
                Your First 48 Hours
              </h1>
              <p className="text-slate-600 mt-1">
                Hit the ground running, {distributor.first_name}!
              </p>
            </div>
          </div>

          {/* Timer */}
          {isWithin48Hours ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-orange-900 font-semibold">
                {hoursRemaining} hours remaining in your first 48!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-lg">
              <Trophy className="w-5 h-5 text-slate-600" />
              <span className="text-slate-700">
                Welcome back! Complete these steps to build momentum.
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Progress: {completedSteps.length}/{STEPS.length} Steps
              </span>
              <span className="text-sm font-bold text-blue-600">
                {totalPoints} Points
              </span>
            </div>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-green-300 bg-green-50/50'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Step Number / Check */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>{step.timeEstimate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 font-semibold">
                              <Trophy className="w-4 h-4" />
                              <span>{step.points} points</span>
                            </div>
                          </div>
                        </div>

                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {step.actionUrl && (
                          <button
                            onClick={() => handleStepAction(step)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                          >
                            {step.actionText}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStep(step.id)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isCompleted
                              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {isAllComplete && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Congratulations!</h2>
                <p className="text-green-100">
                  You've completed your First 48 Hours!
                </p>
              </div>
            </div>
            <p className="text-lg mb-4">
              You've earned {totalPoints} points and built incredible momentum. Now let's get you to your first sale!
            </p>
            <button
              onClick={() => router.push('/dashboard/race-to-100')}
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
            >
              Start Race to 100
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Next Step Reminder */}
        {!isAllComplete && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-2">
              💡 What's Next?
            </h3>
            <p className="text-slate-700 mb-4">
              After completing these 7 steps, you'll transition to the **Race to 100** - our comprehensive 10-step program to get you to your first sale!
            </p>
            <button
              onClick={() => router.push('/dashboard/race-to-100')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
            >
              Preview Race to 100
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
