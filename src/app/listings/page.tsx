"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Home, Search, ChevronDown, MapPin, Bed, Square, Heart, SlidersHorizontal,
  Grid3x3, List, Map, X, ChevronLeft, ChevronRight, ArrowUpDown,
  Check, Pencil, Trash2, Save,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";

// ─── Types ────────────────────────────────────────────────────────────────────

type Listing = {
  id: string;
  slug: string | null;
  type: string;
  category: string | null;
  title: string;
  city: string;
  price: number;
  rooms: number | null;
  area: number | null;
  status: string;
  created_at: string;
  image: string | null;
  lat: number | null;
  lng: number | null;
};

const TYPE_COLOR: Record<string, string> = {
  "For Sale": "bg-primary",
  "For Rent": "bg-sky-500",
  Buying: "bg-emerald-500",
  Renting: "bg-amber-500",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

const sortOptions = [
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "area_desc",  label: "Largest area first" },
];

const ITEMS_PER_PAGE = 11;

// ─── Admin Edit Modal ─────────────────────────────────────────────────────────

function AdminEditModal({ listing, onClose, onSave }: {
  listing: Listing;
  onClose: () => void;
  onSave: (updated: Partial<Listing>) => Promise<void>;
}) {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [city, setCity] = useState(listing.city);
  const [type, setType] = useState(listing.type);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, price: Number(price), city, type });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Edit Listing</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Price (KES)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
              {["For Sale", "For Rent", "Buying", "Renting"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border hover:bg-accent text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({ listing, view, isAdmin, onEdit, onDelete }: {
  listing: Listing;
  view: "grid" | "list";
  isAdmin?: boolean;
  onEdit?: (l: Listing) => void;
  onDelete?: (id: string) => void;
}) {
  const [faved, setFaved] = useState(false);

  const adminButtons = isAdmin && (
    <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(listing); }}
        className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-primary hover:text-white transition-all">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm("Delete this listing?")) onDelete?.(listing.id); }}
        className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-destructive hover:text-white transition-all">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (view === "list") {
    return (
      <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex relative">
        <Link href={`/properties/${listing.slug ?? listing.id}`} className="contents">
          <div className="relative w-28 sm:w-48 flex-shrink-0 overflow-hidden">
            <Image src={listing.image ?? PLACEHOLDER} alt={listing.title}
              fill className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 112px, 192px" />
            <div className="absolute top-2 left-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TYPE_COLOR[listing.type] ?? "bg-muted"}`}>{listing.type}</span>
            </div>
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold text-foreground text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</h3>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{listing.city}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border gap-2">
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                {(listing.rooms ?? 0) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{listing.rooms} {listing.rooms === 1 ? "bed" : "beds"}</span>}
                {listing.area && <span className="flex items-center gap-1"><Square className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{listing.area} m²</span>}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-xs sm:text-lg text-foreground">{formatPrice(listing.price, listing.type)}</span>
              </div>
            </div>
          </div>
        </Link>
        {adminButtons}
      </div>
    );
  }

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative">
      <Link href={`/properties/${listing.slug ?? listing.id}`} className="contents">
        <div className="relative overflow-hidden h-44 flex-shrink-0">
          <Image src={listing.image ?? PLACEHOLDER} alt={listing.title}
            fill className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TYPE_COLOR[listing.type] ?? "bg-muted"}`}>{listing.type}</span>
          </div>
          {!isAdmin && (
            <button onClick={(e) => { e.preventDefault(); setFaved(!faved); }}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform">
              <Heart className={`h-3.5 w-3.5 ${faved ? "fill-rose-500 text-rose-500" : "text-gray-400"}`} />
            </button>
          )}
          {adminButtons}
        </div>
        <div className="p-3.5 flex flex-col flex-1">
          <h3 className="font-semibold text-foreground text-sm mt-1 line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">{listing.city}</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {(listing.rooms ?? 0) > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{listing.rooms}</span>}
              {listing.area && <span className="flex items-center gap-1"><Square className="h-3 w-3" />{listing.area} m²</span>}
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-foreground">{formatPrice(listing.price, listing.type)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ view }: { view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden flex animate-pulse">
        <div className="w-48 flex-shrink-0 bg-muted" />
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="h-4 bg-muted rounded-full w-3/4" />
          <div className="h-3 bg-muted rounded-full w-1/2" />
          <div className="flex gap-3 mt-auto pt-3 border-t border-border">
            <div className="h-3 bg-muted rounded-full w-16" />
            <div className="h-5 bg-muted rounded-full w-24 ml-auto" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="p-3.5 flex flex-col gap-3">
        <div className="h-4 bg-muted rounded-full w-4/5" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex gap-2">
            <div className="h-3 bg-muted rounded-full w-10" />
            <div className="h-3 bg-muted rounded-full w-12" />
          </div>
          <div className="h-4 bg-muted rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Map helpers ─────────────────────────────────────────────────────────────

function shortPrice(price: number): string {
  if (price >= 1_000_000) return `KES ${(price / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (price >= 1_000) return `KES ${Math.round(price / 1_000)}K`;
  return `KES ${price}`;
}

const TYPE_PIN_COLOR: Record<string, string> = {
  "For Sale": "oklch(0.52 0.27 293)",
  "For Rent": "#0ea5e9",
  "Buying":   "#10b981",
  "Renting":  "#f59e0b",
};

const PLACEHOLDER_MAP = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&q=60";

function ListingsMap({ listings }: { listings: Listing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const withCoords = listings.filter((l) => l.lat && l.lng);
  const hiddenCount = listings.length - withCoords.length;

  // Initialise map once on mount
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_public_token_here" || !containerRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [37.9, 0.0],
      zoom: 5.5,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when filtered listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const pinned = listings.filter((l) => l.lat && l.lng);
    if (pinned.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    pinned.forEach((l) => {
      const color = TYPE_PIN_COLOR[l.type] ?? "oklch(0.52 0.27 293)";

      const el = document.createElement("div");
      el.style.cssText = `
        background:${color};
        color:#fff;
        font-size:11px;
        font-weight:700;
        padding:4px 8px;
        border-radius:20px;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        cursor:pointer;
        border:2px solid rgba(255,255,255,0.8);
        transition:transform 0.15s,box-shadow 0.15s;
        user-select:none;
      `;
      el.textContent = shortPrice(l.price);
      el.onmouseenter = () => { el.style.transform = "scale(1.1)"; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35)"; };
      el.onmouseleave = () => { el.style.transform = "scale(1)"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)"; };

      const img = l.image ?? PLACEHOLDER_MAP;
      const href = `/properties/${l.slug ?? l.id}`;
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: true, maxWidth: "240px" })
        .setHTML(`
          <div style="font-family:system-ui,sans-serif;border-radius:12px;overflow:hidden;min-width:200px">
            <img src="${img}" alt="${l.title}" style="width:100%;height:110px;object-fit:cover;display:block" />
            <div style="padding:10px 12px 12px">
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${color}">${l.type}</span>
              <p style="font-size:13px;font-weight:700;margin:4px 0 2px;line-height:1.3;color:#111">${l.title}</p>
              <p style="font-size:11px;color:#666;margin:0 0 6px">📍 ${l.city}</p>
              <p style="font-size:13px;font-weight:800;color:#111;margin:0 0 10px">${formatPrice(l.price, l.type)}</p>
              <a href="${href}" style="display:inline-block;background:${color};color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:8px;text-decoration:none">View listing →</a>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([l.lng!, l.lat!])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([l.lng!, l.lat!]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 600 });
    }
  }, [listings]);

  return (
    <div>
      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {hiddenCount} listing{hiddenCount > 1 ? "s" : ""} without location data {hiddenCount > 1 ? "are" : "is"} not shown on the map.
        </p>
      )}
      <div ref={containerRef} className="rounded-2xl overflow-hidden h-[calc(100vh-240px)] min-h-[480px] border border-border" />
    </div>
  );
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────

type Filters = {
  query: string; type: string; category: string; city: string;
  minPrice: string; maxPrice: string;
  minArea: string; maxArea: string; beds: string;
};

const defaultFilters: Filters = {
  query: "", type: "All", category: "All", city: "All",
  minPrice: "", maxPrice: "", minArea: "", maxArea: "", beds: "All",
};

function FilterSidebar({ filters, onChange, onReset, count, cities }: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onReset: () => void;
  count: number;
  cities: string[];
}) {
  const inputCls = "w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground";

  return (
    <aside className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
        </h2>
        <button onClick={onReset} className="text-xs text-primary hover:underline underline-offset-4">Clear all</button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" placeholder="Title, location…" value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            className="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Listing type</label>
        <div className="flex flex-col gap-1.5">
          {["All", "For Sale", "For Rent", "Buying", "Renting"].map((t) => (
            <button key={t} onClick={() => onChange({ type: t })}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.type === t ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground hover:bg-accent border border-transparent"}`}>
              {t} {filters.type === t && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Property type</label>
        <div className="flex flex-col gap-1.5">
          {["All", "Apartments", "Houses", "Land", "Commercial", "Industrial", "Farms & Agriculture", "Holiday Homes", "Garages & Parking", "New Developments", "Other / Special"].map((c) => (
            <button key={c} onClick={() => onChange({ category: c })}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.category === c ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground hover:bg-accent border border-transparent"}`}>
              {c} {filters.category === c && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">City</label>
        <select value={filters.city} onChange={(e) => onChange({ city: e.target.value })} className={inputCls}>
          <option value="All">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Price (KES)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => onChange({ minPrice: e.target.value })} className={inputCls} />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => onChange({ maxPrice: e.target.value })} className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Area (m²)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minArea} onChange={(e) => onChange({ minArea: e.target.value })} className={inputCls} />
          <input type="number" placeholder="Max" value={filters.maxArea} onChange={(e) => onChange({ maxArea: e.target.value })} className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bedrooms</label>
        <div className="flex gap-1.5 flex-wrap">
          {["All", "1", "2", "3", "4", "5+"].map((b) => (
            <button key={b} onClick={() => onChange({ beds: b })}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filters.beds === b ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
        <p className="text-primary font-bold text-lg">{count}</p>
        <p className="text-xs text-muted-foreground">results found</p>
      </div>
    </aside>
  );
}

// ─── InfeedAdPlaceholder ──────────────────────────────────────────────────────

function InfeedAdPlaceholder() {
  return (
    <a
      href="/advertise"
      className="col-span-full group relative flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden rounded-2xl border-2 border-dashed border-amber-400/40 bg-gradient-to-br from-amber-500/5 via-card to-card px-6 py-7 hover:border-amber-400/70 hover:from-amber-500/10 transition-all duration-300 shadow-[0_0_0_0] hover:shadow-[0_0_24px_0px_rgba(245,158,11,0.15)]"
    >
      {/* left */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Your ad could be here</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">Sponsored banner shown to active property seekers — highly targeted audience.</p>
        </div>
      </div>
      {/* right */}
      <span className="flex-shrink-0 text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-400/30 px-4 py-2 rounded-xl group-hover:bg-amber-500/20 transition-colors whitespace-nowrap">
        Advertise from KES 2,000 →
      </span>
    </a>
  );
}

// ─── InfeedAdCard ─────────────────────────────────────────────────────────────

function InfeedAdCard({ ad }: { ad: { id: string; title: string; image_url: string; link_url: string } }) {
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="col-span-full group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border-2 border-amber-400/50 hover:border-amber-400/90 transition-all duration-300 shadow-[0_0_20px_0px_rgba(245,158,11,0.12)] hover:shadow-[0_0_36px_0px_rgba(245,158,11,0.28)] hover:-translate-y-0.5 min-h-[180px]"
      style={{ animation: "adGlow 3s ease-in-out infinite" }}
    >
      {/* Background image — left ~40% on sm+ */}
      <div className="relative w-full sm:w-2/5 flex-shrink-0 h-48 sm:h-auto overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* dark scrim for mobile overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 sm:hidden" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-between gap-4 p-5 bg-gradient-to-br from-amber-500/8 via-card to-card">
        {/* Sponsored badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase text-amber-600 bg-amber-500/15 border border-amber-400/40 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sponsored
          </span>
        </div>

        {/* Title */}
        <div>
          <p className="font-bold text-foreground text-base sm:text-lg leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
            {ad.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Sponsored listing · external link</p>
        </div>

        {/* CTA */}
        <div>
          <span className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/30 transition-all group-hover:shadow-amber-500/50 group-hover:gap-3">
            Visit now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── InfeedAdCardCompact (card-style — fits as a single grid cell) ────────────

function InfeedAdCardCompact({ ad }: { ad: { id: string; title: string; image_url: string; link_url: string } }) {
  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group bg-card rounded-2xl overflow-hidden border border-amber-400/40 hover:border-amber-400/80 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative"
    >
      <div className="relative overflow-hidden h-44 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
            <span className="w-1 h-1 rounded-full bg-white/80 animate-pulse" />
            Sponsored
          </span>
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="font-semibold text-foreground text-sm mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors">{ad.title}</p>
        <p className="text-xs text-muted-foreground mt-1">Sponsored · external link</p>
        <div className="flex items-center justify-end mt-auto pt-3 border-t border-border">
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Visit now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── InfeedAdPlaceholderCompact (card-style placeholder) ──────────────────────

function InfeedAdPlaceholderCompact() {
  return (
    <a
      href="/advertise"
      className="group bg-card rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/40 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative"
    >
      <div className="relative h-44 flex-shrink-0 bg-amber-500/5 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
        </div>
        <p className="text-xs font-semibold text-amber-600/70">Ad slot</p>
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="font-semibold text-foreground text-sm mt-1">Your ad could be here</p>
        <p className="text-xs text-muted-foreground mt-1">Shown to active property seekers.</p>
        <div className="flex items-center justify-end mt-auto pt-3 border-t border-border">
          <span className="text-xs font-bold text-amber-600">Advertise from KES 2,000 →</span>
        </div>
      </div>
    </a>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function SearchPage() {
  const searchParams = useSearchParams();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    type:     searchParams.get("type")     ?? "All",
    category: searchParams.get("category") ?? "All",
    city:     searchParams.get("city")     ?? "All",
    minArea:  searchParams.get("minArea")  ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
  }));
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list" | "map">(() => {
    const v = searchParams.get("view");
    return v === "map" ? "map" : v === "list" ? "list" : "grid";
  });
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [infeedAds, setInfeedAds] = useState<{ id: string; title: string; image_url: string; link_url: string }[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const [{ data: { user } }, { data: listings, error }, { data: adsData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("listings")
          .select("id, slug, title, type, category, city, price, rooms, area, status, created_at, lat, lng")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("advertisements")
          .select("id, title, image_url, link_url")
          .eq("placement", "infeed")
          .eq("active", true)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
      ]);
      setInfeedAds(adsData ?? []);

      if (error) console.error("Listings fetch error:", error.message);

      if (listings && listings.length > 0) {
        const ids = listings.map((l) => l.id);
        const { data: photos } = await supabase
          .from("listing_photos")
          .select("listing_id, url, position")
          .in("listing_id", ids)
          .order("position", { ascending: true });

        const photoMap: Record<string, string> = {};
        (photos ?? []).forEach((p) => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = p.url; });

        setAllListings(listings.map((l) => ({ ...l, image: photoMap[l.id] ?? null })));
      }

      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("account_type").eq("id", user.id).single();
        setIsAdmin(profile?.account_type === "administrator");
      }

      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() =>
    [...new Set(allListings.map((l) => l.city).filter(Boolean))].sort(),
    [allListings]
  );

  const triggerLoading = () => {
    setLoading(true);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setLoading(false), 300);
  };

  const updateFilters = (partial: Partial<Filters>) => {
    triggerLoading();
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  };

  const resetFilters = () => { triggerLoading(); setFilters(defaultFilters); setPage(1); };

  useEffect(() => () => { if (loadingTimer.current) clearTimeout(loadingTimer.current); }, []);

  const filtered = useMemo(() => {
    let result = [...allListings];
    if (filters.query) result = result.filter((l) =>
      l.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      l.city.toLowerCase().includes(filters.query.toLowerCase())
    );
    if (filters.type !== "All") result = result.filter((l) => l.type === filters.type);
    if (filters.category !== "All") result = result.filter((l) => l.category === filters.category);
    if (filters.city !== "All") result = result.filter((l) => l.city === filters.city);
    if (filters.minPrice) result = result.filter((l) => l.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((l) => l.price <= Number(filters.maxPrice));
    if (filters.minArea) result = result.filter((l) => (l.area ?? 0) >= Number(filters.minArea));
    if (filters.maxArea) result = result.filter((l) => (l.area ?? 0) <= Number(filters.maxArea));
    if (filters.beds !== "All") {
      const n = Number(filters.beds.replace("+", ""));
      result = result.filter((l) => filters.beds === "5+" ? (l.rooms ?? 0) >= 5 : (l.rooms ?? 0) === n);
    }
    switch (sort) {
      case "price_asc":  result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "area_desc":  result.sort((a, b) => (b.area ?? 0) - (a.area ?? 0)); break;
    }
    return result;
  }, [allListings, filters, sort]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) setAllListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSaveEdit = async (updated: Partial<Listing>) => {
    if (!editListing) return;
    const supabase = createClient();
    const { error } = await supabase.from("listings").update(updated).eq("id", editListing.id);
    if (!error) setAllListings((prev) => prev.map((l) => l.id === editListing.id ? { ...l, ...updated } : l));
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filters.type !== "All") activeChips.push({ label: filters.type, onRemove: () => updateFilters({ type: "All" }) });
  if (filters.category !== "All") activeChips.push({ label: filters.category, onRemove: () => updateFilters({ category: "All" }) });
  if (filters.city !== "All") activeChips.push({ label: filters.city, onRemove: () => updateFilters({ city: "All" }) });
  if (filters.beds !== "All") activeChips.push({ label: `${filters.beds} ${filters.beds === "1" ? "bed" : "beds"}`, onRemove: () => updateFilters({ beds: "All" }) });
  if (filters.minPrice) activeChips.push({ label: `Min ${filters.minPrice} KES`, onRemove: () => updateFilters({ minPrice: "" }) });
  if (filters.maxPrice) activeChips.push({ label: `Max ${filters.maxPrice} KES`, onRemove: () => updateFilters({ maxPrice: "" }) });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Listings" }]} className="mb-6" />

        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Properties for Sale &amp; Rent in Kenya</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-primary font-semibold">{filtered.length}</span> listings found
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              {activeChips.length > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{activeChips.length}</span>}
            </button>

            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                {sortOptions.find(s => s.value === sort)?.label}
                <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl p-1.5 w-44 sm:w-52 z-20">
                  {sortOptions.map((opt) => (
                    <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sort === opt.value ? "bg-accent text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}>
                      {opt.label} {sort === opt.value && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex border border-border rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")}
                className={`p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setView("list")}
                className={`p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setView("map")} title="Map view"
                className={`p-2 transition-colors ${view === "map" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeChips.map((chip) => (
              <span key={chip.label} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                {chip.label}
                <button onClick={chip.onRemove}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">Clear all</button>
          </div>
        )}

        <div className="flex gap-8">
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <FilterSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} count={filtered.length} cities={cities} />
            </div>
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-[90vw] sm:w-80 bg-card border-l border-border p-4 sm:p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-foreground text-lg">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} count={filtered.length} cities={cities} />
                <button onClick={() => setSidebarOpen(false)}
                  className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm">
                  Show {filtered.length} results
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {view === "map" ? (
              loading ? (
                <div className="rounded-2xl bg-muted animate-pulse h-[calc(100vh-240px)] min-h-[480px]" />
              ) : (
                <ListingsMap listings={filtered} />
              )
            ) : loading ? (
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <SkeletonCard key={i} view={view as "grid" | "list"} />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">No results found</h3>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters.</p>
                <button onClick={resetFilters}
                  className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                  {(() => {
                    const cards = paginated.map((l) => (
                      <PropertyCard key={l.id} listing={l} view={view as "grid" | "list"} isAdmin={isAdmin}
                        onEdit={setEditListing} onDelete={handleDelete} />
                    ));
                    if (view !== "grid") return cards;

                    // Step 1 — card-style ad at position 5 (last slot of row 2)
                    const cardInsertAt = Math.min(5, paginated.length);
                    if (infeedAds.length > 0) {
                      const adIndex = Math.floor(Math.random() * infeedAds.length);
                      cards.splice(cardInsertAt, 0, <InfeedAdCardCompact key={`ad-card-${page}`} ad={infeedAds[adIndex]} />);
                    } else if (paginated.length >= 5) {
                      cards.splice(cardInsertAt, 0, <InfeedAdPlaceholderCompact key={`ad-card-placeholder-${page}`} />);
                    }

                    // Step 2 — full-width banner after row 2 (position 6 after step-1 splice)
                    if (cards.length >= 6) {
                      if (infeedAds.length > 0) {
                        const adIndex = Math.floor(Math.random() * infeedAds.length);
                        cards.splice(6, 0, <InfeedAdCard key={`ad-banner-${page}`} ad={infeedAds[adIndex]} />);
                      } else {
                        cards.splice(6, 0, <InfeedAdPlaceholder key={`ad-banner-placeholder-${page}`} />);
                      }
                    }
                    return cards;
                  })()}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                      const ellipsis = Math.abs(p - page) === 2 && p !== 1 && p !== totalPages;
                      if (ellipsis) return <span key={i} className="w-9 text-center text-muted-foreground text-sm">…</span>;
                      if (!show) return null;
                      return (
                        <button key={i} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${page === p ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "border border-border hover:bg-accent text-muted-foreground"}`}>
                          {p}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Guides strip */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Helpful Guides</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "A complete guide for landlords letting out property in Kenya.", iconColor: "text-violet-600", bgColor: "bg-violet-500/10" },
            { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a free Kenya-specific tenancy agreement template.", iconColor: "text-primary", bgColor: "bg-primary/10" },
            { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Protect your deposit — document property condition before moving in.", iconColor: "text-emerald-600", bgColor: "bg-emerald-500/10" },
            { href: "/faq", label: "Frequently Asked Questions", description: "Common questions about renting, buying and selling in Kenya.", iconColor: "text-sky-600", bgColor: "bg-sky-500/10" },
          ].map(({ href, label, description, iconColor, bgColor }) => (
            <a
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mt-0.5`}>
                <Home className={`h-4 w-4 ${iconColor}`} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <Footer />

      {editListing && (
        <AdminEditModal listing={editListing} onClose={() => setEditListing(null)} onSave={handleSaveEdit} />
      )}
    </div>
  );
}

export default function OglasiPage() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
