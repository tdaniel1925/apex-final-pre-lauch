// =============================================
// Admin Products Management Page
// Add, edit, delete products with BV assignment
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { AddProductButton } from '@/components/admin/AddProductButton';

export const metadata = {
  title: 'Products — Apex Admin',
};

async function getProducts() {
  const supabase = createServiceClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name, slug)
    `)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];
}

async function getCategories() {
  const supabase = createServiceClient();

  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order', { ascending: true });

  return categories || [];
}

export default async function ProductsPage() {
  await requireAdmin();

  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all products, pricing, and BV assignments
          </p>
        </div>
        <AddProductButton categories={categories} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Subscriptions</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {products.filter((p) => p.is_subscription).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Categories</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{categories.length}</p>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
