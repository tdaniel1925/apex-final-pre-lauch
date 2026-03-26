'use client';

// =============================================
// Service Page Client Component
// Handles cart interactions and displays products with Add to Cart buttons
// =============================================

import { useState } from 'react';
import CartDrawer from './CartDrawer';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  retail_price_cents: number;
  features: string[] | null;
}

interface Distributor {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  products: Product[];
  distributor: Distributor;
}

export default function ServicePageClient({ products, distributor }: Props) {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        // Open cart drawer
        setIsCartOpen(true);
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);

    try {
      const response = await fetch('/api/checkout/retail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create checkout session');
        setCheckingOut(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session');
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        checkingOut={checkingOut}
      />

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Apex Services</h1>
                <p className="text-sm text-slate-600">with {distributor.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <a
                href={`/${distributor.slug}`}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                ← Back
              </a>
            </div>
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
              👤 Your representative: <strong>{distributor.name}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border-2 border-slate-200 p-8 hover:border-[#2B4C7E] transition-all hover:shadow-xl flex flex-col"
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
                    Monthly subscription
                  </p>
                </div>

                {/* Features */}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="mb-6 flex-grow">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Key Features:</p>
                    <ul className="space-y-2">
                      {product.features.slice(0, 4).map((feature, idx) => (
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

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addingToCart === product.id}
                  className="w-full py-3 px-6 bg-[#2B4C7E] text-white font-semibold rounded-lg hover:bg-[#1a2c4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart === product.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Representative Contact */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl border-2 border-slate-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Questions? Contact Your Representative
            </h3>
            <p className="text-slate-600 mb-6">
              {distributor.name} is here to help you choose the right tools for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {distributor.email && (
                <a
                  href={`mailto:${distributor.email}`}
                  className="px-6 py-3 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  📧 Email
                </a>
              )}
              {distributor.phone && (
                <a
                  href={`tel:${distributor.phone}`}
                  className="px-6 py-3 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  📞 Call
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2026 Apex Affinity Group. All rights reserved.</p>
          <p className="mt-2 text-slate-500">Representative: {distributor.name}</p>
        </div>
      </footer>
    </div>
  );
}
