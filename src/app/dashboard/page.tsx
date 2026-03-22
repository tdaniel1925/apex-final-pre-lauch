// =============================================
// Dashboard Page
// Main distributor dashboard with compensation metrics
// =============================================
// AGENT 1 REBUILD - Dual-Ladder System
// =============================================
// DATA SOURCES:
// - distributors table: Main distributor record
// - members table: Compensation data (personal_credits_monthly, team_credits_monthly, tech_rank)
// - earnings_ledger: Monthly earnings (status='approved')
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import TrainingAudioPlayer from '@/components/dashboard/TrainingAudioPlayer';
import CompensationStatsWidget from '@/components/dashboard/CompensationStatsWidget';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import DashboardClient from '@/components/dashboard/DashboardClient';
import CopyReferralButton from '@/components/dashboard/CopyReferralButton';
import type { Distributor } from '@/lib/types';
import { ArrowRight, Users, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard - Apex Affinity Group',
  description: 'Distributor dashboard',
};

// Enable caching for 60 seconds
export const revalidate = 60;

// Rank requirements mapping (from APEX_COMP_ENGINE_SPEC_FINAL.md)
const TECH_RANK_REQUIREMENTS = {
  starter: { personal: 0, group: 0 },
  bronze: { personal: 150, group: 300 },
  silver: { personal: 500, group: 1500 },
  gold: { personal: 1200, group: 5000 },
  platinum: { personal: 2500, group: 15000 },
  ruby: { personal: 4000, group: 30000 },
  diamond: { personal: 5000, group: 50000 },
  crown: { personal: 6000, group: 75000 },
  elite: { personal: 8000, group: 120000 },
};

