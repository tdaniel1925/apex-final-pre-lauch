// =============================================
// CEO Video Section Tests
// =============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CEOVideoSection from './CEOVideoSection';

describe('CEOVideoSection', () => {
  it('should render the video section with title and subtitle', () => {
    render(<CEOVideoSection />);

    expect(screen.getByText('Welcome Message from CEO')).toBeInTheDocument();
    expect(screen.getByText('Building Success Together')).toBeInTheDocument();
  });

  it('should render play button overlay', () => {
    render(<CEOVideoSection />);

    const playButton = screen.getByRole('button', { name: /play welcome video/i });
    expect(playButton).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CEOVideoSection />);

    const videoContainer = container.querySelector('.aspect-video');
    expect(videoContainer).toBeInTheDocument();
  });

  it('should display watch message text', () => {
    render(<CEOVideoSection />);

    expect(screen.getByText('Watch Welcome Message')).toBeInTheDocument();
  });
});
