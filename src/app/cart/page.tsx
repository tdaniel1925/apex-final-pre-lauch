'use client';

/**
 * Shopping Cart Page
 *
 * Full-featured shopping cart with:
 * - Product list with images
 * - Quantity controls
 * - Remove items
 * - Real-time total calculation
 * - Checkout button
 * - Rep attribution display
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  product_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  retail_price_cents: number;
  bv_cents: number;
}

interface CartData {
  items: CartItem[];
  total_cents: number;
  rep_slug: string | null;
  cart_count: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(true);

      // Update locally first for instant feedback
      if (cart) {
        const updatedItems = cart.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.retail_price_cents * item.quantity,
          0
        );
        setCart({
          ...cart,
          items: updatedItems,
          total_cents: newTotal,
        });
      }

      // Then update on server
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      fetchCart(); // Reload cart on error
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(true);

      // Update locally first
      if (cart) {
        const updatedItems = cart.items.filter(item => item.product_id !== productId);
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.retail_price_cents * item.quantity,
          0
        );
        setCart({
          ...cart,
          items: updatedItems,
          total_cents: newTotal,
          cart_count: cart.cart_count - cart.items.find(i => i.product_id === productId)!.quantity,
        });
      }

      // Then update on server
      await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
    } catch (error) {
      console.error('Error removing item:', error);
      fetchCart(); // Reload cart on error
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      setUpdating(true);
      await fetch('/api/cart/clear', { method: 'POST' });
      setCart({ items: [], total_cents: 0, rep_slug: null, cart_count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-slate-600 mt-1">
                {isEmpty ? 'Your cart is empty' : `${cart.cart_count} item${cart.cart_count !== 1 ? 's' : ''} in your cart`}
              </p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isEmpty ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg
              className="w-32 h-32 mx-auto text-slate-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
            <p className="text-slate-600 mb-8">
              Start adding products to your cart to see them here
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    {/* Product Image Placeholder */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-12 h-12 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {item.product_name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">
                        ${(item.retail_price_cents / 100).toFixed(2)} each • {item.bv_cents / 100} BV
                      </p>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={updating}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center font-bold text-slate-700"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={updating}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center font-bold text-slate-700"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product_id)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        ${((item.retail_price_cents * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                disabled={updating}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                Clear entire cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl p-6 sticky top-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                {/* Rep Attribution */}
                {cart.rep_slug && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      <p className="text-sm font-semibold text-blue-900">Your Rep</p>
                    </div>
                    <p className="text-blue-700 font-medium">@{cart.rep_slug}</p>
                  </div>
                )}

                {/* Subtotal */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium">${(cart.total_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-slate-900">
                        ${(cart.total_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
