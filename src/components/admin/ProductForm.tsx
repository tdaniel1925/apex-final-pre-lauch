// =============================================
// Product Form Component
// Create/Edit service subscriptions
// =============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: any; // For editing existing products
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    long_description: product?.long_description || '',
    category_id: product?.category_id || categories[0]?.id || '',

    // Pricing
    retail_price: product ? (product.retail_price_cents / 100).toString() : '',
    wholesale_price: product ? (product.wholesale_price_cents / 100).toString() : '',
    bv: product?.bv?.toString() || '',

    // Subscription
    is_subscription: product?.is_subscription ?? true,
    subscription_interval: product?.subscription_interval || 'monthly',

    // Service details
    service_type: product?.service_type || 'software',
    access_url: product?.access_url || '',
    setup_instructions: product?.setup_instructions || '',
    trial_days: product?.trial_days?.toString() || '0',

    // Media
    image_url: product?.image_url || '',

    // Onboarding
    requires_onboarding: product?.requires_onboarding ?? false,
    onboarding_duration_minutes: product?.onboarding_duration_minutes?.toString() || '30',
    onboarding_instructions: product?.onboarding_instructions || '',

    // Status
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Auto-generate slug from name
      if (name === 'name' && !product) {
        const slug = value.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.name || !formData.slug) {
        throw new Error('Name and slug are required');
      }

      // Prepare data
      const productData = {
        ...formData,
        retail_price_cents: Math.round(parseFloat(formData.retail_price) * 100),
        wholesale_price_cents: Math.round(parseFloat(formData.wholesale_price) * 100),
        bv: parseInt(formData.bv) || 0,
        trial_days: parseInt(formData.trial_days) || 0,
        onboarding_duration_minutes: parseInt(formData.onboarding_duration_minutes) || 30,
        is_digital: true,
        stock_status: 'in_stock',
      };

      // Call API (POST for new, PATCH for edit)
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${product ? 'update' : 'create'} product`);
      }

      // Success - redirect to products list
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to save product');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="AgentPulse Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="agentpulse-pro"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Short Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="Brief description shown on product cards"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Long Description
          </label>
          <textarea
            name="long_description"
            value={formData.long_description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="Detailed description with features and benefits"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Retail Price * ($)
            </label>
            <input
              type="number"
              name="retail_price"
              value={formData.retail_price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="99.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Wholesale Price * ($)
            </label>
            <input
              type="number"
              name="wholesale_price"
              value={formData.wholesale_price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="79.00"
            />
            <p className="text-xs text-slate-500 mt-1">Price reps pay</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Credits (BV) *
            </label>
            <input
              type="number"
              name="bv"
              value={formData.bv}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="79"
            />
            <p className="text-xs text-slate-500 mt-1">For commissions</p>
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Payment Type</h2>

        {/* Payment Type Toggle */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            How should customers be charged for this product?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subscription Option */}
            <label className={`relative flex items-start p-4 cursor-pointer border-2 rounded-lg transition-all ${formData.is_subscription ? 'border-slate-900 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <input
                type="radio"
                name="payment_type"
                checked={formData.is_subscription}
                onChange={() => setFormData(prev => ({ ...prev, is_subscription: true }))}
                className="mt-1 w-4 h-4 text-slate-900 focus:ring-slate-900"
              />
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Subscription</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    Recurring
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Customer pays monthly, quarterly, or annually
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  💡 Best for services, software, memberships
                </p>
              </div>
            </label>

            {/* One-Time Payment Option */}
            <label className={`relative flex items-start p-4 cursor-pointer border-2 rounded-lg transition-all ${!formData.is_subscription ? 'border-slate-900 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <input
                type="radio"
                name="payment_type"
                checked={!formData.is_subscription}
                onChange={() => setFormData(prev => ({ ...prev, is_subscription: false }))}
                className="mt-1 w-4 h-4 text-slate-900 focus:ring-slate-900"
              />
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">One-Time Payment</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Single Charge
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Customer pays once and receives lifetime access
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  💡 Best for courses, ebooks, physical products
                </p>
              </div>
            </label>
          </div>
        </div>

        {formData.is_subscription && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Billing Interval
              </label>
              <select
                name="subscription_interval"
                value={formData.subscription_interval}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Free Trial (days)
              </label>
              <input
                type="number"
                name="trial_days"
                value={formData.trial_days}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="7"
              />
            </div>
          </div>
        )}
      </div>

      {/* Service Details */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Service Access</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service Type
            </label>
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="software">Software/Tool</option>
              <option value="membership">Membership</option>
              <option value="training">Training/Course</option>
              <option value="tool">Business Tool</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Access URL
            </label>
            <input
              type="url"
              name="access_url"
              value={formData.access_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="https://service.example.com/login"
            />
            <p className="text-xs text-slate-500 mt-1">Where reps access the service</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Setup Instructions
          </label>
          <textarea
            name="setup_instructions"
            value={formData.setup_instructions}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="Instructions for getting started after purchase..."
          />
        </div>
      </div>

      {/* Media */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Media</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-slate-500 mt-1">Recommended: 800x600px</p>
        </div>

        {formData.image_url && (
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
            <img
              src={formData.image_url}
              alt="Product preview"
              className="w-48 h-36 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Onboarding Settings */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Onboarding Settings</h2>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="requires_onboarding"
              checked={formData.requires_onboarding}
              onChange={handleChange}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span className="text-sm font-medium text-slate-700">
              Require onboarding session after purchase
            </span>
          </label>
        </div>

        {formData.requires_onboarding && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Duration (minutes)
              </label>
              <input
                type="number"
                name="onboarding_duration_minutes"
                value={formData.onboarding_duration_minutes}
                onChange={handleChange}
                min="15"
                max="120"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="30"
              />
              <p className="text-xs text-slate-500 mt-1">Typical session length</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Onboarding Instructions
              </label>
              <textarea
                name="onboarding_instructions"
                value={formData.onboarding_instructions}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Special instructions or topics to cover during onboarding..."
              />
              <p className="text-xs text-slate-500 mt-1">Internal notes for the onboarding team</p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span className="text-sm font-medium text-slate-700">Active (visible in store)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span className="text-sm font-medium text-slate-700">Featured</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {product ? 'Update Service' : 'Create Service'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
