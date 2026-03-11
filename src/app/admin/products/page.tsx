'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Product {
  id: string;
  name: string;
  slug: string;
  member_price: number;
  retail_price: number;
  bv: number;
  category: string;
  is_active: boolean;
  description: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'PulseGuard', slug: 'PULSEGUARD', member_price: 59, retail_price: 79, bv: 59, category: 'Software', is_active: true, description: 'Entry-level market intelligence platform' },
    { id: '2', name: 'PulseFlow', slug: 'PULSEFLOW', member_price: 129, retail_price: 149, bv: 129, category: 'Software', is_active: true, description: 'Advanced workflow automation suite' },
    { id: '3', name: 'PulseDrive', slug: 'PULSEDRIVE', member_price: 219, retail_price: 299, bv: 219, category: 'Software', is_active: true, description: 'Complete business management platform' },
    { id: '4', name: 'PulseCommand', slug: 'PULSECOMMAND', member_price: 349, retail_price: 499, bv: 349, category: 'Software', is_active: true, description: 'Enterprise command center solution' },
    { id: '5', name: 'SmartLock', slug: 'SMARTLOCK', member_price: 99, retail_price: 99, bv: 99, category: 'Hardware', is_active: true, description: 'Secure identity protection device' },
    { id: '6', name: 'Business Center', slug: 'BIZCENTER', member_price: 39, retail_price: 39, bv: 39, category: 'Service', is_active: true, description: 'Replicated business website' },
  ]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {router.push('/login'); return;}
      const { data: dist } = await supabase.from('distributors').select('role').eq('email', user.email).single();
      if (!dist || dist.role !== 'admin') {router.push('/dashboard'); return;}
      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  function toggleProductStatus(productId: string) {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, is_active: !p.is_active } : p
    ));
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A7D]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{minHeight: '100vh'}}>
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Bar */}
        <div className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <a href="/admin" className="text-xs text-gray-400 hover:text-[#1B3A7D] transition-colors">Command Center</a>
              <svg className="w-2 h-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-[#1B3A7D]">Products</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Product Catalog & Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-neutral-50">
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div key={product.id} className={`bg-white rounded-lg shadow-sm border p-5 transition-all ${product.is_active ? 'border-neutral-200' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-bold ${product.is_active ? 'text-[#0F2045]' : 'text-gray-500'}`}>{product.name}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">{product.category}</span>
                    </div>
                    <p className={`text-sm mb-3 ${product.is_active ? 'text-gray-600' : 'text-gray-400'}`}>{product.description}</p>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                        <p className="text-xs text-gray-500 mb-1">Member Price</p>
                        <p className="text-sm font-bold text-[#0F2045]">${product.member_price}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                        <p className="text-xs text-gray-500 mb-1">Retail Price</p>
                        <p className="text-sm font-bold text-[#0F2045]">${product.retail_price}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                        <p className="text-xs text-gray-500 mb-1">BV</p>
                        <p className="text-sm font-bold text-emerald-600">{product.bv}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-neutral-200">
                        <p className="text-xs text-gray-500 mb-1">Product ID</p>
                        <p className="text-sm font-mono font-semibold text-[#1B3A7D]">{product.slug}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button className="px-4 py-2 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${product.is_active ? 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200' : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100'}`}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
