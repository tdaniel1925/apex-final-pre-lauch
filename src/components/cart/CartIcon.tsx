'use client';

/**
 * Cart Icon Component
 *
 * Displays shopping cart icon with item count badge
 * Can be added to any header/navigation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartIcon() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartCount();

    // Poll for cart updates every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCartCount(data.cart_count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-slate-700 hover:text-blue-600 transition-colors"
      aria-label={`Shopping cart with ${cartCount} items`}
    >
      {/* Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {/* Item Count Badge */}
      {!loading && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </button>
  );
}
