// =============================================
// Rep Store Page
// Browse and subscribe to services
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import PulseProductCard from '@/components/dashboard/PulseProductCard';
import { Package, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Store - Apex Affinity Group',
  description: 'Subscribe to services and tools',
};

export default async function StorePage() {
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

  // Define Pulse Products (member pricing)
  const pulseProducts = [
    {
      productSlug: 'pulsemarket' as const,
      name: 'PulseMarket',
      description: 'Social Media Marketing Automation & Content Creation',
      memberPrice: 59,
      retailPrice: 79,
      qv: 59,
      bv: 27.58,
      features: [
        'Unlimited social media posts',
        'AI content generation',
        'Multi-platform scheduling',
      ],
    },
    {
      productSlug: 'pulseflow' as const,
      name: 'PulseFlow',
      description: 'Professional Marketing Power with Weekly Email & SMS Campaigns',
      memberPrice: 129,
      retailPrice: 149,
      qv: 129,
      bv: 60.32,
      features: [
        'Everything in PulseMarket',
        'Email marketing automation',
        'SMS campaigns',
      ],
    },
    {
      productSlug: 'pulsedrive' as const,
      name: 'PulseDrive',
      description: 'Professional Marketing Power with AI Podcast Production',
      memberPrice: 349,
      retailPrice: 399,
      qv: 349,
      bv: 116.48,
      features: [
        'Everything in PulseFlow',
        'AI podcast creation',
        'Video content automation',
      ],
    },
    {
      productSlug: 'pulsecommand' as const,
      name: 'PulseCommand',
      description: 'Enterprise-Grade Marketing Automation with AI Avatar Videos',
      memberPrice: 399,
      retailPrice: 499,
      qv: 399,
      bv: 186.62,
      features: [
        'Everything in PulseDrive',
        'AI avatar video creation',
        'White-glove service',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Service Store</h1>
          <p className="text-slate-600 mt-1">
            Subscribe to tools and services to grow your business
          </p>
        </div>

        {/* Pulse Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Pulse Marketing Products</h2>
            <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Member Pricing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pulseProducts.map((product) => (
              <PulseProductCard key={product.productSlug} {...product} />
            ))}
          </div>
        </div>

        {/* Business Center - Horizontal Card */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Business Tools</h2>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-6">
              {/* Left Side - Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Business Center</h3>
                </div>
                <p className="text-blue-100 mb-4 text-lg">
                  Unlock powerful tools to manage your business: CRM, leads tracking, sales analytics, commission calculator, and more.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-xl text-blue-100">/month</span>
                </div>
                <ul className="space-y-2 text-blue-50">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    CRM & Contact Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sales & Commission Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Lead Generation Tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Analytics Dashboard
                  </li>
                </ul>
              </div>

              {/* Right Side - CTA */}
              <div className="flex-shrink-0">
                <form action="/api/stripe/create-product-checkout" method="POST">
                  <input type="hidden" name="product_id" value="528eea55-21f7-415b-a2ea-ab39b65d6101" />
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Purchase Business Center
                  </button>
                </form>
                <p className="text-xs text-blue-100 mt-3 text-center">
                  Secure checkout via Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
