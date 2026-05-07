"use client";

import { useState, useRef, useEffect } from "react";
import { X, CheckCircle, Building2, Check, Upload, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateListingSlug } from "@/lib/utils";

type BankMeta = {
  cbk_licence?: string;
  kba_member?: boolean;
  tagline?: string;
  services?: string[];
  interest_rate_from?: string;
  interest_rate_to?: string;
  max_loan_amount?: string;
  max_tenure_years?: string;
  min_deposit_pct?: string;
  regions?: string[];
};

type InsuranceMeta = {
  ira_licence?: string;
  aki_member?: boolean;
  insurer_type?: string;
  tagline?: string;
  policy_types?: string[];
  premium_from?: string;
  sum_insured_up_to?: string;
  claim_settlement_days?: string;
  regions?: string[];
};

type FurnitureMeta = {
  business_type?: string;
  product_categories?: string[];
  services?: string[];
  price_range?: string;
  regions?: string[];
  tagline?: string;
  lead_time_weeks?: string;
  social_instagram?: string;
  catalog_url?: string;
};

export type ExistingPartner = {
  id: string;
  subcategory: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  logo_url: string | null;
  promo_banner_url: string | null;
  metadata: BankMeta | InsuranceMeta | FurnitureMeta | null;
};

type Props = {
  category: string;
  subcategories?: string[];
  onClose: () => void;
  mode?: "create" | "edit";
  existingPartner?: ExistingPartner;
  saveHandler?: (id: string, payload: Record<string, unknown>) => Promise<string | null>;
};

const BANK_SERVICES = [
  "Mortgage", "Construction Loan", "Home Equity Loan",
  "Asset Finance", "Bridging Loan", "SACCO Loan",
];

const KENYA_REGIONS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Nyeri", "Meru", "Kitale", "Garissa",
  "Malindi", "Lamu", "Kisii", "Kericho", "Machakos",
];

const INSURANCE_POLICY_TYPES = [
  "Home Insurance", "Mortgage Protection", "Title Insurance",
  "Landlord Insurance", "Tenant Contents", "Construction All-Risk",
  "Developer's All-Risk", "Fire & Perils",
];

const INSURER_TYPES = ["Direct Insurer", "Insurance Broker", "Insurance Agent"];

const FURNITURE_BUSINESS_TYPES = [
  "Furniture Retailer", "Furniture Manufacturer", "Interior Designer",
  "Interior Decorator", "Kitchen Specialist", "Custom / Bespoke", "Office Furniture",
];
const FURNITURE_PRODUCT_CATEGORIES = [
  "Living Room", "Bedroom", "Kitchen & Dining", "Home Office",
  "Outdoor", "Curtains & Blinds", "Flooring", "Lighting",
];
const FURNITURE_SERVICES = [
  "Free Consultation", "3D Visualisation", "Installation",
  "Delivery", "Custom Orders", "Space Planning",
];
const FURNITURE_PRICE_RANGES = ["Budget-Friendly", "Mid-Range", "Premium", "Luxury"];

import { processImage } from "@/lib/process-image";

async function uploadFile(file: File, path: string): Promise<{ url: string | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    const res = await fetch("/api/upload-partner-asset", { method: "POST", body: formData });
    const data = await res.json() as { url?: string; error?: string };
    if (!res.ok) return { url: null, error: data.error ?? `HTTP ${res.status}` };
    return { url: data.url ?? null, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : String(e) };
  }
}

