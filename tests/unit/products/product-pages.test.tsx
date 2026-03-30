import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all product pages
import ProductsPage from '@/app/products/page';
import PulseMarketPage from '@/app/products/pulsemarket/page';
import PulseFlowPage from '@/app/products/pulseflow/page';
import PulseDrivePage from '@/app/products/pulsedrive/page';
import PulseCommandPage from '@/app/products/pulsecommand/page';
import SmartLookPage from '@/app/products/smartlook/page';

describe('Products Overview Page', () => {
  it('should render without crashing', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Marketing Automation That Works While You Sleep')).toBeInTheDocument();
  });

  it('should display all 4 Pulse products', () => {
    render(<ProductsPage />);
    expect(screen.getByText('PulseMarket')).toBeInTheDocument();
    expect(screen.getByText('PulseFlow')).toBeInTheDocument();
    expect(screen.getByText('PulseDrive')).toBeInTheDocument();
    expect(screen.getByText('PulseCommand')).toBeInTheDocument();
  });

  it('should display SmartLook XL section', () => {
    render(<ProductsPage />);
    expect(screen.getByText('SmartLook XL')).toBeInTheDocument();
  });

  it('should have navigation header with logo and links', () => {
    render(<ProductsPage />);
    expect(screen.getByText('APEX')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('should display comparison table', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Compare All Features')).toBeInTheDocument();
  });

  it('should have CTA buttons', () => {
    render(<ProductsPage />);
    const ctaButtons = screen.getAllByText(/Get Started/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });
});

describe('PulseMarket Detail Page', () => {
  it('should render without crashing', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText('PulseMarket')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText('$59')).toBeInTheDocument();
    expect(screen.getByText(/Member Price/i)).toBeInTheDocument();
  });

  it('should have hero section with main value proposition', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText(/Launch Your Digital Presence/i)).toBeInTheDocument();
  });

  it('should display ROI calculator', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText(/Calculate Your ROI/i)).toBeInTheDocument();
  });

  it('should show commission information for reps', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText('$16.48')).toBeInTheDocument(); // Member commission
    expect(screen.getByText('$22.06')).toBeInTheDocument(); // Retail commission
  });

  it('should have FAQ section', () => {
    render(<PulseMarketPage />);
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });

  it('should have CTA buttons', () => {
    render(<PulseMarketPage />);
    const ctaButtons = screen.getAllByText(/Start Free Trial|Get Started/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });
});

describe('PulseFlow Detail Page', () => {
  it('should render without crashing', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText('PulseFlow')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText('$129')).toBeInTheDocument();
  });

  it('should show "Most Popular" badge', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
  });

  it('should display email campaign feature', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText(/4 Email Campaigns\/Month/i)).toBeInTheDocument();
  });

  it('should show commission information', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText('$36.03')).toBeInTheDocument(); // Member commission
    expect(screen.getByText('$41.62')).toBeInTheDocument(); // Retail commission
  });

  it('should have use cases section', () => {
    render(<PulseFlowPage />);
    expect(screen.getByText(/Real-World Use Cases/i)).toBeInTheDocument();
  });
});

describe('PulseDrive Detail Page', () => {
  it('should render without crashing', () => {
    render(<PulseDrivePage />);
    expect(screen.getByText('PulseDrive')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<PulseDrivePage />);
    expect(screen.getByText('$219')).toBeInTheDocument();
  });

  it('should highlight podcast feature', () => {
    render(<PulseDrivePage />);
    expect(screen.getByText(/AI-Powered Podcast Production/i)).toBeInTheDocument();
  });

  it('should show commission information', () => {
    render(<PulseDrivePage />);
    expect(screen.getByText('$61.17')).toBeInTheDocument(); // Member commission
    expect(screen.getByText('$83.51')).toBeInTheDocument(); // Retail commission
  });
});

describe('PulseCommand Detail Page', () => {
  it('should render without crashing', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText('PulseCommand')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText('$349')).toBeInTheDocument();
  });

  it('should show "Best Value" badge', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText('BEST VALUE')).toBeInTheDocument();
  });

  it('should highlight AI avatar video feature', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText(/AI Avatar Video Creation/i)).toBeInTheDocument();
  });

  it('should show highest commission tier', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText('$97.48')).toBeInTheDocument(); // Member commission
    expect(screen.getByText('$139.37')).toBeInTheDocument(); // Retail commission
  });

  it('should emphasize unlimited features', () => {
    render(<PulseCommandPage />);
    expect(screen.getByText(/Unlimited Landing Pages/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited AI Content/i)).toBeInTheDocument();
  });
});

describe('SmartLook XL Detail Page', () => {
  it('should render without crashing', () => {
    render(<SmartLookPage />);
    expect(screen.getByText('SmartLook XL')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<SmartLookPage />);
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('should highlight business intelligence features', () => {
    render(<SmartLookPage />);
    expect(screen.getByText(/Real-Time Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Performance/i)).toBeInTheDocument();
  });

  it('should show integrations section', () => {
    render(<SmartLookPage />);
    expect(screen.getByText(/Integrates With Everything/i)).toBeInTheDocument();
  });

  it('should display commission information', () => {
    render(<SmartLookPage />);
    expect(screen.getByText('$27.65')).toBeInTheDocument();
  });
});

describe('Common Elements Across All Pages', () => {
  const pages = [
    { component: ProductsPage, name: 'Products Overview' },
    { component: PulseMarketPage, name: 'PulseMarket' },
    { component: PulseFlowPage, name: 'PulseFlow' },
    { component: PulseDrivePage, name: 'PulseDrive' },
    { component: PulseCommandPage, name: 'PulseCommand' },
    { component: SmartLookPage, name: 'SmartLook XL' },
  ];

  pages.forEach(({ component: Component, name }) => {
    describe(`${name} page`, () => {
      it('should have a fixed header', () => {
        render(<Component />);
        expect(screen.getByText('APEX')).toBeInTheDocument();
      });

      it('should have footer with copyright', () => {
        render(<Component />);
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`© ${currentYear} Apex Affinity Group. All rights reserved.`))).toBeInTheDocument();
      });

      it('should have at least one CTA button', () => {
        render(<Component />);
        const ctaButtons = screen.getAllByRole('link', { name: /Get Started|Start|Schedule|View/i });
        expect(ctaButtons.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Responsive Design Elements', () => {
  it('Products page should use responsive grid layouts', () => {
    const { container } = render(<ProductsPage />);
    const gridElements = container.querySelectorAll('[style*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('Detail pages should use flexible layouts', () => {
    const { container } = render(<PulseMarketPage />);
    const flexElements = container.querySelectorAll('[style*="flex"]');
    expect(flexElements.length).toBeGreaterThan(0);
  });
});

describe('Typography and Design System', () => {
  it('should use Inter font family', () => {
    const { container } = render(<ProductsPage />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.style.fontFamily).toContain('Inter');
  });

  it('should use navy color (#2B4C7E) for primary brand elements', () => {
    const { container } = render(<ProductsPage />);
    const navyElements = container.querySelectorAll('[style*="#2B4C7E"]');
    expect(navyElements.length).toBeGreaterThan(0);
  });
});
