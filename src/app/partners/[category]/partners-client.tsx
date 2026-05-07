"use client";

import { useState, useEffect, memo } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, Plus, CheckCircle, ArrowRight, Percent, Clock, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import dynamic from "next/dynamic";
const PartnerRegistrationForm = dynamic(() => import("@/components/ui/partner-registration-form").then((m) => ({ default: m.PartnerRegistrationForm })));
import { partnerCategoriesData } from "@/lib/content-data";
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

type Partner = {
  id: string;
  slug: string | null;
  company_name: string;
  contact_name: string;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  subcategory: string | null;
  metadata: BankMeta | null;
};

function getLogoUrl(website: string | null): string | null {
  if (!website) return null;
  try {
    const hostname = new URL(website).hostname.replace(/^www\./, "");
    return `https://logo.clearbit.com/${hostname}`;
  } catch { return null; }
}

function PartnerLogo({ website, name, size = "sm" }: { website: string | null; name: string; size?: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getLogoUrl(website);
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const iconSize = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const imgSize = size === "lg" ? "w-10 h-10" : "w-6 h-6";

  return (
    <div className={`${dim} rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {logoUrl && !failed ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className={`${imgSize} object-contain`}
          onError={() => setFailed(true)}
        />
      ) : (
        <Building2 className={`${iconSize} text-primary`} />
      )}
    </div>
  );
}

const PartnerCard = memo(function PartnerCard({ partner, categorySlug }: { partner: Partner; categorySlug: string }) {
  return (
    <Link
      href={`/partners/${categorySlug}/${partner.slug ?? `${generateListingSlug(partner.company_name)}-${partner.id.replace(/-/g, "")}`}`}
      className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <PartnerLogo website={partner.website} name={partner.company_name} />
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <CheckCircle className="h-2.5 w-2.5" /> Verified
        </span>
      </div>

      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-0.5">{partner.company_name}</h3>
      {partner.subcategory && (
        <span className="text-xs font-semibold text-primary">{partner.subcategory}</span>
      )}

      {partner.metadata?.tagline && (
        <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">{partner.metadata.tagline}</p>
      )}

      {partner.metadata?.interest_rate_from && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-semibold bg-primary/8 text-primary px-2 py-1 rounded-lg">
            <Percent className="h-3 w-3" /> {partner.metadata.interest_rate_from}–{partner.metadata.interest_rate_to}%
          </span>
          {partner.metadata.max_tenure_years && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
              <Clock className="h-3 w-3" /> Up to {partner.metadata.max_tenure_years} yrs
            </span>
          )}
          {partner.metadata.min_deposit_pct && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
              <TrendingUp className="h-3 w-3" /> {partner.metadata.min_deposit_pct}% deposit
            </span>
          )}
        </div>
      )}

      {!partner.metadata?.interest_rate_from && partner.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">{partner.description}</p>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          {partner.city}
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
});

export function PartnerDirectoryClient() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.category as string;
  const category = partnerCategoriesData.find((c) => c.slug === categorySlug);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [featuredAds, setFeaturedAds] = useState<{ id: string; title: string; image_url: string; link_url: string }[]>([]);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));
  }, []);

  useEffect(() => {
    if (!category) return;
    const supabase = createClient();
    Promise.all([
      supabase
        .from("partners")
        .select("id, slug, company_name, contact_name, phone, website, city, description, subcategory, metadata")
        .eq("category", categorySlug)
        .eq("verified", true)
        .order("company_name"),
      supabase
        .from("advertisements")
        .select("id, title, image_url, link_url")
        .eq("placement", "featured-partner")
        .eq("active", true)
        .or(`category.eq.${categorySlug},category.is.null`)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
    ]).then(([{ data: partnerData }, { data: adsData }]) => {
      setPartners(partnerData ?? []);
      setFeaturedAds(adsData ?? []);
      setLoading(false);
    });
  }, [categorySlug, category]);

  if (!category) return notFound();

  const filtered = activeSubcategory
    ? partners.filter((p) => p.subcategory === activeSubcategory)
    : partners;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Building2 className="h-3.5 w-3.5" /> Partner Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">{category.title}</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{category.longDescription}</p>
          </div>
          <button
            onClick={() => authed ? setShowForm(true) : router.push(`/login?redirect=/partners/${categorySlug}`)}
            className="flex-shrink-0 flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Register as Partner
          </button>
        </div>

        {/* Subcategory filters */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveSubcategory(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                activeSubcategory === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              All
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                  activeSubcategory === sub
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Featured partner ads */}
        {!loading && featuredAds.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[...featuredAds].sort(() => Math.random() - 0.5).slice(0, 2).map((ad) => (
              <a
                key={ad.id}
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group relative flex flex-col bg-card border-2 border-amber-400/40 hover:border-amber-400/80 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
              >
                <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  Featured
                </span>
                <div className="h-32 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-foreground text-sm group-hover:text-amber-600 transition-colors">{ad.title}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Partners grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground mb-2">No partners listed yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              {activeSubcategory
                ? `No verified ${activeSubcategory} partners yet.`
                : "Be the first to register in this category."}
            </p>
            <button
              onClick={() => authed ? setShowForm(true) : router.push(`/login?redirect=/partners/${categorySlug}`)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <Plus className="h-4 w-4" /> Register Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} categorySlug={categorySlug} />
            ))}
          </div>
        )}

        {/* CTA banner */}
        {!loading && filtered.length > 0 && (
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Are you a {category.title.toLowerCase()} in Kenya?</p>
              <p className="text-sm text-muted-foreground mt-1">Register your business and get listed in this directory for free.</p>
            </div>
            <button
              onClick={() => authed ? setShowForm(true) : router.push(`/login?redirect=/partners/${categorySlug}`)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex-shrink-0"
            >
              <Plus className="h-4 w-4" /> Register Now
            </button>
          </div>
        )}

      </main>
      <Footer />

      {showForm && (
        <PartnerRegistrationForm
          category={categorySlug}
          subcategories={category.subcategories}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
