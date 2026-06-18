export const PLANS = {
  free: {
    label: "Free",
    price: 0,
    features: [
      "venue_search",
      "venue_reviews",
      "access_index_view",
      "outing_planner",
      "civic_reporting",
      "community_feed",
      "venue_claiming",
    ],
  },
  pro: {
    label: "Pro",
    price: 49,
    features: [
      "pro_dashboard",
      "compliance_engine",
      "space_designer",
      "analytics",
      "review_responses",
      "grant_finder",
      "api_access_limited",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: null,
    features: [
      "portfolio_risk_scanner",
      "multi_site_hub",
      "city_dashboard",
      "api_access_unlimited",
      "verified_venue_program",
      "white_label",
    ],
  },
} as const;

export type Plan = keyof typeof PLANS;

type FreeFeature = (typeof PLANS)["free"]["features"][number];
type ProFeature = (typeof PLANS)["pro"]["features"][number];
type EnterpriseFeature = (typeof PLANS)["enterprise"]["features"][number];
export type Feature = FreeFeature | ProFeature | EnterpriseFeature;

export function hasFeature(plan: Plan, feature: Feature): boolean {
  if (plan === "enterprise") return true;
  if (plan === "pro") {
    return ([...PLANS.pro.features, ...PLANS.free.features] as string[]).includes(feature);
  }
  return (PLANS.free.features as string[]).includes(feature);
}
