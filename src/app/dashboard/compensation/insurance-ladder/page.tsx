'use client';

// =============================================
// Insurance Ladder - Licensed Agents Only
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md Section 6
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const insuranceRanks = [
  {
    rank: 'Pre-Associate',
    level: 1,
    commission: '50%',
    premium90Day: 0,
    agents: 0,
    quality: 'None',
    description: 'Entry level for newly licensed agents',
  },
  {
    rank: 'Associate',
    level: 2,
    commission: '55%',
    premium90Day: 10000,
    agents: 0,
    quality: '60% Placement + 80% Persistency',
    description: 'First production milestone',
  },
  {
    rank: 'Sr. Associate',
    level: 3,
    commission: '60%',
    premium90Day: 25000,
    agents: 0,
    quality: '60% Placement + 80% Persistency',
    description: 'Established agent status',
  },
  {
    rank: 'Agent',
    level: 4,
    commission: '70%',
    premium90Day: 45000,
    agents: 0,
    quality: '60% Placement + 80% Persistency',
    description: 'Professional tier production',
  },
  {
    rank: 'Sr. Agent',
    level: 5,
    commission: '80%',
    premium90Day: 75000,
    agents: 5,
    quality: '60% Placement + 80% Persistency',
    description: 'Leadership begins - recruiting required',
  },
  {
    rank: 'MGA',
    level: 6,
    commission: '90%',
    premium90Day: 150000,
    agents: 10,
    quality: '60% Placement + 80% Persistency',
    description: 'Managing General Agent - Base shop 20%',
  },
];

const mgaTiers = [
  {
    tier: 'MGA',
    mgaLeaders: 0,
    gen1: true,
    gen2: false,
    gen3: false,
    gen4: false,
    gen5: false,
    gen6: false,
    description: 'Base MGA status with 20% base shop',
  },
  {
    tier: 'Associate MGA',
    mgaLeaders: 2,
    gen1: true,
    gen2: false,
    gen3: false,
    gen4: false,
    gen5: false,
    gen6: false,
    description: 'Develop 2 MGAs for Gen 1 overrides',
  },
  {
    tier: 'Senior MGA',
    mgaLeaders: 4,
    gen1: true,
    gen2: true,
    gen3: false,
    gen4: false,
    gen5: false,
    gen6: false,
    description: 'Develop 4 MGAs for Gen 2 overrides',
  },
  {
    tier: 'Regional MGA',
    mgaLeaders: 6,
    gen1: true,
    gen2: true,
    gen3: true,
    gen4: false,
    gen5: false,
    gen6: false,
    description: 'Regional leader with 6 MGAs',
  },
  {
    tier: 'National MGA',
    mgaLeaders: 8,
    gen1: true,
    gen2: true,
    gen3: true,
    gen4: true,
    gen5: false,
    gen6: false,
    description: 'National reach with 8 MGAs',
  },
  {
    tier: 'Executive MGA',
    mgaLeaders: 10,
    gen1: true,
    gen2: true,
    gen3: true,
    gen4: true,
    gen5: true,
    gen6: false,
    description: 'Executive leadership with 10 MGAs',
  },
  {
    tier: 'Premier MGA',
    mgaLeaders: 12,
    gen1: true,
    gen2: true,
    gen3: true,
    gen4: true,
    gen5: true,
    gen6: true,
    description: 'Highest tier - Gen 6 pooled overrides',
  },
];

