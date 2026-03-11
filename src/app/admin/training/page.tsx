'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface TrainingContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'quiz' | 'announcement';
  category: string;
  created_date: string;
  views: number;
  completion_rate: number;
  is_published: boolean;
}

export default function TrainingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [content, setContent] = useState<TrainingContent[]>([
    { id: '1', title: 'Welcome & Getting Started', description: 'Introduction to Apex and your business center', type: 'video', category: 'Onboarding', created_date: '2025-01-15', views: 2847, completion_rate: 94, is_published: true },
    { id: '2', title: 'Product Knowledge: PulseGuard', description: 'Complete overview of PulseGuard features and benefits', type: 'pdf', category: 'Product Training', created_date: '2025-02-01', views: 1920, completion_rate: 87, is_published: true },
    { id: '3', title: 'Compensation Plan Overview', description: 'Understanding the V7 waterfall and commission structure', type: 'video', category: 'Compensation', created_date: '2025-02-10', views: 3104, completion_rate: 91, is_published: true },
    { id: '4', title: 'Rank Advancement Quiz', description: 'Test your knowledge of rank qualifications', type: 'quiz', category: 'Assessment', created_date: '2025-02-20', views: 847, completion_rate: 78, is_published: true },
    { id: '5', title: 'New Product Launch: PulseFlow 2.0', description: 'Exciting updates and new features for PulseFlow', type: 'announcement', category: 'Announcements', created_date: '2025-03-05', views: 592, completion_rate: 65, is_published: true },
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

  function getTypeIcon(type: string) {
    if (type === 'video') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    if (type === 'pdf') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
    if (type === 'quiz') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    );
    if (type === 'announcement') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    );
  }

  function getTypeColor(type: string) {
    if (type === 'video') return 'bg-blue-100 text-blue-700';
    if (type === 'pdf') return 'bg-red-100 text-red-700';
    if (type === 'quiz') return 'bg-purple-100 text-purple-700';
    if (type === 'announcement') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
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
              <span className="text-xs font-semibold text-[#1B3A7D]">Training</span>
            </div>
            <h1 className="text-base font-bold text-[#0F2045] mt-0.5">Training & Content Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors" style={{background: 'linear-gradient(135deg, #1B3A7D 0%, #274693 100%)'}}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Content
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-neutral-50 space-y-4">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0F2045]">{item.title}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${item.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-xs font-semibold text-[#0F2045]">{item.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-xs font-semibold text-[#0F2045]">{item.created_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="text-xs font-bold text-blue-600">{item.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Completion Rate</p>
                        <p className="text-xs font-bold text-emerald-600">{item.completion_rate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3A7D] hover:text-[#0F2045] transition-colors" style={{background: 'rgba(27,58,125,0.07)', border: '1px solid rgba(27,58,125,0.15)'}}>
                    Edit
                  </button>
                  <button className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
