'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { FulfillmentNote, STAGE_LABELS } from '@/lib/types/fulfillment';
import { formatDate } from '@/lib/utils/date-format';
import NoteItem from './NoteItem';

interface OrderDetailsModalProps {
  session: {
    id: string;
    distributor_id: string;
    distributor_name: string;
    distributor_email: string;
    product_name: string;
    amount_paid: number;
    payment_date: string;
    fulfillment_stage: string;
    onboarding_date?: string;
    onboarding_time?: string;
    calendar_event_id?: string;
  };
  currentUserId: string;
  onClose: () => void;
  onStageUpdate: (sessionId: string, newStage: string) => Promise<void>;
}

export default function OrderDetailsModal({
  session,
  currentUserId,
  onClose,
  onStageUpdate,
}: OrderDetailsModalProps) {
  const [notes, setNotes] = useState<FulfillmentNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [session.id]);

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      setError(null);

      const response = await fetch(`/api/admin/fulfillment-notes?session_id=${session.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notes');
      }

      setNotes(data.notes || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      setError(null);

      const response = await fetch('/api/admin/fulfillment-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          note_text: newNote.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add note');
      }

      setNotes([data.note, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      setIsDeletingNote(true);
      setError(null);

      const response = await fetch('/api/admin/fulfillment-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: noteId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete note');
      }

      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    try {
      setIsUpdatingStage(true);
      setError(null);
      await onStageUpdate(session.id, newStage);
    } catch (err) {
      console.error('Error updating stage:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stage');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900 mb-3">Order Information</h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Distributor:</span>
                <span className="text-sm font-medium text-slate-900">
                  {session.distributor_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Email:</span>
                <span className="text-sm text-slate-700">{session.distributor_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Product:</span>
                <span className="text-sm font-medium text-slate-900">{session.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Amount Paid:</span>
                <span className="text-sm font-medium text-green-700">
                  ${session.amount_paid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Payment Date:</span>
                <span className="text-sm text-slate-700">
                  {formatDate(session.payment_date, false)}
                </span>
              </div>
              {session.onboarding_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Onboarding:</span>
                  <span className="text-sm text-slate-700">
                    {formatDate(session.onboarding_date, false)}
                    {session.onboarding_time && ` at ${session.onboarding_time}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fulfillment Stage */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fulfillment Stage
            </label>
            <select
              value={session.fulfillment_stage}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={isUpdatingStage}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900"
            >
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Notes</h3>

            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this order..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900"
                rows={3}
                maxLength={5000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">
                  {newNote.length} / 5000 characters
                </span>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingNote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            {isLoadingNotes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No notes yet. Add one above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteNote}
                    isDeleting={isDeletingNote}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
