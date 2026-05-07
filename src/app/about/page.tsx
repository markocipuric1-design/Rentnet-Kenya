import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import {
  Phone, Mail, MapPin, Search, Users, FileText,
  CheckCircle, ArrowRight, Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Rentnet – Kenya's Property Platform",
  description: "Rentnet connects landlords, buyers, and renters with verified property listings across all 47 counties in Kenya. Meet our team and learn how we work.",
  alternates: { canonical: "https://rentnet.co.ke/about" },
  openGraph: {
    title: "About Rentnet – Kenya's Property Platform",
    description: "Rentnet connects landlords, buyers, and renters with verified property listings across all 47 counties in Kenya.",
    url: "https://rentnet.co.ke/about",
    type: "website",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://rentnet.co.ke/#organization",
  "name": "Rentnet",
  "url": "https://rentnet.co.ke",
  "logo": "https://rentnet.co.ke/logo.png",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+254797233276",
      "contactType": "customer support",
      "areaServed": "KE",
      "availableLanguage": ["English", "Swahili"],
    },
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KE",
    "addressRegion": "Nairobi",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">About</span>
        </nav>

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Building2 className="h-3.5 w-3.5" /> About Rentnet
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-5">
            Kenya&apos;s Property Platform,<br className="hidden sm:block" /> Built for Kenyans
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Rentnet is Kenya&apos;s real estate platform connecting landlords, buyers, and renters with{" "}
            <Link href="/listings" className="text-primary hover:underline">verified property listings</Link>{" "}
            across all 47 counties. We believe finding or listing a property should be straightforward, transparent, and free of hidden friction. Whether you are searching for your next home or{" "}
            <Link href="/agents" className="text-primary hover:underline">working with a professional agent</Link>,{" "}
            Rentnet is built to make that easier.
          </p>
        </div>

        {/* What we do — bento */}
        <section className="mb-14">
          <h2 className="text-lg font-extrabold text-foreground mb-5">What We Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/listings" className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </span>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Property Listings</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Browse thousands of verified apartments, houses, and commercial spaces for sale and rent across Kenya.</p>
              </div>
            </Link>
            <Link href="/agents" className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Certified Agents</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Connect with vetted, Rentnet-certified real estate agents and agencies in your area.</p>
              </div>
            </Link>
            <Link href="/documents" className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600" />
              </span>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Document Library</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Free Kenya-specific property templates — lease agreements, eviction notices, move-in checklists, and more.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Why Rentnet */}
        <section className="mb-14">
          <h2 className="text-lg font-extrabold text-foreground mb-5">Why Rentnet</h2>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "Verified listings reviewed before going live",
                "Coverage across all 47 counties in Kenya",
                "Free to search and browse — no account needed",
                "Trusted by certified agents and agencies",
                "Kenya-specific legal templates and guides",
                "M-PESA supported for all payments",
                "Direct WhatsApp contact from every listing",
                "Professional valuation and legal services",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-14">
          <h2 className="text-lg font-extrabold text-foreground mb-5">Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="tel:+254797233276"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Phone</p>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">+254 797 233 276</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mon – Fri, 8 am – 6 pm EAT</p>
              </div>
            </a>
            <a
              href="mailto:info@rentnet.co.ke"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-emerald-600" />
              </span>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Email</p>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">info@rentnet.co.ke</p>
                <p className="text-xs text-muted-foreground mt-0.5">We respond within one business day</p>
              </div>
            </a>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <span className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-sky-600" />
            </span>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Location</p>
              <p className="font-semibold text-foreground">Nairobi, Kenya</p>
              <p className="text-xs text-muted-foreground mt-0.5">Serving property seekers and owners across all 47 counties</p>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Ready to get started?</h2>
            <p className="text-sm text-muted-foreground mt-1">Post a listing for free or connect with a certified agent today.</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Link
              href="/post-listing"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
            >
              Post a Listing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 border border-border bg-card hover:bg-accent text-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Find an Agent
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
