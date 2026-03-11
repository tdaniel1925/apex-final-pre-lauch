'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface TrainingContent {
  id: string;
  title: string;
  category: string;
  type: 'video' | 'pdf' | 'quiz';
  duration?: string;
  required: boolean;
  completed: boolean;
  description: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [trainingContent, setTrainingContent] = useState<TrainingContent[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const categories = ['all', 'Getting Started', 'Sales Training', 'Product Knowledge', 'Compliance'];

  useEffect(() => {
    loadTraining();
  }, []);

  async function loadTraining() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('distributors')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    // Get training content
    const { data: contentData } = await supabase
      .from('training_content')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true });

    // Get completion status
    const { data: completions } = await supabase
      .from('training_completions')
      .select('content_id')
      .eq('distributor_id', profile.id);

    const completedIds = new Set(completions?.map(c => c.content_id) || []);

    if (contentData) {
      const formattedContent: TrainingContent[] = contentData.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        type: c.type,
        duration: c.duration,
        required: c.required || false,
        completed: completedIds.has(c.id),
        description: c.description || ''
      }));

      setTrainingContent(formattedContent);
    }

    setLoading(false);
  }

  const filteredContent = activeCategory === 'all'
    ? trainingContent
    : trainingContent.filter(c => c.category === activeCategory);

  const completionPercentage = trainingContent.length > 0
    ? Math.round((trainingContent.filter(c => c.completed).length / trainingContent.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading training...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Training Center</h1>
              <p className="text-gray-500 text-sm mt-1">Complete training modules to grow your business.</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[#0F2045]">Overall Progress</h3>
              <span className="text-2xl font-bold text-[#1B3A7D]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${completionPercentage}%`,
                  background: 'linear-gradient(to right, #1B3A7D, #C7181F)'
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {trainingContent.filter(c => c.completed).length} of {trainingContent.length} modules completed
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? 'bg-[#1B3A7D] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All Modules' : category}
              </button>
            ))}
          </div>

          {/* Training Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((content) => (
              <div key={content.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header with icon based on type */}
                <div className={`h-32 flex items-center justify-center ${
                  content.type === 'video' ? 'bg-gradient-to-br from-[#1B3A7D] to-[#0F2045]' :
                  content.type === 'pdf' ? 'bg-gradient-to-br from-[#C7181F] to-[#9B1318]' :
                  'bg-gradient-to-br from-emerald-600 to-emerald-700'
                }`}>
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {content.type === 'video' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {content.type === 'pdf' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />}
                    {content.type === 'quiz' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
                  </svg>
                </div>

                <div className="p-5">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      content.type === 'video' ? 'bg-[#E8EAF2] text-[#1B3A7D]' :
                      content.type === 'pdf' ? 'bg-[#FBE8E9] text-[#C7181F]' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {content.type}
                    </span>
                    {content.required && (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-amber-100 text-amber-700">
                        Required
                      </span>
                    )}
                    {content.completed && (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Complete
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#0F2045] mb-2">{content.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{content.category}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{content.description}</p>

                  {content.duration && (
                    <p className="text-xs text-gray-500 mb-4">
                      <svg className="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {content.duration}
                    </p>
                  )}

                  <button
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      content.completed
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'text-white shadow-sm'
                    }`}
                    style={content.completed ? {} : { background: '#1B3A7D' }}
                  >
                    {content.completed ? 'Review' : 'Start Learning'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500 font-medium">No training content available</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
