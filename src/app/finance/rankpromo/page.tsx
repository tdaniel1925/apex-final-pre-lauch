'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function RankPromoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [currentRank, setCurrentRank] = useState('BRONZE');
  const [targetRank, setTargetRank] = useState('SILVER');
  const [teamBV, setTeamBV] = useState('5000');

  const ranks = [
    {name: 'ASSOCIATE', personalBV: 50, teamBV: 0, overrideLevels: 1},
    {name: 'BRONZE', personalBV: 100, teamBV: 500, overrideLevels: 2},
    {name: 'SILVER', personalBV: 150, teamBV: 2500, overrideLevels: 3},
    {name: 'GOLD', personalBV: 200, teamBV: 10000, overrideLevels: 4},
    {name: 'PLATINUM', personalBV: 250, teamBV: 25000, overrideLevels: 5}
  ];

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {router.push('/login'); return;}
      const { data: dist } = await supabase.from('distributors').select('role').eq('email', user.email).single();
      if (!dist || !['cfo', 'admin'].includes(dist.role)) {router.push('/dashboard'); return;}
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  const current = ranks.find(r => r.name === currentRank) || ranks[0];
  const target = ranks.find(r => r.name === targetRank) || ranks[1];
  const tbv = parseFloat(teamBV) || 0;

  const currentEarnings = tbv * 0.15;
  const targetEarnings = tbv * 0.20;
  const increase = targetEarnings - currentEarnings;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-primary-800 font-bold text-xl">A</div>
            <div><h1 className="font-heading text-lg font-bold">Apex Finance & Analytics Suite</h1><div className="text-xs text-primary-200 font-mono">INTERNAL USE ONLY • V 2.4.1</div></div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/finance" className="text-xs font-semibold text-neutral-400 uppercase hover:text-primary-700">← Finance</Link>
          <h1 className="font-heading font-bold text-gray-900 text-2xl mt-1">Rank Promotion Pro Forma</h1>
          <p className="text-sm text-gray-500 mt-1">Projects commission changes when promoting to next rank</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Scenario Inputs</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Current Rank</label><select value={currentRank} onChange={(e) => setCurrentRank(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none">{ranks.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Target Rank</label><select value={targetRank} onChange={(e) => setTargetRank(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none">{ranks.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Current Team BV</label><div className="relative"><span className="absolute left-3 top-2.5 text-neutral-400 text-sm">$</span><input type="text" value={teamBV} onChange={(e) => setTeamBV(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none" /></div></div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-large border border-neutral-200 p-6">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Current Rank</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{current.name}</div>
                <div className="space-y-1 text-xs text-neutral-600">
                  <div>Personal BV: {current.personalBV}</div>
                  <div>Team BV: ${current.teamBV.toLocaleString()}</div>
                  <div>Override Levels: {current.overrideLevels}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Projected Monthly</div>
                  <div className="text-xl font-bold text-neutral-800">${currentEarnings.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-green-50 rounded-large border border-green-200 p-6">
                <div className="text-xs font-semibold text-green-700 uppercase mb-2">Target Rank</div>
                <div className="text-2xl font-bold text-green-900 mb-2">{target.name}</div>
                <div className="space-y-1 text-xs text-green-700">
                  <div>Personal BV: {target.personalBV}</div>
                  <div>Team BV: ${target.teamBV.toLocaleString()}</div>
                  <div>Override Levels: {target.overrideLevels}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-300">
                  <div className="text-xs font-semibold text-green-700 uppercase mb-1">Projected Monthly</div>
                  <div className="text-xl font-bold text-green-800">${targetEarnings.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-large border border-primary-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-primary-700 uppercase mb-1">Monthly Increase</div>
                  <div className="text-3xl font-bold text-primary-800">${increase.toFixed(2)}</div>
                  <div className="text-sm text-primary-600 mt-1">+{((increase / currentEarnings) * 100).toFixed(1)}% earnings boost</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-primary-700 uppercase mb-1">Annual Impact</div>
                  <div className="text-2xl font-bold text-primary-800">${(increase * 12).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">Requirements to Promote</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-small">
                  <span className="text-sm text-gray-700">Personal BV Requirement</span>
                  <span className="font-bold text-gray-900">{target.personalBV} BV</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-small">
                  <span className="text-sm text-gray-700">Team BV Requirement</span>
                  <span className="font-bold text-gray-900">${target.teamBV.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-small border border-green-200">
                  <span className="text-sm text-green-700 font-semibold">New Override Levels</span>
                  <span className="font-bold text-green-800">{target.overrideLevels} levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
