import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { youthData } from "@/lib/content-data";

export function generateStaticParams() {
  return youthData.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = youthData.find((y) => y.slug === slug);
  if (!item) return {};
  const canonical = `https://rentnet.co.ke/youth/${slug}`;
  return {
    title: `${item.title} | Rentnet`,
    description: item.excerpt,
    alternates: { canonical },
    openGraph: {
      title: `${item.title} | Rentnet`,
      description: item.excerpt,
      url: canonical,
      type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | Rentnet`,
      description: item.excerpt,
    },
  };
}

export default async function YouthPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = youthData.find((y) => y.slug === slug);
  if (!item) notFound();

  const others = youthData.filter((y) => y.slug !== slug);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">

        <Link href="/youth" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Real Estate & Youth
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Users className="h-3.5 w-3.5" /> Real Estate & Youth
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">{item.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{item.excerpt}</p>
        </div>

        <div className="space-y-6">
          {item.sections.map((section, i) => (
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
          ))}
        </div>

        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-foreground mb-4">Also in Real Estate & Youth</h2>
            {others.map((y) => (
              <Link key={y.slug} href={`/youth/${y.slug}`} className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{y.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{y.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
