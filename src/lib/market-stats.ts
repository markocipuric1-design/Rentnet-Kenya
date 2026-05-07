export type MarketListing = {
  price: number;
  area: number | null;
  type: string;
  status: string;
  created_at: string;
};

export type MarketListingWithCity = MarketListing & {
  city: string;
  category?: string | null;
};

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function avgPricePerM2(listings: MarketListing[]): number | null {
  const valid = listings.filter((l) => l.area && l.area > 0);
  if (!valid.length) return null;
  const sum = valid.reduce((acc, l) => acc + l.price / l.area!, 0);
  return sum / valid.length;
}

export function monthlyTrend(
  listings: MarketListing[],
  months = 12,
): { month: string; label: string; median: number | null }[] {
  const now = new Date();
  const buckets: { month: string; label: string; prices: number[] }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
    buckets.push({ month: key, label, prices: [] });
  }

  listings.forEach((l) => {
    const key = l.created_at.slice(0, 7);
    const bucket = buckets.find((b) => b.month === key);
    if (bucket) bucket.prices.push(l.price);
  });

  return buckets.map((b) => ({ month: b.month, label: b.label, median: median(b.prices) }));
}

export function rentalYield(
  medianSale: number | null,
  medianRent: number | null,
): number | null {
  if (!medianSale || !medianRent || medianSale <= 0) return null;
  return (medianRent * 12) / medianSale * 100;
}

export function cityComparison(
  allListings: MarketListingWithCity[],
  category: string | null,
  type: string,
): { city: string; median: number }[] {
  const cityMap: Record<string, number[]> = {};
  allListings
    .filter((l) => type === "All" || l.type === type)
    .filter((l) => !category || category === "All" || l.category === category)
    .forEach((l) => {
      if (!l.city) return;
      if (!cityMap[l.city]) cityMap[l.city] = [];
      cityMap[l.city].push(l.price);
    });

  return Object.entries(cityMap)
    .map(([city, prices]) => ({ city, median: median(prices) ?? 0 }))
    .filter((e) => e.median > 0)
    .sort((a, b) => b.median - a.median)
    .slice(0, 10);
}
