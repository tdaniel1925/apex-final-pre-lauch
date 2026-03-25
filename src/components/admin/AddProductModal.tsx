'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductModalProps {
  categories: Category[];
  onClose: () => void;
}

export function AddProductModal({ categories, onClose }: AddProductModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: categories[0]?.id || '',
    description: '',
    retail_price_cents: '',
    wholesale_price_cents: '',
    bv: '',
    is_subscription: false,
    subscription_interval: 'monthly',
    is_active: true,
    is_featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          retail_price_cents: parseInt(formData.retail_price_cents),
          wholesale_price_cents: parseInt(formData.wholesale_price_cents),
          bv: parseInt(formData.bv),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white sm:rounded-xl shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
              placeholder="e.g., AgentPulse WarmLine"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 min-h-[44px] sm:min-h-0"
              placeholder="agentpulse-warmline"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Brief product description"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Retail Price (cents) *
              </label>
              <input
                type="number"
                required
                value={formData.retail_price_cents}
                onChange={(e) => setFormData({ ...formData, retail_price_cents: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
                placeholder="7900"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {formData.retail_price_cents && `$${(parseInt(formData.retail_price_cents) / 100).toFixed(2)}`}
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Wholesale (cents) *
              </label>
              <input
                type="number"
                required
                value={formData.wholesale_price_cents}
                onChange={(e) => setFormData({ ...formData, wholesale_price_cents: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
                placeholder="5500"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {formData.wholesale_price_cents && `$${(parseInt(formData.wholesale_price_cents) / 100).toFixed(2)}`}
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                BV *
              </label>
              <input
                type="number"
                required
                value={formData.bv}
                onChange={(e) => setFormData({ ...formData, bv: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
                placeholder="40"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Business Volume
              </p>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_subscription}
                onChange={(e) => setFormData({ ...formData, is_subscription: e.target.checked })}
                className="rounded border-gray-300 w-5 h-5"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Recurring Subscription
              </span>
            </label>
          </div>

          {formData.is_subscription && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Billing Interval
              </label>
              <select
                value={formData.subscription_interval}
                onChange={(e) => setFormData({ ...formData, subscription_interval: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg min-h-[44px] sm:min-h-0"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          )}

          {/* Status Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 w-5 h-5"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Active (visible to customers)
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300 w-5 h-5"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Featured (show on homepage)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white pt-3 sm:pt-4 pb-2 sm:pb-0 border-t sm:border-t-0 -mx-4 sm:mx-0 px-4 sm:px-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 sm:py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 min-h-[44px] sm:min-h-0 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 sm:py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px] sm:min-h-0 order-1 sm:order-2"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
