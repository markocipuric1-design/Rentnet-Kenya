"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  {
    icon: "🏢",
    name: "Apartments",
    description: "Studios, one-bedroom and multi-room apartments in all major cities.",
    tag: "Most listings",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "hover:border-primary/50",
    glow: "from-primary/10 via-primary/5 to-transparent",
    shadow: "hover:shadow-primary/10",
  },
  {
    icon: "🏠",
    name: "Houses",
    description: "Detached homes, townhouses and semi-detached properties across Kenya.",
    tag: "Popular",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "hover:border-sky-500/50",
    glow: "from-sky-500/10 via-sky-500/5 to-transparent",
    shadow: "hover:shadow-sky-500/10",
  },
  {
    icon: "🌱",
    name: "Land",
    description: "Residential, agricultural and commercial plots at competitive prices.",
    tag: "Investment",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/50",
    glow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    shadow: "hover:shadow-emerald-500/10",
  },
  {
    icon: "🏗️",
    name: "Commercial",
    description: "Offices, retail spaces and industrial units for your business.",
    tag: "Business",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "hover:border-amber-500/50",
    glow: "from-amber-500/10 via-amber-500/5 to-transparent",
    shadow: "hover:shadow-amber-500/10",
  },
  {
    icon: "🏭",
    name: "Industrial",
    description: "Warehouses, factories and industrial facilities for manufacturing and logistics.",
    tag: "Industrial",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/50",
    glow: "from-violet-500/10 via-violet-500/5 to-transparent",
    shadow: "hover:shadow-violet-500/10",
  },
  {
    icon: "🚜",
    name: "Farms & Agriculture",
    description: "Farmland, ranches and agricultural properties for cultivation and livestock.",
    tag: "Agriculture",
    color: "text-lime-600",
    bg: "bg-lime-500/10",
    border: "hover:border-lime-500/50",
    glow: "from-lime-500/10 via-lime-500/5 to-transparent",
    shadow: "hover:shadow-lime-500/10",
  },
  {
    icon: "🏖️",
    name: "Holiday Homes",
    description: "Beach cottages, lakeside retreats and vacation properties across Kenya.",
    tag: "Leisure",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "hover:border-cyan-500/50",
    glow: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    shadow: "hover:shadow-cyan-500/10",
  },
  {
    icon: "🚗",
    name: "Garages & Parking",
    description: "Secure garages and enclosed parking for safe vehicle storage.",
    tag: "Secure",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "hover:border-rose-500/50",
    glow: "from-rose-500/10 via-rose-500/5 to-transparent",
    shadow: "hover:shadow-rose-500/10",
  },
  {
    icon: "🏗",
    name: "New Developments",
    description: "Off-plan and newly built properties from top developers across Kenya.",
    tag: "New",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "hover:border-orange-500/50",
    glow: "from-orange-500/10 via-orange-500/5 to-transparent",
    shadow: "hover:shadow-orange-500/10",
  },
  {
    icon: "✨",
    name: "Other / Special",
    description: "Unique and specialised properties that don't fit a standard category.",
    tag: "Unique",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "hover:border-slate-500/50",
    glow: "from-slate-500/10 via-slate-500/5 to-transparent",
    shadow: "hover:shadow-slate-500/10",
  },
];

export function Categories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all(
      CATEGORIES.map(async (cat) => {
        const { count } = await supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("category", cat.name)
          .eq("status", "active");
        return [cat.name, count ?? 0] as [string, number];
      })
    ).then((entries) => setCounts(Object.fromEntries(entries)));
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-20 px-6 bg-primary/5 dark:bg-primary/10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <FadeIn className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Browse by category</h2>
            <p className="text-muted-foreground text-sm mt-1">Select a property type</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/listings" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
              All categories →
            </Link>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)]"
              >
                <Link
                  href={`/listings?category=${encodeURIComponent(cat.name)}`}
                  className={`group relative flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card ${cat.border} hover:shadow-lg ${cat.shadow} hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${cat.glow}`} />

                  {/* Icon + badge */}
                  <div className="relative flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="relative flex flex-col gap-1 flex-1">
                    <h3 className={`font-semibold text-foreground text-[15px] tracking-tight group-hover:${cat.color} transition-colors duration-300`}>
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="relative flex items-center justify-between pt-1 border-t border-border">
                    <span className={`text-xs font-semibold ${cat.color}`}>
                      {counts[cat.name] != null
                        ? `${counts[cat.name].toLocaleString()} listings`
                        : "— listings"}
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 text-muted-foreground group-hover:${cat.color} group-hover:translate-x-0.5 transition-all duration-300`} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mt-6">
          {CATEGORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "bg-primary w-6" : "bg-border w-1.5"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
