// =============================================
// Public Services Page (Informational Only)
// URL: /services
// No purchase buttons - just product information
// =============================================

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Powered Services - Apex Affinity Group',
  description: 'Discover our suite of AI-powered tools designed to help insurance agents succeed. From marketing automation to enterprise management.',
};

export default async function ServicesPage() {
  const supabase = await createClient();

  // Get active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Apex Services</h1>
                <p className="text-sm text-slate-600">AI-Powered Insurance Solutions</p>
              </div>
            </div>
            <a
              href="/"
              className="px-6 py-2 text-slate-700 hover:text-slate-900 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#2B4C7E] to-[#1a2c4e] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered Tools for Insurance Professionals
          </h2>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
            Transform your insurance business with our suite of AI-powered platforms.
            Automate marketing, streamline workflows, and scale your agency with confidence.
          </p>
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <p className="text-sm text-slate-200">
              💡 Available exclusively through authorized Apex representatives
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products?.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border-2 border-slate-200 p-8 hover:border-[#2B4C7E] transition-all hover:shadow-xl"
              >
                {/* Product Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      ${(product.retail_price_cents / 100).toFixed(0)}
                    </span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Member pricing available
                  </p>
                </div>

                {/* Features */}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Key Features:</p>
                    <ul className="space-y-2">
                      {product.features.slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info Badge */}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-600">
                    Contact an Apex representative to learn more
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Insurance Business?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Connect with an Apex representative to get started with AI-powered tools
            that will help you grow your business and serve more clients.
          </p>
          <div className="inline-block px-6 py-3 bg-white rounded-lg border border-slate-300 shadow-sm">
            <p className="text-sm text-slate-700">
              Available through authorized representatives only
            </p>
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
