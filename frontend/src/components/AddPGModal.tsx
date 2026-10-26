'use client';

import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Building2,
  MapPin,
  IndianRupee,
  Wifi,
  Utensils,
  Shirt,
  Bath,
  Phone,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { createPGListing } from '@/lib/api';
import { PGListing, PGListingCreatePayload } from '@/types/pg';

interface AddPGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPG: PGListing) => void;
}

interface FormState {
  name: string;
  city: string;
  locality: string;
  full_address: string;
  monthly_rent: string;
  security_deposit: string;
  room_type: string;
  food_available: boolean;
  wifi_available: boolean;
  laundry_available: boolean;
  attached_bathroom: boolean;
  building_age_years: string;
  facilities: string;
  contact_details: string;
  image_url: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  city: '',
  locality: '',
  full_address: '',
  monthly_rent: '',
  security_deposit: '',
  room_type: 'double-sharing',
  food_available: false,
  wifi_available: true,
  laundry_available: false,
  attached_bathroom: false,
  building_age_years: '',
  facilities: '',
  contact_details: '',
  image_url: '',
  description: '',
};

export default function AddPGModal({ isOpen, onClose, onSuccess }: AddPGModalProps) {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<PGListing | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'PG Name must be at least 2 characters.';
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errs.city = 'City is required.';
    }
    if (!formData.locality.trim() || formData.locality.trim().length < 2) {
      errs.locality = 'Area or locality is required.';
    }
    if (!formData.full_address.trim() || formData.full_address.trim().length < 5) {
      errs.full_address = 'Full address must be at least 5 characters.';
    }

    const rentNum = parseFloat(formData.monthly_rent);
    if (isNaN(rentNum) || rentNum <= 0) {
      errs.monthly_rent = 'Monthly rent must be a valid number greater than 0.';
    }

    const depositNum = formData.security_deposit.trim() === '' ? 0 : parseFloat(formData.security_deposit);
    if (isNaN(depositNum) || depositNum < 0) {
      errs.security_deposit = 'Security deposit must be a non-negative number (0 or higher).';
    }

    if (!formData.description.trim() || formData.description.trim().length < 5) {
      errs.description = 'Please provide a description (at least 5 characters).';
    }

    if (formData.image_url.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.image_url.trim())) {
        errs.image_url = 'Please provide a valid web URL starting with http:// or https://';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: PGListingCreatePayload = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        locality: formData.locality.trim(),
        full_address: formData.full_address.trim(),
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: formData.security_deposit.trim() === '' ? 0 : parseFloat(formData.security_deposit),
        room_type: formData.room_type,
        food_available: formData.food_available,
        wifi_available: formData.wifi_available,
        laundry_available: formData.laundry_available,
        attached_bathroom: formData.attached_bathroom,
        building_age_years: formData.building_age_years.trim() ? parseInt(formData.building_age_years, 10) : null,
        facilities: formData.facilities.trim() || undefined,
        contact_details: formData.contact_details.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        description: formData.description.trim(),
        verification_status: 'verified', // Newly registered owner listings marked as verified demo entry
      };

      const result = await createPGListing(payload);
      setCreatedSuccess(result);
      setIsSubmitting(false);

      // Notify parent to refresh listings
      setTimeout(() => {
        onSuccess(result);
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'An error occurred while saving the listing.';
      setServerError(msg);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setServerError(null);
    setCreatedSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-2">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Accommodation Registration</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Add Your PG Listing</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Publish your student accommodation property with transparent rent, food options, Wi-Fi, and contact details.
          </p>
        </div>

        {/* Success Banner */}
        {createdSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">PG Listing Published Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              <strong>{createdSuccess.name}</strong> has been saved directly to the database with ID{' '}
              <span className="font-mono font-bold text-emerald-700">#{createdSuccess.id}</span>.
              The accommodation list is refreshing now...
            </p>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Server Error Message */}
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Submission Failed: </span>
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            {/* 1. PG Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accommodation / PG Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. [DEMO] Campus View Living"
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    errors.name ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* 2. City & Locality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Demo City"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    errors.city ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Locality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g. University Block A, Tech Zone"
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    errors.locality ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
                {errors.locality && <p className="text-[11px] text-rose-600 mt-1">{errors.locality}</p>}
              </div>
            </div>

            {/* 3. Full Street Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.full_address}
                  onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                  placeholder="e.g. 77 Campus Road, Near University Gate 2, Demo City"
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    errors.full_address ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.full_address && <p className="text-[11px] text-rose-600 mt-1">{errors.full_address}</p>}
            </div>

            {/* 4. Pricing: Rent & Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Rent (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                    placeholder="e.g. 8500"
                    className={`w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                      errors.monthly_rent ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.monthly_rent && <p className="text-[11px] text-rose-600 mt-1">{errors.monthly_rent}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security Deposit (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                    placeholder="e.g. 8500"
                    className={`w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                      errors.security_deposit ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.security_deposit && <p className="text-[11px] text-rose-600 mt-1">{errors.security_deposit}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Room Type
                </label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="single">Single Room</option>
                  <option value="double-sharing">Double Sharing</option>
                  <option value="triple-sharing">Triple Sharing</option>
                </select>
              </div>
            </div>

            {/* 5. Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Included Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {/* Wi-Fi */}
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  formData.wifi_available ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.wifi_available}
                    onChange={(e) => setFormData({ ...formData, wifi_available: e.target.checked })}
                    className="sr-only"
                  />
                  <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Free Wi-Fi</span>
                </label>

                {/* Food */}
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  formData.food_available ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.food_available}
                    onChange={(e) => setFormData({ ...formData, food_available: e.target.checked })}
                    className="sr-only"
                  />
                  <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">Meals / Food</span>
                </label>

                {/* Laundry */}
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  formData.laundry_available ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.laundry_available}
                    onChange={(e) => setFormData({ ...formData, laundry_available: e.target.checked })}
                    className="sr-only"
                  />
                  <Shirt className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Laundry</span>
                </label>

                {/* Attached Bathroom */}
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  formData.attached_bathroom ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.attached_bathroom}
                    onChange={(e) => setFormData({ ...formData, attached_bathroom: e.target.checked })}
                    className="sr-only"
                  />
                  <Bath className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">Attached Bath</span>
                </label>
              </div>
            </div>

            {/* 6. Facilities Summary, Contact & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Number / Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.contact_details}
                    onChange={(e) => setFormData({ ...formData, contact_details: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facilities Summary
                </label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="e.g. RO Water, Power Backup, CCTV"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Building Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.building_age_years}
                  onChange={(e) => setFormData({ ...formData, building_age_years: e.target.value })}
                  placeholder="e.g. 2"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 7. Image URL (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accommodation Image URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    errors.image_url ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.image_url && <p className="text-[11px] text-rose-600 mt-1">{errors.image_url}</p>}
            </div>

            {/* 8. Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description, Furnishing &amp; House Rules <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe room furnishings (bed, wardrobe, desk), curfew timings, meal plans, visitor policy, and key safety features."
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                  errors.description ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Accommodation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
