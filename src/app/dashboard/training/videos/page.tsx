import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VideoPlayer, { VideoSource } from '@/components/training/VideoPlayer';

// Training video categories and playlists
const trainingCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential videos for new distributors',
    videos: [
      {
        id: 'welcome',
        title: 'Welcome to Apex Affinity Group',
        description: 'Learn about our mission, values, and what makes Apex different',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/welcome.jpg',
        duration: '5:32',
      },
      {
        id: 'dashboard-tour',
        title: 'Dashboard Overview',
        description: 'Navigate your distributor dashboard with confidence',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/dashboard.jpg',
        duration: '7:15',
      },
      {
        id: 'first-steps',
        title: 'Your First 30 Days',
        description: 'Action plan for launching your Apex business',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/first-steps.jpg',
        duration: '12:48',
      },
    ],
  },
  {
    id: 'compensation',
    name: 'Compensation Plan',
    description: 'Understand how you earn with Apex',
    videos: [
      {
        id: 'comp-overview',
        title: 'Compensation Plan Overview',
        description: 'How the Apex compensation structure works',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/comp-plan.jpg',
        duration: '15:22',
      },
      {
        id: 'matrix-explained',
        title: 'Understanding the Matrix',
        description: 'How the 2x15 forced matrix builds your income',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/matrix.jpg',
        duration: '10:45',
      },
      {
        id: 'bonuses',
        title: 'Bonuses and Incentives',
        description: 'Additional earning opportunities at Apex',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/bonuses.jpg',
        duration: '8:30',
      },
    ],
  },
  {
    id: 'products',
    name: 'Product Training',
    description: 'Master our product offerings',
    videos: [
      {
        id: 'products-overview',
        title: 'Apex Products Overview',
        description: 'Introduction to all Apex products and services',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/products.jpg',
        duration: '18:00',
      },
      {
        id: 'product-demo',
        title: 'Product Demonstration',
        description: 'See our products in action',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/demo.jpg',
        duration: '22:15',
      },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership Development',
    description: 'Build and lead your team',
    videos: [
      {
        id: 'building-team',
        title: 'Building Your Team',
        description: 'Strategies for recruiting and onboarding new distributors',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/team-building.jpg',
        duration: '16:40',
      },
      {
        id: 'leadership-skills',
        title: 'Leadership Essentials',
        description: 'Core skills every Apex leader needs',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/leadership.jpg',
        duration: '20:05',
      },
    ],
  },
  {
    id: 'success-stories',
    name: 'Success Stories',
    description: 'Inspiration from top Apex achievers',
    videos: [
      {
        id: 'story-1',
        title: 'From Zero to Diamond in 6 Months',
        description: 'How Sarah built a thriving Apex business',
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/success-1.jpg',
        duration: '12:20',
      },
      {
        id: 'story-2',
        title: 'Building Passive Income with Apex',
        description: "John's journey to financial freedom",
        sources: [
          {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            type: 'video/mp4',
          },
        ],
        thumbnail: '/videos/thumbnails/success-2.jpg',
        duration: '14:55',
      },
    ],
  },
];

export default async function TrainingVideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Get distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, auth_user_id, first_name, last_name, rank')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg
              className="w-8 h-8 text-[#2B4C7E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Training Videos</h1>
          </div>
          <p className="text-gray-600">
            Master your Apex business with these comprehensive training videos
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {trainingCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-[#2B4C7E] to-[#567EBB] px-6 py-4">
                <h2 className="text-xl font-bold text-white">{category.name}</h2>
                <p className="text-blue-100 text-sm mt-1">{category.description}</p>
              </div>

              {/* Video Player */}
              <div className="p-6">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B4C7E]"></div>
                    </div>
                  }
                >
                  <VideoPlayer
                    playlist={category.videos}
                    autoplay={false}
                    onVideoChange={(video, index) => {
                      // Track video change - TODO: Send to analytics service
                    }}
                    onVideoEnd={(video) => {
                      // Track video completion - TODO: Store in database
                    }}
                  />
                </Suspense>
              </div>

              {/* Video List */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Videos in this series ({category.videos.length})
                </h3>
                <div className="space-y-2">
                  {category.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200 hover:border-[#2B4C7E] transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[#2B4C7E] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">{video.description}</p>
                      </div>
                      {video.duration && (
                        <div className="flex-shrink-0 text-xs text-gray-500 font-medium">
                          {video.duration}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Need Help?</h3>
              <p className="text-sm text-blue-800">
                If you have questions about any training video, reach out to your sponsor or contact
                support at{' '}
                <a
                  href="mailto:support@theapexway.net"
                  className="underline hover:text-blue-900"
                >
                  support@theapexway.net
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
