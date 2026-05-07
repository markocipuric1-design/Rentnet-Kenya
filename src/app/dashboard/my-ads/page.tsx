"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";
import {
  Megaphone, ExternalLink, Clock, CheckCircle, AlertCircle,
  Plus, ArrowLeft, LayoutPanelLeft, Grid3x3, Star, Globe,
  Pencil, Trash2, X, Upload, Save,
} from "lucide-react";

type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  placement: "sidebar" | "infeed" | "featured-partner" | "homepage";
  category: string | null;
  active: boolean;
  payment_status: "pending" | "paid" | "expired" | "free";
  duration_days: number | null;
  expires_at: string | null;
  created_at: string;
};

const PLACEMENT_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  sidebar:           { label: "Sidebar",          icon: <LayoutPanelLeft className="h-3.5 w-3.5" />, color: "text-primary",    bg: "bg-primary/10"    },
  infeed:            { label: "In-feed",           icon: <Grid3x3 className="h-3.5 w-3.5" />,        color: "text-sky-500",    bg: "bg-sky-500/10"    },
  "featured-partner":{ label: "Featured Partner",  icon: <Star className="h-3.5 w-3.5" />,           color: "text-amber-500",  bg: "bg-amber-500/10"  },
  homepage:          { label: "Homepage Banner",   icon: <Globe className="h-3.5 w-3.5" />,           color: "text-emerald-500",bg: "bg-emerald-500/10"},
};

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditAdModal({ ad, onClose, onSaved }: {
  ad: Ad;
  onClose: () => void;
  onSaved: (updated: Ad) => void;
}) {
  const [title, setTitle] = useState(ad.title);
  const [linkUrl, setLinkUrl] = useState(ad.link_url);
  const [imagePreview, setImagePreview] = useState(ad.image_url);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = await processImage(file, 1200, 0.85);
    setNewImage(processed);
    setImagePreview(URL.createObjectURL(processed));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();

    let imageUrl = ad.image_url;
    if (newImage) {
      const path = `ads/${ad.id}-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from("ad-images")
        .upload(path, newImage, { upsert: true, contentType: "image/webp" });
      if (!uploadErr) {
        const { data } = supabase.storage.from("ad-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
    }

    const { error: dbErr } = await supabase
      .from("advertisements")
      .update({ title, link_url: linkUrl, image_url: imageUrl })
      .eq("id", ad.id);

    setSaving(false);
    if (dbErr) { setError("Failed to save. Please try again."); return; }
    onSaved({ ...ad, title, link_url: linkUrl, image_url: imageUrl });
    onClose();
  };

  const inputCls = "w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <p className="font-bold text-foreground">Edit Ad</p>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          {/* Image */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Ad image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-32 rounded-xl overflow-hidden border border-border bg-muted cursor-pointer group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                <Upload className="h-4 w-4" /> Replace image
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>

          {/* Link URL */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Destination URL *</label>
            <input required type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className={inputCls} />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border hover:bg-muted font-semibold py-2.5 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Ad Card ──────────────────────────────────────────────────────────────────

function AdCard({ ad, onEdit, onDelete }: {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
}) {
  const meta = PLACEMENT_META[ad.placement] ?? PLACEMENT_META.sidebar;
  const days = daysRemaining(ad.expires_at);
  const isExpired = ad.expires_at ? new Date(ad.expires_at) < new Date() : false;
  const pct = ad.duration_days && days !== null ? Math.round((days / ad.duration_days) * 100) : null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
      <div className="relative h-36 overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
        <span className={`absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>
          {meta.icon} {meta.label}
        </span>
        {ad.payment_status === "pending" && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-yellow-500/90 text-white px-2 py-1 rounded-full">
            Awaiting payment
          </span>
        )}
        {isExpired && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-destructive/90 text-white px-2 py-1 rounded-full">
            Expired
          </span>
        )}
        {/* Action buttons */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1.5">
          <button
            onClick={() => onEdit(ad)}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-primary hover:text-white transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { if (confirm("Delete this ad?")) onDelete(ad.id); }}
            className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-destructive hover:text-white transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-bold text-foreground text-sm line-clamp-1">{ad.title}</p>
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-0.5">
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{ad.link_url.replace(/^https?:\/\//, "").slice(0, 40)}</span>
          </a>
        </div>

        {ad.payment_status === "paid" && !isExpired && days !== null && pct !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Time remaining</span>
              <span className={`font-bold ${days <= 3 ? "text-destructive" : "text-foreground"}`}>{days} {days === 1 ? "day" : "days"}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Expires {new Date(ad.expires_at!).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border">
          {ad.payment_status === "paid" && !isExpired ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
          ) : ad.payment_status === "pending" ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-yellow-600"><AlertCircle className="h-3.5 w-3.5" /> Payment pending</span>
          ) : isExpired ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Expired</span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-primary"><CheckCircle className="h-3.5 w-3.5" /> Active (free)</span>
          )}
          {(ad.payment_status === "expired" || isExpired) && (
            <Link href="/advertise" className="text-[11px] font-semibold text-primary hover:underline">Renew →</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-muted rounded-full w-3/4" />
        <div className="h-3 bg-muted rounded-full w-1/2" />
        <div className="h-1.5 bg-muted rounded-full w-full" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login?redirect=/dashboard/my-ads"); return; }
      const { data } = await supabase
        .from("advertisements")
        .select("id, title, image_url, link_url, placement, category, active, payment_status, duration_days, expires_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setAds(data ?? []);
      setLoading(false);
    })();
  }, [router]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("advertisements").delete().eq("id", id);
    if (!error) setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaved = (updated: Ad) =>
    setAds((prev) => prev.map((a) => a.id === updated.id ? updated : a));

  const active  = ads.filter((a) => a.payment_status === "paid" && a.expires_at && new Date(a.expires_at) > new Date());
  const pending = ads.filter((a) => a.payment_status === "pending");
  const expired = ads.filter((a) => a.payment_status === "paid" && a.expires_at && new Date(a.expires_at) <= new Date());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" /> My Ads
            </h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {ads.length} total · {active.length} active · {pending.length} pending
              </p>
            )}
          </div>
          <Link href="/advertise"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" /> Book new ad
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">No ads yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Book your first ad placement and reach thousands of property seekers.
            </p>
            <Link href="/advertise"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" /> Book your first ad
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Active ({active.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {active.map((ad) => <AdCard key={ad.id} ad={ad} onEdit={setEditingAd} onDelete={handleDelete} />)}
                </div>
              </section>
            )}
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" /> Awaiting payment ({pending.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map((ad) => <AdCard key={ad.id} ad={ad} onEdit={setEditingAd} onDelete={handleDelete} />)}
                </div>
              </section>
            )}
            {expired.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Expired ({expired.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expired.map((ad) => <AdCard key={ad.id} ad={ad} onEdit={setEditingAd} onDelete={handleDelete} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />

      {editingAd && (
        <EditAdModal ad={editingAd} onClose={() => setEditingAd(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
