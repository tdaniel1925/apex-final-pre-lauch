// =============================================
// Compensation Plan Glossary
// Simple definitions of MLM terms
// =============================================

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Glossary - Compensation Plan',
  description: 'Simple explanations of compensation plan terms',
};

const glossaryTerms = [
  {
    term: 'Active Distributor',
    definition: 'Someone who has at least 50 BV (Business Volume) in a month. You need to be active to earn most commissions.',
    example: 'If you buy the Essentials Kit (50 BV), you\'re active that month.',
  },
  {
    term: 'BV (Business Volume)',
    definition: 'Points assigned to each product. It\'s how we measure your sales activity. Think of it like "points" instead of dollars.',
    example: 'A product that costs $79 might have 40 BV. The Essentials Kit has 50 BV.',
  },
  {
    term: 'Downline',
    definition: 'Everyone below you in your team tree - people you enrolled, people they enrolled, etc.',
    example: 'You enroll Sarah. Sarah enrolls Mike. Both Sarah and Mike are in your downline.',
  },
  {
    term: 'Enroll / Sponsor',
    definition: 'When you invite someone to join as a distributor using your referral link, you "enroll" or "sponsor" them.',
    example: 'You share your link with a friend. They sign up. You enrolled them!',
  },
  {
    term: 'GBV (Group Business Volume)',
    definition: 'The total BV of everyone in your entire downline combined. This number grows as your team grows.',
    example: 'You have 50 BV, Sarah has 100 BV, Mike has 75 BV. Your GBV is 225.',
  },
  {
    term: 'Generation',
    definition: 'A "layer" of leaders in your team. Gen 1 = your personal enrollments who hit a certain rank. Gen 2 = their leaders, etc.',
    example: 'You enroll Sarah (becomes Silver rank) - she\'s Gen 1. Sarah enrolls Mike (becomes Silver) - he\'s Gen 2.',
  },
  {
    term: 'Level (Matrix)',
    definition: 'How many "steps" away someone is from you. Level 1 = people YOU enrolled. Level 2 = people THEY enrolled. Goes to Level 7.',
    example: 'You → Sarah (Level 1) → Mike (Level 2) → Jenny (Level 3)',
  },
  {
    term: 'Matrix',
    definition: 'The structure of your team. Apex uses a "5-wide" matrix - each person can have up to 5 people directly under them on Level 1.',
    example: 'You enroll 5 people. That fills your Level 1. The 6th person goes on Level 2.',
  },
  {
    term: 'Matching Bonus',
    definition: 'You earn a percentage of what your PERSONALLY enrolled distributors earn in commissions.',
    example: 'Sarah (you enrolled her) earns $500 in commissions. You get 10% matching = $50.',
  },
  {
    term: 'Override',
    definition: 'When you outrank someone in your downline, you earn the difference between your rank\'s percentage and theirs.',
    example: 'You\'re Gold (8%), Sarah is Silver (6%). You earn 2% override on her volume.',
  },
  {
    term: 'Personal Enrollment',
    definition: 'Someone YOU directly signed up (not someone your team signed up). These are your "Level 1" people.',
    example: 'You share your link with 3 friends. They all join. Those 3 are your personal enrollments.',
  },
  {
    term: 'Personal BV',
    definition: 'The BV from YOUR OWN purchases or sales that month (not your team\'s).',
    example: 'You buy a kit worth 50 BV. That\'s your Personal BV for the month.',
  },
  {
    term: 'Rank',
    definition: 'Your title in the company based on your team\'s performance. Starts at Affiliate, goes to Royal Diamond.',
    example: 'You start as Affiliate. When you hit 1,000 GBV, you become Associate.',
  },
  {
    term: 'Rank Advancement Bonus',
    definition: 'A one-time cash bonus when you achieve a new rank for the first time.',
    example: 'You hit Silver rank for the first time → You get a $250 bonus!',
  },
  {
    term: 'Retail Commission',
    definition: 'The profit you make when a CUSTOMER (not a distributor) buys a product through your link.',
    example: 'A customer buys a $100 product. You paid $70 wholesale. You keep $30 profit.',
  },
  {
    term: 'Retail Price',
    definition: 'The full price a customer pays for a product.',
    example: 'The Essentials Kit retail price is $79.',
  },
  {
    term: 'Spillover',
    definition: 'When your sponsor\'s recruits go under YOU because their Level 1 is full (5 people). Free team members!',
    example: 'Your sponsor enrolls 6 people. Their first 5 fill Level 1. The 6th person "spills over" under you.',
  },
  {
    term: 'Sponsor / Upline',
    definition: 'The person who enrolled you. They\'re above you in the team structure.',
    example: 'Sarah invited you to join. Sarah is your sponsor/upline.',
  },
  {
    term: 'Upline',
    definition: 'Everyone ABOVE you in your team tree - your sponsor, their sponsor, etc.',
    example: 'You → Sarah (your sponsor) → Mike (Sarah\'s sponsor). Sarah and Mike are your upline.',
  },
  {
    term: 'Wholesale Price',
    definition: 'The discounted price that distributors pay for products (about 70% of retail).',
    example: 'Retail price: $100. Wholesale price: $70. You save $30 as a distributor.',
  },
  {
    term: 'Infinity Bonus',
    definition: 'Once you hit Diamond rank, you can earn commissions beyond Level 7 (Level 8, 9, 10, etc.) - unlimited depth!',
    example: 'You\'re Diamond. You earn on Level 1-7 from Matrix, PLUS Level 8+ from Infinity.',
  },
  {
    term: 'Fast Start Bonus',
    definition: 'A quick $100 bonus when you enroll someone in your first 30 days as a distributor.',
    example: 'You join on Jan 1. You enroll someone on Jan 15. You get $100 Fast Start!',
  },
  {
    term: 'Break (Override Break)',
    definition: 'When you reach someone in your downline who has the SAME or HIGHER rank as you, you stop earning overrides on their group.',
    example: 'You\'re Gold. Sarah (in your downline) becomes Gold too. Override "breaks" at Sarah.',
  },
];

export default async function GlossaryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/compensation"
            className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Compensation Plan
          </Link>
          <h1 className="text-4xl font-bold mb-4">📖 Compensation Plan Glossary</h1>
          <p className="text-xl text-blue-100">
            Simple explanations of all the terms you'll see in our compensation plan. No jargon, just clear definitions.
          </p>
        </div>
      </div>

      {/* Glossary Terms */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-blue-50 border-l-4 border-[#2B4C7E] p-6 mb-8 rounded-r-lg">
          <p className="text-gray-700">
            <strong>Tip:</strong> Bookmark this page! You can come back anytime you see a term you don't understand.
          </p>
        </div>

        <div className="space-y-6">
          {glossaryTerms.map((item) => (
            <div
              key={item.term}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-[#2B4C7E] mb-3">{item.term}</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">{item.definition}</p>
              <div className="bg-gray-50 border-l-4 border-green-400 p-4 rounded-r">
                <p className="text-sm font-semibold text-gray-600 mb-1">Example:</p>
                <p className="text-gray-700">{item.example}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="mb-6">
            The best way to learn is by doing! Start building your team and see these concepts in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/compensation/calculator"
              className="bg-white text-[#2B4C7E] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Try the Calculator
            </Link>
            <Link
              href="/dashboard/compensation"
              className="bg-blue-800/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800/70 transition-colors border border-blue-400/30"
            >
              View All Commission Types
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
