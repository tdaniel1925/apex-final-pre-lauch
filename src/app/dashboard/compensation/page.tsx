'use client';

// =============================================
// Compensation Plan Overview - Dual Ladder System
// Professional layout based on APEX_COMP_ENGINE_SPEC_FINAL.md
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const compensationSections = [
  {
    id: 'tech-ladder',
    title: 'Technology Ladder',
    subtitle: '9 Ranks • Credit-Based Advancement',
    description: 'Build your income through technology product sales and team development. Advance through 9 ranks from Starter to Elite based on personal and group production credits.',
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
    title: 'Products & Credits',
    subtitle: '6 Products • Member & Retail Pricing',
    description: 'Understand our product lineup, pricing structure, and how production credits are calculated for rank advancement and qualification.',
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
    description: 'Funded by 3.5% of company revenue. Includes trip incentives, fast start bonuses, car allowances, quarterly contests, and enhanced rank bonuses.',
    href: '/dashboard/compensation/bonus-pool',
    category: 'Incentives',
  },
  {
    id: 'leadership-pool',
    title: 'Leadership Pool',
    subtitle: '1,000 Shares • 1.5% of Revenue',
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
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Compensation Plan</h1>
            <p className="text-xl text-slate-200 leading-relaxed mb-6">
              Our dual-ladder compensation system provides multiple pathways to financial success.
              Build income through technology products, insurance sales, or both.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/compensation/calculator"
                className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Earnings Calculator
              </Link>
              <Link
                href="/dashboard/compensation/glossary"
                className="inline-flex items-center px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
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
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    ? 'bg-slate-900 text-white shadow-md'
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
                className="ml-3 text-slate-700 hover:text-slate-900 font-semibold"
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
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-slate-300 h-full">
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                        {section.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
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
                    <div className="flex items-center text-slate-700 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Learn More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Border Accent */}
                  <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
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
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-16 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Income?</h2>
          <p className="text-xl text-slate-200 mb-8">
            Use our calculator to estimate your potential earnings, or explore each section to understand how our compensation plan works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              Calculate My Potential
            </Link>
            <Link
              href="/dashboard/team"
              className="bg-slate-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition-colors border-2 border-slate-600"
            >
              View My Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
