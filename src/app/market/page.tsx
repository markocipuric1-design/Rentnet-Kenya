"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, BarChart2, Home, ChevronDown, Building2,
  DollarSign, Users, Percent, Info,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";
import {
  MarketListingWithCity, median, avgPricePerM2, monthlyTrend, rentalYield,
} from "@/lib/market-stats";

// ─── Types ────────────────────────────────────────────────────────────────────

type CityRow = MarketListingWithCity;

const CATEGORIES = [
  "All", "Apartments", "Houses", "Land", "Commercial",
  "Industrial", "Farms & Agriculture", "Holiday Homes",
  "Garages & Parking", "New Developments", "Other / Special",
];

const TYPES = ["For Sale", "For Rent", "Buying", "Renting"];

const PRIMARY = "oklch(0.52 0.27 293)";
const PRIMARY_FADED = "oklch(0.52 0.27 293 / 0.15)";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function PriceTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !payload[0].value) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">
        KES {Math.round(payload[0].value).toLocaleString("en-KE")}
      </p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative flex flex-col gap-3 p-5 rounded-2xl border overflow-hidden transition-all duration-300
      ${accent ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:16px_16px]" />
      <div className="relative flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="relative">
        {value ? (
          <p className="text-2xl font-extrabold text-foreground leading-tight">{value}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not enough data</p>
        )}
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Selector ─────────────────────────────────────────────────────────────────

