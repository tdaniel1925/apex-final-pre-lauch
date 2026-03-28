'use client';

// =============================================
// Recipient Selector Component
// Filter and select email recipients
// =============================================

import { useState, useEffect } from 'react';

interface RecipientSelectorProps {
  selectedRecipients: string[];
  onRecipientsChange: (recipientIds: string[]) => void;
}

interface Distributor {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_licensed: boolean;
}

export default function RecipientSelector({
  selectedRecipients,
  onRecipientsChange,
}: RecipientSelectorProps) {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'licensed' | 'non-licensed' | 'has-phone' | 'no-phone'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch distributors on mount
  useEffect(() => {
    fetchDistributors();
  }, []);

  // Apply filters when filter or search changes
  useEffect(() => {
    applyFilters();
  }, [filter, searchQuery, distributors]);

  const fetchDistributors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/distributors?status=all&pageSize=1000');
      const data = await response.json();

      // The API returns { distributors: [], total, page, pageSize }
      if (data.distributors) {
        setDistributors(data.distributors);
      } else if (Array.isArray(data)) {
        // Fallback if it returns array directly
        setDistributors(data);
      }
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...distributors];

    // Apply category filter
    if (filter === 'licensed') {
      filtered = filtered.filter((d) => d.is_licensed);
    } else if (filter === 'non-licensed') {
      filtered = filtered.filter((d) => !d.is_licensed);
    } else if (filter === 'has-phone') {
      filtered = filtered.filter((d) => d.phone);
    } else if (filter === 'no-phone') {
      filtered = filtered.filter((d) => !d.phone);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.first_name.toLowerCase().includes(query) ||
          d.last_name.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query)
      );
    }

    setFilteredDistributors(filtered);
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredDistributors.length) {
      // Deselect all
      onRecipientsChange([]);
    } else {
      // Select all filtered
      onRecipientsChange(filteredDistributors.map((d) => d.user_id));
    }
  };

  const handleToggleRecipient = (userId: string) => {
    if (selectedRecipients.includes(userId)) {
      onRecipientsChange(selectedRecipients.filter((id) => id !== userId));
    } else {
      onRecipientsChange([...selectedRecipients, userId]);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#2c5aa0] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({distributors.length})
        </button>
        <button
          onClick={() => setFilter('licensed')}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            filter === 'licensed'
              ? 'bg-[#2c5aa0] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Licensed ({distributors.filter((d) => d.is_licensed).length})
        </button>
        <button
          onClick={() => setFilter('non-licensed')}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            filter === 'non-licensed'
              ? 'bg-[#2c5aa0] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Non-Licensed ({distributors.filter((d) => !d.is_licensed).length})
        </button>
        <button
          onClick={() => setFilter('has-phone')}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            filter === 'has-phone'
              ? 'bg-[#2c5aa0] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Has Phone ({distributors.filter((d) => d.phone).length})
        </button>
        <button
          onClick={() => setFilter('no-phone')}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            filter === 'no-phone'
              ? 'bg-[#2c5aa0] text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          No Phone ({distributors.filter((d) => !d.phone).length})
        </button>
      </div>

      {/* Search Box */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#2c5aa0]"
      />

      {/* Select All */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleSelectAll}
          className="text-sm text-[#2c5aa0] hover:underline font-medium"
        >
          {selectedRecipients.length === filteredDistributors.length ? 'Deselect All' : 'Select All'}
        </button>
        <p className="text-sm text-gray-600">
          {selectedRecipients.length} selected
        </p>
      </div>

      {/* Recipient List */}
      <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading distributors...</div>
        ) : filteredDistributors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No distributors found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDistributors.map((distributor) => (
              <label
                key={distributor.user_id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(distributor.user_id)}
                  onChange={() => handleToggleRecipient(distributor.user_id)}
                  className="w-4 h-4 text-[#2c5aa0] border-gray-300 rounded focus:ring-[#2c5aa0]"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {distributor.first_name} {distributor.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{distributor.email}</p>
                </div>
                <div className="flex gap-2">
                  {distributor.is_licensed && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Licensed
                    </span>
                  )}
                  {distributor.phone && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Has Phone
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
