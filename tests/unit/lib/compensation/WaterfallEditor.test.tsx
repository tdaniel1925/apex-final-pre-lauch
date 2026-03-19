import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WaterfallEditor from '@/components/admin/compensation/WaterfallEditor';

describe('WaterfallEditor', () => {
  it('should render standard and business center sections', () => {
    render(<WaterfallEditor />);

    expect(screen.getByText('Standard Products')).toBeInTheDocument();
    expect(screen.getByText('Business Center Products')).toBeInTheDocument();
  });

  it('should render all waterfall fields', () => {
    render(<WaterfallEditor />);

    expect(screen.getAllByText('BotMakers Fee').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Apex Take').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bonus Pool').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Leadership Pool').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Seller Commission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Override Pool').length).toBeGreaterThan(0);
  });

  it('should update slider value when changed', () => {
    render(<WaterfallEditor />);

    const sliders = screen.getAllByRole('slider');
    const firstSlider = sliders[0];

    fireEvent.change(firstSlider, { target: { value: '10' } });

    expect(firstSlider).toHaveValue('10');
  });

  it('should show total percentage validation', () => {
    render(<WaterfallEditor />);

    expect(screen.getAllByText(/Total Percentage/).length).toBeGreaterThan(0);
  });

  it('should show visual breakdown chart', () => {
    render(<WaterfallEditor />);

    expect(screen.getAllByText('Visual Breakdown').length).toBeGreaterThan(0);
  });

  it('should show save and cancel buttons when dirty', () => {
    render(<WaterfallEditor />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '10' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should validate total equals 100%', () => {
    render(<WaterfallEditor />);

    // Default values should sum to 100%
    const totalElements = screen.getAllByText(/100\.0%/);
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('should handle save button click', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<WaterfallEditor />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '10' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Saving waterfall'), expect.anything());
  });
});
