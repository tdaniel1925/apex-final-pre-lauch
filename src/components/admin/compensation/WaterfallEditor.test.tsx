import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WaterfallEditor from './WaterfallEditor';

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
  });

  it('should update slider value when changed', () => {
    render(<WaterfallEditor />);

    const sliders = screen.getAllByRole('slider');
    const firstSlider = sliders[0];

    fireEvent.change(firstSlider, { target: { value: '10' } });

    expect(firstSlider).toHaveValue('10');
  });

  it('should show save button when dirty', () => {
    render(<WaterfallEditor />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '10' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should show visual breakdown chart', () => {
    render(<WaterfallEditor />);

    expect(screen.getAllByText('Visual Breakdown').length).toBeGreaterThan(0);
  });
});
