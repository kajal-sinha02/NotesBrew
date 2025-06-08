import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Filters {
  branch: string;
  semester: string;
  subject: string;
  search: string;
}

interface SearchAndFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

export default function SearchAndFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const hasActiveFilters =
    !!filters.branch || !!filters.semester || !!filters.subject || !!filters.search;

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      {/* Search Bar - Always Visible */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes by title or content..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors duration-200"
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <select
                value={filters.branch}
                onChange={(e) => onFilterChange('branch', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="" className="bg-gray-700 text-gray-400">
                  All Branches
                </option>
                {branches.map((branch) => (
                  <option
                    key={branch}
                    value={branch}
                    className="bg-gray-700 text-gray-100"
                  >
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => onFilterChange('semester', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="" className="bg-gray-700 text-gray-400">
                  All Semesters
                </option>
                {semesters.map((sem) => (
                  <option
                    key={sem}
                    value={sem}
                    className="bg-gray-700 text-gray-100"
                  >
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => onFilterChange('subject', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
