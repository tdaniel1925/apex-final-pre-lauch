import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VersionHistory from './VersionHistory';

describe('VersionHistory', () => {
  it('should render page title', () => {
    render(<VersionHistory />);

    expect(screen.getByText('Version History')).toBeInTheDocument();
  });

  it('should render all filter buttons', () => {
    render(<VersionHistory />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('should display version data in table', () => {
    render(<VersionHistory />);

    expect(screen.getByText('Default Configuration')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('should filter by status when filter button clicked', () => {
    render(<VersionHistory />);

    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);

    expect(screen.getByText('Default Configuration')).toBeInTheDocument();
  });

  it('should handle search input', () => {
    render(<VersionHistory />);

    const searchInput = screen.getByPlaceholderText(/Search by name or version/);
    fireEvent.change(searchInput, { target: { value: 'Default' } });

    expect(screen.getByText('Default Configuration')).toBeInTheDocument();
  });

  it('should handle duplicate button click', () => {
    render(<VersionHistory />);

    const duplicateButtons = screen.getAllByTitle('Duplicate');
    fireEvent.click(duplicateButtons[0]);

    expect(screen.getByText(/Copy/)).toBeInTheDocument();
  });
});
