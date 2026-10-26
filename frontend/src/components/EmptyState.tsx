'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset?: () => void;
  isFiltered?: boolean;
}

export default function EmptyState({ onReset, isFiltered = false }: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto my-6">
      <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <SearchX className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
        {isFiltered ? 'No Accommodations Match Your Filters' : 'No PG Accommodations Found'}
      </h3>

      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        {isFiltered
          ? 'No accommodations match your current search criteria. Try broadening your location or area, widening your minimum and maximum monthly rent range, or adjusting the Wi-Fi filter.'
          : 'The database currently has no accommodation listings. Check that your backend server is running and populated.'}
      </p>

      {onReset && isFiltered && (
        <div className="mt-6">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
