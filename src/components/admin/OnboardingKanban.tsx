// =============================================
// Onboarding Kanban Board
// Drag-and-drop board for managing onboarding fulfillment stages
// =============================================

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import OrderDetailsModal from './OrderDetailsModal';
import { FULFILLMENT_STAGES, FulfillmentStage } from '@/lib/types/fulfillment';

interface ProductPurchased {
  product_name: string;
  price?: number;
}

interface Session {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  products_purchased: ProductPurchased[];
  status: string;
  fulfillment_stage: string;
  calendar_event_id?: string;
  rep?: {
    first_name: string;
    last_name: string;
  };
}

interface OnboardingKanbanProps {
  sessions: Session[];
  currentUserId: string;
}

export default function OnboardingKanban({
  sessions,
  currentUserId,
}: OnboardingKanbanProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Group sessions by stage
  const sessionsByStage = FULFILLMENT_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = sessions.filter((s) => s.fulfillment_stage === stage);
      return acc;
    },
    {} as Record<FulfillmentStage, Session[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const session = sessions.find((s) => s.id === event.active.id);
    setActiveSession(session || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveSession(null);

    if (!over) return;

    const sessionId = active.id as string;
    const newStage = over.id as FulfillmentStage;

    // Find the session being moved
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Don't update if dropped in same column
    if (session.fulfillment_stage === newStage) return;

    // Update the stage
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/onboarding/update-stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          fulfillment_stage: newStage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update stage');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('Failed to update stage. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStageUpdate = async (sessionId: string, newStage: string) => {
    const response = await fetch('/api/admin/onboarding/update-stage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, fulfillment_stage: newStage }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update stage');
    }

    // Refresh the page to show updated data
    window.location.reload();
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Loading Overlay */}
        {isUpdating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 font-medium">Updating stage...</span>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {FULFILLMENT_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                sessions={sessionsByStage[stage]}
                onCardClick={setSelectedSession}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeSession ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard
                session={activeSession}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Order Details Modal */}
      {selectedSession && (
        <OrderDetailsModal
          session={{
            id: selectedSession.id,
            distributor_id: '', // Will be populated from order data
            distributor_name: selectedSession.customer_name,
            distributor_email: selectedSession.customer_email,
            product_name:
              selectedSession.products_purchased?.map((p) => p.product_name).join(', ') || 'N/A',
            amount_paid:
              selectedSession.products_purchased?.reduce((sum, p) => sum + (p.price || 0), 0) ||
              0,
            payment_date: selectedSession.scheduled_date,
            fulfillment_stage: selectedSession.fulfillment_stage,
            onboarding_date: selectedSession.scheduled_date,
            onboarding_time: selectedSession.scheduled_time,
            calendar_event_id: selectedSession.calendar_event_id,
          }}
          currentUserId={currentUserId}
          onClose={() => setSelectedSession(null)}
          onStageUpdate={handleStageUpdate}
        />
      )}
    </>
  );
}
