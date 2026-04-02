'use client';

import { FulfillmentNote } from '@/lib/types/fulfillment';
import { formatRelativeTime } from '@/lib/utils/date-format';
import { Trash2 } from 'lucide-react';

interface NoteItemProps {
  note: FulfillmentNote;
  currentUserId: string;
  onDelete: (noteId: string) => void;
  isDeleting: boolean;
}

export default function NoteItem({ note, currentUserId, onDelete, isDeleting }: NoteItemProps) {
  const isOwner = note.admin_id === currentUserId;
  const adminName = note.admin_distributor
    ? `${note.admin_distributor.first_name} ${note.admin_distributor.last_name}`
    : 'Unknown Admin';

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-900">{adminName}</span>
            <span className="text-xs text-slate-500">
              {formatRelativeTime(note.created_at)}
            </span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note_text}</p>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(note.id)}
            disabled={isDeleting}
            className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {note.updated_at && note.updated_at !== note.created_at && (
        <span className="text-xs text-slate-400">
          (edited {formatRelativeTime(note.updated_at)})
        </span>
      )}
    </div>
  );
}
