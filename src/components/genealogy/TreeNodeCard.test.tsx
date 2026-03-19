import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeNodeCard, { type MemberNode } from './TreeNodeCard';

describe('TreeNodeCard', () => {
  const mockNode: MemberNode = {
    member_id: '123',
    full_name: 'John Doe',
    email: 'john@example.com',
    tech_rank: 'gold',
    personal_credits_monthly: 500,
    team_credits_monthly: 2000,
    enrollment_date: '2026-01-15T00:00:00Z',
    status: 'active',
    distributor: {
      id: 'dist-123',
      first_name: 'John',
      last_name: 'Doe',
      slug: 'johndoe',
      rep_number: 1001,
      profile_photo_url: null,
    },
    children: [],
    depth: 1,
    hasChildren: false,
  };

  it('should render member information', () => {
    const onToggle = vi.fn();
    render(
      <TreeNodeCard
        node={mockNode}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('gold')).toBeInTheDocument();
    expect(screen.getByText('500 credits/mo')).toBeInTheDocument();
  });

  it('should display expand button when node has children', () => {
    const onToggle = vi.fn();
    const nodeWithChildren = { ...mockNode, hasChildren: true };

    render(
      <TreeNodeCard
        node={nodeWithChildren}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole('button', { name: /expand/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should show collapse icon when expanded', () => {
    const onToggle = vi.fn();
    const nodeWithChildren = { ...mockNode, hasChildren: true };

    render(
      <TreeNodeCard
        node={nodeWithChildren}
        isExpanded={true}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should call onToggle when expand button is clicked', () => {
    const onToggle = vi.fn();
    const nodeWithChildren = { ...mockNode, hasChildren: true };

    render(
      <TreeNodeCard
        node={nodeWithChildren}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onMemberClick when card is clicked', () => {
    const onToggle = vi.fn();
    const onMemberClick = vi.fn();

    render(
      <TreeNodeCard
        node={mockNode}
        isExpanded={false}
        onToggle={onToggle}
        onMemberClick={onMemberClick}
      />
    );

    const card = screen.getByText('John Doe').closest('div');
    if (card) {
      fireEvent.click(card);
      expect(onMemberClick).toHaveBeenCalledWith('123');
    }
  });

  it('should display inactive status badge when not active', () => {
    const onToggle = vi.fn();
    const inactiveNode = { ...mockNode, status: 'inactive' };

    render(
      <TreeNodeCard
        node={inactiveNode}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('should apply correct rank color styling', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <TreeNodeCard
        node={mockNode}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const card = container.querySelector('.border-yellow-500');
    expect(card).toBeInTheDocument();
  });

  it('should render avatar placeholder when no photo URL', () => {
    const onToggle = vi.fn();
    render(
      <TreeNodeCard
        node={mockNode}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    // Avatar placeholder should show first letter of name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render profile photo when URL is provided', () => {
    const onToggle = vi.fn();
    const nodeWithPhoto = {
      ...mockNode,
      distributor: {
        ...mockNode.distributor,
        profile_photo_url: 'https://example.com/photo.jpg',
      },
    };

    render(
      <TreeNodeCard
        node={nodeWithPhoto}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    const img = screen.getByRole('img', { name: 'John Doe' });
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});
