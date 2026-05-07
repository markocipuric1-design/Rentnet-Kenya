"use client";

import { ShieldCheck, Banknote, Users, MapPin } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const reasons = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    title: "Verified listings",
    desc: "Every listing is reviewed before it goes live — no ghost properties, no duplicates.",
    tag: "Trusted",
  },
  {
    icon: <Banknote className="h-5 w-5 text-primary" />,
    title: "Free to browse",
    desc: "Search, save and compare properties at zero cost. No account required.",
    tag: "No fees",
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "Direct contact",
    desc: "Reach landlords and agents directly — no broker in the middle adding commissions.",
    tag: "No middlemen",
  },
  {
    icon: <MapPin className="h-5 w-5 text-primary" />,
    title: "All 47 counties",
    desc: "From Nairobi CBD to the Coast and Western Kenya — the widest property coverage in the country.",
    tag: "Kenya-wide",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-foreground">Trusted by thousands across Kenya</h2>
          <p className="text-muted-foreground text-sm mt-1">Verified listings, zero fees, direct contact with owners — covering all 47 counties</p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08} direction="up">
              <div className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden h-full">
                {/* Dot pattern on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:16px_16px]" />
                </div>

                {/* Icon */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                    {r.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="relative flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold text-foreground text-[15px] tracking-tight group-hover:text-primary transition-colors duration-300">
                    {r.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>

                {/* Footer tag */}
                <div className="relative pt-1 border-t border-border">
                  <span className="text-xs font-semibold text-primary">{r.tag}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
