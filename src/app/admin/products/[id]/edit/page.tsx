// =============================================
// Admin Edit Product Page
// Edit existing service subscriptions
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Service - Admin - Apex Affinity Group',
  description: 'Edit service subscription',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceClient = createServiceClient();

  // Fetch the product
  const { data: product, error: productError } = await serviceClient
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (productError || !product) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold text-slate-900">Edit Service</h1>
          <p className="text-slate-600 mt-1">
            Update service subscription details
          </p>
        </div>

        {/* Product Form */}
        <ProductForm categories={categories || []} product={product} />
      </div>
    </div>
  );
}
