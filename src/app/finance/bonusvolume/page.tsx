'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Bonus {
  name: string;
  triggered: boolean;
  amount: number;
  threshold: string;
}

export default function BonusVolumeCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [personalBV, setPersonalBV] = useState('250');
  const [teamBV, setTeamBV] = useState('25000');
  const [orgBV, setOrgBV] = useState('50000');
  const [retailCustomers, setRetailCustomers] = useState('5');
  const [renewalRate, setRenewalRate] = useState('85');
  const [bonuses, setBonuses] = useState<Bonus[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: dist } = await supabase
        .from('distributors')
        .select('role')
        .eq('email', user.email)
        .single();
      if (!dist || !['cfo', 'admin'].includes(dist.role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    calculateBonuses();
  }, [personalBV, teamBV, orgBV, retailCustomers, renewalRate]);

  function calculateBonuses() {
    const pbv = parseFloat(personalBV) || 0;
    const tbv = parseFloat(teamBV) || 0;
    const obv = parseFloat(orgBV) || 0;
    const retail = parseInt(retailCustomers) || 0;
    const renewal = parseFloat(renewalRate) || 0;

    const results: Bonus[] = [
      {
        name: 'CAB (Customer Acquisition Bonus)',
        triggered: retail >= 3,
        amount: retail >= 3 ? Math.min(retail, 20) * 50 : 0,
        threshold: '3+ retail customers (max 20/month)'
      },
      {
        name: 'Volume Kicker',
        triggered: pbv >= 200,
        amount: pbv >= 200 ? 100 : 0,
        threshold: 'Personal BV ≥ 200'
      },
      {
        name: 'Team Volume Bonus (TVB)',
        triggered: tbv >= 10000,
        amount: tbv >= 10000 ? Math.floor(tbv / 10000) * 250 : 0,
        threshold: 'Team BV ≥ 10,000 (per 10K block)'
      },
      {
        name: 'Personal Volume Bonus (PVB)',
        triggered: pbv >= 300,
        amount: pbv >= 300 ? 150 : 0,
        threshold: 'Personal BV ≥ 300'
      },
      {
        name: 'Retention Bonus',
        triggered: renewal >= 80,
        amount: renewal >= 80 ? 200 : 0,
        threshold: 'Renewal rate ≥ 80%'
      },
      {
        name: 'Matching Bonus',
        triggered: obv >= 100000,
        amount: obv >= 100000 ? 500 : 0,
        threshold: 'Org BV ≥ 100,000'
      },
      {
        name: 'Check Match',
        triggered: obv >= 250000,
        amount: obv >= 250000 ? 1000 : 0,
        threshold: 'Org BV ≥ 250,000'
      },
      {
        name: 'Gold Accelerator',
        triggered: tbv >= 10000 && pbv >= 200,
        amount: tbv >= 10000 && pbv >= 200 ? 3467 : 0,
        threshold: 'One-time Gold rank achievement'
      }
    ];

    setBonuses(results);
  }

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const triggeredCount = bonuses.filter(b => b.triggered).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-primary-800 font-bold text-xl">A</div>
            <div>
              <h1 className="font-heading text-lg font-bold">Apex Finance & Analytics Suite</h1>
              <div className="text-xs text-primary-200 font-mono">INTERNAL USE ONLY • V 2.4.1</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/finance/weighting" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">⚖️ Weighting</Link>
            <Link href="/finance/waterfall" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">💧 Waterfall</Link>
            <Link href="/finance/bonusvolume" className="px-3 py-1.5 bg-primary-700 border border-primary-500 text-white text-xs font-semibold rounded-small">🎯 BV & Bonus</Link>
            <Link href="/finance/bonuspool" className="px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">🏊 Bonus Pool</Link>
          </nav>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/finance" className="text-xs font-semibold text-neutral-400 uppercase hover:text-primary-700">← Finance</Link>
          <h1 className="font-heading font-bold text-gray-900 text-2xl mt-1">BV & Bonus Trigger Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Shows which bonuses trigger at any given BV level</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Input Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Personal BV</label>
                <input type="text" value={personalBV} onChange={(e) => setPersonalBV(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Team BV</label>
                <input type="text" value={teamBV} onChange={(e) => setTeamBV(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Org BV</label>
                <input type="text" value={orgBV} onChange={(e) => setOrgBV(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Retail Customers</label>
                <input type="text" value={retailCustomers} onChange={(e) => setRetailCustomers(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Renewal Rate (%)</label>
                <input type="text" value={renewalRate} onChange={(e) => setRenewalRate(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-primary-50 rounded-large border border-primary-200 p-6">
              <div className="text-xs font-semibold text-primary-700 uppercase mb-2">Total Bonuses Qualified</div>
              <div className="text-4xl font-bold text-primary-800">${totalBonuses.toLocaleString()}</div>
              <div className="text-sm text-primary-600 mt-2">{triggeredCount} of {bonuses.length} bonuses triggered</div>
            </div>

            <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
              <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Bonus Breakdown</h2>
              <div className="space-y-3">
                {bonuses.map((bonus, idx) => (
                  <div key={idx} className={`p-4 rounded-small border ${bonus.triggered ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bonus.triggered ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-600'}`}>
                          {bonus.triggered ? '✓' : '×'}
                        </div>
                        <span className="font-semibold text-sm text-gray-800">{bonus.name}</span>
                      </div>
                      <span className={`text-lg font-bold ${bonus.triggered ? 'text-green-700' : 'text-neutral-400'}`}>
                        ${bonus.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 ml-8">{bonus.threshold}</div>
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
