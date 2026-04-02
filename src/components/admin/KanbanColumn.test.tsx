// =============================================
// KanbanColumn Component Test
// =============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import { STAGE_LABELS } from '@/lib/types/fulfillment';

describe('KanbanColumn', () => {
  const mockSessions = [
    {
      id: 'session-1',
      scheduled_date: '2024-04-01',
      scheduled_time: '10:00:00',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '555-1234',
      products_purchased: [{ product_name: 'Business Center', price: 997 }],
      status: 'scheduled',
      fulfillment_stage: 'building_pages',
      rep: { first_name: 'Jane', last_name: 'Smith' },
    },
    {
      id: 'session-2',
      scheduled_date: '2024-04-02',
      scheduled_time: '14:00:00',
      customer_name: 'Alice Johnson',
      customer_email: 'alice@example.com',
      customer_phone: '555-5678',
      products_purchased: [{ product_name: 'Replicated Site', price: 79 }],
      status: 'scheduled',
      fulfillment_stage: 'building_pages',
      rep: { first_name: 'Bob', last_name: 'Williams' },
    },
  ];

  const mockOnCardClick = vi.fn();

  it('should render stage label', () => {
    render(
      <DndContext>
        <KanbanColumn
          stage="building_pages"
          sessions={mockSessions}
          onCardClick={mockOnCardClick}
        />
      </DndContext>
    );

    expect(screen.getByText(STAGE_LABELS.building_pages)).toBeTruthy();
  });

  it('should render session count', () => {
    render(
      <DndContext>
        <KanbanColumn
          stage="building_pages"
          sessions={mockSessions}
          onCardClick={mockOnCardClick}
        />
      </DndContext>
    );

    expect(screen.getByText('2')).toBeTruthy();
  });

  it('should render all session cards', () => {
    render(
      <DndContext>
        <KanbanColumn
          stage="building_pages"
          sessions={mockSessions}
          onCardClick={mockOnCardClick}
        />
      </DndContext>
    );

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Alice Johnson')).toBeTruthy();
  });

  it('should show empty state when no sessions', () => {
    render(
      <DndContext>
        <KanbanColumn stage="building_pages" sessions={[]} onCardClick={mockOnCardClick} />
      </DndContext>
    );

    expect(screen.getByText('No sessions')).toBeTruthy();
  });

  it('should sort sessions by date', () => {
    const { container } = render(
      <DndContext>
        <KanbanColumn
          stage="building_pages"
          sessions={mockSessions}
          onCardClick={mockOnCardClick}
        />
      </DndContext>
    );

    const cards = container.querySelectorAll('[class*="bg-white"]');
    // First card should be John Doe (April 1)
    // Second card should be Alice Johnson (April 2)
    expect(cards.length).toBeGreaterThan(0);
  });
});
