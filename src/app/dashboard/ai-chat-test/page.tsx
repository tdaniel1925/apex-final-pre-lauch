// =============================================
// AI Chat Test Page
// HIDDEN PAGE - Not linked in sidebar
// Direct URL: /dashboard/ai-chat-test
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AIChatInterface from '@/components/dashboard/AIChatInterface';

export const metadata = {
  title: 'AI Chat Test - Dashboard',
};

export default async function AIChatTestPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user context for personalized greeting
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, current_rank, personal_bv_monthly, status, created_at, sponsor_id')
    .eq('auth_user_id', user.id)
    .single();

  // Get team count
  const { count: teamCount } = await supabase
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', distributor?.id || '')
    .neq('status', 'deleted');

  // Get recent team joins (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: recentJoins } = await supabase
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', distributor?.id || '')
    .gte('created_at', sevenDaysAgo.toISOString());

  // Get monthly commissions
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: commissions } = await supabase
    .from('commissions')
    .select('amount')
    .eq('distributor_id', distributor?.id || '')
    .gte('created_at', startOfMonth.toISOString());

  const monthlyCommissions = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

  // Calculate rank progress
  const rankRequirements: Record<string, { personal: number; group: number; next: string }> = {
    starter: { personal: 150, group: 300, next: 'Bronze' },
    bronze: { personal: 500, group: 1500, next: 'Silver' },
    silver: { personal: 1200, group: 5000, next: 'Gold' },
    gold: { personal: 2000, group: 15000, next: 'Platinum' },
    platinum: { personal: 3000, group: 30000, next: 'Ruby' },
    ruby: { personal: 4000, group: 60000, next: 'Diamond' },
    diamond: { personal: 5000, group: 120000, next: 'Crown' },
    crown: { personal: 6000, group: 250000, next: 'Elite' },
  };

  const currentRank = distributor?.current_rank || 'starter';
  const requirements = rankRequirements[currentRank];
  const personalBV = distributor?.personal_bv_monthly || 0;
  const personalProgress = requirements ? Math.min(100, Math.round((personalBV / requirements.personal) * 100)) : 0;

  // Build initial context
  const initialContext = {
    firstName: distributor?.first_name || 'there',
    currentRank,
    personalBV,
    teamCount: teamCount || 0,
    monthlyCommissions,
    recentJoins: recentJoins || 0,
    nextRank: requirements?.next || null,
    personalProgress,
  };

  return (
    <div className="p-6">
      {/* Test Banner */}
      <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          <div>
            <h2 className="font-bold text-yellow-900">Test Page - Not Production</h2>
            <p className="text-sm text-yellow-800">
              This is a prototype of the AI-powered dashboard interface. Try asking for help with tasks like creating registration pages, viewing team stats, or checking commissions.
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      <AIChatInterface initialContext={initialContext} />

      {/* Instructions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">💡 Try This</h3>
          <p className="text-sm text-gray-600 mb-2">"I need to create a registration page for my Tuesday meeting"</p>
          <p className="text-xs text-gray-500">The AI will ask follow-up questions and create the page for you</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">📊 Or This</h3>
          <p className="text-sm text-gray-600 mb-2">"Show me my team stats"</p>
          <p className="text-xs text-gray-500">Instantly see your team size and active members</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 mb-2">💰 Or This</h3>
          <p className="text-sm text-gray-600 mb-2">"What's my commission balance?"</p>
          <p className="text-xs text-gray-500">Check your current earnings balance</p>
        </div>
      </div>
    </div>
  );
}
