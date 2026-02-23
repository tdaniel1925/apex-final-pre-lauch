'use client';

// ============================================================
// Content Card Component
// Displays social media content with download and copy features
// ============================================================

import { useState } from 'react';
import Image from 'next/image';

interface ContentCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  captionTemplate: string | null;
  hashtags: string | null;
  bestDay: string | null;
  distributorName: string;
  distributorCity: string;
  distributorWebsite: string;
}

export default function ContentCard({
  id,
  title,
  category,
  imageUrl,
  captionTemplate,
  hashtags,
  bestDay,
  distributorName,
  distributorCity,
  distributorWebsite,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);

  // Personalize caption with distributor data
  const personalizedCaption = captionTemplate
    ? captionTemplate
        .replace(/{NAME}/g, distributorName)
        .replace(/{CITY}/g, distributorCity)
        .replace(/{WEBSITE}/g, distributorWebsite)
    : '';

  const fullCaption = hashtags
    ? `${personalizedCaption}\n\n${hashtags}`
    : personalizedCaption;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative w-full h-64">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
            {category.replace('_', ' ')}
          </span>
        </div>

        {bestDay && (
          <p className="text-xs text-gray-500 mb-3">
            📅 Best day to post: {bestDay}
          </p>
        )}

        {personalizedCaption && (
          <div className="mb-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
              {fullCaption}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>

          {personalizedCaption && (
            <button
              onClick={handleCopyCaption}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Caption
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
