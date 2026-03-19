// =============================================
// Admin Services Management Page
// Manage service subscriptions for rep store
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import Link from 'next/link';
import { Plus, Edit, Trash2, DollarSign, Package, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Services - Admin - Apex Affinity Group',
  description: 'Manage service subscriptions',
};

export default async function AdminProductsPage() {
  const serviceClient = createServiceClient();

  // Fetch products (services) with categories
  const { data: products, error } = await serviceClient
    .from('products')
    .select(`
      *,
      category:product_categories(name, slug)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading services:', error);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Service Subscriptions</h1>
            <p className="text-slate-600 mt-1">
              Manage services available in the rep store
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Package className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Services</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Services</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products?.filter(p => p.is_active).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Subscriptions</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products?.filter(p => p.is_subscription).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">One-Time</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products?.filter(p => !p.is_subscription).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products && products.length > 0 ? (
                  products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            ${(product.wholesale_price_cents / 100).toFixed(2)}
                            {product.is_subscription && (
                              <span className="text-xs text-slate-500">/{product.subscription_interval}</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            Retail: ${(product.retail_price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">{product.bv || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        {product.is_subscription ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            One-Time
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Link>
                          <button
                            type="button"
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500">No services yet</p>
                        <Link
                          href="/admin/products/new"
                          className="text-sm text-slate-900 hover:underline"
                        >
                          Create your first service
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
