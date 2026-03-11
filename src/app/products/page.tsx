'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface Product {
  id: string;
  name: string;
  description: string;
  member_price: number;
  retail_price: number;
  bv: number;
  commission_per_sale: number;
  image_url?: string;
  hasActiveSubscription?: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, email')
      .eq('email', user.email)
      .single();

    if (!distributor) {
      setLoading(false);
      return;
    }

    setCurrentUser({ id: distributor.id, email: distributor.email });

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (productsData) {
      // Check for active subscriptions for each product
      const productsWithStatus = await Promise.all(
        productsData.map(async (product) => {
          const { data: activeOrders } = await supabase
            .from('orders')
            .select('id, status, stripe_subscription_id')
            .eq('rep_id', distributor.id)
            .eq('product_id', product.id)
            .in('status', ['complete', 'pending'])
            .not('stripe_subscription_id', 'is', null)
            .limit(1);

          return {
            ...product,
            hasActiveSubscription: activeOrders && activeOrders.length > 0
          };
        })
      );

      setProducts(productsWithStatus as Product[]);
    }

    setLoading(false);
  }

  async function handleOrderProduct(product: Product) {
    if (!currentUser) return;

    // In production, this would create a Stripe checkout session
    // and redirect to Stripe checkout page with metadata
    alert(`Order feature coming soon!\n\nThis will create a Stripe checkout session with metadata:\n- rep_id: ${currentUser.id}\n- product_id: ${product.id}\n- order_type: member\n- bv_amount: ${product.bv}\n\nAfter payment, the stripe-webhook will create the order record.`);
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Products</h1>
              <p className="text-gray-500 text-sm mt-1">Browse and order Apex Affinity Group products.</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="h-48 bg-gradient-to-br from-[#1B3A7D] to-[#0F2045] flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#0F2045]">{product.name}</h3>
                    {product.hasActiveSubscription && (
                      <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                  {/* Pricing */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Member Price:</span>
                      <span className="text-sm font-bold text-[#1B3A7D]">${product.member_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Retail Price:</span>
                      <span className="text-sm font-bold text-gray-700">${product.retail_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">BV:</span>
                      <span className="text-sm font-bold text-[#0F2045]">{product.bv}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Your Commission:</span>
                      <span className="text-sm font-bold text-emerald-600">${product.commission_per_sale.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOrderProduct(product)}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm hover:opacity-90"
                      style={{ background: product.hasActiveSubscription ? '#6B7280' : '#1B3A7D' }}
                      disabled={product.hasActiveSubscription}
                    >
                      {product.hasActiveSubscription ? 'Subscribed' : 'Order Now'}
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#1B3A7D] bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 font-medium">No products available</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
