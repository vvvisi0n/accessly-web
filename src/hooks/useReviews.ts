import type { Review } from "@/types";

export function useReviews(_venueId: string): {
  reviews: Review[];
  loading: boolean;
  error: string | null;
} {
  return { reviews: [], loading: false, error: null };
}
