import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SquarePaymentForm from '@/components/payments/SquarePaymentForm';

export const metadata = {
  title: 'Upgrade to Premium - Apex AI Business Center',
  description: 'Upgrade to Premium for unlimited daily social media posts',
};

export default async function UpgradePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, ai_center_tier, ai_center_premium_free_access')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  // Already has premium
  if (distributor.ai_center_tier === 'premium' || distributor.ai_center_premium_free_access) {
    redirect('/dashboard/ai-business-center');
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Upgrade to Apex AI Business Center Premium
          </h1>
          <p className="text-xl text-slate-600">
            Unlock unlimited daily social media posts with AI-generated images
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
              <p className="text-4xl font-bold text-slate-600">FREE</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">AI Assistant access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">Business analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-slate-700">1 social post per week</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 text-xl">✗</span>
                <span className="text-slate-400">Daily automated posts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 text-xl">✗</span>
                <span className="text-slate-400">AI-generated images</span>
              </li>
            </ul>
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium">
                Current Plan
              </span>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-xl p-8 border-2 border-blue-500 transform scale-105">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mb-2">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-5xl font-bold text-white">$39</p>
              <p className="text-blue-200">/month</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">Everything in Basic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">Daily AI-generated posts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">AI-generated branded images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">All 4 platforms (LinkedIn, FB, Twitter, IG)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">Custom scheduling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">Post analytics & streaks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 text-xl">✓</span>
                <span className="text-white font-medium">Unlimited regenerations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Complete Your Upgrade
          </h2>
          <SquarePaymentForm
            distributorId={distributor.id}
            email={distributor.email}
            name={`${distributor.first_name} ${distributor.last_name}`}
          />
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-slate-600">
                Yes! You can cancel your subscription at any time from your dashboard settings.
                You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                How do the daily posts work?
              </h4>
              <p className="text-slate-600">
                Every morning at 7 AM (customizable), our AI generates personalized posts for each
                of your connected social platforms. You just review and click "Share" - takes 30 seconds!
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                What about the images?
              </h4>
              <p className="text-slate-600">
                Premium members get AI-generated, branded images created by DALL-E for every post.
                Each image is optimized for the specific platform (square for Instagram, landscape for others).
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                Is my payment secure?
              </h4>
              <p className="text-slate-600">
                Absolutely. We use Square for payment processing - a trusted, PCI-compliant payment
                processor used by millions of businesses. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
