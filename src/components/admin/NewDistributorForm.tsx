'use client';

// =============================================
// New Distributor Form Component
// Form for creating distributors manually
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDistributorForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    slug: '',
    company_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create distributor');
      }

      const distributor = await response.json();
      router.push(`/admin/distributors/${distributor.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="unique-username"
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Must be unique, lowercase, no spaces</p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Address (Optional)</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-4 sm:px-6 py-3 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 min-h-[44px] sm:min-h-0 order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 sm:px-6 py-3 sm:py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px] sm:min-h-0 order-1 sm:order-2"
        >
          {isSubmitting ? 'Creating...' : 'Create Distributor'}
        </button>
      </div>
    </form>
  );
}
