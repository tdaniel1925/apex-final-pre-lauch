'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function PricingCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [product, setProduct] = useState('PULSEGUARD');
  const [priceType, setPriceType] = useState('member');
  const [volume, setVolume] = useState('100');

  const products = [
    {slug: 'PULSEGUARD', name: 'PulseGuard (formerly PulseMarket)', member: 59, retail: 79, bv: 59},
    {slug: 'PULSEFLOW', name: 'PulseFlow', member: 129, retail: 149, bv: 129},
    {slug: 'PULSEDRIVE', name: 'PulseDrive', member: 219, retail: 299, bv: 219},
    {slug: 'PULSECOMMAND', name: 'PulseCommand', member: 349, retail: 499, bv: 349},
    {slug: 'SMARTLOCK', name: 'SmartLock', member: 99, retail: 99, bv: 99},
    {slug: 'BIZCENTER', name: 'Business Center', member: 39, retail: 39, bv: 39}
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

  const selectedProduct = products.find(p => p.slug === product) || products[0];
  const price = priceType === 'member' ? selectedProduct.member : selectedProduct.retail;
  const vol = parseInt(volume) || 0;
  const gross = price * vol;

  // V7 Waterfall
  const botmakers = Math.floor(gross * 0.30 * 100) / 100;
  const adjGross = gross - botmakers;
  const bonusPool = Math.round(adjGross * 0.05 * 100) / 100;
  const afterPool = adjGross - bonusPool;
  const apex = Math.floor(afterPool * 0.30 * 100) / 100;
  const field = afterPool - apex;
  const seller = Math.round(field * 0.60 * 100) / 100;
  const override = Math.round(field * 0.40 * 100) / 100;

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
          <h1 className="font-heading font-bold text-gray-900 text-2xl mt-1">Product Pricing & Margin Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Shows margin breakdown for any product at any price point using V7 waterfall</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
            <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">Configuration</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Product</label><select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none">{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Price Type</label><select value={priceType} onChange={(e) => setPriceType(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none"><option value="member">Member Price (${selectedProduct.member})</option><option value="retail">Retail Price (${selectedProduct.retail})</option></select></div>
              <div><label className="block text-xs font-semibold text-neutral-700 mb-2 uppercase">Volume</label><input type="text" value={volume} onChange={(e) => setVolume(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-3 py-2 border border-neutral-300 rounded-small text-sm focus:border-primary-500 outline-none" /></div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase">Unit Price</span>
                <span className="text-lg font-bold text-gray-900">${price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-neutral-500 uppercase">Total Gross</span>
                <span className="text-xl font-bold text-primary-800">${gross.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6">
              <h2 className="font-heading font-semibold text-gray-800 text-lg mb-4">V7 Waterfall Margin Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-small border border-neutral-200">
                  <div><span className="text-sm font-semibold text-gray-800">Gross Revenue</span><div className="text-xs text-neutral-500">Starting amount</div></div>
                  <span className="text-lg font-bold text-gray-900">${gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary-50 rounded-small border border-secondary-200">
                  <div><span className="text-sm font-semibold text-secondary-800">BotMakers Fee (30% FLOOR)</span><div className="text-xs text-secondary-600">Tech platform fee</div></div>
                  <span className="text-lg font-bold text-secondary-700">-${botmakers.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary-50 rounded-small border border-secondary-200">
                  <div><span className="text-sm font-semibold text-secondary-800">Bonus Pool (5% ROUND)</span><div className="text-xs text-secondary-600">Leadership bonus fund</div></div>
                  <span className="text-lg font-bold text-secondary-700">-${bonusPool.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary-50 rounded-small border border-secondary-200">
                  <div><span className="text-sm font-semibold text-secondary-800">Apex Margin (30% FLOOR)</span><div className="text-xs text-secondary-600">Corporate overhead</div></div>
                  <span className="text-lg font-bold text-secondary-700">-${apex.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-small border border-primary-200">
                  <div><span className="text-sm font-semibold text-primary-800">Field Remainder</span><div className="text-xs text-primary-600">Total field compensation</div></div>
                  <span className="text-lg font-bold text-primary-800">${field.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-small border border-green-200">
                    <div className="text-xs font-semibold text-green-700 uppercase mb-1">Seller (60%)</div>
                    <div className="text-xl font-bold text-green-800">${seller.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-small border border-blue-200">
                    <div className="text-xs font-semibold text-blue-700 uppercase mb-1">Override (40%)</div>
                    <div className="text-xl font-bold text-blue-800">${override.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-large shadow-custom border border-neutral-200 p-6">
              <h3 className="font-heading font-semibold text-gray-800 mb-4">All Products - Quick Reference</h3>
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-neutral-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-neutral-500 uppercase">Member</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-neutral-500 uppercase">Retail</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-neutral-500 uppercase">BV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map(p => (
                    <tr key={p.slug} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{p.name}</td>
                      <td className="px-3 py-2 text-right text-gray-700">${p.member}</td>
                      <td className="px-3 py-2 text-right text-gray-700">${p.retail}</td>
                      <td className="px-3 py-2 text-right font-bold text-primary-800">{p.bv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
