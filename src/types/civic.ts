export type CivicReportType =
  | "broken_sidewalk"
  | "missing_curb_cut"
  | "blocked_ramp"
  | "broken_elevator"
  | "inaccessible_crossing"
  | "missing_signage"
  | "inaccessible_parking"
  | "other";

export type CivicStatus = "open" | "in_progress" | "resolved" | "closed";

export interface CivicReport {
  id: string;
  user_id: string;
  report_type: CivicReportType;
  description: string;
  location: { lat: number; lng: number };
  address?: string;
  city?: string;
  state?: string;
  photos: string[];
  status: CivicStatus;
  upvote_count: number;
  seeclickfix_id?: string;
  doj_reference?: string;
  city_311_reference?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  country: string;
  access_index: number | null;
  open_reports: number;
  resolved_reports: number;
  avg_response_days: number | null;
  seeclickfix_area_id?: string;
}
