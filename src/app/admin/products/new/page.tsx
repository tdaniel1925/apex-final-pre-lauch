// =============================================
// Admin New Product Page
// Create new service subscriptions
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'New Service - Admin - Apex Affinity Group',
  description: 'Create new service subscription',
};

export default async function NewProductPage() {
  const serviceClient = createServiceClient();

  // Fetch categories for the form
  const { data: categories } = await serviceClient
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add New Service</h1>
          <p className="text-slate-600 mt-1">
            Create a new service subscription for the rep store
          </p>
        </div>

        {/* Product Form */}
        <ProductForm categories={categories || []} />
      </div>
    </div>
  );
}
