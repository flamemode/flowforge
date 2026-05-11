import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

// Convenience proxy — callers can use `stripe.customers.create(...)` as before
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return (getStripe() as unknown as Record<string, unknown>)[prop];
  },
});

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  team_annual: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID!,
  agency_monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
  agency_annual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID!,
};
