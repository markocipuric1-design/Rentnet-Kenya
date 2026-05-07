"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { FadeIn } from "@/components/ui/fade-in";
import {
  ShieldCheck, Search, TrendingUp, MapPin, Clock, Star,
  Home, Building2, Users, CheckCircle, Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type FeatureTile = {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: string;
  status?: string;
  tags?: string[];
  colSpan?: number;
  featured?: boolean;
  ctaText?: string;
  ctaHref?: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  shield:   <ShieldCheck className="w-4 h-4 text-primary" />,
  search:   <Search className="w-4 h-4 text-primary" />,
  trending: <TrendingUp className="w-4 h-4 text-primary" />,
  map:      <MapPin className="w-4 h-4 text-primary" />,
  clock:    <Clock className="w-4 h-4 text-primary" />,
  star:     <Star className="w-4 h-4 text-primary" />,
  home:     <Home className="w-4 h-4 text-primary" />,
  building: <Building2 className="w-4 h-4 text-primary" />,
  users:    <Users className="w-4 h-4 text-primary" />,
  check:    <CheckCircle className="w-4 h-4 text-primary" />,
  mail:     <Mail className="w-4 h-4 text-primary" />,
};

export const DEFAULT_FEATURE_TILES: FeatureTile[] = [
  {
    id: "verified", title: "Verified listings", meta: "auto:active_listings",
    description: "Every listing is manually reviewed — no scams, no fake offers. Buy with confidence.",
    icon: "shield", status: "Active", tags: ["Safety", "Trust"], colSpan: 2, featured: true,
  },
  {
    id: "search", title: "Advanced search", meta: "Real-time filters",
    description: "Filter by location, price, size, type and year of construction in real time.",
    icon: "search", status: "Live", tags: ["Search", "Filters"],
  },
  {
    id: "trends", title: "Market trends", meta: "Updated live",
    description: "Track property price movements across Kenyan counties and know when to buy.",
    icon: "trending", status: "New", tags: ["Analytics", "Prices"],
    ctaText: "View trends", ctaHref: "/market",
  },
  {
    id: "map", title: "Interactive map", meta: "All of Kenya",
    description: "Explore properties on an interactive map — by street, neighbourhood or county.",
    icon: "map", status: "Beta", tags: ["Map", "Location"], colSpan: 2,
    ctaText: "Open map", ctaHref: "/listings?view=map",
  },
  {
    id: "deals", title: "Fast deals", meta: "Avg. 21 days",
    description: "From first viewing to signed agreement — our agents ensure a smooth, fast process.",
    icon: "clock", status: "Active", tags: ["Speed", "Service"],
  },
  {
    id: "reviews", title: "Agent reviews", meta: "auto:total_agents",
    description: "Read verified client reviews for every agent before deciding who to work with.",
    icon: "star", status: "Active", tags: ["Reviews", "Agents"],
  },
];

function resolveMeta(meta: string, counts: { listings: number; agents: number }): string {
  if (meta === "auto:active_listings") return `${counts.listings.toLocaleString()}+ listings`;
  if (meta === "auto:total_agents")    return `${counts.agents}+ agents`;
  return meta;
}

const SKELETON_SPANS = [2, 1, 1, 2, 1, 1];

export function BentoFeatures() {
  const [tiles, setTiles] = useState<FeatureTile[]>([]);
  const [counts, setCounts] = useState({ listings: 0, agents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "agencija"),
      supabase.from("site_settings").select("value").eq("key", "features_tiles").maybeSingle(),
    ]).then(([{ count: listingCount }, { count: agentCount }, { data: setting }]) => {
      setCounts({ listings: listingCount ?? 0, agents: agentCount ?? 0 });
      if (setting?.value) {
        try {
          const parsed = JSON.parse(setting.value) as FeatureTile[];
          setTiles(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FEATURE_TILES);
        } catch {
          setTiles(DEFAULT_FEATURE_TILES);
        }
      } else {
        setTiles(DEFAULT_FEATURE_TILES);
      }
      setLoading(false);
    });
  }, []);

  const bentoItems: BentoItem[] = tiles.map((t) => ({
    title: t.title,
    description: t.description,
    meta: resolveMeta(t.meta, counts),
    icon: ICON_MAP[t.icon] ?? ICON_MAP.check,
    status: t.status,
    tags: t.tags,
    colSpan: t.colSpan,
    hasPersistentHover: t.featured,
    cta: t.ctaText || undefined,
    ctaHref: t.ctaHref || undefined,
  }));

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-foreground">Everything you need, in one place</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Search, compare, finance and connect — the complete Kenya property toolkit
          </p>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SKELETON_SPANS.map((span, i) => (
              <div
                key={i}
                className={`h-40 bg-card border border-border rounded-2xl animate-pulse ${span === 2 ? "md:col-span-2" : ""}`}
              />
            ))}
          </div>
        ) : (
          <BentoGrid items={bentoItems} />
        )}
      </div>
    </section>
  );
}
