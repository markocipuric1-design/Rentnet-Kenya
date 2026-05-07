"use client";

import { useEffect, useState, useRef } from "react";
import {
  Megaphone, Plus, Pencil, Trash2, X, Save, Upload, ExternalLink,
  CreditCard, Clock, User, Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";
import { partnerCategoriesData } from "@/lib/content-data";

type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  placement: "sidebar" | "infeed" | "featured-partner";
  category: string | null;
  priority: number;
  active: boolean;
  created_at: string;
  expires_at: string | null;
  payment_status: "pending" | "paid" | "expired" | "free";
  duration_days: number | null;
  advertiser_name: string | null;
  advertiser_email: string | null;
};

const PLACEMENT_LABELS: Record<string, string> = {
  sidebar: "Sidebar",
  infeed: "In-feed",
  "featured-partner": "Featured Partner",
};

const PLACEMENT_COLORS: Record<string, string> = {
  sidebar: "bg-primary/10 text-primary",
  infeed: "bg-sky-500/10 text-sky-600",
  "featured-partner": "bg-amber-500/10 text-amber-600",
};

const PAYMENT_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  paid:    "bg-emerald-500/10 text-emerald-600",
  expired: "bg-muted text-muted-foreground",
  free:    "bg-primary/10 text-primary",
};

const inputClass = "w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all";

// ─── Modal ────────────────────────────────────────────────────────────────────

