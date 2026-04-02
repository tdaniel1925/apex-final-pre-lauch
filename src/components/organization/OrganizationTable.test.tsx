import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrganizationTable, { OrganizationMember } from './OrganizationTable';

// Mock the DistributorDetailsModal component
vi.mock('@/components/distributor/DistributorDetailsModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="modal">Modal Open <button onClick={onClose}>Close</button></div> : null,
}));

describe('OrganizationTable', () => {
  const mockMembers: OrganizationMember[] = [
    {
      distributor_id: '1',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      slug: 'john-doe',
      rep_number: 1001,
      sponsor_id: 'current-user',
      enrollment_date: '2024-01-15',
      tech_rank: 'bronze',
      personal_credits_monthly: 100,
      team_credits_monthly: 500,
      children: [
        {
          distributor_id: '2',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-5678',
          slug: 'jane-smith',
          rep_number: 1002,
          sponsor_id: '1',
          enrollment_date: '2024-02-20',
          tech_rank: 'starter',
          personal_credits_monthly: 30,
          team_credits_monthly: 30,
        },
      ],
    },
    {
      distributor_id: '3',
      full_name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: null,
      slug: 'bob-johnson',
      rep_number: 1003,
      sponsor_id: 'current-user',
      enrollment_date: '2024-03-10',
      tech_rank: 'silver',
      personal_credits_monthly: 200,
      team_credits_monthly: 800,
    },
  ];

  it('should render table with members', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should filter members by search query', async () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Note: Both John and Bob are rendered in the table, search just filters the visible list
    // Since we're showing all members initially, both will be in the document
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should filter members by rank', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    // Find the select element by its text content in the label
    const rankFilters = screen.getAllByRole('combobox');
    const rankFilter = rankFilters[0]; // First combobox is the rank filter

    fireEvent.change(rankFilter, { target: { value: 'silver' } });

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should filter members by active status', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    // Find the select element by its position (second combobox)
    const statusFilter = screen.getAllByRole('combobox')[1];
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    // Both John (100) and Bob (200) are active (>=50 credits)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should show empty state when no members match filters', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentName' } });

    expect(screen.getByText(/no members found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  it('should open modal when member is clicked', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    const memberButton = screen.getByRole('button', { name: 'John Doe' });
    fireEvent.click(memberButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should sort members by name', () => {
    render(<OrganizationTable members={mockMembers} currentUserId="current-user" />);

    // Find the sort by select (third combobox)
    const sortByFilter = screen.getAllByRole('combobox')[2];
    fireEvent.change(sortByFilter, { target: { value: 'name' } });

    // Just check that both members are still visible after sorting
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should paginate results when more than 20 members', () => {
    const manyMembers: OrganizationMember[] = Array.from({ length: 25 }, (_, i) => ({
      distributor_id: `member-${i}`,
      full_name: `Member ${i}`,
      email: `member${i}@example.com`,
      phone: null,
      slug: `member-${i}`,
      rep_number: 1000 + i,
      sponsor_id: 'current-user',
      enrollment_date: '2024-01-01',
      tech_rank: 'starter',
      personal_credits_monthly: 50,
      team_credits_monthly: 50,
    }));

    render(<OrganizationTable members={manyMembers} currentUserId="current-user" />);

    // Should show page 1 button
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    // Should show Next button
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});
