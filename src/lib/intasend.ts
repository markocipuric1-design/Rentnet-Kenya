import IntaSend from "intasend-node";

const isTest = process.env.INTASEND_TEST_MODE === "true";

export const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY!,
  process.env.INTASEND_SECRET_KEY!,
  isTest,
);

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const AGENCY_ANNUAL_PRICE_KES = 25000;

export const AD_PRICES: Record<string, Record<number, number>> = {
  sidebar:            { 7: 1500, 14: 2500, 30: 4000 },
  infeed:             { 7: 2000, 14: 3500, 30: 5500 },
  "featured-partner": { 7: 1000, 14: 1800, 30: 3000 },
  homepage:           { 7: 3000, 14: 5000, 30: 8000 },
};

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return "254" + digits;
}
