export const PLAN_LIMITS = {
  free: {
    savedVenues: 10,
    reviewsPerMonth: 5,
    outingsPerMonth: 3,
  },
  pro: {
    savedVenues: Infinity,
    reviewsPerMonth: Infinity,
    outingsPerMonth: Infinity,
  },
  enterprise: {
    savedVenues: Infinity,
    reviewsPerMonth: Infinity,
    outingsPerMonth: Infinity,
  },
} as const;
