import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { documentsData } from "@/lib/content-data";
import { documentFaqs } from "@/lib/document-faqs";
import { createClient } from "@/lib/supabase/server";
import { DownloadButton } from "./download-button";
import { FaqSection } from "./faq-section";
import { crossLinks } from "@/lib/cross-links";
import { ResourceCallout } from "@/components/ui/resource-callout";

export function generateStaticParams() {
  return documentsData.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = documentsData.find((d) => d.slug === slug);
  if (!item) return {};
  const description = item.seoDescription ?? item.excerpt;
  const canonical = `https://rentnet.co.ke/documents/${slug}`;
  return {
    title: `${item.title} – Free Template Kenya | Rentnet`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${item.title} – Free Template Kenya | Rentnet`,
      description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${item.title} – Free Template Kenya | Rentnet`,
      description,
    },
  };
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = documentsData.find((d) => d.slug === slug);
  if (!item) notFound();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  const related = documentsData
    .filter((d) => d.slug !== slug && d.category === item.category)
    .slice(0, 3);

  const others = related.length >= 2
    ? related
    : [
        ...related,
        ...documentsData.filter((d) => d.slug !== slug && d.category !== item.category),
      ].slice(0, 3);

  const faqs = documentFaqs[slug] ?? [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": item.seoDescription ?? item.excerpt,
    "url": `https://rentnet.co.ke/documents/${slug}`,
    "publisher": {
      "@type": "Organization",
      "@id": "https://rentnet.co.ke/#organization",
      "name": "Rentnet",
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://rentnet.co.ke/documents/${slug}` },
    "keywords": ["Kenya", "property", "template", item.title],
  };

  const faqJsonLd = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Print-only header */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-300">
        <p className="text-xs text-gray-400 mb-1">rentnet.co.ke — Document Library</p>
        <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{item.excerpt}</p>
      </div>

      <div className="print:hidden"><Navbar /></div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 print:py-0 print:max-w-none print:px-0">

        {/* Back link — hidden when printing */}
        <Link href="/documents" className="print:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Document Library
        </Link>

        {/* Breadcrumb — hidden when printing */}
        <nav aria-label="breadcrumb" className="print:hidden flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/documents" className="hover:text-primary transition-colors">Document Library</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{item.title}</span>
        </nav>

        {/* Header */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <FileText className="h-3.5 w-3.5" /> Document Template
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">{item.title}</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{item.excerpt}</p>
          </div>
          <DownloadButton isLoggedIn={isLoggedIn} label={item.downloadLabel} />
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {item.sections.map((section, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 sm:p-8 print:border-none print:rounded-none print:p-0 print:mb-6">
              {section.heading && (
                <h2 className="text-xl font-bold text-foreground mb-3 print:text-lg print:text-gray-900">{section.heading}</h2>
              )}
              <p className="text-muted-foreground leading-relaxed print:text-gray-700">{section.body}</p>
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground print:text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2 print:bg-gray-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Download CTA — hidden when printing */}
        <div className="print:hidden mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Ready to use this template?</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoggedIn
                ? "Save or print the document using your browser's PDF export."
                : "Create a free account to save and print this template."}
            </p>
          </div>
          <DownloadButton
            isLoggedIn={isLoggedIn}
            label="Download Template"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex-shrink-0"
          />
        </div>

        {/* FAQ section — hidden when printing */}
        {faqs.length > 0 && (
          <div className="print:hidden">
            <FaqSection faqs={faqs} title={item.title} />
          </div>
        )}

        {/* Cross-section resources — hidden when printing */}
        {crossLinks[`document:${slug}`] && (
          <div className="print:hidden">
            <ResourceCallout
              links={crossLinks[`document:${slug}`]}
              title="Related Services & Guides"
            />
          </div>
        )}

        {/* Related documents — hidden when printing */}
        {others.length > 0 && (
          <div className="print:hidden mt-14">
            <h2 className="text-lg font-bold text-foreground mb-5">
              {related.length > 0 ? "Related Documents" : "Other Documents"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map((d) => (
                <Link
                  key={d.slug}
                  href={`/documents/${d.slug}`}
                  className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{d.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
