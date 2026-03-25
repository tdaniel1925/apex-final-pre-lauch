'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Users } from 'lucide-react';

interface InteractiveListBuilderProps {
  distributorId: string;
  listType: 'business_partner' | 'customer';
  onComplete?: () => void;
}

interface ListItem {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

/**
 * InteractiveListBuilder component for building lists within chat
 * Allows users to create lists of business partners or customers
 */
export default function InteractiveListBuilder({
  distributorId,
  listType,
  onComplete,
}: InteractiveListBuilderProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const title = listType === 'business_partner'
    ? '👥 Build Your Business Partner List'
    : '🎯 Build Your Customer List';

  const description = listType === 'business_partner'
    ? 'Add people who might want to build a business with you'
    : 'Add people who might be interested in our products/services';

  const addItem = () => {
    if (!name.trim()) return;

    const newItem: ListItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    };

    setItems([...items, newItem]);
    setName('');
    setPhone('');
    setEmail('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;

    try {
      // Save list to API
      const response = await fetch('/api/race-to-100/save-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          distributorId,
          listType,
          items,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to save list:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      addItem();
    }
  };

  if (isSubmitted) {
    return (
      <div className="my-3 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            List Saved!
          </h3>
        </div>
        <p className="text-sm text-green-700">
          You added <strong>{items.length}</strong> {listType === 'business_partner' ? 'potential business partners' : 'potential customers'} to your list. Great work! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="my-3 p-4 bg-white border border-slate-300 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-[#2B4C7E]" />
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">{description}</p>

      {/* Input Form */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Name *"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2B4C7E] transition-colors"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Phone (optional)"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2B4C7E] transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Email (optional)"
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#2B4C7E] transition-colors"
          />
        </div>
        <button
          onClick={addItem}
          disabled={!name.trim()}
          className="w-full px-4 py-2 bg-[#2B4C7E] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to List
        </button>
      </div>

      {/* List Items */}
      {items.length > 0 && (
        <>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.name}
                  </p>
                  {(item.phone || item.email) && (
                    <p className="text-xs text-slate-500 truncate">
                      {[item.phone, item.email].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Save List ({items.length} {items.length === 1 ? 'person' : 'people'})
          </button>
        </>
      )}

      {items.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">
          No one added yet. Start by adding a name above.
        </p>
      )}
    </div>
  );
}
