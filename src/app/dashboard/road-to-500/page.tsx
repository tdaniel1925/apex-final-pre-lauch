// =============================================
// Road to 500 - Company Initiative Page
// Company-wide race to 500 reps
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Road to 500 - Apex Affinity Group',
  description: 'Join us in building the Apex movement to 500 agents',
};

export default async function RoadTo500Page() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current user's distributor record
  const { data: me } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  // Total agents count
  const { count: totalAgents } = await serviceClient
    .from('distributors')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'suspended');

  const goal = 500;
  const pct = Math.min(((totalAgents || 0) / goal) * 100, 100);
  const remaining = Math.max(goal - (totalAgents || 0), 0);

  // Get all distributors for leaderboard
  const { data: allDistributors } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, matrix_parent_id, created_at')
    .neq('status', 'suspended');

  // Count recruits for each distributor
  const recruitCounts = new Map<string, { count: number; name: string; joinedDate: string }>();
  allDistributors?.forEach(d => {
    if (d.matrix_parent_id) {
      const parent = allDistributors.find(p => p.id === d.matrix_parent_id);
      if (parent) {
        const existing = recruitCounts.get(d.matrix_parent_id);
        recruitCounts.set(d.matrix_parent_id, {
          count: (existing?.count || 0) + 1,
          name: `${parent.first_name} ${parent.last_name}`,
          joinedDate: parent.created_at,
        });
      }
    }
  });

  // Convert to array and sort by count
  const leaderboard = Array.from(recruitCounts.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
      isYou: id === me?.id,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20

  // Your personal stats
  const myRecruits = recruitCounts.get(me?.id || '')?.count || 0;
  const myRank = leaderboard.findIndex(l => l.isYou) + 1;

  // Milestones
  const milestones = [
    { target: 100, reached: (totalAgents || 0) >= 100, reward: 'Phase 1 Complete', icon: '🎯' },
    { target: 250, reached: (totalAgents || 0) >= 250, reward: 'Halfway Celebration', icon: '🎉' },
    { target: 400, reached: (totalAgents || 0) >= 400, reward: 'Final Push!', icon: '🚀' },
    { target: 500, reached: (totalAgents || 0) >= 500, reward: 'GOAL REACHED!', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">⚡</div>
            <div>
              <h1 className="text-5xl font-bold">Road to 500</h1>
              <p className="text-2xl text-yellow-100 mt-2">Building the Apex Movement Together</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Progress - Big Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-lg shadow-2xl p-8 border-t-8 border-orange-500">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-6xl font-black text-[#2B4C7E] mb-2">{totalAgents || 0}</div>
              <div className="text-lg text-gray-600">Current Agents</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-orange-600 mb-2">{remaining}</div>
              <div className="text-lg text-gray-600">Agents to Go</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-green-600 mb-2">{pct.toFixed(1)}%</div>
              <div className="text-lg text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 drop-shadow-sm">
                {totalAgents || 0} / {goal} Agents
              </span>
            </div>
          </div>

          <div className="text-center text-gray-600 text-sm">
            {(totalAgents || 0) >= 500 ? (
              <span className="text-green-600 font-bold text-lg">🏆 WE DID IT! Goal Reached!</span>
            ) : (
              `We need ${remaining} more agents to reach our goal of 500!`
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
        {/* What Is Road to 500 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Is Road to 500?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Road to 500 is our <strong>company-wide initiative</strong> to build the Apex Affinity Group movement
            to <strong>500 active agents</strong>. This isn't just about numbers - it's about building a powerful
            community of insurance professionals who support each other and grow together.
          </p>
          <div className="bg-yellow-50 border-l-4 border-orange-500 p-6 rounded-r">
            <h3 className="font-bold text-gray-900 mb-2">Why 500 Matters:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span><strong>Critical Mass:</strong> 500 agents gives us the momentum to dominate our market</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span><strong>Stronger Together:</strong> More agents means better training, support, and resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span><strong>Market Power:</strong> We become a force that carriers and vendors take seriously</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span><strong>Your Success:</strong> The bigger the team, the more opportunities for everyone</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Milestones */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Milestones</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.target}
                className={`rounded-lg p-6 border-2 ${
                  milestone.reached
                    ? 'bg-green-50 border-green-400'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{milestone.icon}</div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{milestone.target} Agents</div>
                      <div className="text-sm text-gray-600">{milestone.reward}</div>
                    </div>
                  </div>
                  {milestone.reached && (
                    <div className="text-3xl text-green-600">✅</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Personal Stats */}
        <section className="bg-purple-600 text-white text-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6">Your Contribution</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <div className="text-5xl font-black mb-2">{myRecruits}</div>
              <div className="text-sm text-purple-100">Personal Recruits</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <div className="text-5xl font-black mb-2">
                {myRank > 0 ? `#${myRank}` : '-'}
              </div>
              <div className="text-sm text-purple-100">Your Rank</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <div className="text-5xl font-black mb-2">
                {myRecruits > 0 ? ((myRecruits / (totalAgents || 1)) * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-sm text-purple-100">Of Total Growth</div>
            </div>
          </div>

          {myRecruits > 0 && (
            <div className="mt-6 bg-white/20 rounded-lg p-4 text-center">
              <p className="text-lg">
                <strong>Amazing work!</strong> You've personally brought {myRecruits} agent{myRecruits !== 1 ? 's' : ''} into the Apex family! 🎉
              </p>
            </div>
          )}
        </section>

        {/* Leaderboard */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🏆 Top Recruiters</h2>
          <div className="space-y-2">
            {leaderboard.map((leader, index) => (
              <div
                key={leader.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  leader.isYou
                    ? 'bg-purple-50 border-purple-500'
                    : index === 0
                    ? 'bg-yellow-50 border-yellow-400'
                    : index === 1
                    ? 'bg-gray-100 border-gray-400'
                    : index === 2
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className={`font-bold ${leader.isYou ? 'text-purple-900' : 'text-gray-900'}`}>
                      {leader.name} {leader.isYou && '(You!)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {leader.count} recruit{leader.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {index === 0 && !leader.isYou && (
                  <div className="text-sm text-yellow-700 font-semibold">Current Leader</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* How to Participate */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Participate</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                1️⃣
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Share Your Story</h3>
              <p className="text-sm text-gray-600">
                Tell people why you joined Apex and how it's changing your insurance career
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                2️⃣
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Invite Agents</h3>
              <p className="text-sm text-gray-600">
                Know insurance agents who would benefit? Share your referral link with them
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                3️⃣
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Build Together</h3>
              <p className="text-sm text-gray-600">
                Support new agents, share wins, and grow the movement as a team
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Help Us Reach 500?</h2>
          <p className="text-xl text-blue-200 mb-6">
            Every agent you bring in gets us one step closer to our goal. Let's build this movement together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-[#2B4C7E] px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
            >
              Get My Referral Link
            </Link>
            <Link
              href="/dashboard/team"
              className="bg-blue-800/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800/70 transition-colors border-2 border-blue-400/30"
            >
              View My Team
            </Link>
          </div>
        </section>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-[#2B4C7E] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
