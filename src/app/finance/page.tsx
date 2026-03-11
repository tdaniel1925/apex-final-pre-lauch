'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function FinanceHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [promotionFundBalance, setPromotionFundBalance] = useState(0);
  const [priceMismatchProducts, setPriceMismatchProducts] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: distributor } = await supabase
        .from('distributors')
        .select('role')
        .eq('email', authUser.email)
        .single();

      if (!distributor || !['cfo', 'admin'].includes(distributor.role)) {
        router.push('/dashboard');
        return;
      }

      setUser({ id: authUser.id, email: authUser.email || '' });

      // Fetch promotion fund balance
      const { data: fundBalance } = await supabase.rpc('get_promotion_fund_balance');
      if (fundBalance) {
        setPromotionFundBalance(fundBalance);
      }

      // Check for price mismatches
      const { data: mismatchedProducts } = await supabase
        .from('products')
        .select('name, stripe_product_id')
        .eq('price_sync_status', 'mismatch');

      if (mismatchedProducts) {
        setPriceMismatchProducts(mismatchedProducts);
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  const tools = [
    {
      title: 'Production Credit Weighting',
      description: 'Calculate how much production credit each product type gets toward rank qualification',
      route: '/finance/weighting',
      icon: '⚖️',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'Waterfall Revenue Calculator',
      description: 'Run V7 waterfall formula on any gross revenue amount with line-by-line breakdown',
      route: '/finance/waterfall',
      icon: '💧',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'BV & Bonus Trigger Calculator',
      description: 'Shows which bonuses trigger at any given BV level across all 8 bonus types',
      route: '/finance/bonusvolume',
      icon: '🎯',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'Bonus Pool Allocation Engine',
      description: 'Shows how override pool distributes across active upline levels with compression rules',
      route: '/finance/bonuspool',
      icon: '🏊',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'Rank Promotion Pro Forma',
      description: 'Projects commission payout changes when a rep promotes to the next rank',
      route: '/finance/rankpromo',
      icon: '📈',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'Product Pricing & Margin Calculator',
      description: 'Shows margin breakdown for any product using V7 waterfall formula',
      route: '/finance/pricing',
      icon: '💰',
      lastModified: 'System Default',
      category: 'Calculators'
    },
    {
      title: 'Commission Run Pre-Simulation',
      description: 'Simulate a commission run before execution - shows projected payouts for all reps',
      route: '/finance/commrun',
      icon: '🎬',
      lastModified: 'Updated Today',
      category: 'Commission Tools'
    },
    {
      title: 'What-If Scenarios',
      description: 'Model different pricing, commission, or rank structures to forecast impact',
      route: '/finance/scenarios',
      icon: '🔮',
      lastModified: 'System Default',
      category: 'Planning'
    },
    {
      title: 'SaaS Compensation Engine Config',
      description: 'Configure all SaaS compensation rules, ranks, overrides, and bonuses',
      route: '/finance/saas-engine',
      icon: '⚙️',
      lastModified: 'Updated Today',
      category: 'Configuration'
    },
    {
      title: 'Insurance Compensation Engine Config',
      description: 'Configure insurance compensation rules, carrier rates, and MGA structure',
      route: '/finance/insurance-engine',
      icon: '🏥',
      lastModified: 'Updated Today',
      category: 'Configuration'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-sm text-neutral-500">Loading Finance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Header */}
      <header className="bg-primary-800 text-white shadow-custom z-30 sticky top-0">
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

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm bg-primary-700 px-3 py-1.5 rounded border border-primary-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="font-mono text-primary-100">SYSTEM OPERATIONAL</span>
            </div>

            <div className="h-8 w-px bg-primary-500"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">{user?.email}</div>
                <div className="text-xs text-secondary-300 font-bold uppercase tracking-wider">Chief Financial Officer</div>
              </div>
              <div className="w-10 h-10 rounded bg-primary-900 border-2 border-secondary-600 flex items-center justify-center text-sm font-bold shadow-md">
                CFO
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Bar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="font-heading font-bold text-gray-900 text-2xl">Finance Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Apex Affinity Group • CFO Analytics & Configuration Portal</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">

        {/* Alert Cards */}
        {(promotionFundBalance > 0 || priceMismatchProducts.length > 0) && (
          <div className="mb-6 space-y-3">
            {/* Promotion Fund Balance Card */}
            {promotionFundBalance > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 mb-1">Promotion Fund Balance</p>
                  <p className="text-xl font-bold text-blue-800">${promotionFundBalance.toLocaleString()}</p>
                  <p className="text-xs text-blue-700 mt-1">Available for achievement and builder bonuses ($5 from each Business Center sale)</p>
                </div>
              </div>
            )}

            {/* Price Mismatch Alert */}
            {priceMismatchProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900 mb-1">⚠️ Stripe Price Mismatch Detected</p>
                  <p className="text-xs text-red-700 mb-2">
                    {priceMismatchProducts.length} product(s) have different prices in Supabase vs Stripe. Active subscribers will continue to be charged the Stripe price until updated.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {priceMismatchProducts.map((product, i) => (
                      <a
                        key={i}
                        href={`https://dashboard.stripe.com/products/${product.stripe_product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded border border-red-300 hover:bg-red-200"
                      >
                        {product.name} →
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculators Section */}
        <section className="mb-8">
          <h3 className="font-heading font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🧮</span>
            Financial Calculators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(t => t.category === 'Calculators').map((tool, idx) => (
              <Link key={idx} href={tool.route}>
                <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6 hover:shadow-custom-hover transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{tool.icon}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-primary-600 transition-colors">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-base mb-2">{tool.title}</h4>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{tool.lastModified}</span>
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-small font-semibold">Calculator</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Commission Tools Section */}
        <section className="mb-8">
          <h3 className="font-heading font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Commission Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(t => t.category === 'Commission Tools').map((tool, idx) => (
              <Link key={idx} href={tool.route}>
                <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6 hover:shadow-custom-hover transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{tool.icon}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-primary-600 transition-colors">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-base mb-2">{tool.title}</h4>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{tool.lastModified}</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-small font-semibold">Live Tool</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Planning Section */}
        <section className="mb-8">
          <h3 className="font-heading font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Planning & Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(t => t.category === 'Planning').map((tool, idx) => (
              <Link key={idx} href={tool.route}>
                <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6 hover:shadow-custom-hover transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{tool.icon}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-primary-600 transition-colors">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-base mb-2">{tool.title}</h4>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{tool.lastModified}</span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-small font-semibold">Planning</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Configuration Section */}
        <section className="mb-8">
          <h3 className="font-heading font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            System Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.filter(t => t.category === 'Configuration').map((tool, idx) => (
              <Link key={idx} href={tool.route}>
                <div className="bg-white rounded-large shadow-custom border border-neutral-200 p-6 hover:shadow-custom-hover transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{tool.icon}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-primary-600 transition-colors">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-base mb-2">{tool.title}</h4>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{tool.lastModified}</span>
                    <span className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded-small font-semibold">Config</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
