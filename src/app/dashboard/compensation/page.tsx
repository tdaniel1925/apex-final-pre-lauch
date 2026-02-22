// =============================================
// Compensation Plan Overview
// Visual summary of all 16 commission types
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Compensation Plan - Apex Affinity Group',
  description: 'Learn how you earn with our compensation plan',
};

const commissionTypes = [
  {
    id: 'retail',
    name: 'Retail Commissions',
    description: 'Earn 30% profit when customers buy products through your referral link',
    icon: '🛍️',
    color: 'from-blue-500 to-blue-600',
    category: 'Direct Sales',
  },
  {
    id: 'matrix',
    name: 'Matrix Commissions',
    description: 'Earn on 7 levels deep in your team structure (2% to 10% per level)',
    icon: '📊',
    color: 'from-purple-500 to-purple-600',
    category: 'Team Building',
  },
  {
    id: 'matching',
    name: 'Matching Bonuses',
    description: 'Match a percentage of what your personally enrolled distributors earn',
    icon: '🎯',
    color: 'from-green-500 to-green-600',
    category: 'Team Building',
  },
  {
    id: 'override',
    name: 'Override Bonuses',
    description: 'Earn overrides when you outrank people in your downline',
    icon: '👑',
    color: 'from-yellow-500 to-yellow-600',
    category: 'Leadership',
  },
  {
    id: 'infinity',
    name: 'Infinity Bonus',
    description: 'Earn from level 8 and beyond once you reach Diamond rank',
    icon: '♾️',
    color: 'from-indigo-500 to-indigo-600',
    category: 'Leadership',
  },
  {
    id: 'fast-start',
    name: 'Fast Start Bonuses',
    description: 'Earn $100 when you enroll someone in their first 30 days',
    icon: '⚡',
    color: 'from-orange-500 to-orange-600',
    category: 'Quick Wins',
  },
  {
    id: 'rank-advancement',
    name: 'Rank Advancement',
    description: 'Get rewarded when you advance to a new rank ($50 to $5,000)',
    icon: '🏆',
    color: 'from-red-500 to-red-600',
    category: 'Quick Wins',
  },
  {
    id: 'customer-milestones',
    name: 'Customer Milestones',
    description: 'Bonuses when your customers hit purchase milestones',
    icon: '🎁',
    color: 'from-pink-500 to-pink-600',
    category: 'Customer Growth',
  },
  {
    id: 'customer-retention',
    name: 'Customer Retention',
    description: 'Earn when customers continue buying month after month',
    icon: '🔄',
    color: 'from-teal-500 to-teal-600',
    category: 'Customer Growth',
  },
  {
    id: 'car',
    name: 'Car Bonus',
    description: 'Qualify for $500-$1,500/month car bonus at higher ranks',
    icon: '🚗',
    color: 'from-cyan-500 to-cyan-600',
    category: 'Lifestyle',
  },
  {
    id: 'vacation',
    name: 'Vacation Bonus',
    description: 'Annual vacation bonuses from $1,000 to $10,000',
    icon: '✈️',
    color: 'from-violet-500 to-violet-600',
    category: 'Lifestyle',
  },
  {
    id: 'infinity-pool',
    name: 'Infinity Pool',
    description: 'Share in a pool of 2% of company revenue at Crown Diamond+',
    icon: '💎',
    color: 'from-emerald-500 to-emerald-600',
    category: 'Elite',
  },
];

const categories = [
  { name: 'Direct Sales', description: 'Earn from selling products' },
  { name: 'Team Building', description: 'Earn from building your team' },
  { name: 'Leadership', description: 'Bonuses for leaders' },
  { name: 'Quick Wins', description: 'Fast bonuses to get you started' },
  { name: 'Customer Growth', description: 'Rewards for growing customers' },
  { name: 'Lifestyle', description: 'Car and vacation bonuses' },
  { name: 'Elite', description: 'Top earner rewards' },
];

export default async function CompensationOverviewPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Compensation Plan</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Welcome to one of the most generous compensation plans in the industry. Here's how you can earn with Apex Affinity Group.
          </p>
          <div className="mt-6 flex gap-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#2B4C7E]">16</div>
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

      {/* Commission Types by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map((category) => {
          const typesInCategory = commissionTypes.filter(
            (type) => type.category === category.name
          );

          if (typesInCategory.length === 0) return null;

          return (
            <div key={category.name} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typesInCategory.map((type) => (
                  <Link
                    key={type.id}
                    href={`/dashboard/compensation/${type.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full border-2 border-transparent hover:border-[#2B4C7E]">
                      {/* Color Bar */}
                      <div className={`h-2 bg-gradient-to-r ${type.color}`} />

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{type.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2B4C7E] transition-colors">
                              {type.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center text-[#2B4C7E] text-sm font-semibold group-hover:translate-x-2 transition-transform">
                          Learn More
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-blue-100 mb-8">
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
