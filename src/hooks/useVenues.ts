import type { Venue, VenueCategory, DisabilityType } from "@/types";

export interface UseVenuesOptions {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  categories?: VenueCategory[];
  disabilityTypes?: DisabilityType[];
  minScore?: number;
}

export function useVenues(_options: UseVenuesOptions = {}): {
  venues: Venue[];
  loading: boolean;
  error: string | null;
} {
  return { venues: [], loading: false, error: null };
}
