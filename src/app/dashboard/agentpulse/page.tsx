// =============================================
// AgentPulse Hub Page
// Overview of all 6 modules + tier comparison
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CountdownTimer from '@/components/agentpulse/CountdownTimer';
import WaitlistForm from '@/components/agentpulse/WaitlistForm';
import ModuleCard from '@/components/agentpulse/ModuleCard';
import TierComparison from '@/components/agentpulse/TierComparison';

export const metadata = {
  title: 'AgentPulse Marketing Suite - Apex Affinity Group',
  description: 'AI-powered insurance marketing tools for agents',
};

export default async function AgentPulsePage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Launch date: February 28, 2025
  const launchDate = new Date('2025-02-28T00:00:00');

  const modules = [
    {
      icon: '📧',
      title: 'PulseFollow',
      tagline: 'Smart Drip Engine',
      description:
        'Automatically send personalized email and SMS sequences to your leads. Set it once, nurture leads 24/7 while you focus on selling.',
      href: '/dashboard/agentpulse/pulsefollow',
      gradient: 'bg-blue-600',
    },
    {
      icon: '🤖',
      title: 'AgentPilot',
      tagline: 'AI Daily Action List',
      description:
        'Every morning, AI analyzes your pipeline and gives you a prioritized to-do list with pre-written messages ready to send in one click.',
      href: '/dashboard/agentpulse/agentpilot',
      gradient: 'bg-purple-600',
    },
    {
      icon: '🔔',
      title: 'PolicyPing',
      tagline: 'Renewal & Cross-Sell Radar',
      description:
        'Never lose a renewal again. Tracks all policy expirations and automatically detects cross-sell opportunities your clients are missing.',
      href: '/dashboard/agentpulse/policyping',
      gradient: 'bg-green-600',
    },
    {
      icon: '🔁',
      title: 'LeadLoop',
      tagline: 'Referral & Review Automation',
      description:
        'Turn every closed client into a 5-star reviewer and referral source. Automatically handles thank-yous, review requests, and referral asks.',
      href: '/dashboard/agentpulse/leadloop',
      gradient: 'bg-orange-600',
    },
    {
      icon: '📞',
      title: 'WarmLine',
      tagline: 'AI Voice Agent',
      description:
        'Your AI assistant makes follow-up calls while you have coffee. Identifies interested leads and books them on your calendar automatically.',
      href: '/dashboard/agentpulse/warmline',
      gradient: 'bg-pink-600',
    },
    {
      icon: '📊',
      title: 'PulseInsight',
      tagline: 'SmartOffice Intelligence',
      description:
        'Turn ugly SmartOffice spreadsheets into beautiful dashboards with AI insights. Ask your data questions in plain English and get instant answers.',
      href: '/dashboard/agentpulse/pulseinsight',
      gradient: 'bg-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">AgentPulse Marketing Suite</h1>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              Your leads. Nurtured. Automatically.
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The all-in-one lead nurture, follow-up, and data intelligence platform built
              specifically for insurance agents. Six powerful modules in one affordable app.
            </p>
          </div>

          {/* Waitlist Form */}
          <WaitlistForm />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            The 6 Modules That Transform Insurance Businesses
          </h2>
          <p className="text-gray-600 text-lg">
            Click any module to see a detailed preview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h2>
            <p className="text-gray-600 text-lg">
              Start free, upgrade as you grow. Cancel anytime.
            </p>
          </div>

          <TierComparison />
        </div>
      </div>

      {/* Commission Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Earn Commissions Through Your 5x7 Matrix
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Every AgentPulse subscription you sell flows through your existing compensation
            plan with full matrix overrides on all 5 levels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Recurring Revenue</h3>
              <p className="text-sm text-gray-600">
                Monthly subscriptions = monthly commissions that keep flowing
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">Team Overrides</h3>
              <p className="text-sm text-gray-600">
                Earn on your direct sales + your team's sales down 5 levels
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Dual Income</h3>
              <p className="text-sm text-gray-600">
                Use AgentPulse for YOUR business while earning from selling it to others
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-[#2B4C7E]">
            <h4 className="font-bold text-gray-900 mb-3">Example: Sell 10 Pro Plans</h4>
            <p className="text-gray-700 mb-4">
              10 agents × $99/month = $990/month in premium volume
              <br />
              Plus team overrides on your downline's sales
              <br />
              <span className="font-semibold text-[#2B4C7E]">
                = Monthly recurring income through your matrix
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Commission rates vary by matrix position and level. See your compensation plan
              for details.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              Can I use AgentPulse for my own insurance business?
            </h3>
            <p className="text-gray-700">
              Absolutely! AgentPulse is designed for insurance agents to nurture their own
              leads and manage their book of business. The fact that you can also sell it and
              earn commissions is a bonus.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">When does AgentPulse launch?</h3>
            <p className="text-gray-700">
              February 28, 2025. Join the waitlist above to get early access and 50% off your
              first month.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              How do commissions work with the 5x7 matrix?
            </h3>
            <p className="text-gray-700">
              Every AgentPulse subscription you sell (or your team sells) flows through the
              existing Apex Affinity Group compensation structure. You earn overrides on
              direct sales and team sales based on your matrix position and depth.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              What if I just want one module, not all six?
            </h3>
            <p className="text-gray-700">
              The modules are bundled into tiers for affordability. Starter ($49/mo) includes
              core features from multiple modules. Pro ($99/mo) unlocks everything except AI
              calling. Elite ($199/mo) gives you the full suite.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              Does this replace my CRM?
            </h3>
            <p className="text-gray-700">
              AgentPulse complements your CRM by handling automated follow-up, AI-powered
              actions, and SmartOffice intelligence. Most agents use it alongside their
              existing system.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#2B4C7E] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss the Launch</h2>
          <p className="text-lg text-blue-100 mb-8">
            Be among the first to get AgentPulse when it goes live February 28th.
            <br />
            Waitlist members get 50% off their first month.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
