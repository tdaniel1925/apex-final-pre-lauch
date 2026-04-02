'use client';

// =============================================
// Compensation Plan Overview - Dual Ladder System
// Professional layout with Mermaid diagrams
// Updated: BV (Business Volume) terminology
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const compensationSections = [
  {
    id: 'tech-ladder',
    title: 'Technology Ladder',
    subtitle: '9 Ranks • BV-Based Advancement',
    description: 'Build your income through technology product sales and team development. Advance through 9 ranks from Starter to Elite based on personal and group Business Volume (BV).',
    href: '/dashboard/compensation/tech-ladder',
    category: 'Dual Ladder System',
  },
  {
    id: 'insurance-ladder',
    title: 'Insurance Ladder',
    subtitle: 'Licensed Agents Only • 6 Ranks + MGA Tiers',
    description: 'Licensed insurance agents can build a separate income stream through insurance sales. Advance from Pre-Associate to Premier MGA with generational overrides.',
    href: '/dashboard/compensation/insurance-ladder',
    category: 'Dual Ladder System',
  },
  {
    id: 'products',
    title: 'Products & BV',
    subtitle: '6 Products • Member & Retail Pricing',
    description: 'Understand our product lineup, pricing structure, and how Business Volume (BV) is calculated for rank advancement and qualification.',
    href: '/dashboard/compensation/products',
    category: 'Core Concepts',
  },
  {
    id: 'commissions',
    title: 'Direct Commissions',
    subtitle: '27.9% Effective Commission Rate',
    description: 'Earn immediate commissions on every sale. All reps earn the same percentage regardless of rank. Business Center has a fixed $10 payout.',
    href: '/dashboard/compensation/commissions',
    category: 'Core Concepts',
  },
  {
    id: 'overrides',
    title: 'Override Bonuses',
    subtitle: 'Ranked System • 5 Levels Deep',
    description: 'Earn override bonuses on your organization\'s sales. Higher ranks unlock more levels and higher percentages. Enroller Override Rule always pays L1 rate.',
    href: '/dashboard/compensation/overrides',
    category: 'Team Building',
  },
  {
    id: 'rank-bonuses',
    title: 'Rank Advancement Bonuses',
    subtitle: 'One-Time Payments • $250 to $30,000',
    description: 'Receive one-time cash bonuses when you achieve each new rank. Total potential: $93,750 from Starter to Elite on Tech Ladder.',
    href: '/dashboard/compensation/rank-bonuses',
    category: 'Incentives',
  },
  {
    id: 'bonus-pool',
    title: 'Bonus Pool Programs',
    subtitle: 'Trip Incentives • Car Bonuses • Fast Start',
    description: 'Includes trip incentives, fast start bonuses, car allowances, quarterly contests, and enhanced rank bonuses for high performers.',
    href: '/dashboard/compensation/bonus-pool',
    category: 'Incentives',
  },
  {
    id: 'leadership-pool',
    title: 'Leadership Pool',
    subtitle: '1,000 Shares • Exclusive Program',
    description: 'Exclusive pool for early leaders. 1,000 total shares allocated during pre-launch through Year 1. Vesting schedules and rank requirements apply.',
    href: '/dashboard/compensation/leadership-pool',
    category: 'Leadership',
  },
];

const categories = [
  'All',
  'Dual Ladder System',
  'Core Concepts',
  'Team Building',
  'Incentives',
  'Leadership',
];

