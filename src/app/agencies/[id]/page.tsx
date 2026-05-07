"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { slugToAgentId, toAgentSlug } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";
import { formatPrice } from "@/lib/format-price";
import {
  Home, MapPin, Bed, Square, Heart, Star, Phone, Mail, Check,
  ArrowLeft, ArrowRight, Shield, Clock, TrendingUp, Award, MessageSquare,
  Calendar, ChevronLeft, ChevronRight, X, PenLine, ImagePlus, Trash2, User,
  Globe, Users, Tag, Play,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentProfile = {
  id: string;
  full_name: string | null;
  account_type: string;
  verified: boolean;
  active: boolean | null;
  avatar_url: string | null;
  created_at: string;
  email: string | null;
  phone: string | null;
  cover_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube_url: string | null;
  specializations: string[] | null;
  service_areas: string[] | null;
  employee_count: number | null;
  founded_year: number | null;
};

type AgentListing = {
  id: string;
  slug: string | null;
  title: string;
  city: string | null;
  price: number | null;
  rooms: number | null;
  area: number | null;
  type: string;
  image: string | null;
};

type Review = {
  id: string;
  reviewer_id: string;
  rating: number;
  rating_communication: number | null;
  rating_professionalism: number | null;
  rating_responsiveness: number | null;
  rating_accuracy: number | null;
  title: string | null;
  body: string;
  images: string[] | null;
  created_at: string;
  reviewer: { full_name: string | null } | null;
};

type ReviewFormData = {
  rating: number;
  comm: number | null;
  prof: number | null;
  resp: number | null;
  acc: number | null;
  title: string | null;
  body: string;
  imageFiles: File[];
};

type ImagePreview = { file: File; url: string };

const PLACEHOLDER = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayName(name: string | null): string {
  return name?.trim() || "Agent";
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
}

// ─── Star input ───────────────────────────────────────────────────────────────

function StarInput({ value, onChange, label, required }: {
  value: number; onChange: (v: number) => void; label: string; required?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
            className="focus:outline-none p-0.5">
            <Star className={`h-5 w-5 transition-colors ${(hovered || value) >= i ? "fill-amber-400 text-amber-400" : "text-border hover:text-amber-300"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

function ReviewModal({ agentName, onClose, onSubmit, submitting, done }: {
  agentName: string;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  submitting: boolean;
  done: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comm, setComm] = useState(0);
  const [prof, setProf] = useState(0);
  const [resp, setResp] = useState(0);
  const [acc, setAcc] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [imageError, setImageError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setImageError("");
    const accepted: ImagePreview[] = [];
    const remaining = MAX_IMAGES - previews.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) { setImageError("Only images are allowed (JPEG, PNG, WebP)."); return; }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) { setImageError(`Image ${file.name} is too large (max ${MAX_SIZE_MB} MB).`); return; }
      accepted.push({ file, url: URL.createObjectURL(file) });
    });
    setPreviews((p) => [...p, ...accepted]);
  };

  const removeImage = (i: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !body.trim()) return;
    await onSubmit({
      rating,
      comm: comm || null,
      prof: prof || null,
      resp: resp || null,
      acc: acc || null,
      title: title.trim() || null,
      body: body.trim(),
      imageFiles: previews.map((p) => p.file),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-foreground text-base">Review: {agentName}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-1">Thank you for your review!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your experience helps others make better decisions.</p>
            <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div className="bg-muted/50 rounded-xl p-4">
              <StarInput value={rating} onChange={setRating} label="Overall rating" required />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detailed ratings (optional)</p>
              <StarInput value={comm} onChange={setComm} label="Communication" />
              <StarInput value={prof} onChange={setProf} label="Professionalism" />
              <StarInput value={resp} onChange={setResp} label="Responsiveness" />
              <StarInput value={acc} onChange={setAcc} label="Listing accuracy" />
            </div>
            <input
              type="text"
              placeholder="Review title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
            />
            <div>
              <textarea
                placeholder="Describe your experience…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60 resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{body.length}/1000</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Photos (optional, max {MAX_IMAGES})
              </p>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {previews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" onClick={() => setLightbox(p.url)} />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {previews.length < MAX_IMAGES && (
                <label className="flex items-center gap-2 justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-3 cursor-pointer transition-colors group">
                  <ImagePlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Add photo{previews.length > 0 ? ` (${previews.length}/${MAX_IMAGES})` : ""}
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </label>
              )}
              {imageError && <p className="text-xs text-destructive mt-1.5">{imageError}</p>}
            </div>
            <button
              type="submit"
              disabled={!rating || !body.trim() || submitting}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <PenLine className="h-4 w-4" />}
              {submitting ? "Uploading…" : "Submit review"}
            </button>
          </form>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={() => setLightbox(null)}>
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Reviews slider ───────────────────────────────────────────────────────────

function ReviewsSlider({ reviews, avgRating, canReview, hasReviewed, onOpenModal, onOpenLightbox }: {
  reviews: Review[];
  avgRating: number;
  canReview: boolean;
  hasReviewed: boolean;
  onOpenModal: () => void;
  onOpenLightbox: (url: string) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", slidesToScroll: 1 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-foreground text-lg">Client reviews</h2>
        <div className="flex items-center gap-2">
          {canReview && !hasReviewed && (
            <button onClick={onOpenModal} className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
              <PenLine className="h-3.5 w-3.5" /> Write a review
            </button>
          )}
          {hasReviewed && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold">
              <Check className="h-3 w-3" /> You reviewed
            </span>
          )}
          <button onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev || reviews.length === 0}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext || reviews.length === 0}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 mb-6 p-4 bg-muted/50 rounded-2xl">
        <div className="text-center flex-shrink-0">
          <p className="text-4xl sm:text-5xl font-extrabold text-foreground leading-none">
            {reviews.length > 0 ? avgRating.toFixed(1) : "—"}
          </p>
          <div className="flex gap-0.5 justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${reviews.length > 0 && i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {ratingBreakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3">{star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-10 text-center">
          <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
          {canReview && !hasReviewed && (
            <button onClick={onOpenModal} className="mt-3 text-sm text-primary hover:underline font-medium">
              Be the first to review
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="flex-none w-full sm:w-[calc(50%-6px)] lg:w-[calc(33.33%-8px)] flex flex-col gap-3 bg-muted/40 border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                    ))}
                  </div>
                  {r.title && <p className="text-xs font-semibold text-foreground">{r.title}</p>}
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">&ldquo;{r.body}&rdquo;</p>
                  {(r.rating_communication || r.rating_professionalism || r.rating_responsiveness || r.rating_accuracy) && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.rating_communication && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Communication: {r.rating_communication}/5</span>}
                      {r.rating_professionalism && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Professionalism: {r.rating_professionalism}/5</span>}
                      {r.rating_responsiveness && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Responsiveness: {r.rating_responsiveness}/5</span>}
                      {r.rating_accuracy && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Accuracy: {r.rating_accuracy}/5</span>}
                    </div>
                  )}
                  {r.images && r.images.length > 0 && (
                    <div className={`grid gap-1.5 ${r.images.length === 1 ? "grid-cols-1" : r.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {r.images.map((url, idx) => (
                        <button key={idx} type="button" onClick={() => onOpenLightbox(url)} className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {getInitials(r.reviewer?.full_name)}
                    </div>
                    <p className="font-semibold text-foreground text-xs">{r.reviewer?.full_name ?? "Anonymous"}</p>
                    <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">{formatDate(r.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {reviews.length > 1 && (
            <div className="flex gap-2 justify-center mt-5">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "bg-primary w-6" : "bg-border w-1.5"}`} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────────

function ListingCard({ l, faved, onToggleFav }: { l: AgentListing; faved: boolean; onToggleFav: () => void }) {
  return (
    <Link href={`/properties/${l.slug ?? l.id}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 flex">
      <div className="relative w-28 sm:w-32 flex-shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.image ?? PLACEHOLDER} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
          l.type === "For Sale" ? "bg-primary" : l.type === "For Rent" ? "bg-sky-500" : l.type === "Buying" ? "bg-emerald-500" : "bg-amber-500"
        }`}>
          {l.type}
        </span>
      </div>
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{l.title}</h3>
          {l.city && (
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs truncate">{l.city}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {l.rooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{l.rooms}</span>}
            {l.area && <span className="flex items-center gap-1"><Square className="h-3 w-3" />{l.area} m²</span>}
          </div>
          <div className="flex items-center gap-2">
            {l.price && <span className="font-bold text-sm text-foreground">{formatPrice(l.price, l.type)}</span>}
            <button onClick={(e) => { e.preventDefault(); onToggleFav(); }}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0">
              <Heart className={`h-3 w-3 ${faved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Contact sidebar ──────────────────────────────────────────────────────────

function ContactSidebar({ profile, currentUserId, agentId }: {
  profile: AgentProfile;
  currentUserId: string | null;
  agentId: string;
}) {
  const [contactMsg, setContactMsg] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactConvId, setContactConvId] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = contactMsg.trim();
    if (!body || !currentUserId || !agentId) return;
    setSendingContact(true);
    setContactError(null);
    try {
      const supabase = createClient();
      const [p1, p2] = currentUserId < agentId ? [currentUserId, agentId] : [agentId, currentUserId];
      const { data: existing } = await supabase.from("conversations").select("id").eq("participant_1", p1).eq("participant_2", p2).maybeSingle();
      let convId: string;
      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv, error: convErr } = await supabase.from("conversations").insert({ participant_1: p1, participant_2: p2 }).select("id").single();
        if (convErr || !newConv) { setContactError("Error creating conversation."); return; }
        convId = newConv.id;
      }
      const { error: msgErr } = await supabase.from("messages").insert({ conversation_id: convId, sender_id: currentUserId, body });
      if (msgErr) { setContactError("Error sending message."); return; }
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId);
      setContactConvId(convId);
      setContactSent(true);
    } catch {
      setContactError("Unexpected error. Please try again.");
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Contact form */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          {profile.account_type === "agencija" ? "Contact agency" : "Contact agent"}
        </p>
        {contactSent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Message sent!</p>
            <Link href={contactConvId ? `/dashboard/messages/${contactConvId}` : "/dashboard/messages"}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
              <Mail className="h-3.5 w-3.5" /> Open conversation →
            </Link>
          </div>
        ) : currentUserId && currentUserId !== agentId ? (
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
            <textarea
              placeholder="Your message…"
              rows={4}
              required
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground resize-none"
            />
            <button
              type="submit"
              disabled={sendingContact || !contactMsg.trim()}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {sendingContact
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Mail className="h-4 w-4" />}
              Send message
            </button>
            {contactError && <p className="text-xs text-destructive text-center">{contactError}</p>}
          </form>
        ) : !currentUserId ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">Sign in to send a message.</p>
            <Link href={`/login?redirect=/agencies/${toAgentSlug(profile?.full_name, agentId)}`}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20">
              Sign In
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">You cannot message yourself.</p>
        )}
      </div>

      {/* Contact info */}
      {(profile.phone || profile.website) && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact details</p>
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors flex-shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{profile.phone}</p>
              </div>
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/15 transition-colors flex-shrink-0">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Website</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {profile.website.replace(/^https?:\/\/(www\.)?/, "")}
                </p>
              </div>
            </a>
          )}
          {profile.account_type === "agencija" && !profile.website && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Working hours</p>
                <p className="text-sm font-semibold text-foreground">Mon–Fri, 8:00–18:00</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Link href="/agencies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors justify-center py-2">
        <ArrowLeft className="h-4 w-4" /> Back to agents
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonHero() {
  return (
    <div className="animate-pulse">
      <div className="h-52 bg-muted rounded-t-2xl" />
      <div className="bg-card border border-border border-t-0 rounded-b-2xl p-6 pt-16 mb-8">
        <div className="h-7 bg-muted rounded-full w-52 mb-3" />
        <div className="h-4 bg-muted rounded-full w-80" />
        <div className="grid grid-cols-4 gap-3 mt-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [agentListings, setAgentListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [faveds, setFaveds] = useState<boolean[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [pageLightbox, setPageLightbox] = useState<string | null>(null);

  const rawParam = params?.id as string;
  // Resolved UUID (set once slug is looked up)
  const [agentId, setAgentId] = useState<string>("");

  useEffect(() => {
    if (!rawParam) return;
    const supabase = createClient();

    (async () => {
      // 1. Resolve rawParam → UUID
      // Support: clean slug, old slug format (name-{uuid-hex}), or raw UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam);
      const idFromOldSlug = slugToAgentId(rawParam);

      let resolvedId: string;
      if (idFromOldSlug) {
        resolvedId = idFromOldSlug;
      } else if (isUUID) {
        resolvedId = rawParam;
      } else {
        const { data: slugLookup } = await supabase.from("profiles")
          .select("id").eq("slug", rawParam).maybeSingle();
        if (!slugLookup) { router.replace("/agencies"); return; }
        resolvedId = slugLookup.id;
      }

      setAgentId(resolvedId);
      supabase.from("profile_views").insert({ profile_id: resolvedId }).then(() => {});

      const [
        { data: profileData, error: profileError },
        { data: listingsData },
        { data: { user } },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from("profiles")
          .select("id, full_name, account_type, verified, active, avatar_url, created_at, email, phone, cover_url, website, instagram, facebook, linkedin, youtube_url, specializations, service_areas, employee_count, founded_year")
          .eq("id", resolvedId)
          .single(),
        supabase.from("listings")
          .select("id, slug, title, city, price, rooms, area, type")
          .eq("user_id", resolvedId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.auth.getUser(),
        supabase.from("reviews")
          .select("*, reviewer:profiles!reviewer_id(full_name)")
          .eq("reviewed_id", resolvedId)
          .order("created_at", { ascending: false }),
      ]);

      if (profileError || !profileData) {
        router.replace("/agencies");
        return;
      }

      setProfile(profileData as AgentProfile);

      const ids = (listingsData ?? []).map((l) => l.id);
      let photosMap: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: photos } = await supabase.from("listing_photos")
          .select("listing_id, url")
          .in("listing_id", ids)
          .order("order_index", { ascending: true });
        (photos ?? []).forEach((p) => {
          if (!photosMap[p.listing_id]) photosMap[p.listing_id] = p.url;
        });
      }

      const mapped: AgentListing[] = (listingsData ?? []).map((l) => ({ ...l, image: photosMap[l.id] ?? null }));
      setAgentListings(mapped);
      setFaveds(new Array(mapped.length).fill(false));
      setReviews((reviewsData as Review[]) ?? []);
      setCurrentUserId(user?.id ?? null);

      if (user) {
        const { data: existing } = await supabase.from("reviews").select("id")
          .eq("reviewer_id", user.id).eq("reviewed_id", resolvedId).maybeSingle();
        setHasReviewed(!!existing);
      }

      setLoading(false);
    })();
  }, [rawParam, router]);

  const canReview = !!currentUserId && !!profile && currentUserId !== profile.id;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const yearsActive = profile ? new Date().getFullYear() - new Date(profile.created_at).getFullYear() : 0;

  const handleSubmitReview = async (data: ReviewFormData) => {
    const resolvedAgentId = profile?.id ?? agentId;
    if (!currentUserId || !resolvedAgentId) return;
    setSubmitting(true);
    const supabase = createClient();
    const imageUrls: string[] = [];
    for (const file of data.imageFiles) {
      const processed = await processImage(file, 800);
      const path = `${currentUserId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { error: uploadError } = await supabase.storage.from("review-images").upload(path, processed, { upsert: false, contentType: "image/webp" });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
    }
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: currentUserId,
      reviewed_id: resolvedAgentId,
      rating: data.rating,
      rating_communication: data.comm,
      rating_professionalism: data.prof,
      rating_responsiveness: data.resp,
      rating_accuracy: data.acc,
      title: data.title,
      body: data.body,
      images: imageUrls.length > 0 ? imageUrls : null,
    });
    if (!error) {
      setReviewDone(true);
      setHasReviewed(true);
      const { data: refreshed } = await supabase.from("reviews")
        .select("*, reviewer:profiles!reviewer_id(full_name)")
        .eq("reviewed_id", resolvedAgentId).order("created_at", { ascending: false });
      setReviews((refreshed as Review[]) ?? []);
    }
    setSubmitting(false);
  };

  const toggleFav = (i: number) => setFaveds((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const isAgency = profile?.account_type === "agencija";

  const statCards = [
    { icon: <TrendingUp className="h-5 w-5 text-primary" />, value: String(agentListings.length), label: "Active listings", bg: "bg-primary/10" },
    { icon: <Star className="h-5 w-5 text-amber-500" />, value: reviews.length > 0 ? avgRating.toFixed(1) : "—", label: "Average rating", bg: "bg-amber-500/10" },
    { icon: <Award className="h-5 w-5 text-sky-500" />, value: String(reviews.length), label: "Reviews received", bg: "bg-sky-500/10" },
    isAgency && profile?.founded_year
      ? { icon: <Calendar className="h-5 w-5 text-emerald-500" />, value: String(profile.founded_year), label: "Year Founded", bg: "bg-emerald-500/10" }
      : { icon: <Calendar className="h-5 w-5 text-emerald-500" />, value: yearsActive > 0 ? `${yearsActive} yr${yearsActive !== 1 ? "s" : ""}` : "< 1 yr", label: "On platform", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Agencies", href: "/agencies" },
            { label: profile ? displayName(profile.full_name) : "…" },
          ]}
          className="mb-6"
        />

        {loading ? <SkeletonHero /> : profile && (
          <>
            {/* ── AGENCY HERO ─────────────────────────────────────── */}
            {isAgency ? (
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
                {/* Cover banner */}
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  {profile.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/25 via-primary/10 to-background relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.05)_1px,transparent_1px)] bg-[length:24px_24px]" />
                      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
                      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
                    </div>
                  )}
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
                </div>

                <div className="relative z-10 px-6 sm:px-8 pb-8">
                  {/* Logo + name row */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
                    {/* Logo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-background border-4 border-card shadow-2xl shadow-black/20 overflow-hidden flex items-center justify-center">
                        {profile.avatar_url
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt={profile.full_name ?? ""} className="w-full h-full object-cover" />
                          : <span className="text-primary font-extrabold text-3xl">{initials}</span>}
                      </div>
                      {profile.verified && (
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 border-[3px] border-card flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Agency name + badges */}
                    <div className="flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{profile.full_name || "—"}</h1>
                        {profile.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <Shield className="h-3 w-3" /> Verified agency
                          </span>
                        )}
                        {reviews.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {avgRating.toFixed(1)} / 5
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {profile.founded_year && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> Founded {profile.founded_year}
                          </div>
                        )}
                        {profile.employee_count && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" /> {profile.employee_count} employees
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex gap-2 flex-shrink-0 pb-1">
                      {profile.phone && (
                        <a href={`tel:${profile.phone}`} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 text-sm">
                          <Phone className="h-4 w-4" /> Call
                        </a>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold px-4 py-2.5 rounded-xl transition-all text-sm">
                          <Globe className="h-4 w-4 text-primary" /> Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Social links */}
                  {(profile.instagram || profile.facebook || profile.linkedin) && (
                    <div className="flex gap-2 mb-6">
                      {profile.instagram && (
                        <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-pink-500/10 border border-border hover:border-pink-400/40 text-xs font-bold text-muted-foreground hover:text-pink-500 transition-all">
                          IG
                        </a>
                      )}
                      {profile.facebook && (
                        <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-blue-500/10 border border-border hover:border-blue-400/40 text-xs font-bold text-muted-foreground hover:text-blue-500 transition-all">
                          FB
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={`https://linkedin.com/company/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-sky-500/10 border border-border hover:border-sky-400/40 text-xs font-bold text-muted-foreground hover:text-sky-500 transition-all">
                          IN
                        </a>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map((s) => (
                      <div key={s.label} className="flex items-center gap-3 bg-muted/40 border border-border hover:border-primary/30 rounded-xl p-3 sm:p-4 transition-all duration-200 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} group-hover:scale-105 transition-transform`}>
                          {s.icon}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-lg leading-none">{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── FIZIČNA OSEBA HERO ───────────────────────────────── */
              <div className="relative bg-card border border-border rounded-2xl overflow-hidden mb-8">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/15 overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20">
                        {profile.avatar_url
                          ? // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-primary font-extrabold text-3xl">{initials}</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-extrabold text-foreground mb-1">
                        {displayName(profile.full_name)}
                      </h1>
                      <p className="text-muted-foreground text-sm">Private seller</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-foreground text-sm">{reviews.length > 0 ? avgRating.toFixed(1) : "—"}</span>
                          <span className="text-muted-foreground text-sm">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> On platform since {new Date(profile.created_at).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {statCards.map((s) => (
                      <div key={s.label} className="flex items-center gap-3 bg-background/60 border border-border hover:border-primary/30 rounded-xl p-3 sm:p-4 transition-all duration-200 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} group-hover:scale-105 transition-transform`}>
                          {s.icon}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-lg leading-none">{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MAIN CONTENT GRID ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left: content */}
              <div className="lg:col-span-2 flex flex-col gap-6">


                {/* Agency-specific: Specializations + Service areas */}
                {isAgency && (profile.specializations?.length || profile.service_areas?.length) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.specializations && profile.specializations.length > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" /> Specialisations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.specializations.map((s) => (
                            <span key={s} className="text-xs font-medium bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.service_areas && profile.service_areas.length > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" /> Service areas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.service_areas.map((a) => (
                            <span key={a} className="text-xs font-medium bg-muted text-foreground border border-border px-3 py-1 rounded-full">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* YouTube embed */}
                {isAgency && profile.youtube_url && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                      <Play className="h-4 w-4 text-red-500" />
                      <h3 className="font-bold text-foreground text-sm">Video presentation</h3>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={profile.youtube_url.replace("watch?v=", "embed/")}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Active listings */}
                {agentListings.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-foreground text-base">Active listings</h2>
                      <Link href={`/listings?agent=${profile?.id ?? agentId}`} className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                        All listings <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {agentListings.map((l, i) => (
                        <ListingCard key={l.id} l={l} faved={faveds[i] ?? false} onToggleFav={() => toggleFav(i)} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <User className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No active listings.</p>
                  </div>
                )}

                {/* Reviews */}
                <ReviewsSlider
                  reviews={reviews}
                  avgRating={avgRating}
                  canReview={canReview}
                  hasReviewed={hasReviewed}
                  onOpenModal={() => { setReviewDone(false); setModalOpen(true); }}
                  onOpenLightbox={(url) => setPageLightbox(url)}
                />
              </div>

              {/* Right: sticky sidebar */}
              <div className="lg:sticky lg:top-24 self-start">
                <ContactSidebar profile={profile} currentUserId={currentUserId} agentId={profile?.id ?? agentId} />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {modalOpen && profile && (
        <ReviewModal
          agentName={displayName(profile.full_name)}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitReview}
          submitting={submitting}
          done={reviewDone}
        />
      )}

      {pageLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPageLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pageLightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setPageLightbox(null)}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
