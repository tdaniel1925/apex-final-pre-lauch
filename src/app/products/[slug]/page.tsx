// =============================================
// Product Detail Page
// URL: /products/{slug}
// Individual product pages for AgentPulse products
// =============================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (product) {
    return {
      title: `${product.name} - Apex Affinity Group`,
      description: product.description,
    };
  }

  return {
    title: 'Product - Apex Affinity Group',
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get product details
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Product-specific feature lists and details
  const productDetails: Record<string, { tagline: string; features: string[]; benefits: string[] }> = {
    pulsemarket: {
      tagline: 'Transform Your Marketing with AI-Powered Automation',
      features: [
        'AI-powered social media post generation',
        'Automated lead capture and follow-up',
        'Email marketing campaigns',
        'Landing page builder',
        'Lead scoring and qualification',
        'Multi-channel campaign management',
        'Analytics and performance tracking',
        'Custom branding and templates',
      ],
      benefits: [
        'Generate months of content in minutes',
        'Never miss a follow-up opportunity',
        'Build your personal brand consistently',
        'Convert more leads into customers',
      ],
    },
    pulseflow: {
      tagline: 'Automate Your Workflow, Multiply Your Results',
      features: [
        'Visual workflow builder',
        'Automated client onboarding',
        'Smart task assignment',
        'Email and SMS automation',
        'Document generation and e-signatures',
        'Calendar scheduling and reminders',
        'CRM integration',
        'Custom automation triggers',
      ],
      benefits: [
        'Save 10+ hours per week on repetitive tasks',
        'Never let a client fall through the cracks',
        'Deliver consistent experiences at scale',
        'Focus on selling, not administrative work',
      ],
    },
    pulsedrive: {
      tagline: 'Your Complete Sales Command Center',
      features: [
        'Advanced pipeline management',
        'Deal tracking and forecasting',
        'Opportunity scoring',
        'Sales activity tracking',
        'Customizable deal stages',
        'Revenue forecasting',
        'Team collaboration tools',
        'Mobile app access',
      ],
      benefits: [
        'Close deals 30% faster on average',
        'Forecast revenue with confidence',
        'Identify and prioritize hot leads',
        'Manage your entire sales process in one place',
      ],
    },
    pulsecommand: {
      tagline: 'Enterprise-Grade Power for Growing Agencies',
      features: [
        'Agency-wide analytics dashboard',
        'Team performance tracking',
        'Custom reporting and insights',
        'Multi-user permissions',
        'White-label capabilities',
        'Advanced integrations',
        'Compliance monitoring',
        'Dedicated account manager',
      ],
      benefits: [
        'Scale your agency with confidence',
        'Make data-driven decisions',
        'Monitor team performance in real-time',
        'Enterprise features at a fraction of the cost',
      ],
    },
    smartlock: {
      tagline: 'Protect Your Business, Ensure Compliance',
      features: [
        'Data encryption and security',
        'Compliance monitoring',
        'Audit trail and logging',
        'Access control management',
        'Secure document storage',
        'HIPAA compliance tools',
        'Regular security updates',
        'Incident reporting',
      ],
      benefits: [
        'Protect sensitive client data',
        'Stay compliant with regulations',
        'Avoid costly data breaches',
        'Peace of mind for you and your clients',
      ],
    },
    businesscenter: {
      tagline: 'Your Complete Back Office Solution',
      features: [
        'Replicated website with custom domain',
        'Team management dashboard',
        'Downline reporting',
        'Commission tracking',
        'Training resource library',
        'Marketing materials',
        'Lead distribution system',
        'Mobile-responsive design',
      ],
      benefits: [
        'Professional web presence in minutes',
        'Manage your team from one dashboard',
        'Track commissions and earnings',
        'Essential tools for network building',
      ],
    },
  };

  const details = productDetails[slug] || {
    tagline: product.description,
    features: [],
    benefits: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/services" className="text-[#2B4C7E] hover:underline flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Services
            </a>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-semibold text-gray-900">Apex</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {product.name}
            </h1>
            <p className="text-2xl text-slate-200 mb-8">
              {details.tagline}
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold">${(product.retail_price_cents / 100).toFixed(0)}</div>
                <div className="text-sm text-slate-300">per month</div>
              </div>
            </div>
            <a
              href="/services"
              className="inline-block px-8 py-4 bg-white text-[#2B4C7E] font-bold rounded-lg hover:bg-slate-100 transition-colors text-lg"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {details.features.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Powerful Features
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {details.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2B4C7E] transition-colors">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {details.benefits.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Why {product.name}?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {details.benefits.map((benefit, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#2B4C7E] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium">{benefit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-slate-200 mb-8">
              Join thousands of insurance professionals using {product.name} to grow their business.
            </p>
            <a
              href="/services"
              className="inline-block px-8 py-4 bg-white text-[#2B4C7E] font-bold rounded-lg hover:bg-slate-100 transition-colors text-lg"
            >
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2026 Apex Affinity Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