function ImageUpload({
  label, hint, value, onChange, aspect = "square",
}: {
  label: string; hint: string; value: string | null;
  onChange: (file: File, preview: string) => void; aspect?: "square" | "banner";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(file, ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-colors overflow-hidden bg-muted/30 hover:bg-muted/50 flex items-center justify-center ${aspect === "banner" ? "h-28" : "h-24 w-24"}`}
      >
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-3 text-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/60 leading-tight">{hint}</span>
          </div>
        )}
        {value && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export function PartnerRegistrationForm({ category, subcategories, onClose, mode = "create", existingPartner, saveHandler }: Props) {
  const isBank = category === "bank";
  const isInsurance = category === "insurance";
  const isFurniture = category === "furniture";
  const isEdit = mode === "edit" && !!existingPartner;

  const ep = existingPartner;
  const bm = isBank ? (ep?.metadata as BankMeta | null) : null;
  const im = isInsurance ? (ep?.metadata as InsuranceMeta | null) : null;
  const fm = isFurniture ? (ep?.metadata as FurnitureMeta | null) : null;

  const [form, setForm] = useState({
    company_name: ep?.company_name ?? "",
    contact_name: ep?.contact_name ?? "",
    email: ep?.email ?? "",
    phone: ep?.phone ?? "",
    website: ep?.website ?? "",
    city: ep?.city ?? "",
    description: ep?.description ?? "",
    subcategory: ep?.subcategory ?? "",
  });

  const [bank, setBank] = useState({
    cbk_licence: bm?.cbk_licence ?? "",
    kba_member: bm?.kba_member ?? false,
    services: bm?.services ?? ([] as string[]),
    interest_rate_from: bm?.interest_rate_from ?? "",
    interest_rate_to: bm?.interest_rate_to ?? "",
    max_loan_amount: bm?.max_loan_amount ?? "",
    max_tenure_years: bm?.max_tenure_years ?? "",
    min_deposit_pct: bm?.min_deposit_pct ?? "",
    regions: bm?.regions ?? ([] as string[]),
    tagline: bm?.tagline ?? "",
  });

  const [ins, setIns] = useState({
    ira_licence: im?.ira_licence ?? "",
    aki_member: im?.aki_member ?? false,
    insurer_type: im?.insurer_type ?? "",
    tagline: im?.tagline ?? "",
    policy_types: im?.policy_types ?? ([] as string[]),
    premium_from: im?.premium_from ?? "",
    sum_insured_up_to: im?.sum_insured_up_to ?? "",
    claim_settlement_days: im?.claim_settlement_days ?? "",
    regions: im?.regions ?? ([] as string[]),
  });

  const [fur, setFur] = useState({
    business_type: fm?.business_type ?? "",
    product_categories: fm?.product_categories ?? ([] as string[]),
    services: fm?.services ?? ([] as string[]),
    price_range: fm?.price_range ?? "",
    regions: fm?.regions ?? ([] as string[]),
    tagline: fm?.tagline ?? "",
    lead_time_weeks: fm?.lead_time_weeks ?? "",
    social_instagram: fm?.social_instagram ?? "",
    catalog_url: fm?.catalog_url ?? "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(ep?.logo_url ?? null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(ep?.promo_banner_url ?? null);
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [catalogFileName, setCatalogFileName] = useState<string | null>(fm?.catalog_url ? "Existing catalogue" : null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from profile when the logged-in user is a Business Partner
  useEffect(() => {
    if (isEdit) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, city, website, account_type")
        .eq("id", user.id)
        .single();
      if (profile?.account_type === "partner") {
        setForm(f => ({
          ...f,
          company_name: f.company_name || profile.full_name || "",
          email: f.email || user.email || "",
          phone: f.phone || profile.phone || "",
          city: f.city || profile.city || "",
          website: f.website || profile.website || "",
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const toggleService = (s: string) =>
    setBank((b) => ({ ...b, services: b.services.includes(s) ? b.services.filter((x) => x !== s) : [...b.services, s] }));

  const toggleRegion = (r: string) =>
    setBank((b) => ({ ...b, regions: b.regions.includes(r) ? b.regions.filter((x) => x !== r) : [...b.regions, r] }));

  const togglePolicyType = (p: string) =>
    setIns((i) => ({ ...i, policy_types: i.policy_types.includes(p) ? i.policy_types.filter((x) => x !== p) : [...i.policy_types, p] }));

  const toggleInsRegion = (r: string) =>
    setIns((i) => ({ ...i, regions: i.regions.includes(r) ? i.regions.filter((x) => x !== r) : [...i.regions, r] }));

  const toggleFurProductCategory = (p: string) =>
    setFur((f) => ({ ...f, product_categories: f.product_categories.includes(p) ? f.product_categories.filter((x) => x !== p) : [...f.product_categories, p] }));

  const toggleFurService = (s: string) =>
    setFur((f) => ({ ...f, services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s] }));

  const toggleFurRegion = (r: string) =>
    setFur((f) => ({ ...f, regions: f.regions.includes(r) ? f.regions.filter((x) => x !== r) : [...f.regions, r] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let logoUrl = ep?.logo_url ?? null;
    let bannerUrl = ep?.promo_banner_url ?? null;

    if (logoFile) {
      const processed = await processImage(logoFile, 400, 0.9);
      const { url, error: uploadErr } = await uploadFile(processed, `logos/${Date.now()}.webp`);
      if (uploadErr) { setLoading(false); setError(`Logo upload failed: ${uploadErr}`); return; }
      if (url) logoUrl = url;
    }

    if ((isBank || isInsurance || isFurniture) && bannerFile) {
      const processed = await processImage(bannerFile, 1200, 0.85);
      const { url, error: uploadErr } = await uploadFile(processed, `banners/${Date.now()}.webp`);
      if (uploadErr) { setLoading(false); setError(`Banner upload failed: ${uploadErr}`); return; }
      if (url) bannerUrl = url;
    }

    let catalogUrl = fur.catalog_url || null;
    if (isFurniture && catalogFile) {
      const ext = catalogFile.name.split(".").pop();
      const { url, error: uploadErr } = await uploadFile(catalogFile, `catalogs/${Date.now()}.${ext}`);
      if (uploadErr) { setLoading(false); setError(`Catalogue upload failed: ${uploadErr}`); return; }
      if (url) catalogUrl = url;
    }

    const payload = {
      subcategory: form.subcategory || null,
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone || null,
      website: form.website || null,
      city: form.city,
      description: form.description || null,
      logo_url: logoUrl,
      promo_banner_url: (isBank || isInsurance || isFurniture) ? bannerUrl : null,
      metadata: isBank ? bank : isInsurance ? ins : isFurniture ? { ...fur, catalog_url: catalogUrl } : null,
    };

    let errMsg: string | null = null;

    if (isEdit && ep) {
      if (saveHandler) {
        errMsg = await saveHandler(ep.id, payload as Record<string, unknown>);
      } else {
        const { error } = await supabase.from("partners").update(payload).eq("id", ep.id);
        errMsg = error?.message ?? null;
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate unique slug per category
      const baseName = (form.contact_name || form.company_name).trim();
      const baseSlug = generateListingSlug(baseName);
      let slug = baseSlug;
      let attempt = 2;
      while (true) {
        const { data: existing } = await supabase.from("partners").select("id").eq("category", category).eq("slug", slug).maybeSingle();
        if (!existing) break;
        slug = `${baseSlug}-${attempt++}`;
      }

      const { error } = await supabase.from("partners").insert({
        ...payload,
        category,
        verified: false,
        user_id: user?.id ?? null,
        slug,
      });
      errMsg = error?.message ?? null;
    }

    setLoading(false);
    if (errMsg) {
      setError("Something went wrong. Please try again.");
      console.error("Partner save error:", errMsg);
    } else {
      setSubmitted(true);
    }
  };

  const inputClass =
    "w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50";

  const chipClass = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
      active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isEdit ? "Edit Partner Profile" : "Register as Partner"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isEdit ? "Update your listing details" : "Your listing will appear after verification"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="font-bold text-foreground text-lg mb-2">
              {isEdit ? "Profile updated!" : "Registration submitted!"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {isEdit
                ? "Your changes have been saved successfully."
                : "Your listing will appear in the directory after our team verifies your details — usually within 1–2 business days."}
            </p>
            <button onClick={onClose} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* Logo upload */}
            <div className="flex items-end gap-4">
              <ImageUpload
                label="Logo"
                hint="Upload logo"
                value={logoPreview}
                onChange={(file, preview) => { setLogoFile(file); setLogoPreview(preview); }}
                aspect="square"
              />
              <p className="text-[11px] text-muted-foreground pb-1 leading-relaxed">
                Square image recommended.<br />PNG or JPG, max 2 MB.
              </p>
            </div>

            {/* Specialisation */}
            {subcategories && subcategories.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Specialisation *</label>
                <select required value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} className={inputClass}>
                  <option value="">Select your specialisation</option>
                  {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Company + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Company Name *</label>
                <input required placeholder="KCB Bank Kenya Ltd" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Contact Name *</label>
                <input required placeholder="John Kamau" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                <input required type="email" placeholder="info@bank.co.ke" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Phone</label>
                <input type="tel" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* City + Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">City *</label>
                <input required placeholder="Nairobi" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Website</label>
                <input type="url" placeholder="https://yourbank.co.ke" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Brief Description</label>
              <textarea rows={3} placeholder="Describe your services..." value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass + " resize-none"} />
            </div>

            {/* ── Bank-specific fields ── */}
            {isBank && (
              <>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Banking Details</p>

                  {/* CBK + KBA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">CBK Licence Number *</label>
                      <input required={isBank} placeholder="CBK/NB/001" value={bank.cbk_licence} onChange={(e) => setBank((b) => ({ ...b, cbk_licence: e.target.value }))} className={inputClass} />
                    </div>
                    <div className="flex flex-col justify-end pb-0.5">
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">KBA Membership</label>
                      <button type="button" onClick={() => setBank((b) => ({ ...b, kba_member: !b.kba_member }))}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${bank.kba_member ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${bank.kba_member ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                          {bank.kba_member && <Check className="h-3 w-3 text-white" />}
                        </div>
                        KBA Member
                      </button>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Promotional Tagline</label>
                    <input placeholder="e.g. Mortgages from 13.5% — apply in 48 hours" value={bank.tagline} onChange={(e) => setBank((b) => ({ ...b, tagline: e.target.value }))} maxLength={80} className={inputClass} />
                    <p className="text-[10px] text-muted-foreground mt-1">Max 80 characters. Shown on your directory card.</p>
                  </div>

                  {/* Promo banner */}
                  <div className="mb-4">
                    <ImageUpload
                      label="Promotional Banner"
                      hint="Upload a wide banner image (recommended 1200×400px)"
                      value={bannerPreview}
                      onChange={(file, preview) => { setBannerFile(file); setBannerPreview(preview); }}
                      aspect="banner"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">Displayed prominently on your bank profile page. JPG or PNG, max 5 MB.</p>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Services Offered</label>
                    <div className="flex flex-wrap gap-2">
                      {BANK_SERVICES.map((s) => (
                        <button key={s} type="button" onClick={() => toggleService(s)} className={chipClass(bank.services.includes(s))}>
                          {bank.services.includes(s) && <Check className="h-3 w-3" />} {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mortgage terms */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Key Mortgage Terms</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Rate from (%)</label>
                        <input type="number" step="0.1" min="0" placeholder="13.5" value={bank.interest_rate_from} onChange={(e) => setBank((b) => ({ ...b, interest_rate_from: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Rate to (%)</label>
                        <input type="number" step="0.1" min="0" placeholder="16.0" value={bank.interest_rate_to} onChange={(e) => setBank((b) => ({ ...b, interest_rate_to: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Max tenure (yrs)</label>
                        <input type="number" min="1" placeholder="25" value={bank.max_tenure_years} onChange={(e) => setBank((b) => ({ ...b, max_tenure_years: e.target.value }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Min. deposit (%)</label>
                        <input type="number" min="0" max="100" placeholder="10" value={bank.min_deposit_pct} onChange={(e) => setBank((b) => ({ ...b, min_deposit_pct: e.target.value }))} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Max loan */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Maximum Loan Amount (KES)</label>
                    <input type="number" placeholder="50000000" value={bank.max_loan_amount} onChange={(e) => setBank((b) => ({ ...b, max_loan_amount: e.target.value }))} className={inputClass} />
                  </div>

                  {/* Regions */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Regions / Counties Served</label>
                    <div className="flex flex-wrap gap-2">
                      {KENYA_REGIONS.map((r) => (
                        <button key={r} type="button" onClick={() => toggleRegion(r)} className={chipClass(bank.regions.includes(r))}>
                          {bank.regions.includes(r) && <Check className="h-3 w-3" />} {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Insurance-specific fields ── */}
            {isInsurance && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Insurance Details</p>

                {/* IRA licence + AKI member */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">IRA Licence Number *</label>
                    <input required={isInsurance} placeholder="IRA/INS/001" value={ins.ira_licence}
                      onChange={(e) => setIns((i) => ({ ...i, ira_licence: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="flex flex-col justify-end pb-0.5">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">AKI Membership</label>
                    <button type="button" onClick={() => setIns((i) => ({ ...i, aki_member: !i.aki_member }))}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${ins.aki_member ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${ins.aki_member ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                        {ins.aki_member && <Check className="h-3 w-3 text-white" />}
                      </div>
                      AKI Member
                    </button>
                  </div>
                </div>

                {/* Insurer type */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Insurer Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {INSURER_TYPES.map((t) => (
                      <button key={t} type="button" onClick={() => setIns((i) => ({ ...i, insurer_type: t }))} className={chipClass(ins.insurer_type === t)}>
                        {ins.insurer_type === t && <Check className="h-3 w-3" />} {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tagline */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Promotional Tagline</label>
                  <input placeholder="e.g. Protect your home from KES 5,000/yr" value={ins.tagline}
                    onChange={(e) => setIns((i) => ({ ...i, tagline: e.target.value }))} maxLength={80} className={inputClass} />
                  <p className="text-[10px] text-muted-foreground mt-1">Max 80 characters. Shown on your directory card.</p>
                </div>

                {/* Promo banner */}
                <div className="mb-4">
                  <ImageUpload
                    label="Promotional Banner"
                    hint="Upload a wide banner image (recommended 1200×400px)"
                    value={bannerPreview}
                    onChange={(file, preview) => { setBannerFile(file); setBannerPreview(preview); }}
                    aspect="banner"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">Displayed on your profile page. JPG or PNG, max 5 MB.</p>
                </div>

                {/* Policy types */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Policy Types Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {INSURANCE_POLICY_TYPES.map((p) => (
                      <button key={p} type="button" onClick={() => togglePolicyType(p)} className={chipClass(ins.policy_types.includes(p))}>
                        {ins.policy_types.includes(p) && <Check className="h-3 w-3" />} {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key figures */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Key Figures</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Premium from (KES/yr)</label>
                      <input type="number" placeholder="5000" value={ins.premium_from}
                        onChange={(e) => setIns((i) => ({ ...i, premium_from: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Sum insured up to (KES)</label>
                      <input type="number" placeholder="100000000" value={ins.sum_insured_up_to}
                        onChange={(e) => setIns((i) => ({ ...i, sum_insured_up_to: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Claim settlement (days)</label>
                      <input type="number" placeholder="14" value={ins.claim_settlement_days}
                        onChange={(e) => setIns((i) => ({ ...i, claim_settlement_days: e.target.value }))} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Regions */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Regions / Counties Served</label>
                  <div className="flex flex-wrap gap-2">
                    {KENYA_REGIONS.map((r) => (
                      <button key={r} type="button" onClick={() => toggleInsRegion(r)} className={chipClass(ins.regions.includes(r))}>
                        {ins.regions.includes(r) && <Check className="h-3 w-3" />} {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Furniture / Interior-specific fields ── */}
            {isFurniture && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Furniture & Interior Details</p>

                {/* Business type */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Business Type</label>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_BUSINESS_TYPES.map((t) => (
                      <button key={t} type="button" onClick={() => setFur((f) => ({ ...f, business_type: t }))} className={chipClass(fur.business_type === t)}>
                        {fur.business_type === t && <Check className="h-3 w-3" />} {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Price Range</label>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_PRICE_RANGES.map((p) => (
                      <button key={p} type="button" onClick={() => setFur((f) => ({ ...f, price_range: p }))} className={chipClass(fur.price_range === p)}>
                        {fur.price_range === p && <Check className="h-3 w-3" />} {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tagline */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Promotional Tagline</label>
                  <input placeholder="e.g. Bespoke furniture, crafted in Nairobi" value={fur.tagline}
                    onChange={(e) => setFur((f) => ({ ...f, tagline: e.target.value }))} maxLength={80} className={inputClass} />
                  <p className="text-[10px] text-muted-foreground mt-1">Max 80 characters. Shown on your directory card.</p>
                </div>

                {/* Promo banner */}
                <div className="mb-4">
                  <ImageUpload
                    label="Promotional Banner"
                    hint="Upload a wide banner image (recommended 1200×400px)"
                    value={bannerPreview}
                    onChange={(file, preview) => { setBannerFile(file); setBannerPreview(preview); }}
                    aspect="banner"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">Displayed on your profile page. JPG or PNG, max 5 MB.</p>
                </div>

                {/* Product categories */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Product Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_PRODUCT_CATEGORIES.map((p) => (
                      <button key={p} type="button" onClick={() => toggleFurProductCategory(p)} className={chipClass(fur.product_categories.includes(p))}>
                        {fur.product_categories.includes(p) && <Check className="h-3 w-3" />} {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Services Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_SERVICES.map((s) => (
                      <button key={s} type="button" onClick={() => toggleFurService(s)} className={chipClass(fur.services.includes(s))}>
                        {fur.services.includes(s) && <Check className="h-3 w-3" />} {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead time + Instagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Lead Time</label>
                    <input placeholder="e.g. 2–4 weeks" value={fur.lead_time_weeks}
                      onChange={(e) => setFur((f) => ({ ...f, lead_time_weeks: e.target.value }))} className={inputClass} />
                    <p className="text-[10px] text-muted-foreground mt-1">Typical delivery / installation time.</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Instagram</label>
                    <input placeholder="https://instagram.com/yourbrand" value={fur.social_instagram}
                      onChange={(e) => setFur((f) => ({ ...f, social_instagram: e.target.value }))} className={inputClass} />
                  </div>
                </div>

                {/* Catalogue upload */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Product Catalogue (PDF)</label>
                  <label className="flex items-center gap-3 cursor-pointer border border-dashed border-border hover:border-primary/50 rounded-xl px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {catalogFileName ?? "Click to upload PDF catalogue"}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setCatalogFile(f); setCatalogFileName(f.name); }
                    }} />
                  </label>
                  {(catalogFileName && catalogFileName !== "Click to upload PDF catalogue") && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {fur.catalog_url && !catalogFile ? (
                        <a href={fur.catalog_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View existing catalogue</a>
                      ) : catalogFile ? `Ready to upload: ${catalogFileName}` : null}
                    </p>
                  )}
                </div>

                {/* Regions */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Regions / Counties Served</label>
                  <div className="flex flex-wrap gap-2">
                    {KENYA_REGIONS.map((r) => (
                      <button key={r} type="button" onClick={() => toggleFurRegion(r)} className={chipClass(fur.regions.includes(r))}>
                        {fur.regions.includes(r) && <Check className="h-3 w-3" />} {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
                {loading ? (isEdit ? "Saving…" : "Submitting…") : (isEdit ? "Save Changes" : "Submit Registration")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
