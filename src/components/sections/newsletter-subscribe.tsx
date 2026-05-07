"use client";

import { useState } from "react";
import { Mail, TrendingUp, Home, Handshake, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const BENEFITS = [
  {
    icon: <TrendingUp className="h-4 w-4 text-primary" />,
    bg: "bg-primary/10",
    label: "Market Reports",
    desc: "Monthly price trends across Kenyan counties",
  },
  {
    icon: <Home className="h-4 w-4 text-emerald-600" />,
    bg: "bg-emerald-500/10",
    label: "New Listings",
    desc: "Fresh properties matching popular searches",
  },
  {
    icon: <Handshake className="h-4 w-4 text-amber-600" />,
    bg: "bg-amber-500/10",
    label: "Partner Deals",
    desc: "Exclusive offers from banks, movers & more",
  },
  {
    icon: <MapPin className="h-4 w-4 text-sky-600" />,
    bg: "bg-sky-500/10",
    label: "Area Guides",
    desc: "Neighbourhood insights for smarter decisions",
  },
];

type State = "idle" | "loading" | "success" | "duplicate" | "error";

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; duplicate?: boolean };
      if (data.duplicate) { setState("duplicate"); return; }
      if (!res.ok) { setErrorMsg(data.error ?? "Something went wrong."); setState("error"); return; }
      setState("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  return (
    <FadeIn>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* ── Main tile (2/3 width on large screens) ── */}
          <div className="lg:col-span-2 relative bg-card border border-border rounded-3xl p-8 sm:p-10 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            {/* Dot pattern background */}
            <div className="absolute inset-0 pointer-events-none opacity-60">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:18px_18px]" />
            </div>
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <Mail className="h-3.5 w-3.5" /> Weekly Digest
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-3">
                Stay ahead of the<br className="hidden sm:block" /> Kenyan property market
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
                Market reports, new listings and partner deals — straight to your inbox every week. No spam. Unsubscribe any time.
              </p>

              {state === "success" ? (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 max-w-md">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-600 text-sm">You&apos;re subscribed!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">First digest arrives next Monday morning.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                  >
                    {state === "loading"
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Get updates</span><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              )}

              {state === "duplicate" && (
                <p className="text-xs text-amber-600 mt-2.5">Already subscribed — you&apos;re good! 🎉</p>
              )}
              {state === "error" && (
                <p className="text-xs text-destructive mt-2.5">{errorMsg}</p>
              )}

              <p className="text-[11px] text-muted-foreground mt-5">
                Join <strong className="text-foreground">1,200+</strong> Kenyan investors, buyers and renters already subscribed.
              </p>
            </div>
          </div>

          {/* ── Benefit tiles (2×2 grid, right column) ── */}
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div
                key={b.label}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.bg}`}>
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm leading-snug">{b.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </FadeIn>
  );
}
