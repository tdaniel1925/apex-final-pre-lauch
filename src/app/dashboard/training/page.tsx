// =============================================
// Rep Training Dashboard
// Professional training modules with rank-based access
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Training — Apex Affinity Group',
};

// Training module definitions
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  rankRequired: string | null; // null = all ranks
  category: 'fundamental' | 'product' | 'compensation' | 'leadership' | 'advanced';
  completed: boolean; // Will be determined per user
  videoUrl?: string; // Placeholder for future implementation
}

const TRAINING_MODULES: Omit<TrainingModule, 'completed'>[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Essential onboarding for new representatives. Learn the basics of our system, how to navigate your dashboard, and take your first steps toward success.',
    duration: '30 min',
    rankRequired: null,
    category: 'fundamental',
  },
  {
    id: 'product-training',
    title: 'Product Training',
    description: 'Comprehensive overview of all Pulse products. Understand features, benefits, and how to match products to customer needs.',
    duration: '45 min',
    rankRequired: null,
    category: 'product',
  },
  {
    id: 'compensation-deep-dive',
    title: 'Compensation Plan Deep Dive',
    description: 'Master the dual-ladder compensation structure. Learn how commissions, overrides, bonuses, and rank advancement work.',
    duration: '60 min',
    rankRequired: null,
    category: 'compensation',
  },
  {
    id: 'leadership-fundamentals',
    title: 'Leadership Training',
    description: 'Build and manage your team effectively. Learn recruiting strategies, team support, and creating a culture of success.',
    duration: '50 min',
    rankRequired: 'gold',
    category: 'leadership',
  },
  {
    id: 'advanced-strategies',
    title: 'Advanced Strategies',
    description: 'Elite-level tactics for scaling your business. Advanced marketing, team duplication systems, and long-term growth planning.',
    duration: '75 min',
    rankRequired: 'platinum',
    category: 'advanced',
  },
];

// Rank hierarchy for filtering
const RANK_LEVELS: Record<string, number> = {
  starter: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  ruby: 5,
  diamond: 6,
  crown: 7,
  elite: 8,
};

function getRankLevel(rank: string | null): number {
  if (!rank) return 0;
  return RANK_LEVELS[rank.toLowerCase()] ?? 0;
}

export default async function TrainingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const serviceClient = createServiceClient();

  // Get distributor and member data with rank
  const { data: userData, error: userError } = await serviceClient
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      member:members!members_distributor_id_fkey (
        tech_rank,
        insurance_rank
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !userData) {
    console.error('Training page - user data error:', userError);
    redirect('/dashboard');
  }

  // Handle member data (can be array or object from join)
  const memberData = Array.isArray(userData.member) ? userData.member[0] : userData.member;
  const techRank = memberData?.tech_rank || 'starter';
  const insuranceRank = memberData?.insurance_rank || 'inactive';
  const userRankLevel = getRankLevel(techRank);

  // Filter modules based on rank access
  const availableModules = TRAINING_MODULES.map((module) => {
    const isAccessible = !module.rankRequired || getRankLevel(module.rankRequired) <= userRankLevel;
    return {
      ...module,
      completed: false, // TODO: Track completion in database
      accessible: isAccessible,
    };
  });

  const accessibleModules = availableModules.filter((m) => m.accessible);
  const lockedModules = availableModules.filter((m) => !m.accessible);
  const completedCount = availableModules.filter((m) => m.completed).length;
  const progressPercentage = Math.round((completedCount / TRAINING_MODULES.length) * 100);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Rep Training</h1>
        <p className="text-slate-200 text-lg mb-4">
          Your rank-specific training path as a {techRank.charAt(0).toUpperCase() + techRank.slice(1)} representative
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Tech Rank: {techRank.charAt(0).toUpperCase() + techRank.slice(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Insurance Rank: {insuranceRank.charAt(0).toUpperCase() + insuranceRank.slice(1).replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Your Progress</h2>
            <p className="text-sm text-slate-600 mt-1">
              {completedCount} of {TRAINING_MODULES.length} modules completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">{progressPercentage}%</div>
            <p className="text-xs text-slate-500">Complete</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-slate-700 rounded-full h-3 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {completedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 font-medium">Certificates Earned</p>
            <div className="flex gap-2 mt-2">
              {availableModules
                .filter((m) => m.completed)
                .map((m) => (
                  <div
                    key={m.id}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                  >
                    {m.title}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Training Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessibleModules.map((module) => (
            <div
              key={module.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{module.description}</p>
                </div>
                {module.completed && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{module.duration}</span>
                  </div>
                  {module.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Completed</span>
                    </div>
                  )}
                </div>
                <button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  {module.completed ? 'Review' : 'Start Training'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Modules */}
      {lockedModules.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Unlock More Training</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedModules.map((module) => (
              <div
                key={module.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-6 opacity-75"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">{module.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{module.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">{module.duration}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium">
                      Requires {module.rankRequired?.charAt(0).toUpperCase()}{module.rankRequired?.slice(1)} rank
                    </span>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-300 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed"
                  >
                    Locked
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
