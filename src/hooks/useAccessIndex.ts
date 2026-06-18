import type { AccessIndexBreakdown } from "@/types";

export function useAccessIndex(_venueId: string): {
  breakdown: AccessIndexBreakdown | null;
  loading: boolean;
  error: string | null;
} {
  return { breakdown: null, loading: false, error: null };
}
