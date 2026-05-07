"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight,
  MapPin, Home, RotateCcw, CheckCircle2, Star, Bed, Square, Heart, ChevronDown,
} from "lucide-react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { Navbar } from "@/components/ui/navbar";

const tabs = [
  { id: "For Sale", label: "For Sale" },
  { id: "For Rent", label: "For Rent" },
  { id: "Buying",   label: "Buying" },
  { id: "Renting",  label: "Renting" },
];

const floatingCards = [
  {
    type: "For Sale",
    title: "Modern house with garden",
    location: "Karen, Nairobi",
    price: "KES 45,000,000",
    beds: 4,
    area: 220,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
  },
  {
    type: "For Rent",
    title: "Elegant apartment",
    location: "Westlands, Nairobi",
    price: "KES 85,000 / month",
    beds: 2,
    area: 90,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
  },
];

// ─── City autocomplete input ──────────────────────────────────────────────────

type Suggestion = { id: string; place_name: string; text: string };

function CityAutocomplete({ value, onChange, onSearch }: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_public_token_here") return;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=ke&language=en&types=place,locality,neighborhood,address&limit=6&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      const results: Suggestion[] = (data.features ?? []).map((f: { id: string; place_name: string; text: string }) => ({
        id: f.id,
        place_name: f.place_name,
        text: f.text,
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlighted(-1);
    } catch { /* network error — silently ignore */ }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (s: Suggestion) => {
    onChange(s.text);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter") onSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0) select(suggestions[highlighted]);
      else { setOpen(false); onSearch(); }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        placeholder="e.g. Nairobi, Karen…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 font-medium"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(s); }}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${i === highlighted ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
            >
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{s.text}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Property type custom select ─────────────────────────────────────────────

const PROPERTY_TYPES = [
  "Apartment", "House", "Commercial", "Land plot",
  "Garage", "Industrial", "Farms & Agriculture",
  "Holiday Homes", "New Developments", "Other / Special",
];

function TypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-1 text-sm font-medium text-foreground"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/70"}>
          {value || "All types"}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-border ${!value ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}
          >
            All types
          </button>
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { onChange(type); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === type ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function HeroVariantC() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("For Sale");
  const [faved, setFaved] = useState<boolean[]>([false, false]);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", activeTab);
    if (location.trim()) params.set("city", location.trim());
    if (minArea.trim()) params.set("minArea", minArea.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    router.push(`/listings?${params.toString()}`);
  };

  const handleReset = () => {
    setLocation("");
    setPropertyType("");
    setMinArea("");
    setMaxPrice("");
  };

  return (
    <div className="bg-background">
      <Navbar />

      <section className="relative">
        <div className="relative w-full h-[520px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

          <div className="absolute inset-0 flex items-center px-6 max-w-6xl mx-auto w-full left-0 right-0 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">

              <div>
                <span className="inline-block bg-primary/90 text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
                  🏠 Kenya&apos;s #1 Real Estate Platform
                </span>
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                  Find your next{" "}
                  <AnimatedTextCycle
                    words={["home", "apartment", "office", "land plot", "investment"]}
                    interval={2800}
                    className="text-purple-300"
                  />
                  {" "}in Kenya
                </h1>
                <p className="text-white/70 font-light text-base max-w-sm leading-relaxed">
                  Browse thousands of verified listings for sale and rent across Kenya — Nairobi, Mombasa, Kisumu and beyond.
                </p>
              </div>

              <div className="hidden lg:flex flex-col gap-3">
                {floatingCards.map((card, i) => (
                  <div
                    key={card.title}
                    className={`group flex items-center gap-3 bg-card/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 ${i % 2 === 0 ? "animate-float" : "animate-float-slow"}`}
                    style={{ animationDelay: `${i * 0.4}s` }}
                  >
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${card.type === "For Sale" ? "bg-primary" : "bg-sky-500"}`}>
                        {card.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-xs leading-snug line-clamp-1 group-hover:text-primary transition-colors">{card.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] text-muted-foreground truncate">{card.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-[10px]"><Bed className="h-3 w-3" />{card.beds}</span>
                        <span className="flex items-center gap-0.5 text-[10px]"><Square className="h-3 w-3" />{card.area} m²</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-bold text-sm text-foreground">{card.price}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFaved(prev => prev.map((v, idx) => idx === i ? !v : v)); }}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart className={`h-3 w-3 transition-colors ${faved[i] ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                  <span className="text-white/70 text-xs">+12,400 listings waiting for you</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search box */}
        <div className="relative z-10 max-w-3xl mx-auto -mt-20 px-4 pb-6">
          <div className="relative bg-card rounded-2xl shadow-2xl shadow-black/15 border border-border overflow-visible">
            <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,oklch(0.68_0.22_293/0.06)_1px,transparent_1px)] bg-[length:20px_20px]" />
            </div>
            <div className="relative p-4 pb-5 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-muted/70 dark:bg-muted/40 rounded-xl p-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-1 sm:px-2 text-[10px] sm:text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filter cells */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                {/* Location — autocomplete */}
                <div className="flex flex-col gap-2 bg-muted/50 dark:bg-muted/30 hover:bg-accent/60 dark:hover:bg-accent/20 border border-border hover:border-primary/30 rounded-xl p-3 transition-all duration-200 group relative">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Location</span>
                  </div>
                  <CityAutocomplete value={location} onChange={setLocation} onSearch={handleSearch} />
                </div>

                {/* Property type */}
                <div className="flex flex-col gap-2 bg-muted/50 dark:bg-muted/30 hover:bg-accent/60 dark:hover:bg-accent/20 border border-border hover:border-primary/30 rounded-xl p-3 transition-all duration-200 group">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Home className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Type</span>
                  </div>
                  <TypeSelect value={propertyType} onChange={setPropertyType} />
                </div>

                {/* Area */}
                <div className="flex flex-col gap-2 bg-muted/50 dark:bg-muted/30 hover:bg-accent/60 dark:hover:bg-accent/20 border border-border hover:border-primary/30 rounded-xl p-3 transition-all duration-200 group">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <span className="text-[10px] font-bold text-primary">m²</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Area</span>
                  </div>
                  <input type="number" placeholder="Min. m²" value={minArea} onChange={(e) => setMinArea(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 font-medium" />
                </div>

                {/* Max. price */}
                <div className="flex flex-col gap-2 bg-muted/50 dark:bg-muted/30 hover:bg-accent/60 dark:hover:bg-accent/20 border border-border hover:border-primary/30 rounded-xl p-3 transition-all duration-200 group">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <span className="text-[10px] font-bold text-primary">KES</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Max. price</span>
                  </div>
                  <input type="number" placeholder="5,000,000 KES" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 font-medium" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleSearch} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                  <Search className="h-4 w-4" /> Search properties
                </button>
                <button onClick={handleReset} className="border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-accent px-4 py-3 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-200">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2 flex-wrap -mt-1">
                <button
                  onClick={() => { setActiveTab("For Sale"); handleSearch(); }}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-accent text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified listings
                </button>
                <button
                  onClick={() => router.push("/listings")}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-accent text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Star className="h-3.5 w-3.5" /> Featured
                </button>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pay with M-PESA · instant
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}
