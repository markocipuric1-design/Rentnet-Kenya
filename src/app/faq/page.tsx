import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { HelpCircle, FileText, BookOpen, Newspaper, MapPin } from "lucide-react";
import { faqs } from "./faq-data";
import { FaqClient } from "./faq-client";

export const metadata: Metadata = {
  title: "Frequently Asked Questions – Rentnet Kenya",
  description: "Answers to common questions about searching, listing, renting, and buying property on Rentnet — Kenya's property platform covering all 47 counties.",
  alternates: { canonical: "https://rentnet.co.ke/faq" },
  openGraph: {
    title: "Frequently Asked Questions – Rentnet Kenya",
    description: "Answers to common questions about searching, listing, renting, and buying property on Rentnet.",
    url: "https://rentnet.co.ke/faq",
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> Help Centre
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know about using Rentnet. Can&apos;t find your answer?{" "}
            <Link href="/services/help" className="text-primary hover:underline">
              Contact us
            </Link>.
          </p>
        </div>

        {/* Interactive search + accordion */}
        <FaqClient />

        {/* Explore More */}
        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">Explore More</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/documents", Icon: FileText, label: "Document Library", description: "Free Kenya property document templates — lease, eviction notice, and more.", iconClass: "text-primary", bgClass: "bg-primary/10" },
              { href: "/advises", Icon: BookOpen, label: "Kenya Rental Guides", description: "Practical advice for landlords and tenants in the Kenyan property market.", iconClass: "text-violet-600", bgClass: "bg-violet-500/10" },
              { href: "/blog", Icon: Newspaper, label: "Property Blog", description: "Market trends, investment tips, and real estate news from across Kenya.", iconClass: "text-sky-600", bgClass: "bg-sky-500/10" },
              { href: "/listings", Icon: MapPin, label: "Search Listings", description: "Find apartments, houses, and commercial properties across all 47 counties.", iconClass: "text-emerald-600", bgClass: "bg-emerald-500/10" },
            ].map(({ href, Icon, label, description, iconClass, bgClass }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center mt-0.5`}>
                  <Icon className={`h-4 w-4 ${iconClass}`} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
