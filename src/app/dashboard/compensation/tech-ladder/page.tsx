'use client';

// =============================================
// Technology Ladder - 9 Ranks (BV-Based)
// Based on APEX_COMP_ENGINE_SPEC_FINAL.md Section 4
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MermaidDiagram from '@/components/MermaidDiagram';

const techRanks = [
  {
    rank: 'Starter',
    level: 1,
    personalBV: 0,
    groupBV: 0,
    downlineReq: 'None',
    rankBonus: 0,
    overrideLevels: 'L1 only',
    description: 'Everyone starts here. Begin earning commissions immediately.',
    color: '#6b7280',
  },
  {
    rank: 'Bronze',
    level: 2,
    personalBV: 150,
    groupBV: 300,
    downlineReq: 'None',
    rankBonus: 250,
    overrideLevels: 'L1-L2',
    description: 'First rank achievement. Unlock L2 overrides.',
    color: '#cd7f32',
  },
  {
    rank: 'Silver',
    level: 3,
    personalBV: 500,
    groupBV: 1500,
    downlineReq: 'None',
    rankBonus: 1000,
    overrideLevels: 'L1-L3',
    description: 'Solid foundation. L3 overrides unlocked.',
    color: '#94a3b8',
  },
  {
    rank: 'Gold',
    level: 4,
    personalBV: 1200,
    groupBV: 5000,
    downlineReq: '1 Bronze (sponsored)',
    rankBonus: 3000,
    overrideLevels: 'L1-L4',
    description: 'Leadership begins. First downline requirement.',
    color: '#f59e0b',
  },
  {
    rank: 'Platinum',
    level: 5,
    personalBV: 2500,
    groupBV: 15000,
    downlineReq: '2 Silvers (sponsored)',
    rankBonus: 7500,
    overrideLevels: 'L1-L5',
    description: 'Advanced leadership. Full override depth unlocked.',
    color: '#1e40af',
  },
  {
    rank: 'Ruby',
    level: 6,
    personalBV: 4000,
    groupBV: 30000,
    downlineReq: '2 Golds (sponsored)',
    rankBonus: 12000,
    overrideLevels: 'L1-L5',
    description: 'Elite status. Building Gold leaders.',
    color: '#dc2626',
  },
  {
    rank: 'Diamond',
    level: 7,
    personalBV: 5000,
    groupBV: 50000,
    downlineReq: '3 Golds OR 2 Platinums (sponsored)',
    rankBonus: 18000,
    overrideLevels: 'L1-L5',
    description: 'Top tier. Multiple pathways to qualify.',
    color: '#0891b2',
  },
  {
    rank: 'Crown',
    level: 8,
    personalBV: 6000,
    groupBV: 75000,
    downlineReq: '2 Platinums + 1 Gold (sponsored)',
    rankBonus: 22000,
    overrideLevels: 'L1-L5',
    description: 'Near pinnacle. Building Platinum leaders.',
    color: '#7c3aed',
  },
  {
    rank: 'Elite',
    level: 9,
    personalBV: 8000,
    groupBV: 120000,
    downlineReq: '3 Platinums OR 2 Diamonds (sponsored)',
    rankBonus: 30000,
    overrideLevels: 'L1-L5 + Leadership Pool',
    description: 'Highest rank. Leadership pool access.',
    color: '#059669',
  },
];

const products = [
  { name: 'PulseMarket', price: 39, bv: 18 },
  { name: 'PulseGuard', price: 79, bv: 36 },
  { name: 'PulseFlow', price: 149, bv: 69 },
  { name: 'PulseDrive', price: 299, bv: 139 },
  { name: 'PulseCommand', price: 499, bv: 232 },
  { name: 'Business Center', price: 39, bv: 39, special: true },
];

