import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TechRankEditor from '@/components/admin/compensation/TechRankEditor';

describe('TechRankEditor', () => {
  it('should render page title', () => {
    render(<TechRankEditor />);

    expect(screen.getByText('Tech Ladder Ranks')).toBeInTheDocument();
  });

  it('should render all 9 ranks', () => {
    render(<TechRankEditor />);

    expect(screen.getByDisplayValue('Starter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Builder')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Producer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Leader')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Manager')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Director')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Executive')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Premier')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Elite')).toBeInTheDocument();
  });

  it('should show rank requirements fields', () => {
    render(<TechRankEditor />);

    expect(screen.getAllByText('Personal Credits').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Group Credits').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rank Bonus ($)').length).toBeGreaterThan(0);
  });

  it('should update rank name when edited', () => {
    render(<TechRankEditor />);

    const starterInput = screen.getByDisplayValue('Starter');
    fireEvent.change(starterInput, { target: { value: 'Beginner' } });

    expect(screen.getByDisplayValue('Beginner')).toBeInTheDocument();
  });

  it('should expand rank details when expand button clicked', () => {
    render(<TechRankEditor />);

    const expandButtons = screen.getAllByText('Expand');
    fireEvent.click(expandButtons[0]);

    expect(screen.getByText('Downline Requirements')).toBeInTheDocument();
  });

  it('should show save button when changes are made', () => {
    render(<TechRankEditor />);

    const personalCreditInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(personalCreditInputs[0], { target: { value: '5' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should handle save button click', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<TechRankEditor />);

    const personalCreditInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(personalCreditInputs[0], { target: { value: '5' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Saving tech ranks'), expect.anything());
  });
});
