// =============================================
// Rep Store Page
// Browse and subscribe to services
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import StoreClient from '@/components/dashboard/StoreClient';
import PulseProductCard from '@/components/dashboard/PulseProductCard';
import { Package, CheckCircle, Clock } from 'lucide-react';

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

  // Fetch active products/services
  const { data: products } = await serviceClient
    .from('products')
    .select(`
      *,
      category:product_categories(name, slug, description)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch user's current subscriptions/access
  const { data: userAccess } = await serviceClient
    .from('service_access')
    .select('product_id, status, expires_at, is_trial')
    .eq('distributor_id', distributor.id)
    .eq('status', 'active');

  const accessMap = new Map(userAccess?.map(a => [a.product_id, a]) || []);

  // Group products by category
  const productsByCategory = products?.reduce((acc: any, product: any) => {
    const catName = product.category?.name || 'Other';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(product);
    return acc;
  }, {}) || {};

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
      memberPrice: 249,
      retailPrice: 299,
      qv: 249,
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

        {/* Products by Category */}
        {Object.entries(productsByCategory).map(([categoryName, categoryProducts]: [string, any]) => (
          <div key={categoryName} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{categoryName}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product: any) => {
                const hasAccess = accessMap.has(product.id);
                const accessInfo = accessMap.get(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Package className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                        {hasAccess && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {product.description || 'No description available'}
                      </p>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ${(product.wholesale_price_cents / 100).toFixed(0)}
                          </span>
                          {product.is_subscription && (
                            <span className="text-sm text-slate-600">
                              / {product.subscription_interval}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Earn {product.bv || 0} BV credits
                        </p>
                      </div>

                      {/* Trial Info */}
                      {product.trial_days > 0 && !hasAccess && (
                        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded mb-4">
                          <Clock className="w-4 h-4" />
                          {product.trial_days} day free trial
                        </div>
                      )}

                      {/* Action Button */}
                      {hasAccess ? (
                        <div>
                          {accessInfo?.is_trial && (
                            <p className="text-xs text-orange-600 mb-2">
                              Trial ends {new Date(accessInfo.expires_at).toLocaleDateString()}
                            </p>
                          )}
                          <a
                            href={product.access_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Access Service
                          </a>
                        </div>
                      ) : (
                        <StoreClient
                          productId={product.id}
                          distributorId={distributor.id}
                          productName={product.name}
                          price={(product.wholesale_price_cents / 100).toFixed(0)}
                          isSubscription={product.is_subscription}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {products && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No services available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
