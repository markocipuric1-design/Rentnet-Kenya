"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Home, Building2, BarChart3, Shield, ShieldOff, Hash, UserCheck, Wrench, CheckCircle, XCircle, MapPin, LayoutGrid, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { type FeatureTile, DEFAULT_FEATURE_TILES } from "@/components/sections/bento-features";
import { createClient } from "@/lib/supabase/client";

type Stats = { users: number; listings: number; pendingAgencies: number; activeListings: number; pendingProfiles: number; pendingPartners: number };
type RecentListing = { id: string; title: string; type: string; city: string; price: number; status: string; created_at: string };
type RecentUser = { id: string; full_name: string | null; account_type: string; created_at: string };
type PendingPartner = { id: string; category: string; subcategory: string | null; company_name: string; contact_name: string; email: string; phone: string | null; city: string; website: string | null; description: string | null; created_at: string };
type Limits = { fizicna_oseba: string; agencija: string; administrator: string };

const ROLE_LABEL: Record<string, string> = { administrator: "Administrator", fizicna_oseba: "Individual", agencija: "Agency" };
const ROLE_COLOR: Record<string, string> = {
  administrator: "bg-primary/10 text-primary",
  fizicna_oseba: "bg-emerald-500/10 text-emerald-600",
  agencija: "bg-sky-500/10 text-sky-600",
};

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 ${enabled ? "bg-amber-500" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, listings: 0, pendingAgencies: 0, activeListings: 0, pendingProfiles: 0, pendingPartners: 0 });
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderation, setModeration] = useState(false);
  const [togglingModeration, setTogglingModeration] = useState(false);
  const [profileModeration, setProfileModeration] = useState(false);
  const [togglingProfileModeration, setTogglingProfileModeration] = useState(false);
  const [limits, setLimits] = useState<Limits>({ fizicna_oseba: "3", agencija: "50", administrator: "999" });
  const [savingLimits, setSavingLimits] = useState(false);
  const [limitsSaved, setLimitsSaved] = useState(false);
  const [featureTiles, setFeatureTiles] = useState<FeatureTile[]>(DEFAULT_FEATURE_TILES);
  const [savingTiles, setSavingTiles] = useState(false);
  const [tilesSaved, setTilesSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [
        { count: users },
        { count: listings },
        { count: pendingAgencies },
        { count: activeListings },
        { data: latestListings },
        { data: latestUsers },
        { data: allSettings },
        { count: pendingProfiles },
        { data: partners, count: pendingPartnersCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("listings").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "agencija").eq("verified", false),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("listings").select("id, title, type, city, price, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("id, full_name, account_type, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("site_settings").select("key, value"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("profile_status", "pending"),
        supabase.from("partners").select("id, category, subcategory, company_name, contact_name, email, phone, city, website, description, created_at", { count: "exact" }).eq("verified", false).order("created_at", { ascending: false }),
      ]);

      const s = Object.fromEntries((allSettings ?? []).map(r => [r.key, r.value]));
      setModeration(s["moderation_enabled"] === "true");
      setProfileModeration(s["profile_moderation_enabled"] === "true");
      setLimits({
        fizicna_oseba: s["limit_fizicna_oseba"] ?? "3",
        agencija: s["limit_agencija"] ?? "50",
        administrator: s["limit_administrator"] ?? "999",
      });
      if (s["features_tiles"]) {
        try {
          const parsed = JSON.parse(s["features_tiles"]) as FeatureTile[];
          if (Array.isArray(parsed) && parsed.length > 0) setFeatureTiles(parsed);
        } catch { /* keep default */ }
      }
      setStats({ users: users ?? 0, listings: listings ?? 0, pendingAgencies: pendingAgencies ?? 0, activeListings: activeListings ?? 0, pendingProfiles: pendingProfiles ?? 0, pendingPartners: pendingPartnersCount ?? 0 });
      setRecentListings(latestListings ?? []);
      setRecentUsers(latestUsers ?? []);
      setPendingPartners(partners ?? []);
      setLoading(false);
    })();
  }, []);

  const toggleModeration = async () => {
    setTogglingModeration(true);
    const supabase = createClient();
    await supabase.from("site_settings").update({ value: (!moderation).toString(), updated_at: new Date().toISOString() }).eq("key", "moderation_enabled");
    setModeration(!moderation);
    setTogglingModeration(false);
  };

  const toggleProfileModeration = async () => {
    setTogglingProfileModeration(true);
    const supabase = createClient();
    await supabase.from("site_settings").update({ value: (!profileModeration).toString(), updated_at: new Date().toISOString() }).eq("key", "profile_moderation_enabled");
    setProfileModeration(!profileModeration);
    setTogglingProfileModeration(false);
  };

  const saveLimits = async () => {
    setSavingLimits(true);
    const supabase = createClient();
    await Promise.all([
      supabase.from("site_settings").update({ value: limits.fizicna_oseba, updated_at: new Date().toISOString() }).eq("key", "limit_fizicna_oseba"),
      supabase.from("site_settings").update({ value: limits.agencija, updated_at: new Date().toISOString() }).eq("key", "limit_agencija"),
      supabase.from("site_settings").update({ value: limits.administrator, updated_at: new Date().toISOString() }).eq("key", "limit_administrator"),
    ]);
    setSavingLimits(false);
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 2500);
  };

  const approvePartner = async (id: string) => {
    const supabase = createClient();
    await supabase.from("partners").update({ verified: true }).eq("id", id);
    setPendingPartners((prev) => prev.filter((p) => p.id !== id));
    setStats((s) => ({ ...s, pendingPartners: s.pendingPartners - 1 }));
  };

  const rejectPartner = async (id: string) => {
    const supabase = createClient();
    await supabase.from("partners").delete().eq("id", id);
    setPendingPartners((prev) => prev.filter((p) => p.id !== id));
    setStats((s) => ({ ...s, pendingPartners: s.pendingPartners - 1 }));
  };

  const saveFeatureTiles = async () => {
    setSavingTiles(true);
    try {
      const res = await fetch("/api/admin/save-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "features_tiles", value: JSON.stringify(featureTiles) }),
      });
      if (!res.ok) {
        const { error } = await res.json() as { error?: string };
        console.error("[saveFeatureTiles]", error);
        alert(`Save failed: ${error ?? "unknown error"}`);
        return;
      }
      setTilesSaved(true);
      setTimeout(() => setTilesSaved(false), 2500);
    } finally {
      setSavingTiles(false);
    }
  };

  const updateTile = (idx: number, field: keyof FeatureTile, value: unknown) =>
    setFeatureTiles(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));

  const moveTile = (idx: number, dir: -1 | 1) =>
    setFeatureTiles(prev => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  const addTile = () =>
    setFeatureTiles(prev => [...prev, {
      id: Date.now().toString(),
      title: "New feature", description: "Describe this feature.",
      meta: "", icon: "check", status: "Active", tags: [], colSpan: 1, featured: false,
    }]);

  const removeTile = (idx: number) =>
    setFeatureTiles(prev => prev.filter((_, i) => i !== idx));

  const ICON_OPTIONS = [
    "shield", "search", "trending", "map", "clock",
    "star", "home", "building", "users", "check", "mail",
  ];

  const statCards = [
    { label: "Total users", value: stats.users, icon: Users, color: "text-primary bg-primary/10" },
    { label: "Active listings", value: stats.activeListings, icon: BarChart3, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Total listings", value: stats.listings, icon: Home, color: "text-sky-500 bg-sky-500/10" },
    { label: "Agencies — pending approval", value: stats.pendingAgencies, icon: Building2, color: "text-amber-500 bg-amber-500/10" },
    { label: "Profiles — pending approval", value: stats.pendingProfiles, icon: UserCheck, color: stats.pendingProfiles > 0 ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground bg-muted" },
    { label: "Partners — pending approval", value: stats.pendingPartners, icon: Wrench, color: stats.pendingPartners > 0 ? "text-violet-500 bg-violet-500/10" : "text-muted-foreground bg-muted" },
  ];

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to the admin panel.</p>
      </div>

      {/* Settings — moderation + limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Listing moderation */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${moderation ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              {moderation ? <Shield className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Listing moderation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {moderation ? "Enabled — listings await approval" : "Disabled — listings published immediately"}
              </p>
            </div>
          </div>
          <Toggle enabled={moderation} onToggle={toggleModeration} disabled={togglingModeration} />
        </div>

        {/* Profile moderation */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${profileModeration ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              {profileModeration ? <UserCheck className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Profile moderation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profileModeration ? "Enabled — new profiles await approval" : "Disabled — profiles are immediately active"}
              </p>
            </div>
          </div>
          <Toggle enabled={profileModeration} onToggle={toggleProfileModeration} disabled={togglingProfileModeration} />
        </div>

        {/* Listing limits */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Listing limits</p>
              <p className="text-xs text-muted-foreground mt-0.5">Max. number of active listings per user</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { key: "fizicna_oseba" as const, label: "Individual", color: "text-emerald-600" },
              { key: "agencija" as const, label: "Agency", color: "text-sky-600" },
              { key: "administrator" as const, label: "Administrator", color: "text-primary" },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <p className={`text-[11px] font-semibold mb-1.5 ${color}`}>{label}</p>
                <input
                  type="number"
                  min="1"
                  value={limits[key]}
                  onChange={e => setLimits(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-center font-bold"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveLimits}
            disabled={savingLimits}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${limitsSaved ? "bg-emerald-500 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"} disabled:opacity-60`}
          >
            {savingLimits ? "Saving…" : limitsSaved ? "✓ Saved" : "Save limits"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground text-sm">New Users</h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0
              ? <p className="text-sm text-muted-foreground p-5">No data.</p>
              : recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-KE")}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[u.account_type] ?? "bg-muted text-muted-foreground"}`}>
                    {ROLE_LABEL[u.account_type] ?? u.account_type}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground text-sm">New Listings</h2>
            <Link href="/admin/listings" className="text-xs text-primary hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-border">
            {recentListings.length === 0
              ? <p className="text-sm text-muted-foreground p-5">No data.</p>
              : recentListings.map((l) => (
                <div key={l.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.city} · {new Date(l.created_at).toLocaleDateString("en-KE")}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ml-3 flex-shrink-0 ${l.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {l.status === "active" ? "Active" : "Draft"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── Feature Tiles Editor ─────────────────────────────────────────── */}
      <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Feature Tiles</h2>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Why choose Rentnet? section
            </span>
          </div>
          <button
            onClick={addTile}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add tile
          </button>
        </div>

        <div className="p-5 space-y-3">
          {featureTiles.map((tile, idx) => (
            <div key={tile.id} className="bg-background border border-border rounded-2xl p-4 space-y-3">
              {/* Row 1: controls */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                  Tile {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveTile(idx, -1)} disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => moveTile(idx, 1)} disabled={idx === featureTiles.length - 1}
                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => removeTile(idx)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors ml-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: title + status + icon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Title</label>
                  <input
                    value={tile.title}
                    onChange={e => updateTile(idx, "title", e.target.value)}
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Status badge</label>
                  <input
                    value={tile.status ?? ""}
                    onChange={e => updateTile(idx, "status", e.target.value)}
                    placeholder="Active"
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Icon</label>
                  <select
                    value={tile.icon}
                    onChange={e => updateTile(idx, "icon", e.target.value)}
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                  >
                    {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: meta */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Meta <span className="normal-case font-normal">(shown next to title)</span>
                </label>
                <input
                  value={tile.meta}
                  onChange={e => updateTile(idx, "meta", e.target.value)}
                  placeholder="e.g.  100% checked  or  auto:active_listings  or  auto:total_agents"
                  className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono placeholder:font-sans placeholder:text-muted-foreground/50"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Use <code className="bg-muted px-1 rounded">auto:active_listings</code> or <code className="bg-muted px-1 rounded">auto:total_agents</code> for live counts.
                </p>
              </div>

              {/* Row 4: description */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
                <textarea
                  rows={2}
                  value={tile.description}
                  onChange={e => updateTile(idx, "description", e.target.value)}
                  className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {/* Row 5: CTA text + CTA URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    CTA text <span className="font-normal normal-case">(shown on hover)</span>
                  </label>
                  <input
                    value={tile.ctaText ?? ""}
                    onChange={e => updateTile(idx, "ctaText", e.target.value)}
                    placeholder="e.g.  View listings →"
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    CTA link <span className="font-normal normal-case">(URL)</span>
                  </label>
                  <input
                    value={tile.ctaHref ?? ""}
                    onChange={e => updateTile(idx, "ctaHref", e.target.value)}
                    placeholder="e.g.  /listings  or  https://…"
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono placeholder:font-sans placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Row 6: tags + width + featured */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Tags <span className="font-normal normal-case">(comma-separated)</span></label>
                  <input
                    value={(tile.tags ?? []).join(", ")}
                    onChange={e => updateTile(idx, "tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    placeholder="Safety, Trust"
                    className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Width</label>
                  <div className="flex gap-1">
                    {[1, 2].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateTile(idx, "colSpan", w)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${(tile.colSpan ?? 1) === w ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        {w} col{w === 2 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                  <div
                    onClick={() => updateTile(idx, "featured", !tile.featured)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${tile.featured ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    {tile.featured && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-foreground">Featured (glow)</span>
                </label>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={addTile}
              className="flex items-center gap-2 border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="h-4 w-4" /> Add tile
            </button>
            <button
              onClick={saveFeatureTiles}
              disabled={savingTiles}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${tilesSaved ? "bg-emerald-500 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"}`}
            >
              {savingTiles
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : tilesSaved
                ? "✓ Saved"
                : "Save tiles"}
            </button>
          </div>
        </div>
      </div>

      {/* Partner registrations */}
      <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-foreground text-sm">Partner Registrations</h2>
            {pendingPartners.length > 0 && (
              <span className="text-[10px] font-bold bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full">
                {pendingPartners.length} pending
              </span>
            )}
          </div>
          <Link href="/admin/partners" className="text-xs text-primary hover:underline">All →</Link>
        </div>
        {pendingPartners.length === 0 ? (
          <p className="text-sm text-muted-foreground p-5">No pending partner registrations.</p>
        ) : (
          <div className="divide-y divide-border">
            {pendingPartners.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-foreground">{p.company_name}</p>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{p.category}</span>
                    {p.subcategory && (
                      <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.subcategory}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.contact_name} · {p.email}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" /> {p.city}
                    </span>
                    {p.phone && <span className="text-xs text-muted-foreground">{p.phone}</span>}
                    {p.website && <span className="text-xs text-muted-foreground truncate max-w-[160px]">{p.website}</span>}
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => approvePartner(p.id)}
                    className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => rejectPartner(p.id)}
                    className="flex items-center gap-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
