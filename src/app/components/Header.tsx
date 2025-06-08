import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onCreateNote: () => void;
  selectedCount: number;
  onBulkDelete: () => Promise<void>;
}

export default function Header({ onCreateNote, selectedCount, onBulkDelete }: HeaderProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Notes Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage and organize your study notes</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Show bulk delete button only if some notes are selected */}
          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
            >
              Delete {selectedCount} Selected
            </button>
          )}

          <button
            onClick={onCreateNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <Plus size={20} />
            Create Note
          </button>
        </div>
      </div>
    </div>
  );
}
