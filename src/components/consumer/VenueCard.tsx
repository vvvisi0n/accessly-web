import type { Venue } from "@/types";

export interface VenueCardProps {
  venue: Venue;
  onClick?: (venue: Venue) => void;
}

export default function VenueCard(_props: VenueCardProps) {
  return null;
}
