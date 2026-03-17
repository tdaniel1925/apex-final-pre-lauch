import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickActions from './QuickActions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('QuickActions', () => {
  const mockPush = vi.fn();
  const mockDistributorSlug = 'test-distributor';

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3050',
      },
      writable: true,
    });

    // Mock window.open
    global.open = vi.fn();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it('should render all three action buttons', () => {
    render(<QuickActions distributorSlug={mockDistributorSlug} />);

    expect(screen.getByText('Enroll Rep')).toBeInTheDocument();
    expect(screen.getByText('Share Link')).toBeInTheDocument();
    expect(screen.getByText('Schedule Call')).toBeInTheDocument();
  });

  it('should navigate to team page when Enroll Rep is clicked', () => {
    render(<QuickActions distributorSlug={mockDistributorSlug} />);

    const enrollButton = screen.getByText('Enroll Rep');
    fireEvent.click(enrollButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/team?action=add-rep');
  });

  it('should copy referral link and show success toast when Share Link is clicked', async () => {
    render(<QuickActions distributorSlug={mockDistributorSlug} />);

    const shareButton = screen.getByText('Share Link');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:3050/test-distributor'
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Referral link copied to clipboard!',
        {
          description: 'http://localhost:3050/test-distributor',
          duration: 3000,
        }
      );
    });
  });

  it('should show error toast when clipboard copy fails', async () => {
    const clipboardError = new Error('Clipboard error');
    navigator.clipboard.writeText = vi.fn(() => Promise.reject(clipboardError));

    render(<QuickActions distributorSlug={mockDistributorSlug} />);

    const shareButton = screen.getByText('Share Link');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to copy link', {
        description: 'Please try again',
      });
    });
  });

  it('should open Calendly link and show info toast when Schedule Call is clicked', () => {
    render(<QuickActions distributorSlug={mockDistributorSlug} />);

    const scheduleButton = screen.getByText('Schedule Call');
    fireEvent.click(scheduleButton);

    expect(global.open).toHaveBeenCalledWith('https://calendly.com/theapexway', '_blank');
    expect(toast.info).toHaveBeenCalledWith('Opening calendar...', {
      description: 'Schedule a call with your team',
    });
  });
});
