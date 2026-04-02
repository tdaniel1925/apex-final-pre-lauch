// =============================================
// KanbanCard Component Test
// =============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

describe('KanbanCard', () => {
  const mockSession = {
    id: 'session-123',
    scheduled_date: '2024-04-01',
    scheduled_time: '10:00:00',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '555-1234',
    products_purchased: [
      {
        product_name: 'Business Center',
        price: 997,
      },
    ],
    status: 'scheduled',
    fulfillment_stage: 'building_pages',
    rep: {
      first_name: 'Jane',
      last_name: 'Smith',
    },
  };

  const mockOnClick = vi.fn();

  it('should render customer name', () => {
    render(
      <DndContext>
        <KanbanCard session={mockSession} onClick={mockOnClick} />
      </DndContext>
    );

    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('should render product badge', () => {
    render(
      <DndContext>
        <KanbanCard session={mockSession} onClick={mockOnClick} />
      </DndContext>
    );

    expect(screen.getByText('Business Center')).toBeTruthy();
  });

  it('should render rep name', () => {
    render(
      <DndContext>
        <KanbanCard session={mockSession} onClick={mockOnClick} />
      </DndContext>
    );

    expect(screen.getByText(/Jane Smith/)).toBeTruthy();
  });

  it('should handle session without rep', () => {
    const sessionWithoutRep = { ...mockSession, rep: undefined };

    render(
      <DndContext>
        <KanbanCard session={sessionWithoutRep} onClick={mockOnClick} />
      </DndContext>
    );

    expect(screen.getByText(/No Rep/)).toBeTruthy();
  });

  it('should handle session without products', () => {
    const sessionWithoutProducts = { ...mockSession, products_purchased: [] };

    render(
      <DndContext>
        <KanbanCard session={sessionWithoutProducts} onClick={mockOnClick} />
      </DndContext>
    );

    expect(screen.getByText('No Product')).toBeTruthy();
  });
});
