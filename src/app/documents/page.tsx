import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download, ScrollText, ClipboardList, Bell, BookOpen } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { documentsData, type DocumentItem } from "@/lib/content-data";

export const metadata: Metadata = {
  title: "Document Library – Free Kenya Property Templates | Rentnet",
  description: "Free downloadable property document templates for Kenya — lease agreements, tenancy agreements, eviction notices, move-in checklists, inventory forms and more.",
  alternates: { canonical: "https://rentnet.co.ke/documents" },
  openGraph: {
    title: "Kenya Property Document Library – Free Templates | Rentnet",
    description: "Download free lease agreements, tenancy agreements, eviction notices, move-in checklists, and more. All templates are Kenya-specific and ready to use.",
    url: "https://rentnet.co.ke/documents",
    type: "website",
  },
};

const CATEGORY_CONFIG = {
  agreement: {
    label: "Agreements & Contracts",
    description: "Legally sound templates for landlords, tenants, and agents.",
    icon: ScrollText,
    color: "text-primary bg-primary/10",
  },
  inspection: {
    label: "Checklists & Inspection Forms",
    description: "Document property condition at move-in, move-out, and handover.",
    icon: ClipboardList,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  notice: {
    label: "Notices",
    description: "Formal notices required by Kenyan tenancy law.",
    icon: Bell,
    color: "text-amber-600 bg-amber-500/10",
  },
  guide: {
    label: "Landlord Guides",
    description: "Practical guides for preparing and marketing your property.",
    icon: BookOpen,
    color: "text-violet-600 bg-violet-500/10",
  },
} as const;

const CATEGORY_ORDER: DocumentItem["category"][] = ["agreement", "inspection", "notice", "guide"];

export default function DocumentLibraryPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: documentsData.filter((d) => d.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <FileText className="h-3.5 w-3.5" /> Document Library
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
            Kenya Property Document Templates
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Free, Kenya-specific legal templates for landlords, tenants, and property managers.
            Download, fill in your details, and use immediately — no registration required.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-12">
          {grouped.map(({ cat, items }) => {
            const cfg = CATEGORY_CONFIG[cat];
            const Icon = cfg.icon;
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">{cfg.label}</h2>
                    <p className="text-xs text-muted-foreground">{cfg.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/documents/${item.slug}`}
                      className="flex flex-col bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-4">
                        <Download className="h-3.5 w-3.5" /> Free download
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-extrabold text-foreground text-lg mb-2">Need a custom document?</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Our legal partners can draft bespoke lease agreements, commercial contracts, and dispute letters tailored to your specific situation.
          </p>
          <Link
            href="/services/legal"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
          >
            <ScrollText className="h-4 w-4" /> Get legal help
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
