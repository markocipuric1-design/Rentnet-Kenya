"use client";

import { useEffect, useState } from "react";

type POI = {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  dist: number;
};

type Category = {
  id: string;
  label: string;
  icon: string;
  match: (tags: Record<string, string>) => boolean;
};

const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food & Drink",
    icon: "☕",
    match: (t) => ["restaurant", "cafe", "fast_food", "bar", "pub", "food_court", "ice_cream", "bakery"].includes(t.amenity),
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "🛒",
    match: (t) => !!t.shop,
  },
  {
    id: "health",
    label: "Health",
    icon: "🏥",
    match: (t) => ["pharmacy", "hospital", "clinic", "doctors", "dentist", "veterinary"].includes(t.amenity),
  },
  {
    id: "education",
    label: "Education",
    icon: "🏫",
    match: (t) => ["school", "university", "college", "kindergarten", "library"].includes(t.amenity),
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚌",
    match: (t) => t.highway === "bus_stop" || t.public_transport === "stop_position",
  },
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function poiName(tags: Record<string, string>): string {
  return tags.name || tags["name:en"] || tags.brand || tags.operator || "Unnamed";
}

async function geocode(query: string): Promise<[number, number] | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ke&language=en&limit=1&access_token=${token}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const c = data.features?.[0]?.center;
  return c ? [c[1], c[0]] : null; // [lat, lng]
}

async function fetchPOIs(lat: number, lng: number): Promise<POI[]> {
  const query = `
[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bakery|pharmacy|hospital|clinic|doctors|dentist|veterinary|school|university|college|kindergarten|library)$"](around:1000,${lat},${lng});
  node["shop"](around:1000,${lat},${lng});
  node["highway"="bus_stop"](around:1000,${lat},${lng});
  node["public_transport"="stop_position"]["name"](around:1000,${lat},${lng});
);
out body;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements ?? []).map((el: { id: number; lat: number; lon: number; tags: Record<string, string> }) => ({
    ...el,
    dist: haversine(lat, lng, el.lat, el.lon),
  }));
}

type Props = {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  city?: string | null;
};

export function NearbyPOI({ lat, lng, address, city }: Props) {
  const [pois, setPois] = useState<POI[]>([]);
  const [status, setStatus] = useState<"loading" | "done" | "error" | "no-coords">("loading");
  const [activeTab, setActiveTab] = useState("food");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      let resolvedLat = lat ?? null;
      let resolvedLng = lng ?? null;

      if (!resolvedLat || !resolvedLng) {
        const query = address ? `${address}, ${city}, Kenya` : city ? `${city}, Kenya` : null;
        if (!query) { setStatus("no-coords"); return; }
        const coords = await geocode(query);
        if (!coords) { setStatus("no-coords"); return; }
        [resolvedLat, resolvedLng] = coords;
      }

      const results = await fetchPOIs(resolvedLat, resolvedLng);
      if (cancelled) return;
      if (results.length === 0) { setStatus("error"); return; }
      setPois(results);
      setStatus("done");
    })();
    return () => { cancelled = true; };
  }, [lat, lng, address, city]);

  if (status === "no-coords") return null;

  const activeCat = CATEGORIES.find((c) => c.id === activeTab)!;
  const filtered = pois
    .filter((p) => activeCat.match(p.tags))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="font-bold text-foreground text-lg mb-1">What&apos;s nearby</h2>
      <p className="text-xs text-muted-foreground mb-4">Points of interest within 1 km</p>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {status === "loading" && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1 flex justify-between">
                <div className="h-3 bg-muted rounded w-40" />
                <div className="h-3 bg-muted rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Could not load nearby places. OSM data may be limited in this area.
        </p>
      )}

      {status === "done" && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No {activeCat.label.toLowerCase()} places found within 1 km.
        </p>
      )}

      {status === "done" && filtered.length > 0 && (
        <div className="flex flex-col divide-y divide-border">
          {filtered.map((poi) => (
            <a
              key={poi.id}
              href={`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-xl transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm transition-colors">
                {activeCat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors">{poiName(poi.tags)}</p>
                {poi.tags.amenity && (
                  <p className="text-[11px] text-muted-foreground capitalize">{poi.tags.amenity.replace(/_/g, " ")}</p>
                )}
                {poi.tags.shop && !poi.tags.amenity && (
                  <p className="text-[11px] text-muted-foreground capitalize">{poi.tags.shop.replace(/_/g, " ")}</p>
                )}
              </div>
              <span className="text-xs font-semibold text-primary flex-shrink-0">{fmtDist(poi.dist)}</span>
            </a>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-4">
        Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}