export default function TechLadderPage() {
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

  const totalBonuses = techRanks.reduce((sum, rank) => sum + rank.rankBonus, 0);

  // Mermaid diagram for rank progression
  const rankProgressionDiagram = `
    graph LR
      A[Starter] --> B[Bronze]
      B --> C[Silver]
      C --> D[Gold]
      D --> E[Platinum]
      E --> F[Ruby]
      F --> G[Diamond]
      G --> H[Crown]
      H --> I[Elite]

      style A fill:#6b7280,stroke:#374151,stroke-width:2px,color:#fff
      style B fill:#cd7f32,stroke:#92501f,stroke-width:2px,color:#fff
      style C fill:#94a3b8,stroke:#475569,stroke-width:2px,color:#fff
      style D fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
      style E fill:#1e40af,stroke:#1e3a8a,stroke-width:3px,color:#fff
      style F fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
      style G fill:#0891b2,stroke:#0e7490,stroke-width:2px,color:#fff
      style H fill:#7c3aed,stroke:#5b21b6,stroke-width:2px,color:#fff
      style I fill:#059669,stroke:#047857,stroke-width:3px,color:#fff
  `;

  // Mermaid diagram for commission flow
  const commissionFlowDiagram = `
    graph TD
      A[Product Sale: $149] --> B[Business Volume: $69 BV]
      B --> C{Commission Split}
      C --> D[Seller: 60% of BV<br/>$41.40]
      C --> E[Enrollment Override: 30% of BV<br/>$20.70 to Sponsor]
      C --> F[Matrix Overrides: Varies by Rank<br/>Paid from 40% Override Pool]

      style A fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style B fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style C fill:#475569,stroke:#1e293b,stroke-width:2px,color:#fff
      style D fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
      style E fill:#0891b2,stroke:#0e7490,stroke-width:2px,color:#fff
      style F fill:#7c3aed,stroke:#5b21b6,stroke-width:2px,color:#fff
  `;

  // Mermaid diagram for BV examples
  const bvExamplesDiagram = `
    graph LR
      A[$39 Product] --> A1[$18 BV]
      B[$79 Product] --> B1[$36 BV]
      C[$149 Product] --> C1[$69 BV]
      D[$299 Product] --> D1[$139 BV]
      E[$499 Product] --> E1[$232 BV]

      style A fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style A1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
      style B fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style B1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
      style C fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style C1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
      style D fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style D1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
      style E fill:#1e40af,stroke:#1e3a8a,stroke-width:2px,color:#fff
      style E1 fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
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
          <h1 className="text-4xl font-bold mb-4">Technology Ladder</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Build your income through technology product sales and team development. Advance through 9 ranks based on Business Volume (BV) - not account quotas.
          </p>
        </div>
      </div>

      {/* Key Points */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">9 Ranks</div>
              <div className="text-sm text-slate-600">Starter to Elite</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">${totalBonuses.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Rank Bonuses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">BV-Based</div>
              <div className="text-sm text-slate-600">Business Volume, Not Quotas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Progression Visual */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rank Progression Path</h2>
          <MermaidDiagram chart={rankProgressionDiagram} />
        </div>
      </div>

      {/* Understanding Business Volume (BV) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Understanding Business Volume (BV)</h2>

          <div className="prose max-w-none mb-8">
            <p className="text-slate-700 text-lg leading-relaxed">
              <strong>Business Volume (BV)</strong> is the commissionable value assigned to each product. BV represents the amount used to calculate all commissions and rank qualifications. Each product has its own BV based on its price point and profit margins.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-4">Product BV Examples</h3>
          <MermaidDiagram chart={bvExamplesDiagram} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Why BV Instead of Retail Price?
              </h4>
              <p className="text-slate-700">
                BV reflects the actual commissionable value after operating costs and company margins. This ensures fair compensation across all products while maintaining business sustainability.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                How Does This Help You?
              </h4>
              <p className="text-slate-700">
                BV gives you a clear understanding of commissionable volume. Higher BV products contribute more to your rank advancement and generate larger commission pools.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Complete Product BV Table</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="text-left py-2 pr-4 font-semibold text-slate-900">Product</th>
                        <th className="text-right py-2 px-4 font-semibold text-slate-900">Price</th>
                        <th className="text-right py-2 pl-4 font-semibold text-slate-900">BV</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {products.map((product) => (
                        <tr key={product.name} className="border-b border-blue-100">
                          <td className="py-2 pr-4">
                            {product.name}
                            {product.special && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Special</span>}
                          </td>
                          <td className="text-right py-2 px-4">${product.price}</td>
                          <td className="text-right py-2 pl-4 font-semibold">${product.bv} BV</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Commissions Work (BV-Based)</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Commission Flow Example: $149 PulseFlow Sale</h3>
            <MermaidDiagram chart={commissionFlowDiagram} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h4 className="font-semibold text-slate-900">Direct Commission</h4>
              </div>
              <p className="text-slate-700 mb-2">
                <strong>60% of BV</strong> goes to the seller
              </p>
              <p className="text-sm text-slate-600">
                Example: $149 product = $69 BV<br />
                Seller earns: <strong className="text-green-700">$41.40</strong> (60% × $69)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h4 className="font-semibold text-slate-900">Enrollment Override</h4>
              </div>
              <p className="text-slate-700 mb-2">
                <strong>30% of BV</strong> goes to sponsor (L1)
              </p>
              <p className="text-sm text-slate-600">
                Example: $149 product = $69 BV<br />
                Sponsor earns: <strong className="text-blue-700">$20.70</strong> (30% × $69)
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <h4 className="font-semibold text-slate-900">Matrix Overrides</h4>
              </div>
              <p className="text-slate-700 mb-2">
                <strong>Varies by rank</strong> from 40% override pool
              </p>
              <p className="text-sm text-slate-600">
                L2-L5 earn percentages based on their rank from the remaining override pool (40% of BV)
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Real Example: Selling PulseFlow ($149)</h4>
                <p className="text-slate-700 mb-3">
                  When you sell a PulseFlow subscription for <strong>$149</strong>, here's what happens:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>You earn $41.40</strong> instantly (60% of $69 BV)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span><strong>Your sponsor earns $20.70</strong> (30% of $69 BV - Enrollment Override)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Matrix upline earns from remaining pool</strong> (based on their ranks)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-600 mr-2">✓</span>
                    <span><strong>You earn $69 BV</strong> toward rank advancement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How Rank Advancement Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Rank Advancement Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Personal BV:</strong> Monthly production from your own sales (in BV)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Group BV:</strong> Total organization BV including you and your team</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-slate-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Downline Leaders:</strong> Personally sponsored reps at specified ranks (Gold+)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Important Rules</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Promotions take effect the 1st of the following month</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>2-month grace period before demotion for missing requirements</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>New reps: 6-month rank lock on first achieved rank</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Rank bonuses paid once per lifetime (no repeat on re-qualification)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Override Qualification</h3>
            <p className="text-slate-700">
              To earn override bonuses and incentive programs, you must generate at least <strong>50 BV per month from personal sales</strong>.
              Direct commissions are always paid regardless of BV volume.
            </p>
          </div>
        </div>
      </div>

      {/* Rank Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Rank Requirements & Bonuses</h2>

        <div className="space-y-4">
          {techRanks.map((rank) => (
            <div
              key={rank.level}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-slate-300 transition-all"
            >
              <button
                onClick={() => setExpandedRank(expandedRank === rank.level ? null : rank.level)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="flex items-center justify-center w-12 h-12 text-white rounded-lg font-bold text-lg"
                    style={{ backgroundColor: rank.color }}
                  >
                    {rank.level}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{rank.rank}</h3>
                    <p className="text-sm text-slate-600 mt-1">{rank.description}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold text-slate-900">
                      {rank.rankBonus > 0 ? `$${rank.rankBonus.toLocaleString()}` : 'No Bonus'}
                    </div>
                    <div className="text-xs text-slate-600">Rank Bonus</div>
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
                      <h4 className="font-semibold text-slate-900 mb-3">Monthly Requirements</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Personal BV</span>
                          <span className="font-semibold text-slate-900">
                            {rank.personalBV.toLocaleString()} BV
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Group BV</span>
                          <span className="font-semibold text-slate-900">
                            {rank.groupBV.toLocaleString()} BV
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Downline Leaders</span>
                          <span className="font-semibold text-slate-900">{rank.downlineReq}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Benefits</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Override Levels</span>
                          <span className="font-semibold text-slate-900">{rank.overrideLevels}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">One-Time Bonus</span>
                          <span className="font-semibold text-slate-900">
                            {rank.rankBonus > 0 ? `$${rank.rankBonus.toLocaleString()}` : 'None'}
                          </span>
                        </div>
                        {rank.level >= 5 && (
                          <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Car Bonus Eligible</span>
                            <span className="font-semibold text-green-600">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {rank.level === 1 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700">
                        <strong>Everyone starts at Starter rank!</strong> You begin earning commissions immediately on your first sale. No waiting period.
                      </p>
                    </div>
                  )}

                  {rank.level === 5 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700">
                        <strong>Platinum unlocks full override depth!</strong> At Platinum, you can earn from all 5 levels in the compensation structure.
                      </p>
                    </div>
                  )}

                  {rank.level === 9 && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700">
                        <strong>Elite is the pinnacle!</strong> As an Elite distributor, you gain access to the exclusive Leadership Pool - additional bonuses from company-wide sales.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Building Your Tech Ladder Income</h2>
          <p className="text-xl text-slate-200 mb-8">
            Every rep starts at Starter rank and begins earning commissions immediately. As you grow your sales and team BV, advance through the ranks to unlock higher override levels and bonuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/products"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              View Products & BV
            </Link>
            <Link
              href="/dashboard/compensation/commissions"
              className="bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-600 transition-colors border-2 border-slate-600"
            >
              Learn About Commissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
