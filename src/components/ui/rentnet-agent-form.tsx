"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, CheckCircle, User, Upload, Check, MapPin, ImagePlus, FileText, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateListingSlug } from "@/lib/utils";
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

type ShowcaseFile = { file: File; preview: string };
type DocFile = { file: File };

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export function RentnetAgentForm({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    description: "",
  });

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [showcaseFiles, setShowcaseFiles] = useState<ShowcaseFile[]>([]);
  const [docFiles, setDocFiles] = useState<DocFile[]>([]);

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileFileRef = useRef<HTMLInputElement>(null);
  const showcaseFileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

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
      if (!user) { setAuthChecked(true); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      if (profile) {
        setForm((f) => ({
          ...f,
          contact_name: profile.full_name ?? "",
          email: profile.email ?? user.email ?? "",
        }));
      }

      const { data: userListings } = await supabase
        .from("listings")
        .select("id, title, city, type, price")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (userListings && userListings.length > 0) {
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

      setAuthChecked(true);
    })();
  }, []);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = await processImage(file, 400, 0.9);
    setProfileImage(processed);
    setProfilePreview(URL.createObjectURL(processed));
    e.target.value = "";
  };

  const handleShowcaseChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - showcaseFiles.length;
    const toAdd = files.slice(0, remaining);
    const processed = await Promise.all(toAdd.map(async (f) => ({
      file: await processImage(f, 1200, 0.85),
      preview: "",
    })));
    const withPreviews: ShowcaseFile[] = processed.map((p) => ({
      file: p.file,
      preview: URL.createObjectURL(p.file),
    }));
    setShowcaseFiles((prev) => [...prev, ...withPreviews]);
    e.target.value = "";
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - docFiles.length;
    const toAdd = files.slice(0, remaining).map((f) => ({ file: f }));
    setDocFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeShowcase = (i: number) => setShowcaseFiles((prev) => prev.filter((_, idx) => idx !== i));
  const removeDoc = (i: number) => setDocFiles((prev) => prev.filter((_, idx) => idx !== i));

  const toggleListing = (id: string) =>
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Upload profile image
    let profileImageUrl: string | null = null;
    if (profileImage) {
      const path = `${userId}/partner-profile-${Date.now()}.webp`;
      const { error: err } = await supabase.storage
        .from("avatars")
        .upload(path, profileImage, { contentType: "image/webp" });
      if (err) {
        console.error("Profile image upload error:", err);
        setError(`Image upload failed: ${err.message}`);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      profileImageUrl = data.publicUrl;
    }

    // Upload showcase images
    const showcaseUrls: string[] = [];
    for (const { file } of showcaseFiles) {
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error: err } = await supabase.storage
        .from("agent-showcase")
        .upload(path, file, { upsert: false, contentType: "image/webp" });
      if (!err) {
        const { data } = supabase.storage.from("agent-showcase").getPublicUrl(path);
        showcaseUrls.push(data.publicUrl);
      }
    }

    // Upload documents
    const docUrls: string[] = [];
    for (const { file } of docFiles) {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: err } = await supabase.storage
        .from("agent-documents")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (!err) {
        const { data } = supabase.storage.from("agent-documents").getPublicUrl(path);
        docUrls.push(data.publicUrl);
      }
    }

    // Generate unique slug within rentnet-agents category
    const baseSlug = generateListingSlug(form.contact_name.trim() || form.company_name.trim());
    let slug = baseSlug;
    let attempt = 2;
    while (true) {
      const { data: existing } = await supabase.from("partners").select("id").eq("category", "rentnet-agents").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${attempt++}`;
    }

    const { error: dbError } = await supabase.from("partners").insert({
      category: "rentnet-agents",
      company_name: form.company_name || form.contact_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone || null,
      website: form.website || null,
      city: form.city,
      description: form.description || null,
      profile_image_url: profileImageUrl,
      user_id: userId,
      listing_ids: selectedListings,
      showcase_images: showcaseUrls,
      documents: docUrls,
      verified: false,
      slug,
    });

    setLoading(false);
    if (dbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  const inputClass =
    "w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Become a Rentnet Agent</p>
              <p className="text-xs text-muted-foreground">Your profile appears after verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Not logged in */}
        {authChecked && !userId && (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground mb-2">Sign in required</p>
            <p className="text-sm text-muted-foreground mb-6">
              You need to be signed in to register as a Rentnet Agent.
            </p>
            <a href="/login" className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
              Sign In
            </a>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">Application submitted!</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Your profile will appear in the Rentnet Agents directory after our team verifies your details — usually within 1–2 business days.
            </p>
            <button onClick={() => { onClose(); onSuccess(); }} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
              Done
            </button>
          </div>
        )}

        {/* Form */}
        {authChecked && userId && !submitted && (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-5">

              {/* Profile image */}
              <div className="flex items-center gap-4">
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
                  <p className="text-sm font-semibold text-foreground">Profile photo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, converted to WebP</p>
                  <button type="button" onClick={() => profileFileRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-primary hover:underline underline-offset-4">
                    {profilePreview ? "Change photo" : "Upload photo"}
                  </button>
                </div>
                <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </div>

              {/* Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full name *</label>
                  <input required placeholder="John Kamau" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Company name</label>
                  <input placeholder="Acme Properties Ltd" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                  <input required type="email" placeholder="john@example.co.ke" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone</label>
                  <input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* City + Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">About you</label>
                <textarea
                  rows={3}
                  placeholder="Describe your experience, specialisations and the areas you cover..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputClass + " resize-none"}
                />
              </div>

              {/* Showcase images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Showcase images <span className="text-muted-foreground/60 font-normal">— max 5</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{showcaseFiles.length}/5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {showcaseFiles.map((sf, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={sf.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeShowcase(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {showcaseFiles.length < 5 && (
                    <button
                      type="button"
                      onClick={() => showcaseFileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 flex flex-col items-center justify-center gap-1 transition-colors group"
                    >
                      <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  )}
                </div>
                <input
                  ref={showcaseFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleShowcaseChange}
                />
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Verification documents <span className="text-muted-foreground/60 font-normal">— max 5</span>
                  </label>
                  <span className="text-xs text-muted-foreground">{docFiles.length}/5</span>
                </div>
                <div className="flex flex-col gap-2">
                  {docFiles.map((df, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 border border-border rounded-xl">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground flex-1 truncate">{df.file.name}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {(df.file.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDoc(i)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {docFiles.length < 5 && (
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
                <input
                  ref={docFileRef}
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={handleDocChange}
                />
              </div>

              {/* Link listings */}
              {listings.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    Link your active listings <span className="text-muted-foreground/60 font-normal">— optional</span>
                  </label>
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
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
                    <p className="text-xs text-primary font-semibold mt-2">{selectedListings.length} listing{selectedListings.length > 1 ? "s" : ""} selected</p>
                  )}
                </div>
              )}

              {listings.length === 0 && userId && (
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">You have no active listings to link. <a href="/post-listing" className="text-primary font-semibold hover:underline">Post a listing →</a></p>
                </div>
              )}

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button type="button" onClick={onClose} className="flex-1 border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Uploading…" : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
