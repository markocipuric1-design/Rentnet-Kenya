import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const AGENCY_PRICE_ID = process.env.STRIPE_AGENCY_PRICE_ID!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
