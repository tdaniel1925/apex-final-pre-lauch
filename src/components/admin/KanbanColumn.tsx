// =============================================
// Kanban Column Component
// Droppable column for session cards
// =============================================

'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { FulfillmentStage, STAGE_LABELS } from '@/lib/types/fulfillment';

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

interface KanbanColumnProps {
  stage: FulfillmentStage;
  sessions: Session[];
  onCardClick: (session: Session) => void;
}

// Stage colors
const STAGE_COLORS: Record<FulfillmentStage, string> = {
  payment_made: 'bg-red-50 border-red-200',
  onboarding_scheduled: 'bg-orange-50 border-orange-200',
  onboarding_complete: 'bg-yellow-50 border-yellow-200',
  building_pages: 'bg-blue-50 border-blue-200',
  social_proofs: 'bg-indigo-50 border-indigo-200',
  content_approved: 'bg-purple-50 border-purple-200',
  campaigns_live: 'bg-green-50 border-green-200',
  completed: 'bg-gray-50 border-gray-200',
};

const STAGE_HEADER_COLORS: Record<FulfillmentStage, string> = {
  payment_made: 'bg-red-100 text-red-800',
  onboarding_scheduled: 'bg-orange-100 text-orange-800',
  onboarding_complete: 'bg-yellow-100 text-yellow-800',
  building_pages: 'bg-blue-100 text-blue-800',
  social_proofs: 'bg-indigo-100 text-indigo-800',
  content_approved: 'bg-purple-100 text-purple-800',
  campaigns_live: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function KanbanColumn({
  stage,
  sessions,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  // Sort sessions by date (oldest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.scheduled_date + 'T' + a.scheduled_time);
    const dateB = new Date(b.scheduled_date + 'T' + b.scheduled_time);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div
      className={`
        flex flex-col rounded-lg border-2 transition-colors
        ${STAGE_COLORS[stage]}
        ${isOver ? 'ring-2 ring-blue-400 border-blue-400' : ''}
        min-w-[280px] max-w-[320px]
      `}
    >
      {/* Column Header */}
      <div
        className={`
          px-4 py-3 rounded-t-lg font-semibold text-sm flex items-center justify-between
          ${STAGE_HEADER_COLORS[stage]}
        `}
      >
        <span>{STAGE_LABELS[stage]}</span>
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white rounded-full">
          {sessions.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto"
      >
        <SortableContext
          items={sortedSessions.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedSessions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-500">
              No sessions
            </div>
          ) : (
            sortedSessions.map((session) => (
              <KanbanCard
                key={session.id}
                session={session}
                onClick={() => onCardClick(session)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
