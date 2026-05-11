"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Check, MessageCircle, Shield, Mail, Calculator, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";
import { toAgentSlug } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function toWaPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  return "254" + d;
}

function displayName(name: string | null, accountType: string) {
  if (!name) return "User";
  if (accountType === "agencija" || accountType === "agent") return name;
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

type Owner = {
  id: string;
  slug: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  account_type: string;
  verified: boolean;
};

type MarketData = {
  medianPrice: number | null;
  avgM2: number | null;
  count: number;
};

type Ad = { id: string; title: string; image_url: string; link_url: string };

type ListingCore = {
  id: string;
  title: string;
  city: string;
  category: string | null;
  type: string;
  price: number;
  area: number | null;
};

type Props = {
  listing: ListingCore;
  owner: Owner | null;
  marketData: MarketData | null;
  currentUserId: string | null;
  sidebarAds: Ad[];
};

function MortgageWidget({ price }: { price: number }) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(13);
  const [years, setYears] = useState(20);

  const monthly = useMemo(() => {
    const P = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (!P || !r || !n) return null;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [price, downPct, rate, years]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calculator className="h-4 w-4 text-primary" /> Mortgage estimate
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4">
          {monthly && (
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Est. monthly payment</p>
              <p className="text-2xl font-extrabold text-primary">KES {Math.round(monthly).toLocaleString("en-KE")}</p>
            </div>
          )}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Down payment</span><span className="font-semibold text-foreground">{downPct}%</span>
            </div>
            <input type="range" min={5} max={80} step={5} value={downPct}
              onChange={e => setDownPct(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Interest rate</span><span className="font-semibold text-foreground">{rate}%</span>
            </div>
            <input type="range" min={8} max={25} step={0.5} value={rate}
              onChange={e => setRate(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Loan term</span><span className="font-semibold text-foreground">{years} years</span>
            </div>
            <div className="flex gap-1.5">
              {[10, 15, 20, 25, 30].map(y => (
                <button key={y} onClick={() => setYears(y)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${years === y ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <Link href="/tools/mortgage-calculator" className="text-xs text-primary hover:underline text-center">
            Full calculator →
          </Link>
        </div>
      )}
    </div>
  );
}

export function ContactPanel({ listing, owner, marketData, currentUserId, sidebarAds }: Props) {
  const [msgSent, setMsgSent] = useState(false);
  const [msgSending, setMsgSending] = useState(false);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  const ownerInitials = (owner?.full_name ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!owner || !currentUserId) return;
    setMsgSending(true);
    const supabase = createClient();
    const p1 = currentUserId < owner.id ? currentUserId : owner.id;
    const p2 = currentUserId < owner.id ? owner.id : currentUserId;
    let { data: conv } = await supabase.from("conversations")
      .select("id").eq("participant_1", p1).eq("participant_2", p2).single();
    if (!conv) {
      const { data: newConv } = await supabase.from("conversations")
        .insert({ participant_1: p1, participant_2: p2 }).select("id").single();
      conv = newConv;
    }
    if (conv) {
      const msg = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
      await supabase.from("messages").insert({ conversation_id: conv.id, sender_id: currentUserId, body: msg });
    }
    setMsgSending(false);
    setMsgSent(true);
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError("");
    if (!enquiryName || !enquiryEmail || !enquiryMsg) { setEnquiryError("Please fill in all required fields."); return; }
    setEnquirySending(true);
    const res = await fetch("/api/send-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentEmail: owner?.id ? undefined : undefined,
        agentName: owner?.full_name ?? "the owner",
        senderName: enquiryName,
        senderEmail: enquiryEmail,
        senderPhone: enquiryPhone || undefined,
        listingTitle: listing.title,
        listingUrl: `${window.location.origin}/properties/${listing.id}`,
        message: enquiryMsg,
        ownerUserId: owner?.id,
      }),
    });
    setEnquirySending(false);
    if (!res.ok) { setEnquiryError("Failed to send. Please try again."); return; }
    setEnquirySent(true);
  };

  const waMessage = encodeURIComponent(
    `Hi! I found your listing on Rentnet:\n\n*${listing.title}*\n📍 ${listing.city}\n💰 KES ${listing.price.toLocaleString("en-KE")}\n\nIs it still available?`
  );

  const marketUrl = `/market?city=${encodeURIComponent(listing.city)}${listing.category ? `&category=${encodeURIComponent(listing.category)}` : ""}&type=${encodeURIComponent(listing.type)}`;

  // Pick a random ad once on mount (stable, no hydration mismatch since this is client-only)
  const ad = sidebarAds.length > 0 ? sidebarAds[Math.floor(Math.random() * sidebarAds.length)] : null;

  return (
    <>
      {/* ── Price card ── */}
      <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:16px_16px]" />
        <div className="relative">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Price</p>
          <p className="text-3xl font-extrabold text-foreground">
            {formatPrice(listing.price, listing.type)}
          </p>
          {listing.area && (
            <p className="text-xs text-muted-foreground mt-1">
              KES {Math.round(listing.price / listing.area).toLocaleString("en-KE")} / m²
            </p>
          )}

          {/* Market comparison panel */}
          {marketData && marketData.count >= 3 && marketData.medianPrice && (() => {
            const diff = (listing.price - marketData.medianPrice) / marketData.medianPrice * 100;
            const chip = diff < -5
              ? { label: `${Math.abs(diff).toFixed(0)}% below market`, cls: "bg-emerald-500/10 text-emerald-600" }
              : diff > 5
              ? { label: `${diff.toFixed(0)}% above market`, cls: "bg-rose-500/10 text-rose-600" }
              : { label: "Near market rate", cls: "bg-muted text-muted-foreground" };
            return (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Market · {listing.city}{listing.category ? ` · ${listing.category}` : ""}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Median</p>
                    <p className="text-xs font-bold text-foreground">{formatPrice(marketData.medianPrice, listing.type)}</p>
                  </div>
                  {marketData.avgM2 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground">Avg / m²</p>
                      <p className="text-xs font-bold text-foreground">KES {Math.round(marketData.avgM2).toLocaleString("en-KE")}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                    <p className="text-xs font-bold text-foreground">{marketData.count} listings</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chip.cls}`}>
                    {chip.label}
                  </span>
                  <Link href={marketUrl} className="text-[10px] font-semibold text-primary hover:underline underline-offset-2">
                    Full market data →
                  </Link>
                </div>
              </div>
            );
          })()}

          {owner?.phone && (
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`https://wa.me/${toWaPhone(owner.phone)}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="h-4 w-4" /> Send enquiry via WhatsApp
              </a>
              <a
                href={`tel:${owner.phone}`}
                className="w-full border border-border hover:border-primary/40 hover:bg-accent text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4 text-primary" /> Call
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Owner card ── */}
      {owner && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Listed by</p>
          <Link
            href={`/agencies/${owner.slug ?? toAgentSlug(owner.full_name)}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              {owner.avatar_url ? (
                <Image src={owner.avatar_url} alt={owner.full_name ?? ""} width={48} height={48} className="object-cover w-full h-full rounded-full" />
              ) : (
                <span className="text-primary font-bold">{ownerInitials}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{displayName(owner.full_name, owner.account_type)}</p>
              <p className="text-xs text-muted-foreground">{owner.account_type === "agencija" ? "Agency" : "Individual"}</p>
              {owner.verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary mt-0.5">
                  <Shield className="h-2.5 w-2.5" /> Verified
                </span>
              )}
            </div>
          </Link>
          {owner.phone && (
            <div className="flex flex-col gap-2 mb-2">
              <a
                href={`https://wa.me/${toWaPhone(owner.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-sm py-2 rounded-xl transition-all"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" /> Chat on WhatsApp
              </a>
              <a
                href={`tel:${owner.phone}`}
                className="w-full flex items-center justify-center gap-1.5 border border-border hover:border-primary/40 hover:bg-accent text-sm font-semibold py-2 rounded-xl transition-all"
              >
                <Phone className="h-3.5 w-3.5 text-primary" /> Call
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Message form ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Send a message</p>
        {!currentUserId ? (
          enquirySent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm">Enquiry sent!</p>
              <p className="text-xs text-muted-foreground mt-1">The owner will reply to your email.</p>
            </div>
          ) : (
            <form onSubmit={handleEnquiry} className="flex flex-col gap-3">
              <input
                type="text" placeholder="Your name *" value={enquiryName}
                onChange={(e) => setEnquiryName(e.target.value)} required
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              />
              <input
                type="email" placeholder="Your email *" value={enquiryEmail}
                onChange={(e) => setEnquiryEmail(e.target.value)} required
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              />
              <input
                type="tel" placeholder="Phone (optional)" value={enquiryPhone}
                onChange={(e) => setEnquiryPhone(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
              />
              <textarea
                placeholder="Your message *" value={enquiryMsg} rows={3} required
                onChange={(e) => setEnquiryMsg(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground resize-none"
                defaultValue={`I'm interested in this property: ${listing.title}. Please send me more information.`}
              />
              {enquiryError && <p className="text-xs text-destructive">{enquiryError}</p>}
              <button type="submit" disabled={enquirySending}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                {enquirySending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail className="h-4 w-4" /> Send enquiry</>}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                or{" "}
                <Link href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`} className="text-primary hover:underline underline-offset-2">sign in</Link>
                {" "}to message directly
              </p>
            </form>
          )
        ) : msgSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold text-foreground text-sm">Message sent!</p>
            <Link href="/dashboard/messages" className="text-xs text-primary hover:underline mt-2 inline-block">
              Open conversations →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
            <textarea
              name="message"
              placeholder="I'm interested in this listing…"
              rows={3}
              required
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground resize-none"
              defaultValue={`I'm interested in this property: ${listing.title}. Please send me more information.`}
            />
            <button
              type="submit"
              disabled={msgSending || owner?.id === currentUserId}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {msgSending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Send message
            </button>
          </form>
        )}
      </div>

      {/* ── Mortgage mini-calculator ── */}
      {listing.type === "For Sale" && (
        <MortgageWidget price={listing.price} />
      )}

      {/* ── Sidebar ad ── */}
      {ad ? (
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
          <div className="px-3 py-2 flex items-center justify-between bg-card">
            <p className="text-xs font-semibold text-foreground truncate">{ad.title}</p>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0 ml-2">Ad</span>
          </div>
        </a>
      ) : (
        <a
          href="/advertise"
          className="block rounded-2xl border border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-all group p-5 text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          </div>
          <p className="text-xs font-bold text-foreground mb-1">Your ad could be here</p>
          <p className="text-[11px] text-muted-foreground leading-snug mb-3">Reach buyers &amp; renters actively browsing property listings</p>
          <span className="inline-block text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Advertise from KES 1,000 →
          </span>
        </a>
      )}
    </>
  );
}
