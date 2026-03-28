'use client';

// =============================================
// Cart Drawer Component
// Slide-in cart with checkout button
// =============================================

import { useState, useEffect } from 'react';

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  retail_price_cents: number;
  bv_cents: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  checkingOut: boolean;
}

export default function CartDrawer({ isOpen, onClose, onCheckout, checkingOut }: Props) {
  const [cart, setCart] = useState<{
    items: CartItem[];
    total_cents: number;
    cart_count: number;
  }>({ items: [], total_cents: 0, cart_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        loadCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-[#2B4C7E] border-t-transparent rounded-full"></div>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{item.product_name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      ${(item.retail_price_cents / 100).toFixed(0)}/month × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${((item.retail_price_cents * item.quantity) / 100).toFixed(0)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-sm text-red-600 hover:text-red-700 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-slate-900">Subtotal:</span>
              <span className="font-bold text-slate-900">
                ${(cart.total_cents / 100).toFixed(0)}/month
              </span>
            </div>

            {/* Coming Soon Notice */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
              <p className="font-semibold text-blue-900 mb-2">
                🚀 Coming Soon!
              </p>
              <p className="text-sm text-blue-800">
                Checkout will be available when we launch. Your cart is saved for later.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
