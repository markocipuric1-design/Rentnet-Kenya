"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateListingSlug } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import mapboxgl from "mapbox-gl";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, rectSortingStrategy, useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Home, ChevronRight, ChevronLeft, Check, Upload, X, MapPin, Euro,
  Square, Bed, Bath, Calendar, Zap, ArrowRight, Camera, FileText,
  User, Building2, GripVertical, Link as LinkIcon, FileImage, Globe, Ruler, Shield, Phone, Mail,
  AlertTriangle, ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";
import { formatPrice } from "@/lib/format-price";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: string; icon: string; subcategories: string[] }[] = [
  { value: "Apartments", icon: "🏢", subcategories: ["Bedsitter / Studio","1-bedroom apartment","2-bedroom apartment","3-bedroom apartment","4-bedroom apartment","5+ bedroom apartment","Penthouse","Serviced apartment","New development apartment"] },
  { value: "Houses", icon: "🏠", subcategories: ["Bungalow","Maisonette","Townhouse","Mansion / Villa","Semi-detached house","Terrace house","Cottage","Country home","House with land"] },
  { value: "Land", icon: "🌱", subcategories: ["Residential plot","Commercial plot","Agricultural land","Industrial plot","Mixed-use plot","Beach plot","Game ranch / conservancy","Subdivided land"] },
  { value: "Commercial", icon: "🏗️", subcategories: ["Office space","Retail / Shop","Restaurant / Bar / Café","Warehouse","Go-down","Office block","Hotel / Guesthouse / Lodge","Salon / Clinic / Studio","Petrol station / Workshop","Shopping centre unit"] },
  { value: "Industrial", icon: "🏭", subcategories: ["Factory / Production unit","Logistics centre / Warehouse","Cold storage","Agro-processing facility","Energy facility"] },
  { value: "Farms & Agriculture", icon: "🚜", subcategories: ["Full farm (mixed use)","Coffee / Tea farm","Horticultural farm","Dairy farm with land","Organic farm","Ranch / Horse farm","Flower farm"] },
  { value: "Holiday Homes", icon: "🏖️", subcategories: ["Beach cottage","Holiday apartment","Villa with pool","Beach house","Safari lodge / camp","Holiday resort unit","Lake / riverside property"] },
  { value: "Garages & Parking", icon: "🚗", subcategories: ["Covered parking bay","Open parking bay","Detached garage","Lock-up garage with land"] },
  { value: "New Developments", icon: "🏗", subcategories: ["Off-plan apartment","Off-plan house","Project under construction","Investment project"] },
  { value: "Other / Special", icon: "✨", subcategories: ["Investment property","Tourism facility (camp, glamping)","Public building (school, clinic)","Religious building","Large development land","Other property"] },
];

const NO_ROOMS_CATEGORIES = new Set(["Land", "Garages & Parking", "Industrial", "Farms & Agriculture"]);

const REGIONS = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Uasin Gishu (Eldoret)","Kiambu","Machakos","Kajiado","Nyeri",
  "Kilifi","Kwale","Laikipia","Muranga","Meru","Embu","Kisii","Kericho","Bomet","Nandi","Trans Nzoia",
  "Bungoma","Kakamega","Vihiga","Siaya","Homa Bay","Migori","Nyamira","Tharaka-Nithi","Isiolo",
  "Marsabit","Mandera","Wajir","Samburu","Turkana","West Pokot","Elgeyo-Marakwet","Baringo",
  "Nyandarua","Kirinyaga","Tana River","Taita-Taveta","Makueni","Kitui","Narok","Lamu","Garissa",
];
const CONDITIONS = ["New build","Excellent condition","Good condition","Needs minor works","Needs renovation","For demolition"];
const HEATING_TYPES = ["Solar water heater","LPG / Gas","Electric heating","Heat pump","Wood / Pellet stove","District heating","No heating"];
const UTILITIES_LIST = ["KPLC Electricity","County water supply","Borehole water","Sewer / Septic tank","Fibre internet","LPG gas","DSTV / Cable TV","Backup generator"];
const OWNERSHIP_TYPES = ["Freehold (absolute title)","Leasehold (99 yr)","Leasehold (999 yr)","Sectional title","Government allotment letter","Co-ownership / Shared title"];
const FLOOR_OPTIONS = ["Basement","Ground floor","1st floor","2nd floor","3rd floor","4th floor","5th floor and above","Penthouse / Top floor"];
const ROOMS_OPTIONS = ["Studio","1","2","3","4","5+"];
const ENERGY_CLASSES = ["A+","A","B","C","D","E","F","G"];

const AMENITIES_INTERIOR = ["Balcony / Terrace / Patio","Garden / Courtyard","Store / Utility room","Elevator / Lift","Parking bay","Garage","Solar panels","Air conditioning","Fireplace","Backup generator","Security alarm","Fibre internet","Furnished / Semi-furnished","Double glazing","Blinds / Curtains"];
const AMENITIES_EXTERIOR = ["Swimming pool","Landscaped garden","Gated community","Borehole","Water tank (1,000 L+)","Security guard / Askari","CCTV cameras","Electric fence","Shared rooftop","Parking in front of building"];

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingType = "For Sale" | "For Rent" | "Buying" | "Renting" | "";

type FormData = {
  // Step 1
  listingType: ListingType;
  category: string;
  subcategory: string;
  title: string;
  price: string;
  pricePerM2: boolean;
  description: string;
  // Step 2
  country: string;
  region: string;
  municipality: string;
  settlement: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  // Step 3
  area: string;
  areaGross: string;
  areaLand: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  floorNumber: string;
  totalFloors: string;
  yearBuilt: string;
  yearRenovated: string;
  condition: string;
  // Step 4
  energyClass: string;
  heatingType: string;
  utilities: string[];
  ownership: string;
  amenities: string[];
  // Step 5
  photos: string[];
  videoUrl: string;
  floorPlanUrl: string;
  virtualTourUrl: string;
  // Step 6
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  agency: string;
  agreeTerms: boolean;
};

