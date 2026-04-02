// =============================================
// Video Training Card Component
// Trent Daniel's Sales Training - Opens Vimeo in Modal
// =============================================

'use client';

import { useState } from 'react';
import { Video, Play, X } from 'lucide-react';

export default function VideoTrainingCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Training Card */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-lg shadow-md border border-slate-200 p-6 h-48 flex flex-col hover:shadow-lg hover:border-blue-300 transition-all w-full"
      >
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Video className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Video Training
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Trent Daniel's Sales Training
          </p>

          {/* Play Button */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <Play className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">
              Watch Now
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="text-xs text-slate-500">
            Learn how to sell products effectively
          </p>
        </div>
      </button>

      {/* Vimeo Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full text-white transition-all"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Title */}
            <div className="bg-slate-900 text-white p-4">
              <h2 className="text-xl font-bold">Trent Daniel's Sales Training</h2>
              <p className="text-sm text-slate-300 mt-1">Learn professional selling techniques</p>
            </div>

            {/* Vimeo Embed */}
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1179716453?h=0&title=0&byline=0&portrait=0&autoplay=1"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Trent Daniel Sales Training"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