export default function CompensationOverviewPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Load Mermaid dynamically
    const loadMermaid = async () => {
      if (typeof window !== 'undefined') {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          themeVariables: {
            primaryColor: '#1e40af',
            primaryTextColor: '#fff',
            primaryBorderColor: '#1e3a8a',
            lineColor: '#475569',
            secondaryColor: '#3b82f6',
            tertiaryColor: '#60a5fa',
          }
        });
        mermaid.contentLoaded();
      }
    };
    if (isAuthenticated) {
      loadMermaid();
    }
  }, [isAuthenticated]);

  const filteredSections = compensationSections.filter((section) => {
    const matchesSearch =
      searchQuery === '' ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || section.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Header - Solid Blue */}
      <div className="bg-[#1e40af] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Compensation Plan</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-6">
              Our dual-ladder compensation system provides multiple pathways to financial success.
              Build income through technology products, insurance sales, or both.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/compensation/calculator"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1e40af] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Earnings Calculator
              </Link>
              <Link
                href="/dashboard/compensation/glossary"
                className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border-2 border-blue-600"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Compensation Glossary
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">27.9%</div>
            <div className="text-sm text-slate-600 font-medium">Direct Commission Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">9</div>
            <div className="text-sm text-slate-600 font-medium">Tech Ladder Ranks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">5</div>
            <div className="text-sm text-slate-600 font-medium">Override Levels</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 mb-2">$93K</div>
            <div className="text-sm text-slate-600 font-medium">Total Rank Bonuses</div>
          </div>
        </div>
      </div>

      {/* Mermaid Diagram Section - Dual Ladder Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Dual-Ladder System Overview</h2>
          <div className="overflow-x-auto">
            <div className="mermaid">
{`graph TB
    subgraph "Technology Ladder"
        A[Starter<br/>100 Personal BV<br/>400 Group BV] --> B[Builder<br/>250 Personal BV<br/>1,000 Group BV]
        B --> C[Leader<br/>500 Personal BV<br/>2,500 Group BV]
        C --> D[Manager<br/>750 Personal BV<br/>5,000 Group BV]
        D --> E[Director<br/>1,000 Personal BV<br/>10,000 Group BV]
        E --> F[Executive<br/>1,500 Personal BV<br/>25,000 Group BV]
        F --> G[Senior Executive<br/>2,000 Personal BV<br/>50,000 Group BV]
        G --> H[Premier<br/>2,500 Personal BV<br/>100,000 Group BV]
        H --> I[Elite<br/>3,000 Personal BV<br/>250,000 Group BV]
    end

    subgraph "Insurance Ladder"
        J[Pre-Associate<br/>Licensed Agent] --> K[Associate<br/>$500 Personal AP]
        K --> L[Senior Associate<br/>$1,000 Personal AP]
        L --> M[Premier Associate<br/>$2,000 Personal AP]
        M --> N[MGA<br/>$3,000 Personal AP]
        N --> O[Senior MGA<br/>$5,000 Personal AP]
        O --> P[Premier MGA<br/>$10,000 Personal AP]
    end

    style A fill:#1e40af,stroke:#1e3a8a,color:#fff
    style B fill:#1e40af,stroke:#1e3a8a,color:#fff
    style C fill:#1e40af,stroke:#1e3a8a,color:#fff
    style D fill:#1e40af,stroke:#1e3a8a,color:#fff
    style E fill:#1e40af,stroke:#1e3a8a,color:#fff
    style F fill:#1e40af,stroke:#1e3a8a,color:#fff
    style G fill:#1e40af,stroke:#1e3a8a,color:#fff
    style H fill:#1e40af,stroke:#1e3a8a,color:#fff
    style I fill:#1e40af,stroke:#1e3a8a,color:#fff
    style J fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#3b82f6,stroke:#2563eb,color:#fff
    style L fill:#3b82f6,stroke:#2563eb,color:#fff
    style M fill:#3b82f6,stroke:#2563eb,color:#fff
    style N fill:#3b82f6,stroke:#2563eb,color:#fff
    style O fill:#3b82f6,stroke:#2563eb,color:#fff
    style P fill:#3b82f6,stroke:#2563eb,color:#fff`}
            </div>
          </div>
          <p className="text-sm text-slate-600 text-center mt-6">
            <strong>BV = Business Volume</strong> (Tech products) • <strong>AP = Annualized Premium</strong> (Insurance sales)
          </p>
        </div>
      </div>

      {/* Mermaid Diagram - Commission Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How Compensation Flows</h2>
          <div className="overflow-x-auto">
            <div className="mermaid">
{`graph LR
    A[Product Sale] --> B[Direct Commission<br/>27.9% to Seller]
    A --> C[Override Pool<br/>L1-L5 Upline]
    A --> D[Bonus Pool<br/>Trips, Cars, Contests]
    A --> E[Leadership Pool<br/>Early Leaders Only]

    B --> F[Immediate Payout]
    C --> G[Rank-Based Payouts]
    D --> H[Trip & Car Incentives]
    E --> I[Share-Based Payouts]

    style A fill:#1e40af,stroke:#1e3a8a,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style D fill:#3b82f6,stroke:#2563eb,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style F fill:#60a5fa,stroke:#3b82f6,color:#fff
    style G fill:#60a5fa,stroke:#3b82f6,color:#fff
    style H fill:#60a5fa,stroke:#3b82f6,color:#fff
    style I fill:#60a5fa,stroke:#3b82f6,color:#fff`}
            </div>
          </div>
        </div>
      </div>

      {/* Mermaid Diagram - Override Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">5-Level Override Structure</h2>
          <div className="overflow-x-auto">
            <div className="mermaid">
{`graph TD
    A[You: Make a Sale] --> B[L1: Your Sponsor<br/>30% Override]
    B --> C[L2: Matrix Parent<br/>10-20% Override]
    C --> D[L3: Matrix Grandparent<br/>5-15% Override]
    D --> E[L4: Matrix Great-Grandparent<br/>5-10% Override]
    E --> F[L5: Matrix G-G-Grandparent<br/>5% Override]

    style A fill:#1e40af,stroke:#1e3a8a,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style D fill:#3b82f6,stroke:#2563eb,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style F fill:#3b82f6,stroke:#2563eb,color:#fff`}
            </div>
          </div>
          <div className="mt-6 bg-blue-50 border-l-4 border-[#1e40af] p-4">
            <p className="text-sm text-slate-700">
              <strong>Key Rule:</strong> L1 override (30%) always goes to your enrollment sponsor, regardless of matrix placement.
              L2-L5 overrides follow the matrix tree (5×7 forced matrix structure).
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search compensation topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[#1e40af] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <div className="mt-3 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredSections.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{compensationSections.length}</span> sections
            {(searchQuery || activeCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="ml-3 text-[#1e40af] hover:text-blue-800 font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section) => (
              <Link key={section.id} href={section.href} className="group block">
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#1e40af] h-full">
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-[#1e40af] text-xs font-semibold rounded-full">
                        {section.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1e40af] transition-colors">
                      {section.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sm font-medium text-slate-600 mb-3">
                      {section.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {section.description}
                    </p>

                    {/* Learn More Link */}
                    <div className="flex items-center text-[#1e40af] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Learn More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Border Accent */}
                  <div className="h-1 bg-[#1e40af]" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No sections found</h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="bg-[#1e40af] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section - Solid Blue */}
      <div className="bg-[#1e40af] text-white py-16 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Income?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Use our calculator to estimate your potential earnings, or explore each section to understand how our compensation plan works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-white text-[#1e40af] px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
            >
              Calculate My Potential
            </Link>
            <Link
              href="/dashboard/team"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors border-2 border-blue-600"
            >
              View My Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
