import Stripe from "stripe";

// Lazy singleton so the Stripe SDK is only initialized on first request,
// not at module evaluation time (which would throw during Next.js builds
// when STRIPE_SECRET_KEY is not set in the build environment).
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-05-28.basil",
    });
  }
  return _stripe;
}

// Keep the named export for files that import `stripe` directly — they need
// to be updated to call getStripe() instead, but this prevents a missing-export
// error in the interim.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
} as const;
