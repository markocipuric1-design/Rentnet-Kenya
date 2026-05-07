"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, TrendingUp, BarChart2, Users } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type DayView = { view_date: string; view_count: number };
type ListingViewCount = { listing_id: string; total: number; last_30_days: number };
type Listing = { id: string; title: string; city: string; type: string };

const COLORS = {
  listings: "oklch(0.52 0.27 293)",
  profile: "oklch(0.6 0.18 210)",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold text-foreground">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function AnalytikaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [combinedDaily, setCombinedDaily] = useState<{ date: string; oglasi: number; profil: number }[]>([]);
  const [topListings, setTopListings] = useState<{ title: string; city: string; type: string; total: number; month: number }[]>([]);
  const [totals, setTotals] = useState({ listingViews: 0, profileViews: 0, listingMonth: 0, profileMonth: 0 });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/dashboard/analitika"); return; }

      const [
        { data: listingDaily },
        { data: profileDaily },
        { data: listingCounts },
        { data: listings },
      ] = await Promise.all([
        supabase.rpc("get_my_daily_views", { days_back: 30 }),
        supabase.rpc("get_my_daily_profile_views", { days_back: 30 }),
        supabase.rpc("get_my_listing_view_counts"),
        supabase.from("listings").select("id, title, city, type").eq("user_id", user.id),
      ]);

      // Build 30-day combined series
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split("T")[0];
      });
      const lMap = Object.fromEntries((listingDaily ?? []).map((d: DayView) => [d.view_date, d.view_count]));
      const pMap = Object.fromEntries((profileDaily ?? []).map((d: DayView) => [d.view_date, d.view_count]));
      setCombinedDaily(days.map((d) => ({
        date: formatDate(d),
        oglasi: lMap[d] ?? 0,
        profil: pMap[d] ?? 0,
      })));

      // Top listings by views
      const countsMap = Object.fromEntries((listingCounts ?? []).map((v: ListingViewCount) => [v.listing_id, v]));
      const listingMap = Object.fromEntries((listings ?? []).map((l: Listing) => [l.id, l]));
      const top = (listingCounts ?? [])
        .map((v: ListingViewCount) => ({
          title: listingMap[v.listing_id]?.title ?? "—",
          city: listingMap[v.listing_id]?.city ?? "",
          type: listingMap[v.listing_id]?.type ?? "",
          total: Number(v.total),
          month: Number(v.last_30_days),
        }))
        .sort((a: { total: number }, b: { total: number }) => b.total - a.total)
        .slice(0, 8);
      setTopListings(top);

      const listingViews = (listingCounts ?? []).reduce((s: number, v: ListingViewCount) => s + Number(v.total), 0);
      const listingMonth = (listingCounts ?? []).reduce((s: number, v: ListingViewCount) => s + Number(v.last_30_days), 0);
      const profileViews = (profileDaily ?? []).reduce((s: number, v: DayView) => s + Number(v.view_count), 0);
      const profileMonth = profileViews;
      setTotals({ listingViews, profileViews, listingMonth, profileMonth });

      setLoading(false);
    })();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  const statCards = [
    { label: "Ogledi oglasov skupaj", value: totals.listingViews, icon: Eye, color: "text-primary bg-primary/10" },
    { label: "Ogledi oglasov (30 dni)", value: totals.listingMonth, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Ogledi profila skupaj", value: totals.profileViews, icon: Users, color: "text-sky-500 bg-sky-500/10" },
    { label: "Ogledi profila (30 dni)", value: totals.profileMonth, icon: BarChart2, color: "text-amber-500 bg-amber-500/10" },
  ];

  const noData = totals.listingViews === 0 && totals.profileViews === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Statistika ogledov vaših oglasov in profila</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.label}</div>
            </div>
          ))}
        </div>

        {noData ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <BarChart2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Še ni podatkov</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Ko bodo vaši oglasi ali profil obiskani, se bodo tukaj prikazali grafi.
            </p>
          </div>
        ) : (
          <>
            {/* Combined area chart */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-foreground mb-6">Ogledi zadnjih 30 dni</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={combinedDaily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradOglasi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.listings} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.listings} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProfil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.profile} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.profile} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                    formatter={(value) => value === "oglasi" ? "Oglasi" : "Profil"}
                  />
                  <Area type="monotone" dataKey="oglasi" stroke={COLORS.listings} strokeWidth={2} fill="url(#gradOglasi)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="profil" stroke={COLORS.profile} strokeWidth={2} fill="url(#gradProfil)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top listings bar chart */}
            {topListings.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-foreground mb-6">Ogledi po oglasih (skupaj vs zadnjih 30 dni)</h2>
                <ResponsiveContainer width="100%" height={Math.max(topListings.length * 52, 160)}>
                  <BarChart
                    data={topListings}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={160}
                      tick={{ fontSize: 11, fill: "var(--foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "…" : v}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                      formatter={(value) => value === "total" ? "Skupaj" : "Last 30 days"}
                    />
                    <Bar dataKey="total" name="total" fill={COLORS.listings} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="month" name="month" fill={COLORS.profile} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
