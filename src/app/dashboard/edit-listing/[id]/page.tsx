"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Save, X, ChevronLeft, Check, Upload, MapPin, Home,
  Building2, FileText, Zap, Camera, Shield, GripVertical,
  FileImage, Link as LinkIcon, AlertTriangle, Bed, Bath,
  Square, Calendar,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";
import { generateListingSlug } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const LISTING_TYPES = ["For Sale", "For Rent", "Buying", "Renting"];

const CATEGORIES: { value: string; subcategories: string[] }[] = [
  { value: "Apartments", subcategories: ["Bedsitter / Studio","1-bedroom apartment","2-bedroom apartment","3-bedroom apartment","4-bedroom apartment","5+ bedroom apartment","Penthouse","Serviced apartment","New development apartment"] },
  { value: "Houses", subcategories: ["Bungalow","Maisonette","Townhouse","Mansion / Villa","Semi-detached house","Terrace house","Cottage","Country home","House with land"] },
  { value: "Land", subcategories: ["Residential plot","Commercial plot","Agricultural land","Industrial plot","Mixed-use plot","Beach plot","Game ranch / conservancy","Subdivided land"] },
  { value: "Commercial", subcategories: ["Office space","Retail / Shop","Restaurant / Bar / Café","Warehouse","Go-down","Office block","Hotel / Guesthouse / Lodge","Salon / Clinic / Studio","Petrol station / Workshop","Shopping centre unit"] },
  { value: "Industrial", subcategories: ["Factory / Production unit","Logistics centre / Warehouse","Cold storage","Agro-processing facility","Energy facility"] },
  { value: "Farms & Agriculture", subcategories: ["Full farm (mixed use)","Coffee / Tea farm","Horticultural farm","Dairy farm with land","Organic farm","Ranch / Horse farm","Flower farm"] },
  { value: "Holiday Homes", subcategories: ["Beach cottage","Holiday apartment","Villa with pool","Beach house","Safari lodge / camp","Holiday resort unit","Lake / riverside property"] },
  { value: "Garages & Parking", subcategories: ["Covered parking bay","Open parking bay","Detached garage","Lock-up garage with land"] },
  { value: "New Developments", subcategories: ["Off-plan apartment","Off-plan house","Project under construction","Investment project"] },
  { value: "Other / Special", subcategories: ["Investment property","Tourism facility (camp, glamping)","Public building (school, clinic)","Religious building","Large development land","Other property"] },
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
const ROOMS_OPTIONS = ["Studio","1","2","3","4","5+"];
const ENERGY_CLASSES = ["A+","A","B","C","D","E","F","G"];
const AMENITIES_INTERIOR = ["Balcony / Terrace / Patio","Garden / Courtyard","Store / Utility room","Elevator / Lift","Parking bay","Garage","Solar panels","Air conditioning","Fireplace","Backup generator","Security alarm","Fibre internet","Furnished / Semi-furnished","Double glazing","Blinds / Curtains"];
const AMENITIES_EXTERIOR = ["Swimming pool","Landscaped garden","Gated community","Borehole","Water tank (1,000 L+)","Security guard / Askari","CCTV cameras","Electric fence","Shared rooftop","Parking in front of building"];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type EditForm = {
  listingType: string;
  category: string;
  subcategory: string;
  title: string;
  price: string;
  pricePerM2: boolean;
  description: string;
  status: string;
  country: string;
  region: string;
  municipality: string;
  settlement: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
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
  energyClass: string;
  heatingType: string;
  utilities: string[];
  ownership: string;
  amenities: string[];
  photos: string[];
  videoUrl: string;
  floorPlanUrl: string;
  virtualTourUrl: string;
};

type PlaceSuggestion = { id: string; text: string; place_name: string; center: [number, number] };

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls = "w-full border border-border bg-card rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-muted/20">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckItem({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${checked ? "border-primary bg-accent text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
    >
      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${checked ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
        {checked && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      {label}
    </button>
  );
}

// ─── Municipality autocomplete ─────────────────────────────────────────────────

function MunicipalityInput({ value, onChange, onSelect }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (text: string, lat: number, lng: number) => void;
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
      const data = await res.json() as { features?: { id: string; text: string; place_name: string; center: [number, number] }[] };
      const results: PlaceSuggestion[] = (data.features ?? []).map((f) => ({
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

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="e.g. Nairobi, Mombasa…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, -1)); }
            else if (e.key === "Enter") { e.preventDefault(); if (highlighted >= 0) select(suggestions[highlighted]); else setOpen(false); }
            else if (e.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
          className={`${inputCls} pl-9`}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(s); }}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${i === highlighted ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
            >
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

// ─── Sortable photo ────────────────────────────────────────────────────────────

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
      {index === 0 && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{index + 1}</div>
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-8 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab"
      >
        <GripVertical className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        onClick={() => onRemove(url)}
        className="absolute top-2 right-1 w-6 h-6 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPlan, setUploadingPlan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const planInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [form, setForm] = useState<EditForm>({
    listingType: "", category: "", subcategory: "", title: "", price: "",
    pricePerM2: false, description: "", status: "active",
    country: "Kenya", region: "", municipality: "", settlement: "",
    address: "", postalCode: "", lat: null, lng: null,
    area: "", areaGross: "", areaLand: "", rooms: "", bedrooms: "",
    bathrooms: "", floorNumber: "", totalFloors: "", yearBuilt: "",
    yearRenovated: "", condition: "",
    energyClass: "", heatingType: "", utilities: [], ownership: "", amenities: [],
    photos: [], videoUrl: "", floorPlanUrl: "", virtualTourUrl: "",
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/dashboard"); return; }

      const { data, error: fetchError } = await supabase
        .from("listings")
        .select(`
          id, user_id, title, description, type, category, subcategory,
          price, price_per_m2, status, slug,
          country, region, municipality, city, settlement, address, postal_code, lat, lng,
          area, area_gross, area_land, rooms, bedrooms, bathrooms,
          floor_number, total_floors, year_built, year_renovated, condition,
          energy_class, heating_type, utilities, ownership,
          amenities, parking, balcony, elevator, furnished,
          video_url, floor_plan_url, virtual_tour_url,
          listing_photos(url, position)
        `)
        .eq("id", listingId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !data) {
        setError("Listing not found or you don't have permission to edit it.");
        setLoading(false);
        return;
      }

      // Use stored amenities array; fall back to boolean columns for old listings
      let amenities: string[] = (data.amenities as string[] | null) ?? [];
      if (amenities.length === 0) {
        if (data.balcony) amenities.push("Balcony / Terrace / Patio");
        if (data.elevator) amenities.push("Elevator / Lift");
        if (data.parking) amenities.push("Parking bay");
        if (data.furnished) amenities.push("Furnished / Semi-furnished");
      }

      // Reconstruct rooms string
      const roomsStr = data.rooms === 0.5 ? "Studio" : data.rooms === 5 ? "5+" : data.rooms?.toString() ?? "";

      // Sort photos by position
      type PhotoRow = { url: string; position: number };
      const photos = ((data.listing_photos as PhotoRow[]) ?? [])
        .sort((a, b) => a.position - b.position)
        .map((p) => p.url);

      setOriginalTitle(data.title);
      setOriginalSlug(data.slug);

      setForm({
        listingType: data.type ?? "",
        category: data.category ?? "",
        subcategory: data.subcategory ?? "",
        title: data.title ?? "",
        price: data.price?.toString() ?? "",
        pricePerM2: data.price_per_m2 ?? false,
        description: data.description ?? "",
        status: data.status ?? "active",
        country: data.country ?? "Kenya",
        region: data.region ?? "",
        municipality: data.municipality ?? data.city ?? "",
        settlement: data.settlement ?? "",
        address: data.address ?? "",
        postalCode: data.postal_code ?? "",
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        area: data.area?.toString() ?? "",
        areaGross: data.area_gross?.toString() ?? "",
        areaLand: data.area_land?.toString() ?? "",
        rooms: roomsStr,
        bedrooms: data.bedrooms?.toString() ?? "",
        bathrooms: data.bathrooms?.toString() ?? "",
        floorNumber: data.floor_number ?? "",
        totalFloors: data.total_floors?.toString() ?? "",
        yearBuilt: data.year_built?.toString() ?? "",
        yearRenovated: data.year_renovated?.toString() ?? "",
        condition: data.condition ?? "",
        energyClass: data.energy_class ?? "",
        heatingType: data.heating_type ?? "",
        utilities: (data.utilities as string[] | null) ?? [],
        ownership: data.ownership ?? "",
        amenities,
        photos,
        videoUrl: data.video_url ?? "",
        floorPlanUrl: data.floor_plan_url ?? "",
        virtualTourUrl: data.virtual_tour_url ?? "",
      });

      setLoading(false);
    })();
  }, [listingId, router]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.price) {
      setSaveError("Title and price are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); router.push("/login"); return; }

    const roomsNum = form.rooms === "Studio" ? 0.5 : form.rooms === "5+" ? 5 : form.rooms ? parseInt(form.rooms) : null;

    const { data: updated, error: updateError } = await supabase
      .from("listings")
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.listingType || null,
        category: form.category || null,
        subcategory: form.subcategory || null,
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
        status: form.status,
      })
      .eq("id", listingId)
      .select("id");

    if (updateError) {
      setSaveError(`Failed to save: ${updateError.message}`);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!updated || updated.length === 0) {
      setSaveError("Save failed: no rows updated. You may not have permission to edit this listing.");
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Regenerate slug if title changed
    if (form.title.trim() !== originalTitle) {
      const base = generateListingSlug(form.title.trim());
      let slug = base;
      let attempt = 1;
      while (true) {
        const { data: existing } = await supabase
          .from("listings").select("id").eq("slug", slug).neq("id", listingId).maybeSingle();
        if (!existing) break;
        attempt++;
        slug = `${base}-${attempt}`;
      }
      await supabase.from("listings").update({ slug }).eq("id", listingId);
      setOriginalSlug(slug);
    }
    setOriginalTitle(form.title.trim());

    // Update photos: delete all then re-insert in order
    await supabase.from("listing_photos").delete().eq("listing_id", listingId);
    if (form.photos.length > 0) {
      await supabase.from("listing_photos").insert(
        form.photos.map((url, i) => ({ listing_id: listingId, url, position: i }))
      );
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const uploadPhotos = useCallback(async (files: File[]) => {
    if (form.photos.length >= 50) return;
    const allowed = files
      .filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
      .slice(0, 50 - form.photos.length);
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
    setForm(f => ({ ...f, photos: [...f.photos, ...uploaded] }));
    setUploading(false);
  }, [form.photos.length]);

  const uploadFloorPlan = useCallback(async (file: File) => {
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;
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
      setForm(f => ({ ...f, floorPlanUrl: publicUrl }));
    }
    setUploadingPlan(false);
  }, []);

  const toggle = (list: "utilities" | "amenities", val: string) => {
    setForm(f => ({
      ...f,
      [list]: f[list].includes(val) ? f[list].filter(x => x !== val) : [...f[list], val],
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = form.photos.indexOf(active.id as string);
    const newIndex = form.photos.indexOf(over.id as string);
    setForm(f => ({ ...f, photos: arrayMove(f.photos, oldIndex, newIndex) }));
  };

  const subcategories = CATEGORIES.find(c => c.value === form.category)?.subcategories ?? [];
  const showRooms = !NO_ROOMS_CATEGORIES.has(form.category);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Link href="/dashboard" className="text-primary text-sm hover:underline">← Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const SaveButton = ({ className }: { className?: string }) => (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shadow-lg ${saved ? "bg-emerald-500 text-white shadow-emerald-500/25" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"} ${className ?? ""}`}
    >
      {saving
        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <Save className="h-4 w-4" />}
      {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">

        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Edit listing" },
          ]}
          className="mb-6"
        />

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-foreground leading-tight truncate">
                {form.title || "Edit listing"}
              </h1>
              {originalSlug && (
                <a
                  href={`/properties/${originalSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View listing ↗
                </a>
              )}
            </div>
          </div>
          <SaveButton />
        </div>

        {saveError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* ── Basics ── */}
          <SectionCard icon={<Building2 className="h-3.5 w-3.5 text-primary" />} title="Basics">

            {/* Type + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Listing type" required>
                <select
                  value={form.listingType}
                  onChange={e => setForm(f => ({ ...f, listingType: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">Select type</option>
                  {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className={selectCls}
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: "" }))}
                  className={selectCls}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <select
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  disabled={!subcategories.length}
                  className={selectCls}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            {/* Title */}
            <Field label="Title" required>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Spacious 3-bedroom apartment in Kilimani"
                className={inputCls}
              />
            </Field>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (KES)" required>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 8500000"
                  min="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Price type">
                <div className="flex items-center gap-3 h-[42px]">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, pricePerM2: !f.pricePerM2 }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${form.pricePerM2 ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${form.pricePerM2 ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                      {form.pricePerM2 && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    Price per m²
                  </button>
                </div>
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" required>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                placeholder="Describe the property in detail — location highlights, nearby amenities, key features…"
                className={`${inputCls} resize-y min-h-[120px]`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">{form.description.length} characters</p>
            </Field>
          </SectionCard>

          {/* ── Location ── */}
          <SectionCard icon={<MapPin className="h-3.5 w-3.5 text-primary" />} title="Location">
            <div className="grid grid-cols-2 gap-4">
              <Field label="County / Region">
                <select
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">Select county</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Town / City" required>
                <MunicipalityInput
                  value={form.municipality}
                  onChange={v => setForm(f => ({ ...f, municipality: v }))}
                  onSelect={(text, lat, lng) => setForm(f => ({ ...f, municipality: text, lat, lng }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Neighbourhood / Estate">
                <input
                  type="text"
                  value={form.settlement}
                  onChange={e => setForm(f => ({ ...f, settlement: e.target.value }))}
                  placeholder="e.g. Kilimani, Westlands"
                  className={inputCls}
                />
              </Field>
              <Field label="Street address">
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. Ngong Road"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Postal code">
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                  placeholder="e.g. 00100"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude">
                  <input
                    type="number"
                    step="any"
                    value={form.lat ?? ""}
                    onChange={e => setForm(f => ({ ...f, lat: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="-1.2921"
                    className={inputCls}
                  />
                </Field>
                <Field label="Longitude">
                  <input
                    type="number"
                    step="any"
                    value={form.lng ?? ""}
                    onChange={e => setForm(f => ({ ...f, lng: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="36.8219"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              GPS coordinates auto-fill when you select a city above. You can also enter them manually.
            </p>
          </SectionCard>

          {/* ── Details ── */}
          <SectionCard icon={<FileText className="h-3.5 w-3.5 text-primary" />} title="Property details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Area (m²)" required>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. 95" min="0" className={`${inputCls} pl-9`} />
                </div>
              </Field>
              <Field label="Gross area (m²)">
                <input type="number" value={form.areaGross} onChange={e => setForm(f => ({ ...f, areaGross: e.target.value }))} placeholder="optional" min="0" className={inputCls} />
              </Field>
              <Field label="Land area (m²)">
                <input type="number" value={form.areaLand} onChange={e => setForm(f => ({ ...f, areaLand: e.target.value }))} placeholder="optional" min="0" className={inputCls} />
              </Field>
            </div>

            {showRooms && (
              <div className="grid grid-cols-3 gap-4">
                <Field label="Rooms">
                  <select value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: e.target.value }))} className={selectCls}>
                    <option value="">—</option>
                    {ROOMS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Bedrooms">
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input type="number" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} placeholder="e.g. 3" min="0" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Bathrooms">
                  <div className="relative">
                    <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input type="number" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} placeholder="e.g. 2" min="0" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Floor number">
                <select value={form.floorNumber} onChange={e => setForm(f => ({ ...f, floorNumber: e.target.value }))} className={selectCls}>
                  <option value="">—</option>
                  <option value="Basement">Basement</option>
                  <option value="Ground floor">Ground floor</option>
                  {["1st","2nd","3rd","4th"].map(n => <option key={n} value={`${n} floor`}>{n} floor</option>)}
                  <option value="5th floor and above">5th floor and above</option>
                  <option value="Penthouse / Top floor">Penthouse / Top floor</option>
                </select>
              </Field>
              <Field label="Total floors in building">
                <input type="number" value={form.totalFloors} onChange={e => setForm(f => ({ ...f, totalFloors: e.target.value }))} placeholder="e.g. 8" min="1" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Year built">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input type="number" value={form.yearBuilt} onChange={e => setForm(f => ({ ...f, yearBuilt: e.target.value }))} placeholder="e.g. 2015" min="1900" max={new Date().getFullYear()} className={`${inputCls} pl-9`} />
                </div>
              </Field>
              <Field label="Year renovated">
                <input type="number" value={form.yearRenovated} onChange={e => setForm(f => ({ ...f, yearRenovated: e.target.value }))} placeholder="optional" min="1900" max={new Date().getFullYear()} className={inputCls} />
              </Field>
              <Field label="Condition">
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className={selectCls}>
                  <option value="">—</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </SectionCard>

          {/* ── Features ── */}
          <SectionCard icon={<Zap className="h-3.5 w-3.5 text-primary" />} title="Features, utilities & legal">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Energy rating">
                <select value={form.energyClass} onChange={e => setForm(f => ({ ...f, energyClass: e.target.value }))} className={selectCls}>
                  <option value="">—</option>
                  {ENERGY_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Heating / cooling type">
                <select value={form.heatingType} onChange={e => setForm(f => ({ ...f, heatingType: e.target.value }))} className={selectCls}>
                  <option value="">—</option>
                  {HEATING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Ownership / Title type">
              <div className="flex flex-wrap gap-2">
                {OWNERSHIP_TYPES.map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, ownership: f.ownership === o ? "" : o }))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${form.ownership === o ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                  >
                    {form.ownership === o && <Check className="h-3 w-3 inline mr-1.5 mb-0.5" />}{o}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Utilities available">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {UTILITIES_LIST.map(u => (
                  <CheckItem key={u} label={u} checked={form.utilities.includes(u)} onClick={() => toggle("utilities", u)} />
                ))}
              </div>
            </Field>

            <Field label="Interior features">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_INTERIOR.map(a => (
                  <CheckItem key={a} label={a} checked={form.amenities.includes(a)} onClick={() => toggle("amenities", a)} />
                ))}
              </div>
            </Field>

            <Field label="Exterior & security features">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_EXTERIOR.map(a => (
                  <CheckItem key={a} label={a} checked={form.amenities.includes(a)} onClick={() => toggle("amenities", a)} />
                ))}
              </div>
            </Field>
          </SectionCard>

          {/* ── Photos & Media ── */}
          <SectionCard icon={<Camera className="h-3.5 w-3.5 text-primary" />} title="Photos & media">

            {/* Photo upload zone */}
            <Field label={`Photos (${form.photos.length}/50)`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) uploadPhotos(Array.from(e.target.files)); e.target.value = ""; }}
              />
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  if (files.length) uploadPhotos(files);
                }}
                className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-3 transition-all cursor-pointer border-border hover:border-primary/50 hover:bg-accent/20 ${uploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  {uploading
                    ? <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    : <Upload className="h-5 w-5 text-primary" />}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm">{uploading ? "Uploading…" : "Drag photos here or click"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WEBP · max 10 MB each</p>
                </div>
                {!uploading && <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg">Select files</span>}
              </div>

              {form.photos.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Drag to reorder · First image is the cover photo</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={form.photos} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {form.photos.map((url, i) => (
                          <SortablePhoto
                            key={url}
                            url={url}
                            index={i}
                            onRemove={u => setForm(f => ({ ...f, photos: f.photos.filter(p => p !== u) }))}
                          />
                        ))}
                        {form.photos.length < 50 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/20 flex items-center justify-center transition-all"
                          >
                            <div className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                              <Upload className="h-4 w-4" />
                              <span className="text-[10px] font-medium">Add</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              {/* Video URL */}
              <Field label="Video tour URL">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="url"
                    value={form.videoUrl}
                    onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="YouTube or Vimeo URL"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>

              {/* Floor plan */}
              <Field label="Floor plan">
                <input
                  ref={planInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) uploadFloorPlan(e.target.files[0]); e.target.value = ""; }}
                />
                {form.floorPlanUrl ? (
                  <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-card">
                    <FileImage className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground flex-1 truncate">Floor plan uploaded</span>
                    <button onClick={() => setForm(f => ({ ...f, floorPlanUrl: "" }))} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => planInputRef.current?.click()}
                    disabled={uploadingPlan}
                    className="w-full flex items-center gap-2 border-2 border-dashed border-border hover:border-primary/50 rounded-xl px-3 py-2.5 transition-all disabled:opacity-60 hover:bg-accent/20"
                  >
                    {uploadingPlan
                      ? <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      : <Upload className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs text-muted-foreground">{uploadingPlan ? "Uploading…" : "JPG, PNG or PDF (max 20 MB)"}</span>
                  </button>
                )}
              </Field>
            </div>

            {/* Virtual tour */}
            <Field label="Virtual / 360° tour URL">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="url"
                  value={form.virtualTourUrl}
                  onChange={e => setForm(f => ({ ...f, virtualTourUrl: e.target.value }))}
                  placeholder="https://my360tour.com/…"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </SectionCard>

        </div>

        {/* Bottom error + save */}
        {saveError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mt-5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {saveError}
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-5 border-t border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Home className="h-4 w-4" /> Back to dashboard
          </Link>
          <SaveButton />
        </div>

      </main>
      <Footer />
    </div>
  );
}
