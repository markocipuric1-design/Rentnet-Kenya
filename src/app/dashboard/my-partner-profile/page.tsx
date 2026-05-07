"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Upload, Check, MapPin, ImagePlus, FileText,
  Trash2, X, Save, CheckCircle, ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";

async function fetchCitySuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place&country=ke&language=en&limit=5&access_token=${token}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features ?? []).map((f: { text: string }) => f.text as string);
}

type Listing = {
  id: string;
  title: string;
  city: string;
  type: string;
  price: number;
  image: string | null;
};

type ExistingShowcase = { url: string; markedForDeletion: boolean };
type ExistingDoc = { url: string; name: string; markedForDeletion: boolean };
type NewShowcase = { file: File; preview: string };
type NewDoc = { file: File };

type PartnerRecord = {
  id: string;
  contact_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  city: string;
  website: string | null;
  description: string | null;
  profile_image_url: string | null;
  listing_ids: string[] | null;
  showcase_images: string[] | null;
  documents: string[] | null;
  verified: boolean;
};

export default function MyPartnerProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form fields
  const [form, setForm] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    description: "",
  });

  // Profile image
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);

  // Showcase images
  const [existingShowcase, setExistingShowcase] = useState<ExistingShowcase[]>([]);
  const [newShowcase, setNewShowcase] = useState<NewShowcase[]>([]);
  const showcaseFileRef = useRef<HTMLInputElement>(null);

  // Documents
  const [existingDocs, setExistingDocs] = useState<ExistingDoc[]>([]);
  const [newDocs, setNewDocs] = useState<NewDoc[]>([]);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Listings
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  // City autocomplete
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleCityInput = useCallback((value: string) => {
    set("city", value);
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(async () => {
      const suggestions = await fetchCitySuggestions(value);
      setCitySuggestions(suggestions);
      setShowCitySuggestions(suggestions.length > 0);
    }, 300);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login?redirect=/dashboard/my-partner-profile"); return; }
      setUserId(user.id);

      // Fetch partner record
      const { data: partnerData } = await supabase
        .from("partners")
        .select("id, contact_name, company_name, email, phone, city, website, description, profile_image_url, listing_ids, showcase_images, documents, verified")
        .eq("user_id", user.id)
        .eq("category", "rentnet-agents")
        .single();

      if (partnerData) {
        setPartner(partnerData);
        setForm({
          contact_name: partnerData.contact_name ?? "",
          company_name: partnerData.company_name ?? "",
          email: partnerData.email ?? "",
          phone: partnerData.phone ?? "",
          city: partnerData.city ?? "",
          website: partnerData.website ?? "",
          description: partnerData.description ?? "",
        });
        setProfilePreview(partnerData.profile_image_url);
        setSelectedListings(partnerData.listing_ids ?? []);
        setExistingShowcase(
          (partnerData.showcase_images ?? []).map((url: string) => ({ url, markedForDeletion: false }))
        );
        setExistingDocs(
          (partnerData.documents ?? []).map((url: string) => ({
            url,
            name: url.split("/").pop() ?? "document",
            markedForDeletion: false,
          }))
        );
      }

      // Fetch user's active listings
      const { data: userListings } = await supabase
        .from("listings")
        .select("id, title, city, type, price")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (userListings?.length) {
        const ids = userListings.map((l) => l.id);
        const { data: photos } = await supabase
          .from("listing_photos")
          .select("listing_id, url")
          .in("listing_id", ids)
          .order("position", { ascending: true });
        const photoMap: Record<string, string> = {};
        (photos ?? []).forEach((p) => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = p.url; });
        setListings(userListings.map((l) => ({ ...l, image: photoMap[l.id] ?? null })));
      }

      setLoading(false);
    })();
  }, [router]);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = await processImage(file, 400, 0.9);
    setNewProfileImage(processed);
    setProfilePreview(URL.createObjectURL(processed));
    e.target.value = "";
  };

  const handleShowcaseChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const activeExisting = existingShowcase.filter((s) => !s.markedForDeletion).length;
    const remaining = 5 - activeExisting - newShowcase.length;
    const toAdd = files.slice(0, remaining);
    const processed = await Promise.all(toAdd.map(async (f) => ({
      file: await processImage(f, 1200, 0.85),
      preview: "",
    })));
    const withPreviews = processed.map((p) => ({
      file: p.file,
      preview: URL.createObjectURL(p.file),
    }));
    setNewShowcase((prev) => [...prev, ...withPreviews]);
    e.target.value = "";
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const activeExisting = existingDocs.filter((d) => !d.markedForDeletion).length;
    const remaining = 5 - activeExisting - newDocs.length;
    setNewDocs((prev) => [...prev, ...files.slice(0, remaining).map((f) => ({ file: f }))]);
    e.target.value = "";
  };

  const toggleListing = (id: string) =>
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const totalShowcase =
    existingShowcase.filter((s) => !s.markedForDeletion).length + newShowcase.length;
  const totalDocs =
    existingDocs.filter((d) => !d.markedForDeletion).length + newDocs.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !partner) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // Upload new profile image
    let profileImageUrl = partner.profile_image_url;
    if (newProfileImage) {
      const path = `${userId}/partner-profile-${Date.now()}.webp`;
      const { error: err } = await supabase.storage
        .from("avatars")
        .upload(path, newProfileImage, { contentType: "image/webp" });
      if (err) {
        console.error("Profile image upload error:", err);
        setError(`Image upload failed: ${err.message}`);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      profileImageUrl = data.publicUrl;
    }

    // Build final showcase list: kept existing + newly uploaded
    const keptShowcaseUrls = existingShowcase
      .filter((s) => !s.markedForDeletion)
      .map((s) => s.url);

    const newShowcaseUrls: string[] = [];
    for (const { file } of newShowcase) {
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error: err } = await supabase.storage
        .from("agent-showcase")
        .upload(path, file, { contentType: "image/webp" });
      if (err) {
        console.error("Showcase upload error:", err.message);
        setError(`Showcase upload failed: ${err.message}`);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("agent-showcase").getPublicUrl(path);
      newShowcaseUrls.push(data.publicUrl);
    }

    // Build final docs list
    const keptDocUrls = existingDocs
      .filter((d) => !d.markedForDeletion)
      .map((d) => d.url);

    const newDocUrls: string[] = [];
    for (const { file } of newDocs) {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: err } = await supabase.storage
        .from("agent-documents")
        .upload(path, file, { contentType: file.type });
      if (err) {
        console.error("Document upload error:", err.message);
        setError(`Document upload failed: ${err.message}`);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("agent-documents").getPublicUrl(path);
      newDocUrls.push(data.publicUrl);
    }

    const { error: dbErr } = await supabase
      .from("partners")
      .update({
        contact_name: form.contact_name,
        company_name: form.company_name || form.contact_name,
        email: form.email,
        phone: form.phone || null,
        city: form.city,
        website: form.website || null,
        description: form.description || null,
        profile_image_url: profileImageUrl,
        listing_ids: selectedListings,
        showcase_images: [...keptShowcaseUrls, ...newShowcaseUrls],
        documents: [...keptDocUrls, ...newDocUrls],
      })
      .eq("id", partner.id)
      .eq("user_id", userId);

    setSaving(false);
    if (dbErr) {
      console.error("Partner update error:", dbErr);
      setError(`Failed to save: ${dbErr.message}`);
    } else {
      // Update local state to reflect saved changes
      setPartner((p) => p ? {
        ...p,
        ...form,
        profile_image_url: profileImageUrl,
        listing_ids: selectedListings,
        showcase_images: [...keptShowcaseUrls, ...newShowcaseUrls],
        documents: [...keptDocUrls, ...newDocUrls],
      } : p);
      setNewProfileImage(null);
      setNewShowcase([]);
      setNewDocs([]);
      setExistingShowcase([
        ...existingShowcase.filter((s) => !s.markedForDeletion),
        ...newShowcaseUrls.map((url) => ({ url, markedForDeletion: false })),
      ]);
      setExistingDocs([
        ...existingDocs.filter((d) => !d.markedForDeletion),
        ...newDocUrls.map((url) => ({ url, name: url.split("/").pop() ?? "document", markedForDeletion: false })),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const inputClass =
    "w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50";

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  // No partner profile yet
  if (!partner) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground mb-2">No agent profile yet</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
            You have not registered as a Rentnet Agent. Visit the agent directory to submit your profile.
          </p>
          <Link
            href="/partners/rentnet-agents"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Register as Agent
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" /> My Agent Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit your Rentnet Agent profile visible in the agent directory.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${partner.verified ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10"}`}>
              <CheckCircle className="h-3 w-3" />
              {partner.verified ? "Verified" : "Pending verification"}
            </span>
            <Link
              href="/partners/rentnet-agents"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              target="_blank"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View directory
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* Profile image */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">Profile photo</h2>
            <div className="flex items-center gap-5">
              <div
                onClick={() => profileFileRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 flex items-center justify-center cursor-pointer overflow-hidden transition-colors flex-shrink-0 group"
              >
                {profilePreview
                  ? <img src={profilePreview} alt="" className="w-full h-full object-cover" />
                  : <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {profilePreview ? "Current photo" : "No photo yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, converted to WebP</p>
                <button type="button" onClick={() => profileFileRef.current?.click()}
                  className="mt-2 text-xs font-semibold text-primary hover:underline underline-offset-4">
                  {profilePreview ? "Change photo" : "Upload photo"}
                </button>
              </div>
              <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-bold text-foreground mb-4">Basic information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full name *</label>
                <input required placeholder="John Kamau" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Company name</label>
                <input placeholder="Acme Properties Ltd" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone</label>
                <input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              </div>

              {/* City autocomplete */}
              <div ref={cityRef} className="relative">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    required
                    placeholder="Nairobi"
                    value={form.city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
                    className={inputClass + " pl-9"}
                    autoComplete="off"
                  />
                </div>
                {showCitySuggestions && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                    {citySuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { set("city", city); setShowCitySuggestions(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Website</label>
                <input type="url" placeholder="https://yoursite.co.ke" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">About you</label>
                <textarea
                  rows={3}
                  placeholder="Describe your experience, specialisations and the areas you cover..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
          </div>

          {/* Showcase images */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Showcase images <span className="text-muted-foreground font-normal">— max 5</span>
              </h2>
              <span className="text-xs text-muted-foreground">{totalShowcase}/5</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {existingShowcase.map((s, i) => (
                <div
                  key={`ex-${i}`}
                  className={`relative aspect-square rounded-xl overflow-hidden border group ${s.markedForDeletion ? "opacity-40 border-destructive/50" : "border-border"}`}
                >
                  <img src={s.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setExistingShowcase((prev) => prev.map((item, idx) =>
                      idx === i ? { ...item, markedForDeletion: !item.markedForDeletion } : item
                    ))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    {s.markedForDeletion
                      ? <span className="text-white text-[10px] font-bold">Undo</span>
                      : <Trash2 className="h-4 w-4 text-white" />
                    }
                  </button>
                </div>
              ))}
              {newShowcase.map((ns, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-primary/40 group">
                  <img src={ns.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewShowcase((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              {totalShowcase < 5 && (
                <button
                  type="button"
                  onClick={() => showcaseFileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 flex items-center justify-center transition-colors group"
                >
                  <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              )}
            </div>
            <input ref={showcaseFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleShowcaseChange} />
          </div>

          {/* Documents */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Verification documents <span className="text-muted-foreground font-normal">— max 5</span>
              </h2>
              <span className="text-xs text-muted-foreground">{totalDocs}/5</span>
            </div>
            <div className="flex flex-col gap-2">
              {existingDocs.map((d, i) => (
                <div
                  key={`ex-doc-${i}`}
                  className={`flex items-center gap-3 px-3 py-2.5 bg-muted/40 border rounded-xl transition-opacity ${d.markedForDeletion ? "opacity-40 border-destructive/40 line-through" : "border-border"}`}
                >
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{d.name}</span>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setExistingDocs((prev) => prev.map((item, idx) =>
                      idx === i ? { ...item, markedForDeletion: !item.markedForDeletion } : item
                    ))}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {newDocs.map((nd, i) => (
                <div key={`new-doc-${i}`} className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/30 rounded-xl">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{nd.file.name}</span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {(nd.file.size / 1024).toFixed(0)} KB
                  </span>
                  <button type="button" onClick={() => setNewDocs((prev) => prev.filter((_, idx) => idx !== i))}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {totalDocs < 5 && (
                <button
                  type="button"
                  onClick={() => docFileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2.5 border-2 border-dashed border-border hover:border-primary/50 rounded-xl text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Add document (PDF, JPG, PNG)
                </button>
              )}
            </div>
            <input ref={docFileRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleDocChange} />
          </div>

          {/* Linked listings */}
          {listings.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4">
                Linked listings <span className="text-muted-foreground font-normal">— optional</span>
              </h2>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {listings.map((l) => {
                  const selected = selectedListings.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleListing(l.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {l.image
                          ? <img src={l.image} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-muted" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.city} · {l.type}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedListings.length > 0 && (
                <p className="text-xs text-primary font-semibold mt-2">
                  {selectedListings.length} listing{selectedListings.length > 1 ? "s" : ""} linked
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Save button */}
          <div className="flex gap-3 pb-4">
            <Link href="/dashboard"
              className="flex-1 text-center border border-border hover:bg-muted text-foreground font-semibold py-3 rounded-xl text-sm transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground"
              }`}
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save changes</>}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
