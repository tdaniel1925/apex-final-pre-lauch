'use client';

// =============================================
// Compensation Plan Overview
// Visual summary of all 12 commission types
// WITH SEARCH AND FILTER
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const commissionTypes = [
  {
    id: 'retail',
    name: 'Retail Commissions',
    description: 'Earn 30% profit when customers buy products through your referral link',
    icon: '🛍️',
    color: 'from-blue-500 to-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    category: 'Direct Sales',
  },
  {
    id: 'matrix',
    name: 'Matrix Commissions',
    description: 'Earn on 7 levels deep in your team structure (2% to 10% per level)',
    icon: '📊',
    color: 'from-purple-500 to-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    category: 'Team Building',
  },
  {
    id: 'matching',
    name: 'Matching Bonuses',
    description: 'Match a percentage of what your personally enrolled distributors earn',
    icon: '🎯',
    color: 'from-green-500 to-green-600',
    badgeColor: 'bg-green-100 text-green-700',
    category: 'Team Building',
  },
  {
    id: 'override',
    name: 'Override Bonuses',
    description: 'Earn overrides when you outrank people in your downline',
    icon: '👑',
    color: 'from-yellow-500 to-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    category: 'Leadership',
  },
  {
    id: 'infinity',
    name: 'Infinity Bonus',
    description: 'Earn from level 8 and beyond once you reach Diamond rank',
    icon: '♾️',
    color: 'from-indigo-500 to-indigo-600',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    category: 'Leadership',
  },
  {
    id: 'fast-start',
    name: 'Fast Start Bonuses',
    description: 'Earn $100 when you enroll someone in their first 30 days',
    icon: '⚡',
    color: 'from-orange-500 to-orange-600',
    badgeColor: 'bg-orange-100 text-orange-700',
    category: 'Quick Wins',
  },
  {
    id: 'rank-advancement',
    name: 'Rank Advancement',
    description: 'Get rewarded when you advance to a new rank ($50 to $5,000)',
    icon: '🏆',
    color: 'from-red-500 to-red-600',
    badgeColor: 'bg-red-100 text-red-700',
    category: 'Quick Wins',
  },
  {
    id: 'customer-milestones',
    name: 'Customer Milestones',
    description: 'Bonuses when your customers hit purchase milestones',
    icon: '🎁',
    color: 'from-pink-500 to-pink-600',
    badgeColor: 'bg-pink-100 text-pink-700',
    category: 'Customer Growth',
  },
  {
    id: 'customer-retention',
    name: 'Customer Retention',
    description: 'Earn when customers continue buying month after month',
    icon: '🔄',
    color: 'from-teal-500 to-teal-600',
    badgeColor: 'bg-teal-100 text-teal-700',
    category: 'Customer Growth',
  },
  {
    id: 'car',
    name: 'Car Bonus',
    description: 'Qualify for $500-$1,500/month car bonus at higher ranks',
    icon: '🚗',
    color: 'from-cyan-500 to-cyan-600',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    category: 'Lifestyle',
  },
  {
    id: 'vacation',
    name: 'Vacation Bonus',
    description: 'Annual vacation bonuses from $1,000 to $10,000',
    icon: '✈️',
    color: 'from-violet-500 to-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700',
    category: 'Lifestyle',
  },
  {
    id: 'infinity-pool',
    name: 'Infinity Pool',
    description: 'Share in a pool of 2% of company revenue at Crown Diamond+',
    icon: '💎',
    color: 'from-emerald-500 to-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    category: 'Elite',
  },
];

const categories = [
  'All',
  'Direct Sales',
  'Team Building',
  'Leadership',
  'Quick Wins',
  'Customer Growth',
  'Lifestyle',
  'Elite',
];

export default function CompensationOverviewPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
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

  // Filter commission types based on search and category
  const filteredTypes = commissionTypes.filter((type) => {
    const matchesSearch =
      searchQuery === '' ||
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || type.category === activeCategory;
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
      <div className="bg-[#2B4C7E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Compensation Plan</h1>
          <p className="text-xl text-blue-200 max-w-3xl">
            Welcome to one of the most generous compensation plans in the industry. Here's how you can earn with Apex Affinity Group.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              💰 Earnings Calculator
            </Link>
            <Link
              href="/dashboard/compensation/glossary"
              className="bg-blue-800/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800/70 transition-colors border border-blue-400/30"
            >
              📖 Glossary
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">12</div>
            <div className="text-sm text-gray-600">Ways to Earn</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">7</div>
            <div className="text-sm text-gray-600">Matrix Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">30%</div>
            <div className="text-sm text-gray-600">Retail Profit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">9</div>
            <div className="text-sm text-gray-600">Ranks to Achieve</div>
          </div>
        </div>
      </div>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 md:top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search commission types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#2B4C7E] focus:border-[#2B4C7E] sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[#2B4C7E] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredTypes.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{commissionTypes.length}</span> commission types
            {(searchQuery || activeCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="ml-3 text-[#2B4C7E] hover:text-[#1e3555] font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UNIFIED GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTypes.map((type) => (
              <Link key={type.id} href={`/dashboard/compensation/${type.id}`} className="group block">
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full border-2 border-transparent hover:border-[#2B4C7E] hover:-translate-y-1">
                  {/* Color Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${type.color}`} />

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{type.icon}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${type.badgeColor}`}>
                        {type.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#2B4C7E] transition-colors leading-tight">
                      {type.name}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                      {type.description}
                    </p>

                    <div className="flex items-center text-[#2B4C7E] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                      Learn More
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No commission types found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="bg-[#2B4C7E] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1e3555] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-[#2B4C7E] text-white py-16 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Use our calculator to see how much you could earn, or dive into each commission type to learn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-white text-[#2B4C7E] px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
            >
              Calculate My Potential Earnings
            </Link>
            <Link
              href="/dashboard/team"
              className="bg-blue-800/50 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800/70 transition-colors border-2 border-blue-400/30"
            >
              View My Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
