'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function BonusPoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [poolAmount, setPoolAmount] = useState('1000');
  const [activeL1, setActiveL1] = useState('3');
  const [activeL2, setActiveL2] = useState('2');
  const [activeL3, setActiveL3] = useState('1');
  const [activeL4, setActiveL4] = useState('1');
  const [activeL5, setActiveL5] = useState('0');

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

  const pool = parseFloat(poolAmount) || 0;
  const levels = [
    {level: 'L1', pct: 0.30, active: parseInt(activeL1)},
    {level: 'L2', pct: 0.25, active: parseInt(activeL2)},
    {level: 'L3', pct: 0.20, active: parseInt(activeL3)},
    {level: 'L4', pct: 0.15, active: parseInt(activeL4)},
    {level: 'L5', pct: 0.10, active: parseInt(activeL5)}
  ];

  let remaining = pool;
  const distributions = levels.map((level) => {
    if (level.active > 0) {
      const share = Math.round(pool * level.pct * 100) / 100;
      const perPerson = share / level.active;
      remaining -= share;
      return {...level, share, perPerson};
    } else {
      return {...level, share: 0, perPerson: 0};
    }
  });

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
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/finance/weighting" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">⚖️ Weighting</Link>
            <Link href="/finance/waterfall" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">💧 Waterfall</Link>
            <Link href="/finance/bonusvolume" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">🎯 BV & Bonus</Link>
            <Link href="/finance/bonuspool" className="px-3 py-1.5 bg-primary-700 border border-primary-500 text-white text-xs font-semibold rounded-small">🏊 Bonus Pool</Link>
          </nav>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/finance" className="text-xs font-semibold text-neutral-400 uppercase hover:text-primary-700">← Finance</Link>
          <h1 className="font-heading font-bold text-gray-900 text-2xl mt-1">Bonus Pool Allocation Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Shows how override pool distributes across active upline levels</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Input Parameters</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Override Pool Total</label><div className="relative"><span className="absolute left-3 top-2.5 text-neutral-400 text-sm">$</span><input type="text" value={poolAmount} onChange={(e) => setPoolAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" /></div></div>
              <div className="pt-4 border-t border-neutral-200"><h3 className="text-xs font-semibold text-neutral-700 mb-3 uppercase">Active Upline Count per Level</h3><div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">L1 (30%)</span><input type="text" value={activeL1} onChange={(e) => setActiveL1(e.target.value.replace(/[^0-9]/g, ''))} className="w-20 px-3 py-1 border border-neutral-300 rounded-small text-sm text-right focus:border-primary-500 outline-none" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">L2 (25%)</span><input type="text" value={activeL2} onChange={(e) => setActiveL2(e.target.value.replace(/[^0-9]/g, ''))} className="w-20 px-3 py-1 border border-neutral-300 rounded-small text-sm text-right focus:border-primary-500 outline-none" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">L3 (20%)</span><input type="text" value={activeL3} onChange={(e) => setActiveL3(e.target.value.replace(/[^0-9]/g, ''))} className="w-20 px-3 py-1 border border-neutral-300 rounded-small text-sm text-right focus:border-primary-500 outline-none" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">L4 (15%)</span><input type="text" value={activeL4} onChange={(e) => setActiveL4(e.target.value.replace(/[^0-9]/g, ''))} className="w-20 px-3 py-1 border border-neutral-300 rounded-small text-sm text-right focus:border-primary-500 outline-none" /></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700">L5 (10%)</span><input type="text" value={activeL5} onChange={(e) => setActiveL5(e.target.value.replace(/[^0-9]/g, ''))} className="w-20 px-3 py-1 border border-neutral-300 rounded-small text-sm text-right focus:border-primary-500 outline-none" /></div>
              </div></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary-50 rounded-large border border-primary-200 p-6">
              <div className="text-xs font-semibold text-primary-700 uppercase mb-2">Total Pool</div>
              <div className="text-4xl font-bold text-primary-800">${pool.toFixed(2)}</div>
            </div>

            <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
              <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Distribution Breakdown</h2>
              <div className="space-y-3">
                {distributions.map((d, idx) => (
                  <div key={idx} className={`p-4 rounded-small border ${d.active > 0 ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{d.level}</span>
                        <span className="text-xs text-neutral-500">({(d.pct * 100).toFixed(0)}%)</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">${d.share.toFixed(2)}</span>
                    </div>
                    {d.active > 0 ? (
                      <div className="text-xs text-neutral-600">
                        {d.active} active × ${d.perPerson.toFixed(2)} each
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400">No active upline - compresses up</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
