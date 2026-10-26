'use client';

import React from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Wifi,
  Utensils,
  Shirt,
  Bath,
  Sparkles,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { PGListing } from '@/types/pg';

interface PGCardProps {
  pg: PGListing;
  onViewDetails: (pg: PGListing) => void;
  onAskAI: (pg: PGListing) => void;
}

export default function PGCard({ pg, onViewDetails, onAskAI }: PGCardProps) {
  const isVerified = pg.verification_status?.toLowerCase() === 'verified';
  const isPending = pg.verification_status?.toLowerCase() === 'pending';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:shadow-indigo-50/80 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Optional Photo Banner */}
      {pg.image_url && (
        <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pg.image_url}
            alt={pg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Top Banner with Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Verification Badge based directly on actual backend data */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Accommodation</span>
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Pending</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Unverified Listing</span>
            </span>
          )}

          {/* Room Type Tag */}
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
            {pg.room_type?.replace('-', ' ')}
          </span>
        </div>

        {/* PG Name */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {pg.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{pg.locality || pg.area || 'Central Area'}, {pg.city}</span>
        </div>
      </div>

      {/* Pricing Banner */}
      <div className="px-5 py-3 bg-slate-50/80 border-y border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium">Monthly Rent</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{pg.monthly_rent?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500">/ mo</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Security Deposit</span>
          <p className="text-sm font-semibold text-slate-700">
            ₹{pg.security_deposit?.toLocaleString('en-IN') || 0}
          </p>
        </div>
      </div>

      {/* Body: Amenities & Features */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Amenity Icons Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${pg.food_available ? 'bg-amber-50/60 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{pg.food_available ? 'Food / Meals' : 'No Food'}</span>
            </div>

            <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${pg.wifi_available ? 'bg-blue-50/60 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
              <Wifi className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{pg.wifi_available ? 'Free Wi-Fi' : 'No Wi-Fi'}</span>
            </div>

            <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${pg.laundry_available ? 'bg-indigo-50/60 border-indigo-200 text-indigo-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
              <Shirt className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{pg.laundry_available ? 'Laundry' : 'No Laundry'}</span>
            </div>

            <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${pg.attached_bathroom ? 'bg-teal-50/60 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
              <Bath className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{pg.attached_bathroom ? 'Attached Bath' : 'Shared Bath'}</span>
            </div>
          </div>

          {/* Building Age (if available) */}
          {pg.building_age_years !== null && pg.building_age_years !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Building Age: <strong className="font-semibold text-slate-700">{pg.building_age_years} {pg.building_age_years === 1 ? 'year' : 'years'}</strong></span>
            </div>
          )}

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {pg.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(pg)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onAskAI(pg)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
            title="Ask Ollama AI to analyze this accommodation"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </article>
  );
}
