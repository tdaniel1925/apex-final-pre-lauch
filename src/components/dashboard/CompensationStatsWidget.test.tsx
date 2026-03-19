// =============================================
// Compensation Stats Widget Tests
// =============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompensationStatsWidget from './CompensationStatsWidget';

describe('CompensationStatsWidget', () => {
  it('should render all four stat cards', () => {
    render(
      <CompensationStatsWidget
        personalCredits={150}
        teamCredits={500}
        currentRank="bronze"
        monthlyEarnings={250.50}
      />
    );

    expect(screen.getByText('Personal Credits')).toBeInTheDocument();
    expect(screen.getByText('Group Credits')).toBeInTheDocument();
    expect(screen.getByText('Current Rank')).toBeInTheDocument();
    expect(screen.getByText('Monthly Earnings')).toBeInTheDocument();
  });

  it('should display personal credits with proper formatting', () => {
    render(
      <CompensationStatsWidget
        personalCredits={1500}
        teamCredits={5000}
        currentRank="gold"
        monthlyEarnings={1000}
      />
    );

    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('should display team credits with proper formatting', () => {
    render(
      <CompensationStatsWidget
        personalCredits={2500}
        teamCredits={15000}
        currentRank="platinum"
        monthlyEarnings={2500}
      />
    );

    expect(screen.getByText('15,000')).toBeInTheDocument();
  });

  it('should format rank name correctly', () => {
    render(
      <CompensationStatsWidget
        personalCredits={150}
        teamCredits={300}
        currentRank="bronze"
        monthlyEarnings={100}
      />
    );

    expect(screen.getByText('Bronze')).toBeInTheDocument();
  });

  it('should display monthly earnings with currency formatting', () => {
    render(
      <CompensationStatsWidget
        personalCredits={500}
        teamCredits={1500}
        currentRank="silver"
        monthlyEarnings={456.78}
      />
    );

    expect(screen.getByText('$456.78')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(
      <CompensationStatsWidget
        personalCredits={0}
        teamCredits={0}
        currentRank="starter"
        monthlyEarnings={0}
      />
    );

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should handle empty rank string with default', () => {
    render(
      <CompensationStatsWidget
        personalCredits={0}
        teamCredits={0}
        currentRank=""
        monthlyEarnings={0}
      />
    );

    expect(screen.getByText('Starter')).toBeInTheDocument();
  });
});
