'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface WaterfallBreakdown {
  grossAmount: number;
  botmakers: number;
  adjGross: number;
  bonusPool: number;
  afterPool: number;
  apex: number;
  field: number;
  seller: number;
  override: number;
}

export default function WaterfallCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [grossAmount, setGrossAmount] = useState('100');
  const [productType, setProductType] = useState('member');
  const [breakdown, setBreakdown] = useState<WaterfallBreakdown | null>(null);

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
  }, [grossAmount, productType]);

  function calculate() {
    const gross = parseFloat(grossAmount) || 0;

    // V7 Waterfall Formula with proper rounding
    const botmakers = Math.floor(gross * 0.30 * 100) / 100;
    const adjGross = gross - botmakers;
    const bonusPool = Math.round(adjGross * 0.05 * 100) / 100;
    const afterPool = adjGross - bonusPool;
    const apex = Math.floor(afterPool * 0.30 * 100) / 100;
    const field = afterPool - apex;
    const seller = Math.round(field * 0.60 * 100) / 100;
    const override = Math.round(field * 0.40 * 100) / 100;

    setBreakdown({
      grossAmount: gross,
      botmakers,
      adjGross,
      bonusPool,
      afterPool,
      apex,
      field,
      seller,
      override,
    });
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
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-800 rounded-small flex items-center justify-center">
            <span className="text-white text-xs font-heading font-bold">WR</span>
          </div>
          <span className="font-heading font-bold text-gray-900 text-base tracking-tight">WaterfallCFO</span>
          <span className="text-gray-300 text-lg">|</span>
          <nav className="flex items-center gap-1">
            <Link href="/finance/waterfall" className="px-3 py-1.5 text-xs font-heading font-semibold text-primary-700 bg-primary-50 rounded-small border border-primary-200">
              Revenue Calculator
            </Link>
            <Link href="/finance" className="px-3 py-1.5 text-xs font-heading font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-small">
              Finance Home
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Live Calculator</span>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <h1 className="font-heading font-bold text-gray-900 text-lg">Waterfall Revenue Calculator</h1>
        <p className="text-xs text-gray-500 mt-0.5">Model revenue distribution across all tiers — real-time CFO pro forma</p>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-140px)]">

        {/* Left Panel: Inputs */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-heading font-semibold text-gray-800 text-sm">Input Parameters</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure your revenue model</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            <div>
              <label className="block text-xs font-heading font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Product Type</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-small bg-white text-gray-800 px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
              >
                <option value="member">Member Price</option>
                <option value="retail">Retail Price</option>
                <option value="business_center">Business Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Gross Revenue Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input
                  type="text"
                  value={grossAmount}
                  onChange={(e) => setGrossAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-small text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-xs font-heading font-semibold text-gray-700 mb-2 uppercase tracking-wide">V7 Waterfall Rules</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• BotMakers: FLOOR(Gross × 30%)</li>
                <li>• Bonus Pool: ROUND(AdjGross × 5%)</li>
                <li>• Apex: FLOOR(AfterPool × 30%)</li>
                <li>• Seller: ROUND(Field × 60%)</li>
                <li>• Override: ROUND(Field × 40%)</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Right Panel: Results */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-50">
          <div className="max-w-4xl">
            <h2 className="font-heading font-bold text-gray-900 text-xl mb-6">Waterfall Breakdown</h2>

            {breakdown && (
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white rounded-large border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-800 text-white text-xs flex items-center justify-center font-bold">1</div>
                      <h3 className="font-heading font-semibold text-gray-800">Gross Revenue</h3>
                    </div>
                    <span className="text-xl font-bold text-gray-900">${breakdown.grossAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Starting amount before any splits</p>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-large border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-800 text-white text-xs flex items-center justify-center font-bold">2</div>
                      <h3 className="font-heading font-semibold text-gray-800">BotMakers Fee (30% FLOOR)</h3>
                    </div>
                    <span className="text-xl font-bold text-secondary-600">-${breakdown.botmakers.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">FLOOR({breakdown.grossAmount.toFixed(2)} × 0.30) = ${breakdown.botmakers.toFixed(2)}</p>
                </div>

                {/* Step 3 */}
                <div className="bg-primary-50 rounded-large border border-primary-200 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-primary-800">Adjusted Gross</span>
                    <span className="text-xl font-bold text-primary-800">${breakdown.adjGross.toFixed(2)}</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-large border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-800 text-white text-xs flex items-center justify-center font-bold">3</div>
                      <h3 className="font-heading font-semibold text-gray-800">Bonus Pool (5% ROUND)</h3>
                    </div>
                    <span className="text-xl font-bold text-secondary-600">-${breakdown.bonusPool.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">ROUND({breakdown.adjGross.toFixed(2)} × 0.05, 2) = ${breakdown.bonusPool.toFixed(2)}</p>
                </div>

                {/* Step 5 */}
                <div className="bg-primary-50 rounded-large border border-primary-200 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-primary-800">After Pool</span>
                    <span className="text-xl font-bold text-primary-800">${breakdown.afterPool.toFixed(2)}</span>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-white rounded-large border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-800 text-white text-xs flex items-center justify-center font-bold">4</div>
                      <h3 className="font-heading font-semibold text-gray-800">Apex Margin (30% FLOOR)</h3>
                    </div>
                    <span className="text-xl font-bold text-secondary-600">-${breakdown.apex.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">FLOOR({breakdown.afterPool.toFixed(2)} × 0.30) = ${breakdown.apex.toFixed(2)}</p>
                </div>

                {/* Step 7 */}
                <div className="bg-primary-50 rounded-large border border-primary-200 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-primary-800">Field Remainder</span>
                    <span className="text-xl font-bold text-primary-800">${breakdown.field.toFixed(2)}</span>
                  </div>
                </div>

                {/* Final Split */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-large border border-green-200 p-5">
                    <div className="text-xs font-semibold text-green-700 uppercase mb-1">Seller Commission (60%)</div>
                    <div className="text-2xl font-bold text-green-800">${breakdown.seller.toFixed(2)}</div>
                    <p className="text-xs text-green-600 mt-1 font-mono">ROUND({breakdown.field.toFixed(2)} × 0.60, 2)</p>
                  </div>
                  <div className="bg-blue-50 rounded-large border border-blue-200 p-5">
                    <div className="text-xs font-semibold text-blue-700 uppercase mb-1">Override Pool (40%)</div>
                    <div className="text-2xl font-bold text-blue-800">${breakdown.override.toFixed(2)}</div>
                    <p className="text-xs text-blue-600 mt-1 font-mono">ROUND({breakdown.field.toFixed(2)} × 0.40, 2)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
