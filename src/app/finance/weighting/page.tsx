'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function WeightingCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [productType, setProductType] = useState('life');
  const [premiumAmount, setPremiumAmount] = useState('10000');
  const [weightedBV, setWeightedBV] = useState(0);

  // Weighting rates from BRAIN.md
  const weightingRates: Record<string, { rate: number; label: string }> = {
    life: { rate: 1.00, label: 'Life Insurance' },
    annuity: { rate: 0.04, label: 'Annuities' },
    disability: { rate: 0.50, label: 'Disability' },
    ltc: { rate: 0.50, label: 'Long-Term Care' },
    saas: { rate: 0.30, label: 'SaaS Products (25-33% configurable)' },
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: distributor } = await supabase
        .from('distributors')
        .select('role')
        .eq('email', user.email)
        .single();

      if (!distributor || !['cfo', 'admin'].includes(distributor.role)) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    calculate();
  }, [productType, premiumAmount]);

  function calculate() {
    const premium = parseFloat(premiumAmount) || 0;
    const rate = weightingRates[productType].rate;
    setWeightedBV(premium * rate);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Header */}
      <header className="bg-primary-800 text-white shadow-lg z-50 sticky top-0">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-primary-800 font-bold text-xl">
              A
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold tracking-tight leading-tight">Apex Finance & Analytics Suite</h1>
              <div className="text-xs text-primary-200 font-mono">INTERNAL USE ONLY • V 2.4.1</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/finance/weighting" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 border border-primary-500 text-white text-xs font-semibold rounded-small">
              ⚖️ Prod. Credit Weighting
            </Link>
            <Link href="/finance/waterfall" className="flex items-center gap-1.5 px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">
              💧 Waterfall Revenue
            </Link>
            <Link href="/finance/bonusvolume" className="flex items-center gap-1.5 px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">
              🎯 BV & Bonus
            </Link>
            <Link href="/finance/bonuspool" className="flex items-center gap-1.5 px-3 py-1.5 text-primary-200 hover:text-white hover:bg-primary-700 text-xs font-medium rounded-small transition-colors">
              🏊 Bonus Pool
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/finance" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-primary-700">Finance</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Production Credit Weighting</span>
          </div>
          <h1 className="font-heading font-bold text-gray-900 text-2xl">Production Credit Weighting Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate how much production credit each product type receives toward rank qualification</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Input Panel */}
          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Input Parameters</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full text-sm border border-neutral-300 rounded-small bg-white text-gray-800 px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {Object.entries(weightingRates).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Premium Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400 text-sm">$</span>
                  <input
                    type="text"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-small text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Weighting Rate</span>
                  <span className="text-lg font-bold text-primary-800">{(weightingRates[productType].rate * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${weightingRates[productType].rate * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Weighted Production Credit</h2>

            <div className="space-y-6">
              <div className="bg-primary-50 rounded-large p-6 border border-primary-200">
                <div className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">Weighted BV</div>
                <div className="text-4xl font-bold text-primary-800">${weightedBV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-gray-700 text-sm">Calculation Breakdown</h3>

                <div className="bg-neutral-50 rounded-small p-3 border border-neutral-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-neutral-600">Premium Amount</span>
                    <span className="text-sm font-semibold text-neutral-800">${parseFloat(premiumAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-neutral-600">Weighting Rate</span>
                    <span className="text-sm font-semibold text-neutral-800">{(weightingRates[productType].rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-primary-700 uppercase">Weighted BV</span>
                    <span className="text-sm font-bold text-primary-800">${weightedBV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-small border border-neutral-200">
                  <strong>Note:</strong> This weighted BV counts toward rank qualification thresholds. Different product types contribute at different rates based on profitability and strategic value.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Weighting Rate Reference Table */}
        <div className="mt-6 bg-white rounded-large shadow-custom border border-neutral-200 p-6">
          <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Weighting Rate Reference</h2>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Product Type</th>
                <th className="px-4 py-2 text-right text-xs font-bold text-neutral-500 uppercase tracking-wide">Weighting Rate</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">Life Insurance</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">100%</td>
                <td className="px-4 py-3 text-xs text-neutral-600">Full credit - strategic product</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">Annuities</td>
                <td className="px-4 py-3 text-right font-bold text-amber-700">4%</td>
                <td className="px-4 py-3 text-xs text-neutral-600">Lower margin product</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">Disability</td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">50%</td>
                <td className="px-4 py-3 text-xs text-neutral-600">Moderate margin</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">Long-Term Care</td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">50%</td>
                <td className="px-4 py-3 text-xs text-neutral-600">Moderate margin</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">SaaS Products</td>
                <td className="px-4 py-3 text-right font-bold text-purple-700">30%</td>
                <td className="px-4 py-3 text-xs text-neutral-600">25-33% range (pending Bill confirmation)</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
