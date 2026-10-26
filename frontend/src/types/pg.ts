/**
 * TypeScript Type Definitions for PG Finder AI Frontend.
 * Matches backend FastAPI Pydantic schemas (PGListingResponse, SearchFilters).
 */

export interface PGListing {
  id: number;
  name: string;
  city: string;
  locality: string;
  area?: string;
  location?: string;
  full_address: string;
  monthly_rent: number;
  security_deposit: number;
  deposit?: number;
  room_type: string;
  food_available: boolean;
  wifi_available: boolean;
  laundry_available: boolean;
  attached_bathroom: boolean;
  building_age_years?: number | null;
  description: string;
  verification_status: 'verified' | 'pending' | 'unverified' | string;
  contact_details?: string | null;
  facilities?: string | null;
  image_url?: string | null;
  created_at: string;
}

export interface PGListingCreatePayload {
  name: string;
  city: string;
  locality?: string;
  location?: string;
  area?: string;
  full_address: string;
  monthly_rent: number;
  security_deposit?: number;
  deposit?: number;
  room_type?: string;
  food_available?: boolean;
  wifi_available?: boolean;
  laundry_available?: boolean;
  attached_bathroom?: boolean;
  building_age_years?: number | null;
  description: string;
  verification_status?: string;
  contact_details?: string;
  contact_number?: string;
  facilities?: string;
  image_url?: string;
}

export interface SearchFilters {
  city?: string;
  area?: string;
  location?: string;
  min_rent?: number;
  max_rent?: number;
  room_type?: string;
  food_available?: boolean;
  wifi_available?: boolean;
  laundry_available?: boolean;
  attached_bathroom?: boolean;
  verification_status?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  model?: string;
  isError?: boolean;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  database?: {
    connected: boolean;
    engine?: string;
    database_url?: string;
    error?: string;
  };
  ollama?: {
    connected: boolean;
    host?: string;
    model?: string;
    model_available?: boolean;
    error?: string;
  };
}
