import Link from "next/link";
import { Megaphone, LayoutPanelLeft, Grid3x3, Star, MonitorPlay, ArrowRight } from "lucide-react";

const placements = [
  {
    icon: <MonitorPlay className="h-6 w-6 text-primary" />,
    bg: "bg-primary/10",
    color: "text-primary",
    label: "Homepage Banner",
    desc: "Prime hero placement seen by every visitor the moment they land on Rentnet.",
    from: "3,500",
    tag: "Highest reach",
  },
  {
    icon: <Grid3x3 className="h-6 w-6 text-sky-500" />,
    bg: "bg-sky-500/10",
    color: "text-sky-500",
    label: "In-feed Card",
    desc: "Native full-width sponsored card injected inside the active listings grid.",
    from: "2,000",
    tag: "Best conversion",
  },
  {
    icon: <LayoutPanelLeft className="h-6 w-6 text-violet-500" />,
    bg: "bg-violet-500/10",
    color: "text-violet-500",
    label: "Sidebar Banner",
    desc: "Sticky banner on every property detail page — persistent session-long visibility.",
    from: "1,500",
    tag: "Persistent",
  },
  {
    icon: <Star className="h-6 w-6 text-amber-500" />,
    bg: "bg-amber-500/10",
    color: "text-amber-500",
    label: "Featured Partner",
    desc: "Top spotlight on partner and services pages — ideal for agencies and banks.",
    from: "1,000",
    tag: "Agencies",
  },
];

export function AdvertiseCta() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Megaphone className="h-3.5 w-3.5" /> Advertise with us
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-3">
                Reach thousands of<br className="hidden sm:block" /> Kenyan property seekers
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Place your brand directly where buyers, renters and investors are actively searching. Four high-visibility placements, flexible durations, starting from KES 1,000.
              </p>
            </div>
            <Link
              href="/advertise"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-primary/25 self-start sm:self-auto"
            >
              View ad packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 4-column card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {placements.map((p) => (
              <div
                key={p.label}
                className="group flex flex-col gap-4 bg-background border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Icon + tag */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${p.bg}`}>
                    {p.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>
                    {p.tag}
                  </span>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1 flex-1">
                  <p className="font-bold text-foreground text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Starting from</p>
                  <p className={`font-extrabold text-lg ${p.color}`}>KES {p.from}<span className="text-xs font-medium text-muted-foreground">/week</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