export default function InsuranceLadderPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-4">
            <Link
              href="/dashboard/compensation"
              className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Compensation Plan
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Insurance Ladder</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Licensed insurance agents build a separate income stream through insurance sales. Advance from Pre-Associate to Premier MGA with generational overrides.
          </p>
        </div>
      </div>

      {/* License Required Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Active Insurance License Required</h3>
              <p className="text-amber-800">
                The Insurance Ladder is available exclusively to licensed insurance agents. You must hold an active
                insurance license and provide documentation to access insurance sales tools, commissions, and MGA advancement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">50% - 90%</div>
            <div className="text-sm text-slate-600">Commission Range</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">6 Ranks</div>
            <div className="text-sm text-slate-600">Base Advancement Levels</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">7 MGA Tiers</div>
            <div className="text-sm text-slate-600">Generational Overrides</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Insurance Ranks Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Advancement Requirements</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>90-Day Premium Volume:</strong> Trailing 90-day production</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Quality Metrics:</strong> 60% placement + 80% persistency (Associate+)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Recruiting:</strong> Developed licensed agents (Sr. Agent and MGA only)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bonus Programs</h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Weekly Production Bonus</h4>
                  <p className="text-sm text-slate-700 mb-2">$2,000/week threshold for consecutive weeks:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>Week 1: 1% of production</li>
                    <li>Week 2: 2% of production</li>
                    <li>Week 3: 3% of production</li>
                    <li>Week 4+: 4% of production</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-2">Resets if week missed</p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">MGA Quarterly Recruiting</h4>
                  <p className="text-sm text-slate-700 mb-2">$150K shop minimum:</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>9 recruits: 1% bonus</li>
                    <li>12 recruits: 2% bonus</li>
                    <li>15 recruits: 3% bonus</li>
                    <li>18 recruits: 4% bonus</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base Insurance Ranks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Base Insurance Ranks</h2>

        <div className="space-y-4">
          {insuranceRanks.map((rank) => (
            <div
              key={rank.level}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-slate-300 transition-all"
            >
              <button
                onClick={() => setExpandedRank(expandedRank === rank.level ? null : rank.level)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-lg font-bold text-lg">
                    {rank.level}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{rank.rank}</h3>
                    <p className="text-sm text-slate-600 mt-1">{rank.description}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-slate-900">{rank.commission}</div>
                    <div className="text-xs text-slate-600">Commission</div>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-400 ml-4 transition-transform ${
                    expandedRank === rank.level ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedRank === rank.level && (
                <div className="px-6 pb-6 border-t border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Requirements</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">90-Day Premium</span>
                          <span className="font-semibold text-slate-900">
                            {rank.premium90Day > 0 ? `$${rank.premium90Day.toLocaleString()}` : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Licensed Agents</span>
                          <span className="font-semibold text-slate-900">
                            {rank.agents > 0 ? rank.agents : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Quality Standards</span>
                          <span className="font-semibold text-slate-900">{rank.quality}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Benefits</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Commission Rate</span>
                          <span className="font-semibold text-slate-900">{rank.commission}</span>
                        </div>
                        {rank.level >= 6 && (
                          <>
                            <div className="flex justify-between py-2 border-b border-slate-200">
                              <span className="text-slate-600">Base Shop</span>
                              <span className="font-semibold text-green-600">20%</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200">
                              <span className="text-slate-600">MGA Tier Eligible</span>
                              <span className="font-semibold text-green-600">Yes</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MGA Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">MGA Tiers & Generational Overrides</h2>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Generational Override Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">15%</div>
              <div className="text-xs text-slate-600">Gen 1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">5%</div>
              <div className="text-xs text-slate-600">Gen 2</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">3%</div>
              <div className="text-xs text-slate-600">Gen 3</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">2%</div>
              <div className="text-xs text-slate-600">Gen 4</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">1%</div>
              <div className="text-xs text-slate-600">Gen 5</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">0.5%</div>
              <div className="text-xs text-slate-600">Gen 6</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mgaTiers.map((tier, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tier.tier}</h3>
                  <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{tier.mgaLeaders} MGAs</div>
                  <div className="text-xs text-slate-600">Required</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Override Generations:</span>
                {['Gen 1', 'Gen 2', 'Gen 3', 'Gen 4', 'Gen 5', 'Gen 6'].map((gen, i) => {
                  const enabled = [tier.gen1, tier.gen2, tier.gen3, tier.gen4, tier.gen5, tier.gen6][i];
                  return (
                    <span
                      key={gen}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {gen}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Build Your Insurance Business</h2>
          <p className="text-xl text-slate-200 mb-8">
            Licensed insurance agents have a dedicated pathway to build substantial income through personal production
            and developing other licensed agents. Advance to MGA and unlock generational overrides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/licensed-agent"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              Licensed Agent Dashboard
            </Link>
            <Link
              href="/dashboard/compensation/tech-ladder"
              className="bg-slate-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              View Tech Ladder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
