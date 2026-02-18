'use client';

// =============================================
// Genealogy Controls Component
// Search and navigation controls for genealogy tree
// =============================================

import { useState } from 'react';
import type { Distributor } from '@/lib/types';

interface GenealogyControlsProps {
  currentRootId: string | null;
  currentDepth: number;
  searchTerm: string;
  searchResults: Distributor[] | null;
}

export default function GenealogyControls({
  currentRootId,
  currentDepth,
  searchTerm,
  searchResults,
}: GenealogyControlsProps) {
  const [search, setSearch] = useState(searchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (currentRootId) params.append('start', currentRootId);
    params.append('depth', currentDepth.toString());
    window.location.href = `/admin/genealogy?${params.toString()}`;
  };

  const handleClearSearch = () => {
    setSearch('');
    const params = new URLSearchParams();
    if (currentRootId) params.append('start', currentRootId);
    params.append('depth', currentDepth.toString());
    window.location.href = `/admin/genealogy?${params.toString()}`;
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Search Results ({searchResults.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((dist) => (
              <a
                key={dist.id}
                href={`/admin/genealogy?start=${dist.id}&depth=${currentDepth}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {dist.first_name} {dist.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{dist.email}</p>
                    <p className="text-xs text-blue-600">@{dist.slug}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Level {dist.matrix_depth}</div>
                    <div className="text-xs">
                      Joined {new Date(dist.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults && searchResults.length === 0 && (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          No distributors found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
