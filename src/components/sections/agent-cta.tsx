"use client";

import Link from "next/link";
import { ArrowRight, Building2, UserCheck, CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const agencyPerks = [
  "List properties for your entire team",
  "Verified agency badge — builds client trust",
  "Dedicated agency profile page",
];

const agentPerks = [
  "Free personal agent profile",
  "Verified Rentnet Agent badge",
  "Enquiries delivered to your inbox",
];

export function AgentCta() {
  return (
    <section className="py-20 px-6 bg-zinc-900 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <FadeIn className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            For professionals
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Grow your real estate business on Rentnet
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
            Kenya&apos;s fastest-growing property portal. Join hundreds of agents and agencies already generating leads here.
          </p>
        </FadeIn>

        {/* Two panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          {/* Agency panel */}
          <FadeIn direction="right" delay={0.05}>
            <div className="group relative flex flex-col h-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-primary/40 rounded-2xl p-6 overflow-hidden transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.52_0.27_293/0.06)_1px,transparent_1px)] bg-[length:16px_16px]" />
              </div>

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1">Real Estate Agency</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  Register your company, manage your team&apos;s listings and get discovered by thousands of buyers and renters.
                </p>

                <ul className="flex flex-col gap-2 mb-6">
                  {agencyPerks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup?type=agencija"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-primary/25"
                >
                  Register your agency <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Agent panel */}
          <FadeIn direction="left" delay={0.1}>
            <div className="group relative flex flex-col h-full bg-white/5 hover:bg-white/8 border border-white/10 hover:border-primary/40 rounded-2xl p-6 overflow-hidden transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.52_0.27_293/0.06)_1px,transparent_1px)] bg-[length:16px_16px]" />
              </div>

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1">Individual Agent</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  Join the Rentnet Agents program. Build your profile, showcase your listings and earn the verified badge trusted by Kenyan buyers.
                </p>

                <ul className="flex flex-col gap-2 mb-6">
                  {agentPerks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/partners/rentnet-agents"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-primary/50 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Become a Rentnet Agent <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Trust bar */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/35 tracking-wide uppercase">
            <span>Free to join</span>
            <span className="hidden sm:block text-white/15">·</span>
            <span>Verified within 24 hours</span>
            <span className="hidden sm:block text-white/15">·</span>
            <span>Kenya-wide coverage</span>
            <span className="hidden sm:block text-white/15">·</span>
            <span>No commissions taken</span>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
