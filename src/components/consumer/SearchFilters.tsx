import type { VenueCategory, DisabilityType } from "@/types";

export interface SearchFiltersProps {
  categories: VenueCategory[];
  disabilityTypes: DisabilityType[];
  minScore: number;
  radiusKm: number;
  onChange: (filters: Partial<SearchFiltersProps>) => void;
}

export default function SearchFilters(_props: SearchFiltersProps) {
  return null;
}
