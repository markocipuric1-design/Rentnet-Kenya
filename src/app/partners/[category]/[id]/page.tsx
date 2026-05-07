"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import type { ExistingPartner } from "@/components/ui/partner-registration-form";
const PartnerRegistrationForm = dynamic(() => import("@/components/ui/partner-registration-form").then((m) => ({ default: m.PartnerRegistrationForm })));
import { slugToAgentId } from "@/lib/utils";
import {
  ArrowLeft, Building2, Phone, Globe, MapPin, CheckCircle,
  Mail, Percent, Clock, TrendingUp, ShieldCheck, Users,
  Banknote, BadgeCheck, Tag, Pencil, Calculator, AtSign,
  Armchair, FileDown, Truck,
} from "lucide-react";

function getLogoUrl(website: string | null): string | null {
  if (!website) return null;
  try {
    const hostname = new URL(website).hostname.replace(/^www\./, "");
    return `https://logo.clearbit.com/${hostname}`;
  } catch { return null; }
}

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

type Partner = {
  id: string;
  category: string;
  subcategory: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  verified: boolean;
  logo_url: string | null;
  promo_banner_url: string | null;
  user_id: string | null;
  metadata: BankMeta | InsuranceMeta | FurnitureMeta | null;
};

function PartnerLogo({ logoUrl, website, name }: { logoUrl: string | null; website: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl ?? getLogoUrl(website);
  return (
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
      {src && !failed ? (
        <img src={src} alt={`${name} logo`} className="w-12 h-12 object-contain p-1" onError={() => setFailed(true)} />
      ) : (
        <Building2 className="h-7 w-7 text-primary" />
      )}
    </div>
  );
}

function formatLoanAmount(amount: string) {
  const n = parseInt(amount);
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
  return `KES ${n}`;
}

function LoanCalculator({ meta }: { meta: BankMeta }) {
  const defaultRate = meta.interest_rate_from ? parseFloat(meta.interest_rate_from) : 12;
  const maxTenure = meta.max_tenure_years ? parseInt(meta.max_tenure_years) : 25;
  const defaultDeposit = meta.min_deposit_pct ? parseFloat(meta.min_deposit_pct) : 20;

  const [price, setPrice] = useState("");
  const [rate, setRate] = useState(defaultRate);
  const [tenure, setTenure] = useState(Math.min(maxTenure, 20));
  const [depositPct, setDepositPct] = useState(defaultDeposit);

  const priceNum = parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  const depositAmt = priceNum * (depositPct / 100);
  const principal = priceNum - depositAmt;
  const r = rate / 100 / 12;
  const n = tenure * 12;
  const monthly =
    principal > 0 && r > 0 && n > 0
      ? (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
      : 0;
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - principal;

  const fmtKES = (v: number) =>
    v > 0 ? "KES " + v.toLocaleString("en-KE", { maximumFractionDigits: 0 }) : "—";

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-6">
      <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" /> Mortgage Calculator
      </h2>

      {/* Property price */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
          Property Price (KES)
        </label>
        <input
          type="number"
          placeholder="e.g. 8000000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-base font-semibold outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground placeholder:font-normal"
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interest Rate</label>
            <span className="text-xs font-bold text-primary">{rate}% p.a.</span>
          </div>
          <input type="range" min={1} max={30} step={0.5} value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1%</span><span>30%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tenure</label>
            <span className="text-xs font-bold text-primary">{tenure} yrs</span>
          </div>
          <input type="range" min={1} max={maxTenure} step={1} value={tenure}
            onChange={(e) => setTenure(parseInt(e.target.value))}
            className="w-full accent-primary cursor-pointer" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1 yr</span><span>{maxTenure} yrs</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deposit</label>
            <span className="text-xs font-bold text-primary">{depositPct}%</span>
          </div>
          <input type="range" min={0} max={90} step={1} value={depositPct}
            onChange={(e) => setDepositPct(parseInt(e.target.value))}
            className="w-full accent-primary cursor-pointer" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span><span>90%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 rounded-2xl p-4">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Loan Amount</p>
          <p className="text-sm font-extrabold text-foreground">{fmtKES(principal)}</p>
        </div>
        <div className="text-center bg-primary/5 border border-primary/20 rounded-xl py-2 px-1">
          <p className="text-[10px] text-primary font-medium uppercase tracking-wide mb-1">Monthly Payment</p>
          <p className="text-sm font-extrabold text-primary">{fmtKES(monthly)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Repayment</p>
          <p className="text-sm font-extrabold text-foreground">{fmtKES(totalPaid)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Interest</p>
          <p className="text-sm font-extrabold text-foreground">{fmtKES(totalInterest)}</p>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const { resolvedId, isCleanSlug } = useMemo(() => {
    const extracted = slugToAgentId(id);
    return { resolvedId: extracted ?? id, isCleanSlug: !extracted };
  }, [id]);

  const fetchPartner = () => {
    const supabase = createClient();
    const query = supabase
      .from("partners")
      .select("id, category, subcategory, company_name, contact_name, email, phone, website, city, description, verified, logo_url, promo_banner_url, user_id, metadata")
      .eq("verified", true);
    (isCleanSlug
      ? query.eq("category", category).eq("slug", id)
      : query.eq("id", resolvedId)
    ).single().then(({ data, error }) => {
      if (error || !data) { router.replace(`/partners/${category}`); return; }
      setPartner(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!id) return;
    fetchPartner();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, [id]);

  const handleEditClose = () => {
    setShowEdit(false);
    setLoading(true);
    fetchPartner();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
          <div className="h-6 bg-muted rounded-full w-32 mb-8 animate-pulse" />
          <div className="h-10 bg-muted rounded-full w-2/3 mb-4 animate-pulse" />
          <div className="h-4 bg-muted rounded-full w-full mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!partner) return null;

  const meta = partner.metadata;
  const isBank = partner.category === "bank";
  const isInsurance = partner.category === "insurance";
  const isFurniture = partner.category === "furniture";
  const bankMeta = isBank ? (meta as BankMeta | null) : null;
  const insuranceMeta = isInsurance ? (meta as InsuranceMeta | null) : null;
  const furnitureMeta = isFurniture ? (meta as FurnitureMeta | null) : null;
  const canEdit = !!currentUserId && currentUserId === partner.user_id;

  const existingForEdit: ExistingPartner = {
    id: partner.id,
    subcategory: partner.subcategory,
    company_name: partner.company_name,
    contact_name: partner.contact_name,
    email: partner.email,
    phone: partner.phone,
    website: partner.website,
    city: partner.city,
    description: partner.description,
    logo_url: partner.logo_url,
    promo_banner_url: partner.promo_banner_url,
    metadata: partner.metadata,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Back */}
        <Link href={`/partners/${category}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>

        {/* Header card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <PartnerLogo logoUrl={partner.logo_url} website={partner.website} name={partner.company_name} />
            <div className="flex flex-wrap gap-2 items-center">
              {partner.verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {bankMeta?.kba_member && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5" /> KBA Member
                </span>
              )}
              {insuranceMeta?.aki_member && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="h-3.5 w-3.5" /> AKI Member
                </span>
              )}
              {canEdit && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted hover:bg-accent hover:text-foreground border border-border px-3 py-1.5 rounded-full transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit profile
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">{partner.company_name}</h1>
          {partner.subcategory && (
            <span className="inline-block text-sm font-semibold text-primary mb-3">{partner.subcategory}</span>
          )}
          {(bankMeta?.tagline ?? insuranceMeta?.tagline ?? furnitureMeta?.tagline) && (
            <p className="text-base text-muted-foreground italic border-l-4 border-primary/30 pl-4 mb-4">{bankMeta?.tagline ?? insuranceMeta?.tagline ?? furnitureMeta?.tagline}</p>
          )}
          {partner.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
          )}
        </div>

        {/* Bank mortgage highlights */}
        {bankMeta && (bankMeta.interest_rate_from || bankMeta.max_loan_amount || bankMeta.max_tenure_years || bankMeta.min_deposit_pct) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {bankMeta.interest_rate_from && (
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                <Percent className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{bankMeta.interest_rate_from}–{bankMeta.interest_rate_to}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Interest rate p.a.</p>
              </div>
            )}
            {bankMeta.max_loan_amount && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Banknote className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{formatLoanAmount(bankMeta.max_loan_amount)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Max loan amount</p>
              </div>
            )}
            {bankMeta.max_tenure_years && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{bankMeta.max_tenure_years} yrs</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Max repayment</p>
              </div>
            )}
            {bankMeta.min_deposit_pct && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{bankMeta.min_deposit_pct}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Min. deposit</p>
              </div>
            )}
          </div>
        )}

        {/* Insurance highlights */}
        {insuranceMeta && (insuranceMeta.premium_from || insuranceMeta.sum_insured_up_to || insuranceMeta.claim_settlement_days) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {insuranceMeta.premium_from && (
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                <Banknote className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">From KES {parseInt(insuranceMeta.premium_from).toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Annual premium</p>
              </div>
            )}
            {insuranceMeta.sum_insured_up_to && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <ShieldCheck className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{formatLoanAmount(insuranceMeta.sum_insured_up_to)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Sum insured</p>
              </div>
            )}
            {insuranceMeta.claim_settlement_days && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-extrabold text-foreground">{insuranceMeta.claim_settlement_days} days</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Claim settlement</p>
              </div>
            )}
          </div>
        )}

        {/* Furniture highlights */}
        {furnitureMeta && (furnitureMeta.business_type || furnitureMeta.price_range || furnitureMeta.lead_time_weeks) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {furnitureMeta.business_type && (
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                <Armchair className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-sm font-extrabold text-foreground">{furnitureMeta.business_type}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Business type</p>
              </div>
            )}
            {furnitureMeta.price_range && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Tag className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-sm font-extrabold text-foreground">{furnitureMeta.price_range}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Price range</p>
              </div>
            )}
            {furnitureMeta.lead_time_weeks && (
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Truck className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-sm font-extrabold text-foreground">{furnitureMeta.lead_time_weeks}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Lead time</p>
              </div>
            )}
          </div>
        )}

        {/* Loan Calculator */}
        {bankMeta && (bankMeta.interest_rate_from || bankMeta.max_tenure_years) && (
          <LoanCalculator meta={bankMeta} />
        )}

        {/* Promo banner */}
        {partner.promo_banner_url && (
          <div className="rounded-2xl overflow-hidden mb-6 border border-border">
            <img src={partner.promo_banner_url} alt="Promotional banner" className="w-full object-cover max-h-48" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Contact */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground font-medium">{partner.contact_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{partner.city}</span>
              </div>
              {partner.email && (
                <a href={`mailto:${partner.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 flex-shrink-0" /> {partner.email}
                </a>
              )}
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0" /> {partner.phone}
                </a>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="h-4 w-4 flex-shrink-0" /> {partner.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          {/* Bank — Regulatory */}
          {bankMeta?.cbk_licence && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Regulatory
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground text-xs font-medium w-28 flex-shrink-0">CBK Licence</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg text-foreground">{bankMeta.cbk_licence}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground text-xs font-medium w-28 flex-shrink-0">KBA Member</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${bankMeta.kba_member ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {bankMeta.kba_member ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bank — Services */}
          {bankMeta?.services && bankMeta.services.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {bankMeta.services.map((s) => (
                  <span key={s} className="text-xs font-semibold bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/15">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bank — Regions */}
          {bankMeta?.regions && bankMeta.regions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Regions Served
              </h2>
              <div className="flex flex-wrap gap-2">
                {bankMeta.regions.map((r) => (
                  <span key={r} className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Insurance — Regulatory */}
          {insuranceMeta?.ira_licence && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Regulatory
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground text-xs font-medium w-28 flex-shrink-0">IRA Licence</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg text-foreground">{insuranceMeta.ira_licence}</span>
                </div>
                {insuranceMeta.insurer_type && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground text-xs font-medium w-28 flex-shrink-0">Type</span>
                    <span className="text-xs font-semibold bg-primary/8 text-primary px-2 py-1 rounded-lg">{insuranceMeta.insurer_type}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground text-xs font-medium w-28 flex-shrink-0">AKI Member</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${insuranceMeta.aki_member ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {insuranceMeta.aki_member ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Insurance — Policy types */}
          {insuranceMeta?.policy_types && insuranceMeta.policy_types.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Policy Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {insuranceMeta.policy_types.map((p) => (
                  <span key={p} className="text-xs font-semibold bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/15">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Insurance — Regions */}
          {insuranceMeta?.regions && insuranceMeta.regions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Regions Served
              </h2>
              <div className="flex flex-wrap gap-2">
                {insuranceMeta.regions.map((r) => (
                  <span key={r} className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Furniture — Product categories */}
          {furnitureMeta?.product_categories && furnitureMeta.product_categories.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Armchair className="h-4 w-4 text-primary" /> Product Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {furnitureMeta.product_categories.map((p) => (
                  <span key={p} className="text-xs font-semibold bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/15">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Furniture — Services */}
          {furnitureMeta?.services && furnitureMeta.services.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Services Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {furnitureMeta.services.map((s) => (
                  <span key={s} className="text-xs font-semibold bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/15">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Furniture — Regions */}
          {furnitureMeta?.regions && furnitureMeta.regions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Regions Served
              </h2>
              <div className="flex flex-wrap gap-2">
                {furnitureMeta.regions.map((r) => (
                  <span key={r} className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Furniture — Instagram + Catalogue */}
          {(furnitureMeta?.social_instagram || furnitureMeta?.catalog_url) && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Links
              </h2>
              <div className="space-y-3">
                {furnitureMeta.social_instagram && (
                  <a href={furnitureMeta.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <AtSign className="h-4 w-4 flex-shrink-0" />
                    {furnitureMeta.social_instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")}
                  </a>
                )}
                {furnitureMeta.catalog_url && (
                  <a href={furnitureMeta.catalog_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileDown className="h-4 w-4 flex-shrink-0" /> Download Product Catalogue
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {isInsurance ? (
              <>
                <p className="font-semibold text-foreground">Get a personalised quote from {partner.company_name}</p>
                <p className="text-sm text-muted-foreground mt-1">Contact their team directly for a tailored property insurance quote.</p>
              </>
            ) : isFurniture ? (
              <>
                <p className="font-semibold text-foreground">Furnish your space with {partner.company_name}</p>
                <p className="text-sm text-muted-foreground mt-1">Get in touch to discuss your project, request a quote, or book a consultation.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground">Interested in working with {partner.company_name}?</p>
                <p className="text-sm text-muted-foreground mt-1">Contact their team directly to discuss your requirements.</p>
              </>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0 flex-wrap">
            {isInsurance && partner.email && (
              <a
                href={`mailto:${partner.email}?subject=Property Insurance Quote Request&body=Hi, I would like to request a quote for property insurance.`}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                <Mail className="h-4 w-4" /> Get Quote
              </a>
            )}
            {partner.phone && (
              <a href={`tel:${partner.phone}`} className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all ${isInsurance ? "border border-border hover:border-primary/40 hover:bg-accent text-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
                <Phone className="h-4 w-4" /> Call
              </a>
            )}
            {partner.website && (
              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>

      </main>

      <Footer />

      {showEdit && (
        <PartnerRegistrationForm
          category={partner.category}
          subcategories={partner.subcategory ? [partner.subcategory] : undefined}
          onClose={handleEditClose}
          mode="edit"
          existingPartner={existingForEdit}
        />
      )}
    </div>
  );
}
