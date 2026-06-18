import type { Venue } from "@/types";

export interface VenueMapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue) => void;
  center?: [number, number];
  zoom?: number;
}

export default function VenueMap(_props: VenueMapProps) {
  return null;
}
