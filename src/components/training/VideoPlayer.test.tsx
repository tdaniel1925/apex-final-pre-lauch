import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VideoPlayer, { VideoSource } from './VideoPlayer';

// Mock Video.js with proper hoisting
const { mockPlayerInstance } = vi.hoisted(() => {
  const instance = {
    playlist: vi.fn(),
    playlistUi: vi.fn(),
    on: vi.fn(),
    dispose: vi.fn(),
    error: vi.fn() as any,
    currentItem: vi.fn(() => 0),
  };

  return { mockPlayerInstance: instance };
});

vi.mock('video.js', () => {
  const videojs = vi.fn(() => mockPlayerInstance);

  return {
    default: videojs,
  };
});

// Mock Video.js CSS imports
vi.mock('video.js/dist/video-js.css', () => ({}));
vi.mock('videojs-playlist', () => ({}));
vi.mock('videojs-playlist-ui', () => ({}));
vi.mock('videojs-playlist-ui/dist/videojs-playlist-ui.css', () => ({}));

describe('VideoPlayer', () => {
  const mockPlaylist: VideoSource[] = [
    {
      id: 'video-1',
      title: 'Test Video 1',
      description: 'Description for test video 1',
      sources: [
        {
          src: 'https://example.com/video1.mp4',
          type: 'video/mp4',
        },
      ],
      duration: '5:00',
    },
    {
      id: 'video-2',
      title: 'Test Video 2',
      description: 'Description for test video 2',
      sources: [
        {
          src: 'https://example.com/video2.mp4',
          type: 'video/mp4',
        },
      ],
      duration: '10:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should render video player with playlist', async () => {
      render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Description for test video 1')).toBeInTheDocument();
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    it('should display video info section', async () => {
      render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument();
        expect(screen.getByText('Video 1 of 2')).toBeInTheDocument();
      });
    });

    it('should pass autoplay prop to Video.js', async () => {
      const videojs = (await import('video.js')).default;

      render(<VideoPlayer playlist={mockPlaylist} autoplay={true} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      const videojsCall = (videojs as any).mock.calls[0];
      const options = videojsCall[1];
      expect(options.autoplay).toBe(true);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VideoPlayer playlist={mockPlaylist} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should call onVideoChange callback when provided', async () => {
      const onVideoChange = vi.fn();
      const videojs = (await import('video.js')).default;

      render(<VideoPlayer playlist={mockPlaylist} onVideoChange={onVideoChange} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      // Simulate playlistitem event
      const playlistitemHandler = mockPlayerInstance.on.mock.calls.find(
        (call: any) => call[0] === 'playlistitem'
      )?.[1];

      if (playlistitemHandler) {
        mockPlayerInstance.currentItem = vi.fn(() => 1);
        playlistitemHandler();

        expect(onVideoChange).toHaveBeenCalledWith(mockPlaylist[1], 1);
      }
    });

    it('should call onVideoEnd callback when video ends', async () => {
      const onVideoEnd = vi.fn();
      const videojs = (await import('video.js')).default;

      render(<VideoPlayer playlist={mockPlaylist} onVideoEnd={onVideoEnd} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      // Simulate ended event
      const endedHandler = mockPlayerInstance.on.mock.calls.find(
        (call: any) => call[0] === 'ended'
      )?.[1];

      if (endedHandler) {
        mockPlayerInstance.currentItem = vi.fn(() => 0);
        endedHandler();

        expect(onVideoEnd).toHaveBeenCalledWith(mockPlaylist[0]);
      }
    });
  });

  describe('Error Cases', () => {
    it('should display error message when playlist is empty', () => {
      render(<VideoPlayer playlist={[]} />);

      expect(screen.getByText('Video Player Error')).toBeInTheDocument();
      expect(screen.getByText('No videos available in playlist')).toBeInTheDocument();
    });

    it('should display error message when playlist is undefined', () => {
      render(<VideoPlayer playlist={undefined as any} />);

      expect(screen.getByText('Video Player Error')).toBeInTheDocument();
      expect(screen.getByText('No videos available in playlist')).toBeInTheDocument();
    });

    it('should handle Video.js initialization error gracefully', async () => {
      const videojs = (await import('video.js')).default;

      // Mock Video.js to throw error
      (videojs as any).mockImplementationOnce(() => {
        throw new Error('Video.js initialization failed');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Video.js initialization error:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle player disposal error gracefully', async () => {
      const videojs = (await import('video.js')).default;

      // Mock dispose to throw error
      mockPlayerInstance.dispose.mockImplementationOnce(() => {
        throw new Error('Disposal failed');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error disposing video player:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should display playback error when Video.js reports error', async () => {
      const videojs = (await import('video.js')).default;

      render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      // Simulate error event
      const errorHandler = mockPlayerInstance.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        mockPlayerInstance.error.mockReturnValueOnce({
          message: 'Network error',
        });

        errorHandler();

        await waitFor(() => {
          expect(screen.getByText('Video Player Error')).toBeInTheDocument();
          expect(screen.getByText(/Video playback error: Network error/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle video with missing duration', async () => {
      const playlistWithoutDuration: VideoSource[] = [
        {
          id: 'video-3',
          title: 'Video Without Duration',
          sources: [
            {
              src: 'https://example.com/video3.mp4',
              type: 'video/mp4',
            },
          ],
        },
      ];

      render(<VideoPlayer playlist={playlistWithoutDuration} />);

      await waitFor(() => {
        expect(screen.getByText('Video Without Duration')).toBeInTheDocument();
      });

      // Should not display duration if not provided
      expect(screen.queryByText(/\d+:\d+/)).not.toBeInTheDocument();
    });

    it('should handle video with missing description', async () => {
      const playlistWithoutDescription: VideoSource[] = [
        {
          id: 'video-4',
          title: 'Video Without Description',
          sources: [
            {
              src: 'https://example.com/video4.mp4',
              type: 'video/mp4',
            },
          ],
        },
      ];

      render(<VideoPlayer playlist={playlistWithoutDescription} />);

      await waitFor(() => {
        expect(screen.getByText('Video Without Description')).toBeInTheDocument();
      });
    });

    it('should clean up player on unmount', async () => {
      const videojs = (await import('video.js')).default;

      const { unmount } = render(<VideoPlayer playlist={mockPlaylist} />);

      await waitFor(() => {
        expect(videojs).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockPlayerInstance.dispose).toHaveBeenCalled();
      });
    });
  });
});
