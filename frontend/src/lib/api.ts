/**
 * API Client for PG Finder AI.
 * Communicates with the FastAPI backend at http://127.0.0.1:8000.
 */

import { PGListing, PGListingCreatePayload, SearchFilters, HealthCheckResponse } from '@/types/pg';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Performs health check against backend service.
 */
export async function fetchHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new ApiError(res.status, `Backend returned status ${res.status}`);
    }
    return await res.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network failure';
    throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. (${message})`);
  }
}

/**
 * Fetches all PG listings without filter criteria.
 */
export async function fetchAllPGs(): Promise<PGListing[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pgs`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new ApiError(res.status, `Failed to load PGs (HTTP ${res.status})`);
    }
    return await res.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    throw new Error(`Failed to fetch PG listings: ${message}`);
  }
}

/**
 * Searches and filters PG listings by city, locality, budget, room type, and amenities.
 */
export async function searchPGs(filters: SearchFilters): Promise<PGListing[]> {
  const params = new URLSearchParams();

  if (filters.location && filters.location.trim()) {
    params.append('location', filters.location.trim());
  }
  if (filters.city && filters.city.trim()) {
    params.append('city', filters.city.trim());
  }
  if (filters.area && filters.area.trim()) {
    params.append('area', filters.area.trim());
  }
  if (filters.min_rent !== undefined && filters.min_rent !== null && filters.min_rent >= 0) {
    params.append('min_rent', filters.min_rent.toString());
  }
  if (filters.max_rent !== undefined && filters.max_rent !== null && filters.max_rent > 0) {
    params.append('max_rent', filters.max_rent.toString());
  }
  if (filters.room_type && filters.room_type !== 'all') {
    params.append('room_type', filters.room_type);
  }
  if (filters.food_available === true) {
    params.append('food_available', 'true');
  }
  if (filters.wifi_available === true) {
    params.append('wifi_available', 'true');
  }
  if (filters.laundry_available === true) {
    params.append('laundry_available', 'true');
  }
  if (filters.attached_bathroom === true) {
    params.append('attached_bathroom', 'true');
  }
  if (filters.verification_status && filters.verification_status !== 'all') {
    params.append('verification_status', filters.verification_status);
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/api/pgs/search?${queryString}` : `${API_BASE_URL}/api/pgs`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new ApiError(res.status, `Search failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection error';
    throw new Error(`Failed to filter accommodations: ${message}`);
  }
}

/**
 * Fetches a single PG listing by ID.
 */
export async function fetchPGById(id: number): Promise<PGListing> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pgs/${id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.status === 404) {
      throw new ApiError(404, `PG accommodation with ID ${id} was not found.`);
    }
    if (!res.ok) {
      throw new ApiError(res.status, `Error loading PG details (${res.status})`);
    }
    return await res.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Fetch error';
    throw new Error(message);
  }
}

/**
 * Sends a message prompt to the local Ollama AI assistant via POST /api/ai/chat.
 */
export async function sendAIChatMessage(message: string): Promise<{ response: string; model: string; status: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ message: message.trim() }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const detailMsg = errorJson?.detail?.hint || errorJson?.detail?.message || errorJson?.error || `HTTP ${res.status}`;
      throw new ApiError(res.status, detailMsg);
    }

    return await res.json();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const messageStr = error instanceof Error ? error.message : 'Network failure';
    throw new Error(`AI Assistant unavailable: ${messageStr}`);
  }
}

/**
 * Creates and permanently stores a new PG listing via POST /api/pgs.
 */
export async function createPGListing(payload: PGListingCreatePayload): Promise<PGListing> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pgs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const detailMsg =
        errorJson?.details?.join(' | ') ||
        errorJson?.detail?.message ||
        (typeof errorJson?.detail === 'string' ? errorJson.detail : null) ||
        errorJson?.error ||
        `Submission failed with status HTTP ${res.status}`;
      throw new ApiError(res.status, detailMsg);
    }

    return await res.json();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const messageStr = error instanceof Error ? error.message : 'Network connection failure';
    throw new Error(`Unable to submit PG listing: ${messageStr}`);
  }
}

