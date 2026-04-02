// =============================================
// Dashboard Cards Tests
// Test suite for dashboard card components
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardTopCards from '@/components/dashboard/DashboardTopCards';
import AudioPlayerCard from '@/components/dashboard/AudioPlayerCard';
import AIAssistantCard from '@/components/dashboard/AIAssistantCard';
import VideoTrainingCard from '@/components/dashboard/VideoTrainingCard';

// Mock fetch for RaceTo100Card
global.fetch = vi.fn();

describe('DashboardTopCards', () => {
  const mockDistributorId = 'test-distributor-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        progress: {
          totalPoints: 45,
          currentStep: 3,
          nextStepName: 'Complete Profile',
          isCompleted: false,
        },
      }),
    });
  });

  it('should render the dashboard cards grid', () => {
    const { container } = render(<DashboardTopCards distributorId={mockDistributorId} />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-4');
  });

  it('should render at least 3 card components', () => {
    render(<DashboardTopCards distributorId={mockDistributorId} />);
    // The grid should contain 3-4 cards (RaceTo100Card may be hidden if completed)
    const { container } = render(<DashboardTopCards distributorId={mockDistributorId} />);
    const grid = container.querySelector('.grid');
    expect(grid?.children.length).toBeGreaterThanOrEqual(3);
  });
});

describe('AudioPlayerCard', () => {
  it('should render audio player with training audio title', () => {
    render(<AudioPlayerCard />);
    expect(screen.getByText('Training Audio')).toBeTruthy();
    expect(screen.getByText('How to Build Your Business')).toBeTruthy();
  });

  it('should have play button', () => {
    render(<AudioPlayerCard />);
    const playButton = screen.getByLabelText('Play');
    expect(playButton).toBeTruthy();
  });

  it('should display time in correct format', () => {
    render(<AudioPlayerCard />);
    // Should show 0:00 initially
    const timeDisplays = screen.getAllByText('0:00');
    expect(timeDisplays.length).toBeGreaterThan(0);
  });
});

describe('AIAssistantCard', () => {
  it('should render AI assistant card', () => {
    render(<AIAssistantCard />);
    expect(screen.getByText('Apex AI Assistant')).toBeTruthy();
  });

  it('should have description text', () => {
    render(<AIAssistantCard />);
    expect(screen.getByText(/Your personal coach to learn, grow, and succeed/i)).toBeTruthy();
  });

  it('should be clickable button', () => {
    render(<AIAssistantCard />);
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should dispatch custom event on click', () => {
    const eventSpy = vi.fn();
    window.addEventListener('openAIChat', eventSpy);

    render(<AIAssistantCard />);
    const button = screen.getByRole('button');
    button.click();

    expect(eventSpy).toHaveBeenCalled();
    window.removeEventListener('openAIChat', eventSpy);
  });
});

describe('VideoTrainingCard', () => {
  it('should render video training card', () => {
    render(<VideoTrainingCard />);
    expect(screen.getByText('Video Training')).toBeTruthy();
  });

  it('should show coming soon badge', () => {
    render(<VideoTrainingCard />);
    expect(screen.getByText('Coming Soon')).toBeTruthy();
  });

  it('should mention Trent Daniel', () => {
    render(<VideoTrainingCard />);
    expect(screen.getByText("Trent Daniel's Sales Training")).toBeTruthy();
  });

  it('should have description about selling products', () => {
    render(<VideoTrainingCard />);
    expect(screen.getByText(/Learn how to sell products effectively/i)).toBeTruthy();
  });
});

describe('Dashboard Cards Integration', () => {
  it('should maintain consistent height across all cards', () => {
    const { container: audioContainer } = render(<AudioPlayerCard />);
    const { container: aiContainer } = render(<AIAssistantCard />);
    const { container: videoContainer } = render(<VideoTrainingCard />);

    const audioCard = audioContainer.firstChild as HTMLElement;
    const aiCard = aiContainer.firstChild as HTMLElement;
    const videoCard = videoContainer.firstChild as HTMLElement;

    // All cards should have h-48 class (192px height)
    expect(audioCard.className).toContain('h-48');
    expect(aiCard.className).toContain('h-48');
    expect(videoCard.className).toContain('h-48');
  });

  it('should have consistent styling patterns', () => {
    const { container: audioContainer } = render(<AudioPlayerCard />);
    const { container: aiContainer } = render(<AIAssistantCard />);
    const { container: videoContainer } = render(<VideoTrainingCard />);

    const audioCard = audioContainer.firstChild as HTMLElement;
    const aiCard = aiContainer.firstChild as HTMLElement;
    const videoCard = videoContainer.firstChild as HTMLElement;

    // All should be rounded-lg
    expect(audioCard.className).toContain('rounded-lg');
    expect(aiCard.className).toContain('rounded-lg');
    expect(videoCard.className).toContain('rounded-lg');

    // All should have shadow
    expect(audioCard.className).toContain('shadow');
    expect(aiCard.className).toContain('shadow');
    expect(videoCard.className).toContain('shadow');
  });
});
