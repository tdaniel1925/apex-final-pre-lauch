import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CompensationTreeView from './CompensationTreeView';
import type { MemberNode } from './TreeNodeCard';

describe('CompensationTreeView', () => {
  const mockTree: MemberNode[] = [
    {
      member_id: '1',
      full_name: 'Alice Smith',
      email: 'alice@example.com',
      tech_rank: 'platinum',
      personal_credits_monthly: 750,
      team_credits_monthly: 3000,
      enrollment_date: '2026-01-01T00:00:00Z',
      status: 'active',
      distributor: {
        id: 'dist-1',
        first_name: 'Alice',
        last_name: 'Smith',
        slug: 'alice',
        rep_number: 1001,
        profile_photo_url: null,
      },
      children: [
        {
          member_id: '2',
          full_name: 'Bob Johnson',
          email: 'bob@example.com',
          tech_rank: 'gold',
          personal_credits_monthly: 500,
          team_credits_monthly: 1000,
          enrollment_date: '2026-02-01T00:00:00Z',
          status: 'active',
          distributor: {
            id: 'dist-2',
            first_name: 'Bob',
            last_name: 'Johnson',
            slug: 'bob',
            rep_number: 1002,
            profile_photo_url: null,
          },
          children: [],
          depth: 1,
          hasChildren: false,
        },
      ],
      depth: 0,
      hasChildren: true,
    },
  ];

  it('should render tree with members', () => {
    render(<CompensationTreeView tree={mockTree} />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const searchInput = screen.getByPlaceholderText('Search members...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter members by search term', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('should render rank filter dropdown', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const rankFilter = screen.getByDisplayValue('All Ranks');
    expect(rankFilter).toBeInTheDocument();

    // Check that rank options exist
    fireEvent.click(rankFilter);
    expect(screen.getByRole('option', { name: 'Gold' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Platinum' })).toBeInTheDocument();
  });

  it('should render status filter dropdown', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const statusFilter = screen.getByDisplayValue('All Status');
    expect(statusFilter).toBeInTheDocument();
  });

  it('should have expand all button', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const expandAllButton = screen.getByText('Expand All');
    expect(expandAllButton).toBeInTheDocument();
  });

  it('should have collapse all button', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const collapseAllButton = screen.getByText('Collapse All');
    expect(collapseAllButton).toBeInTheDocument();
  });

  it('should display empty state when tree is empty', () => {
    render(<CompensationTreeView tree={[]} />);

    expect(screen.getByText('No members found')).toBeInTheDocument();
  });

  it('should call onMemberClick when provided', () => {
    const onMemberClick = vi.fn();
    render(<CompensationTreeView tree={mockTree} onMemberClick={onMemberClick} />);

    const aliceCard = screen.getByText('Alice Smith').closest('div');
    if (aliceCard) {
      fireEvent.click(aliceCard);
      expect(onMemberClick).toHaveBeenCalledWith('1');
    }
  });

  it('should filter by rank', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const rankFilter = screen.getByDisplayValue('All Ranks');
    fireEvent.change(rankFilter, { target: { value: 'gold' } });

    // Alice (platinum) should still appear as parent of Bob (gold)
    // The filter shows nodes that match OR have children that match
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should expand children initially based on maxInitialDepth', () => {
    render(<CompensationTreeView tree={mockTree} maxInitialDepth={1} />);

    // Both Alice and Bob should be visible since Bob is at depth 1
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should handle empty search result', () => {
    render(<CompensationTreeView tree={mockTree} />);

    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText('No members found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });
});