function AdModal({ ad, onClose, onSave }: {
  ad?: Ad | null;
  onClose: () => void;
  onSave: (data: Partial<Ad>, file?: File) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: ad?.title ?? "",
    link_url: ad?.link_url ?? "",
    placement: ad?.placement ?? "sidebar",
    category: ad?.category ?? "",
    priority: String(ad?.priority ?? 0),
    image_url: ad?.image_url ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(ad?.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview && !form.image_url) return;
    setSaving(true);
    await onSave({
      title: form.title,
      link_url: form.link_url,
      placement: form.placement as Ad["placement"],
      category: form.placement === "featured-partner" && form.category ? form.category : null,
      priority: Number(form.priority),
      image_url: form.image_url,
    }, file ?? undefined);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-bold text-foreground">{ad ? "Edit Advertisement" : "New Free Ad"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ad Image *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-muted/30"
            >
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="" className="w-full h-full object-cover" />
                : <div className="text-center"><Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" /><p className="text-xs text-muted-foreground">Click to upload image</p></div>}
              {preview && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {!file && ad && <p className="text-[11px] text-muted-foreground mt-1">Leave unchanged to keep existing image.</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Title *</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. KCB Mortgage Offer" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Destination URL *</label>
            <input required type="url" value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://example.com" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Placement *</label>
              <select value={form.placement} onChange={(e) => set("placement", e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="sidebar">Sidebar (property detail)</option>
                <option value="infeed">In-feed (listings page)</option>
                <option value="featured-partner">Featured Partner (directory)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Priority</label>
              <input type="number" min={0} value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputClass} />
            </div>
          </div>

          {form.placement === "featured-partner" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Target Category <span className="normal-case font-normal">(leave empty = all)</span>
              </label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="">All categories</option>
                {partnerCategoriesData.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-border hover:bg-accent text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">Cancel</button>
            <button type="submit" disabled={saving || (!preview && !ad?.image_url)} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              {ad ? "Save changes" : "Create ad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAd, setModalAd] = useState<Ad | null | "new">(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "free">("all");

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("advertisements")
      .select("id, title, image_url, link_url, placement, category, priority, active, created_at, expires_at, payment_status, duration_days, advertiser_name, advertiser_email")
      .order("created_at", { ascending: false });
    setAds(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (adData: Partial<Ad>, file?: File) => {
    const supabase = createClient();
    let imageUrl = adData.image_url ?? "";

    if (file) {
      const processed = await processImage(file, 1200);
      const path = `admin-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage.from("ad-images").upload(path, processed, { upsert: true, contentType: "image/webp" });
      if (uploadErr) { alert(`Image upload failed: ${uploadErr.message}`); return; }
      const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
    if (!imageUrl) { alert("Please upload an image."); return; }

    const payload = { ...adData, image_url: imageUrl };

    if (modalAd && modalAd !== "new") {
      const { error } = await supabase.from("advertisements").update(payload).eq("id", modalAd.id);
      if (error) { alert(`Save failed: ${error.message}`); return; }
    } else {
      const { error } = await supabase.from("advertisements").insert({
        ...payload,
        active: true,
        payment_status: "free",
      });
      if (error) { alert(`Save failed: ${error.message}`); return; }
    }
    await load();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setToggling(id);
    const supabase = createClient();
    await supabase.from("advertisements").update({ active: !current }).eq("id", id);
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, active: !current } : a));
    setToggling(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this advertisement?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("advertisements").delete().eq("id", id);
    setAds((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  };

  const filtered = filter === "all" ? ads : ads.filter((a) => a.payment_status === filter);

  const stats = {
    total: ads.length,
    active: ads.filter((a) => a.active).length,
    paid: ads.filter((a) => a.payment_status === "paid").length,
    pending: ads.filter((a) => a.payment_status === "pending").length,
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Advertisements</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} total · {stats.active} active · {stats.paid} paid · {stats.pending} pending payment
          </p>
        </div>
        <button
          onClick={() => setModalAd("new")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> New Free Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total ads", value: stats.total, color: "text-foreground" },
          { label: "Active", value: stats.active, color: "text-emerald-600" },
          { label: "Paid (client)", value: stats.paid, color: "text-primary" },
          { label: "Pending payment", value: stats.pending, color: "text-yellow-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className={`font-extrabold text-xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "paid", "pending", "free"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ad</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Placement</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Advertiser</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expires</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground text-sm">No advertisements found.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map((ad) => {
              const isExpired = ad.expires_at ? new Date(ad.expires_at) < new Date() : false;
              return (
                <tr key={ad.id} className="hover:bg-muted/20 transition-colors">
                  {/* Ad thumbnail + title */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[160px]">{ad.title}</p>
                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors truncate max-w-[160px]">
                          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                          {ad.link_url.replace(/^https?:\/\//, "").slice(0, 28)}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Placement */}
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PLACEMENT_COLORS[ad.placement]}`}>
                      {PLACEMENT_LABELS[ad.placement]}
                    </span>
                    {ad.category && <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{ad.category}</p>}
                  </td>

                  {/* Payment status */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${PAYMENT_BADGE[ad.payment_status ?? "free"]}`}>
                        {ad.payment_status ?? "free"}
                      </span>
                    </div>
                    {ad.duration_days && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{ad.duration_days} days</p>
                    )}
                  </td>

                  {/* Advertiser */}
                  <td className="px-5 py-3.5">
                    {ad.advertiser_name ? (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {ad.advertiser_name}
                        </div>
                        {ad.advertiser_email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            {ad.advertiser_email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Admin</span>
                    )}
                  </td>

                  {/* Expires */}
                  <td className="px-5 py-3.5">
                    {ad.expires_at ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className={`text-xs font-medium ${isExpired ? "text-destructive" : "text-foreground"}`}>
                          {isExpired ? "Expired" : new Date(ad.expires_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No expiry</span>
                    )}
                  </td>

                  {/* Active toggle */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleActive(ad.id, ad.active)}
                      disabled={toggling === ad.id}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors disabled:opacity-60 ${
                        ad.active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {toggling === ad.id ? "…" : ad.active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModalAd(ad)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleting === ad.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all text-xs font-medium disabled:opacity-40"
                      >
                        {deleting === ad.id
                          ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalAd !== null && (
        <AdModal
          ad={modalAd === "new" ? null : modalAd}
          onClose={() => setModalAd(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
