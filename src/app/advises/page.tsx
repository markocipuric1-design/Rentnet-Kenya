import type { Metadata } from "next";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { advisesData } from "@/lib/content-data";

export const metadata: Metadata = {
  title: "Kenya Rental Guides & Property Advice | Rentnet",
  description: "Expert guides and tips for landlords and tenants in Kenya — renting, tenancy law, property care and more.",
  alternates: { canonical: "https://rentnet.co.ke/advises" },
  openGraph: {
    title: "Kenya Rental Guides & Property Advice | Rentnet",
    description: "Expert guides and tips for landlords and tenants in Kenya — renting, tenancy law, property care and more.",
    url: "https://rentnet.co.ke/advises",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rentnet Kenya Rental Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya Rental Guides & Property Advice | Rentnet",
    description: "Expert guides and tips for landlords and tenants in Kenya — renting, tenancy law, property care and more.",
  },
};

const advisesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://rentnet.co.ke/advises",
  "name": "Kenya Rental Guides & Property Advice",
  "description": "Expert guides and tips for landlords and tenants in Kenya — renting, tenancy law, property care and more.",
  "url": "https://rentnet.co.ke/advises",
  "publisher": { "@id": "https://rentnet.co.ke/#organization" },
  "hasPart": advisesData.map((item) => ({
    "@type": "Article",
    "name": item.title,
    "url": `https://rentnet.co.ke/advises/${item.slug}`,
    "description": item.excerpt,
  })),
};

export default function AdvisesIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advisesJsonLd) }} />
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Rentnet Advises
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Property Guides & Tips
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Practical, Kenya-specific advice for landlords and tenants — from screening tenants to understanding your legal rights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advisesData.map((item) => (
            <Link
              key={item.slug}
              href={`/advises/${item.slug}`}
              className="flex flex-col bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all group"
            >
              <span className="text-xs font-bold text-primary mb-2">{item.category}</span>
              <h2 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                {item.excerpt}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
                <Clock className="h-3.5 w-3.5" /> {item.readTime} min read
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
