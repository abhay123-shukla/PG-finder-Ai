'use client';

import React, { useState } from 'react';
import { Search, MapPin, IndianRupee, Sparkles, ShieldCheck, Wifi, Utensils } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (location: string, maxRent?: number) => void;
  activeLocation?: string;
  activeCity?: string;
  activeMaxRent?: number;
}

const POPULAR_CITIES = ['Demo City', 'Demo Town', 'Delhi', 'Bengaluru', 'Pune', 'Kota'];

export default function HeroSection({
  onSearch,
  activeLocation = '',
  activeCity = '',
  activeMaxRent,
}: HeroSectionProps) {
  const currentPropLocation = activeLocation || activeCity || '';
  const [locationInput, setLocationInput] = useState(currentPropLocation);
  const [budgetInput, setBudgetInput] = useState<string>(
    activeMaxRent !== undefined && activeMaxRent !== null ? activeMaxRent.toString() : ''
  );

  const [prevLocation, setPrevLocation] = useState(currentPropLocation);
  const [prevBudget, setPrevBudget] = useState(activeMaxRent);

  // Sync state when props change (React recommended pattern without useEffect)
  if (currentPropLocation !== prevLocation) {
    setPrevLocation(currentPropLocation);
    setLocationInput(currentPropLocation);
  }

  if (activeMaxRent !== prevBudget) {
    setPrevBudget(activeMaxRent);
    setBudgetInput(
      activeMaxRent !== undefined && activeMaxRent !== null ? activeMaxRent.toString() : ''
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawBudget = budgetInput.trim();
    const budgetNum = rawBudget !== '' && !isNaN(Number(rawBudget)) ? parseFloat(rawBudget) : undefined;
    onSearch(locationInput.trim(), budgetNum);
  };

  const handleQuickCityClick = (city: string) => {
    setLocationInput(city);
    const rawBudget = budgetInput.trim();
    const budgetNum = rawBudget !== '' && !isNaN(Number(rawBudget)) ? parseFloat(rawBudget) : undefined;
    onSearch(city, budgetNum);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 pt-12 pb-16 border-b border-slate-200">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-200/30 via-sky-200/20 to-amber-100/30 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200 shadow-2xs mb-6 text-xs font-semibold text-indigo-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Local Ollama AI + Verified SQLite Accommodations</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Find Trustworthy Student PGs{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
            Without Surprise Rules
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Search genuine Paying Guest accommodations across India. Clear breakdown of monthly rent, security deposits, food menus, Wi-Fi, and authentic verification status.
        </p>

        {/* Main Search Box */}
        <div className="mt-8 max-w-3xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-indigo-100/70 border border-slate-200/90">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* City / Locality Field */}
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Search city, area, or locality (e.g. Demo City)..."
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Max Budget Field */}
            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="h-4 w-4" />
              </div>
              <input
                type="number"
                min="1000"
                step="500"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Max rent (e.g. 10000)"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200 hover:shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Quick Filter Tags */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleQuickCityClick(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  locationInput.toLowerCase() === c.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Actual Database Grounding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-600" />
            <span>Verified Meal Plans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-blue-600" />
            <span>Wi-Fi & Amenities Checklist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Ollama AI Advisory</span>
          </div>
        </div>
      </div>
    </section>
  );
}
