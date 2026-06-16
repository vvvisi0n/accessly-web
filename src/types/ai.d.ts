/**
 * Shared TypeScript Types for Accessly AI
 * ---------------------------------------
 * Defines consistent types for API responses, frontend props, and AI structures.
 */

export interface LocationCoords {
  lat: number;
  lng: number;
}

/**
 * Represents an accessible place returned by Google Places API.
 */
export interface AccessiblePlace {
  id: string;
  name: string;
  address: string;
  rating?: number;
  location: LocationCoords;
}

/**
 * Request payload for /api/ai/places
 */
export interface PlacesRequest {
  query: string;
  lat: number;
  lng: number;
}

/**
 * Response format for /api/ai/places
 */
export interface PlacesResponse {
  places: AccessiblePlace[];
}

/**
 * Request payload for /api/ai/chat
 */
export interface ChatRequest {
  message: string;
  language?: string;
}

/**
 * Response format for /api/ai/chat
 */
export interface ChatResponse {
  reply: string;
  intent: "chat" | "places";
}
