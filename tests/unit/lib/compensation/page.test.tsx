import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CompensationSettingsPage from '@/app/admin/compensation-settings/page';

// Mock the child components
vi.mock('@/components/admin/compensation/WaterfallEditor', () => ({
  default: () => <div data-testid="waterfall-editor">Waterfall Editor</div>,
}));

vi.mock('@/components/admin/compensation/TechRankEditor', () => ({
  default: () => <div data-testid="tech-rank-editor">Tech Rank Editor</div>,
}));

vi.mock('@/components/admin/compensation/OverrideScheduleEditor', () => ({
  default: () => <div data-testid="override-schedule-editor">Override Schedule Editor</div>,
}));

vi.mock('@/components/admin/compensation/BonusProgramToggles', () => ({
  default: () => <div data-testid="bonus-program-toggles">Bonus Program Toggles</div>,
}));

vi.mock('@/components/admin/compensation/VersionHistory', () => ({
  default: () => <div data-testid="version-history">Version History</div>,
}));

describe('CompensationSettingsPage', () => {
  it('should render page title and header', () => {
    render(<CompensationSettingsPage />);

    expect(screen.getByText('Compensation Settings')).toBeInTheDocument();
  });

  it('should render active config info', () => {
    render(<CompensationSettingsPage />);

    expect(screen.getByText('Default Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument();
  });

  it('should render all tabs', () => {
    render(<CompensationSettingsPage />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Waterfall')).toBeInTheDocument();
    expect(screen.getByText('Tech Ranks')).toBeInTheDocument();
    expect(screen.getByText('Override Schedules')).toBeInTheDocument();
    expect(screen.getByText('Bonus Programs')).toBeInTheDocument();
    expect(screen.getByText('Version History')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', () => {
    render(<CompensationSettingsPage />);

    const waterfallTab = screen.getByText('Waterfall');
    fireEvent.click(waterfallTab);

    expect(screen.getByTestId('waterfall-editor')).toBeInTheDocument();
  });

  it('should show Overview tab by default', () => {
    render(<CompensationSettingsPage />);

    expect(screen.getByText('Configuration Overview')).toBeInTheDocument();
    expect(screen.getByText('Waterfall Configuration')).toBeInTheDocument();
  });

  it('should render Create New Version button', () => {
    render(<CompensationSettingsPage />);

    expect(screen.getByText('Create New Version')).toBeInTheDocument();
  });
});
