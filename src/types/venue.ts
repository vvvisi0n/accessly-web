export type VenueCategory =
  | "restaurant"
  | "hotel"
  | "lounge"
  | "bar"
  | "cafe"
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "transit_stop"
  | "train_station"
  | "airport"
  | "park"
  | "museum"
  | "theatre"
  | "cinema"
  | "gym"
  | "shopping"
  | "government"
  | "education"
  | "place_of_worship"
  | "other";

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  address: string;
  city: string;
  state: string;
  country: string;
  location: { lat: number; lng: number };
  phone?: string;
  website?: string;
  google_place_id?: string;
  access_index: number | null;
  score_entrance: number | null;
  score_bathrooms: number | null;
  score_parking: number | null;
  score_staff: number | null;
  score_sensory: number | null;
  review_count: number;
  claimed: boolean;
  claimed_by?: string;
  verified: boolean;
  certified: boolean;
  photos: string[];
  created_at: string;
  updated_at: string;
}
