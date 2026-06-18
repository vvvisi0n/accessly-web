import type { DisabilityType } from "./shared";

export type SubscriptionPlan = "free" | "pro" | "enterprise";

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  disability_types: DisabilityType[];
  preferred_language: string;
  reputation_score: number;
  review_count: number;
  saved_venues: string[];
  plan: SubscriptionPlan;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  venue_ids: string[];
  plan: SubscriptionPlan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
}
