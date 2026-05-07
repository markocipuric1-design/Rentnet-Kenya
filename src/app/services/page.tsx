import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { servicesData } from "@/lib/content-data";

export const metadata: Metadata = {
  title: "Real Estate Services in Kenya | Rentnet",
  description: "Legal consultation, property valuation, document preparation, and more — professional real estate services in Kenya.",
  alternates: { canonical: "https://rentnet.co.ke/services" },
  openGraph: {
    title: "Real Estate Services in Kenya | Rentnet",
    description: "Legal consultation, property valuation, document preparation, and more — professional real estate services in Kenya.",
    url: "https://rentnet.co.ke/services",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Real Estate Services Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Services in Kenya | Rentnet",
    description: "Legal consultation, property valuation, document preparation, and more — professional real estate services in Kenya.",
  },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rentnet.co.ke/services",
  "name": "Real Estate Services in Kenya",
  "description": "Legal consultation, property valuation, document preparation, and more — professional real estate services in Kenya.",
  "url": "https://rentnet.co.ke/services",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
  "hasPart": servicesData.map((item) => ({
    "@type": "Service",
    "name": item.title,
    "url": `https://rentnet.co.ke/services/${item.slug}`,
    "description": item.excerpt,
    "provider": { "@id": "https://rentnet.co.ke/#organization" },
  })),
};

export default function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }} />
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Zap className="h-3.5 w-3.5" /> RentNet Services
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Professional Property Services
          </h1>
          <p className="text-muted-foreground max-w-xl">
            From legal advice to valuations and document preparation — expert services for every stage of your property journey in Kenya.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesData.map((item) => (
            <Link
              key={item.slug}
              href={`/services/${item.slug}`}
              className="flex flex-col bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all group"
            >
              <h2 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors mb-2">
                {item.title}
              </h2>
              <p className="text-xs text-primary font-semibold mb-2">{item.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                {item.excerpt}
              </p>
              <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-4 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
