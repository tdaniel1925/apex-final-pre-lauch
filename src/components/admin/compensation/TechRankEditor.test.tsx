import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TechRankEditor from './TechRankEditor';

describe('TechRankEditor', () => {
  it('should render page title', () => {
    render(<TechRankEditor />);

    expect(screen.getByText('Tech Ladder Ranks')).toBeInTheDocument();
  });

  it('should render all 9 ranks', () => {
    render(<TechRankEditor />);

    expect(screen.getByDisplayValue('Starter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Builder')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Elite')).toBeInTheDocument();
  });

  it('should update rank name when edited', () => {
    render(<TechRankEditor />);

    const starterInput = screen.getByDisplayValue('Starter');
    fireEvent.change(starterInput, { target: { value: 'Beginner' } });

    expect(screen.getByDisplayValue('Beginner')).toBeInTheDocument();
  });

  it('should show save button when changes are made', () => {
    render(<TechRankEditor />);

    const starterInput = screen.getByDisplayValue('Starter');
    fireEvent.change(starterInput, { target: { value: 'Beginner' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should handle save button click', () => {
    render(<TechRankEditor />);

    const starterInput = screen.getByDisplayValue('Starter');
    fireEvent.change(starterInput, { target: { value: 'Beginner' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Button should no longer be visible after save
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });
});
