'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Phone, Mail, MessageSquare, X } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  contacted: boolean;
  contactResult?: string;
}

interface InteractiveListBuilderProps {
  distributorId: string;
  listType: 'business_partner' | 'customer';
  onComplete?: () => void;
  onUpdate?: (count: number) => void;
}

export default function InteractiveListBuilder({
  distributorId,
  listType,
  onComplete,
  onUpdate
}: InteractiveListBuilderProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const title = listType === 'business_partner'
    ? '💼 10 People to Build Business With'
    : '🎯 10 Potential Customers';

  const subtitle = listType === 'business_partner'
    ? 'Think entrepreneurs, go-getters, people who want financial freedom'
    : 'Business owners or individuals who could benefit from our AI services';

  // Load existing list
  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      const res = await fetch(`/api/journey/get-list?distributorId=${distributorId}&listType=${listType}`);
      const data = await res.json();
      if (data.success) {
        setPeople(data.people || []);
        onUpdate?.(data.people?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load list:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async () => {
    if (!newName.trim()) return;

    try {
      const res = await fetch('/api/journey/add-to-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributorId,
          listType,
          personName: newName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPeople([...people, data.person]);
        setNewName('');
        setShowAddForm(false);
        onUpdate?.(people.length + 1);

        // Check if list is complete (10 people)
        if (people.length + 1 >= 10) {
          onComplete?.();
        }
      }
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  };

  const removePerson = async (id: string) => {
    try {
      const res = await fetch('/api/journey/remove-from-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: id }),
      });

      if (res.ok) {
        setPeople(people.filter(p => p.id !== id));
        onUpdate?.(people.length - 1);
      }
    } catch (error) {
      console.error('Failed to remove person:', error);
    }
  };

  const markContacted = async (id: string, result: string) => {
    try {
      const res = await fetch('/api/journey/mark-contacted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: id, contactResult: result }),
      });

      if (res.ok) {
        setPeople(people.map(p =>
          p.id === id ? { ...p, contacted: true, contactResult: result } : p
        ));
      }
    } catch (error) {
      console.error('Failed to mark contacted:', error);
    }
  };

  const updatePerson = async (person: Person) => {
    try {
      const res = await fetch('/api/journey/update-person', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });

      if (res.ok) {
        setPeople(people.map(p => p.id === person.id ? person : p));
        setEditingPerson(null);
      }
    } catch (error) {
      console.error('Failed to update person:', error);
    }
  };

  const isComplete = people.length >= 10;
  const progress = (people.length / 10) * 100;
  const contactedCount = people.filter(p => p.contacted).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="my-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm text-blue-100 mb-3">{subtitle}</p>

        {/* Progress Bar */}
        <div className="bg-blue-800/30 rounded-full h-4 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 15 && (
              <span className="text-xs font-bold text-white drop-shadow">
                {people.length}/10
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>{contactedCount} contacted</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{people.length - contactedCount} pending</span>
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {people.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="mb-2">No one added yet!</p>
            <p className="text-sm">Click the button below to add your first person.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {people.map((person, index) => (
              <div
                key={person.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  person.contacted
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Number Badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  person.contacted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {person.contacted ? <Check className="w-4 h-4" /> : index + 1}
                </div>

                {/* Person Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{person.name}</p>
                  {person.phone && (
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {person.phone}
                    </p>
                  )}
                  {person.contactResult && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {person.contactResult === 'interested' && '✅ Interested!'}
                      {person.contactResult === 'callback' && '📞 Call back later'}
                      {person.contactResult === 'not_interested' && '❌ Not interested'}
                      {person.contactResult === 'no_answer' && '📵 No answer'}
                      {person.contactResult === 'scheduled' && '📅 Meeting scheduled'}
                      {person.contactResult === 'signed_up' && '🎉 Signed up!'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!person.contacted ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingPerson(person)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                      title="Add details"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => markContacted(person.id, 'interested')}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                      title="Mark contacted"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Person Section */}
      {!isComplete && (
        <div className="p-4 bg-white border-t-2 border-blue-200">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Add Person to List
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                placeholder="Enter person's name..."
                autoFocus
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={addPerson}
                  disabled={!newName.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName('');
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Check className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">List Complete!</p>
              <p className="text-sm text-green-100">
                You've got your 10 people. Now reach out to them!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit Details</h3>
              <button
                onClick={() => setEditingPerson(null)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingPerson.phone || ''}
                  onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingPerson.email || ''}
                  onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={editingPerson.notes || ''}
                  onChange={(e) => setEditingPerson({ ...editingPerson, notes: e.target.value })}
                  placeholder="Why are they a good fit?"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                onClick={() => updatePerson(editingPerson)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
