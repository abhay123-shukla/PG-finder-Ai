'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Utensils,
  Wifi,
  Shirt,
  Bath,
  ShieldCheck,
  Check,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { SearchFilters } from '@/types/pg';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (updated: SearchFilters) => void;
  onReset: () => void;
  totalResults: number;
}

const ROOM_TYPES = [
  { id: 'all', label: 'All Room Types' },
  { id: 'single', label: 'Single Room' },
  { id: 'double-sharing', label: 'Double Sharing' },
  { id: 'triple-sharing', label: 'Triple Sharing' },
];

export default function FilterBar({ filters, onChange, onReset, totalResults }: FilterBarProps) {
  const handleToggle = (key: keyof SearchFilters) => {
    onChange({
      ...filters,
      [key]: filters[key] ? undefined : true,
    });
  };

  const hasActiveFilters = Boolean(
    (filters.location && filters.location.trim()) ||
    (filters.city && filters.city.trim()) ||
    (filters.area && filters.area.trim()) ||
    (filters.min_rent !== undefined && filters.min_rent !== null && String(filters.min_rent).trim() !== '') ||
    (filters.max_rent !== undefined && filters.max_rent !== null && String(filters.max_rent).trim() !== '') ||
    (filters.room_type && filters.room_type !== 'all') ||
    filters.food_available !== undefined ||
    filters.wifi_available !== undefined ||
    filters.laundry_available !== undefined ||
    filters.attached_bathroom !== undefined ||
    (filters.verification_status && filters.verification_status !== 'all')
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8">
      {/* Top Header: Title, Results Counter, and Clear Filters Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Search &amp; Filter Accommodations</h2>
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-indigo-600">{totalResults}</span> student {totalResults === 1 ? 'listing' : 'listings'}
            </p>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all self-start sm:self-auto ${
            hasActiveFilters
              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 cursor-pointer shadow-2xs'
              : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
          }`}
          title={hasActiveFilters ? 'Clear all search parameters and filters' : 'No filters currently applied'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* Filter Row 1: Location/Area, Min Rent, Max Rent, Room Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
        {/* 1. Location or Area Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location or Area
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={filters.location || filters.area || filters.city || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  ...filters,
                  location: val,
                  city: undefined,
                  area: undefined,
                });
              }}
              placeholder="e.g. University Block, Tech Park..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* 2. Minimum Monthly Rent Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Min Monthly Rent (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
            <input
              type="number"
              min="0"
              step="500"
              value={filters.min_rent !== undefined && filters.min_rent !== null ? filters.min_rent : ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                const num = raw !== '' && !isNaN(Number(raw)) ? parseFloat(raw) : undefined;
                onChange({ ...filters, min_rent: num });
              }}
              placeholder="Min rent (e.g. 5000)"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* 3. Maximum Monthly Rent Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Max Monthly Rent (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
            <input
              type="number"
              min="0"
              step="500"
              value={filters.max_rent !== undefined && filters.max_rent !== null ? filters.max_rent : ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                const num = raw !== '' && !isNaN(Number(raw)) ? parseFloat(raw) : undefined;
                onChange({ ...filters, max_rent: num });
              }}
              placeholder="Max rent (e.g. 10000)"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* 4. Room Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Room Type
          </label>
          <select
            value={filters.room_type || 'all'}
            onChange={(e) => onChange({ ...filters, room_type: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800 transition-colors"
          >
            {ROOM_TYPES.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Row 2: Amenities (with Wi-Fi Filter Highlighted) */}
      <div className="pt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">Amenities:</span>

        {/* Wi-Fi Availability Filter */}
        <button
          type="button"
          onClick={() => handleToggle('wifi_available')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filters.wifi_available
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={Boolean(filters.wifi_available)}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Wi-Fi Available</span>
          {filters.wifi_available && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Food Included Filter */}
        <button
          type="button"
          onClick={() => handleToggle('food_available')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            filters.food_available
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={Boolean(filters.food_available)}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food Included</span>
          {filters.food_available && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Laundry Service Filter */}
        <button
          type="button"
          onClick={() => handleToggle('laundry_available')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            filters.laundry_available
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={Boolean(filters.laundry_available)}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Laundry</span>
          {filters.laundry_available && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Attached Bathroom Filter */}
        <button
          type="button"
          onClick={() => handleToggle('attached_bathroom')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            filters.attached_bathroom
              ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={Boolean(filters.attached_bathroom)}
        >
          <Bath className="w-3.5 h-3.5" />
          <span>Attached Bathroom</span>
          {filters.attached_bathroom && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Verified Accommodations Only */}
        <button
          type="button"
          onClick={() => {
            const nextStatus = filters.verification_status === 'verified' ? undefined : 'verified';
            onChange({ ...filters, verification_status: nextStatus });
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            filters.verification_status === 'verified'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          aria-pressed={filters.verification_status === 'verified'}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Only</span>
          {filters.verification_status === 'verified' && <Check className="w-3 h-3 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
