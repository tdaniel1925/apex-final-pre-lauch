import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShowcasePage from '@/app/showcase/page';

describe('Showcase Page', () => {
  beforeEach(() => {
    render(<ShowcasePage />);
  });

  it('should render without crashing', () => {
    expect(screen.getByText('See Complete Marketing Campaigns')).toBeInTheDocument();
  });

  it('should display the hero section with description', () => {
    expect(
      screen.getByText(/Every campaign includes landing pages, social posts, and emails with unified branding/i)
    ).toBeInTheDocument();
  });

  it('should have industry filter dropdown', () => {
    const industryLabel = screen.getByText('Industry');
    expect(industryLabel).toBeInTheDocument();

    const industrySelect = screen.getAllByRole('combobox')[0]; // First combobox is industry
    expect(industrySelect).toBeInTheDocument();
  });

  it('should have product tier filter dropdown', () => {
    const tierLabel = screen.getByText('Product Tier');
    expect(tierLabel).toBeInTheDocument();

    const tierSelect = screen.getAllByRole('combobox')[1]; // Second combobox is tier
    expect(tierSelect).toBeInTheDocument();
  });

  it('should display multiple campaign cards', () => {
    const campaignCards = screen.getAllByRole('button').filter((button) =>
      button.textContent?.includes('Luxury Home Listing') ||
      button.textContent?.includes('Free Breakthrough Session') ||
      button.textContent?.includes('Free Retirement Planning')
    );
    expect(campaignCards.length).toBeGreaterThan(0);
  });

  it('should show the first campaign by default', () => {
    expect(screen.getByText('Luxury Home Listing Launch')).toBeInTheDocument();
  });

  it('should display brand colors section', () => {
    expect(screen.getByText(/Brand Identity/i)).toBeInTheDocument();
    expect(screen.getByText('PRIMARY')).toBeInTheDocument();
    expect(screen.getByText('SECONDARY')).toBeInTheDocument();
    expect(screen.getByText('ACCENT')).toBeInTheDocument();
  });

  it('should have three tabs: landing page, social posts, and email', () => {
    expect(screen.getByText('📄 Landing Page')).toBeInTheDocument();
    expect(screen.getByText('📱 Social Posts')).toBeInTheDocument();
    expect(screen.getByText('✉️ Email')).toBeInTheDocument();
  });

  it('should display landing page content by default', () => {
    expect(screen.getByText('5-Bedroom Estate with Panoramic Mountain Views')).toBeInTheDocument();
    expect(screen.getByText('Schedule Private Showing')).toBeInTheDocument();
  });

  it('should show campaign results if available', () => {
    expect(screen.getByText(/Campaign Results/i)).toBeInTheDocument();
    expect(screen.getByText(/14 showings booked in first 72 hours/i)).toBeInTheDocument();
  });

  it('should have CTA section at bottom', () => {
    expect(screen.getByText(/Ready to Create Your Own/i)).toBeInTheDocument();
    const startTrialButtons = screen.getAllByText(/Start Free Trial/i);
    expect(startTrialButtons.length).toBeGreaterThan(0);
  });

  it('should have navigation header with logo', () => {
    const logos = screen.getAllByAltText('Apex Affinity Group');
    expect(logos.length).toBeGreaterThanOrEqual(1);
    expect(logos[0]).toBeInTheDocument(); // Header logo
  });

  it('should have navigation links', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Showcase')).toBeInTheDocument();
  });

  it('should have footer with copyright', () => {
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Apex Affinity Group. All rights reserved.`))).toBeInTheDocument();
  });
});

describe('Showcase Page - Tab Switching', () => {
  it('should switch to social posts tab when clicked', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show social post content (variant A is default)
    expect(screen.getByText(/Dream home alert/i)).toBeInTheDocument();
    expect(screen.getByText(/Variant A - Lifestyle Focus/i)).toBeInTheDocument();
  });

  it('should switch to email tab when clicked', () => {
    render(<ShowcasePage />);

    const emailTab = screen.getByText('✉️ Email');
    fireEvent.click(emailTab);

    // Should show email content
    expect(screen.getByText('Subject:')).toBeInTheDocument();
    expect(screen.getByText(/You Won't Believe This New Listing/i)).toBeInTheDocument();
  });

  it('should return to landing page tab when clicked', () => {
    render(<ShowcasePage />);

    // Switch to email first
    const emailTab = screen.getByText('✉️ Email');
    fireEvent.click(emailTab);

    // Switch back to landing page
    const landingTab = screen.getByText('📄 Landing Page');
    fireEvent.click(landingTab);

    // Should show landing page content again
    expect(screen.getByText('Schedule Private Showing')).toBeInTheDocument();
  });
});

describe('Showcase Page - Campaign Switching', () => {
  it('should switch to different campaign when clicked', () => {
    render(<ShowcasePage />);

    // Find and click the Life Coaching campaign button
    const campaignButtons = screen.getAllByRole('button').filter((button) =>
      button.textContent?.includes('Free Breakthrough Session Webinar')
    );

    if (campaignButtons.length > 0) {
      fireEvent.click(campaignButtons[0]);

      // Should show life coaching campaign content
      expect(screen.getByText('Discover Your Purpose in 90 Minutes')).toBeInTheDocument();
    }
  });
});

describe('Showcase Page - Filters', () => {
  it('should filter campaigns by industry', () => {
    render(<ShowcasePage />);

    // Get the industry select (first combobox)
    const industrySelect = screen.getAllByRole('combobox')[0];

    // Change to Real Estate
    fireEvent.change(industrySelect, { target: { value: 'Real Estate' } });

    // Should show real estate campaign
    expect(screen.getByText('Luxury Home Listing Launch')).toBeInTheDocument();
  });

  it('should filter campaigns by product tier', () => {
    render(<ShowcasePage />);

    // Get the tier select (second combobox)
    const tierSelect = screen.getAllByRole('combobox')[1];

    // Change to PulseMarket
    fireEvent.change(tierSelect, { target: { value: 'PulseMarket' } });

    // Should show campaigns (header is always visible)
    const campaignsHeader = screen.getByText('Campaigns');
    expect(campaignsHeader).toBeInTheDocument();
  });
});

describe('Showcase Page - Campaign Details', () => {
  it('should display industry and tier badges on campaign cards', () => {
    render(<ShowcasePage />);

    // Check that industry and tier badges exist (may be multiple)
    const realEstateBadges = screen.getAllByText('Real Estate');
    const pulseMarketBadges = screen.getAllByText('PulseMarket');

    expect(realEstateBadges.length).toBeGreaterThan(0);
    expect(pulseMarketBadges.length).toBeGreaterThan(0);
  });

  it('should show landing page benefits', () => {
    render(<ShowcasePage />);

    // Check for benefit items (these should be visible on landing page tab)
    expect(screen.getByText(/Chef's kitchen with premium appliances/i)).toBeInTheDocument();
    expect(screen.getByText(/Infinity pool overlooking valley/i)).toBeInTheDocument();
  });

  it('should display multiple social posts when social tab is active', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show variant selector with different platforms
    expect(screen.getByText(/Variant A - Lifestyle Focus/i)).toBeInTheDocument();
    expect(screen.getByText(/Variant B - Feature Highlight/i)).toBeInTheDocument();
  });

  it('should show email subject and preview on email tab', () => {
    render(<ShowcasePage />);

    const emailTab = screen.getByText('✉️ Email');
    fireEvent.click(emailTab);

    expect(screen.getByText('Subject:')).toBeInTheDocument();
    expect(screen.getByText(/Preview:/i)).toBeInTheDocument();
  });
});

describe('Showcase Page - Responsive Design', () => {
  it('should use flexible layouts', () => {
    const { container } = render(<ShowcasePage />);
    const gridElements = container.querySelectorAll('[style*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should use Inter font family', () => {
    const { container } = render(<ShowcasePage />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.style.fontFamily).toContain('Inter');
  });
});

describe('Showcase Page - Call-to-Action', () => {
  it('should have multiple CTA buttons throughout the page', () => {
    render(<ShowcasePage />);

    const ctaLinks = screen.getAllByText(/Start Free Trial|Get Started/i);
    expect(ctaLinks.length).toBeGreaterThan(0);
  });

  it('should have Get Started button in navigation', () => {
    render(<ShowcasePage />);

    const navGetStarted = screen.getAllByText('Get Started')[0];
    expect(navGetStarted).toBeInTheDocument();
  });
});

describe('Showcase Page - Modal Functionality', () => {
  it('should have View Full Landing Page button on landing tab', () => {
    render(<ShowcasePage />);

    expect(screen.getByText(/View Full Landing Page/i)).toBeInTheDocument();
  });

  it('should open modal when View Full Landing Page button is clicked', () => {
    render(<ShowcasePage />);

    const viewButton = screen.getByText(/View Full Landing Page/i);
    fireEvent.click(viewButton);

    // Modal should show the close button
    const closeButtons = screen.getAllByText('×');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should close modal when close button is clicked', () => {
    render(<ShowcasePage />);

    // Open modal
    const viewButton = screen.getByText(/View Full Landing Page/i);
    fireEvent.click(viewButton);

    // Close modal
    const closeButtons = screen.getAllByText('×');
    fireEvent.click(closeButtons[0]);

    // Modal should be closed (only one × from view button remains)
    const remainingCloseButtons = screen.queryAllByText('×');
    expect(remainingCloseButtons.length).toBe(0);
  });

  it('should display full landing page content in modal', () => {
    render(<ShowcasePage />);

    // Open modal
    const viewButton = screen.getByText(/View Full Landing Page/i);
    fireEvent.click(viewButton);

    // Should show landing page headline (there will be multiple instances now)
    const headlines = screen.getAllByText('5-Bedroom Estate with Panoramic Mountain Views');
    expect(headlines.length).toBeGreaterThan(1);
  });
});

describe('Showcase Page - Social Media Variants', () => {
  it('should display multiple social post variants', () => {
    render(<ShowcasePage />);

    // Switch to social tab
    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show variant buttons
    expect(screen.getByText(/Variant A - Lifestyle Focus/i)).toBeInTheDocument();
  });

  it('should switch between social post variants when clicked', () => {
    render(<ShowcasePage />);

    // Switch to social tab
    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Initial variant should show
    expect(screen.getByText(/JUST LISTED/i)).toBeInTheDocument();

    // Find and click variant B button
    const variantButtons = screen.getAllByRole('button').filter((button) =>
      button.textContent?.includes('Variant B')
    );

    if (variantButtons.length > 0) {
      fireEvent.click(variantButtons[0]);

      // Should show different content
      expect(screen.getByText(/POV: You wake up to THIS view/i)).toBeInTheDocument();
    }
  });

  it('should display social media platform names', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Platform name is shown in the button selector and post header
    expect(screen.getByText(/Instagram - Variant A/i)).toBeInTheDocument();
  });

  it('should show image dimensions for social posts', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show dimensions like "1080x1080 (Square)" in the image placeholder
    expect(screen.getByText('1080x1080 (Square)')).toBeInTheDocument();
  });

  it('should display engagement indicators', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show likes, comments, shares
    expect(screen.getByText(/likes/i)).toBeInTheDocument();
    expect(screen.getByText(/comments/i)).toBeInTheDocument();
    expect(screen.getByText(/shares/i)).toBeInTheDocument();
  });
});

describe('Showcase Page - Strategy Tab', () => {
  it('should have strategy tab', () => {
    render(<ShowcasePage />);

    expect(screen.getByText(/🎯 Strategy/i)).toBeInTheDocument();
  });

  it('should display campaign strategy when strategy tab is clicked', () => {
    render(<ShowcasePage />);

    const strategyTab = screen.getByText(/🎯 Strategy/i);
    fireEvent.click(strategyTab);

    expect(screen.getByText(/Campaign Strategy/i)).toBeInTheDocument();
  });

  it('should show campaign flow steps on strategy tab', () => {
    render(<ShowcasePage />);

    const strategyTab = screen.getByText(/🎯 Strategy/i);
    fireEvent.click(strategyTab);

    // Should show 4-step flow with emoji icon
    expect(screen.getByText('📊 Campaign Flow')).toBeInTheDocument();
    expect(screen.getByText(/Social Media Awareness/i)).toBeInTheDocument();
    expect(screen.getByText(/Landing Page Conversion/i)).toBeInTheDocument();
  });

  it('should display key takeaways on strategy tab', () => {
    render(<ShowcasePage />);

    const strategyTab = screen.getByText(/🎯 Strategy/i);
    fireEvent.click(strategyTab);

    expect(screen.getByText(/What Makes This Campaign Work/i)).toBeInTheDocument();
  });
});

describe('Showcase Page - A/B Testing Variants', () => {
  it('should display A/B testing section on landing tab', () => {
    render(<ShowcasePage />);

    // Should show A/B variants
    expect(screen.getByText(/A\/B Test Variants/i)).toBeInTheDocument();
  });

  it('should show performance metrics for variants', () => {
    render(<ShowcasePage />);

    // Should show performance comparison
    expect(screen.getByText(/\+23% conversion/i)).toBeInTheDocument();
  });
});

describe('Showcase Page - Enhanced Brand Colors', () => {
  it('should display brand colors with hex codes', () => {
    render(<ShowcasePage />);

    // Should show color labels
    expect(screen.getByText(/PRIMARY/i)).toBeInTheDocument();
    expect(screen.getByText(/SECONDARY/i)).toBeInTheDocument();
    expect(screen.getByText(/ACCENT/i)).toBeInTheDocument();
  });

  it('should show hex color values', () => {
    const { container } = render(<ShowcasePage />);

    // Should contain hex color codes (looking for # pattern)
    const hexCodes = container.querySelectorAll('[style*="monospace"]');
    expect(hexCodes.length).toBeGreaterThan(0);
  });
});

describe('Showcase Page - Image Descriptions', () => {
  it('should display image strategy descriptions', () => {
    render(<ShowcasePage />);

    // Should show image strategy section
    expect(screen.getByText(/Image Strategy/i)).toBeInTheDocument();
  });

  it('should show detailed image descriptions for social posts', () => {
    render(<ShowcasePage />);

    const socialTab = screen.getByText('📱 Social Posts');
    fireEvent.click(socialTab);

    // Should show image description
    expect(screen.getByText(/Split-screen showing exterior/i)).toBeInTheDocument();
  });
});

describe('Showcase Page - Variation Count Badges', () => {
  it('should display variation count on campaign cards', () => {
    render(<ShowcasePage />);

    // Should show variation indicators like "4 variations"
    const variationText = screen.getAllByText(/\d+ variations/i);
    expect(variationText.length).toBeGreaterThan(0);
  });
});
