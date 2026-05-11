import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { advisesData } from "@/lib/content-data";
import { crossLinks } from "@/lib/cross-links";
import { ResourceCallout } from "@/components/ui/resource-callout";

export function generateStaticParams() {
  return advisesData.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = advisesData.find((a) => a.slug === slug);
  if (!item) return {};
  const canonical = `https://rentnet.co.ke/advises/${slug}`;
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      url: canonical,
      type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
    },
  };
}

export default async function AdvisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = advisesData.find((a) => a.slug === slug);
  if (!item) notFound();

  const others = advisesData.filter((a) => a.slug !== slug).slice(0, 3);
  const links = crossLinks[`advise:${slug}`];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://rentnet.co.ke/advises/${slug}`,
    "headline": item.title,
    "description": item.excerpt,
    "url": `https://rentnet.co.ke/advises/${slug}`,
    "image": "https://rentnet.co.ke/og-image.png",
    "articleSection": item.category,
    "inLanguage": "en-KE",
    "author": { "@type": "Organization", "name": "Rentnet", "@id": "https://rentnet.co.ke/#organization" },
    "publisher": { "@id": "https://rentnet.co.ke/#organization" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Back */}
        <Link href="/advises" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Rentnet Advises
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {item.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {item.readTime} min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4">
            {item.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{item.excerpt}</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
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

        {/* Related */}
        {others.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">More from Rentnet Advises</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((a) => (
                <Link key={a.slug} href={`/advises/${a.slug}`} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group">
                  <span className="text-xs font-bold text-primary">{a.category}</span>
                  <h3 className="font-semibold text-foreground mt-1.5 text-sm leading-snug group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.excerpt}</p>
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
