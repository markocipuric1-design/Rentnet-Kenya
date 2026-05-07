"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import {
  Megaphone, Check, ArrowRight, X, Loader2,
  LayoutPanelLeft, Grid3x3, Star, Globe, Mail, User,
  Link2, Image as ImageIcon, Info, Phone, CheckCircle, AlertCircle,
} from "lucide-react";
import { partnerCategoriesData } from "@/lib/content-data";

// ─── Pricing ──────────────────────────────────────────────────────────────────

const AD_PRICES: Record<string, Record<number, number>> = {
  sidebar:            { 7: 1500, 14: 2500, 30: 4000 },
  infeed:             { 7: 2000, 14: 3500, 30: 5500 },
  "featured-partner": { 7: 1000, 14: 1800, 30: 3000 },
  homepage:           { 7: 3000, 14: 5000, 30: 8000 },
};

const PLACEMENTS = [
  {
    key: "sidebar",
    label: "Sidebar",
    description: "Shown on every property detail page — right column, sticky. High visibility for serious buyers.",
    icon: <LayoutPanelLeft className="h-5 w-5" />,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  {
    key: "infeed",
    label: "In-feed",
    description: "Appears as a sponsored card in the listings grid at position 6. Natural, non-intrusive placement.",
    icon: <Grid3x3 className="h-5 w-5" />,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  {
    key: "featured-partner",
    label: "Featured Partner",
    description: "Highlighted card above the partner directory — perfect for agencies, services, and contractors.",
    icon: <Star className="h-5 w-5" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    key: "homepage",
    label: "Homepage Banner",
    description: "Full-width banner shown between sections on the homepage — maximum visibility across all visitors.",
    icon: <Globe className="h-5 w-5" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
];

const DURATIONS = [7, 14, 30] as const;

const inputClass =
  "w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60";

type PaymentState = "idle" | "pending" | "complete" | "failed";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdvertisePage() {
  const [selectedPlacements, setSelectedPlacements] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<7 | 14 | 30>(30);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for payment status every 3 seconds
  useEffect(() => {
    if (paymentState !== "pending" || !checkoutId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mpesa/status?id=${checkoutId}&type=ad`);
        const data = await res.json();
        if (data.state === "COMPLETE") {
          setPaymentState("complete");
          clearInterval(pollRef.current!);
        } else if (data.state === "FAILED") {
          setError(data.failed_reason ?? "Payment failed or was cancelled. Please try again.");
          setPaymentState("failed");
          clearInterval(pollRef.current!);
        }
      } catch { /* network error — keep polling */ }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [paymentState, checkoutId]);

  const togglePlacement = (key: string) =>
    setSelectedPlacements((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const total = Array.from(selectedPlacements).reduce(
    (sum, p) => sum + (AD_PRICES[p]?.[duration] ?? 0),
    0,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPlacements.size) { setError("Select at least one ad placement."); return; }
    if (!imageFile) { setError("Upload an ad image."); return; }
    if (!linkUrl.startsWith("http")) { setError("Enter a valid URL (starting with http/https)."); return; }
    if (!phone.trim()) { setError("Enter your M-Pesa phone number."); return; }

    setLoading(true);
    try {
      const placements = Array.from(selectedPlacements).map((p) => ({
        placement: p,
        duration_days: duration,
      }));

      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("advertiser_name", name);
      fd.append("advertiser_email", email);
      fd.append("phone_number", phone);
      fd.append("title", adTitle);
      fd.append("link_url", linkUrl);
      fd.append("category", category || "");
      fd.append("placements", JSON.stringify(placements));

      const res = await fetch("/api/mpesa/ad-checkout", { method: "POST", body: fd });
      const text = await res.text();
      let data: { checkout_id?: string; error?: string };
      try { data = JSON.parse(text); } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(data.error ?? `Server error (${res.status})`);

      setCheckoutId(data.checkout_id!);
      setPaymentState("pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const showCategorySelect = selectedPlacements.has("featured-partner");

  // ── Payment status screens ────────────────────────────────────────────────

  if (paymentState === "complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Your ad is now live. M-Pesa payment received — thank you!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/my-ads" className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-all">
                View my ads
              </Link>
              <Link href="/listings" className="border border-border text-foreground font-semibold px-6 py-3 rounded-xl text-sm hover:bg-accent transition-all">
                Browse listings
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentState === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Phone className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Check your phone</h1>
            <p className="text-muted-foreground mb-2">
              An M-Pesa payment request has been sent to <strong>{phone}</strong>.
            </p>
            <p className="text-muted-foreground mb-8 text-sm">
              Open M-Pesa on your phone, enter your PIN to complete the payment of{" "}
              <strong>KES {total.toLocaleString("en-KE")}</strong>.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Waiting for payment confirmation…
            </div>
            <button
              onClick={() => { setPaymentState("idle"); setCheckoutId(null); }}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Cancel and go back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentState === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment failed</h1>
            <p className="text-muted-foreground mb-6">
              The M-Pesa payment was not completed. You can try again.
            </p>
            <button
              onClick={() => { setPaymentState("idle"); setCheckoutId(null); setError(""); }}
              className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-all"
            >
              Try again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Megaphone className="h-3.5 w-3.5" /> Advertise on Rentnet
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Reach Thousands of Property Seekers
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Place your ad in front of active buyers, renters, and property enthusiasts. Choose your placement, duration, and go live in minutes.
          </p>
        </div>

        {/* Pricing overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {PLACEMENTS.map((p) => (
            <div key={p.key} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center mb-3 ${p.color}`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{p.label}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.description}</p>
              <div className="flex flex-col gap-1">
                {DURATIONS.map((d) => (
                  <div key={d} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d} days</span>
                    <span className="font-bold text-foreground">
                      KES {AD_PRICES[p.key][d].toLocaleString("en-KE")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">

            {/* Step 1: Placements */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-1">1. Select placements</h2>
              <p className="text-xs text-muted-foreground mb-4">Choose one or more ad placements.</p>
              <div className="flex flex-col gap-3">
                {PLACEMENTS.map((p) => {
                  const selected = selectedPlacements.has(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePlacement(p.key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? `${p.border} bg-card shadow-sm`
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0 ${p.color}`}>
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{p.label}</span>
                          <span className={`text-xs font-bold ${p.color}`}>
                            KES {AD_PRICES[p.key][duration].toLocaleString("en-KE")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Duration */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-1">2. Choose duration</h2>
              <p className="text-xs text-muted-foreground mb-4">Ad goes live immediately after payment.</p>
              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      duration === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {d} days
                    {d === 30 && (
                      <span className="ml-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full">
                        Best value
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Ad details */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">3. Ad details</h2>
              <div className="flex flex-col gap-4">

                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Ad image *
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Click to upload image
                      </span>
                      <span className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 5 MB</span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Recommended: 1200 × 630 px (16:9)
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Ad title *
                  </label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Westlands Luxury Apartments"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      required
                      maxLength={80}
                      className={inputClass + " pl-9"}
                    />
                  </div>
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Destination URL *
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      required
                      className={inputClass + " pl-9"}
                    />
                  </div>
                </div>

                {/* Category (featured-partner only) */}
                {showCategorySelect && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Partner category (optional)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="">All partner categories</option>
                      {partnerCategoriesData.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to show on all partner pages.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Advertiser info + payment */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">4. Your details & payment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Your name or company"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass + " pl-9"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass + " pl-9"}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    M-Pesa phone number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="0712 345 678 or +254 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={inputClass + " pl-9"}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> You will receive an M-Pesa PIN prompt on this number.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </form>

          {/* Right: sticky order summary */}
          <div className="lg:sticky lg:top-24 self-start flex flex-col gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-4">Order summary</h3>

              {selectedPlacements.size === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No placements selected yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  {Array.from(selectedPlacements).map((p) => {
                    const info = PLACEMENTS.find((x) => x.key === p)!;
                    return (
                      <div key={p} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={info.color}>{info.icon}</span>
                          <span className="text-foreground font-medium">{info.label}</span>
                        </div>
                        <span className="font-bold text-foreground">
                          KES {AD_PRICES[p][duration].toLocaleString("en-KE")}
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t border-border pt-2 mt-1 flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">KES {total.toLocaleString("en-KE")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Duration: <strong>{duration} days</strong> per placement
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || selectedPlacements.size === 0}
                className="w-full bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Pay with M-Pesa <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* M-Pesa badge */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00A550] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px] font-black">M</span>
                </div>
                <span className="text-xs text-muted-foreground">Powered by M-Pesa</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
              {[
                { icon: <Check className="h-3.5 w-3.5 text-emerald-500" />, text: "Secure M-Pesa payment" },
                { icon: <Check className="h-3.5 w-3.5 text-emerald-500" />, text: "Ad goes live within minutes" },
                { icon: <Check className="h-3.5 w-3.5 text-emerald-500" />, text: "Auto-expires — no surprise charges" },
                { icon: <Globe className="h-3.5 w-3.5 text-primary" />, text: "Reach 1,000s of property seekers" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {b.icon}
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Questions?{" "}
              <Link href="mailto:ads@rentnet.co.ke" className="text-primary hover:underline">
                ads@rentnet.co.ke
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
