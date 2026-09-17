"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Building2, User, Upload, X, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";

type Owner = { id: string; full_name: string | null; account_type: string; email: string | null };

const CATEGORIES = [
  "Apartments", "Houses", "Land", "Commercial", "Industrial",
  "Farms & Agriculture", "Holiday Homes", "Garages & Parking", "New Developments", "Other / Special",
];
const REGIONS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu (Eldoret)", "Kiambu", "Machakos", "Kajiado",
  "Nyeri", "Kilifi", "Kwale", "Laikipia", "Muranga", "Meru", "Embu", "Kisii", "Kericho",
];
const CONDITIONS = ["New build", "Excellent condition", "Good condition", "Needs minor works", "Needs renovation"];

const inputClass = "w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function OwnerPicker({ selected, onSelect }: { selected: Owner | null; onSelect: (o: Owner) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Owner[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, email")
        .eq("staff_managed", true)
        .in("account_type", ["agencija", "fizicna_oseba"])
        .ilike("full_name", `%${query.trim()}%`)
        .limit(10);
      setResults((data as Owner[]) ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-3 py-2.5">
        {selected.account_type === "agencija" ? <Building2 className="h-4 w-4 text-sky-600 flex-shrink-0" /> : <User className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
        <span className="text-sm font-medium text-foreground flex-1">{selected.full_name}</span>
        <button type="button" onClick={() => onSelect(null as unknown as Owner)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search staff-created agencies or individuals…"
        className={`${inputClass} pl-9`}
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {results.map((o) => (
            <button
              key={o.id} type="button"
              onClick={() => { onSelect(o); setOpen(false); setQuery(""); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
            >
              {o.account_type === "agencija" ? <Building2 className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" /> : <User className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
              <span className="flex-1 truncate">{o.full_name}</span>
              <span className="text-[10px] text-muted-foreground">{o.account_type === "agencija" ? "Agency" : "Individual"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [type, setType] = useState("For Sale");
  const [category, setCategory] = useState("Apartments");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("Nairobi");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    const ownerId = searchParams.get("owner");
    if (!ownerId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("id, full_name, account_type, email").eq("id", ownerId).single();
      if (data) setOwner(data as Owner);
    })();
  }, [searchParams]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const allowed = files.filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024).slice(0, 30 - photos.length);
    if (!allowed.length) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const uploaded: string[] = [];
    for (const file of allowed) {
      const processed = await processImage(file, 1920);
      const path = `${user?.id ?? "anon"}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error: uploadErr } = await supabase.storage.from("listing-images").upload(path, processed, { upsert: false, contentType: "image/webp" });
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push(publicUrl);
      }
    }
    setPhotos((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }, [photos.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!owner) { setError("Select who this listing is for."); return; }
    if (!title.trim() || !price) { setError("Title and price are required."); return; }
    if (!city.trim()) { setError("City / Town is required."); return; }

    setSubmitting(true);
    const res = await fetch("/api/admin/staff-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: owner.id,
        type, category, title: title.trim(), description: description.trim() || null,
        price: parseFloat(price),
        country: "Kenya", region, city: city.trim() || null, address: address.trim() || null,
        area: area ? parseFloat(area) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        condition: condition || null,
        photos,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    setSuccess(true);
    setTimeout(() => router.push(owner.account_type === "agencija" ? "/admin/agencies" : "/admin/individuals"), 1200);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
        <p className="font-bold text-foreground">Listing created</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <Field label="Listing for" required>
        <OwnerPicker selected={owner} onSelect={setOwner} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Listing type" required>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {["For Sale", "For Rent", "Buying", "Renting"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Category" required>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Title" required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="e.g. 3-bedroom apartment in Kilimani" />
      </Field>

      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Price (KES)" required>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="Condition">
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
            <option value="">Select…</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="County" required>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="City / Town" required>
          <input value={city} onChange={(e) => setCity(e.target.value)} required className={inputClass} placeholder="Nairobi" />
        </Field>
      </div>

      <Field label="Address">
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Street / estate" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Area (m²)">
          <input type="number" min={0} value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bedrooms">
          <input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bathrooms">
          <input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Photos">
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-primary transition-all">
            {uploading ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Upload className="h-5 w-5" />}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))} />
          </label>
        </div>
      </Field>

      <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-3 py-2.5">
        Buyers will see and contact <strong>{owner?.full_name ?? "the profile you select"}</strong> directly — using the phone and email on their profile.
      </p>

      {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>}

      <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
        Create listing
      </button>
    </form>
  );
}

export default function NewStaffListingPage() {
  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/agencies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Add listing</h1>
      <Suspense fallback={null}>
        <NewListingForm />
      </Suspense>
    </div>
  );
}