function Selector({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border hover:border-primary/40 rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function MarketPageInner() {
  const searchParams = useSearchParams();
  const [city, setCity] = useState(() => searchParams.get("city") ?? "All");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "All");
  const [type, setType] = useState(() => searchParams.get("type") ?? "For Sale");
  const [allRows, setAllRows] = useState<CityRow[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all relevant rows once, re-fetch when type changes
  useEffect(() => {
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data } = await supabase
        .from("listings")
        .select("price, area, type, status, created_at, city, category")
        .in("status", ["active", "sold", "rented"])
        .gte("created_at", twelveMonthsAgo.toISOString())
        .limit(2000);

      const rows = (data ?? []) as CityRow[];
      setAllRows(rows);
      const uniqueCities = [...new Set(rows.map((r) => r.city).filter(Boolean))].sort();
      setCities(uniqueCities);
      setLoading(false);
    })();
  }, []);

  // Filtered subset for selected city + category + type
  const subset = useMemo(() => {
    return allRows.filter((r) => {
      if (city !== "All" && r.city !== city) return false;
      if (category !== "All" && r.category !== category) return false;
      if (type !== "All" && r.type !== type) return false;
      return true;
    });
  }, [allRows, city, category, type]);

  // Rental data for yield calculation (same city+category, rental type)
  const rentalSubset = useMemo(() => {
    return allRows.filter((r) => {
      if (city !== "All" && r.city !== city) return false;
      if (category !== "All" && r.category !== category) return false;
      return r.type === "For Rent" || r.type === "Renting";
    });
  }, [allRows, city, category]);

  // Computed stats
  const prices = useMemo(() => subset.map((r) => r.price), [subset]);
  const medianPrice = useMemo(() => median(prices), [prices]);
  const avgM2 = useMemo(() => avgPricePerM2(subset), [subset]);
  const activeCount = useMemo(() => subset.filter((r) => r.status === "active").length, [subset]);
  const trend = useMemo(() => monthlyTrend(subset), [subset]);
  const yieldPct = useMemo(() => {
    if (type !== "For Sale" && type !== "All") return null;
    return rentalYield(medianPrice, median(rentalSubset.map((r) => r.price)));
  }, [medianPrice, rentalSubset, type]);

  // City comparison (all cities, same category + type)
  const cityComparison = useMemo(() => {
    const map: Record<string, number[]> = {};
    allRows
      .filter((r) => category === "All" || r.category === category)
      .filter((r) => type === "All" || r.type === type)
      .forEach((r) => {
        if (!r.city) return;
        if (!map[r.city]) map[r.city] = [];
        map[r.city].push(r.price);
      });
    return Object.entries(map)
      .map(([c, vals]) => ({ city: c, median: median(vals) ?? 0 }))
      .filter((e) => e.median > 0)
      .sort((a, b) => b.median - a.median)
      .slice(0, 10);
  }, [allRows, category, type]);

  const trendWithData = trend.filter((t) => t.median !== null);
  const hasChart = trendWithData.length >= 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Market trends", href: "/market" }]} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
              Market data
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Kenya Property Market</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 flex-shrink-0" />
            Based on asking prices from active &amp; recently sold/rented listings · Updated live
          </p>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Selector
            label="City"
            value={city}
            options={["All", ...cities]}
            onChange={setCity}
          />
          <Selector
            label="Category"
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
          />
          <Selector
            label="Type"
            value={type}
            options={["All", ...TYPES]}
            onChange={setType}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Median price"
                value={medianPrice ? formatPrice(medianPrice, type === "For Rent" || type === "Renting" ? type : "For Sale") : null}
                sub="50th percentile of asking prices"
                accent
              />
              <StatCard
                icon={<Building2 className="h-4 w-4 text-primary" />}
                label="Avg price / m²"
                value={avgM2 ? `KES ${Math.round(avgM2).toLocaleString("en-KE")}` : null}
                sub="For listings with area data"
              />
              <StatCard
                icon={<Users className="h-4 w-4 text-primary" />}
                label="Active listings"
                value={activeCount > 0 ? activeCount.toLocaleString("en-KE") : null}
                sub="In selected filters"
              />
              <StatCard
                icon={<Percent className="h-4 w-4 text-primary" />}
                label="Rental yield"
                value={yieldPct ? `~${yieldPct.toFixed(1)}% p.a.` : null}
                sub="Approx. gross yield · asking prices only"
              />
            </div>

            {/* ── 12-month trend chart ── */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-foreground text-sm">12-month asking price trend</h2>
                <span className="text-xs text-muted-foreground ml-auto">Median KES · by listing date</span>
              </div>
              {hasChart ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.08)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.5 0 0 / 0.6)" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${Math.round(v / 1_000)}K` : String(v)}
                      tick={{ fontSize: 11, fill: "oklch(0.5 0 0 / 0.6)" }}
                      axisLine={false} tickLine={false} width={52}
                    />
                    <Tooltip content={<PriceTooltip />} />
                    <Area
                      type="monotone" dataKey="median" stroke={PRIMARY} strokeWidth={2.5}
                      fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: PRIMARY }}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  Not enough data for the selected filters to draw a trend line.
                </div>
              )}
            </div>

            {/* ── City comparison bar chart ── */}
            {city === "All" && cityComparison.length >= 2 && (
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-foreground text-sm">Median price by city</h2>
                  <span className="text-xs text-muted-foreground ml-auto">Top 10 cities · {type}</span>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(180, cityComparison.length * 36)}>
                  <BarChart data={cityComparison} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.5 0 0 / 0.08)" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${Math.round(v / 1_000)}K`}
                      tick={{ fontSize: 11, fill: "oklch(0.5 0 0 / 0.6)" }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11, fill: "oklch(0.5 0 0 / 0.7)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<PriceTooltip />} cursor={{ fill: PRIMARY_FADED }} />
                    <Bar dataKey="median" fill={PRIMARY} radius={[0, 6, 6, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Disclaimer + CTA ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/50 border border-border rounded-2xl px-5 py-4 text-xs text-muted-foreground">
              <p className="leading-relaxed max-w-xl">
                <strong className="text-foreground">Data note:</strong> All figures are based on <em>asking prices</em> from listings posted on Rentnet, not confirmed transaction prices. Rental yield is approximate and gross only.
              </p>
              <Link
                href="/listings"
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-primary font-semibold hover:underline underline-offset-4"
              >
                <Home className="h-3.5 w-3.5" /> Browse listings
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MarketPageInner />
    </Suspense>
  );
}
