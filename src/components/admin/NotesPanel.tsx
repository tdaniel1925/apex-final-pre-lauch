'use client';

// =============================================
// Admin Notes Panel
// Display and manage admin notes for distributors
// =============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminRole } from '@/lib/auth/admin';

// Note types and priority levels
const NOTE_TYPES = [
  { value: 'general', label: 'General', color: 'gray' },
  { value: 'warning', label: 'Warning', color: 'orange' },
  { value: 'important', label: 'Important', color: 'red' },
  { value: 'follow_up', label: 'Follow Up', color: 'blue' },
  { value: 'compliance', label: 'Compliance', color: 'purple' },
  { value: 'password_reset', label: 'Password Reset', color: 'green' },
  { value: 'status_change', label: 'Status Change', color: 'indigo' },
] as const;

const PRIORITY_LEVELS = [
  { value: 'normal', label: 'Normal', color: 'gray' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
] as const;

interface Note {
  id: string;
  distributor_id: string;
  admin_id: string;
  admin_name: string;
  note_type: string;
  note_text: string;
  is_pinned: boolean;
  priority: string;
  follow_up_date: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface NotesPanelProps {
  distributorId: string;
  currentAdminRole: AdminRole;
}

export default function NotesPanel({ distributorId, currentAdminRole }: NotesPanelProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New note form state
  const [newNote, setNewNote] = useState({
    noteType: 'general',
    noteText: '',
    isPinned: false,
    priority: 'normal',
    followUpDate: '',
  });

  // Edit note form state
  const [editNote, setEditNote] = useState<{
    noteText: string;
    noteType: string;
    isPinned: boolean;
    priority: string;
    followUpDate: string;
    isResolved: boolean;
  } | null>(null);

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [distributorId]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/distributors/${distributorId}/notes`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.noteText.trim()) {
      setError('Note text is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/distributors/${distributorId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create note');
      }

      setSuccess('Note added successfully');
      setNewNote({
        noteType: 'general',
        noteText: '',
        isPinned: false,
        priority: 'normal',
        followUpDate: '',
      });
      setIsAddingNote(false);
      fetchNotes();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editNote || !editNote.noteText.trim()) {
      setError('Note text is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/distributors/${distributorId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editNote),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update note');
      }

      setSuccess('Note updated successfully');
      setEditingNoteId(null);
      setEditNote(null);
      fetchNotes();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/admin/distributors/${distributorId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      setSuccess('Note deleted successfully');
      fetchNotes();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditNote({
      noteText: note.note_text,
      noteType: note.note_type,
      isPinned: note.is_pinned,
      priority: note.priority,
      followUpDate: note.follow_up_date ? note.follow_up_date.split('T')[0] : '',
      isResolved: note.is_resolved,
    });
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditNote(null);
  };

  const getTypeColor = (type: string) => {
    const noteType = NOTE_TYPES.find((t) => t.value === type);
    return noteType?.color || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const priorityLevel = PRIORITY_LEVELS.find((p) => p.value === priority);
    return priorityLevel?.color || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Notes</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Admin Notes
          {notes.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
              {notes.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isAddingNote ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
          {success}
        </div>
      )}

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">New Note</h3>

          <div className="space-y-3">
            {/* Note Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newNote.noteType}
                onChange={(e) => setNewNote({ ...newNote, noteType: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note Text */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={newNote.noteText}
                onChange={(e) => setNewNote({ ...newNote, noteText: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter note details..."
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newNote.priority}
                onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                {PRIORITY_LEVELS.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Follow-up Date (Optional)
              </label>
              <input
                type="date"
                value={newNote.followUpDate}
                onChange={(e) => setNewNote({ ...newNote, followUpDate: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>

            {/* Pin Note */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pin-new-note"
                checked={newNote.isPinned}
                onChange={(e) => setNewNote({ ...newNote, isPinned: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="pin-new-note" className="ml-2 text-sm text-gray-700">
                Pin this note to the top
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddNote}
                disabled={isSaving}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Add Note'}
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote({
                    noteType: 'general',
                    noteText: '',
                    isPinned: false,
                    priority: 'normal',
                    followUpDate: '',
                  });
                }}
                className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Add a note to track important information about this distributor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 border rounded-lg ${
                note.is_pinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Editing Mode */}
              {editingNoteId === note.id && editNote ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editNote.noteType}
                      onChange={(e) => setEditNote({ ...editNote, noteType: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      {NOTE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      value={editNote.noteText}
                      onChange={(e) => setEditNote({ ...editNote, noteText: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editNote.priority}
                      onChange={(e) => setEditNote({ ...editNote, priority: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      {PRIORITY_LEVELS.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Follow-up Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={editNote.followUpDate}
                      onChange={(e) => setEditNote({ ...editNote, followUpDate: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`pin-edit-${note.id}`}
                      checked={editNote.isPinned}
                      onChange={(e) => setEditNote({ ...editNote, isPinned: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`pin-edit-${note.id}`} className="ml-2 text-sm text-gray-700">
                      Pin this note to the top
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`resolve-edit-${note.id}`}
                      checked={editNote.isResolved}
                      onChange={(e) => setEditNote({ ...editNote, isResolved: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <label htmlFor={`resolve-edit-${note.id}`} className="ml-2 text-sm text-gray-700">
                      Mark as resolved
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Pinned Badge */}
                      {note.is_pinned && (
                        <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                          =Ì Pinned
                        </span>
                      )}

                      {/* Type Badge */}
                      <span
                        className={`px-2 py-0.5 text-xs rounded bg-${getTypeColor(
                          note.note_type
                        )}-100 text-${getTypeColor(note.note_type)}-800`}
                      >
                        {NOTE_TYPES.find((t) => t.value === note.note_type)?.label || note.note_type}
                      </span>

                      {/* Priority Badge */}
                      {note.priority !== 'normal' && (
                        <span
                          className={`px-2 py-0.5 text-xs rounded bg-${getPriorityColor(
                            note.priority
                          )}-100 text-${getPriorityColor(note.priority)}-800`}
                        >
                          {PRIORITY_LEVELS.find((p) => p.value === note.priority)?.label || note.priority}
                        </span>
                      )}

                      {/* Resolved Badge */}
                      {note.is_resolved && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                           Resolved
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        title="Edit note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {currentAdminRole === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete note (super admin only)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Text */}
                  <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">{note.note_text}</p>

                  {/* Follow-up Date */}
                  {note.follow_up_date && !note.is_resolved && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      =Å Follow up by: {formatDate(note.follow_up_date)}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <span>
                      by {note.admin_name} " {formatDateTime(note.created_at)}
                    </span>
                    {note.updated_at !== note.created_at && (
                      <span className="italic">Edited</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
