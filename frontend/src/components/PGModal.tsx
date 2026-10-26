'use client';

import React from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Utensils,
  Wifi,
  Shirt,
  Bath,
  Building2,
  Calendar,
  Sparkles,
  Phone,
} from 'lucide-react';
import { PGListing } from '@/types/pg';

interface PGModalProps {
  pg: PGListing | null;
  onClose: () => void;
  onAskAI: (pg: PGListing) => void;
}

export default function PGModal({ pg, onClose, onAskAI }: PGModalProps) {
  if (!pg) return null;

  const isVerified = pg.verification_status?.toLowerCase() === 'verified';
  const isPending = pg.verification_status?.toLowerCase() === 'pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Optional Photo Banner */}
        {pg.image_url && (
          <div className="relative w-full h-48 sm:h-56 bg-slate-900 overflow-hidden border-b border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pg.image_url}
              alt={pg.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header Bar */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Verified Student PG
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Verification In Progress
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/20">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                Unverified Listing
              </span>
            )}

            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/15 text-white capitalize border border-white/10">
              {pg.room_type?.replace('-', ' ')}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">{pg.name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-indigo-200 mt-2">
            <MapPin className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>{pg.locality || pg.area}, {pg.city}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Pricing Overview */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-medium text-slate-500">Monthly Rent</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{pg.monthly_rent?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Security Deposit</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-slate-800">
                  ₹{pg.security_deposit?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Registered Address
            </h4>
            <p className="text-sm font-medium text-slate-800 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              {pg.full_address}
            </p>
          </div>

          {/* Amenities Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Amenities & Utilities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${pg.food_available ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200/60 text-slate-400'}`}>
                <Utensils className="w-4 h-4" />
                <span className="font-semibold">{pg.food_available ? 'Food Included' : 'No Food'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${pg.wifi_available ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200/60 text-slate-400'}`}>
                <Wifi className="w-4 h-4" />
                <span className="font-semibold">{pg.wifi_available ? 'Wi-Fi Available' : 'No Wi-Fi'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${pg.laundry_available ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200/60 text-slate-400'}`}>
                <Shirt className="w-4 h-4" />
                <span className="font-semibold">{pg.laundry_available ? 'Laundry Service' : 'No Laundry'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${pg.attached_bathroom ? 'bg-teal-50/70 border-teal-200 text-teal-900' : 'bg-slate-50 border-slate-200/60 text-slate-400'}`}>
                <Bath className="w-4 h-4" />
                <span className="font-semibold">{pg.attached_bathroom ? 'Attached Bathroom' : 'Shared Bath'}</span>
              </div>
            </div>
          </div>

          {/* Building Information */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
            {pg.building_age_years !== null && pg.building_age_years !== undefined && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <Building2 className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block">Building Age</span>
                  <span className="font-semibold text-slate-800">{pg.building_age_years} years old</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block">Listed On</span>
                <span className="font-semibold text-slate-800">
                  {new Date(pg.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details (if available) */}
          {pg.contact_details && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Owner / Warden Contact
              </h4>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{pg.contact_details}</span>
              </div>
            </div>
          )}

          {/* Facilities Summary (if available) */}
          {pg.facilities && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Facilities Summary
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                {pg.facilities}
              </p>
            </div>
          )}

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description & Rules
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              {pg.description}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Accommodation ID: <span className="font-mono font-semibold">#{pg.id}</span>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskAI(pg);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask AI About This PG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
