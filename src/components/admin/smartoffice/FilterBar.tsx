'use client';

/**
 * SmartOffice Filter Bar Component
 * Reusable filter bar with search and dropdowns
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  filters?: Filter[];
  onSearchChange?: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onClear?: () => void;
}

export default function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  filters = [],
  onSearchChange,
  onFilterChange,
  onClear,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );

  // Initialize active filters with default values
  useEffect(() => {
    const defaults: Record<string, string> = {};
    filters.forEach((filter) => {
      defaults[filter.key] = filter.defaultValue || filter.options[0]?.value || '';
    });
    setActiveFilters(defaults);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearchChange && localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localSearch]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  const handleClear = () => {
    setLocalSearch('');
    const defaults: Record<string, string> = {};
    filters.forEach((filter) => {
      defaults[filter.key] = filter.defaultValue || filter.options[0]?.value || '';
    });
    setActiveFilters(defaults);
    if (onClear) {
      onClear();
    }
  };

  const hasActiveFilters =
    localSearch ||
    Object.entries(activeFilters).some(([key, value]) => {
      const filter = filters.find((f) => f.key === key);
      return (
        value && value !== (filter?.defaultValue || filter?.options[0]?.value)
      );
    });

  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[150px]">
            <select
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
