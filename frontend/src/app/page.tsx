'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FilterBar from '@/components/FilterBar';
import PGCard from '@/components/PGCard';
import PGModal from '@/components/PGModal';
import AddPGModal from '@/components/AddPGModal';
import AIChatSection from '@/components/AIChatSection';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import { fetchAllPGs } from '@/lib/api';
import { PGListing, SearchFilters } from '@/types/pg';
import { AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';

const INITIAL_FILTERS: SearchFilters = {
  location: '',
  city: '',
  area: '',
  min_rent: undefined,
  max_rent: undefined,
  room_type: 'all',
  food_available: undefined,
  wifi_available: undefined,
  laundry_available: undefined,
  attached_bathroom: undefined,
  verification_status: 'all',
};

export default function HomePage() {
  // Master list of all PG listings fetched from GET /api/pgs
  const [allPgs, setAllPgs] = useState<PGListing[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [selectedPG, setSelectedPG] = useState<PGListing | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newlyAddedMessage, setNewlyAddedMessage] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Fetch all listings from backend API
  const refreshListings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAllPGs();
      setAllPgs(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch accommodation data.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount (async fetch deferred to avoid synchronous setState inside effect)
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const data = await fetchAllPGs();
        if (!isCancelled) {
          setAllPgs(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch accommodation data.';
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Derived filtered listings computed directly from the master allPgs dataset
  const filteredPgs = useMemo(() => {
    return allPgs.filter((pg) => {
      // 1. Location or Area Search (matches partial text, case-insensitive, trims extra spaces)
      const rawLocation = (filters.location || filters.area || filters.city || '').trim().toLowerCase();
      if (rawLocation) {
        const name = (pg.name || '').toLowerCase();
        const city = (pg.city || '').toLowerCase();
        const locality = (pg.locality || pg.area || '').toLowerCase();
        const address = (pg.full_address || '').toLowerCase();
        const location = (pg.location || '').toLowerCase();

        const matchesLocation =
          name.includes(rawLocation) ||
          city.includes(rawLocation) ||
          locality.includes(rawLocation) ||
          address.includes(rawLocation) ||
          location.includes(rawLocation);

        if (!matchesLocation) {
          return false;
        }
      }

      // 2. Minimum Monthly Rent (compared as numbers, empty field does not exclude)
      if (filters.min_rent !== undefined && filters.min_rent !== null && String(filters.min_rent).trim() !== '') {
        const minNum = typeof filters.min_rent === 'number' ? filters.min_rent : parseFloat(String(filters.min_rent));
        if (!isNaN(minNum) && minNum >= 0) {
          const pgRent = typeof pg.monthly_rent === 'number' ? pg.monthly_rent : parseFloat(String(pg.monthly_rent));
          if (isNaN(pgRent) || pgRent < minNum) {
            return false;
          }
        }
      }

      // 3. Maximum Monthly Rent (compared as numbers, empty field does not exclude)
      if (filters.max_rent !== undefined && filters.max_rent !== null && String(filters.max_rent).trim() !== '') {
        const maxNum = typeof filters.max_rent === 'number' ? filters.max_rent : parseFloat(String(filters.max_rent));
        if (!isNaN(maxNum) && maxNum > 0) {
          const pgRent = typeof pg.monthly_rent === 'number' ? pg.monthly_rent : parseFloat(String(pg.monthly_rent));
          if (isNaN(pgRent) || pgRent > maxNum) {
            return false;
          }
        }
      }

      // 4. Room Type Filter
      if (filters.room_type && filters.room_type !== 'all') {
        const targetType = filters.room_type.toLowerCase();
        const pgType = (pg.room_type || '').toLowerCase();
        if (pgType !== targetType) {
          return false;
        }
      }

      // 5. Wi-Fi Availability Filter
      if (filters.wifi_available === true && !pg.wifi_available) {
        return false;
      }

      // 6. Food Availability Filter
      if (filters.food_available === true && !pg.food_available) {
        return false;
      }

      // 7. Laundry Availability Filter
      if (filters.laundry_available === true && !pg.laundry_available) {
        return false;
      }

      // 8. Attached Bathroom Filter
      if (filters.attached_bathroom === true && !pg.attached_bathroom) {
        return false;
      }

      // 9. Verification Status Filter
      if (filters.verification_status && filters.verification_status !== 'all') {
        const targetStatus = filters.verification_status.toLowerCase();
        const pgStatus = (pg.verification_status || '').toLowerCase();
        if (pgStatus !== targetStatus) {
          return false;
        }
      }

      return true;
    });
  }, [allPgs, filters]);

  // Handlers
  const handleHeroSearch = (locationQuery: string, maxRent?: number) => {
    setFilters((prev) => ({
      ...prev,
      location: locationQuery,
      city: undefined,
      area: undefined,
      max_rent: maxRent,
    }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSelectVerifiedOnly = () => {
    setFilters((prev) => ({
      ...prev,
      verification_status: 'verified',
    }));
  };

  const handleAskAI = (pg: PGListing) => {
    const prompt = `Can you evaluate this accommodation for a student?\nName: ${pg.name}\nCity: ${pg.city} (${pg.locality || pg.area})\nMonthly Rent: ₹${pg.monthly_rent}\nSecurity Deposit: ₹${pg.security_deposit}\nRoom Type: ${pg.room_type}\nFood Included: ${pg.food_available ? 'Yes' : 'No'}\nWi-Fi: ${pg.wifi_available ? 'Yes' : 'No'}\nLaundry: ${pg.laundry_available ? 'Yes' : 'No'}\nAttached Bathroom: ${pg.attached_bathroom ? 'Yes' : 'No'}\nBuilding Age: ${pg.building_age_years || 'Not specified'} years\nVerification Status: ${pg.verification_status}\n\nWhat are the pros, cons, and questions I should ask the owner before finalizing?`;

    setAiPrompt(prompt);

    // Smoothly scroll to the AI section
    const el = document.getElementById('ai-assistant');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
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
    <div className="flex-1 flex flex-col">
      {/* 1. Header Navigation */}
      <Navbar
        onSelectVerifiedOnly={handleSelectVerifiedOnly}
        onOpenAI={() => {
          document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAddPG={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection
          onSearch={handleHeroSearch}
          activeLocation={filters.location}
          activeCity={filters.city}
          activeMaxRent={filters.max_rent}
        />

        {/* 3. Listings Explorer */}
        <div id="listings-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* New Listing Published Banner */}
          {newlyAddedMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold">{newlyAddedMessage}</p>
              </div>
              <button
                onClick={() => setNewlyAddedMessage(null)}
                className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={filteredPgs.length}
          />

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Failed to connect to backend</h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={refreshListings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Content States: Loading, Empty, or Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-28 bg-slate-200 rounded-full" />
                    <div className="h-5 w-20 bg-slate-200 rounded-md" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                  <div className="h-16 bg-slate-100 rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-slate-100 rounded-lg" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filteredPgs.length === 0 ? (
            <EmptyState
              isFiltered={hasActiveFilters}
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPgs.map((pg) => (
                <PGCard
                  key={pg.id}
                  pg={pg}
                  onViewDetails={setSelectedPG}
                  onAskAI={handleAskAI}
                />
              ))}
            </div>
          )}

          {/* 4. AI Assistant Section */}
          <AIChatSection
            initialPrompt={aiPrompt}
            onClearInitialPrompt={() => setAiPrompt('')}
          />
        </div>
      </main>

      {/* 5. Detail Modal */}
      <PGModal
        pg={selectedPG}
        onClose={() => setSelectedPG(null)}
        onAskAI={handleAskAI}
      />

      {/* 6. Add PG Modal */}
      <AddPGModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newPG) => {
          refreshListings();
          setNewlyAddedMessage(
            `Successfully published "${newPG.name}"! Your accommodation has been saved permanently to the database.`
          );
          setTimeout(() => {
            setNewlyAddedMessage(null);
          }, 8000);
        }}
      />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
