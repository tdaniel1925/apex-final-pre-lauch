// =============================================
// Kanban Card Component
// Draggable card showing session info
// =============================================

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

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

interface KanbanCardProps {
  session: Session;
  onClick: () => void;
}

// Product color mapping
const PRODUCT_COLORS: Record<string, string> = {
  'business_center': 'bg-blue-100 text-blue-800',
  'business_center_agency': 'bg-purple-100 text-purple-800',
  'replicated_site': 'bg-green-100 text-green-800',
  'default': 'bg-gray-100 text-gray-800',
};

function getProductColor(productName: string): string {
  const normalized = productName.toLowerCase().replace(/\s+/g, '_');
  return PRODUCT_COLORS[normalized] || PRODUCT_COLORS.default;
}

export default function KanbanCard({ session, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get first product for badge
  const firstProduct = session.products_purchased?.[0];
  const productName = firstProduct?.product_name || 'No Product';

  // Format date
  const dateObj = new Date(session.scheduled_date + 'T' + session.scheduled_time);
  const relativeDate = formatDistanceToNow(dateObj, { addSuffix: true });

  // Rep name
  const repName = session.rep
    ? `${session.rep.first_name} ${session.rep.last_name}`
    : 'No Rep';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2
        hover:shadow-md transition-shadow cursor-pointer
        ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''}
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>

      {/* Customer Name */}
      <div className="font-semibold text-gray-900 mb-2 text-sm">
        {session.customer_name || 'Unknown Customer'}
      </div>

      {/* Product Badge */}
      <div className="mb-2">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getProductColor(
            productName
          )}`}
        >
          {productName}
        </span>
      </div>

      {/* Rep Name */}
      <div className="text-xs text-gray-600 mb-1">
        Rep: {repName}
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500">
        {relativeDate}
      </div>
    </div>
  );
}
