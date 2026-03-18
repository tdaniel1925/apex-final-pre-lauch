'use client';

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import 'videojs-playlist';
import 'videojs-playlist-ui';
import 'videojs-playlist-ui/dist/videojs-playlist-ui.css';

// Extend Video.js Player type to include playlist plugin
interface VideoJsPlayer extends Player {
  playlist: (playlist?: VideoSource[]) => VideoSource[] | void;
  playlistUi: () => void;
  currentItem: () => number;
}

export interface VideoSource {
  id: string;
  title: string;
  description?: string;
  sources: {
    src: string;
    type: string;
  }[];
  thumbnail?: string;
  duration?: string;
}

export interface VideoPlayerProps {
  playlist: VideoSource[];
  autoplay?: boolean;
  className?: string;
  onVideoChange?: (video: VideoSource, index: number) => void;
  onVideoEnd?: (video: VideoSource) => void;
}

export default function VideoPlayer({
  playlist,
  autoplay = false,
  className = '',
  onVideoChange,
  onVideoEnd,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify playlist has videos
    if (!playlist || playlist.length === 0) {
      setError('No videos available in playlist');
      return;
    }

    // Initialize Video.js player
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video');
      videoElement.className = 'video-js vjs-big-play-centered';
      videoRef.current.appendChild(videoElement);

      try {
        const player = videojs(videoElement, {
          controls: true,
          responsive: true,
          fluid: true,
          preload: 'auto',
          autoplay: autoplay,
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
        }) as VideoJsPlayer;

        // Load playlist
        player.playlist(playlist);
        player.playlistUi();

        // Event listeners
        player.on('play', () => {
          setIsPlaying(true);
        });

        player.on('pause', () => {
          setIsPlaying(false);
        });

        player.on('playlistitem', () => {
          const currentIndex = player.currentItem();
          setCurrentVideoIndex(currentIndex);

          if (onVideoChange && playlist[currentIndex]) {
            onVideoChange(playlist[currentIndex], currentIndex);
          }
        });

        player.on('ended', () => {
          const currentIndex = player.currentItem();
          if (onVideoEnd && playlist[currentIndex]) {
            onVideoEnd(playlist[currentIndex]);
          }
        });

        player.on('error', () => {
          const error = player.error();
          if (error) {
            setError(`Video playback error: ${error.message || 'Unknown error'}`);
          }
        });

        playerRef.current = player;
      } catch (err) {
        setError('Failed to initialize video player');
        console.error('Video.js initialization error:', err);
      }
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
        } catch (err) {
          console.error('Error disposing video player:', err);
        }
      }
    };
  }, [playlist, autoplay, onVideoChange, onVideoEnd]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Video Player Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist || playlist.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
        <p className="text-sm text-gray-600">Check back later for training videos</p>
      </div>
    );
  }

  return (
    <div className={`video-player-wrapper ${className}`}>
      <div
        ref={videoRef}
        className="video-player-container"
        style={{
          width: '100%',
          maxWidth: '100%',
        }}
      />

      {/* Video Info */}
      {playlist[currentVideoIndex] && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {playlist[currentVideoIndex].title}
          </h3>
          {playlist[currentVideoIndex].description && (
            <p className="text-sm text-gray-600">
              {playlist[currentVideoIndex].description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>
              Video {currentVideoIndex + 1} of {playlist.length}
            </span>
            {playlist[currentVideoIndex].duration && (
              <span>{playlist[currentVideoIndex].duration}</span>
            )}
            <span
              className={`px-2 py-1 rounded ${
                isPlaying
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .video-js {
          font-family: inherit;
        }

        .video-js .vjs-big-play-button {
          background-color: rgba(43, 76, 126, 0.9);
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 48px;
        }

        .video-js .vjs-big-play-button:hover {
          background-color: rgba(43, 76, 126, 1);
        }

        .vjs-playlist {
          max-height: 500px;
          overflow-y: auto;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-top: 16px;
        }

        .vjs-playlist-item {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .vjs-playlist-item:hover {
          background-color: #e5e7eb;
        }

        .vjs-playlist-item.vjs-selected {
          background-color: #dbeafe;
          border-left: 4px solid #2B4C7E;
        }

        .vjs-playlist-name {
          font-weight: 600;
          color: #1f2937;
        }

        .vjs-playlist-duration {
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
