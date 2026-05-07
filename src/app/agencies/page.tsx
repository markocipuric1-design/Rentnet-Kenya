"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toAgentSlug } from "@/lib/utils";
import {
  Home, Search, Star, MapPin, Shield, Award,
  ChevronRight, TrendingUp, Users, X,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";

type Agent = {
  id: string;
  slug: string | null;
  full_name: string | null;
  account_type: string;
  verified: boolean;
  avatar_url: string | null;
  created_at: string;
  activeListings: number;
  avgRating: number;
  reviewCount: number;
};

const ROLE_LABEL: Record<string, string> = {
  fizicna_oseba: "Individual",
  agencija: "Agency",
};

const sortOptions = [
  { value: "rating",   label: "Highest rating" },
  { value: "reviews",  label: "Most reviews" },
  { value: "listings", label: "Most listings" },
  { value: "newest",   label: "Newest" },
];

function AgentCard({ agent }: { agent: Agent }) {
  const initials = (agent.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/agencies/${agent.slug ?? toAgentSlug(agent.full_name)}`}
      className="group relative bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.03)_1px,transparent_1px)] bg-[length:18px_18px]" />
      </div>

      <div className="relative p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
            {agent.avatar_url
              ? <img src={agent.avatar_url} alt={agent.full_name ?? ""} className="w-full h-full object-cover" />
              : <span className="text-lg font-bold text-primary">{initials}</span>}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {agent.full_name || "—"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ROLE_LABEL[agent.account_type] ?? agent.account_type}
            </p>
          </div>

          {agent.avgRating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {agent.avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: agent.activeListings, label: "Active listings" },
            { value: agent.reviewCount, label: "Reviews" },
          ].map((s) => (
            <div key={s.label} className="bg-muted/60 rounded-xl px-2 py-2 text-center">
              <p className="font-bold text-sm text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {agent.verified && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full w-fit">
            <Shield className="h-2.5 w-2.5" /> Verified
          </span>
        )}
      </div>

      <div className="relative border-t border-border px-5 py-3 flex items-center justify-end">
        <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          View profile <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-muted rounded-full w-3/4" />
            <div className="h-3 bg-muted rounded-full w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
      </div>
      <div className="border-t border-border px-5 py-3">
        <div className="h-3 bg-muted rounded-full w-16 ml-auto" />
      </div>
    </div>
  );
}

export default function AgentiPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("vse");

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const [
        { data: profiles },
        { data: listings },
        { data: reviews },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, slug, full_name, account_type, verified, avatar_url, created_at")
          .eq("account_type", "agencija")
          .neq("profile_status", "pending")
          .neq("profile_status", "suspended"),
        supabase
          .from("listings")
          .select("user_id")
          .eq("status", "active"),
        supabase
          .from("reviews")
          .select("reviewed_id, rating"),
      ]);

      const listingCounts: Record<string, number> = {};
      (listings ?? []).forEach((l) => {
        listingCounts[l.user_id] = (listingCounts[l.user_id] ?? 0) + 1;
      });

      const reviewStats: Record<string, { sum: number; count: number }> = {};
      (reviews ?? []).forEach((r) => {
        if (!reviewStats[r.reviewed_id]) reviewStats[r.reviewed_id] = { sum: 0, count: 0 };
        reviewStats[r.reviewed_id].sum += r.rating;
        reviewStats[r.reviewed_id].count += 1;
      });

      setAgents(
        (profiles ?? []).map((p) => ({
          ...p,
          activeListings: listingCounts[p.id] ?? 0,
          avgRating: reviewStats[p.id]
            ? reviewStats[p.id].sum / reviewStats[p.id].count
            : 0,
          reviewCount: reviewStats[p.id]?.count ?? 0,
        }))
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...agents];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.full_name?.toLowerCase().includes(q));
    }

    if (typeFilter !== "vse") list = list.filter((a) => a.account_type === typeFilter);
    if (verifiedOnly) list = list.filter((a) => a.verified);

    list.sort((a, b) => {
      if (sort === "rating")   return b.avgRating - a.avgRating;
      if (sort === "reviews")  return b.reviewCount - a.reviewCount;
      if (sort === "listings") return b.activeListings - a.activeListings;
      if (sort === "newest")   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

    return list;
  }, [agents, search, sort, verifiedOnly, typeFilter]);

  const activeFilterChips = [
    typeFilter !== "vse" && { key: "type", label: ROLE_LABEL[typeFilter] ?? typeFilter },
    verifiedOnly && { key: "verified", label: "Verified" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">

        <Breadcrumb items={[{ label: "Agencies" }]} className="mb-8" />

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <Shield className="h-3.5 w-3.5" /> Registered Users
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Find Your Agent
          </h1>
          <p className="text-muted-foreground max-w-lg">
            {loading ? "Loading…" : `Choose from ${agents.length} registered agents.`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Users className="h-5 w-5 text-primary" />, value: loading ? "…" : `${agents.length}`, label: "Registered" },
            { icon: <TrendingUp className="h-5 w-5 text-primary" />, value: loading ? "…" : `${agents.filter(a => a.activeListings > 0).length}`, label: "With active listings" },
            { icon: <Award className="h-5 w-5 text-primary" />, value: loading ? "…" : `${agents.filter(a => a.verified).length}`, label: "Verified" },
            { icon: <Star className="h-5 w-5 text-primary" />, value: loading ? "…" : agents.filter(a => a.avgRating > 0).length > 0 ? (agents.filter(a => a.avgRating > 0).reduce((s, a) => s + a.avgRating, 0) / agents.filter(a => a.avgRating > 0).length).toFixed(1) : "—", label: "Average rating" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

<label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-border rounded-xl px-3 py-2.5">
            <div
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${verifiedOnly ? "bg-primary" : "bg-border"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            Verified only
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-border bg-card rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 cursor-pointer"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterChips.map((f) => (
              <span key={f.key} className="flex items-center gap-1.5 text-xs font-semibold bg-accent text-primary px-3 py-1.5 rounded-full">
                {f.label}
                <button onClick={() => { if (f.key === "type") setTypeFilter("vse"); if (f.key === "verified") setVerifiedOnly(false); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-5">
          {loading ? "" : `${filtered.length} ${filtered.length === 1 ? "agent" : "agents"}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-foreground text-lg mb-2">No results found</h3>
            <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters.</p>
            <button
              onClick={() => { setSearch(""); setTypeFilter("vse"); setVerifiedOnly(false); }}
              className="bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl transition-all text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
