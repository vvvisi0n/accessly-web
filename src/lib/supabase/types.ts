/**
 * Supabase generated types.
 * Regenerate after schema changes with:
 *   npx supabase gen types typescript --project-id <project-id> \
 *     --schema public > src/lib/supabase/types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          disability_types: string[];
          preferred_language: string;
          reputation_score: number;
          review_count: number;
          saved_venues: string[];
          plan: "free" | "pro" | "enterprise";
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          disability_types?: string[];
          preferred_language?: string;
          reputation_score?: number;
          review_count?: number;
          saved_venues?: string[];
          plan?: "free" | "pro" | "enterprise";
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      venues: {
        Row: {
          id: string;
          name: string;
          category: string;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          phone: string | null;
          website: string | null;
          google_place_id: string | null;
          osm_id: string | null;
          import_source: "osm" | "google_places" | null;
          access_index: number | null;
          score_entrance: number | null;
          score_bathrooms: number | null;
          score_parking: number | null;
          score_staff: number | null;
          score_sensory: number | null;
          review_count: number;
          claimed: boolean;
          claimed_by: string | null;
          verified: boolean;
          certified: boolean;
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          phone?: string | null;
          website?: string | null;
          google_place_id?: string | null;
          osm_id?: string | null;
          import_source?: "osm" | "google_places" | null;
          access_index?: number | null;
          score_entrance?: number | null;
          score_bathrooms?: number | null;
          score_parking?: number | null;
          score_staff?: number | null;
          score_sensory?: number | null;
          review_count?: number;
          claimed?: boolean;
          claimed_by?: string | null;
          verified?: boolean;
          certified?: boolean;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          venue_id: string;
          user_id: string;
          disability_types: string[];
          score_entrance: number | null;
          score_bathrooms: number | null;
          score_parking: number | null;
          score_staff: number | null;
          score_sensory: number | null;
          note_entrance: string | null;
          note_bathrooms: string | null;
          note_parking: string | null;
          note_staff: string | null;
          note_sensory: string | null;
          photos_entrance: string[];
          photos_bathrooms: string[];
          photos_parking: string[];
          photos_staff: string[];
          photos_sensory: string[];
          overall_comment: string | null;
          visit_date: string | null;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          user_id: string;
          disability_types?: string[];
          score_entrance?: number | null;
          score_bathrooms?: number | null;
          score_parking?: number | null;
          score_staff?: number | null;
          score_sensory?: number | null;
          note_entrance?: string | null;
          note_bathrooms?: string | null;
          note_parking?: string | null;
          note_staff?: string | null;
          note_sensory?: string | null;
          photos_entrance?: string[];
          photos_bathrooms?: string[];
          photos_parking?: string[];
          photos_staff?: string[];
          photos_sensory?: string[];
          overall_comment?: string | null;
          visit_date?: string | null;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      civic_reports: {
        Row: {
          id: string;
          user_id: string;
          report_type: string;
          description: string;
          address: string | null;
          city: string | null;
          state: string | null;
          photos: string[];
          status: "open" | "in_progress" | "resolved" | "closed";
          upvote_count: number;
          seeclickfix_id: string | null;
          doj_reference: string | null;
          city_311_reference: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_type: string;
          description: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          photos?: string[];
          status?: "open" | "in_progress" | "resolved" | "closed";
          upvote_count?: number;
          seeclickfix_id?: string | null;
          doj_reference?: string | null;
          city_311_reference?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["civic_reports"]["Insert"]>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          state: string | null;
          country: string;
          access_index: number | null;
          open_reports: number;
          resolved_reports: number;
          avg_response_days: number | null;
          seeclickfix_area_id: string | null;
          api_311_endpoint: string | null;
          plan: "free" | "pro" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          state?: string | null;
          country?: string;
          access_index?: number | null;
          open_reports?: number;
          resolved_reports?: number;
          avg_response_days?: number | null;
          seeclickfix_area_id?: string | null;
          api_311_endpoint?: string | null;
          plan?: "free" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cities"]["Insert"]>;
      };
      outings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          venue_ids: string[];
          venue_order: number[];
          notes: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          venue_ids?: string[];
          venue_order?: number[];
          notes?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["outings"]["Insert"]>;
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          venue_ids: string[];
          plan: "free" | "pro" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          risk_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          venue_ids?: string[];
          plan?: "free" | "pro" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          risk_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
      };
      venue_change_reports: {
        Row: {
          id: string;
          venue_id: string;
          user_id: string;
          description: string;
          change_type: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          user_id: string;
          description: string;
          change_type?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venue_change_reports"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      disability_type: "mobility" | "vision" | "hearing" | "cognitive" | "sensory" | "other";
      venue_category:
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
      subscription_plan: "free" | "pro" | "enterprise";
      civic_status: "open" | "in_progress" | "resolved" | "closed";
      civic_report_type:
        | "broken_sidewalk"
        | "missing_curb_cut"
        | "blocked_ramp"
        | "broken_elevator"
        | "inaccessible_crossing"
        | "missing_signage"
        | "inaccessible_parking"
        | "other";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
