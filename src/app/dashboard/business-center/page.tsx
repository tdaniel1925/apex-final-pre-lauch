// =============================================
// Business Center Benefits Page
// Educates distributors on why they need $39/month subscription
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import {
  MessageSquare,
  Phone,
  Users,
  BarChart3,
  Network,
  Layers,
  GraduationCap,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import UsageStats from '@/components/dashboard/UsageStats';
import BenefitCard from '@/components/dashboard/BenefitCard';
import UseCase from '@/components/dashboard/UseCase';
import FAQItem from '@/components/dashboard/FAQItem';

export const metadata = {
  title: 'Business Center - Apex Affinity Group',
  description: 'AI-Powered Business Center - Master the Technology You\'re Selling',
};

/**
 * Get usage stats for AI chatbot and voice agent
 */
async function getUsageStats(distributorId: string) {
  const supabase = createServiceClient();

  // Get start of today (Central Time)
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Get start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get today's chatbot message count
  const { count: chatbotToday } = await supabase
    .from('usage_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributorId)
    .eq('usage_type', 'ai_chatbot_message')
    .gte('created_at', startOfToday.toISOString());

  // Get this month's voice minutes
  const { data: voiceData } = await supabase
    .from('usage_tracking')
    .select('amount')
    .eq('distributor_id', distributorId)
    .eq('usage_type', 'ai_voice_minute')
    .gte('created_at', startOfMonth.toISOString());

  const voiceMinutes = voiceData?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;

  return {
    chatbotUsedToday: chatbotToday || 0,
    chatbotLimitDaily: 20,
    voiceUsedMonth: Math.ceil(voiceMinutes),
    voiceLimitMonth: 50,
  };
}

export default async function BusinessCenterPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor data
  const serviceClient = createServiceClient();

  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('auth_user_id', user.id)
    .single();

  // If no distributor record, check if they're an admin
  if (error || !distributor) {
    console.error('Error loading distributor:', error);

    const adminUser = await getAdminUser();

    // If they're an admin, redirect to admin dashboard
    if (adminUser) {
      redirect('/admin');
    }

    // Otherwise, they need to complete signup
    redirect('/signup');
  }

  // Check Business Center subscription status
  const bcStatus = await checkBusinessCenterSubscription(distributor.id);

  // Get usage stats (only if not subscribed)
  const usageStats = !bcStatus.hasSubscription
    ? await getUsageStats(distributor.id)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered Business Center
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Master the Technology You're Selling
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            You can't sell insurance technology if you don't know how to use it.
            The Business Center gives you unlimited access to master every tool
            so you can confidently demonstrate and sell to prospects.
          </p>
          {!bcStatus.hasSubscription && (
            <a
              href="/dashboard/store"
              className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
            >
              Upgrade to Unlimited Access - $39/month
            </a>
          )}
          {bcStatus.hasSubscription && (
            <div className="bg-green-600 text-white px-8 py-4 rounded-lg inline-flex items-center gap-2 font-semibold text-lg">
              <Check className="w-6 h-6" />
              You Have Unlimited Access
            </div>
          )}
        </div>
      </section>

      {/* Usage Stats Section (only show if not subscribed) */}
      {!bcStatus.hasSubscription && usageStats && (
        <UsageStats
          chatbotUsedToday={usageStats.chatbotUsedToday}
          chatbotLimitDaily={usageStats.chatbotLimitDaily}
          voiceUsedMonth={usageStats.voiceUsedMonth}
          voiceLimitMonth={usageStats.voiceLimitMonth}
        />
      )}

      {/* What's Included Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">
            What You Get with Business Center
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              icon={<MessageSquare className="w-12 h-12 text-blue-600" />}
              title="Unlimited AI Chatbot"
              description="Ask unlimited questions about your team, commissions, training, and products. Master every detail."
              free="20 messages/day"
              unlimited="∞ Unlimited"
            />

            <BenefitCard
              icon={<Phone className="w-12 h-12 text-blue-600" />}
              title="Unlimited AI Voice Agent"
              description="Practice sales calls as much as you want. Perfect your pitch before presenting to real prospects."
              free="50 minutes/month"
              unlimited="∞ Unlimited"
            />

            <BenefitCard
              icon={<Users className="w-12 h-12 text-blue-600" />}
              title="Full CRM System"
              description="Manage leads, contacts, activities, and tasks. Never lose track of a prospect again."
              free="None"
              unlimited="✓ Full Access"
            />

            <BenefitCard
              icon={<Network className="w-12 h-12 text-blue-600" />}
              title="Lead Autopilot"
              description="Send bulk meeting invitations, create event pages, and track RSVPs automatically."
              free="Limited"
              unlimited="✓ Full Access"
            />

            <BenefitCard
              icon={<Layers className="w-12 h-12 text-blue-600" />}
              title="AI Lead Nurture"
              description="Create personalized 7-week email campaigns for prospects with AI-generated content."
              free="3 campaigns"
              unlimited="∞ Unlimited"
            />
          </div>
        </div>
      </section>

      {/* Why You Need This Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">
          Why Successful Reps Subscribe
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <UseCase
            scenario="Objection Handling"
            description="Prospect asks: 'How does the AI voice agent actually work?' With unlimited access, you've practiced 50+ times and can demo it perfectly."
            result="Confident close instead of fumbling explanation"
          />

          <UseCase
            scenario="Team Building"
            description="New recruit asks: 'How much can I really earn?' You instantly pull up your commission breakdown and show them the exact path."
            result="Trust and credibility = faster signups"
          />

          <UseCase
            scenario="Product Knowledge"
            description="Customer has technical questions about PulseFlow. You've chatted with the AI 10 times this week to master every feature."
            result="Expert positioning = premium pricing"
          />

          <UseCase
            scenario="Lead Management"
            description="3 hot leads, 5 follow-ups, 2 appointments. CRM keeps everything organized so nothing slips through the cracks."
            result="Higher conversion rates"
          />
        </div>
      </section>

      {/* Pricing & CTA Section */}
      <section className="bg-blue-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <div className="bg-white text-gray-900 rounded-lg p-8 max-w-md mx-auto my-8">
            <div className="text-5xl font-bold mb-2">$39</div>
            <div className="text-gray-600 mb-6">per month</div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                Unlimited AI Chatbot Messages
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                Unlimited AI Voice Agent Minutes
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                Full CRM System (Unlimited Leads & Contacts)
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                Lead Autopilot & Meeting Invitations
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                Unlimited AI Lead Nurture Campaigns
              </li>
            </ul>
            {!bcStatus.hasSubscription ? (
              <a
                href="/dashboard/store"
                className="block w-full text-center px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Subscribe Now
              </a>
            ) : (
              <div className="w-full text-center px-4 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Active Subscription
              </div>
            )}
          </div>
          <p className="text-sm opacity-75">
            Cancel anytime • No contracts • Instant activation
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <FAQItem
            question="What happens if I hit my free limit?"
            answer="You'll see a prompt to upgrade. Your access to limited features (AI chatbot, voice agent) will be paused until you upgrade or the limit resets."
          />
          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes! No contracts. Cancel anytime from your account settings. You'll have access until the end of your billing period."
          />
          <FAQItem
            question="Do I really need unlimited access?"
            answer="If you're serious about selling insurance technology, yes. Free limits are fine for casual exploration, but to master the tools and confidently demo them to prospects, you need unlimited practice."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards (Visa, Mastercard, Amex, Discover) through Stripe secure checkout."
          />
          <FAQItem
            question="Is there a discount for annual payment?"
            answer="Not currently, but we're considering this. Subscribe to get notified when annual plans launch."
          />
        </div>
      </section>
    </div>
  );
}
