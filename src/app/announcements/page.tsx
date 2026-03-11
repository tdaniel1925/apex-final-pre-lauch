'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author: string;
  read: boolean;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categories = ['all', 'Company News', 'Product Updates', 'Training', 'Events', 'Recognition'];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: announcementsData } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (announcementsData) {
      setAnnouncements(announcementsData.map(a => ({
        ...a,
        read: false // In production, check against read_status table
      })));
    }

    setLoading(false);
  }

  const filteredAnnouncements = categoryFilter === 'all'
    ? announcements
    : announcements.filter(a => a.category === categoryFilter);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#0F2045]">News & Announcements</h1>
            <p className="text-gray-500 text-sm mt-1">Stay updated with the latest company news and updates.</p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  categoryFilter === category
                    ? 'bg-[#1B3A7D] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  announcement.read ? 'border-gray-100' : 'border-[#1B3A7D]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {!announcement.read && (
                        <span className="w-2 h-2 rounded-full bg-[#C7181F]"></span>
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {announcement.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F2045] mb-2">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-gray-500">Posted by {announcement.author || 'Apex Leadership'}</p>
                  </div>
                  <button className="text-[#1B3A7D] hover:text-[#0F2045] text-sm font-medium shrink-0">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAnnouncements.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <p className="text-gray-500 font-medium">No announcements available</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