// Get next rank in progression
function getNextRank(currentRank: string): string | null {
  const ranks = Object.keys(TECH_RANK_REQUIREMENTS);
  const currentIndex = ranks.indexOf(currentRank.toLowerCase());
  if (currentIndex === -1 || currentIndex === ranks.length - 1) return null;
  return ranks[currentIndex + 1];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data (use service client to bypass RLS)
  const serviceClient = createServiceClient();

  // Fetch distributor with joined member data
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        highest_tech_rank,
        override_qualified
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  // If no distributor record, check if they're an admin
  if (error || !distributor) {
    // Error loading distributor record - check if admin

    const adminUser = await getAdminUser();

    // If they're an admin, redirect to admin dashboard
    if (adminUser) {
      redirect('/admin');
    }

    // Otherwise, they need to complete signup
    redirect('/signup');
  }

  const dist = distributor as Distributor & {
    member?: {
      member_id: string;
      personal_credits_monthly: number;
      team_credits_monthly: number;
      tech_rank: string;
      highest_tech_rank: string;
      override_qualified: boolean;
    } | null;
  };

  // Extract member compensation data
  // If no member record exists yet, use default values
  const personalCredits = dist.member?.personal_credits_monthly ?? 0;
  const teamCredits = dist.member?.team_credits_monthly ?? 0;
  const currentRank = dist.member?.tech_rank ?? 'starter';
  const memberId = dist.member?.member_id;

  // Calculate monthly earnings
  // Query earnings_ledger for current month, status='approved'
  // Only query if member_id exists
  let monthlyEarnings = 0;

  if (memberId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: earnings, error: earningsError } = await serviceClient
      .from('earnings_ledger')
      .select('amount_usd')
      .eq('member_id', memberId)
      .eq('status', 'approved')
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false });

    if (earningsError) {
      // Error fetching earnings - will default to 0
    }

    // Sum all approved earnings for this month
    monthlyEarnings = earnings?.reduce((sum, e) => sum + (e.amount_usd || 0), 0) || 0;
  }

  // Fetch activity feed data server-side (to avoid concurrent auth token usage)
  const { data: activityData } = await serviceClient
    .from('activity_feed')
    .select(`
      id,
      actor_id,
      target_id,
      event_type,
      event_title,
      event_description,
      metadata,
      depth_from_root,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(
        first_name,
        last_name,
        slug,
        profile_photo_url
      ),
      target:distributors!activity_feed_target_id_fkey(
        first_name,
        last_name
      )
    `)
    .eq('organization_root_id', dist.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Transform activity data
  const initialActivities = (activityData || []).map((activity) => {
    // Extract actor data (Supabase returns arrays for joined tables)
    const actorData = Array.isArray(activity.actor) ? activity.actor[0] : activity.actor;
    const targetData = Array.isArray(activity.target) ? activity.target[0] : activity.target;

    return {
      id: activity.id,
      actor_id: activity.actor_id,
      actor_name: actorData ? `${actorData.first_name} ${actorData.last_name}` : 'Unknown',
      actor_slug: actorData?.slug || '',
      actor_photo_url: actorData?.profile_photo_url || null,
      target_id: activity.target_id,
      target_name: targetData ? `${targetData.first_name} ${targetData.last_name}` : null,
      event_type: activity.event_type,
      event_title: activity.event_title,
      event_description: activity.event_description,
      metadata: activity.metadata || {},
      depth_from_root: activity.depth_from_root,
      created_at: activity.created_at,
    };
  });

  // Calculate rank progress
  const nextRank = getNextRank(currentRank);
  const currentRankReq = TECH_RANK_REQUIREMENTS[currentRank.toLowerCase() as keyof typeof TECH_RANK_REQUIREMENTS] || TECH_RANK_REQUIREMENTS.starter;
  const nextRankReq = nextRank ? TECH_RANK_REQUIREMENTS[nextRank as keyof typeof TECH_RANK_REQUIREMENTS] : null;

  // Progress percentage based on personal credits
  let progressPercent = 100;
  let creditsNeeded = 0;
  if (nextRankReq) {
    const creditsRequired = nextRankReq.personal - currentRankReq.personal;
    const creditsProgress = personalCredits - currentRankReq.personal;
    progressPercent = Math.min(100, Math.max(0, (creditsProgress / creditsRequired) * 100));
    creditsNeeded = Math.max(0, nextRankReq.personal - personalCredits);
  }

  return (
    <DashboardClient distributor={dist}>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {dist.first_name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">@{dist.slug}</p>
          </div>

          {/* Training Audio Player */}
          <TrainingAudioPlayer />

          {/* Compensation Stats - 4 Cards */}
          <CompensationStatsWidget
            personalCredits={personalCredits}
            teamCredits={teamCredits}
            currentRank={currentRank}
            monthlyEarnings={monthlyEarnings}
          />

          {/* Rank Progress Bar */}
          {nextRank && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Progress to {nextRank.charAt(0).toUpperCase() + nextRank.slice(1)}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {creditsNeeded.toLocaleString()} credits needed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {progressPercent.toFixed(0)}%
                  </p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-slate-700 to-slate-900 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>{personalCredits.toLocaleString()} credits</span>
                {nextRankReq && <span>{nextRankReq.personal.toLocaleString()} credits</span>}
              </div>
            </div>
          )}

          {/* Quick Actions - 4 Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Enroll New Member */}
            <Link
              href={`/${dist.slug}`}
              className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <Users className="w-6 h-6 text-slate-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Enroll New Member
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Share your landing page
              </p>
            </Link>

            {/* Share Referral Link */}
            <CopyReferralButton slug={dist.slug} />

            {/* View Compensation Plan */}
            <Link
              href="/compensation"
              className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                View Compensation Plan
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                See earning potential
              </p>
            </Link>

            {/* Contact Support */}
            <Link
              href="/support"
              className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-slate-700" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Contact Support
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Get help anytime
              </p>
            </Link>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <p className="text-sm text-slate-600 mt-1">
                Latest updates from your organization
              </p>
            </div>
            <div className="p-6">
              <ActivityFeed distributorId={dist.id} initialActivities={initialActivities} />
            </div>
          </div>
        </div>
      </div>
    </DashboardClient>
  );
}
