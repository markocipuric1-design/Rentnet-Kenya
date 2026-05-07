"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FAQ } from "@/lib/document-faqs";

function FaqCard({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
        open ? "border-primary/40 shadow-md shadow-primary/5" : "border-border hover:border-primary/20"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-extrabold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-foreground leading-snug">{faq.q}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-9 border-l-2 border-primary/20 pl-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FaqSection({ faqs, title }: { faqs: FAQ[]; title: string }) {
  return (
    <section className="mt-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground">Common questions about {title.toLowerCase()}</p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {faqs.map((faq, i) => (
          <FaqCard key={i} faq={faq} index={i} />
        ))}
      </div>
    </section>
  );
}
