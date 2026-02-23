'use client';

// ============================================================
// Social Media Hub Component
// Main interface for distributors to access social content
// ============================================================

import { useState } from 'react';
import ContentCard from './ContentCard';
import QRCodeGenerator from './QRCodeGenerator';

interface SocialContent {
  id: string;
  title: string;
  category: string;
  image_url: string;
  caption_template: string | null;
  hashtags: string | null;
  best_day: string | null;
}

interface Distributor {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  city?: string;
}

interface SocialMediaHubProps {
  content: SocialContent[];
  distributor: Distributor;
}

const CATEGORIES = [
  { value: 'all', label: 'All Content' },
  { value: 'personal', label: 'Personal Branding' },
  { value: 'educational', label: 'Educational' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'testimonial', label: 'Testimonials' },
  { value: 'recruiting', label: 'Recruiting' },
];

export default function SocialMediaHub({ content, distributor }: SocialMediaHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQR, setShowQR] = useState(false);

  const filteredContent = selectedCategory === 'all'
    ? content
    : content.filter((item) => item.category === selectedCategory);

  const distributorName = `${distributor.first_name} ${distributor.last_name}`;
  const distributorCity = distributor.city || 'Your City';
  const distributorWebsite = `https://theapexway.net/${distributor.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media Content Library</h1>
        <p className="text-sm text-gray-600 mt-1">
          Download pre-made graphics and captions to promote your business
        </p>
      </div>

      {/* QR Code Section */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowQR(!showQR)}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          {showQR ? 'Hide QR Code' : 'Generate QR Code'}
        </button>
      </div>

      {showQR && (
        <QRCodeGenerator
          distributorSlug={distributor.slug}
          distributorName={distributorName}
        />
      )}

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">🚀 How to Maximize Your Social Media Impact</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">📱 Posting Strategy:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Post 3-5 times per week for best results</li>
              <li>Mix content types (educational, personal, CTA)</li>
              <li>Check "Best day to post" recommendations</li>
              <li>Personalize captions with your own touch</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">💡 Pro Tips:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Download images and use native uploads</li>
              <li>Copy captions but add your personal story</li>
              <li>Tag relevant clients (with permission)</li>
              <li>Respond to all comments within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = cat.value === 'all'
            ? content.length
            : content.filter((c) => c.category === cat.value).length;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Content</p>
          <p className="text-2xl font-bold text-gray-900">{content.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Your Website</p>
          <p className="text-sm font-semibold text-blue-600 truncate">{distributorWebsite}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-2xl font-bold text-gray-900">📅 3-5</p>
          <p className="text-xs text-gray-500">Recommended posts</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Best Platforms</p>
          <p className="text-sm font-semibold text-gray-900">Instagram • Facebook</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <ContentCard
            key={item.id}
            id={item.id}
            title={item.title}
            category={item.category}
            imageUrl={item.image_url}
            captionTemplate={item.caption_template}
            hashtags={item.hashtags}
            bestDay={item.best_day}
            distributorName={distributorName}
            distributorCity={distributorCity}
            distributorWebsite={distributorWebsite}
          />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No content available in this category yet.</p>
          <p className="text-sm">Check back soon for new content!</p>
        </div>
      )}
    </div>
  );
}