const initialForm: FormData = {
  listingType: "", category: "", subcategory: "", title: "", price: "",
  pricePerM2: false, description: "",
  country: "Kenya", region: "", municipality: "", settlement: "",
  address: "", postalCode: "", lat: null, lng: null,
  area: "", areaGross: "", areaLand: "", rooms: "", bedrooms: "",
  bathrooms: "", floorNumber: "", totalFloors: "", yearBuilt: "",
  yearRenovated: "", condition: "",
  energyClass: "", heatingType: "", utilities: [], ownership: "", amenities: [],
  photos: [], videoUrl: "", floorPlanUrl: "", virtualTourUrl: "",
  contactName: "", contactPhone: "", contactEmail: "", agency: "", agreeTerms: false,
};

const DRAFT_KEY = "post_listing_draft_v1";

const LISTING_TYPES: { value: ListingType; label: string; desc: string; color: string }[] = [
  { value: "For Sale", label: "For Sale", desc: "You are selling a property", color: "text-primary bg-primary/10 border-primary/30" },
  { value: "For Rent", label: "For Rent", desc: "You are renting out a property", color: "text-sky-600 bg-sky-500/10 border-sky-500/30" },
  { value: "Buying", label: "Buying", desc: "You are looking to buy", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  { value: "Renting", label: "Renting", desc: "You are looking to rent", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Basics",   icon: <Building2 className="h-4 w-4" /> },
  { num: 2, label: "Location", icon: <MapPin className="h-4 w-4" /> },
  { num: 3, label: "Details",  icon: <FileText className="h-4 w-4" /> },
  { num: 4, label: "Features", icon: <Zap className="h-4 w-4" /> },
  { num: 5, label: "Media",    icon: <Camera className="h-4 w-4" /> },
  { num: 6, label: "Contact",  icon: <User className="h-4 w-4" /> },
];

function StepIndicator({ current }: { current: number }) {
  const progress = ((current - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center gap-0 overflow-x-auto pb-1">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 font-bold text-sm ${
                current > step.num ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : current === step.num ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"}`}>
                {current > step.num ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span className={`text-[9px] font-semibold hidden sm:block ${current >= step.num ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-14 h-0.5 mx-1 mb-4 transition-all duration-500 ${current > step.num ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Shared input components ──────────────────────────────────────────────────

function Label({ children, optional, required }: { children: React.ReactNode; optional?: boolean; required?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1.5">
      {children}
      {required && <span className="text-destructive text-xs leading-none">*</span>}
      {optional && <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>}
    </label>
  );
}

function Input({ label, icon, optional, required, hint, ...props }: { label: string; icon?: React.ReactNode; optional?: boolean; required?: boolean; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label optional={optional} required={required}>{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input {...props} className={`w-full border border-border bg-card rounded-xl py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60 ${icon ? "pl-9 pr-4" : "px-4"} ${props.className ?? ""}`} />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Select({ label, icon, optional, children, ...props }: { label: string; icon?: React.ReactNode; optional?: boolean; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label optional={optional}>{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</div>}
        <select {...props} className={`w-full border border-border bg-card rounded-xl py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer ${icon ? "pl-9 pr-4" : "px-4"}`}>
          {children}
        </select>
      </div>
    </div>
  );
}

// ─── Municipality autocomplete ────────────────────────────────────────────────

type PlaceSuggestion = { id: string; text: string; place_name: string; center: [number, number] };

function MunicipalityInput({ value, onChange, onSelect, compact }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (text: string, lat: number, lng: number) => void;
  compact?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=ke&language=en&types=place,locality,district&limit=6&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      const results: PlaceSuggestion[] = (data.features ?? []).map((f: { id: string; text: string; place_name: string; center: [number, number] }) => ({
        id: f.id, text: f.text, place_name: f.place_name, center: f.center,
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlighted(-1);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (s: PlaceSuggestion) => {
    onChange(s.text);
    onSelect(s.text, s.center[1], s.center[0]);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (highlighted >= 0) select(suggestions[highlighted]); else setOpen(false); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {!compact && <Label>Town / City</Label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="e.g. Nairobi, Mombasa…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full border border-border bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={s.id} type="button" onMouseDown={(e) => { e.preventDefault(); select(s); }}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${i === highlighted ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{s.text}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Map Picker ───────────────────────────────────────────────────────────────

function MapPicker({ lat, lng, onChange }: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const defaultCenter: [number, number] = [36.8219, -1.2921]; // Nairobi, Kenya
    const initCenter: [number, number] = lat && lng ? [lng, lat] : defaultCenter;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initCenter,
      zoom: lat && lng ? 14 : 8,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    const el = document.createElement("div");
    el.innerHTML = `<div style="width:28px;height:28px;background:oklch(0.52 0.27 293);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3)"></div>`;

    const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: "bottom" })
      .setLngLat(initCenter)
      .addTo(map);

    marker.on("dragend", () => {
      const ll = marker.getLngLat();
      onChangeRef.current(ll.lat, ll.lng);
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChangeRef.current(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lat || !lng) return;
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
  }, [lat, lng]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div ref={containerRef} className="w-full h-72" />
      <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
        {lat && lng
          ? <span>GPS: <strong className="text-foreground">{lat.toFixed(6)}, {lng.toFixed(6)}</strong></span>
          : "Click on the map or drag the pin to set the exact location"}
      </div>
    </div>
  );
}

// ─── Step 1 — Osnovno ─────────────────────────────────────────────────────────

function Step1({ form, setForm, titleChecking, titleDupes }: {
  form: FormData;
  setForm: (f: FormData) => void;
  titleChecking: boolean;
  titleDupes: { id: string; title: string; slug: string | null }[];
}) {
  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Basic details</h2>
        <p className="text-sm text-muted-foreground">Transaction type, category and key information about the listing.</p>
      </div>

      {/* Transaction type */}
      <BentoCard icon={<ArrowRight className="h-4 w-4" />} label="Transaction type" required>
        <div className="grid grid-cols-2 gap-2">
          {LISTING_TYPES.map(t => (
            <button key={t.value} onClick={() => setForm({ ...form, listingType: t.value })}
              className={`relative flex flex-col gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${form.listingType === t.value ? `${t.color} border-2 shadow-md` : "border-border hover:border-primary/30 bg-card"}`}>
              <span className="font-bold text-sm">{t.label}</span>
              <span className="text-xs opacity-70">{t.desc}</span>
              {form.listingType === t.value && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </BentoCard>

      {/* Category */}
      <BentoCard icon={<Building2 className="h-4 w-4" />} label="Property category" required>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setForm({ ...form, category: cat.value, subcategory: "" })}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 text-center ${form.category === cat.value ? "border-primary bg-accent text-primary shadow-md shadow-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[11px] font-semibold leading-tight">{cat.value}</span>
            </button>
          ))}
        </div>
      </BentoCard>

      {/* Subcategory */}
      {selectedCategory && (
        <BentoCard icon={<FileText className="h-4 w-4" />} label={`${selectedCategory.value} — subcategory`} required>
          <div className="flex flex-wrap gap-2">
            {selectedCategory.subcategories.map(sub => (
              <button key={sub} onClick={() => setForm({ ...form, subcategory: sub })}
                className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${form.subcategory === sub ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-accent/50"}`}>
                {form.subcategory === sub && <Check className="h-3 w-3 inline mr-1.5 mb-0.5" />}
                {sub}
              </button>
            ))}
          </div>
        </BentoCard>
      )}

      {/* Title + Price — 2 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BentoCard icon={<FileText className="h-4 w-4" />} label="Listing title" required>
          <input
            type="text"
            placeholder='e.g. "3-bed apartment, Westlands, Nairobi"'
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className={bentoInput}
            title="Write a clear, descriptive title — include property type, bedrooms and location for better search visibility"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">Include property type, beds and location for better SEO</p>
          {titleChecking && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="w-2.5 h-2.5 border border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin inline-block" />
              Checking for duplicates…
            </p>
          )}
          {!titleChecking && titleDupes.length > 0 && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Similar listing{titleDupes.length > 1 ? "s" : ""} already exist{titleDupes.length === 1 ? "s" : ""}
              </div>
              <ul className="flex flex-col gap-1">
                {titleDupes.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-foreground truncate">{d.title}</span>
                    <a
                      href={`/properties/${d.slug ?? d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[11px] text-primary hover:underline flex-shrink-0"
                    >
                      View <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-muted-foreground">Consider making your title more specific to stand out.</p>
            </div>
          )}
        </BentoCard>

        <BentoCard icon={<Euro className="h-4 w-4" />} label="Price (KES)" required>
          <input
            type="number"
            placeholder={form.pricePerM2 ? "e.g. 8,000" : "e.g. 12,000,000"}
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className={bentoInput}
            title="Enter price in Kenyan Shillings (KES). For rentals, enter the monthly rent."
          />
          <button
            type="button"
            onClick={() => setForm({ ...form, pricePerM2: !form.pricePerM2 })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all self-start ${form.pricePerM2 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
            title="Toggle between total price and price per square metre"
          >
            <Square className="h-3 w-3" />
            {form.pricePerM2 ? "KES / m²" : "Total price"}
          </button>
        </BentoCard>
      </div>

      {/* Description */}
      <BentoCard icon={<FileText className="h-4 w-4" />} label="Property description" required>
        <textarea
          rows={7}
          placeholder="Describe the property — location, condition, unique features, nearby amenities (schools, hospitals, malls)…"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          maxLength={5000}
          className={`${bentoInput} resize-none`}
          title="A detailed description (200+ words) ranks better on Google. Mention the neighbourhood, nearby landmarks and key features."
        />
        <div className="flex items-center justify-between -mt-1">
          <p className={`text-[11px] ${form.description.length < 100 ? "text-amber-600" : "text-emerald-600"}`}>
            {form.description.length < 100 ? `Minimum 100 characters (${form.description.length}/100)` : "✓ Good length"}
          </p>
          <p className="text-[11px] text-muted-foreground">{form.description.length}/5000</p>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Step 2 — Location ────────────────────────────────────────────────────────

function Step2({ form, setForm }: { form: FormData; setForm: (f: FormData | ((prev: FormData) => FormData)) => void }) {
  const geocodeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeAddress = useCallback(async (address: string, municipality: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || (!address.trim() && !municipality.trim())) return;
    const query = [address, municipality, "Kenya"].filter(Boolean).join(", ");
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ke&language=en&limit=1&access_token=${token}`);
      const data = await res.json();
      const center = data.features?.[0]?.center;
      if (center) setForm(prev => ({ ...prev, lat: center[1], lng: center[0] }));
    } catch { /* ignore */ }
  }, [setForm]);

  const handleAddressChange = (address: string) => {
    setForm({ ...form, address });
    if (geocodeRef.current) clearTimeout(geocodeRef.current);
    geocodeRef.current = setTimeout(() => geocodeAddress(address, form.municipality), 700);
  };

  const handleMunicipalitySelect = (text: string, lat: number, lng: number) => {
    setForm({ ...form, municipality: text, lat, lng });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Property location</h2>
        <p className="text-sm text-muted-foreground">Set the exact location — precise addresses rank better on Google Maps and property searches.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Country */}
        <BentoCard icon={<Globe className="h-4 w-4" />} label="Country">
          <div className="flex items-center gap-2 border border-border bg-card rounded-xl px-3 py-2.5">
            <span className="text-sm text-foreground">🇰🇪 Kenya</span>
          </div>
        </BentoCard>

        {/* County */}
        <BentoCard icon={<MapPin className="h-4 w-4" />} label="County" required>
          <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className={bentoSelect} title="Select the Kenyan county where the property is located">
            <option value="">Select county</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </BentoCard>

        {/* Town / City */}
        <BentoCard icon={<MapPin className="h-4 w-4" />} label="Town / City" required>
          <MunicipalityInput value={form.municipality} onChange={v => setForm({ ...form, municipality: v })} onSelect={handleMunicipalitySelect} compact />
        </BentoCard>

        {/* Area / Estate */}
        <BentoCard icon={<Home className="h-4 w-4" />} label="Area / Estate" optional>
          <input type="text" placeholder="e.g. Karen, Westlands, Kilimani…" value={form.settlement} onChange={e => setForm({ ...form, settlement: e.target.value })} className={bentoInput} title="Enter the estate or neighbourhood name — helps buyers searching by area" />
        </BentoCard>

        {/* Street address */}
        <BentoCard icon={<MapPin className="h-4 w-4" />} label="Street address" optional>
          <input type="text" placeholder="e.g. Kenyatta Avenue 14" value={form.address} onChange={e => handleAddressChange(e.target.value)} className={bentoInput} title="Street address is not shown publicly without your consent" />
          <p className="text-[11px] text-muted-foreground -mt-1">Street address is not displayed publicly</p>
        </BentoCard>

        {/* Postal code */}
        <BentoCard icon={<FileText className="h-4 w-4" />} label="Postal code" optional>
          <input type="text" placeholder="e.g. 00100" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className={bentoInput} title="Kenyan postal code (e.g. 00100 for Nairobi CBD)" />
        </BentoCard>
      </div>

      {/* Map */}
      <BentoCard icon={<MapPin className="h-4 w-4" />} label="Pin location on map" optional>
        <p className="text-xs text-muted-foreground -mt-1">Click the map or drag the pin. Location auto-fills from the address above.</p>
        <MapPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm({ ...form, lat, lng })} />
      </BentoCard>
    </div>
  );
}

// ─── Step 3 — Tehnični podatki ────────────────────────────────────────────────

function BentoCard({ icon, label, optional, required, children }: { icon: React.ReactNode; label: string; optional?: boolean; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <span className="text-sm font-semibold text-foreground leading-tight flex items-center gap-1">
          {label}
          {required && <span className="text-destructive text-xs">*</span>}
          {optional && <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>}
        </span>
      </div>
      {children}
    </div>
  );
}

const bentoInput = "w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60";
const bentoSelect = `${bentoInput} appearance-none cursor-pointer`;

function Step3({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const hideRooms = NO_ROOMS_CATEGORIES.has(form.category);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Property details</h2>
        <p className="text-sm text-muted-foreground">Size, structure and condition — the more detail, the more enquiries you get.</p>
      </div>

      {/* Size */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Size</p>
        <div className="grid grid-cols-2 gap-3">
          <BentoCard icon={<Square className="h-4 w-4" />} label="Living area">
            <div className="relative">
              <input
                type="number" placeholder="npr. 75"
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 pr-12 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">m²</span>
            </div>
          </BentoCard>

          <BentoCard icon={<Ruler className="h-4 w-4" />} label="Gross area" optional>
            <div className="relative">
              <input
                type="number" placeholder="npr. 90"
                value={form.areaGross}
                onChange={e => setForm({ ...form, areaGross: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 pr-12 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">m²</span>
            </div>
          </BentoCard>

          <BentoCard icon={<MapPin className="h-4 w-4" />} label="Plot / land size" optional>
            <div className="relative">
              <input
                type="number" placeholder="npr. 500"
                value={form.areaLand}
                onChange={e => setForm({ ...form, areaLand: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 pr-12 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">m²</span>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Rooms */}
      {!hideRooms && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Room structure</p>
          <div className="grid grid-cols-2 gap-3">
            <BentoCard icon={<Home className="h-4 w-4" />} label="Rooms" optional>
              <div className="flex flex-wrap gap-1.5">
                {ROOMS_OPTIONS.map(r => (
                  <button key={r} onClick={() => setForm({ ...form, rooms: form.rooms === r ? "" : r })}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${form.rooms === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </BentoCard>

            <BentoCard icon={<Bed className="h-4 w-4" />} label="Bedrooms" optional>
              <input
                type="number" placeholder="e.g. 3"
                value={form.bedrooms}
                onChange={e => setForm({ ...form, bedrooms: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
            </BentoCard>

            <BentoCard icon={<Bath className="h-4 w-4" />} label="Bathrooms / WC" optional>
              <input
                type="number" placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={e => setForm({ ...form, bathrooms: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
            </BentoCard>

            <BentoCard icon={<ArrowRight className="h-4 w-4" />} label="Floor" optional>
              <select
                value={form.floorNumber}
                onChange={e => setForm({ ...form, floorNumber: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select floor</option>
                {FLOOR_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </BentoCard>

            <BentoCard icon={<Building2 className="h-4 w-4" />} label="Total floors in building" optional>
              <input
                type="number" placeholder="e.g. 8"
                value={form.totalFloors}
                onChange={e => setForm({ ...form, totalFloors: e.target.value })}
                className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
            </BentoCard>
          </div>
        </div>
      )}

      {/* Letnica + Condition */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Age &amp; condition</p>
        <div className="grid grid-cols-2 gap-3">
          <BentoCard icon={<Calendar className="h-4 w-4" />} label="Year built" optional>
            <input
              type="number" placeholder="e.g. 2018"
              value={form.yearBuilt}
              onChange={e => setForm({ ...form, yearBuilt: e.target.value })}
              className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
            />
          </BentoCard>

          <BentoCard icon={<Calendar className="h-4 w-4" />} label="Year last renovated" optional>
            <input
              type="number" placeholder="e.g. 2022"
              value={form.yearRenovated}
              onChange={e => setForm({ ...form, yearRenovated: e.target.value })}
              className="w-full border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
            />
          </BentoCard>

          <div className="col-span-2">
            <BentoCard icon={<Check className="h-4 w-4" />} label="Property condition" optional>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, condition: form.condition === c ? "" : c })}
                    className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${form.condition === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                    {form.condition === c && <Check className="h-3 w-3 inline mr-1.5 mb-0.5" />}
                    {c}
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Oprema + Energetika ─────────────────────────────────────────────

function Step4({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const toggle = (list: "utilities" | "amenities", val: string) => {
    setForm({
      ...form,
      [list]: form[list].includes(val) ? form[list].filter(x => x !== val) : [...form[list], val],
    });
  };

  const CheckItem = ({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${checked ? "border-primary bg-accent text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${checked ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
        {checked && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Features, utilities &amp; legal</h2>
        <p className="text-sm text-muted-foreground">Additional details that help buyers make a decision — tick everything that applies.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BentoCard icon={<Zap className="h-4 w-4" />} label="Energy rating" optional>
          <select value={form.energyClass} onChange={e => setForm({ ...form, energyClass: e.target.value })} className={bentoSelect} title="Energy Performance Certificate (EPC) rating — if available">
            <option value="">Select rating</option>
            {ENERGY_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </BentoCard>

        <BentoCard icon={<Zap className="h-4 w-4" />} label="Heating / cooling type" optional>
          <select value={form.heatingType} onChange={e => setForm({ ...form, heatingType: e.target.value })} className={bentoSelect} title="Select the primary heating or hot water system">
            <option value="">Select type</option>
            {HEATING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </BentoCard>

        <div className="col-span-2">
          <BentoCard icon={<Shield className="h-4 w-4" />} label="Ownership / Title type" optional>
            <div className="flex flex-wrap gap-2">
              {OWNERSHIP_TYPES.map(o => (
                <button key={o} onClick={() => setForm({ ...form, ownership: form.ownership === o ? "" : o })}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${form.ownership === o ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                  {form.ownership === o && <Check className="h-3 w-3 inline mr-1.5 mb-0.5" />}{o}
                </button>
              ))}
            </div>
          </BentoCard>
        </div>

        <div className="col-span-2">
          <BentoCard icon={<Zap className="h-4 w-4" />} label="Utilities available" optional>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {UTILITIES_LIST.map(u => <CheckItem key={u} label={u} checked={form.utilities.includes(u)} onClick={() => toggle("utilities", u)} />)}
            </div>
          </BentoCard>
        </div>

        <div className="col-span-2">
          <BentoCard icon={<Home className="h-4 w-4" />} label="Interior features" optional>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_INTERIOR.map(a => <CheckItem key={a} label={a} checked={form.amenities.includes(a)} onClick={() => toggle("amenities", a)} />)}
            </div>
          </BentoCard>
        </div>

        <div className="col-span-2">
          <BentoCard icon={<MapPin className="h-4 w-4" />} label="Exterior &amp; security features" optional>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_EXTERIOR.map(a => <CheckItem key={a} label={a} checked={form.amenities.includes(a)} onClick={() => toggle("amenities", a)} />)}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable photo item ──────────────────────────────────────────────────────

function SortablePhoto({ url, index, onRemove }: { url: string; index: number; onRemove: (url: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative group rounded-xl overflow-hidden aspect-video bg-muted ${isDragging ? "opacity-50 ring-2 ring-primary z-50" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover" />
      {index === 0 && <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</div>}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{index + 1}</div>
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-8 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab"
      >
        <GripVertical className="h-3.5 w-3.5 text-white" />
      </button>
      <button onClick={() => onRemove(url)} className="absolute top-2 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  );
}

// ─── Step 5 — Mediji ──────────────────────────────────────────────────────────

function Step5({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const uploadFiles = useCallback(async (files: File[]) => {
    if (form.photos.length >= 50) return;
    const allowed = files.filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024).slice(0, 50 - form.photos.length);
    if (allowed.length < files.length) setUploadError("Some images were skipped — only image files up to 10 MB are allowed.");
    else setUploadError("");
    if (!allowed.length) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const prefix = user?.id ?? "anon";
    const uploaded: string[] = [];
    for (const file of allowed) {
      const processed = await processImage(file, 1920);
      const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error } = await supabase.storage.from("listing-images").upload(path, processed, { upsert: false, contentType: "image/webp" });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push(publicUrl);
      }
    }
    setForm({ ...form, photos: [...form.photos, ...uploaded] });
    setUploading(false);
  }, [form, setForm]);

  const uploadFloorPlan = useCallback(async (file: File) => {
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { setUploadError("Allowed formats: JPG, PNG, PDF."); return; }
    if (file.size > 20 * 1024 * 1024) { setUploadError("File too large — maximum 20 MB."); return; }
    setUploadingPlan(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isPdf = file.type === "application/pdf";
    const processed = isPdf ? file : await processImage(file, 1920);
    const ext = isPdf ? "pdf" : "webp";
    const path = `${user?.id ?? "anon"}/plan-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, processed, { upsert: false, contentType: isPdf ? "application/pdf" : "image/webp" });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
      setForm({ ...form, floorPlanUrl: publicUrl });
    }
    setUploadingPlan(false);
  }, [form, setForm]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = form.photos.indexOf(active.id as string);
    const newIndex = form.photos.indexOf(over.id as string);
    setForm({ ...form, photos: arrayMove(form.photos, oldIndex, newIndex) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Photos &amp; media</h2>
        <p className="text-sm text-muted-foreground">Quality photos get up to 3× more enquiries. Upload at least 5 clear, well-lit images.</p>
      </div>

      {/* Photos */}
      <BentoCard icon={<Camera className="h-4 w-4" />} label={`Photos (${form.photos.length}/50)`} optional>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) uploadFiles(Array.from(e.target.files)); e.target.value = ""; }} />

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")); if (files.length) uploadFiles(files); }}
          className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-all cursor-pointer ${dragOver ? "border-primary bg-accent/40" : "border-border hover:border-primary/50 hover:bg-accent/20"} ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            {uploading ? <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Upload className="h-5 w-5 text-primary" />}
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{uploading ? "Uploading…" : "Drag photos here"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click · JPG, PNG, WEBP · max 10 MB each</p>
          </div>
          {!uploading && <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg">Select files</span>}
        </div>

        {uploadError && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-xl">{uploadError}</p>}

        {form.photos.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Drag to reorder · First image is the cover photo</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={form.photos} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.photos.map((url, i) => (
                    <SortablePhoto key={url} url={url} index={i} onRemove={url => setForm({ ...form, photos: form.photos.filter(p => p !== url) })} />
                  ))}
                  {form.photos.length < 50 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 flex items-center justify-center transition-all">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <Upload className="h-4 w-4" /><span className="text-[10px] font-medium">Add</span>
                      </div>
                    </button>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </BentoCard>

      <div className="grid grid-cols-2 gap-3">
        {/* Video */}
        <BentoCard icon={<LinkIcon className="h-4 w-4" />} label="Video tour" optional>
          <input type="url" placeholder="YouTube or Vimeo URL…" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className={bentoInput} title="A walkthrough video increases enquiries significantly" />
          <p className="text-[11px] text-muted-foreground -mt-1">YouTube or Vimeo link</p>
        </BentoCard>

        {/* Floor plan */}
        <BentoCard icon={<FileImage className="h-4 w-4" />} label="Floor plan" optional>
          <input ref={planInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFloorPlan(e.target.files[0]); e.target.value = ""; }} />
          {form.floorPlanUrl ? (
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-card">
              <FileImage className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground flex-1 truncate">Floor plan uploaded</span>
              <button onClick={() => setForm({ ...form, floorPlanUrl: "" })} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => planInputRef.current?.click()} disabled={uploadingPlan}
              className="w-full flex items-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl px-3 py-2.5 transition-all disabled:opacity-60 hover:bg-accent/20">
              {uploadingPlan ? <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{uploadingPlan ? "Uploading…" : "JPG, PNG or PDF (max 20 MB)"}</span>
            </button>
          )}
        </BentoCard>

        {/* Virtualni ogled */}
        <div className="col-span-2">
          <BentoCard icon={<Globe className="h-4 w-4" />} label="Virtual tour (360°)" optional>
            <input type="url" placeholder="https://my.matterport.com/… or other 360° link" value={form.virtualTourUrl} onChange={e => setForm({ ...form, virtualTourUrl: e.target.value })} className={bentoInput} title="Matterport, Kuula, Roundme or similar 360° services" />
            <p className="text-[11px] text-muted-foreground -mt-1">Matterport, Kuula, Roundme or similar services</p>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

// ─── Step 6 — Kontakt + Overview ───────────────────────────────────────────────

function Step6({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  const cat = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Contact details &amp; review</h2>
        <p className="text-sm text-muted-foreground">Interested buyers and tenants will contact you directly on these details.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BentoCard icon={<User className="h-4 w-4" />} label="Full name" required>
          <input type="text" placeholder="e.g. James Kamau" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} className={bentoInput} />
        </BentoCard>
        <BentoCard icon={<Building2 className="h-4 w-4" />} label="Agency / company name" optional>
          <input type="text" placeholder="e.g. Nairobi Prime Properties Ltd" value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} className={bentoInput} />
        </BentoCard>
        <BentoCard icon={<Phone className="h-4 w-4" />} label="Phone (WhatsApp)" required>
          <input type="tel" placeholder="+254 712 345 678" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} className={bentoInput} title="Include country code +254. WhatsApp-enabled numbers get more enquiries." />
        </BentoCard>
        <BentoCard icon={<Mail className="h-4 w-4" />} label="Email address" required>
          <input type="email" placeholder="james@example.co.ke" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className={bentoInput} />
        </BentoCard>
      </div>

      {/* Predogled */}
      <div className="bg-muted/40 border border-border rounded-2xl p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Listing preview</p>
        <div className="flex gap-4">
          {form.photos[0]
            ? <img src={form.photos[0]} alt="" className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
            : <div className="w-28 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><Camera className="h-6 w-6 text-muted-foreground" /></div>}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {form.listingType && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${form.listingType === "For Sale" ? "bg-primary" : form.listingType === "For Rent" ? "bg-sky-500" : form.listingType === "Buying" ? "bg-emerald-500" : "bg-amber-500"}`}>
                  {form.listingType}
                </span>
              )}
              {cat && <span className="text-[10px] font-medium bg-accent text-primary px-2 py-0.5 rounded-full">{cat.icon} {form.subcategory || form.category}</span>}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{form.title || "Listing title"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[form.settlement, form.municipality, form.region].filter(Boolean).join(", ") || "Location"}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              {form.price && <span className="font-bold text-foreground">{form.pricePerM2 ? `KES ${parseInt(form.price).toLocaleString("en-KE")}/m²` : formatPrice(parseInt(form.price), form.listingType)}</span>}
              {form.area && <span>{form.area} m²</span>}
              {form.rooms && <span>{form.rooms} rooms</span>}
              {form.condition && <span>{form.condition}</span>}
            </div>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
          {form.photos.length > 0 && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full font-semibold">📸 {form.photos.length} photos</span>}
          {form.videoUrl && <span className="text-[10px] bg-sky-500/10 text-sky-600 px-2 py-1 rounded-full font-semibold">🎬 Video</span>}
          {form.floorPlanUrl && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-semibold">📐 Floor plan</span>}
          {form.virtualTourUrl && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">🔮 360° tour</span>}
          {form.lat && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full font-semibold">📍 GPS location</span>}
          {form.energyClass && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full font-semibold">⚡ Rating {form.energyClass}</span>}
        </div>
      </div>

      {/* Pogoji */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div onClick={() => setForm({ ...form, agreeTerms: !form.agreeTerms })}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${form.agreeTerms ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
          {form.agreeTerms && <Check className="h-3 w-3 text-white" />}
        </div>
        <span className="text-sm text-muted-foreground leading-relaxed">
          I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Use</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>. I confirm that all information is accurate and I am authorised to post this listing.
        </span>
      </label>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessScreen({ moderated }: { moderated: boolean }) {
  const steps = moderated
    ? [
        { step: "1", text: "Our team reviews your listing within 24 hours" },
        { step: "2", text: "You will receive a confirmation email" },
        { step: "3", text: "Your listing goes live and is visible to all buyers" },
      ]
    : [
        { step: "1", text: "Your listing is now live and visible to all searchers" },
        { step: "2", text: "Interested buyers and tenants will contact you directly" },
        { step: "3", text: "You can edit or remove your listing anytime from your profile" },
      ];

  return (
    <div className="flex flex-col items-center text-center py-12 gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
          <Check className="h-12 w-12 text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
          <span className="text-[10px] text-white font-bold">✓</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Listing submitted!</h2>
        <p className="text-muted-foreground max-w-sm">
          {moderated ? "Your listing is under review. You will be notified within 24 hours." : "Your listing is live and visible to all property searchers in Kenya."}
        </p>
      </div>
      <div className="bg-muted/40 border border-border rounded-2xl p-5 w-full max-w-sm text-left">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">What happens next?</p>
        {steps.map(s => (
          <div key={s.step} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
            <span className="text-sm text-foreground">{s.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/listings" className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-primary/25">
          Browse listings <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/" className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-6 py-3 rounded-xl text-sm font-semibold transition-all">
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OddajOglasPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [hasDraft, setHasDraft] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [wasModerated, setWasModerated] = useState(false);
  const [titleDupes, setTitleDupes] = useState<{ id: string; title: string; slug: string | null }[]>([]);
  const [titleChecking, setTitleChecking] = useState(false);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [usageInfo, setUsageInfo] = useState<{ current: number; limit: number } | null>(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setForm(prev => ({ ...prev, ...JSON.parse(saved), photos: [], agreeTerms: false }));
        setHasDraft(true);
      }
    } catch {}
  }, []);

  // Auto-save draft on every form change (skip photos — blob URLs don't persist)
  useEffect(() => {
    if (submitted) return;
    try {
      const { photos, agreeTerms, ...saveable } = form;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    } catch {}
  }, [form, submitted]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: settings }, { count }] = await Promise.all([
        supabase.from("profiles").select("account_type").eq("id", user.id).single(),
        supabase.from("site_settings").select("key, value"),
        supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["active", "pending"]),
      ]);
      const s = Object.fromEntries((settings ?? []).map(r => [r.key, r.value]));
      const limitKey = `limit_${profile?.account_type ?? "fizicna_oseba"}`;
      setUsageInfo({ current: count ?? 0, limit: parseInt(s[limitKey] ?? "3") });
    })();
  }, []);

  useEffect(() => {
    const title = form.title.trim();
    if (title.length < 5) { setTitleDupes([]); return; }
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(async () => {
      setTitleChecking(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("listings")
        .select("id, title, slug")
        .ilike("title", `%${title}%`)
        .eq("status", "active")
        .limit(3);
      setTitleDupes(data ?? []);
      setTitleChecking(false);
    }, 500);
    return () => { if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current); };
  }, [form.title]);

  const canProceed = () => {
    if (step === 1) return !!form.listingType && !!form.category && !!form.subcategory && !!form.title && !!form.price && form.description.length >= 100;
    if (step === 2) return !!form.region && !!form.municipality;
    if (step === 3) return !!form.area;
    if (step === 4) return true;
    if (step === 5) return true;
    if (step === 6) return !!form.contactName && !!form.contactPhone && !!form.contactEmail && form.agreeTerms;
    return false;
  };

  const submitListing = async () => {
    setSubmitting(true);
    setSubmitError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login?redirect=/post-listing"); return; }

    // Fetch profile, settings and current listing count in parallel
    const [
      { data: profile },
      { data: allSettings },
      { count: currentCount },
    ] = await Promise.all([
      supabase.from("profiles").select("account_type").eq("id", user.id).single(),
      supabase.from("site_settings").select("key, value"),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["active", "pending"]),
    ]);

    const s = Object.fromEntries((allSettings ?? []).map(r => [r.key, r.value]));
    const moderationEnabled = s["moderation_enabled"] === "true";
    const accountType = profile?.account_type ?? "fizicna_oseba";

    if (accountType === "agencija" && (profile as { subscription_status?: string } | null)?.subscription_status !== "active") {
      setSubmitError("Your agency does not have an active subscription. Activate the Agency plan on the Pricing page.");
      setSubmitting(false);
      return;
    }

    const limitKey = `limit_${accountType}`;
    const limit = parseInt(s[limitKey] ?? "3");

    if ((currentCount ?? 0) >= limit) {
      setSubmitError(`You have reached your listing limit (${limit}). Delete an existing listing or contact the administrator.`);
      setSubmitting(false);
      return;
    }

    const roomsNum = form.rooms === "Studio" ? 0.5 : form.rooms === "5+" ? 5 : form.rooms ? parseInt(form.rooms) : null;

    const { data: listing, error } = await supabase.from("listings").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      type: form.listingType,
      category: form.category,
      subcategory: form.subcategory,
      price: parseFloat(form.price),
      price_per_m2: form.pricePerM2,
      area: form.area ? parseFloat(form.area) : null,
      area_gross: form.areaGross ? parseFloat(form.areaGross) : null,
      area_land: form.areaLand ? parseFloat(form.areaLand) : null,
      rooms: roomsNum,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      floor_number: form.floorNumber || null,
      total_floors: form.totalFloors ? parseInt(form.totalFloors) : null,
      year_built: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      year_renovated: form.yearRenovated ? parseInt(form.yearRenovated) : null,
      condition: form.condition || null,
      energy_class: form.energyClass || null,
      heating_type: form.heatingType || null,
      utilities: form.utilities.length > 0 ? form.utilities : null,
      ownership: form.ownership || null,
      country: form.country,
      region: form.region || null,
      municipality: form.municipality || null,
      city: form.municipality || null,
      settlement: form.settlement || null,
      address: form.address || null,
      postal_code: form.postalCode || null,
      lat: form.lat,
      lng: form.lng,
      amenities: form.amenities.length > 0 ? form.amenities : null,
      parking: form.amenities.includes("Parking bay") || form.amenities.includes("Garage"),
      balcony: form.amenities.includes("Balcony / Terrace / Patio"),
      elevator: form.amenities.includes("Elevator / Lift"),
      furnished: form.amenities.includes("Furnished / Semi-furnished"),
      video_url: form.videoUrl || null,
      floor_plan_url: form.floorPlanUrl || null,
      virtual_tour_url: form.virtualTourUrl || null,
      status: moderationEnabled ? "pending" : "active",
    }).select().single();

    if (error) {
      setSubmitError(`Error saving listing: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (listing) {
      const base = generateListingSlug(form.title);
      let slug = base;
      let attempt = 1;
      while (true) {
        const { data: existing } = await supabase
          .from("listings").select("id").eq("slug", slug).neq("id", listing.id).maybeSingle();
        if (!existing) break;
        attempt++;
        slug = `${base}-${attempt}`;
      }
      await supabase.from("listings").update({ slug }).eq("id", listing.id);
    }

    if (listing && form.photos.length > 0) {
      await supabase.from("listing_photos").insert(
        form.photos.map((url, i) => ({ listing_id: listing.id, url, position: i }))
      );
    }

    setSubmitting(false);
    setWasModerated(moderationEnabled);
    setSubmitted(true);
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  const next = () => { if (step < 6) setStep(step + 1); else submitListing(); };
  const back = () => { if (step > 1) setStep(step - 1); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        <Breadcrumb items={[{ label: "Post Listing" }]} className="mb-8" />

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3">Free listing</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Post a property listing</h1>
              <p className="text-muted-foreground text-sm">6 simple steps to a professional listing on Kenya&apos;s #1 real estate platform.</p>
            </div>

            {usageInfo && (() => {
              const { current, limit } = usageInfo;
              const pct = Math.min((current / limit) * 100, 100);
              const full = current >= limit;
              const near = pct >= 80 && !full;
              return (
                <div className={`rounded-2xl border px-5 py-4 mb-6 ${full ? "bg-destructive/8 border-destructive/20" : near ? "bg-amber-500/8 border-amber-500/20" : "bg-accent/50 border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Your active listings</span>
                    <span className={`text-sm font-bold ${full ? "text-destructive" : near ? "text-amber-600" : "text-primary"}`}>
                      {current} / {limit}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${full ? "bg-destructive" : near ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {full && <p className="text-xs text-destructive mt-2">You have reached your listing limit. Delete an existing listing before posting a new one.</p>}
                  {near && <p className="text-xs text-amber-600 mt-2">Almost at your limit — {limit - current} slot{limit - current === 1 ? "" : "s"} remaining.</p>}
                  {!full && !near && <p className="text-xs text-muted-foreground mt-2">{limit - current} listing slot{limit - current === 1 ? "" : "s"} remaining.</p>}
                </div>
              );
            })()}

            {hasDraft && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-5 text-sm">
                <span className="text-amber-700 dark:text-amber-400 font-medium">Draft restored — your previous progress was saved.</span>
                <button
                  onClick={() => { setForm(initialForm); setHasDraft(false); try { localStorage.removeItem(DRAFT_KEY); } catch {} }}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-semibold text-xs underline underline-offset-2 ml-4 flex-shrink-0"
                >
                  Clear draft
                </button>
              </div>
            )}

            <StepIndicator current={step} />

            <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5 overflow-visible">
              <div className="absolute inset-0 pointer-events-none opacity-30 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
              </div>
              <div className="relative">
                {step === 1 && <Step1 form={form} setForm={setForm} titleChecking={titleChecking} titleDupes={titleDupes} />}
                {step === 2 && <Step2 form={form} setForm={setForm} />}
                {step === 3 && <Step3 form={form} setForm={setForm} />}
                {step === 4 && <Step4 form={form} setForm={setForm} />}
                {step === 5 && <Step5 form={form} setForm={setForm} />}
                {step === 6 && <Step6 form={form} setForm={setForm} />}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">{submitError}</div>
            )}

            {/* Step hint */}
            {step === 1 && !canProceed() && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                {!form.listingType ? "↑ Select a transaction type" : !form.category ? "↑ Select a property category" : !form.subcategory ? "↑ Select a subcategory" : !form.title ? "↑ Enter a listing title" : !form.price ? "↑ Enter a price" : form.description.length < 100 ? `↑ Add a description (${100 - form.description.length} more characters needed)` : ""}
              </p>
            )}

            <div className="flex items-center justify-between mt-6">
              <button onClick={back} disabled={step === 1}
                className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              <span className="text-xs text-muted-foreground">Step {step} of 6</span>

              <button onClick={next} disabled={!canProceed() || submitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-primary/25">
                {submitting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>{step === 6 ? "Publish listing" : "Next"}{step < 6 ? <ChevronRight className="h-4 w-4" /> : <Check className="h-4 w-4" />}</>}
              </button>
            </div>
          </>
        ) : (
          <SuccessScreen moderated={wasModerated} />
        )}
      </main>
      <Footer />
    </div>
  );
}
