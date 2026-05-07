"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Globe, CheckCircle, Home,
  Mail, Check, ChevronLeft, ChevronRight, X, FileText, ExternalLink,
  QrCode, Download, Share2, Pencil, CheckCheck, ShieldCheck,
} from "lucide-react";
import dynamic from "next/dynamic";
const QRCodeSVG = dynamic(() => import("qrcode.react").then((m) => ({ default: m.QRCodeSVG })), { ssr: false });
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";
import { slugToAgentId } from "@/lib/utils";

type Agent = {
  id: string;
  contact_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  profile_image_url: string | null;
  listing_ids: string[] | null;
  showcase_images: string[] | null;
  documents: string[] | null;
  verified: boolean;
  user_id: string | null;
};

type Listing = {
  id: string;
  slug: string | null;
  title: string;
  city: string | null;
  price: number | null;
  type: string;
  image: string | null;
};

function ShowcaseLightbox({ images, index, onClose }: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" onClick={onClose}>
        <X className="h-5 w-5 text-white" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrent((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrent((i) => (i + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[current]}
        alt=""
        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function RentnetAgentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { resolvedId, isCleanSlug } = useMemo(() => {
    const extracted = slugToAgentId(id);
    return { resolvedId: extracted ?? id, isCleanSlug: !extracted };
  }, [id]);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pageUrl, setPageUrl] = useState("");
  const qrRef = useRef<SVGSVGElement>(null);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: agent?.contact_name ?? "Rentnet Agent", url: pageUrl });
    } else {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Contact form
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [contactMsg, setContactMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);

  useEffect(() => {
    if (id) setPageUrl(`${window.location.origin}/partners/rentnet-agents/${id}`);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const supabase = createClient();

      const baseQuery = supabase
        .from("partners")
        .select("id, contact_name, company_name, email, phone, website, city, description, profile_image_url, listing_ids, showcase_images, documents, verified, user_id")
        .eq("category", "rentnet-agents")
        .eq("verified", true);

      const [{ data: agentData }, { data: { user } }] = await Promise.all([
        (isCleanSlug
          ? baseQuery.eq("slug", id)
          : baseQuery.eq("id", resolvedId)
        ).single(),
        supabase.auth.getUser(),
      ]);

      if (!agentData) { router.replace("/partners/rentnet-agents"); return; }
      setAgent(agentData);
      setCurrentUserId(user?.id ?? null);

      // Fetch linked listings
      const ids = agentData.listing_ids ?? [];
      if (ids.length > 0) {
        const { data: listingRows } = await supabase
          .from("listings")
          .select("id, slug, title, city, price, type")
          .in("id", ids)
          .eq("status", "active");

        if (listingRows?.length) {
          const { data: photos } = await supabase
            .from("listing_photos")
            .select("listing_id, url")
            .in("listing_id", listingRows.map((l) => l.id))
            .order("position", { ascending: true });
          const photoMap: Record<string, string> = {};
          (photos ?? []).forEach((p) => { if (!photoMap[p.listing_id]) photoMap[p.listing_id] = p.url; });
          setListings(listingRows.map((l) => ({ ...l, image: photoMap[l.id] ?? null })));
        }
      }

      setLoading(false);
    })();
  }, [id, router]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = contactMsg.trim();
    if (!body || !currentUserId || !agent?.email) return;
    setSending(true);
    setContactError(null);

    try {
      const supabase = createClient();
      // Find the agent's user_id from partners table
      const { data: partnerRow } = await supabase
        .from("partners")
        .select("user_id")
        .eq("id", agent.id)
        .single();

      const agentUserId = partnerRow?.user_id;
      if (!agentUserId || agentUserId === currentUserId) {
        setContactError("Unable to send message.");
        setSending(false);
        return;
      }

      const [p1, p2] = currentUserId < agentUserId
        ? [currentUserId, agentUserId]
        : [agentUserId, currentUserId];

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1", p1)
        .eq("participant_2", p2)
        .maybeSingle();

      let cId: string;
      if (existing) {
        cId = existing.id;
      } else {
        const { data: newConv, error: convErr } = await supabase
          .from("conversations")
          .insert({ participant_1: p1, participant_2: p2 })
          .select("id")
          .single();
        if (convErr || !newConv) { setContactError("Error creating conversation."); setSending(false); return; }
        cId = newConv.id;
      }

      const { error: msgErr } = await supabase.from("messages").insert({
        conversation_id: cId,
        sender_id: currentUserId,
        body,
      });
      if (msgErr) { setContactError("Error sending message."); setSending(false); return; }
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", cId);
      setConvId(cId);
      setSent(true);
    } catch {
      setContactError("Unexpected error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rentnet-agent-${id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials = agent?.contact_name
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const showcaseImages = agent?.showcase_images ?? [];
  const documents = agent?.documents ?? [];

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        <Link href="/partners/rentnet-agents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Rentnet Agents
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Hero card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {agent.profile_image_url
                    ? <img src={agent.profile_image_url} alt={agent.contact_name} className="w-full h-full object-cover" />
                    : <span className="text-primary font-extrabold text-3xl">{initials}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">{agent.contact_name}</h1>
                      {agent.verified && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold bg-primary/10 text-primary border border-primary/25 px-3 py-1 rounded-full flex-shrink-0 shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" /> Rentnet Certified
                        </span>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={handleShare}
                        title={copied ? "Copied!" : "Share"}
                        className="w-8 h-8 rounded-xl border border-border hover:border-primary/40 hover:bg-accent flex items-center justify-center transition-all"
                      >
                        {copied
                          ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                          : <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </button>
                      {currentUserId && currentUserId === agent.user_id && (
                        <Link
                          href="/dashboard/my-partner-profile"
                          title="Edit profile"
                          className="w-8 h-8 rounded-xl border border-border hover:border-primary/40 hover:bg-accent flex items-center justify-center transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* end name row */}
                  {agent.company_name && agent.company_name !== agent.contact_name && (
                    <p className="text-sm text-primary font-semibold mb-1">{agent.company_name}</p>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-sm">{agent.city}</span>
                  </div>
                  {listings.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-xl w-fit">
                      <Home className="h-3.5 w-3.5" />
                      {listings.length} active listing{listings.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              {agent.description && (
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-5">
                  {agent.description}
                </p>
              )}
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-sm font-bold text-foreground mb-4">Verification documents</h2>
                <div className="flex flex-col gap-2">
                  {documents.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 border border-border rounded-xl hover:border-primary/40 hover:bg-accent transition-all group"
                    >
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-foreground flex-1 truncate">
                        Document {i + 1}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Showcase images */}
            {showcaseImages.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-sm font-bold text-foreground mb-4">Showcase</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {showcaseImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className="aspect-[4/3] rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active listings */}
            {listings.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-sm font-bold text-foreground mb-4">Active listings</h2>
                <div className="flex flex-col gap-3">
                  {listings.map((l) => (
                    <Link
                      key={l.id}
                      href={`/properties/${l.slug ?? l.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {l.image
                          ? <img src={l.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full bg-muted" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{l.title}</p>
                        {l.city && (
                          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs truncate">{l.city}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {l.price && <p className="font-bold text-sm text-foreground">{formatPrice(l.price, l.type)}</p>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.type === "For Sale" ? "bg-primary/10 text-primary"
                          : l.type === "For Rent" ? "bg-sky-500/10 text-sky-600"
                          : "bg-muted text-muted-foreground"
                        }`}>{l.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ───────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 self-start flex flex-col gap-4">

            {/* Contact details */}
            {(agent.phone || agent.website || agent.email) && (
              <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact details</p>
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{agent.phone}</p>
                    </div>
                  </a>
                )}
                {agent.website && (
                  <a href={agent.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Website</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {agent.website.replace(/^https?:\/\/(www\.)?/, "")}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Message form */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Send a message</p>
              {sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Message sent!</p>
                  <Link
                    href={convId ? `/dashboard/messages/${convId}` : "/dashboard/messages"}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <Mail className="h-3.5 w-3.5" /> Open conversation →
                  </Link>
                </div>
              ) : currentUserId ? (
                <form onSubmit={handleContact} className="flex flex-col gap-3">
                  <textarea
                    placeholder="Your message…"
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground resize-none"
                  />
                  {contactError && <p className="text-xs text-destructive">{contactError}</p>}
                  <button
                    type="submit"
                    disabled={sending || !contactMsg.trim()}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {sending
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Mail className="h-4 w-4" />}
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">Sign in to send a message.</p>
                  <Link
                    href={`/login?redirect=/partners/rentnet-agents/${agent.id}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* QR code */}
            {pageUrl && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">QR Code</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <QRCodeSVG
                      ref={qrRef}
                      value={pageUrl}
                      size={160}
                      level="M"
                      marginSize={1}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    Scan to open this agent's profile directly.
                  </p>
                  <button
                    onClick={handleDownloadQR}
                    className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold py-2 rounded-xl text-xs transition-all"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    Download SVG
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />

      {lightboxIndex !== null && showcaseImages.length > 0 && (
        <ShowcaseLightbox
          images={showcaseImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
