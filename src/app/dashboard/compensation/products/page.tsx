'use client';

// =============================================
// Products & Production Credits
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md Section 2
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const products = [
  {
    name: 'PulseGuard',
    memberPrice: 59,
    retailPrice: 79,
    creditPercent: 30,
    memberCredits: 18,
    retailCredits: 24,
    description: 'Entry-level monitoring and alert system',
    features: ['Basic monitoring', 'Email alerts', 'Mobile notifications', 'Monthly reports'],
  },
  {
    name: 'PulseFlow',
    memberPrice: 129,
    retailPrice: 149,
    creditPercent: 50,
    memberCredits: 65,
    retailCredits: 75,
    description: 'Advanced workflow automation and analytics',
    features: ['Advanced automation', 'Real-time analytics', 'Custom workflows', 'API access'],
  },
  {
    name: 'PulseDrive',
    memberPrice: 219,
    retailPrice: 299,
    creditPercent: 100,
    memberCredits: 219,
    retailCredits: 299,
    description: 'Premium business intelligence platform',
    features: ['Full BI suite', 'Predictive analytics', 'White-label options', 'Priority support'],
  },
  {
    name: 'PulseCommand',
    memberPrice: 349,
    retailPrice: 499,
    creditPercent: 100,
    memberCredits: 349,
    retailCredits: 499,
    description: 'Enterprise command center solution',
    features: ['Enterprise features', 'Unlimited users', 'Custom integrations', 'Dedicated support'],
  },
  {
    name: 'SmartLook',
    memberPrice: 99,
    retailPrice: 99,
    creditPercent: 40,
    memberCredits: 40,
    retailCredits: 40,
    description: 'Visual intelligence and monitoring tool',
    features: ['Visual monitoring', 'Smart notifications', 'Multi-device sync', 'Cloud storage'],
  },
  {
    name: 'Business Center',
    memberPrice: 39,
    retailPrice: null,
    creditPercent: null,
    memberCredits: 39,
    retailCredits: null,
    description: 'Essential business tools and resources',
    features: ['Marketing materials', 'Training resources', 'Replicated website', 'Lead management'],
    special: true,
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

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
          <h1 className="text-4xl font-bold mb-4">Products & Production Credits</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Understand our product lineup, pricing structure, and how production credits are calculated for rank advancement and qualification.
          </p>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Production Credits Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Credit Calculation</h3>
              <p className="text-slate-700 mb-4">
                Production credits are calculated as a percentage of the product price. Higher-tier products generate
                more credits per dollar spent.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="font-mono text-sm text-slate-700">
                  <div>Credits = Price × Credit %</div>
                  <div className="mt-2 text-xs text-slate-600">
                    Example: PulseFlow at $149 (retail)<br />
                    149 × 50% = 75 credits
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Credit Types</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Personal Credits:</strong> Your own sales (used for personal credit requirement)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Group Credits:</strong> Total organization sales including yours (used for group credit requirement)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Credit-Based System</h3>
                <p className="text-amber-800 text-sm">
                  Rank advancement is based solely on production credits, not account counts. This ensures quality over quantity
                  and rewards actual product movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Product Lineup</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
                product.special
                  ? 'border-amber-400'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              {product.special && (
                <div className="bg-amber-400 text-amber-900 text-center py-1 px-4 text-xs font-bold">
                  SPECIAL PRICING
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{product.description}</p>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Member Price</div>
                      <div className="text-2xl font-bold text-slate-900">
                        ${product.memberPrice}
                      </div>
                    </div>
                    {product.retailPrice && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Retail Price</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${product.retailPrice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credits */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  {product.creditPercent !== null ? (
                    <>
                      <div className="text-sm text-slate-600 mb-2">
                        Credit Rate: <strong>{product.creditPercent}%</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-slate-500">Member</div>
                          <div className="font-bold text-slate-900">{product.memberCredits} credits</div>
                        </div>
                        {product.retailCredits && (
                          <div>
                            <div className="text-slate-500">Retail</div>
                            <div className="font-bold text-slate-900">{product.retailCredits} credits</div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-600">
                      Fixed: <strong>{product.memberCredits} credits</strong>
                    </div>
                  )}
                </div>

                {/* Features */}
                <button
                  onClick={() => setSelectedProduct(selectedProduct === index ? null : index)}
                  className="w-full text-left text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between"
                >
                  <span>View Features</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${selectedProduct === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedProduct === index && (
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Business Center Explanation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Business Center - Special Pricing Structure</h2>
          <p className="text-slate-700 mb-6">
            The Business Center operates on a fixed pricing structure, not the standard commission waterfall. This ensures
            predictable costs for essential business tools.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-3xl font-bold text-green-700">$10</div>
              <div className="text-sm text-slate-700 font-semibold">Your Commission</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-700">$8</div>
              <div className="text-sm text-slate-700 font-semibold">Sponsor Bonus</div>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <strong>Note:</strong> Business Center does not contribute to override pools or bonus pools. It provides
              fixed dollar amounts to seller and sponsor only.
            </p>
          </div>
        </div>
      </div>

      {/* Earning Examples */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Credit Examples by Product Tier</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Scenario 1: Bronze Rank (150 personal credits needed)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option A: Entry Level</div>
                  <div className="text-sm text-slate-700">
                    7 × PulseGuard (retail) = 7 × 24 = <strong>168 credits</strong>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option B: Mid Tier</div>
                  <div className="text-sm text-slate-700">
                    3 × PulseFlow (member) = 3 × 65 = <strong>195 credits</strong>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option C: Premium</div>
                  <div className="text-sm text-slate-700">
                    1 × SmartLook + 1 × PulseFlow = 40 + 65 = <strong>105 credits</strong><br />
                    <span className="text-xs text-slate-500">(need 1 more sale)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Scenario 2: Silver Rank (500 personal credits needed)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option A: Volume</div>
                  <div className="text-sm text-slate-700">
                    21 × PulseGuard (retail) = 21 × 24 = <strong>504 credits</strong>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option B: Mixed</div>
                  <div className="text-sm text-slate-700">
                    4 × PulseFlow (retail) + 5 × PulseGuard = 300 + 120 = <strong>420 credits</strong><br />
                    <span className="text-xs text-slate-500">(need 2 more sales)</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-semibold text-slate-900 mb-2">Option C: Premium</div>
                  <div className="text-sm text-slate-700">
                    2 × PulseDrive (member) = 2 × 219 = <strong>438 credits</strong><br />
                    <span className="text-xs text-slate-500">(need 1 more sale)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Understanding Credits is Key to Growth</h2>
          <p className="text-xl text-slate-200 mb-8">
            Production credits drive rank advancement and override qualification. Choose product combinations that align
            with your customers' needs while building toward your rank goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/tech-ladder"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              View Tech Ladder Ranks
            </Link>
            <Link
              href="/dashboard/compensation/commissions"
              className="bg-slate-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              Learn About Commissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
