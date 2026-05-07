import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { servicesData } from "@/lib/content-data";
import { crossLinks } from "@/lib/cross-links";
import { ResourceCallout } from "@/components/ui/resource-callout";

export function generateStaticParams() {
  return servicesData.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = servicesData.find((s) => s.slug === slug);
  if (!item) return {};
  const canonical = `https://rentnet.co.ke/services/${slug}`;
  return {
    title: `${item.title} | Rentnet Services`,
    description: item.excerpt,
    alternates: { canonical },
    openGraph: {
      title: `${item.title} | Rentnet Services`,
      description: item.excerpt,
      url: canonical,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Rentnet Services`,
      description: item.excerpt,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = servicesData.find((s) => s.slug === slug);
  if (!item) notFound();

  const others = servicesData.filter((s) => s.slug !== slug).slice(0, 3);
  const links = crossLinks[`service:${slug}`];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://rentnet.co.ke/services/${slug}`,
    "name": item.title,
    "description": item.excerpt,
    "url": `https://rentnet.co.ke/services/${slug}`,
    "provider": { "@type": "Organization", "name": "Rentnet", "@id": "https://rentnet.co.ke/#organization" },
    "areaServed": { "@type": "Country", "name": "Kenya" },
    "serviceType": item.title,
    "inLanguage": "en-KE",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">

        <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to RentNet Services
        </Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,oklch(0.52_0.27_293/0.06)_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Zap className="h-3.5 w-3.5" /> RentNet Services
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">{item.title}</h1>
            <p className="text-primary font-semibold mb-3">{item.tagline}</p>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{item.excerpt}</p>
            {item.cta && (
              <Link
                href={item.cta.href}
                className="mt-6 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
              >
                {item.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {item.sections.map((section, i) => (
            <>
              <div key={i} className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                {section.heading && (
                  <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
                )}
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {i === 0 && links && <ResourceCallout links={links} />}
            </>
          ))}
        </div>

        {/* Other services */}
        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-bold text-foreground mb-5">Other Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group">
                  <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
