import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ?? "",
} as const;
